import { sql, connectMssqlDB } from '../config/db.js';

// ============================================
// GET CART WITH PRODUCT DETAILS (JOIN with Products)
// ============================================
export async function getCartWithProductDetails(userId) {
    try {
        const pool = await connectMssqlDB();
        const result = await pool.request()
            .input('userId', sql.Int, userId)
            .query(`
                SELECT 
                    cp.id AS cart_id,
                    cp.productId,
                    cp.quantity,
                    cp.userId,
                    cp.created_at,
                    cp.updated_at,
                    p.id AS product_id,
                    p.name AS product_name,
                    p.price AS product_price,
                    p.photo AS product_photo,
                    p.details AS product_details,
                    p.availability AS product_availability,
                    p.categoryId AS product_categoryId
                FROM CartProducts cp
                INNER JOIN Products p ON cp.productId = p.id
                WHERE cp.userId = @userId
                ORDER BY cp.created_at DESC
            `);
        
        return result.recordset;
    } catch (error) {
        console.error("Error in getCartWithProductDetails:", error);
        throw error;
    }
}

// ============================================
// GET SINGLE CART PRODUCT BY ID
// ============================================
export async function getCartProductById(cartProductId) {
    try {
        const pool = await connectMssqlDB();
        const result = await pool.request()
            .input('id', sql.Int, cartProductId)
            .query('SELECT * FROM CartProducts WHERE id = @id');
        return result.recordset[0];
    } catch (error) {
        console.error(`Error in getCartProductById for id ${cartProductId}:`, error);
        throw error;
    }
}

// ============================================
// CHECK IF PRODUCT EXISTS IN CART
// ============================================
export async function getCartItemByUserAndProduct(userId, productId) {
    try {
        const pool = await connectMssqlDB();
        const result = await pool.request()
            .input('userId', sql.Int, userId)
            .input('productId', sql.Int, productId)
            .query('SELECT * FROM CartProducts WHERE userId = @userId AND productId = @productId');
        return result.recordset[0];
    } catch (error) {
        console.error(`Error in getCartItemByUserAndProduct for user ${userId}, product ${productId}:`, error);
        throw error;
    }
}

// ============================================
// ADD PRODUCT TO CART
// ============================================
export async function addCartProduct(cartProductData) {
    try {
        const pool = await connectMssqlDB();
        const result = await pool.request()
            .input('productId', sql.Int, cartProductData.productId)
            .input('quantity', sql.Int, cartProductData.quantity)
            .input('userId', sql.Int, cartProductData.userId)
            .query(`
                INSERT INTO CartProducts (productId, quantity, userId, created_at, updated_at)
                VALUES (@productId, @quantity, @userId, GETDATE(), GETDATE());
                SELECT SCOPE_IDENTITY() AS id;
            `);
        
        return { id: result.recordset[0].id };
    } catch (error) {
        console.error("Error in addCartProduct:", error);
        throw error;
    }
}

// ============================================
// UPDATE CART PRODUCT QUANTITY
// ============================================
export async function updateCartProductQuantity(cartProductId, quantity) {
    try {
        const pool = await connectMssqlDB();
        await pool.request()
            .input('id', sql.Int, cartProductId)
            .input('quantity', sql.Int, quantity)
            .input('updated_at', sql.DateTime2, new Date())
            .query('UPDATE CartProducts SET quantity = @quantity, updated_at = @updated_at WHERE id = @id');
    } catch (error) {
        console.error(`Error in updateCartProductQuantity for id ${cartProductId}:`, error);
        throw error;
    }
}

// ============================================
// DELETE CART PRODUCT BY ID
// ============================================
export async function deleteCartProductById(cartProductId) {
    try {
        const pool = await connectMssqlDB();
        
        const checkResult = await pool.request()
            .input('id', sql.Int, cartProductId)
            .query('SELECT id FROM CartProducts WHERE id = @id');
        
        if (checkResult.recordset.length === 0) {
            console.log(`Cart item with id ${cartProductId} not found`);
            return false;
        }
        
        const result = await pool.request()
            .input('id', sql.Int, cartProductId)
            .query('DELETE FROM CartProducts WHERE id = @id');
        
        console.log(`Deleted cart item ${cartProductId}, rows affected: ${result.rowsAffected[0]}`);
        return result.rowsAffected[0] > 0;
    } catch (error) {
        console.error(`Error deleting cart product ${cartProductId}:`, error);
        throw error;
    }
}

// ============================================
// DELETE ALL CART PRODUCTS FOR A USER
// ============================================
export async function deleteCartProductsByUserId(userId) {
    try {
        const pool = await connectMssqlDB();
        const result = await pool.request()
            .input('userId', sql.Int, userId)
            .query('DELETE FROM CartProducts WHERE userId = @userId');
        return result.rowsAffected[0];
    } catch (error) {
        console.error(`Error deleting cart for user ${userId}:`, error);
        throw error;
    }
}

// ============================================
// GET CART PRODUCTS BY USER ID (BASIC)
// ============================================
export async function getCartProductsByUserId(userId) {
    try {
        const pool = await connectMssqlDB();
        const result = await pool.request()
            .input('userId', sql.Int, userId)
            .query('SELECT * FROM CartProducts WHERE userId = @userId');
        return result.recordset;
    } catch (error) {
        console.error(`Error in getCartProductsByUserId for user ${userId}:`, error);
        throw error;
    }
}