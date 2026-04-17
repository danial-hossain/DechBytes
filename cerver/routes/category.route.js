// backend/routes/category.routes.js
import express from 'express';
import { 
    getAllCategories, 
    getCategoryById, 
    getProductsByCategory,
    getProductDetail 
} from '../controllers/category.controller.js';

const router = express.Router();

// Category routes
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);

// Product routes by category
router.get('/:categoryName/products', getProductsByCategory);

// Single product detail
router.get('/product/:id', getProductDetail);

export default router;