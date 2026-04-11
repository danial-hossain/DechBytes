// cerver/routes/categories.route.js
import express from 'express';
import { getAllCategories, getCategoryById } from '../controllers/category.controller.js';
import { findCategoryByName } from '../utils/category.db.js';
import { sql, connectMssqlDB } from '../config/db.js';

const router = express.Router();

router.get('/', getAllCategories);

router.get('/:categoryName/products', async (req, res) => {
  try {
    const { categoryName } = req.params;
    
    const category = await findCategoryByName(categoryName);
    
    if (!category) {
      return res.status(404).json({ 
        success: false, 
        message: "Category not found" 
      });
    }
    
    const pool = await connectMssqlDB();
    
    const result = await pool.request()
      .input('categoryId', sql.Int, category.id)
      .query(`
        SELECT 
          p.id,
          p.name,
          p.price as original_price,
          p.photo,
          p.details,
          p.availability,
          p.created_at,
          c.id as categoryId,
          c.name as categoryName,
          ISNULL(d.discount_percent, 0) as discount_percent,
          CASE 
            WHEN d.id IS NOT NULL AND (d.end_date IS NULL OR d.end_date > GETDATE()) 
            THEN 1
            ELSE 0
          END as has_discount
        FROM Products p
        INNER JOIN Categories c ON p.categoryId = c.id
        LEFT JOIN Discounts d ON p.id = d.productId AND d.is_active = 1
        WHERE p.categoryId = @categoryId
        ORDER BY p.created_at DESC
      `);
    
    const products = result.recordset.map(product => {
      const hasDiscount = product.has_discount === 1;
      const originalPrice = parseFloat(product.original_price);
      const discountPercent = parseFloat(product.discount_percent || 0);
      const finalPrice = hasDiscount ? originalPrice - (originalPrice * discountPercent / 100) : originalPrice;
      
      return {
        id: product.id,
        name: product.name,
        original_price: originalPrice,
        price: parseFloat(finalPrice.toFixed(2)),
        photo: product.photo,
        details: product.details,
        categoryId: product.categoryId,
        categoryName: product.categoryName,
        availability: 1,
        has_discount: hasDiscount,
        discount_percent: discountPercent,
        discount_end_date: product.end_date,
        created_at: product.created_at
      };
    });
    
    res.json({ 
      success: true, 
      products: products,
      category: categoryName
    });
    
  } catch (err) {
    console.error("Fetch products by category error:", err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

router.get('/:categoryName/products/:productId', async (req, res) => {
  try {
    const { categoryName, productId } = req.params;
    
    const category = await findCategoryByName(categoryName);
    
    if (!category) {
      return res.status(404).json({ 
        success: false, 
        message: "Category not found" 
      });
    }
    
    const pool = await connectMssqlDB();
    
    const result = await pool.request()
      .input('categoryId', sql.Int, category.id)
      .input('productId', sql.Int, productId)
      .query(`
        SELECT 
          p.id,
          p.name,
          p.price as original_price,
          p.photo,
          p.details,
          p.availability,
          p.created_at,
          c.id as categoryId,
          c.name as categoryName,
          ISNULL(d.discount_percent, 0) as discount_percent,
          CASE 
            WHEN d.id IS NOT NULL AND (d.end_date IS NULL OR d.end_date > GETDATE()) 
            THEN 1
            ELSE 0
          END as has_discount
        FROM Products p
        INNER JOIN Categories c ON p.categoryId = c.id
        LEFT JOIN Discounts d ON p.id = d.productId AND d.is_active = 1
        WHERE p.categoryId = @categoryId AND p.id = @productId
      `);
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found" 
      });
    }
    
    const product = result.recordset[0];
    const hasDiscount = product.has_discount === 1;
    const originalPrice = parseFloat(product.original_price);
    const discountPercent = parseFloat(product.discount_percent || 0);
    const finalPrice = hasDiscount ? originalPrice - (originalPrice * discountPercent / 100) : originalPrice;
    
    const formattedProduct = {
      id: product.id,
      name: product.name,
      original_price: originalPrice,
      price: parseFloat(finalPrice.toFixed(2)),
      photo: product.photo,
      details: product.details,
      categoryId: product.categoryId,
      categoryName: product.categoryName,
      availability: 1,
      has_discount: hasDiscount,
      discount_percent: discountPercent,
      discount_end_date: product.end_date,
      created_at: product.created_at
    };
    
    res.json({ 
      success: true, 
      product: formattedProduct 
    });
    
  } catch (err) {
    console.error("Fetch single product error:", err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

router.get('/:id', getCategoryById);

export default router;