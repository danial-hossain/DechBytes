import { sql, connectMssqlDB } from '../config/db.js';

export async function findUserByEmail(email) {
    const pool = await connectMssqlDB();
    const result = await pool.request()
        .input('email', sql.NVarChar(255), email)
        .query('SELECT * FROM Users WHERE email = @email');
    return result.recordset[0];
}

export async function createUser(userData) {
    const pool = await connectMssqlDB();
    const result = await pool.request()
        .input('name', sql.NVarChar(255), userData.name)
        .input('email', sql.NVarChar(255), userData.email)
        .input('mobile', sql.NVarChar(20), userData.mobile)
        .input('password', sql.NVarChar(255), userData.password)
        .input('otp', sql.NVarChar(255), userData.otp)
        .input('otp_expires', sql.DateTime2, userData.otpExpires)
        .query(`
            INSERT INTO Users (name, email, mobile, password, otp, otp_expires, created_at, updated_at)
            VALUES (@name, @email, @mobile, @password, @otp, @otp_expires, GETDATE(), GETDATE());
            SELECT SCOPE_IDENTITY() AS id;
        `);
    return { id: result.recordset[0].id, ...userData }; // Return id and other data
}

export async function findUserById(id) {
    const pool = await connectMssqlDB();
    const result = await pool.request()
        .input('id', sql.Int, id)
        .query('SELECT * FROM Users WHERE id = @id');
    return result.recordset[0];
}

export async function updateUserById(id, updateData) {
    const pool = await connectMssqlDB();
    const request = pool.request()
        .input('id', sql.Int, id)
        .input('updated_at', sql.DateTime2, new Date());

    let updateQueryParts = [];
    if (updateData.name !== undefined) {
        updateQueryParts.push('name = @name');
        request.input('name', sql.NVarChar(255), updateData.name);
    }
    if (updateData.mobile !== undefined) {
        updateQueryParts.push('mobile = @mobile');
        request.input('mobile', sql.NVarChar(20), updateData.mobile);
    }
    if (updateData.password !== undefined) {
        updateQueryParts.push('password = @password');
        request.input('password', sql.NVarChar(255), updateData.password);
    }
    if (updateData.verify_email !== undefined) {
        updateQueryParts.push('verify_email = @verify_email');
        request.input('verify_email', sql.Bit, updateData.verify_email);
    }
    if (updateData.otp !== undefined) {
        updateQueryParts.push('otp = @otp');
        request.input('otp', sql.NVarChar(255), updateData.otp);
    }
    if (updateData.otpExpires !== undefined) {
        updateQueryParts.push('otp_expires = @otp_expires');
        request.input('otp_expires', sql.DateTime2, updateData.otpExpires);
    }
    if (updateData.last_login_date !== undefined) {
        updateQueryParts.push('last_login_date = @last_login_date');
        request.input('last_login_date', sql.DateTime2, updateData.last_login_date);
    }
    if (updateData.status !== undefined) {
        updateQueryParts.push('status = @status');
        request.input('status', sql.NVarChar(50), updateData.status);
    }
    // Add other fields as needed

    if (updateQueryParts.length === 0) {
        return null; // No fields to update
    }

    const updateQuery = `UPDATE Users SET ${updateQueryParts.join(', ')}, updated_at = @updated_at WHERE id = @id`;
    await request.query(updateQuery);

    return findUserById(id); // Return the updated user
}

export async function countUsers() {
    const pool = await connectMssqlDB();
    const result = await pool.request()
        .query('SELECT COUNT(*) AS count FROM Users');
    return result.recordset[0].count;
}

export async function findUsers(selectFields) {
    const pool = await connectMssqlDB();
    let selectClause = '*';
    if (selectFields && selectFields.length > 0) {
        selectClause = selectFields.map(field => `Users.${field}`).join(', ');
    }
    const result = await pool.request()
        .query(`SELECT ${selectClause} FROM Users`);
    return result.recordset;
}
