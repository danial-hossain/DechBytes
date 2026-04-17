// src/Pages/DASHBOARD/hooks/useDashboard.js
import { useState } from "react";

const BASE = "http://localhost:5001/api/dashboard";

const useDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reports, setReports] = useState([]);
  const [helps, setHelps] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Add Product states
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

  // ─── FETCH FUNCTIONS ───────────────────────────────────────

  const fetchStats = async () => {
    try {
      const res = await fetch(BASE, { credentials: "include" });
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/users`, { credentials: "include" });
      const data = await res.json();
      setUsers(data.users || []);
      setMessage({ text: "", type: "" });
    } catch {
      setMessage({ text: "Failed to fetch users", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/products`, { credentials: "include" });
      const data = await res.json();
      if (data.products) {
        const formatted = data.products.map((p) => ({
          ...p,
          has_discount: p.has_discount || (p.discount_percent && p.discount_percent > 0),
          original_price: p.original_price || p.price,
          final_price: p.discounted_price || (p.has_discount ? p.price : null),
        }));
        setProducts(formatted);
      } else {
        setProducts([]);
      }
      setMessage({ text: "", type: "" });
    } catch (err) {
      console.error(err);
      setMessage({ text: "Failed to fetch products", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/orders`, { credentials: "include" });
      const data = await res.json();
      setOrders(data.orders || []);
      setMessage({ text: "", type: "" });
    } catch {
      setMessage({ text: "Failed to fetch orders", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/reports`, { credentials: "include" });
      const data = await res.json();
      if (data.reports && Array.isArray(data.reports)) setReports(data.reports);
      else if (Array.isArray(data)) setReports(data);
      else setReports([]);
      setMessage({ text: "", type: "" });
    } catch {
      setMessage({ text: "Failed to fetch reports", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const fetchHelps = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/helps`, { credentials: "include" });
      const data = await res.json();
      setHelps(data.helps || []);
      setMessage({ text: "", type: "" });
    } catch {
      setMessage({ text: "Failed to fetch help requests", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const fetchDiscounts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/discounts`, { credentials: "include" });
      const data = await res.json();
      setDiscounts(data.discounts || []);
      setMessage({ text: "", type: "" });
    } catch {
      setMessage({ text: "Failed to fetch discounts", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // ─── ACTION FUNCTIONS ───────────────────────────────────────

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    setMessage({ text: "", type: "" });

    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await fetch(`${BASE}/upload-image`, {
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
    } catch {
      setMessage({ text: "❌ Server error", type: "error" });
    } finally {
      setUploading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!photo) {
      setMessage({ text: "⚠️ আগে ছবি আপলোড করুন", type: "error" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/add-product`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ categoryName, name, price, photo, details }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ text: "✅ Product সফলভাবে যোগ হয়েছে!", type: "success" });
        setName(""); setPrice(""); setPhoto(""); setDetails(""); setPreview("");
        fetchProducts();
      } else {
        setMessage({ text: data.message || "Failed to add product", type: "error" });
      }
    } catch {
      setMessage({ text: "Server error", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleAvailabilityChange = async (productId, availability) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5001/api/products/${productId}/availability`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ availability: parseInt(availability) }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ text: "Product availability updated!", type: "success" });
        setProducts((prev) =>
          prev.map((p) =>
            p.id === productId ? { ...p, availability: parseInt(availability) } : p
          )
        );
      } else {
        setMessage({ text: data.message || "Failed to update", type: "error" });
      }
    } catch {
      setMessage({ text: "Server error", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5001/api/products/${productId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ text: "Product deleted!", type: "success" });
        setProducts((prev) => prev.filter((p) => p.id !== productId));
      } else {
        setMessage({ text: data.message || "Failed to delete", type: "error" });
      }
    } catch {
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
      const res = await fetch(`${BASE}/discounts`, {
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
        setSelectedProductId(""); setDiscountPercent(""); setDiscountEndDate("");
        await fetchDiscounts();
        await fetchProducts();
      } else {
        setMessage({ text: data.message || "Failed to add discount", type: "error" });
      }
    } catch {
      setMessage({ text: "Server error", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDiscount = async (productId) => {
    if (!window.confirm("Discount সরাতে চান?")) return;
    try {
      const res = await fetch(`${BASE}/discounts/${productId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setMessage({ text: "✅ Discount removed successfully!", type: "success" });
        await fetchDiscounts();
        await fetchProducts();
      }
    } catch {
      setMessage({ text: "Server error", type: "error" });
    }
  };

  // ─── RETURN ─────────────────────────────────────────────────

  return {
    // State
    stats, users, products, orders, reports, helps, discounts,
    loading, message, setMessage,

    // Add Product state & setters
    categoryName, setCategoryName,
    name, setName,
    price, setPrice,
    photo, details, setDetails,
    uploading, preview,

    // Discount state & setters
    selectedProductId, setSelectedProductId,
    discountPercent, setDiscountPercent,
    discountEndDate, setDiscountEndDate,

    // Fetch functions
    fetchStats, fetchUsers, fetchProducts,
    fetchOrders, fetchReports, fetchHelps, fetchDiscounts,

    // Action functions
    handleImageUpload, handleAddProduct,
    handleAvailabilityChange, handleDeleteProduct,
    handleAddDiscount, handleRemoveDiscount,
  };
};

export default useDashboard;