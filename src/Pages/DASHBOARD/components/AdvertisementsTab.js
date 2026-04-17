// DASHBOARD/components/AdvertisementsTab.js
import React, { useState, useEffect } from "react";

const AdvertisementsTab = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [preview, setPreview] = useState("");

  const fetchAds = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5001/api/advertisements", {
        credentials: "include",
      });
      const data = await res.json();
      setAds(Array.isArray(data) ? data : []);
      setMessage({ text: "", type: "" });
    } catch (error) {
      setMessage({ text: "Failed to fetch ads", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
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
      const res = await fetch("http://localhost:5001/api/dashboard/upload-image", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();

      if (res.ok && data.url) {
        await addAd(data.url);
        setPreview("");
      } else {
        setMessage({ text: "Image upload failed", type: "error" });
      }
    } catch {
      setMessage({ text: "Server error", type: "error" });
    } finally {
      setUploading(false);
    }
  };

  const addAd = async (photo_url) => {
    try {
      const res = await fetch("http://localhost:5001/api/advertisements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ photo_url }),
      });

      if (res.ok) {
        setMessage({ text: "✅ Advertisement added successfully!", type: "success" });
        fetchAds();
      } else {
        setMessage({ text: "Failed to add ad", type: "error" });
      }
    } catch {
      setMessage({ text: "Server error", type: "error" });
    }
  };

  const deleteAd = async (id) => {
    if (!window.confirm("Are you sure you want to delete this advertisement?")) return;

    try {
      const res = await fetch(`http://localhost:5001/api/advertisements/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        setMessage({ text: "✅ Advertisement deleted successfully!", type: "success" });
        fetchAds();
      } else {
        setMessage({ text: "Failed to delete ad", type: "error" });
      }
    } catch {
      setMessage({ text: "Server error", type: "error" });
    }
  };

  return (
    <div className="table-container">
      <h2>📢 Advertisement Management</h2>

      {message.text && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}

      {/* Add New Ad Section */}
      <div className="add-ad-form">
        <h3>Add New Advertisement</h3>
        <div className="form-group">
          <label>Upload Image:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploading}
          />
          {uploading && <p className="uploading-text">⏳ Uploading...</p>}
          {preview && (
            <img src={preview} alt="Preview" className="image-preview" />
          )}
        </div>
      </div>

      {/* Ads List Section */}
      <h3>Current Advertisements</h3>
      {loading ? (
        <p className="loading">Loading...</p>
      ) : ads.length > 0 ? (
        <div className="ads-grid">
          {ads.map((ad) => (
            <div key={ad.id} className="ad-card">
              <img src={ad.photo_url} alt={`Advertisement ${ad.id}`} />
              <div className="ad-info">
                <p><strong>ID:</strong> {ad.id}</p>
                <p><strong>Created:</strong> {new Date(ad.created_at).toLocaleDateString()}</p>
                <button onClick={() => deleteAd(ad.id)} className="delete-btn">
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-data">No advertisements found.</p>
      )}
    </div>
  );
};

export default AdvertisementsTab;