import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import "./style.css";

const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const tran_id = searchParams.get("tran_id");
  const error = searchParams.get("error");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`http://localhost:5001/api/payment/order/${tran_id}`, {
          credentials: "include"
        });
        const data = await res.json();
        if (data.success) {
          setOrder(data.data);
        }
      } catch (err) {
        console.error("Error fetching order:", err);
      } finally {
        setLoading(false);
      }
    };

    if (tran_id) {
      fetchOrder();
    }
  }, [tran_id]);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="order-success">
      <div className="success-icon">✅</div>
      <h1>Payment Successful!</h1>
      <p>Your order has been placed successfully.</p>
      
      {error && (
        <div className="warning-message">
          <p>Note: {error}</p>
        </div>
      )}
      
      {order && (
        <div className="order-details">
          <h3>Order Details</h3>
          <p><strong>Order ID:</strong> {order.order_number || order.orderId}</p>
          <p><strong>Total Amount:</strong> ${order.total}</p>
          <p><strong>Payment Status:</strong> 
            <span className={order.payment_status === 'completed' ? 'status-completed' : 'status-pending'}>
              {order.payment_status}
            </span>
          </p>
        </div>
      )}

      <div className="action-buttons">
        <Link to="/profile/orders" className="btn">View Orders</Link>
        <Link to="/" className="btn">Continue Shopping</Link>
      </div>
    </div>
  );
};

export default OrderSuccess;