import { sql, connectMssqlDB } from "../config/db.js";

// GET ALL ADS
export async function getAllAds() {
    const pool = await connectMssqlDB();

    const result = await pool.request()
        .query(`
            SELECT 
                id,
                photo_url,
                created_at
            FROM Advertisements
            ORDER BY id DESC
        `);

    return result.recordset;
}

// CREATE AD
export async function createAd(photo_url) {
    const pool = await connectMssqlDB();

    const result = await pool.request()
        .input("photo_url", sql.NVarChar(500), photo_url)
        .query(`
            INSERT INTO Advertisements (photo_url, created_at)
            VALUES (@photo_url, GETDATE());

            SELECT SCOPE_IDENTITY() AS id;
        `);

    return result.recordset[0];
}

// DELETE AD
export async function deleteAd(id) {
    const pool = await connectMssqlDB();

    const result = await pool.request()
        .input("id", sql.Int, id)
        .query(`
            DELETE FROM Advertisements
            WHERE id = @id
        `);

    return result.rowsAffected[0] > 0;
}