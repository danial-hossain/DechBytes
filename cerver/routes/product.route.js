import { Router } from "express";
import { findCategoryByName } from "../utils/category.db.js";
import { 
    findProductByIdAndCategoryId, 
    searchProducts, 
    getProductById,
    updateProductAvailability,
    deleteProductById
} from "../utils/product.db.js";
import { findUserById } from "../utils/user.db.js";
import auth from "../middlewares/auth.js";

const router = Router();

// ✅ GET all products (public)
router.get("/", async (req, res) => {
  try {
    const products = await searchProducts('');
    
    // ✅ Normalize availability to number (0 or 1)
    const normalizedProducts = products.map(product => ({
      ...product,
      availability: product.availability === true || product.availability === 1 ? 1 : 0
    }));
    
    res.json({ success: true, products: normalizedProducts });
  } catch (err) {
    console.error("Fetch all products error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ GET product by ID only (public)
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    if (isNaN(id)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid product ID" 
      });
    }

    const product = await getProductById(parseInt(id));
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found" 
      });
    }
    
    // ✅ Force convert availability to number (0 or 1)
    product.availability = product.availability === true || product.availability === 1 ? 1 : 0;
    
    res.json({ success: true, data: product });
  } catch (err) {
    console.error("Fetch product by ID error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ UPDATE product availability (Admin only)
router.put("/:id/availability", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { availability } = req.body;
    const userId = req.userId;

    console.log(`Updating product ${id} availability to ${availability} by user ${userId}`);

    // Check if user is admin
    const user = await findUserById(userId);
    if (!user || user.role !== "ADMIN") {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied. Admin only." 
      });
    }

    if (isNaN(id)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid product ID" 
      });
    }

    if (availability === undefined || availability === null) {
      return res.status(400).json({ 
        success: false, 
        message: "Availability value is required" 
      });
    }

    const result = await updateProductAvailability(parseInt(id), availability);
    
    if (result) {
      res.json({ 
        success: true, 
        message: "Product availability updated successfully" 
      });
    } else {
      res.status(404).json({ 
        success: false, 
        message: "Product not found" 
      });
    }
  } catch (err) {
    console.error("Update availability error:", err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// ✅ DELETE product (Admin only)
router.delete("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    console.log(`Deleting product ${id} by user ${userId}`);

    // Check if user is admin
    const user = await findUserById(userId);
    if (!user || user.role !== "ADMIN") {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied. Admin only." 
      });
    }

    if (isNaN(id)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid product ID" 
      });
    }

    const result = await deleteProductById(parseInt(id));
    
    if (result) {
      res.json({ 
        success: true, 
        message: "Product deleted successfully" 
      });
    } else {
      res.status(404).json({ 
        success: false, 
        message: "Product not found" 
      });
    }
  } catch (err) {
    console.error("Delete product error:", err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// ✅ GET product by category slug and product ID (public)
router.get("/:categorySlug/:productId", async (req, res) => {
  const { categorySlug, productId } = req.params;

  try {
    const category = await findCategoryByName(categorySlug);

    if (!category)
      return res.status(404).json({ 
        success: false, 
        message: "Unknown product category!" 
      });

    const product = await findProductByIdAndCategoryId(productId, category.id);

    if (!product) 
      return res.status(404).json({ 
        success: false, 
        message: "Product not found!" 
      });

    // ✅ Normalize availability
    product.availability = product.availability === true || product.availability === 1 ? 1 : 0;

    res.json({ success: true, product });
  } catch (err) {
    console.error("Product fetch error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;