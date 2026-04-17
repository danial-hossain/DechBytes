import { Router } from "express";
import { sql, connectMssqlDB } from "../config/db.js";
import auth from "../middlewares/auth.js";
import { findUserById } from "../utils/user.db.js";
import { updateProductAvailability, deleteProductById } from "../utils/product.db.js";

const router = Router();

/* =========================
   GET ALL PRODUCTS (WITH DISCOUNT)
========================= */
router.get("/", async (req, res) => {
  try {
    const pool = await connectMssqlDB();

    const result = await pool.request().query(`
      SELECT 
        p.id,
        p.name,
        p.price as original_price,
        p.photo,
        p.details,
        p.categoryId,
        p.availability,
        c.name as categoryName,
        ISNULL(d.discount_percent, 0) as discount_percent,
        CASE 
          WHEN d.id IS NOT NULL 
            AND d.is_active = 1 
            AND (d.end_date IS NULL OR d.end_date > GETDATE())
          THEN 1 ELSE 0
        END as has_discount
      FROM Products p
      LEFT JOIN Categories c ON p.categoryId = c.id
      LEFT JOIN Discounts d ON p.id = d.productId AND d.is_active = 1
      ORDER BY p.created_at DESC
    `);

    const products = result.recordset.map(p => {
      const original = parseFloat(p.original_price);
      const discount = parseFloat(p.discount_percent || 0);
      const hasDiscount = p.has_discount === 1;

      const finalPrice = hasDiscount
        ? original - (original * discount / 100)
        : original;

      return {
        id: p.id,
        name: p.name,
        original_price: original,
        price: parseFloat(finalPrice.toFixed(2)),
        photo: p.photo,
        details: p.details,
        categoryId: p.categoryId,
        categoryName: p.categoryName,
        availability: p.availability ? 1 : 0,
        has_discount: hasDiscount,
        discount_percent: discount
      };
    });

    res.json({ success: true, products });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/* =========================
   GET PRODUCT BY ID
========================= */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const pool = await connectMssqlDB();

    const result = await pool.request()
      .input("id", sql.Int, id)
      .query(`
        SELECT 
          p.id,
          p.name,
          p.price as original_price,
          p.photo,
          p.details,
          p.categoryId,
          p.availability,
          c.name as categoryName,
          ISNULL(d.discount_percent, 0) as discount_percent,
          CASE 
            WHEN d.id IS NOT NULL 
              AND d.is_active = 1 
              AND (d.end_date IS NULL OR d.end_date > GETDATE())
            THEN 1 ELSE 0
          END as has_discount
        FROM Products p
        LEFT JOIN Categories c ON p.categoryId = c.id
        LEFT JOIN Discounts d ON p.id = d.productId AND d.is_active = 1
        WHERE p.id = @id
      `);

    if (!result.recordset.length) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const p = result.recordset[0];

    const original = parseFloat(p.original_price);
    const discount = parseFloat(p.discount_percent || 0);
    const hasDiscount = p.has_discount === 1;

    const finalPrice = hasDiscount
      ? original - (original * discount / 100)
      : original;

    res.json({
      success: true,
      data: {
        id: p.id,
        name: p.name,
        photo: p.photo,
        details: p.details,
        categoryId: p.categoryId,
        categoryName: p.categoryName,
        availability: p.availability ? 1 : 0,
        original_price: original,
        price: parseFloat(finalPrice.toFixed(2)),
        has_discount: hasDiscount,
        discount_percent: discount
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/* =========================
   ✅ UPDATE PRODUCT AVAILABILITY (NEW ROUTE)
========================= */
router.put("/:id/availability", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { availability } = req.body;

    // Check if user is admin
    const user = await findUserById(req.userId);
    if (!user || user.role !== "ADMIN") {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied. Admin only." 
      });
    }

    if (availability === undefined) {
      return res.status(400).json({
        success: false,
        message: "Availability value is required"
      });
    }

    // Update product availability
    const updated = await updateProductAvailability(id, availability);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.json({ 
      success: true, 
      message: "Product availability updated successfully" 
    });
  } catch (err) {
    console.error("Error updating product availability:", err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

/* =========================
   DELETE PRODUCT
========================= */
router.delete("/:id", auth, async (req, res) => {
  try {
    const user = await findUserById(req.userId);
    if (!user || user.role !== "ADMIN") {
      return res.status(403).json({ success: false, message: "Admin only" });
    }

    await deleteProductById(req.params.id);

    res.json({ success: true, message: "Product deleted" });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;