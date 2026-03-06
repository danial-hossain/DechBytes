import React from "react";
import { useSearchParams, Link } from "react-router-dom";
import "./style.css";

const OrderCancel = () => {
  const [searchParams] = useSearchParams();
  const tran_id = searchParams.get("tran_id");

  return (
    <div className="order-cancel">
      <div className="cancel-icon">⚠️</div>
      <h1>Payment Cancelled</h1>
      <p>You have cancelled the payment. Your cart items are still saved.</p>
      
      {tran_id && (
        <p><small>Transaction ID: {tran_id}</small></p>
      )}

      <div className="action-buttons">
        <Link to="/cart" className="btn">Back to Cart</Link>
        <Link to="/checkout" className="btn">Try Again</Link>
      </div>
    </div>
  );
};

export default OrderCancel;