// DASHBOARD/index.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import useDashboard from "./hooks/useDashboard";
import MessagingPage from "../Messaging";
import AdvertisementsTab from "./components/AdvertisementsTab";
import BannersTab from "./components/BannersTab";
import DiscountsTab from "./components/DiscountsTab";
import ReportsTab from "./components/ReportsTab";
import HelpsTab from "./components/HelpsTab";
import "./style.css";

const Dashboard = ({ initialTab = "home" }) => {
  const { userInfo } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(initialTab);

  const {
    stats, users, products, orders, reports, helps, discounts,
    loading, message, setMessage,
    categoryName, setCategoryName,
    name, setName,
    price, setPrice,
    details, setDetails,
    photo, uploading, preview,
    selectedProductId, setSelectedProductId,
    discountPercent, setDiscountPercent,
    discountEndDate, setDiscountEndDate,
    fetchStats, fetchUsers, fetchProducts,
    fetchOrders, fetchReports, fetchHelps, fetchDiscounts,
    handleImageUpload, handleAddProduct,
    handleAvailabilityChange, handleDeleteProduct,
    handleAddDiscount, handleRemoveDiscount,
  } = useDashboard();

  useEffect(() => {
    if (!userInfo || userInfo.role !== "ADMIN") {
      navigate("/login");
      return;
    }
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo, navigate]);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setMessage({ text: "", type: "" });
    if (tab === "users") fetchUsers();
    if (tab === "products") fetchProducts();
    if (tab === "reports") fetchReports();
    if (tab === "helps") fetchHelps();
    if (tab === "orders") fetchOrders();
    if (tab === "discounts") {
      fetchDiscounts();
      fetchProducts();
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/dashboard/logout", {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        setMessage({ text: "Logged out successfully ✅", type: "success" });
        setTimeout(() => navigate("/login"), 1000);
      } else {
        const data = await res.json();
        setMessage({ text: data.message || "Logout failed ❌", type: "error" });
      }
    } catch {
      setMessage({ text: "Logout failed ❌", type: "error" });
    }
  };

  if (!stats) return <p className="loading">Loading dashboard...</p>;

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <h2 className="sidebar-title">Admin Panel</h2>
        <ul className="sidebar-menu">
          <li className={activeTab === "home" ? "active" : ""} onClick={() => handleTabClick("home")}>🏠 Dashboard</li>
          <li className={activeTab === "users" ? "active" : ""} onClick={() => handleTabClick("users")}>👥 Users</li>
          <li className={activeTab === "messages" ? "active" : ""} onClick={() => handleTabClick("messages")}>💬 Messages</li>
          <li className={activeTab === "banners" ? "active" : ""} onClick={() => handleTabClick("banners")}>🎯 Banners</li>
          <li className={activeTab === "products" ? "active" : ""} onClick={() => handleTabClick("products")}>📦 Products</li>
          <li className={activeTab === "addProduct" ? "active" : ""} onClick={() => handleTabClick("addProduct")}>➕ Add Product</li>
          <li className={activeTab === "discounts" ? "active" : ""} onClick={() => handleTabClick("discounts")}>🏷️ Discounts</li>
          <li className={activeTab === "orders" ? "active" : ""} onClick={() => handleTabClick("orders")}>🛒 Orders</li>
          <li className={activeTab === "reports" ? "active" : ""} onClick={() => handleTabClick("reports")}>📊 Reports</li>
          <li className={activeTab === "helps" ? "active" : ""} onClick={() => handleTabClick("helps")}>❓ Help</li>
          <li className={activeTab === "advertisements" ? "active" : ""} onClick={() => handleTabClick("advertisements")}>📢 Advertisements</li>
          <li onClick={handleLogout}>🚪 Logout</li>
        </ul>
      </aside>

      <main className="dashboard-main">
        {message.text && (
          <div className={`message ${message.type}`}>{message.text}</div>
        )}

        {loading && <div className="loading-spinner">Loading...</div>}

        {/* Home Tab */}
        {activeTab === "home" && !loading && (
          <>
            <h1>Welcome, {userInfo.name}</h1>
            <section className="dashboard-cards">
              <div className="card"><h3>Users</h3><p className="card-number">{stats.userCount}</p></div>
              <div className="card"><h3>Products</h3><p className="card-number">{stats.productCount}</p></div>
              <div className="card"><h3>Orders</h3><p className="card-number">{stats.orderCount}</p></div>
              <div className="card"><h3>Reports</h3><p className="card-number">{stats.reportCount}</p></div>
              <div className="card"><h3>Help Requests</h3><p className="card-number">{stats.helpCount}</p></div>
            </section>
          </>
        )}

        {/* Users Tab */}
        {activeTab === "users" && !loading && (
          <div className="table-container">
            <h2>All Users</h2>
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ? users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>{user.status}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4">No users found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === "messages" && !loading && (
          <MessagingPage mode="admin" embedded />
        )}

        {/* Banners Tab */}
        {activeTab === "banners" && !loading && (
          <BannersTab />
        )}

        {/* Products Tab */}
        {activeTab === "products" && !loading && (
          <div className="table-container">
            <h2>All Products</h2>
            <div className="products-header">
              <button className="refresh-btn" onClick={fetchProducts}>🔄 Refresh</button>
            </div>
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Name</th>
                    <th>Original Price</th>
                    <th>Discount</th>
                    <th>Final Price</th>
                    <th>Photo</th>
                    <th>Details</th>
                    <th>Availability</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length > 0 ? products.map((p) => {
                    const availability = p.availability === true || p.availability === 1 ? 1 : 0;
                    const hasDiscount = p.has_discount || (p.discount_percent && p.discount_percent > 0);
                    const originalPrice = parseFloat(p.original_price || p.price).toFixed(2);
                    const finalPrice = hasDiscount ? parseFloat(p.final_price || p.price).toFixed(2) : null;

                    return (
                      <tr key={p.id}>
                        <td>{p.categoryName || p.category || "N/A"}</td>
                        <td><strong>{p.name}</strong></td>
                        <td className={hasDiscount ? "strikethrough" : ""}>${originalPrice}</td>
                        <td>
                          {hasDiscount
                            ? <span className="discount-badge-table">-{p.discount_percent}% OFF</span>
                            : <span className="no-discount">No discount</span>}
                        </td>
                        <td className="discount-price">
                          {hasDiscount ? <strong>${finalPrice}</strong> : <span className="text-muted">-</span>}
                        </td>
                        <td><img src={p.photo} alt={p.name} className="product-thumbnail" /></td>
                        <td><div className="details-preview">{p.details?.substring(0, 50)}...</div></td>
                        <td>
                          <select
                            value={availability}
                            onChange={(e) => handleAvailabilityChange(p.id, e.target.value)}
                            className={`availability-select ${availability === 0 ? "out-of-stock" : "in-stock"}`}
                          >
                            <option value={1}>✅ In Stock</option>
                            <option value={0}>❌ Out of Stock</option>
                          </select>
                        </td>
                        <td>
                          <button onClick={() => handleDeleteProduct(p.id)} className="delete-btn">
                            🗑️ Delete
                          </button>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan="9" style={{ textAlign: "center" }}>No products found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add Product Tab */}
        {activeTab === "addProduct" && (
          <div className="add-product-form">
            <h2>Add New Product</h2>
            <form onSubmit={handleAddProduct}>
              <div className="form-group">
                <label>Category:</label>
                <select value={categoryName} onChange={(e) => setCategoryName(e.target.value)}>
                  <option value="Arms">Arms</option>
                  <option value="Legs">Legs</option>
                  <option value="Laptops">Laptops</option>
                  <option value="Desktops">Desktops</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Featured">Featured</option>
                </select>
              </div>
              <div className="form-group">
                <input type="text" placeholder="Product Name" value={name}
                  onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="form-group">
                <input type="number" placeholder="Price" value={price}
                  onChange={(e) => setPrice(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Product Photo:</label>
                <input type="file" accept="image/*" onChange={handleImageUpload}
                  disabled={uploading} required={!photo} />
                {uploading && <p className="uploading-text">⏳ Uploading...</p>}
                {preview && <img src={preview} alt="Preview" className="image-preview" />}
              </div>
              <div className="form-group">
                <textarea placeholder="Product Details" value={details}
                  onChange={(e) => setDetails(e.target.value)} required rows="4" />
              </div>
              <button type="submit" disabled={loading || uploading || !photo}>
                {loading ? "Adding..." : "Add Product"}
              </button>
            </form>
          </div>
        )}

        {/* Discounts Tab */}
        {activeTab === "discounts" && !loading && (
          <DiscountsTab 
            discounts={discounts}
            products={products}
            onAddDiscount={handleAddDiscount}
            onRemoveDiscount={handleRemoveDiscount}
          />
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && !loading && (
          <div className="table-container">
            <h2>All Orders</h2>
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>User ID</th>
                    <th>Products</th>
                    <th>Total</th>
                    <th>Payment Status</th>
                    <th>Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length > 0 ? orders.map((order) => (
                    <tr key={order.id}>
                      <td>{order.order_number || order.orderId}</td>
                      <td>{order.userId}</td>
                      <td>
                        {order.items && Array.isArray(order.items)
                          ? order.items.map((item, i) => (
                              <div key={i}>{item.product_name} × {item.quantity}</div>
                            ))
                          : <span>No items</span>}
                      </td>
                      <td>${parseFloat(order.total || order.totalAmt).toFixed(2)}</td>
                      <td>
                        <span className={`status-badge ${order.payment_status}`}>
                          {order.payment_status}
                        </span>
                      </td>
                      <td>{order.created_at ? new Date(order.created_at).toLocaleString() : "N/A"}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="6">No orders found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Reports Tab - with Reply Feature */}
        {activeTab === "reports" && !loading && (
          <ReportsTab 
            reports={reports} 
            onRefresh={() => {
              fetchReports();
            }}
          />
        )}

        {/* Helps Tab - with Reply Feature */}
        {activeTab === "helps" && !loading && (
          <HelpsTab 
            helps={helps} 
            onRefresh={() => {
              fetchHelps();
            }}
          />
        )}

        {/* Advertisements Tab */}
        {activeTab === "advertisements" && !loading && (
          <AdvertisementsTab />
        )}
      </main>
    </div>
  );
};

export default Dashboard;