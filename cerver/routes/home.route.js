import { Router } from "express";
import { findCategoryByName } from "../utils/category.db.js";
import { findProductsByCategoryId } from "../utils/product.db.js";
import { connectMssqlDB } from "../config/db.js"; // ✅ যোগ করো

const homeRouter = Router();

// GET featured products
homeRouter.get("/", async (req, res) => {
  try {
    const featuredCategory = await findCategoryByName('Laptops');
    if (!featuredCategory) {
      return res.status(404).json({ message: "Featured category not found!" });
    }
    const products = await findProductsByCategoryId(featuredCategory.id);
    res.json(products);
  } catch (err) {
    console.error("Home route fetch error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ GET advertisements
// ✅ GET banners
homeRouter.get("/banners", async (req, res) => {
  try {
    const pool = await connectMssqlDB();
    const result = await pool.request()
      .query('SELECT * FROM Banners WHERE is_active = 1 ORDER BY id');
    res.json(result.recordset);
  } catch (err) {
    console.error("Banners fetch error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default homeRouter;