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

      {/* ==== Featured Section ==== */}
      <section className="featured-section">
        <div className="container">
          <div className="featured-header">
            <h2 className="featured-title">Featured Products</h2>
            <p className="featured-subtitle">
              Check & Get Your Desired Product!
            </p>
          </div>

          <div className="featured-products-box">
          {products.map((p) => (
  <div key={p.id} className="product-card">
    <img src={p.photo} alt={p.name} />
    <h3>{p.name}</h3>
    <p className="product-price">৳{p.price}</p>
    <p>{p.details}</p>
  </div>
))}
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
