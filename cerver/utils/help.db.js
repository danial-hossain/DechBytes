import { sql, connectMssqlDB } from '../config/db.js';

export async function createHelp(helpData) {
    const pool = await connectMssqlDB();
    
    // Helps টেবিলের কলামগুলো চেক করুন
    const columnsResult = await pool.request()
        .query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'Helps'
        `);
    
    const columns = columnsResult.recordset.map(c => c.COLUMN_NAME);
    console.log('Helps table columns:', columns);
    
    // Dynamic insert query build করুন
    let insertColumns = ['email', 'message'];
    let insertValues = ['@email', '@message'];
    
    // Check for timestamp column (createdAt or created_at)
    if (columns.includes('createdAt')) {
        insertColumns.push('createdAt');
        insertValues.push('GETDATE()');
    } else if (columns.includes('created_at')) {
        insertColumns.push('created_at');
        insertValues.push('GETDATE()');
    }
    
    if (columns.includes('updatedAt')) {
        insertColumns.push('updatedAt');
        insertValues.push('GETDATE()');
    } else if (columns.includes('updated_at')) {
        insertColumns.push('updated_at');
        insertValues.push('GETDATE()');
    }
    
    const query = `
        INSERT INTO Helps (${insertColumns.join(', ')})
        OUTPUT INSERTED.id
        VALUES (${insertValues.join(', ')})
    `;
    
    console.log('Help insert query:', query);
    
    const result = await pool.request()
        .input('email', sql.NVarChar(255), helpData.email)
        .input('message', sql.NVarChar(sql.MAX), helpData.message)
        .query(query);
        
    return { id: result.recordset[0].id, ...helpData };
}

export async function findAllHelps() {
    const pool = await connectMssqlDB();
    
    // Check which timestamp column exists
    const columnsResult = await pool.request()
        .query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'Helps'
        `);
    
    const columns = columnsResult.recordset.map(c => c.COLUMN_NAME);
    
    let orderByColumn = 'id';
    if (columns.includes('createdAt')) {
        orderByColumn = 'createdAt';
    } else if (columns.includes('created_at')) {
        orderByColumn = 'created_at';
    }
    
    const query = `SELECT * FROM Helps ORDER BY ${orderByColumn} DESC`;
    
    const result = await pool.request().query(query);
    return result.recordset;
}

export async function countHelps() {
    const pool = await connectMssqlDB();
    const result = await pool.request()
        .query('SELECT COUNT(*) AS count FROM Helps');
    return result.recordset[0].count;
}