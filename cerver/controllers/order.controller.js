import { createOrder as createOrderDb, findUserOrders } from "../utils/order.db.js";
import { deleteCartProductsByUserId } from "../utils/cart.db.js";
import { v4 as uuidv4 } from "uuid";

export const createOrder = async (req, res) => {
  try {
    const { products, delivery_address, subTotalAmt, totalAmt, payment_method } = req.body;
    const userId = req.userId;

    // Validation
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: "User ID is required" 
      });
    }

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Products are required" 
      });
    }

    // ✅ Validate each product has an ID
    for (const product of products) {
      if (!product.id) {
        return res.status(400).json({
          success: false,
          message: `Product ${product.name} has no ID`
        });
      }
    }

    if (!delivery_address || !delivery_address.name || !delivery_address.email || !delivery_address.phone || !delivery_address.address) {
      return res.status(400).json({
        success: false,
        message: "Complete delivery address is required",
      });
    }

    // Generate unique order ID
    const orderId = `ORD-${Date.now()}-${uuidv4().substring(0, 8)}`;

    // Determine payment and order status based on payment method
    const paymentStatus = payment_method === 'cod' ? 'pending' : 'pending';
    const orderStatus = payment_method === 'cod' ? 'processing' : 'pending_payment';

    console.log('Creating order with:', {
      userId,
      orderId,
      order_number: orderId,
      payment_method,
      paymentStatus,
      orderStatus,
      products: products.map(p => ({ id: p.id, name: p.name }))
    });

    // Create order in database
    const newOrder = await createOrderDb({
      userId,
      orderId: orderId,
      order_number: orderId,
      payment_status: paymentStatus,
      order_status: orderStatus,
      delivery_address,
      subTotalAmt,
      totalAmt,
      payment_method: payment_method || 'cod'
    }, products);

    // Clear cart for COD orders
    if (payment_method === 'cod') {
      await deleteCartProductsByUserId(userId);
      console.log('Cart cleared for COD order');
    }

    res.status(201).json({
      success: true,
      message: payment_method === 'cod' ? "Order placed successfully" : "Order created, proceed to payment",
      data: {
        orderId: newOrder.order_number,
        total: totalAmt,
        status: orderStatus,
        payment_status: paymentStatus
      },
    });

  } catch (err) {
    console.error("❌ Error creating order:", err);
    res.status(500).json({ 
      success: false, 
      message: err.message || "Server error" 
    });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: "User ID is required" 
      });
    }

    const userOrders = await findUserOrders(userId);

    res.status(200).json({
      success: true,
      orders: userOrders,
    });

  } catch (err) {
    console.error("❌ Error fetching user orders:", err);
    res.status(500).json({ 
      success: false, 
      message: err.message || "Server error" 
    });
  }
};