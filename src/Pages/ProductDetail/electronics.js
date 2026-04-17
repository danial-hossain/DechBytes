// src/Pages/ProductDetail/electronics.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import "./style.css";

const Electronics = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { userInfo } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`http://localhost:5001/api/products/${id}`);
        const data = await res.json();
        
        if (!res.ok || !data.success) {
          throw new Error(data.message || "Product not found");
        }

        const productData = {
          ...data.data,
          availability: data.data.availability === true || data.data.availability === 1 ? 1 : 0,
          original_price: data.data.original_price || data.data.price,
          has_discount: data.data.has_discount === true || data.data.has_discount === 1,
          discount_percent: data.data.discount_percent || 0,
          discounted_price: data.data.discounted_price || data.data.price,
          discount_end_date: data.data.discount_end_date
        };

        setProduct(productData);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const addToCart = async () => {
    if (!userInfo) {
      alert("❌ Please login to add items to cart");
      navigate("/login");
      return;
    }

    if (!product) return;

    if (product.availability === 0) {
      alert("❌ This product is currently out of stock");
      return;
    }

    try {
      const res = await fetch("http://localhost:5001/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          productId: product.id,
          quantity: quantity,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert("✅ Added to cart!");
      } else {
        alert(`❌ Failed: ${data.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Error adding to cart:", err);
      alert("❌ Something went wrong");
    }
  };

  const formatDiscountEndDate = (endDate) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const today = new Date();
    const daysLeft = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) return "❌ Expired";
    if (daysLeft === 0) return "🔥 Last day!";
    if (daysLeft === 1) return "⏰ Ends tomorrow!";
    if (daysLeft <= 7) return `⚠️ Ends in ${daysLeft} days`;
    return `📅 Valid until ${end.toLocaleDateString()}`;
  };

  if (loading) return <p className="loading">Loading product...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!product) return <p>Product not found!</p>;

  const hasDiscount = product.has_discount;
  const originalPrice = parseFloat(product.original_price).toFixed(2);
  const finalPrice = hasDiscount ? parseFloat(product.discounted_price).toFixed(2) : parseFloat(product.price).toFixed(2);
  const discountPercent = product.discount_percent || 0;
  const savedAmount = (originalPrice - finalPrice).toFixed(2);
  const endDateMsg = formatDiscountEndDate(product.discount_end_date);

  return (
    <div className="product-detail-container">
      <div className="product-image">
        {hasDiscount && (
          <div className="detail-discount-badge">-{discountPercent}% OFF</div>
        )}
        <img 
          src={product.photo} 
          alt={product.name}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/500x500?text=No+Image';
          }}
        />
      </div>
      <div className="product-info">
        <h2>{product.name}</h2>
        
        <div className="price-section-detail">
          {hasDiscount ? (
            <>
              <span className="original-price-detail">${originalPrice}</span>
              <span className="discounted-price-detail">${finalPrice}</span>
            </>
          ) : (
            <span className="regular-price-detail">${finalPrice}</span>
          )}
        </div>

        {hasDiscount && (
          <>
            <p className="saved-amount-detail">💰 Save: ${savedAmount}</p>
            {endDateMsg && (
              <p className="discount-end-date-detail">{endDateMsg}</p>
            )}
          </>
        )}

        <p className="details">{product.details}</p>
        
        <p className={`availability ${product.availability === 0 ? 'out-of-stock' : 'in-stock'}`}>
          Status: {product.availability === 0 ? 'Out of Stock' : 'In Stock'}
        </p>

        <div className="quantity-section">
          <button 
            className="qty-btn"
            onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
            disabled={product.availability === 0}
          >
            -
          </button>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
            className="qty-input"
            disabled={product.availability === 0}
          />
          <button 
            className="qty-btn"
            onClick={() => setQuantity(prev => prev + 1)}
            disabled={product.availability === 0}
          >
            +
          </button>
        </div>

        <button 
          className={`add-to-cart-btn ${product.availability === 0 ? 'disabled' : ''}`}
          onClick={addToCart}
          disabled={product.availability === 0}
        >
          {product.availability === 0 ? 'Out of Stock' : `Add to Cart (${quantity} item${quantity > 1 ? 's' : ''})`}
        </button>
      </div>
    </div>
  );
};

export default Electronics;