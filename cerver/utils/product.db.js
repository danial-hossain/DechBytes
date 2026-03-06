import { sql, connectMssqlDB } from '../config/db.js';

export async function findProductsByCategoryId(categoryId) {
    const pool = await connectMssqlDB();
    const result = await pool.request()
        .input('categoryId', sql.Int, categoryId)
        .query('SELECT * FROM Products WHERE categoryId = @categoryId');
    
    // Normalize availability to number
    return result.recordset.map(product => ({
        ...product,
        availability: product.availability === true || product.availability === 1 ? 1 : 0
    }));
}

export async function findProductByIdAndCategoryId(productId, categoryId) {
    const pool = await connectMssqlDB();
    const result = await pool.request()
        .input('id', sql.Int, productId)
        .input('categoryId', sql.Int, categoryId)
        .query('SELECT * FROM Products WHERE id = @id AND categoryId = @categoryId');
    
    if (result.recordset[0]) {
        // Normalize availability to number
        result.recordset[0].availability = 
            result.recordset[0].availability === true || result.recordset[0].availability === 1 ? 1 : 0;
    }
    return result.recordset[0];
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
        ...productData,
        availability: 1 // New products are available by default
    };
}

export async function countProducts() {
    const pool = await connectMssqlDB();
    const result = await pool.request()
        .query('SELECT COUNT(*) AS count FROM Products');
    return result.recordset[0].count;
}

// ✅ FIXED: searchProducts with normalized availability
export async function searchProducts(query) {
    const pool = await connectMssqlDB();
    const result = await pool.request()
        .input('query', sql.NVarChar(255), `%${query}%`)
        .query(`
            SELECT P.id, P.name, P.price, P.photo, P.details, P.availability, C.name AS categoryName
            FROM Products P
            JOIN Categories C ON P.categoryId = C.id
            WHERE P.name LIKE @query COLLATE Latin1_General_CI_AI
            ORDER BY P.id
        `);
    
    // Normalize availability to number (0 or 1)
    return result.recordset.map(product => ({
        ...product,
        availability: product.availability === true || product.availability === 1 ? 1 : 0
    }));
}

// Get product by ID only with normalized availability
export async function getProductById(id) {
    const pool = await connectMssqlDB();
    const result = await pool.request()
        .input('id', sql.Int, id)
        .query(`
            SELECT p.id, p.name, p.price, p.photo, p.details, p.availability,
                   c.id as categoryId, c.name as categoryName
            FROM Products p
            LEFT JOIN Categories c ON p.categoryId = c.id
            WHERE p.id = @id
        `);
    
    if (result.recordset[0]) {
        // ✅ Force convert availability to number (0 or 1)
        result.recordset[0].availability = 
            result.recordset[0].availability === true || result.recordset[0].availability === 1 ? 1 : 0;
    }
    return result.recordset[0];
}

// Update product availability
export async function updateProductAvailability(id, availability) {
    try {
        const pool = await connectMssqlDB();
        
        // Convert input to proper bit value
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

// Delete product with cascading deletes
export async function deleteProductById(id) {
    const pool = await connectMssqlDB();
    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();
        const request = new sql.Request(transaction);

        // First delete related order items
        await request
            .input('product_id', sql.Int, id)
            .query('DELETE FROM OrderItems WHERE product_id = @product_id');

        // Then delete cart products
        await request
            .input('productId', sql.Int, id)
            .query('DELETE FROM CartProducts WHERE productId = @productId');

        // Finally delete the product
        const result = await request
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