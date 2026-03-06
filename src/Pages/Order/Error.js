import React from "react";
import { useSearchParams, Link } from "react-router-dom";
import "./style.css";

const OrderError = () => {
  const [searchParams] = useSearchParams();
  const message = searchParams.get("message") || "An unexpected error occurred";
  const tran_id = searchParams.get("tran_id");

  return (
    <div className="order-error">
      <div className="error-icon">⚠️</div>
      <h1>Something Went Wrong</h1>
      <p>{message}</p>
      
      {tran_id && (
        <p><small>Transaction ID: {tran_id}</small></p>
      )}

      <div className="action-buttons">
        <Link to="/cart" className="btn">Back to Cart</Link>
        <Link to="/" className="btn">Go Home</Link>
      </div>
    </div>
  );
};

export default OrderError;