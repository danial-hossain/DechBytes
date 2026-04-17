// backend/utils/product.db.js
import { sql, connectMssqlDB } from '../config/db.js';

export async function findProductsByCategoryId(categoryId) {
    const pool = await connectMssqlDB();
    const result = await pool.request()
        .input('categoryId', sql.Int, categoryId)
        .query(`
            SELECT 
                p.id,
                p.name,
                p.price,
                p.photo,
                p.details,
                p.availability,
                p.created_at,
                c.name as categoryName,
                d.id as discount_id,
                d.discount_percent,
                d.end_date,
                CASE 
                    WHEN d.id IS NOT NULL AND d.is_active = 1 AND (d.end_date IS NULL OR d.end_date > GETDATE()) 
                    THEN 1
                    ELSE 0
                END as has_discount,
                CASE 
                    WHEN d.id IS NOT NULL AND d.is_active = 1 AND (d.end_date IS NULL OR d.end_date > GETDATE()) 
                    THEN ROUND(p.price - (p.price * d.discount_percent / 100), 2)
                    ELSE p.price
                END as discounted_price
            FROM Products p
            LEFT JOIN Categories c ON p.categoryId = c.id
            LEFT JOIN Discounts d ON p.id = d.productId
            WHERE p.categoryId = @categoryId
        `);
    
    return result.recordset.map(product => ({
        id: product.id,
        name: product.name,
        original_price: parseFloat(product.price),
        price: product.has_discount ? parseFloat(product.discounted_price) : parseFloat(product.price),
        photo: product.photo,
        details: product.details,
        categoryId: product.categoryId,
        categoryName: product.categoryName,
        availability: product.availability === 1 || product.availability === true ? 1 : 0,
        has_discount: product.has_discount === 1,
        discount_percent: product.discount_percent,
        discount_end_date: product.end_date,
        created_at: product.created_at
    }));
}

export async function findProductByIdAndCategoryId(productId, categoryId) {
    const pool = await connectMssqlDB();
    const result = await pool.request()
        .input('id', sql.Int, productId)
        .input('categoryId', sql.Int, categoryId)
        .query(`
            SELECT 
                p.id,
                p.name,
                p.price,
                p.photo,
                p.details,
                p.availability,
                p.created_at,
                c.name as categoryName,
                d.id as discount_id,
                d.discount_percent,
                d.end_date,
                CASE 
                    WHEN d.id IS NOT NULL AND d.is_active = 1 AND (d.end_date IS NULL OR d.end_date > GETDATE()) 
                    THEN 1
                    ELSE 0
                END as has_discount,
                CASE 
                    WHEN d.id IS NOT NULL AND d.is_active = 1 AND (d.end_date IS NULL OR d.end_date > GETDATE()) 
                    THEN ROUND(p.price - (p.price * d.discount_percent / 100), 2)
                    ELSE p.price
                END as discounted_price
            FROM Products p
            LEFT JOIN Categories c ON p.categoryId = c.id
            LEFT JOIN Discounts d ON p.id = d.productId
            WHERE p.id = @id AND p.categoryId = @categoryId
        `);
    
    if (result.recordset.length === 0) return null;
    
    const product = result.recordset[0];
    
    return {
        id: product.id,
        name: product.name,
        original_price: parseFloat(product.price),
        price: product.has_discount ? parseFloat(product.discounted_price) : parseFloat(product.price),
        photo: product.photo,
        details: product.details,
        categoryId: product.categoryId,
        categoryName: product.categoryName,
        availability: product.availability === 1 || product.availability === true ? 1 : 0,
        has_discount: product.has_discount === 1,
        discount_percent: product.discount_percent,
        discount_end_date: product.end_date,
        created_at: product.created_at
    };
}

export async function createProduct(productData) {
    const pool = await connectMssqlDB();
    const result = await pool.request()
        .input('name', sql.NVarChar(255), productData.name)
        .input('price', sql.Decimal(10, 2), productData.price)
        .input('photo', sql.NVarChar(sql.MAX), productData.photo)
        .input('details', sql.NVarChar(sql.MAX), productData.details)
        .input('categoryId', sql.Int, productData.categoryId)
        .query(`
            INSERT INTO Products (name, price, photo, details, categoryId, availability, created_at, updated_at)
            VALUES (@name, @price, @photo, @details, @categoryId, 1, GETDATE(), GETDATE());
            SELECT SCOPE_IDENTITY() AS id;
        `);
    
    return { 
        id: result.recordset[0].id, 
        name: productData.name,
        original_price: parseFloat(productData.price),
        price: parseFloat(productData.price),
        photo: productData.photo,
        details: productData.details,
        categoryId: productData.categoryId,
        availability: 1,
        has_discount: false,
        discount_percent: null
    };
}

export async function countProducts() {
    const pool = await connectMssqlDB();
    const result = await pool.request()
        .query('SELECT COUNT(*) AS count FROM Products');
    return result.recordset[0].count;
}

export async function searchProducts(query) {
    const pool = await connectMssqlDB();
    const result = await pool.request()
        .input('query', sql.NVarChar(255), `%${query}%`)
        .query(`
            SELECT 
                p.id,
                p.name,
                p.price,
                p.photo,
                p.details,
                p.availability,
                p.created_at,
                c.name as categoryName,
                d.id as discount_id,
                d.discount_percent,
                d.end_date,
                CASE 
                    WHEN d.id IS NOT NULL AND d.is_active = 1 AND (d.end_date IS NULL OR d.end_date > GETDATE()) 
                    THEN 1
                    ELSE 0
                END as has_discount,
                CASE 
                    WHEN d.id IS NOT NULL AND d.is_active = 1 AND (d.end_date IS NULL OR d.end_date > GETDATE()) 
                    THEN ROUND(p.price - (p.price * d.discount_percent / 100), 2)
                    ELSE p.price
                END as discounted_price
            FROM Products p
            LEFT JOIN Categories c ON p.categoryId = c.id
            LEFT JOIN Discounts d ON p.id = d.productId
            WHERE p.name LIKE @query COLLATE Latin1_General_CI_AI
            ORDER BY p.id
        `);
    
    return result.recordset.map(product => ({
        id: product.id,
        name: product.name,
        original_price: parseFloat(product.price),
        price: product.has_discount ? parseFloat(product.discounted_price) : parseFloat(product.price),
        photo: product.photo,
        details: product.details,
        categoryId: product.categoryId,
        categoryName: product.categoryName,
        availability: product.availability === 1 || product.availability === true ? 1 : 0,
        has_discount: product.has_discount === 1,
        discount_percent: product.discount_percent,
        discount_end_date: product.end_date,
        created_at: product.created_at
    }));
}

export async function getProductById(id) {
    const pool = await connectMssqlDB();
    const result = await pool.request()
        .input('id', sql.Int, id)
        .query(`
            SELECT 
                p.id,
                p.name,
                p.price,
                p.photo,
                p.details,
                p.availability,
                p.created_at,
                p.updated_at,
                c.id as categoryId,
                c.name as categoryName,
                d.id as discount_id,
                d.discount_percent,
                d.end_date,
                CASE 
                    WHEN d.id IS NOT NULL AND d.is_active = 1 AND (d.end_date IS NULL OR d.end_date > GETDATE()) 
                    THEN 1
                    ELSE 0
                END as has_discount,
                CASE 
                    WHEN d.id IS NOT NULL AND d.is_active = 1 AND (d.end_date IS NULL OR d.end_date > GETDATE()) 
                    THEN ROUND(p.price - (p.price * d.discount_percent / 100), 2)
                    ELSE p.price
                END as discounted_price
            FROM Products p
            LEFT JOIN Categories c ON p.categoryId = c.id
            LEFT JOIN Discounts d ON p.id = d.productId
            WHERE p.id = @id
        `);
    
    if (result.recordset.length === 0) return null;
    
    const product = result.recordset[0];
    
    return {
        id: product.id,
        name: product.name,
        original_price: parseFloat(product.price),
        price: product.has_discount ? parseFloat(product.discounted_price) : parseFloat(product.price),
        photo: product.photo,
        details: product.details,
        categoryId: product.categoryId,
        categoryName: product.categoryName,
        availability: product.availability === 1 || product.availability === true ? 1 : 0,
        has_discount: product.has_discount === 1,
        discount_percent: product.discount_percent,
        discount_end_date: product.end_date,
        created_at: product.created_at,
        updated_at: product.updated_at
    };
}

export async function updateProductAvailability(id, availability) {
    try {
        const pool = await connectMssqlDB();
        const bitValue = availability === true || availability === 1 || availability === '1' ? 1 : 0;
        
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('availability', sql.Bit, bitValue)
            .input('updated_at', sql.DateTime2, new Date())
            .query(`
                UPDATE Products 
                SET availability = @availability, updated_at = @updated_at 
                WHERE id = @id
            `);
        return result.rowsAffected[0] > 0;
    } catch (error) {
        console.error('Error updating product availability:', error);
        throw error;
    }
}

export async function updateProduct(id, productData) {
    try {
        const pool = await connectMssqlDB();
        
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('name', sql.NVarChar(255), productData.name)
            .input('price', sql.Decimal(10, 2), productData.price)
            .input('photo', sql.NVarChar(sql.MAX), productData.photo)
            .input('details', sql.NVarChar(sql.MAX), productData.details)
            .input('categoryId', sql.Int, productData.categoryId)
            .input('updated_at', sql.DateTime2, new Date())
            .query(`
                UPDATE Products 
                SET name = @name,
                    price = @price,
                    photo = @photo,
                    details = @details,
                    categoryId = @categoryId,
                    updated_at = @updated_at
                WHERE id = @id
            `);
        return result.rowsAffected[0] > 0;
    } catch (error) {
        console.error('Error updating product:', error);
        throw error;
    }
}

export async function deleteProductById(id) {
    const pool = await connectMssqlDB();
    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();

        await new sql.Request(transaction)
            .input('product_id', sql.Int, id)
            .query('DELETE FROM OrderItems WHERE product_id = @product_id');

        await new sql.Request(transaction)
            .input('productId', sql.Int, id)
            .query('DELETE FROM CartProducts WHERE productId = @productId');

        await new sql.Request(transaction)
            .input('productId', sql.Int, id)
            .query('DELETE FROM Discounts WHERE productId = @productId');

        const result = await new sql.Request(transaction)
            .input('id', sql.Int, id)
            .query('DELETE FROM Products WHERE id = @id');

        await transaction.commit();
        return result.rowsAffected[0] > 0;
    } catch (error) {
        await transaction.rollback();
        console.error('Error deleting product:', error);
        throw error;
    }
}