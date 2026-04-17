// backend/routes/home.route.js
import { Router } from "express";
import { connectMssqlDB } from "../config/db.js";

const homeRouter = Router();

// ✅ GET FEATURED PRODUCTS - শুধু ডিসকাউন্টেড প্রোডাক্ট
homeRouter.get("/", async (req, res) => {
  try {
    const pool = await connectMssqlDB();
    
    const result = await pool.request()
      .query(`
        SELECT 
          p.id,
          p.name,
          p.price as original_price,
          p.photo,
          p.details,
          c.name as categoryName,
          d.discount_percent,
          d.end_date as discount_end_date,
          ROUND(p.price - (p.price * d.discount_percent / 100), 2) as discounted_price,
          1 as has_discount
        FROM Products p
        LEFT JOIN Categories c ON p.categoryId = c.id
        INNER JOIN Discounts d ON p.id = d.productId
        WHERE p.availability = 1
          AND d.is_active = 1
          AND (d.end_date IS NULL OR d.end_date > GETDATE())
        ORDER BY d.discount_percent DESC, p.created_at DESC
        OFFSET 0 ROWS FETCH NEXT 12 ROWS ONLY
      `);
    
    const products = result.recordset.map(product => ({
      id: product.id,
      name: product.name,
      original_price: parseFloat(product.original_price),
      price: parseFloat(product.discounted_price),
      photo: product.photo,
      details: product.details,
      categoryName: product.categoryName,
      has_discount: true,
      discount_percent: product.discount_percent,
      discount_end_date: product.discount_end_date
    }));

    res.json(products);
  } catch (err) {
    console.error("Home route fetch error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ GET BANNERS
homeRouter.get("/banners", async (req, res) => {
  try {
    const pool = await connectMssqlDB();
    const result = await pool.request()
      .query('SELECT * FROM Banners WHERE is_active = 1 ORDER BY display_order ASC, id DESC');
    res.json(result.recordset);
  } catch (err) {
    console.error("Banners fetch error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default homeRouter;