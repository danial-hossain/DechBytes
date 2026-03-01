// utils/address.db.js
import { sql, connectMssqlDB } from '../config/db.js';

// ===== CREATE ADDRESS =====
export async function createAddress(addressData) {
    const pool = await connectMssqlDB();
    const result = await pool.request()
        .input('address_line', sql.NVarChar(sql.MAX), addressData.address_line)
        .input('city', sql.NVarChar(255), addressData.city)
        .input('state', sql.NVarChar(255), addressData.state)
        .input('pincode', sql.NVarChar(20), addressData.pincode)
        .input('country', sql.NVarChar(255), addressData.country)
        .input('mobile', sql.NVarChar(20), addressData.mobile)
        .input('userId', sql.Int, addressData.userId)
        .query(`
            INSERT INTO Addresses (address_line, city, state, pincode, country, mobile, userId, created_at)
            VALUES (@address_line, @city, @state, @pincode, @country, @mobile, @userId, GETDATE());
            SELECT SCOPE_IDENTITY() AS id;
        `);

    return { id: result.recordset[0].id, ...addressData }; // ✅ includes userId now
}

// ===== FIND ADDRESSES BY USER =====
export async function findAddressesByUserId(userId) {
    const pool = await connectMssqlDB();
    const result = await pool.request()
        .input('userId', sql.Int, userId)
        .query(`
            SELECT 
                id,
                address_line,
                city,
                state,
                pincode,
                country,
                mobile,
                userId,
                created_at
            FROM Addresses 
            WHERE userId = @userId
        `);
    return result.recordset;
}

// ===== FIND ADDRESS BY ID =====
export async function findAddressById(addressId) {
    const pool = await connectMssqlDB();
    const result = await pool.request()
        .input('id', sql.Int, addressId)
        .query('SELECT * FROM Addresses WHERE id = @id');
    return result.recordset[0];
}

// ===== UPDATE ADDRESS =====
export async function updateAddressById(addressId, updateData) {
    const pool = await connectMssqlDB();
    const request = pool.request()
        .input('id', sql.Int, addressId);

    let updateQueryParts = [];

    if (updateData.address_line !== undefined) {
        updateQueryParts.push('address_line = @address_line');
        request.input('address_line', sql.NVarChar(sql.MAX), updateData.address_line);
    }
    if (updateData.city !== undefined) {
        updateQueryParts.push('city = @city');
        request.input('city', sql.NVarChar(255), updateData.city);
    }
    if (updateData.state !== undefined) {
        updateQueryParts.push('state = @state');
        request.input('state', sql.NVarChar(255), updateData.state);
    }
    if (updateData.pincode !== undefined) {
        updateQueryParts.push('pincode = @pincode');
        request.input('pincode', sql.NVarChar(20), updateData.pincode);
    }
    if (updateData.country !== undefined) {
        updateQueryParts.push('country = @country');
        request.input('country', sql.NVarChar(255), updateData.country);
    }
    if (updateData.mobile !== undefined) {
        updateQueryParts.push('mobile = @mobile');
        request.input('mobile', sql.NVarChar(20), updateData.mobile);
    }

    if (updateQueryParts.length === 0) return null;

    const updateQuery = `UPDATE Addresses SET ${updateQueryParts.join(', ')} WHERE id = @id`;
    await request.query(updateQuery);

    return findAddressById(addressId);
}

// ===== DELETE ADDRESS =====
export async function deleteAddress(addressId) {
    const pool = await connectMssqlDB();
    await pool.request()
        .input('id', sql.Int, addressId)
        .query('DELETE FROM Addresses WHERE id = @id');
}