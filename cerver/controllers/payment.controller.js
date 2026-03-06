import { sslcz, BASE_URL, FRONTEND_URL } from '../config/sslcommerz.js';
import { sql, connectMssqlDB } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * পেমেন্ট ইনিশিয়েট করা
 * POST /api/payment/initiate
 */
export async function initiatePayment(req, res) {
    try {
        const userId = req.userId;
        const { total_amount, products, shipping_address } = req.body;

        // Validation
        if (!userId || !total_amount || !products || !products.length) {
            return res.status(400).json({
                success: false,
                message: "Missing required payment information"
            });
        }

        // ইউনিক ট্রানজেকশন আইডি জেনারেট করা
        const tran_id = `TXN_${Date.now()}_${uuidv4().substring(0, 8)}`;

        // ইউজারের তথ্য পাওয়া
        const pool = await connectMssqlDB();
        const userResult = await pool.request()
            .input('userId', sql.Int, userId)
            .query('SELECT name, email, mobile FROM Users WHERE id = @userId');
        
        const user = userResult.recordset[0];
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // পণ্যের নাম ও ক্যাটাগরি তৈরি
        const productNames = products.map(p => p.name).join(', ');
        const productCategories = [...new Set(products.map(p => p.categoryName || 'general'))].join(', ');

        // SSLCommerz-এর জন্য পেমেন্ট ডেটা তৈরি
        const paymentData = {
            total_amount: total_amount,
            currency: 'BDT',
            tran_id: tran_id,
            success_url: `${BASE_URL}/api/payment/success/${tran_id}`,
            fail_url: `${BASE_URL}/api/payment/fail/${tran_id}`,
            cancel_url: `${BASE_URL}/api/payment/cancel/${tran_id}`,
            ipn_url: `${BASE_URL}/api/payment/ipn`,
            shipping_method: 'Courier',
            product_name: productNames.substring(0, 250),
            product_category: productCategories.substring(0, 50),
            product_profile: 'general',
            cus_name: user.name,
            cus_email: user.email,
            cus_add1: shipping_address?.address || shipping_address?.address_line || 'N/A',
            cus_city: shipping_address?.city || 'Dhaka',
            cus_state: shipping_address?.state || 'Dhaka',
            cus_postcode: shipping_address?.pincode || '1000',
            cus_country: shipping_address?.country || 'Bangladesh',
            cus_phone: user.mobile || shipping_address?.phone || '01700000000',
            cus_fax: user.mobile || '01700000000',
            ship_name: user.name,
            ship_add1: shipping_address?.address || shipping_address?.address_line || 'N/A',
            ship_city: shipping_address?.city || 'Dhaka',
            ship_state: shipping_address?.state || 'Dhaka',
            ship_postcode: shipping_address?.pincode || '1000',
            ship_country: shipping_address?.country || 'Bangladesh',
            value_a: userId.toString(),
            value_b: JSON.stringify(products.map(p => ({ id: p.id, quantity: p.quantity }))),
        };

        // SSLCommerz API তে পেমেন্ট ইনিশিয়েট করা
        const sslResponse = await sslcz.init(paymentData);
        
        if (sslResponse && sslResponse.GatewayPageURL) {
            // অর্ডার ডাটাবেসে সংরক্ষণ করা
            await saveOrderToDatabase({
                userId,
                tran_id,
                total_amount,
                products,
                shipping_address,
                payment_status: 'pending'
            });

            return res.json({
                success: true,
                gatewayUrl: sslResponse.GatewayPageURL,
                tran_id: tran_id
            });
        } else {
            return res.status(500).json({
                success: false,
                message: "Failed to initialize payment",
                error: sslResponse
            });
        }

    } catch (error) {
        console.error("Payment initiation error:", error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

/**
 * পেমেন্ট সাকসেস হ্যান্ডলার
 * POST /api/payment/success/:tran_id
 */
/**
 * পেমেন্ট সাকসেস হ্যান্ডলার
 * POST /api/payment/success/:tran_id
 */
export async function paymentSuccess(req, res) {
    try {
        const { tran_id } = req.params;
        
        console.log('✅ Payment success called with tran_id:', tran_id);
        console.log('Request body:', req.body);

        // পেমেন্ট ভ্যালিডেশন 
        if (req.body.val_id) {
            const validationData = { val_id: req.body.val_id };
            console.log('Validating with val_id:', req.body.val_id);
            
            const validationResponse = await sslcz.validate(validationData);
            console.log('Validation response:', validationResponse);
            
            if (validationResponse && validationResponse.status === 'VALID') {
                // ডাটাবেসে অর্ডার আপডেট করা
                const pool = await connectMssqlDB();
                
                const updateResult = await pool.request()
                    .input('tran_id', sql.NVarChar, tran_id)
                    .input('payment_status', sql.NVarChar, 'completed')
                    .input('val_id', sql.NVarChar, req.body.val_id)
                    .input('bank_tran_id', sql.NVarChar, req.body.bank_tran_id || '')
                    .query(`
                        UPDATE Orders 
                        SET payment_status = @payment_status,
                            val_id = @val_id,
                            bank_tran_id = @bank_tran_id,
                            updated_at = GETDATE()
                        WHERE order_number = @tran_id OR orderId = @tran_id
                    `);

                console.log('Order updated, rows affected:', updateResult.rowsAffected[0]);

                // ইউজারের কার্ট খালি করা
                const userId = req.body.value_a;
                if (userId) {
                    await pool.request()
                        .input('userId', sql.Int, userId)
                        .query('DELETE FROM CartProducts WHERE userId = @userId');
                    console.log('Cart cleared for user:', userId);
                }
            }
        } else {
            console.log('No val_id received from SSLCommerz');
        }

        // সবসময় success page-এ redirect করুন
        return res.redirect(`${FRONTEND_URL}/order/success?tran_id=${tran_id}`);

    } catch (error) {
        console.error("❌ Payment success handler error:", error);
        return res.redirect(`${FRONTEND_URL}/order/success?tran_id=${req.params.tran_id}&error=${encodeURIComponent(error.message)}`);
    }
}
/**
 * পেমেন্ট ফেইল হ্যান্ডলার
 * POST /api/payment/fail/:tran_id
 */
export async function paymentFail(req, res) {
    try {
        const { tran_id } = req.params;
        
        const pool = await connectMssqlDB();
        await pool.request()
            .input('tran_id', sql.NVarChar, tran_id)
            .input('payment_status', sql.NVarChar, 'failed')
            .query(`
                UPDATE Orders 
                SET payment_status = @payment_status,
                    updated_at = GETDATE()
                WHERE order_number = @tran_id OR orderId = @tran_id
            `);

        res.redirect(`${FRONTEND_URL}/order/fail?tran_id=${tran_id}`);

    } catch (error) {
        console.error("Payment fail handler error:", error);
        res.redirect(`${FRONTEND_URL}/order/error`);
    }
}

/**
 * পেমেন্ট ক্যান্সেল হ্যান্ডলার
 * POST /api/payment/cancel/:tran_id
 */
export async function paymentCancel(req, res) {
    try {
        const { tran_id } = req.params;
        
        const pool = await connectMssqlDB();
        await pool.request()
            .input('tran_id', sql.NVarChar, tran_id)
            .input('payment_status', sql.NVarChar, 'cancelled')
            .query(`
                UPDATE Orders 
                SET payment_status = @payment_status,
                    updated_at = GETDATE()
                WHERE order_number = @tran_id OR orderId = @tran_id
            `);

        res.redirect(`${FRONTEND_URL}/order/cancel?tran_id=${tran_id}`);

    } catch (error) {
        console.error("Payment cancel handler error:", error);
        res.redirect(`${FRONTEND_URL}/order/error`);
    }
}

/**
 * IPN (Instant Payment Notification) হ্যান্ডলার
 * POST /api/payment/ipn
 */
export async function paymentIpn(req, res) {
    try {
        const { tran_id, status, val_id } = req.body;
        
        if (status === 'VALID') {
            const pool = await connectMssqlDB();
            await pool.request()
                .input('tran_id', sql.NVarChar, tran_id)
                .input('payment_status', sql.NVarChar, 'completed')
                .input('val_id', sql.NVarChar, val_id)
                .query(`
                    UPDATE Orders 
                    SET payment_status = @payment_status,
                        val_id = @val_id,
                        updated_at = GETDATE()
                    WHERE order_number = @tran_id OR orderId = @tran_id
                `);
        }
        
        res.status(200).send('IPN Received');

    } catch (error) {
        console.error("IPN handler error:", error);
        res.status(500).send('IPN Error');
    }
}

/**
 * অর্ডার ডিটেলস পাওয়া
 * GET /api/payment/order/:tran_id
 */
export async function getOrderDetails(req, res) {
    try {
        const { tran_id } = req.params;
        
        const pool = await connectMssqlDB();
        const orderResult = await pool.request()
            .input('tran_id', sql.NVarChar, tran_id)
            .query(`
                SELECT o.*, u.name as user_name, u.email, u.mobile
                FROM Orders o
                JOIN Users u ON o.userId = u.id
                WHERE o.order_number = @tran_id OR o.orderId = @tran_id
            `);
        
        if (orderResult.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }
        
        const order = orderResult.recordset[0];
        
        const itemsResult = await pool.request()
            .input('order_id', sql.Int, order.id)
            .query('SELECT * FROM OrderItems WHERE order_id = @order_id');
        
        res.json({
            success: true,
            data: {
                ...order,
                items: itemsResult.recordset
            }
        });

    } catch (error) {
        console.error("Get order details error:", error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

/**
 * অর্ডার ডাটাবেসে সংরক্ষণের হেল্পার ফাংশন
 */
async function saveOrderToDatabase(orderData) {
    const pool = await connectMssqlDB();
    
    // Orders table-এ orderId কলামে ডাটা দিতে হবে (NOT NULL)
    const orderResult = await pool.request()
        .input('userId', sql.Int, orderData.userId)
        .input('orderId', sql.NVarChar, orderData.tran_id)        // ✅ orderId required
        .input('order_number', sql.NVarChar, orderData.tran_id)   // ✅ order_number optional
        .input('total', sql.Decimal(10,2), orderData.total_amount)
        .input('totalAmt', sql.Decimal(10,2), orderData.total_amount)
        .input('payment_status', sql.NVarChar, orderData.payment_status)
        .input('order_status', sql.NVarChar, 'pending')
        .input('delivery_name', sql.NVarChar, orderData.shipping_address?.name || '')
        .input('delivery_email', sql.NVarChar, orderData.shipping_address?.email || '')
        .input('delivery_phone', sql.NVarChar, orderData.shipping_address?.phone || '')
        .input('delivery_address_line', sql.NVarChar, 
               `${orderData.shipping_address?.address || orderData.shipping_address?.address_line || ''}, ${orderData.shipping_address?.city || ''}`)
        .input('created_at', sql.DateTime2, new Date())
        .input('updated_at', sql.DateTime2, new Date())
        .query(`
            INSERT INTO Orders (
                userId, orderId, order_number, total, totalAmt, 
                payment_status, order_status, 
                delivery_name, delivery_email, delivery_phone, delivery_address_line,
                created_at, updated_at
            )
            OUTPUT INSERTED.id
            VALUES (
                @userId, @orderId, @order_number, @total, @totalAmt,
                @payment_status, @order_status,
                @delivery_name, @delivery_email, @delivery_phone, @delivery_address_line,
                @created_at, @updated_at
            )
        `);
    
    const orderId = orderResult.recordset[0].id;
    
    // OrderItems টেবিলের কলাম চেক করা
    const itemColumnsResult = await pool.request()
        .query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'OrderItems'
        `);
    
    const itemColumns = itemColumnsResult.recordset.map(c => c.COLUMN_NAME);
    console.log('OrderItems columns:', itemColumns);
    
    // অর্ডার আইটেম সংরক্ষণ (ডায়নামিক)
    for (const product of orderData.products) {
        const request = pool.request();
        
        // বেসিক কোয়েরি শুরু
        let query = 'INSERT INTO OrderItems (order_id';
        let values = 'VALUES (@order_id';
        
        request.input('order_id', sql.Int, orderId);
        
        // product_id
        if (itemColumns.includes('product_id')) {
            query += ', product_id';
            values += ', @product_id';
            request.input('product_id', sql.Int, product.id);
        }
        
        // product_name
        if (itemColumns.includes('product_name')) {
            query += ', product_name';
            values += ', @product_name';
            request.input('product_name', sql.NVarChar, product.name);
        }
        
        // price / product_price
        if (itemColumns.includes('product_price')) {
            query += ', product_price';
            values += ', @product_price';
            request.input('product_price', sql.Decimal(10,2), product.price);
        } else if (itemColumns.includes('price')) {
            query += ', price';
            values += ', @price';
            request.input('price', sql.Decimal(10,2), product.price);
        }
        
        // quantity
        if (itemColumns.includes('quantity')) {
            query += ', quantity';
            values += ', @quantity';
            request.input('quantity', sql.Int, product.quantity);
        }
        
        // subtotal
        if (itemColumns.includes('subtotal')) {
            query += ', subtotal';
            values += ', @subtotal';
            request.input('subtotal', sql.Decimal(10,2), product.price * product.quantity);
        }
        
        // image / product_image
        if (itemColumns.includes('product_image')) {
            query += ', product_image';
            values += ', @product_image';
            request.input('product_image', sql.NVarChar, product.image || '');
        } else if (itemColumns.includes('image')) {
            query += ', image';
            values += ', @image';
            request.input('image', sql.NVarChar, product.image || '');
        }
        
        query += ') ' + values + ')';
        
        console.log('OrderItems insert query:', query);
        
        await request.query(query);
    }

    return orderId;
}