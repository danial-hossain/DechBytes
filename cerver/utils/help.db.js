import { sql, connectMssqlDB } from '../config/db.js';

export async function countHelps() {
    const pool = await connectMssqlDB();
    const result = await pool.request()
        .query('SELECT COUNT(*) AS count FROM Helps');
    return result.recordset[0].count;
}

export async function createHelp(helpData) {
    const pool = await connectMssqlDB();
    const result = await pool.request()
        .input('email', sql.NVarChar(255), helpData.email)
        .input('message', sql.NVarChar(sql.MAX), helpData.message)
        .query(`
            INSERT INTO Helps (email, message, created_at)
            VALUES (@email, @message, GETDATE());
            SELECT SCOPE_IDENTITY() AS id;
        `);
    return { id: result.recordset[0].id, ...helpData };
}

export async function findAllHelps() {
    const pool = await connectMssqlDB();
    const result = await pool.request()
        .query('SELECT * FROM Helps');
    return result.recordset;
}
