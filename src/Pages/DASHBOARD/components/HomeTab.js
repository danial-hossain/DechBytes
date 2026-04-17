import React from "react";

const HomeTab = ({ stats, userInfo }) => {
  if (!stats) return <p>Loading stats...</p>;

  return (
    <div>
      <h1>Welcome Admin</h1>

      <section className="dashboard-cards">
        <div className="card">
          <h3>Users</h3>
          <p>{stats.userCount}</p>
        </div>

        <div className="card">
          <h3>Products</h3>
          <p>{stats.productCount}</p>
        </div>

        <div className="card">
          <h3>Orders</h3>
          <p>{stats.orderCount}</p>
        </div>

        <div className="card">
          <h3>Reports</h3>
          <p>{stats.reportCount}</p>
        </div>

        <div className="card">
          <h3>Helps</h3>
          <p>{stats.helpCount}</p>
        </div>
      </section>
    </div>
  );
};

export default HomeTab;