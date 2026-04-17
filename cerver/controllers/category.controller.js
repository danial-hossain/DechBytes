// backend/controllers/category.controller.js
import { sql, connectMssqlDB } from '../config/db.js';
import { findProductsByCategoryId, getProductById } from '../utils/product.db.js';

// ==================== CATEGORY FUNCTIONS ====================

export async function getAllCategories(req, res) {
  try {
    const pool = await connectMssqlDB();
    const result = await pool.request()
      .query('SELECT id, name FROM Categories ORDER BY name');
    
    res.json({ 
      success: true, 
      data: result.recordset 
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
}

export async function getCategoryById(req, res) {
  try {
    const { id } = req.params;
    const pool = await connectMssqlDB();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT id, name FROM Categories WHERE id = @id');
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Category not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: result.recordset[0] 
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
}

// ==================== PRODUCT FUNCTIONS WITH DISCOUNT ====================

// Get products by category name (with discount info)
export const getProductsByCategory = async (req, res) => {
    try {
        const { categoryName } = req.params;
        const pool = await connectMssqlDB();
        
        // First get category ID
        const categoryResult = await pool.request()
            .input('name', sql.NVarChar(100), categoryName)
            .query('SELECT id FROM Categories WHERE name = @name');
        
        if (categoryResult.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }
        
        const categoryId = categoryResult.recordset[0].id;
        
        // Get products with discount info from your existing function
        const products = await findProductsByCategoryId(categoryId);
        
        console.log(`Found ${products.length} products in ${categoryName}`);
        
        // Log discounted products for debugging
        const discountedProducts = products.filter(p => p.has_discount === true);
        if (discountedProducts.length > 0) {
            console.log("Products with discount:");
            discountedProducts.forEach(p => {
                console.log(`  - ${p.name}: ${p.discount_percent}% OFF → $${p.price} (was $${p.original_price})`);
            });
        } else {
            console.log("No products with discount found in this category");
        }
        
        res.status(200).json({
            success: true,
            products: products,
            category: categoryName
        });
        
    } catch (error) {
        console.error("Error in getProductsByCategory:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch products",
            error: error.message
        });
    }
};

// Get single product by ID (with discount info)
export const getProductDetail = async (req, res) => {
    try {
        const { id } = req.params;
        
        const product = await getProductById(id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        res.status(200).json({
            success: true,
            product: product
        });
        
    } catch (error) {
        console.error("Error in getProductDetail:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch product",
            error: error.message
        });
    }
};