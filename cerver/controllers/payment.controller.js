
import { sslcz, BASE_URL, FRONTEND_URL } from '../config/sslcommerz.js';
import { sql, connectMssqlDB } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';


export async function initiatePayment(req, res) {
    try {
        const userId = req.userId;
        const { total_amount, products, shipping_address } = req.body;

        console.log('📦 Payment initiation request:', { userId, total_amount, productsCount: products?.length });

        // Validation
        if (!userId || !total_amount || !products || !products.length) {
            return res.status(400).json({
                success: false,
                message: "Missing required payment information"
            });
        }

        // ইউনিক ট্রানজেকশন আইডি
        const tran_id = `TXN_${Date.now()}_${uuidv4().substring(0, 8)}`;

        // ইউজারের তথ্য
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

        // পণ্যের নাম
        const productNames = products.map(p => p.name).join(', ');
        const productCategories = [...new Set(products.map(p => p.categoryName || 'general'))].join(', ');

        // SSLCommerz ডেটা
        const paymentData = {
            total_amount: parseFloat(total_amount).toFixed(2),
            currency: 'BDT',
            tran_id: tran_id,
            success_url: `${BASE_URL}/api/payment/success/${tran_id}`,
            fail_url: `${BASE_URL}/api/payment/fail/${tran_id}`,
            cancel_url: `${BASE_URL}/api/payment/cancel/${tran_id}`,
            ipn_url: `${BASE_URL}/api/payment/ipn`,
            shipping_method: 'NO',
            product_name: productNames.substring(0, 100),
            product_category: productCategories.substring(0, 50) || 'general',
            product_profile: 'general',
            cus_name: user.name,
            cus_email: user.email,
            cus_add1: shipping_address?.address || shipping_address?.address_line || 'Dhaka',
            cus_city: shipping_address?.city || 'Dhaka',
            cus_state: shipping_address?.state || 'Dhaka',
            cus_postcode: shipping_address?.pincode || '1212',
            cus_country: shipping_address?.country || 'Bangladesh',
            cus_phone: user.mobile || shipping_address?.phone || '01700000000',
            value_a: userId.toString(),
            value_b: products.map(p => `${p.id}:${p.quantity}`).join('|')
        };

        console.log('📤 Sending to SSLCommerz:', { ...paymentData, store_passwd: '******' });

        // SSLCommerz কল
        const sslResponse = await sslcz.init(paymentData);

        console.log('📥 SSLCommerz Response:', sslResponse);

        if (sslResponse && sslResponse.status === 'SUCCESS' && sslResponse.GatewayPageURL) {
            // অর্ডার সেভ
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
            const errorMsg = sslResponse?.failedreason || 'Payment initiation failed';
            console.error('❌ SSLCommerz failed:', errorMsg);
            return res.status(400).json({
                success: false,
                message: errorMsg,
                error: sslResponse
            });
        }

    } catch (error) {
        console.error("❌ Payment initiation error:", error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
}

/**
 * পেমেন্ট সাকসেস হ্যান্ডলার
 */
export async function paymentSuccess(req, res) {
    try {
        const { tran_id } = req.params;
        
        console.log('✅ Payment success callback received');
        console.log('Tran ID:', tran_id);
        console.log('Request method:', req.method);
        console.log('Query params:', req.query);
        console.log('Body:', req.body);
        
        // SSLCommerz থেকে আসা ডাটা
        const val_id = req.body.val_id || req.query.val_id;
        const bank_tran_id = req.body.bank_tran_id || req.query.bank_tran_id;
        const userId = req.body.value_a || req.query.value_a;
        
        console.log('Val ID:', val_id);
        console.log('Bank Tran ID:', bank_tran_id);
        console.log('User ID:', userId);
        
        // ভ্যালিডেশন এবং ডাটাবেস আপডেট
        if (val_id) {
            try {
                console.log('🔍 Validating payment...');
                const validationResponse = await sslcz.validate({ val_id });
                console.log('Validation response:', validationResponse);
                
                if (validationResponse && validationResponse.status === 'VALID') {
                    const pool = await connectMssqlDB();
                    
                    // অর্ডার আপডেট
                    await pool.request()
                        .input('tran_id', sql.NVarChar, tran_id)
                        .input('payment_status', sql.NVarChar, 'completed')
                        .input('order_status', sql.NVarChar, 'confirmed')
                        .input('val_id', sql.NVarChar, val_id)
                        .input('bank_tran_id', sql.NVarChar, bank_tran_id || '')
                        .query(`
                            UPDATE Orders 
                            SET payment_status = @payment_status,
                                order_status = @order_status,
                                val_id = @val_id,
                                bank_tran_id = @bank_tran_id,
                                updated_at = GETDATE()
                            WHERE order_number = @tran_id OR orderId = @tran_id
                        `);
                    
                    console.log('✅ Order updated successfully');
                    
                    // কার্ট খালি
                    if (userId) {
                        await pool.request()
                            .input('userId', sql.Int, parseInt(userId))
                            .query('DELETE FROM CartProducts WHERE userId = @userId');
                        console.log('✅ Cart cleared for user:', userId);
                    }
                } else {
                    console.log('⚠️ Validation status:', validationResponse?.status);
                }
            } catch (validateError) {
                console.error('⚠️ Validation error (continuing):', validateError.message);
            }
        } else {
            console.log('⚠️ No val_id received, skipping validation');
        }
        
        // ফ্রন্টএন্ডে রিডাইরেক্ট
        const redirectUrl = `${FRONTEND_URL}/order/success?tran_id=${tran_id}&status=success`;
        console.log('🔀 Redirecting to:', redirectUrl);
        
        return res.redirect(redirectUrl);
        
    } catch (error) {
        console.error("❌ Payment success handler error:", error);
        // Error হলেও user কে success page এ পাঠান
        return res.redirect(`${FRONTEND_URL}/order/success?tran_id=${req.params.tran_id}&error=${encodeURIComponent(error.message)}`);
    }
}

/**
 * পেমেন্ট ফেইল হ্যান্ডলার
 */
export async function paymentFail(req, res) {
    try {
        const { tran_id } = req.params;
        
        console.log('❌ Payment fail for:', tran_id);
        
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
        console.error("❌ Payment fail error:", error);
        res.redirect(`${FRONTEND_URL}/order/error`);
    }
}

/**
 * পেমেন্ট ক্যান্সেল হ্যান্ডলার
 */
export async function paymentCancel(req, res) {
    try {
        const { tran_id } = req.params;
        
        console.log('🚫 Payment cancel for:', tran_id);
        
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
        console.error("❌ Payment cancel error:", error);
        res.redirect(`${FRONTEND_URL}/order/error`);
    }
}

/**
 * IPN (Instant Payment Notification) হ্যান্ডলার
 */
export async function paymentIpn(req, res) {
    try {
        console.log('📡 IPN received:', req.body);
        
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
                        order_status = 'confirmed',
                        updated_at = GETDATE()
                    WHERE order_number = @tran_id OR orderId = @tran_id
                `);
            console.log('✅ IPN order updated');
        }
        
        res.status(200).send('OK');

    } catch (error) {
        console.error("❌ IPN error:", error);
        res.status(500).send('Error');
    }
}

/**
 * অর্ডার ডিটেলস পাওয়া
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
        console.error("❌ Get order details error:", error);
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
    
    const orderResult = await pool.request()
        .input('userId', sql.Int, orderData.userId)
        .input('orderId', sql.NVarChar, orderData.tran_id)
        .input('order_number', sql.NVarChar, orderData.tran_id)
        .input('total', sql.Decimal(10, 2), orderData.total_amount)
        .input('totalAmt', sql.Decimal(10, 2), orderData.total_amount)
        .input('payment_status', sql.NVarChar, orderData.payment_status)
        .input('order_status', sql.NVarChar, 'pending')
        .input('delivery_name', sql.NVarChar, orderData.shipping_address?.name || '')
        .input('delivery_email', sql.NVarChar, orderData.shipping_address?.email || '')
        .input('delivery_phone', sql.NVarChar, orderData.shipping_address?.phone || '')
        .input('delivery_address_line', sql.NVarChar,
            `${orderData.shipping_address?.address || orderData.shipping_address?.address_line || ''}, ${orderData.shipping_address?.city || 'Dhaka'}`)
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
    
    // OrderItems সেভ
    for (const product of orderData.products) {
        await pool.request()
            .input('order_id', sql.Int, orderId)
            .input('product_id', sql.Int, product.id)
            .input('product_name', sql.NVarChar, product.name)
            .input('product_price', sql.Decimal(10, 2), product.price)
            .input('quantity', sql.Int, product.quantity)
            .input('subtotal', sql.Decimal(10, 2), product.price * product.quantity)
            .query(`
                INSERT INTO OrderItems (order_id, product_id, product_name, product_price, quantity, subtotal)
                VALUES (@order_id, @product_id, @product_name, @product_price, @quantity, @subtotal)
            `);
    }
    
    console.log('✅ Order saved with ID:', orderId);
    return orderId;
}