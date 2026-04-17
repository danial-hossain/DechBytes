// backend/utils/banner.db.js
import { sql, connectMssqlDB } from "../config/db.js";

// GET ALL BANNERS
export async function getAllBanners() {
    try {
        const pool = await connectMssqlDB();
        const result = await pool.request()
            .query(`
                SELECT 
                    id, 
                    photo_url, 
                    ISNULL(title, '') as title, 
                    ISNULL(link, '/') as link, 
                    ISNULL(is_active, 1) as is_active, 
                    ISNULL(display_order, id) as display_order, 
                    created_at
                FROM Banners
                WHERE ISNULL(is_active, 1) = 1
                ORDER BY display_order ASC, id DESC
            `);
        return result.recordset;
    } catch (error) {
        console.error("Error in getAllBanners:", error);
        throw error;
    }
}

// CREATE BANNER
export async function createBanner(photo_url, title, link, display_order) {
    try {
        const pool = await connectMssqlDB();
        const result = await pool.request()
            .input("photo_url", sql.NVarChar(500), photo_url)
            .input("title", sql.NVarChar(200), title || '')
            .input("link", sql.NVarChar(500), link || '/')
            .input("display_order", sql.Int, display_order || 0)
            .query(`
                INSERT INTO Banners (photo_url, title, link, display_order, is_active, created_at)
                VALUES (@photo_url, @title, @link, @display_order, 1, GETDATE());
                SELECT SCOPE_IDENTITY() AS id;
            `);
        return result.recordset[0];
    } catch (error) {
        console.error("Error in createBanner:", error);
        throw error;
    }
}

// DELETE BANNER
export async function deleteBanner(id) {
    try {
        const pool = await connectMssqlDB();
        const result = await pool.request()
            .input("id", sql.Int, id)
            .query(`DELETE FROM Banners WHERE id = @id`);
        return result.rowsAffected[0] > 0;
    } catch (error) {
        console.error("Error in deleteBanner:", error);
        throw error;
    }
}

// UPDATE BANNER (optional)
export async function updateBanner(id, title, link, display_order, is_active) {
    try {
        const pool = await connectMssqlDB();
        const result = await pool.request()
            .input("id", sql.Int, id)
            .input("title", sql.NVarChar(200), title)
            .input("link", sql.NVarChar(500), link)
            .input("display_order", sql.Int, display_order)
            .input("is_active", sql.Bit, is_active)
            .query(`
                UPDATE Banners 
                SET title = @title, 
                    link = @link, 
                    display_order = @display_order, 
                    is_active = @is_active,
                    created_at = GETDATE()
                WHERE id = @id
            `);
        return result.rowsAffected[0] > 0;
    } catch (error) {
        console.error("Error in updateBanner:", error);
        throw error;
    }
}