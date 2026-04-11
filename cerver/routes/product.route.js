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
import { sql, connectMssqlDB } from "../config/db.js";
import { getProductDiscount } from "../utils/discount.db.js";

const router = Router();

// ✅ GET all products with discount (public)
router.get("/", async (req, res) => {
  try {
    const pool = await connectMssqlDB();
    
    // প্রোডাক্ট ডিসকাউন্ট সহ JOIN করে আনুন
    const result = await pool.request()
      .query(`
        SELECT 
          p.id,
          p.name,
          p.price as original_price,
          p.photo,
          p.details,
          p.categoryId,
          p.availability,
          p.created_at,
          c.name as categoryName,
          d.id as discount_id,
          d.discount_percent,
          d.end_date,
          CASE 
            WHEN d.id IS NOT NULL AND (d.end_date IS NULL OR d.end_date > GETDATE()) 
            THEN ROUND(p.price - (p.price * d.discount_percent / 100), 2)
            ELSE p.price
          END as discounted_price,
          CASE 
            WHEN d.id IS NOT NULL AND (d.end_date IS NULL OR d.end_date > GETDATE()) 
            THEN 1
            ELSE 0
          END as has_discount
        FROM Products p
        LEFT JOIN Categories c ON p.categoryId = c.id
        LEFT JOIN Discounts d ON p.id = d.productId AND d.is_active = 1
        ORDER BY p.created_at DESC
      `);
    
    const products = result.recordset.map(product => ({
      id: product.id,
      name: product.name,
      original_price: parseFloat(product.original_price),
      price: product.has_discount ? parseFloat(product.discounted_price) : parseFloat(product.original_price),
      photo: product.photo,
      details: product.details,
      categoryId: product.categoryId,
      categoryName: product.categoryName,
      availability: product.availability === true || product.availability === 1 ? 1 : 0,
      has_discount: product.has_discount === 1,
      discount_percent: product.discount_percent,
      discount_end_date: product.end_date,
      created_at: product.created_at
    }));
    
    res.json({ success: true, products });
  } catch (err) {
    console.error("Fetch all products error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ GET product by ID with discount (public)
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    if (isNaN(id)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid product ID" 
      });
    }

    const pool = await connectMssqlDB();
    
    // প্রোডাক্ট ডিসকাউন্ট সহ JOIN করে আনুন
    const result = await pool.request()
      .input('id', sql.Int, parseInt(id))
      .query(`
        SELECT 
          p.id,
          p.name,
          p.price as original_price,
          p.photo,
          p.details,
          p.categoryId,
          p.availability,
          p.created_at,
          c.name as categoryName,
          d.id as discount_id,
          d.discount_percent,
          d.end_date,
          CASE 
            WHEN d.id IS NOT NULL AND (d.end_date IS NULL OR d.end_date > GETDATE()) 
            THEN ROUND(p.price - (p.price * d.discount_percent / 100), 2)
            ELSE p.price
          END as discounted_price,
          CASE 
            WHEN d.id IS NOT NULL AND (d.end_date IS NULL OR d.end_date > GETDATE()) 
            THEN 1
            ELSE 0
          END as has_discount
        FROM Products p
        LEFT JOIN Categories c ON p.categoryId = c.id
        LEFT JOIN Discounts d ON p.id = d.productId AND d.is_active = 1
        WHERE p.id = @id
      `);
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found" 
      });
    }
    
    const product = result.recordset[0];
    
    const formattedProduct = {
      id: product.id,
      name: product.name,
      original_price: parseFloat(product.original_price),
      price: product.has_discount ? parseFloat(product.discounted_price) : parseFloat(product.original_price),
      photo: product.photo,
      details: product.details,
      categoryId: product.categoryId,
      categoryName: product.categoryName,
      availability: product.availability === true || product.availability === 1 ? 1 : 0,
      has_discount: product.has_discount === 1,
      discount_percent: product.discount_percent,
      discount_end_date: product.end_date,
      created_at: product.created_at
    };
    
    res.json({ success: true, data: formattedProduct });
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

// ✅ GET product by category slug and product ID with discount (public)
router.get("/:categorySlug/:productId", async (req, res) => {
  const { categorySlug, productId } = req.params;

  try {
    const category = await findCategoryByName(categorySlug);

    if (!category)
      return res.status(404).json({ 
        success: false, 
        message: "Unknown product category!" 
      });

    const pool = await connectMssqlDB();
    
    const result = await pool.request()
      .input('productId', sql.Int, parseInt(productId))
      .input('categoryId', sql.Int, category.id)
      .query(`
        SELECT 
          p.id,
          p.name,
          p.price as original_price,
          p.photo,
          p.details,
          p.categoryId,
          p.availability,
          p.created_at,
          c.name as categoryName,
          d.id as discount_id,
          d.discount_percent,
          d.end_date,
          CASE 
            WHEN d.id IS NOT NULL AND (d.end_date IS NULL OR d.end_date > GETDATE()) 
            THEN ROUND(p.price - (p.price * d.discount_percent / 100), 2)
            ELSE p.price
          END as discounted_price,
          CASE 
            WHEN d.id IS NOT NULL AND (d.end_date IS NULL OR d.end_date > GETDATE()) 
            THEN 1
            ELSE 0
          END as has_discount
        FROM Products p
        LEFT JOIN Categories c ON p.categoryId = c.id
        LEFT JOIN Discounts d ON p.id = d.productId AND d.is_active = 1
        WHERE p.id = @productId AND p.categoryId = @categoryId
      `);

    if (result.recordset.length === 0) 
      return res.status(404).json({ 
        success: false, 
        message: "Product not found!" 
      });

    const product = result.recordset[0];
    
    const formattedProduct = {
      id: product.id,
      name: product.name,
      original_price: parseFloat(product.original_price),
      price: product.has_discount ? parseFloat(product.discounted_price) : parseFloat(product.original_price),
      photo: product.photo,
      details: product.details,
      categoryId: product.categoryId,
      categoryName: product.categoryName,
      availability: product.availability === true || product.availability === 1 ? 1 : 0,
      has_discount: product.has_discount === 1,
      discount_percent: product.discount_percent,
      discount_end_date: product.end_date,
      created_at: product.created_at
    };

    res.json({ success: true, product: formattedProduct });
  } catch (err) {
    console.error("Product fetch error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ প্রোডাক্টের ডিসকাউন্ট চেক করার জন্য আলাদা API (public)
router.get("/:id/discount", async (req, res) => {
  try {
    const { id } = req.params;
    
    if (isNaN(id)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid product ID" 
      });
    }

    const discount = await getProductDiscount(parseInt(id));
    
    if (discount) {
      res.json({ 
        success: true, 
        hasDiscount: true,
        discount_percent: discount.discount_percent,
        end_date: discount.end_date
      });
    } else {
      res.json({ 
        success: true, 
        hasDiscount: false 
      });
    }
  } catch (err) {
    console.error("Check discount error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;