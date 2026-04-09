import { sql, connectMssqlDB } from '../config/db.js';

export async function countReports() {
    const pool = await connectMssqlDB();
    const result = await pool.request()
        .query('SELECT COUNT(*) AS count FROM Reports');
    return result.recordset[0].count;
}

/**
 * Create a new report
 */
export async function createReport({ userId, opinion }) {
    try {
        const pool = await connectMssqlDB();
        console.log('Creating report with data:', { userId, opinion });

        const result = await pool.request()
            .input('userId', sql.Int, userId)
            .input('opinion', sql.NVarChar(sql.MAX), opinion)
            .query(`
                INSERT INTO Reports (user_id, opinion, created_at, updated_at)
                OUTPUT INSERTED.id
                VALUES (@userId, @opinion, GETDATE(), GETDATE())
            `);

        console.log('Report created with ID:', result.recordset[0].id);
        return { id: result.recordset[0].id, userId, opinion };
    } catch (error) {
        console.error('Error in createReport:', error);
        throw error;
    }
}

/**
 * Get all reports with user info (for admin)
 */
export async function findAllReportsWithUser() {
    try {
        const pool = await connectMssqlDB();

        const query = `
            SELECT 
                R.id,
                R.opinion,
                R.created_at,
                R.updated_at,
                U.name AS userName,
                U.email AS userEmail,
                U.id AS userId
            FROM Reports R
            INNER JOIN Users U ON R.user_id = U.id
            ORDER BY R.created_at DESC
        `;

        console.log('Executing query:', query);

        const result = await pool.request().query(query);

        const formattedReports = result.recordset.map(report => ({
            id: report.id,
            opinion: report.opinion,
            createdAt: report.created_at ? new Date(report.created_at).toLocaleString() : 'N/A',
            updatedAt: report.updated_at ? new Date(report.updated_at).toLocaleString() : 'N/A',
            user: {
                id: report.userId,
                name: report.userName || 'Unknown',
                email: report.userEmail || 'Unknown'
            }
        }));

        return formattedReports;
    } catch (error) {
        console.error('Error in findAllReportsWithUser:', error);
        throw error;
    }
}

/**
 * Get reports of a single user
 */
export async function getUserReports(userId) {
    try {
        const pool = await connectMssqlDB();
        const result = await pool.request()
            .input('userId', sql.Int, userId)
            .query('SELECT * FROM Reports WHERE user_id = @userId ORDER BY created_at DESC');
        return result.recordset;
    } catch (error) {
        console.error('Error in getUserReports:', error);
        throw error;
    }
}

/**
 * Get all reports (raw)
 */
export async function getAllReports() {
    try {
        const pool = await connectMssqlDB();
        const result = await pool.request()
            .query('SELECT * FROM Reports ORDER BY created_at DESC');
        return result.recordset;
    } catch (err) {
        console.error("Error getting all reports:", err);
        throw err;
    }
}

/**
 * Get a single report by ID
 */
export async function getReportById(id) {
    try {
        const pool = await connectMssqlDB();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM Reports WHERE id = @id');
        return result.recordset[0];
    } catch (err) {
        console.error("Error getting report by ID:", err);
        throw err;
    }
}