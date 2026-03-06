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
        .query('SELECT * FROM Orders ORDER BY created_at DESC');
    return result.recordset;
}

export async function findUserOrders(userId) {
    const pool = await connectMssqlDB();
    
    // প্রথমে OrderItems টেবিলের কলামগুলো দেখি
    const columnsResult = await pool.request()
        .query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'OrderItems'
        `);
    
    const itemColumns = columnsResult.recordset.map(c => c.COLUMN_NAME);
    console.log('OrderItems columns:', itemColumns);

    // Dynamic JSON query build করুন
    let itemFields = [];
    
    if (itemColumns.includes('product_name')) {
        itemFields.push('product_name');
    }
    if (itemColumns.includes('product_image')) {
        itemFields.push('product_image');
    } else if (itemColumns.includes('image')) {
        itemFields.push('image as product_image');
    }
    if (itemColumns.includes('quantity')) {
        itemFields.push('quantity');
    }
    if (itemColumns.includes('price')) {
        itemFields.push('price');
    } else if (itemColumns.includes('product_price')) {
        itemFields.push('product_price as price');
    }
    if (itemColumns.includes('subtotal')) {
        itemFields.push('subtotal');
    }

    const itemFieldsStr = itemFields.join(', ');

    const query = `
        SELECT o.*, 
            (SELECT JSON_QUERY((
                SELECT ${itemFieldsStr}
                FROM OrderItems
                WHERE order_id = o.id
                FOR JSON PATH
            ))) as items
        FROM Orders o
        WHERE o.userId = @userId 
        ORDER BY o.created_at DESC
    `;

    console.log('Find orders query:', query);

    const result = await pool.request()
        .input('userId', sql.Int, userId)
        .query(query);
    
    return result.recordset;
}

export async function createOrder(orderData, productDetails) {
    const pool = await connectMssqlDB();
    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();
        const request = new sql.Request(transaction);

        // Calculate subtotal for each product
        const orderItems = productDetails.map(p => ({
            ...p,
            subtotal: p.price * p.quantity
        }));

        // Validate all product IDs before inserting
        console.log('Validating product IDs:', orderItems.map(p => ({ id: p.id, name: p.name })));
        
        for (const product of orderItems) {
            if (!product.id) {
                throw new Error(`Product ID is missing for product: ${product.name}`);
            }

            const checkProduct = await pool.request()
                .input('product_id', sql.Int, product.id)
                .query('SELECT id, name FROM Products WHERE id = @product_id');
            
            if (checkProduct.recordset.length === 0) {
                const availableProducts = await pool.request()
                    .query('SELECT TOP 10 id, name FROM Products ORDER BY id');
                
                console.error('Available products:', availableProducts.recordset);
                throw new Error(`Product ID ${product.id} (${product.name}) not found in Products table.`);
            }
            
            console.log(`✅ Product validated: ${checkProduct.recordset[0].name} (ID: ${product.id})`);
        }

        // Check Orders table columns
        const columnsResult = await pool.request()
            .query(`
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'Orders'
            `);
        
        const columns = columnsResult.recordset.map(c => c.COLUMN_NAME);
        console.log('Orders table columns:', columns);

        // Build dynamic insert query
        let insertColumns = ['userId', 'orderId', 'order_number', 'total', 'payment_status', 'order_status', 'created_at', 'updated_at'];
        let insertValues = ['@userId', '@orderId', '@order_number', '@total', '@payment_status', '@order_status', 'GETDATE()', 'GETDATE()'];
        
        if (columns.includes('delivery_name')) {
            insertColumns.push('delivery_name');
            insertValues.push('@delivery_name');
        }
        if (columns.includes('delivery_email')) {
            insertColumns.push('delivery_email');
            insertValues.push('@delivery_email');
        }
        if (columns.includes('delivery_phone')) {
            insertColumns.push('delivery_phone');
            insertValues.push('@delivery_phone');
        }
        
        if (columns.includes('delivery_address')) {
            insertColumns.push('delivery_address');
            insertValues.push('@delivery_address');
        } else if (columns.includes('delivery_address_line')) {
            insertColumns.push('delivery_address_line');
            insertValues.push('@delivery_address');
        }
        
        if (columns.includes('val_id')) {
            insertColumns.push('val_id');
            insertValues.push('@val_id');
        }
        if (columns.includes('bank_tran_id')) {
            insertColumns.push('bank_tran_id');
            insertValues.push('@bank_tran_id');
        }

        const orderQuery = `
            INSERT INTO Orders (${insertColumns.join(', ')})
            OUTPUT INSERTED.id
            VALUES (${insertValues.join(', ')})
        `;

        console.log('Insert query:', orderQuery);

        const orderRequest = request
            .input('userId', sql.Int, orderData.userId)
            .input('orderId', sql.NVarChar(255), orderData.orderId)
            .input('order_number', sql.NVarChar(255), orderData.order_number)
            .input('total', sql.Decimal(10, 2), orderData.totalAmt)
            .input('payment_status', sql.NVarChar(50), orderData.payment_status || 'pending')
            .input('order_status', sql.NVarChar(50), orderData.order_status || 'processing');

        if (columns.includes('delivery_name')) {
            orderRequest.input('delivery_name', sql.NVarChar(255), orderData.delivery_address?.name || '');
        }
        if (columns.includes('delivery_email')) {
            orderRequest.input('delivery_email', sql.NVarChar(255), orderData.delivery_address?.email || '');
        }
        if (columns.includes('delivery_phone')) {
            orderRequest.input('delivery_phone', sql.NVarChar(50), orderData.delivery_address?.phone || '');
        }
        
        const addressString = JSON.stringify(orderData.delivery_address || {});
        orderRequest.input('delivery_address', sql.NVarChar(sql.MAX), addressString);
        
        if (columns.includes('val_id')) {
            orderRequest.input('val_id', sql.NVarChar(100), null);
        }
        if (columns.includes('bank_tran_id')) {
            orderRequest.input('bank_tran_id', sql.NVarChar(100), null);
        }

        const orderResult = await orderRequest.query(orderQuery);
        const newOrderId = orderResult.recordset[0].id;

        console.log('✅ Order inserted with ID:', newOrderId);

        // Check OrderItems table columns for insert
        const itemColumnsResult = await pool.request()
            .query(`
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'OrderItems'
            `);
        
        const itemColumns = itemColumnsResult.recordset.map(c => c.COLUMN_NAME);
        console.log('OrderItems columns for insert:', itemColumns);

        // Insert order items
        for (const product of orderItems) {
            let itemInsertColumns = ['order_id'];
            let itemInsertValues = ['@order_id'];
            let itemParams = { order_id: newOrderId };

            if (itemColumns.includes('product_id')) {
                itemInsertColumns.push('product_id');
                itemInsertValues.push('@product_id');
                itemParams.product_id = product.id;
            }
            if (itemColumns.includes('product_name')) {
                itemInsertColumns.push('product_name');
                itemInsertValues.push('@product_name');
                itemParams.product_name = product.name;
            }
            if (itemColumns.includes('product_image')) {
                itemInsertColumns.push('product_image');
                itemInsertValues.push('@product_image');
                itemParams.product_image = product.image || '';
            } else if (itemColumns.includes('image')) {
                itemInsertColumns.push('image');
                itemInsertValues.push('@image');
                itemParams.image = product.image || '';
            }
            if (itemColumns.includes('quantity')) {
                itemInsertColumns.push('quantity');
                itemInsertValues.push('@quantity');
                itemParams.quantity = product.quantity;
            }
            if (itemColumns.includes('price')) {
                itemInsertColumns.push('price');
                itemInsertValues.push('@price');
                itemParams.price = product.price;
            } else if (itemColumns.includes('product_price')) {
                itemInsertColumns.push('product_price');
                itemInsertValues.push('@product_price');
                itemParams.product_price = product.price;
            }
            if (itemColumns.includes('subtotal')) {
                itemInsertColumns.push('subtotal');
                itemInsertValues.push('@subtotal');
                itemParams.subtotal = product.subtotal;
            }

            const itemQuery = `
                INSERT INTO OrderItems (${itemInsertColumns.join(', ')})
                VALUES (${itemInsertValues.join(', ')})
            `;

            const itemReq = request;
            for (const [key, value] of Object.entries(itemParams)) {
                if (key === 'order_id' || key === 'product_id' || key === 'quantity') {
                    itemReq.input(key, sql.Int, value);
                } else if (key === 'price' || key === 'product_price' || key === 'subtotal') {
                    itemReq.input(key, sql.Decimal(10,2), value);
                } else {
                    itemReq.input(key, sql.NVarChar, value);
                }
            }

            await itemReq.query(itemQuery);
            console.log(`✅ Order item inserted for product: ${product.name} (ID: ${product.id})`);
        }

        await transaction.commit();
        console.log('✅ Order transaction committed successfully');
        
        return { 
            id: newOrderId, 
            order_number: orderData.order_number,
            ...orderData, 
            product_details: orderItems 
        };

    } catch (error) {
        await transaction.rollback();
        console.error('❌ Create order transaction error:', error);
        throw error;
    }
}