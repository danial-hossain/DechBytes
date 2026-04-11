// cerver/utils/discount.db.js
import { sql, connectMssqlDB } from "../config/db.js";

// সব ডিসকাউন্ট পাওয়া
export async function findAllDiscounts() {
  const pool = await connectMssqlDB();
  const result = await pool.request()
    .query(`
      SELECT 
        d.id,
        d.productId,
        d.discount_percent,
        d.end_date,
        d.is_active,
        d.created_at,
        p.name as productName,
        p.price as originalPrice,
        ROUND(p.price - (p.price * d.discount_percent / 100), 2) as discountedPrice
      FROM Discounts d
      INNER JOIN Products p ON d.productId = p.id
      WHERE d.is_active = 1
      ORDER BY d.created_at DESC
    `);
  return result.recordset;
}

// অ্যাক্টিভ ডিসকাউন্ট পাওয়া (ইউজারের জন্য)
export async function findActiveDiscounts() {
  const pool = await connectMssqlDB();
  const result = await pool.request()
    .query(`
      SELECT 
        d.productId,
        d.discount_percent,
        d.end_date,
        p.id,
        p.name as productName,
        p.price as originalPrice,
        ROUND(p.price - (p.price * d.discount_percent / 100), 2) as discountedPrice
      FROM Discounts d
      INNER JOIN Products p ON d.productId = p.id
      WHERE d.is_active = 1 AND (d.end_date IS NULL OR d.end_date > GETDATE())
    `);
  return result.recordset;
}

// ডিসকাউন্ট যোগ বা আপডেট
export async function upsertDiscount({ productId, discount_percent, end_date }) {
  const pool = await connectMssqlDB();
  
  // চেক করুন ডিসকাউন্ট already আছে কিনা
  const existing = await pool.request()
    .input('productId', sql.Int, productId)
    .query('SELECT id FROM Discounts WHERE productId = @productId');
  
  if (existing.recordset.length > 0) {
    // আপডেট করুন
    await pool.request()
      .input('productId', sql.Int, productId)
      .input('discount_percent', sql.Decimal(5,2), discount_percent)
      .input('end_date', sql.DateTime2, end_date || null)
      .query(`
        UPDATE Discounts 
        SET discount_percent = @discount_percent,
            end_date = @end_date,
            is_active = 1,
            created_at = GETDATE()
        WHERE productId = @productId
      `);
  } else {
    // নতুন যোগ করুন
    await pool.request()
      .input('productId', sql.Int, productId)
      .input('discount_percent', sql.Decimal(5,2), discount_percent)
      .input('end_date', sql.DateTime2, end_date || null)
      .query(`
        INSERT INTO Discounts (productId, discount_percent, end_date, is_active, created_at)
        VALUES (@productId, @discount_percent, @end_date, 1, GETDATE())
      `);
  }
}

// ডিসকাউন্ট রিমুভ করুন
export async function removeDiscount(productId) {
  const pool = await connectMssqlDB();
  await pool.request()
    .input('productId', sql.Int, productId)
    .query('UPDATE Discounts SET is_active = 0 WHERE productId = @productId');
}

// প্রোডাক্টের ডিসকাউন্ট চেক করুন
export async function getProductDiscount(productId) {
  const pool = await connectMssqlDB();
  const result = await pool.request()
    .input('productId', sql.Int, productId)
    .query(`
      SELECT discount_percent, end_date
      FROM Discounts
      WHERE productId = @productId AND is_active = 1
        AND (end_date IS NULL OR end_date > GETDATE())
    `);
  return result.recordset[0] || null;
}