import { 
    addCartProduct, 
    getCartProductsByUserId, 
    updateCartProductQuantity, 
    deleteCartProductById,
    getCartWithProductDetails,
    getCartItemByUserAndProduct,
    getCartProductById
} from '../utils/cart.db.js';
import { getProductById } from '../utils/product.db.js';

// ============================================
// ADD PRODUCT TO CART (with availability check)
// ============================================
export async function addProductToCart(req, res) {
    try {
        const { productId, quantity } = req.body;
        const userId = req.userId;

        if (!userId || !productId || !quantity) {
            return res.status(400).json({
                success: false,
                message: "productId and quantity required",
            });
        }

        const parsedProductId = parseInt(productId);
        if (isNaN(parsedProductId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }

        // Check if product exists and is available
        const product = await getProductById(parsedProductId);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        // ✅ Normalize availability to number and check
        const isAvailable = product.availability === true || product.availability === 1;
        
        if (!isAvailable) {
            return res.status(400).json({
                success: false,
                message: "Product is currently out of stock",
            });
        }

        // Check if product exists in cart
        const existingItem = await getCartItemByUserAndProduct(userId, parsedProductId);

        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;
            await updateCartProductQuantity(existingItem.id, newQuantity);
            
            return res.json({ 
                success: true, 
                message: "Cart updated",
                cartItem: { id: existingItem.id, quantity: newQuantity }
            });
        }

        // Add new item
        const result = await addCartProduct({ 
            userId, 
            productId: parsedProductId, 
            quantity 
        });

        res.json({ 
            success: true, 
            message: "Product added to cart",
            cartItem: { id: result.id, quantity }
        });

    } catch (error) {
        console.error("Add to cart error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
}

// ============================================
// GET USER CART (with availability check)
// ============================================
export async function getUserCart(req, res) {
    try {
        const userId = req.userId;
        const cartItems = await getCartWithProductDetails(userId);
        
        // Format for frontend and filter out unavailable products
        const formattedCart = cartItems
            .filter(item => {
                // ✅ Normalize availability check
                const isAvailable = item.product_availability === true || item.product_availability === 1;
                return isAvailable;
            })
            .map(item => ({
                _id: item.cart_id,
                productId: item.productId,
                quantity: item.quantity,
                userId: item.userId,
                product: {
                    id: item.product_id,
                    name: item.product_name,
                    price: item.product_price,
                    photo: item.product_photo,
                    details: item.product_details,
                    availability: item.product_availability === true || item.product_availability === 1 ? 1 : 0
                }
            }));

        res.json({ success: true, cart: formattedCart });
    } catch (error) {
        console.error("Fetch cart error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
}

// ============================================
// UPDATE CART ITEM QUANTITY
// ============================================
export async function updateCartItemQuantity(req, res) {
    try {
        const { itemId } = req.params;
        const { quantity } = req.body;
        const userId = req.userId;

        if (!quantity || quantity < 1) {
            return res.status(400).json({ 
                success: false, 
                message: "Quantity must be >= 1" 
            });
        }

        const parsedItemId = parseInt(itemId);
        if (isNaN(parsedItemId)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid item ID" 
            });
        }

        const cartItem = await getCartProductById(parsedItemId);

        if (!cartItem || cartItem.userId !== userId) {
            return res.status(404).json({ 
                success: false, 
                message: "Cart item not found" 
            });
        }

        await updateCartProductQuantity(parsedItemId, quantity);
        res.json({ success: true, message: "Cart updated" });

    } catch (error) {
        console.error("Update cart error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
}

// ============================================
// DELETE CART ITEM
// ============================================
export async function deleteCartItem(req, res) {
    try {
        const { itemId } = req.params;
        const userId = req.userId;

        const parsedItemId = parseInt(itemId);
        if (isNaN(parsedItemId)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid item ID" 
            });
        }

        const cartItem = await getCartProductById(parsedItemId);

        if (!cartItem || cartItem.userId !== userId) {
            return res.status(404).json({ 
                success: false, 
                message: "Cart item not found" 
            });
        }

        await deleteCartProductById(parsedItemId);
        res.json({ success: true, message: "Item removed" });

    } catch (error) {
        console.error("Delete cart error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
}