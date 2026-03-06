import { sql, connectMssqlDB } from '../config/db.js';

export async function countReports() {
    const pool = await connectMssqlDB();
    const result = await pool.request()
        .query('SELECT COUNT(*) AS count FROM Reports');
    return result.recordset[0].count;
}

export async function createReport(reportData) {
    try {
        const pool = await connectMssqlDB();
        
        console.log('Creating report with data:', reportData);
        
        const result = await pool.request()
            .input('userId', sql.Int, reportData.userId)
            .input('opinion', sql.NVarChar(sql.MAX), reportData.opinion)
            .query(`
                INSERT INTO Reports (userId, opinion, createdAt, updatedAt)
                OUTPUT INSERTED.id
                VALUES (@userId, @opinion, GETDATE(), GETDATE())
            `);
            
        console.log('Report created with ID:', result.recordset[0].id);
        
        return { id: result.recordset[0].id, ...reportData };
    } catch (error) {
        console.error('Error in createReport:', error);
        throw error;
    }
}

export async function findAllReportsWithUser() {
    try {
        const pool = await connectMssqlDB();
        
        // সরাসরি JOIN ব্যবহার করে Reports সাথে Users এর তথ্য নিন
        const query = `
            SELECT 
                R.id,
                R.opinion,
                R.createdAt,
                R.updatedAt,
                U.name AS userName,
                U.email AS userEmail,
                U.id AS userId
            FROM Reports R
            INNER JOIN Users U ON R.userId = U.id
            ORDER BY R.createdAt DESC
        `;
        
        console.log('Executing query:', query);
        
        const result = await pool.request().query(query);
        
        // ফলাফল ফরম্যাট করুন
        const formattedReports = result.recordset.map(report => ({
            id: report.id,
            opinion: report.opinion,
            createdAt: report.createdAt ? new Date(report.createdAt).toLocaleString() : 'N/A',
            updatedAt: report.updatedAt ? new Date(report.updatedAt).toLocaleString() : 'N/A',
            user: {
                id: report.userId,
                name: report.userName || 'Unknown',
                email: report.userEmail || 'Unknown'
            }
        }));
        
        console.log('Formatted reports:', formattedReports);
        
        return formattedReports;
    } catch (error) {
        console.error('Error in findAllReportsWithUser:', error);
        throw error;
    }
}

export async function getAllReports() {
    try {
        const pool = await connectMssqlDB();
        const result = await pool.request()
            .query('SELECT * FROM Reports ORDER BY createdAt DESC');
        return result.recordset;
    } catch (err) {
        console.error("Error getting all reports:", err);
        throw err;
    }
}

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