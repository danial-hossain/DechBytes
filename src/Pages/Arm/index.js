import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import "./style.css";

const ArmList = () => {
  const [arms, setArms] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userInfo } = useAuth();
  const navigate = useNavigate();

  const addToCart = async (productId) => {
    if (!userInfo) {
      alert("❌ You must be logged in to add items to cart!");
      navigate("/login");
      return;
    }

    try {
      const res = await fetch("http://localhost:5001/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert("✅ Added to cart!");
      } else {
        alert(`❌ Failed: ${data.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("❌ Error adding to cart.");
    }
  };

  useEffect(() => {
    const fetchArms = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:5001/api/categories/Arms/products");
        const data = await res.json();

        console.log("API Response:", data);

        if (data.success && data.products) {
          setArms(data.products);
        } else {
          setArms([]);
        }
      } catch (error) {
        console.error("Error fetching arm products:", error);
        setArms([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArms();
  }, []);

  if (loading) return <p className="loading">Loading products...</p>;

  return (
    <div className="arm-container">
      <h2 className="arm-title">Arm Prosthetics</h2>

      {arms.length === 0 ? (
        <p className="no-products">No products available.</p>
      ) : (
        <div className="arm-grid">
          {arms.map((product) => {
            const hasDiscount = product.has_discount === true || product.has_discount === 1;
            const originalPrice = parseFloat(product.original_price || product.price).toFixed(2);
            const finalPrice = hasDiscount
              ? (product.original_price - (product.original_price * product.discount_percent / 100)).toFixed(2)
              : originalPrice;

            return (
              <div key={product.id} className="arm-card">
                {hasDiscount && (
                  <div className="discount-badge">
                    -{product.discount_percent}% OFF
                  </div>
                )}

                <img
                  src={product.photo}
                  alt={product.name}
                  className="arm-image"
                  onError={(e) => {
                    e.target.src = "https://placehold.co/600x400/1e3a8a/white?text=No+Image";
                  }}
                />

                <h3
                  className="arm-name"
                  style={{ cursor: "pointer", color: "#007bff" }}
                  onClick={() => navigate(`/product/arms/${product.id}`)}
                >
                  {product.name}
                </h3>

                <div className="price-section">
                  {hasDiscount ? (
                    <>
                      <span className="original-price">${originalPrice}</span>
                      <span className="discounted-price">${finalPrice}</span>
                    </>
                  ) : (
                    <span className="regular-price">${finalPrice}</span>
                  )}
                </div>

                {hasDiscount && (
                  <p className="saved-amount">
                    💰 Save: ${(originalPrice - finalPrice).toFixed(2)}
                  </p>
                )}

                <p className="arm-details">{product.details?.substring(0, 80)}...</p>

                <button className="arm-btn" onClick={() => addToCart(product.id)}>
                  Add to Cart
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ArmList;