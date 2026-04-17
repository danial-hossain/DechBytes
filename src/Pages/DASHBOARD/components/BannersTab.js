// DASHBOARD/components/BannersTab.js
import React, { useState, useEffect } from "react";

const BannersTab = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [preview, setPreview] = useState("");
  const [title, setTitle] = useState("");
  const [displayOrder, setDisplayOrder] = useState(0);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5001/api/banners", {
        credentials: "include",
      });
      const data = await res.json();
      console.log("Fetched banners:", data); // 👈 ডিবাগের জন্য
      setBanners(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch error:", error); // 👈 ডিবাগের জন্য
      setMessage({ text: "Failed to fetch banners", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setUploading(true);
    setMessage({ text: "", type: "" });

    const formData = new FormData();
    formData.append("image", file);

    try {
      console.log("Uploading image..."); // 👈 ডিবাগের জন্য
      const res = await fetch("http://localhost:5001/api/dashboard/upload-image", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();
      console.log("Upload response:", data); // 👈 ডিবাগের জন্য

      if (res.ok && data.url) {
        await addBanner(data.url);
        setPreview("");
        setTitle("");
        setDisplayOrder(0);
      } else {
        setMessage({ text: data.message || "Image upload failed", type: "error" });
      }
    } catch (error) {
      console.error("Upload error:", error); // 👈 ডিবাগের জন্য
      setMessage({ text: "Server error during upload", type: "error" });
    } finally {
      setUploading(false);
    }
  };

  const addBanner = async (photo_url) => {
    try {
      console.log("Adding banner:", { photo_url, title, display_order: displayOrder }); // 👈 ডিবাগের জন্য
      
      const res = await fetch("http://localhost:5001/api/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
          photo_url: photo_url, 
          title: title, 
          display_order: displayOrder 
        }),
      });
      
      const data = await res.json();
      console.log("Add banner response:", data); // 👈 ডিবাগের জন্য

      if (res.ok) {
        setMessage({ text: "✅ Banner added successfully!", type: "success" });
        fetchBanners();
      } else {
        setMessage({ text: data.message || "Failed to add banner", type: "error" });
      }
    } catch (error) {
      console.error("Add banner error:", error); // 👈 ডিবাগের জন্য
      setMessage({ text: "Server error adding banner", type: "error" });
    }
  };

  const deleteBanner = async (id) => {
    if (!window.confirm("Are you sure you want to delete this banner?")) return;

    try {
      const res = await fetch(`http://localhost:5001/api/banners/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        setMessage({ text: "✅ Banner deleted!", type: "success" });
        fetchBanners();
      } else {
        const data = await res.json();
        setMessage({ text: data.message || "Failed to delete banner", type: "error" });
      }
    } catch (error) {
      console.error("Delete error:", error);
      setMessage({ text: "Server error deleting banner", type: "error" });
    }
  };

  return (
    <div className="table-container">
      <h2>🎯 Banner Management</h2>

      {message.text && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}

      {/* Add New Banner */}
      <div className="add-banner-form">
        <h3>Add New Banner</h3>
        <div className="form-group">
          <label>Title (optional):</label>
          <input
            type="text"
            placeholder="Banner title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Display Order:</label>
          <input
            type="number"
            placeholder="Display order"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
          />
        </div>
        <div className="form-group">
          <label>Upload Image:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploading}
          />
          {uploading && <p style={{ color: "orange" }}>⏳ Uploading...</p>}
          {preview && (
            <img 
              src={preview} 
              alt="Preview" 
              style={{ maxWidth: "200px", marginTop: "10px", borderRadius: "8px" }} 
            />
          )}
        </div>
      </div>

      {/* Banners List */}
      <h3>Current Banners</h3>
      {loading ? (
        <p>Loading banners...</p>
      ) : banners.length > 0 ? (
        <div className="banners-grid">
          {banners.map((banner) => (
            <div key={banner.id} className="banner-card">
              <img 
                src={banner.photo_url} 
                alt={banner.title || "Banner"} 
                style={{ width: "100%", height: "180px", objectFit: "cover" }}
              />
              <div className="banner-info" style={{ padding: "15px" }}>
                <p><strong>Title:</strong> {banner.title || "No title"}</p>
                <p><strong>Order:</strong> {banner.display_order || 0}</p>
                <button onClick={() => deleteBanner(banner.id)} className="delete-btn">
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-data">No banners found. Add your first banner above!</p>
      )}
    </div>
  );
};

export default BannersTab;