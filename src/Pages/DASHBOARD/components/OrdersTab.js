import React from "react";

const OrdersTab = ({ orders = [] }) => {
  return (
    <div>
      <h2>Orders</h2>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>User</th>
            <th>Total</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {orders.length > 0 ? (
            orders.map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.userId}</td>
                <td>${o.total}</td>
                <td>{o.payment_status}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">No orders</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default OrdersTab;