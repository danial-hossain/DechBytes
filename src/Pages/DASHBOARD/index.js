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
  const [discounts, setDiscounts] = useState([]);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  // Add product states
  const [categoryName, setCategoryName] = useState("Arms");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [photo, setPhoto] = useState("");
  const [details, setDetails] = useState("");
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState("");

  // Discount states
  const [selectedProductId, setSelectedProductId] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [discountEndDate, setDiscountEndDate] = useState("");

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
      const res = await fetch("http://localhost:5001/api/dashboard/users", { credentials: "include" });
      const data = await res.json();
      setUsers(data.users || []);
      setMessage({ text: "", type: "" });
    } catch (err) {
      setMessage({ text: "Failed to fetch users", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5001/api/dashboard/products", { credentials: "include" });
      const data = await res.json();
      
      if (data.products) {
        // প্রোডাক্ট ডিসকাউন্ট সহ ফরম্যাট করুন
        const formattedProducts = data.products.map(p => ({
          ...p,
          has_discount: p.has_discount || (p.discount_percent && p.discount_percent > 0),
          original_price: p.original_price || p.price,
          final_price: p.discounted_price || (p.has_discount ? p.price : null)
        }));
        setProducts(formattedProducts);
        console.log("Products with discounts:", formattedProducts);
      } else {
        setProducts([]);
      }
      setMessage({ text: "", type: "" });
    } catch (err) {
      console.error("Fetch products error:", err);
      setMessage({ text: "Failed to fetch products", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5001/api/dashboard/reports", { credentials: "include" });
      const data = await res.json();
      if (data.reports && Array.isArray(data.reports)) setReports(data.reports);
      else if (Array.isArray(data)) setReports(data);
      else setReports([]);
      setMessage({ text: "", type: "" });
    } catch (err) {
      setMessage({ text: "Failed to fetch reports", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const fetchHelps = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5001/api/dashboard/helps", { credentials: "include" });
      const data = await res.json();
      setHelps(data.helps || []);
      setMessage({ text: "", type: "" });
    } catch (err) {
      setMessage({ text: "Failed to fetch help requests", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5001/api/dashboard/orders", { credentials: "include" });
      const data = await res.json();
      setOrders(data.orders || []);
      setMessage({ text: "", type: "" });
    } catch (err) {
      setMessage({ text: "Failed to fetch orders", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const fetchDiscounts = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5001/api/dashboard/discounts", { credentials: "include" });
      const data = await res.json();
      setDiscounts(data.discounts || []);
      setMessage({ text: "", type: "" });
    } catch (err) {
      console.error("Fetch discounts error:", err);
      setMessage({ text: "Failed to fetch discounts", type: "error" });
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
    if (tab === "discounts") {
      fetchDiscounts();
      fetchProducts();
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setUploading(true);
    setMessage({ text: "", type: "" });

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("http://localhost:5001/api/dashboard/upload-image", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setPhoto(data.url);
        setMessage({ text: "✅ ছবি আপলোড সফল!", type: "success" });
      } else {
        setMessage({ text: "❌ " + (data.message || "আপলোড ব্যর্থ"), type: "error" });
      }
    } catch (err) {
      setMessage({ text: "❌ Server error", type: "error" });
    } finally {
      setUploading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    if (!photo) {
      setMessage({ text: "⚠️ আগে ছবি আপলোড করুন", type: "error" });
      return;
    }

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
        setMessage({ text: "✅ Product সফলভাবে যোগ হয়েছে!", type: "success" });
        setName(""); 
        setPrice(""); 
        setPhoto(""); 
        setDetails(""); 
        setPreview("");
        fetchProducts();
      } else {
        setMessage({ text: data.message || "Failed to add product", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Server error", type: "error" });
    } finally {
      setLoading(false);
    }
  };

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
        setMessage({ text: "Product availability updated!", type: "success" });
        setProducts(prev =>
          prev.map(p => p.id === productId ? { ...p, availability: parseInt(availability) } : p)
        );
      } else {
        setMessage({ text: data.message || "Failed to update", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Server error", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5001/api/products/${productId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ text: "Product deleted!", type: "success" });
        setProducts(prev => prev.filter(p => p.id !== productId));
      } else {
        setMessage({ text: data.message || "Failed to delete", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Server error", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleAddDiscount = async (e) => {
    e.preventDefault();
    
    if (!selectedProductId || !discountPercent) {
      setMessage({ text: "Please select product and enter discount %", type: "error" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5001/api/dashboard/discounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          productId: parseInt(selectedProductId),
          discount_percent: parseFloat(discountPercent),
          end_date: discountEndDate || null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ text: "✅ Discount added successfully!", type: "success" });
        setSelectedProductId(""); 
        setDiscountPercent(""); 
        setDiscountEndDate("");
        await fetchDiscounts();
        await fetchProducts(); // প্রোডাক্ট রিফ্রেশ করুন
      } else {
        setMessage({ text: data.message || "Failed to add discount", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Server error", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDiscount = async (productId) => {
    if (!window.confirm("Discount সরাতে চান?")) return;
    try {
      const res = await fetch(`http://localhost:5001/api/dashboard/discounts/${productId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ text: "✅ Discount removed successfully!", type: "success" });
        await fetchDiscounts();
        await fetchProducts(); // প্রোডাক্ট রিফ্রেশ করুন
      }
    } catch (err) {
      setMessage({ text: "Server error", type: "error" });
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
          <li className={activeTab === "discounts" ? "active" : ""} onClick={() => handleTabClick("discounts")}>Discounts</li>
          <li className={activeTab === "orders" ? "active" : ""} onClick={() => handleTabClick("orders")}>Orders</li>
          <li className={activeTab === "reports" ? "active" : ""} onClick={() => handleTabClick("reports")}>Reports</li>
          <li className={activeTab === "helps" ? "active" : ""} onClick={() => handleTabClick("helps")}>Help</li>
          <li onClick={handleLogout}>Logout</li>
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
                  <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {users.length > 0 ? users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.name}</td><td>{user.email}</td>
                      <td>{user.role}</td><td>{user.status}</td>
                    </tr>
                  )) : <tr><td colSpan="4">No users found.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === "messages" && !loading && (
          <MessagingPage mode="admin" embedded />
        )}

        {/* Products Tab with Discount Display */}
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
                        <td className={hasDiscount ? "strikethrough" : ""}>
                          ${originalPrice}
                        </td>
                        <td>
                          {hasDiscount ? (
                            <span className="discount-badge-table">
                              -{p.discount_percent}% OFF
                            </span>
                          ) : (
                            <span className="no-discount">No discount</span>
                          )}
                        </td>
                        <td className="discount-price">
                          {hasDiscount ? (
                            <strong>${finalPrice}</strong>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>
                          <img 
                            src={p.photo} 
                            alt={p.name} 
                            className="product-thumbnail" 
                          />
                        </td>
                        <td>
                          <div className="details-preview">
                            {p.details?.substring(0, 50)}...
                          </div>
                        </td>
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
                    <tr><td colSpan="9" style={{ textAlign: "center" }}>No products found.</td></tr>
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
                {uploading && <p className="uploading-text">⏳ আপলোড হচ্ছে...</p>}
                {preview && (
                  <img src={preview} alt="Preview" className="image-preview" />
                )}
              </div>
              <div className="form-group">
                <textarea placeholder="Product Details" value={details}
                  onChange={(e) => setDetails(e.target.value)} required rows="4" />
              </div>
              <button type="submit" disabled={loading || uploading || !photo}>
                {loading ? "যোগ হচ্ছে..." : "Add Product"}
              </button>
            </form>
          </div>
        )}

        {/* Discounts Tab */}
        {activeTab === "discounts" && !loading && (
          <div className="table-container">
            <h2>Discount Management</h2>

            {/* Discount Form */}
            <div className="discount-form">
              <h3>নতুন Discount সেট করুন</h3>
              <form onSubmit={handleAddDiscount}>
                <select value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)} required>
                  <option value="">-- Product সিলেক্ট করুন --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} - ${parseFloat(p.price).toFixed(2)}
                    </option>
                  ))}
                </select>
                <input
                  type="number" 
                  placeholder="Discount % (যেমন: 20)"
                  value={discountPercent} 
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  min="1" max="99" required
                />
                <label>
                  শেষ তারিখ (optional):
                  <input type="datetime-local" value={discountEndDate}
                    onChange={(e) => setDiscountEndDate(e.target.value)} />
                </label>
                <button type="submit" disabled={loading}>✅ Discount সেট করুন</button>
              </form>
            </div>

            {/* Discount List */}
            <h3>সক্রিয় Discounts</h3>
            {discounts.length > 0 ? (
              <div className="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>আসল দাম</th>
                      <th>Discount %</th>
                      <th>ছাড়ের দাম</th>
                      <th>শেষ তারিখ</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {discounts.map((d) => (
                      <tr key={d.id}>
                        <td>{d.productName}</td>
                        <td>${parseFloat(d.originalPrice).toFixed(2)}</td>
                        <td className="discount-percent">{d.discount_percent}%</td>
                        <td className="discounted-price">${parseFloat(d.discountedPrice).toFixed(2)}</td>
                        <td>{d.end_date ? new Date(d.end_date).toLocaleDateString() : "কোনো সীমা নেই"}</td>
                        <td>
                          <button onClick={() => handleRemoveDiscount(d.productId)} className="delete-btn">
                            🗑️ Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="no-data">কোনো discount নেই।</p>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && !loading && (
          <div className="table-container">
            <h2>All Orders</h2>
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th><th>User ID</th><th>Products</th>
                    <th>Total</th><th>Payment Status</th><th>Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length > 0 ? orders.map((order) => (
                    <tr key={order.id}>
                      <td>{order.order_number || order.orderId}</td>
                      <td>{order.userId}</td>
                      <td>
                        {order.items && Array.isArray(order.items) ? (
                          order.items.map((item, i) => (
                            <div key={i}>{item.product_name} × {item.quantity}</div>
                          ))
                        ) : <span>No items</span>}
                      </td>
                      <td>${parseFloat(order.total || order.totalAmt).toFixed(2)}</td>
                      <td>
                        <span className={`status-badge ${order.payment_status}`}>
                          {order.payment_status}
                        </span>
                      </td>
                      <td>{order.created_at ? new Date(order.created_at).toLocaleString() : "N/A"}</td>
                    </tr>
                  )) : <tr><td colSpan="6">No orders found.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === "reports" && !loading && (
          <div className="table-container">
            <h2>All Reports</h2>
            {reports.length > 0 ? (
              <div className="table-responsive">
                <table>
                  <thead><tr><th>User Name</th><th>User Email</th><th>Opinion</th><th>Created At</th></tr></thead>
                  <tbody>
                    {reports.map((report) => (
                      <tr key={report.id}>
                        <td>{report.user?.name || report.userName || "Unknown"}</td>
                        <td>{report.user?.email || report.userEmail || "Unknown"}</td>
                        <td>{report.opinion}</td>
                        <td>{report.createdAt || report.created_at || "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p className="no-data">No reports found.</p>}
          </div>
        )}

        {/* Helps Tab */}
        {activeTab === "helps" && !loading && (
          <div className="table-container">
            <h2>All Help Requests</h2>
            {helps.length > 0 ? (
              <div className="table-responsive">
                <table>
                  <thead><tr><th>Email</th><th>Message</th><th>Created At</th></tr></thead>
                  <tbody>
                    {helps.map((help) => (
                      <tr key={help.id}>
                        <td>{help.email}</td>
                        <td>{help.message}</td>
                        <td>{help.created_at ? new Date(help.created_at).toLocaleString() : "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p className="no-data">No help requests found.</p>}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;