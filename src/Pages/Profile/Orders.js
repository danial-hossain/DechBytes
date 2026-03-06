import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import "./style.css";

const ProfileOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { userInfo } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!userInfo) {
      navigate("/login");
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await fetch("http://localhost:5001/api/order/user", {
          credentials: "include"
        });
        const data = await res.json();

        if (data.success) {
          setOrders(data.orders || []);
        } else {
          setError(data.message || "Failed to fetch orders");
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userInfo, navigate]);

  const getStatusClass = (status) => {
    switch(status) {
      case 'completed': return 'status-completed';
      case 'processing': return 'status-processing';
      case 'pending_payment': return 'status-pending';
      default: return 'status-default';
    }
  };

  if (loading) return <div className="loading">Loading orders...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="profile-orders">
      <h2>My Orders</h2>
      
      {orders.length === 0 ? (
        <div className="no-orders">
          <p>You haven't placed any orders yet.</p>
          <button onClick={() => navigate("/")}>Start Shopping</button>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <span className="order-id">Order #{order.order_number || order.orderId}</span>
                <span className={`order-status ${getStatusClass(order.order_status)}`}>
                  {order.order_status}
                </span>
              </div>
              
              <div className="order-date">
                {new Date(order.created_at).toLocaleDateString()}
              </div>
              
              <div className="order-items">
                {order.items && JSON.parse(order.items).map((item, idx) => (
                  <div key={idx} className="order-item">
                    <span>{item.product_name} x{item.quantity}</span>
                    <span>${item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              
              <div className="order-footer">
                <span className="order-total">Total: ${order.total}</span>
                <span className={`payment-status ${order.payment_status}`}>
                  Payment: {order.payment_status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfileOrders;