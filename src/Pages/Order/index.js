import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import "./style.css";

const Order = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { userInfo } = useAuth();

  const cart = state?.cart || [];
  const total = state?.total || 0;

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "Bangladesh"
  });

  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState("");

  // Prefill form if user is logged in
  useEffect(() => {
    if (userInfo) {
      const primaryAddress = userInfo.address_details?.[0] || {};
      setForm({
        name: userInfo.name || "",
        email: userInfo.email || "",
        phone: userInfo.mobile || "",
        address: primaryAddress.address_line || "",
        city: primaryAddress.city || "",
        state: primaryAddress.state || "",
        pincode: primaryAddress.pincode || "",
        country: primaryAddress.country || "Bangladesh"
      });
    }
  }, [userInfo]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Cash on Delivery
  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5001/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          products: cart.map((item) => ({
            id: item.product.id,
            name: item.product.name,
            image: item.product.photo,
            quantity: item.quantity,
            price: item.product.price,
          })),
          delivery_address: form,
          subTotalAmt: total,
          totalAmt: total,
          payment_method: "cod"
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Order failed");
      }

      alert("✅ Order placed successfully!");
      navigate("/profile/orders");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // SSLCommerz Payment
  const handleSSLCommerzPayment = async () => {
    if (!validateForm()) return;

    setPaymentLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5001/api/payment/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          total_amount: total,
          products: cart.map((item) => ({
            id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
            categoryName: item.product.categoryName || "General"
          })),
          shipping_address: form
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Payment initiation failed");
      }

      // Redirect to SSLCommerz payment page
      window.location.href = data.gatewayUrl;
      
    } catch (err) {
      setError(err.message);
    } finally {
      setPaymentLoading(false);
    }
  };

  const validateForm = () => {
    if (!form.name || !form.email || !form.phone || !form.address || !form.city) {
      setError("Please fill all required fields");
      return false;
    }

    if (!cart.length) {
      setError("Your cart is empty");
      return false;
    }

    return true;
  };

  if (!userInfo) {
    return <p className="error">Please log in to place an order.</p>;
  }

  return (
    <section className="order-page">
      <h2>Order Summary</h2>
      <div className="order-summary">
        {cart.map((item, idx) => (
          <div key={idx} className="order-item">
            <span>{item.product.name} (x{item.quantity})</span>
            <span>${(item.product.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="order-total">
          <strong>Total: ${total.toFixed(2)}</strong>
        </div>
      </div>

      <h3>Shipping Information</h3>
      <div className="order-form">
        <input 
          type="text" 
          name="name" 
          placeholder="Full Name *" 
          value={form.name} 
          onChange={handleChange} 
          required 
        />
        <input 
          type="email" 
          name="email" 
          placeholder="Email *" 
          value={form.email} 
          onChange={handleChange} 
          required 
        />
        <input 
          type="text" 
          name="phone" 
          placeholder="Phone Number *" 
          value={form.phone} 
          onChange={handleChange} 
          required 
        />
        <input 
          type="text" 
          name="address" 
          placeholder="Shipping Address *" 
          value={form.address} 
          onChange={handleChange} 
          required 
        />
        <input 
          type="text" 
          name="city" 
          placeholder="City *" 
          value={form.city} 
          onChange={handleChange} 
          required 
        />
        <input 
          type="text" 
          name="state" 
          placeholder="State" 
          value={form.state} 
          onChange={handleChange} 
        />
        <input 
          type="text" 
          name="pincode" 
          placeholder="Postal Code" 
          value={form.pincode} 
          onChange={handleChange} 
        />
        <input 
          type="text" 
          name="country" 
          placeholder="Country" 
          value={form.country} 
          onChange={handleChange} 
        />

        {error && <p className="error">{error}</p>}
        
        <div className="payment-buttons">
          <button 
            onClick={handlePlaceOrder} 
            disabled={loading || paymentLoading}
            className="cod-btn"
          >
            {loading ? "Placing Order..." : "Cash on Delivery"}
          </button>
          
          <button 
            onClick={handleSSLCommerzPayment} 
            disabled={loading || paymentLoading}
            className="sslcommerz-btn"
          >
            {paymentLoading ? "Redirecting..." : "Pay with SSLCommerz"}
          </button>
        </div>
      </div>
    </section>
  );
};

export default Order;