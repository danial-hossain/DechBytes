import { sql, connectMssqlDB } from '../config/db.js';

export async function findCategoryByName(name) {
    const pool = await connectMssqlDB();
    const result = await pool.request()
        .input('name', sql.NVarChar(255), name)
        .query('SELECT * FROM Categories WHERE name = @name COLLATE Latin1_General_CI_AI');
    return result.recordset[0];
}

export async function findCategoryById(id) {
    const pool = await connectMssqlDB();
    const result = await pool.request()
        .input('id', sql.Int, id)
        .query('SELECT * FROM Categories WHERE id = @id');
    return result.recordset[0];
}

export async function findAllCategories() {
    const pool = await connectMssqlDB();
    const result = await pool.request()
        .query('SELECT * FROM Categories');
    return result.recordset;
}
