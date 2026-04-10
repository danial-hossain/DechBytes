import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import MessagingPage from "../Messaging";
import "./style.css";

const Dashboard = ({ initialTab = "home" }) => {
  const { userInfo } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [reports, setReports] = useState([]);
  const [helps, setHelps] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  // Add product states
  const [categoryName, setCategoryName] = useState("Arms");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [photo, setPhoto] = useState("");
  const [details, setDetails] = useState("");

  useEffect(() => {
    if (!userInfo || userInfo.role !== "ADMIN") {
      navigate("/login");
      return;
    }

    const fetchStats = async () => {
      try {
        const res = await fetch("http://localhost:5001/api/dashboard", {
          credentials: "include",
        });
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchStats();
  }, [userInfo, navigate]);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5001/api/dashboard/users", {
        credentials: "include",
      });
      const data = await res.json();
      setUsers(data.users || []);
      setMessage({ text: "", type: "" });
    } catch (err) {
      console.error(err);
      setMessage({ text: "Failed to fetch users", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5001/api/dashboard/products", {
        credentials: "include",
      });
      const data = await res.json();
      console.log("Products data with availability:", data.products);
      setProducts(data.products || []);
      setMessage({ text: "", type: "" });
    } catch (err) {
      console.error(err);
      setMessage({ text: "Failed to fetch products", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5001/api/dashboard/reports", {
        credentials: "include",
      });
      const data = await res.json();
      
      if (data.reports && Array.isArray(data.reports)) {
        setReports(data.reports);
      } else if (Array.isArray(data)) {
        setReports(data);
      } else {
        console.error("Unexpected reports format:", data);
        setReports([]);
      }
      setMessage({ text: "", type: "" });
    } catch (err) {
      console.error(err);
      setMessage({ text: "Failed to fetch reports", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const fetchHelps = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5001/api/dashboard/helps", {
        credentials: "include",
      });
      const data = await res.json();
      setHelps(data.helps || []);
      setMessage({ text: "", type: "" });
    } catch (err) {
      console.error(err);
      setMessage({ text: "Failed to fetch help requests", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5001/api/dashboard/orders", {
        credentials: "include",
      });
      const data = await res.json();
      setOrders(data.orders || []);
      setMessage({ text: "", type: "" });
    } catch (err) {
      console.error(err);
      setMessage({ text: "Failed to fetch orders", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setMessage({ text: "", type: "" });
    
    if (tab === "users") fetchUsers();
    if (tab === "products") fetchProducts();
    if (tab === "reports") fetchReports();
    if (tab === "helps") fetchHelps();
    if (tab === "orders") fetchOrders();
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });
    setLoading(true);
    
    try {
      const res = await fetch("http://localhost:5001/api/dashboard/add-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ categoryName, name, price, photo, details }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ text: "Product added successfully!", type: "success" });
        setName("");
        setPrice("");
        setPhoto("");
        setDetails("");
        fetchProducts();
      } else {
        setMessage({ text: data.message || "Failed to add product", type: "error" });
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: "Server error", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Product availability update function
  const handleAvailabilityChange = async (productId, availability) => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5001/api/products/${productId}/availability`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ availability: parseInt(availability) }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ text: "Product availability updated successfully!", type: "success" });
        
        // Update local state immediately
        setProducts(prevProducts => 
          prevProducts.map(product => 
            product.id === productId 
              ? { ...product, availability: parseInt(availability) } 
              : product
          )
        );
      } else {
        setMessage({ text: data.message || "Failed to update availability", type: "error" });
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: "Server error", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Delete product function
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5001/api/products/${productId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ text: "Product deleted successfully!", type: "success" });
        
        // Update local state immediately
        setProducts(prevProducts => prevProducts.filter(product => product.id !== productId));
      } else {
        setMessage({ text: data.message || "Failed to delete product", type: "error" });
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: "Server error", type: "error" });
    } finally {
      setLoading(false);
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
    } catch (err) {
      console.error(err);
      setMessage({ text: "Logout failed ❌", type: "error" });
    }
  };

  if (!stats) return <p className="loading">Loading dashboard...</p>;

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <h2 className="sidebar-title">Admin Panel</h2>
        <ul className="sidebar-menu">
          <li className={activeTab === "home" ? "active" : ""} onClick={() => handleTabClick("home")}>Dashboard</li>
          <li className={activeTab === "users" ? "active" : ""} onClick={() => handleTabClick("users")}>Users</li>
          <li className={activeTab === "messages" ? "active" : ""} onClick={() => handleTabClick("messages")}>Messages</li>
          <li className={activeTab === "products" ? "active" : ""} onClick={() => handleTabClick("products")}>Products</li>
          <li className={activeTab === "addProduct" ? "active" : ""} onClick={() => handleTabClick("addProduct")}>Add Product</li>
          <li className={activeTab === "orders" ? "active" : ""} onClick={() => handleTabClick("orders")}>Orders</li>
          <li className={activeTab === "reports" ? "active" : ""} onClick={() => handleTabClick("reports")}>Reports</li>
          <li className={activeTab === "helps" ? "active" : ""} onClick={() => handleTabClick("helps")}>Help</li>
          <li onClick={handleLogout}>Logout</li>
        </ul>
      </aside>

      <main className="dashboard-main">
        {/* Message display */}
        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        {loading && <div className="loading">Loading...</div>}

        {/* Home/Dashboard Tab */}
        {activeTab === "home" && !loading && (
          <>
            <h1>Welcome, {userInfo.name}</h1>
            <section className="dashboard-cards">
              <div className="card">
                <h3>Users</h3>
                <p className="card-number">{stats.userCount}</p>
              </div>
              <div className="card">
                <h3>Products</h3>
                <p className="card-number">{stats.productCount}</p>
              </div>
              <div className="card">
                <h3>Orders</h3>
                <p className="card-number">{stats.orderCount}</p>
              </div>
              <div className="card">
                <h3>Reports</h3>
                <p className="card-number">{stats.reportCount}</p>
              </div>
              <div className="card">
                <h3>Help Requests</h3>
                <p className="card-number">{stats.helpCount}</p>
              </div>
            </section>
          </>
        )}

        {/* Users Tab */}
        {activeTab === "users" && !loading && (
          <div className="table-container">
            <h2>All Users</h2>
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
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>{user.status}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === "messages" && !loading && (
          <MessagingPage mode="admin" embedded />
        )}

        {/* Products Tab with Update and Delete */}
        {activeTab === "products" && !loading && (
          <div className="table-container">
            <h2>All Products</h2>
            <div className="products-header">
              <button className="refresh-btn" onClick={fetchProducts}>
                🔄 Refresh
              </button>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Photo</th>
                  <th>Details</th>
                  <th>Availability</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length > 0 ? (
                  products.map((p) => {
                    // Normalize availability to number
                    const availability = p.availability === true || p.availability === 1 ? 1 : 0;
                    
                    return (
                      <tr key={p.id}>
                        <td>{p.categoryName || p.category}</td>
                        <td>{p.name}</td>
                        <td>${p.price}</td>
                        <td>
                          <img src={p.photo} alt={p.name} width="80" />
                        </td>
                        <td>{p.details}</td>
                        <td>
                          <select 
                            value={availability} 
                            onChange={(e) => handleAvailabilityChange(p.id, e.target.value)}
                            className={`availability-select ${availability === 0 ? 'out-of-stock' : 'in-stock'}`}
                          >
                            <option value={1}>In Stock</option>
                            <option value={0}>Out of Stock</option>
                          </select>
                        </td>
                        <td>
                          <button 
                            onClick={() => handleDeleteProduct(p.id)} 
                            className="delete-btn"
                            title="Delete Product"
                          >
                            🗑️ Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7">No products found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Add Product Tab */}
        {activeTab === "addProduct" && (
          <div className="add-product-form">
            <h2>Add Product</h2>
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
                <input type="text" placeholder="Product Name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="form-group">
                <input type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} required />
              </div>
              <div className="form-group">
                <input type="text" placeholder="Photo URL" value={photo} onChange={(e) => setPhoto(e.target.value)} required />
              </div>
              <div className="form-group">
                <textarea placeholder="Product Details" value={details} onChange={(e) => setDetails(e.target.value)} required rows="4" />
              </div>
              <button type="submit" disabled={loading}>Add Product</button>
            </form>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && !loading && (
          <div className="table-container">
            <h2>All Orders</h2>
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
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <tr key={order.id}>
                      <td>{order.order_number || order.orderId}</td>
                      <td>{order.userId}</td>
                      <td>
                        {order.items && Array.isArray(order.items) ? (
                          order.items.map((item, i) => (
                            <div key={i}>
                              {item.product_name} × {item.quantity}
                            </div>
                          ))
                        ) : (
                          <span>No items</span>
                        )}
                      </td>
                      <td>${order.total || order.totalAmt}</td>
                      <td>
                        <span className={`status-badge ${order.payment_status}`}>
                          {order.payment_status}
                        </span>
                      </td>
                      <td>{order.created_at ? new Date(order.created_at).toLocaleString() : 'N/A'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6">No orders found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === "reports" && !loading && (
          <div className="table-container">
            <h2>All Reports</h2>
            {reports.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>User Name</th>
                    <th>User Email</th>
                    <th>Opinion</th>
                    <th>Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report.id}>
                      <td>{report.user?.name || report.userName || 'Unknown'}</td>
                      <td>{report.user?.email || report.userEmail || 'Unknown'}</td>
                      <td>{report.opinion}</td>
                      <td>{report.createdAt || report.created_at || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="no-data">No reports found.</p>
            )}
          </div>
        )}

        {/* Helps Tab */}
        {activeTab === "helps" && !loading && (
          <div className="table-container">
            <h2>All Help Requests</h2>
            {helps.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Message</th>
                    <th>Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {helps.map((help) => (
                    <tr key={help.id}>
                      <td>{help.email}</td>
                      <td>{help.message}</td>
                      <td>{help.created_at ? new Date(help.created_at).toLocaleString() : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="no-data">No help requests found.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;