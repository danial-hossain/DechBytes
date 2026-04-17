import React, { useState } from "react";

const AddProduct = () => {
  const [categoryName, setCategoryName] = useState("Arms");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [photo, setPhoto] = useState("");
  const [details, setDetails] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState("");

  // ✅ ছবি select করলে Cloudinary তে আপলোড হবে
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
        body: formData, // ⚠️ headers দেবেন না
      });
      const data = await res.json();

      if (res.ok && data.url) {
        setPhoto(data.url); // ✅ Cloudinary URL auto-set
        setMessage({ text: "✅ ছবি আপলোড সফল!", type: "success" });
      } else {
        setMessage({ text: "❌ " + (data.message || "আপলোড ব্যর্থ"), type: "error" });
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: "❌ Server error", type: "error" });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!photo) {
      setMessage({ text: "⚠️ আগে ছবি আপলোড করুন", type: "error" });
      return;
    }

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
      } else {
        setMessage({ text: data.message || "Failed to add product", type: "error" });
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: "❌ Server error", type: "error" });
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "auto" }}>
      <h2>Add Product</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>

        <label>
          Category:
          <select value={categoryName} onChange={(e) => setCategoryName(e.target.value)}>
            <option value="Arms">Arms</option>
            <option value="Legs">Legs</option>
            <option value="Laptops">Laptops</option>
            <option value="Desktops">Desktops</option>
            <option value="Electronics">Electronics</option>
            <option value="Featured">Featured</option>
          </select>
        </label>

        <input
          type="text"
          placeholder="Product Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />

        {/* ✅ Photo URL এর বদলে File Upload */}
        <div>
          <label>Product Photo:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploading}
            required={!photo}
          />
          {uploading && (
            <p style={{ color: "orange", marginTop: "6px" }}>⏳ আপলোড হচ্ছে...</p>
          )}
          {preview && (
            <img
              src={preview}
              alt="Preview"
              style={{
                width: "100%",
                maxHeight: "200px",
                objectFit: "cover",
                marginTop: "8px",
                borderRadius: "8px",
              }}
            />
          )}
        </div>

        <textarea
          placeholder="Details"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={uploading || !photo}
          style={{
            padding: "10px",
            backgroundColor: uploading || !photo ? "#94a3b8" : "#1e3a8a",
            color: "white",
            border: "none",
            cursor: uploading || !photo ? "not-allowed" : "pointer",
          }}
        >
          {uploading ? "আপলোড হচ্ছে..." : "Add Product"}
        </button>
      </form>

      {message.text && (
        <p style={{ color: message.type === "success" ? "green" : "red", marginTop: "10px" }}>
          {message.text}
        </p>
      )}
    </div>
  );
};

export default AddProduct;