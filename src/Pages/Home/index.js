import React, { useEffect, useState } from 'react';
import HomeSlider from '../../components/HomeSlider';
import { LiaShippingFastSolid } from "react-icons/lia";
import './style.css';
import AdsBannerSlider from '../../components/AdsBannerSlider';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch("http://localhost:5001/api/home");
        const data = await res.json();
        console.log("Discounted products:", data);
        setProducts(data);
      } catch (err) {
        console.error("Error fetching featured products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  if (loading) {
    return <p className="loading">Loading...</p>;
  }

  return (
    <div>
      {/* ==== Home Slider ==== */}
      <HomeSlider />

      {/* ==== Featured Section (Discounted Products) ==== */}
      <section className="featured-section">
        <div className="container">
          <div className="featured-header">
            <h2 className="featured-title">🔥 Special Offers</h2>
            <p className="featured-subtitle">
              Get up to 50% off on selected items!
            </p>
          </div>

          <div className="featured-products-box">
            {products.length === 0 ? (
              <p className="no-products">No discounted products available.</p>
            ) : (
              products.map((p) => {
                const hasDiscount = p.has_discount === true || p.has_discount === 1;
                const originalPrice = parseFloat(p.original_price || p.price).toFixed(2);
                const finalPrice = parseFloat(p.price).toFixed(2);
                const discountPercent = p.discount_percent || 0;
                const savedAmount = (originalPrice - finalPrice).toFixed(2);

                return (
                  <div key={p.id} className="product-card">
                    {/* Discount Badge */}
                    {hasDiscount && (
                      <div className="home-discount-badge">
                        -{discountPercent}% OFF
                      </div>
                    )}

                    <img 
                      src={p.photo} 
                      alt={p.name} 
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                      }}
                    />
                    
                    <h3>{p.name}</h3>
                    
                    {/* Price with Discount */}
                    <div className="home-price-section">
                      {hasDiscount ? (
                        <>
                          <span className="home-original-price">৳{originalPrice}</span>
                          <span className="home-discounted-price">৳{finalPrice}</span>
                        </>
                      ) : (
                        <span className="home-regular-price">৳{finalPrice}</span>
                      )}
                    </div>
                    
                    {/* Save Amount */}
                    {hasDiscount && (
                      <p className="home-saved-amount">
                        💰 Save: ৳{savedAmount}
                      </p>
                    )}
                    
                    <p className="product-details">{p.details?.substring(0, 80)}...</p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* ==== Shipping Section ==== */}
      <section className="shipping-section">
        <div className="container">
          <div className="free-shipping">
            <div className="shipping-col1">
              <LiaShippingFastSolid className="shipping-icon" />
              <span className="shipping-title">Free Shipping</span>
            </div>
            <div className="shipping-col2">
              <p className="shipping-text">Free Shipping on Special Items</p>
            </div>
            <p className="shipping-price">Order Now</p>
          </div>

          <AdsBannerSlider items={4} />
        </div>
      </section>
    </div>
  );
};

export default Home;