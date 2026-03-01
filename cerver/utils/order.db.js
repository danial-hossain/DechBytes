import { sql, connectMssqlDB } from '../config/db.js';

export async function countOrders() {
    const pool = await connectMssqlDB();
    const result = await pool.request()
        .query('SELECT COUNT(*) AS count FROM Orders');
    return result.recordset[0].count;
}

export async function findAllOrders() {
    const pool = await connectMssqlDB();
    const result = await pool.request()
        .query('SELECT * FROM Orders');
    return result.recordset;
}

export async function findUserOrders(userId) {
    const pool = await connectMssqlDB();
    const result = await pool.request()
        .input('userId', sql.Int, userId)
        .query('SELECT * FROM Orders WHERE userId = @userId ORDER BY created_at DESC');
    return result.recordset;
}

export async function createOrder(orderData, productDetails) {
    const pool = await connectMssqlDB();
    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();
        const request = new sql.Request(transaction);

        const orderResult = await request
            .input('userId', sql.Int, orderData.userId)
            .input('orderId', sql.NVarChar(255), orderData.orderId)
            .input('paymentId', sql.NVarChar(255), orderData.paymentId)
            .input('payment_status', sql.NVarChar(50), orderData.payment_status)
            .input('delivery_name', sql.NVarChar(255), orderData.delivery_address.name)
            .input('delivery_email', sql.NVarChar(255), orderData.delivery_address.email)
            .input('delivery_phone', sql.NVarChar(50), orderData.delivery_address.phone)
            .input('delivery_address_line', sql.NVarChar(sql.MAX), orderData.delivery_address.address)
            .input('subTotalAmt', sql.Decimal(10, 2), orderData.subTotalAmt)
            .input('totalAmt', sql.Decimal(10, 2), orderData.totalAmt)
            .input('invoice_receipt', sql.NVarChar(sql.MAX), orderData.invoice_receipt)
            .query(`
                INSERT INTO Orders (userId, orderId, paymentId, payment_status, delivery_name, delivery_email, delivery_phone, delivery_address_line, subTotalAmt, totalAmt, invoice_receipt, created_at, updated_at)
                VALUES (@userId, @orderId, @paymentId, @payment_status, @delivery_name, @delivery_email, @delivery_phone, @delivery_address_line, @subTotalAmt, @totalAmt, @invoice_receipt, GETDATE(), GETDATE());
                SELECT SCOPE_IDENTITY() AS id;
            `);

        const newOrderId = orderResult.recordset[0].id;

        for (const product of productDetails) {
            await request
                .input('order_id', sql.Int, newOrderId)
                .input('product_name', sql.NVarChar(255), product.name)
                .input('product_image', sql.NVarChar(sql.MAX), product.image)
                .input('quantity', sql.Int, product.quantity)
                .input('price', sql.Decimal(10, 2), product.price)
                .query(`
                    INSERT INTO OrderProducts (order_id, product_name, product_image, quantity, price)
                    VALUES (@order_id, @product_name, @product_image, @quantity, @price);
                `);
        }

        await transaction.commit();
        return { id: newOrderId, ...orderData, product_details: productDetails };

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}
