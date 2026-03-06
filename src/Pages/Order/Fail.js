import React from "react";
import { useSearchParams, Link } from "react-router-dom";
import "./style.css";

const OrderFail = () => {
  const [searchParams] = useSearchParams();
  const tran_id = searchParams.get("tran_id");

  return (
    <div className="order-fail">
      <div className="fail-icon">❌</div>
      <h1>Payment Failed</h1>
      <p>Your payment was not successful. Please try again.</p>
      
      {tran_id && (
        <p><small>Transaction ID: {tran_id}</small></p>
      )}

      <div className="action-buttons">
        <Link to="/cart" className="btn">Back to Cart</Link>
        <Link to="/" className="btn">Continue Shopping</Link>
      </div>
    </div>
  );
};

export default OrderFail;