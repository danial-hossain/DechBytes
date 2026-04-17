// DASHBOARD/components/DiscountsTab.js
import React, { useState, useEffect } from "react";

const DiscountsTab = ({ 
  discounts = [], 
  products = [], 
  onAddDiscount, 
  onRemoveDiscount 
}) => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [discountEndDate, setDiscountEndDate] = useState("");
  const [applyToAll, setApplyToAll] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  // Get unique categories
  const uniqueCategories = [...new Set(products.map(p => p.categoryName).filter(Boolean))];

  // Filter products based on selected category
  useEffect(() => {
    if (selectedCategory) {
      const filtered = products.filter(p => p.categoryName === selectedCategory);
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [selectedCategory, products]);

  const handleSingleDiscount = async () => {
    if (!selectedProductId) {
      setMessage({ text: "Please select a product", type: "error" });
      return false;
    }
    if (!discountPercent) {
      setMessage({ text: "Please enter discount percentage", type: "error" });
      return false;
    }

    setLoading(true);
    try {
      // Create a fake event object
      const fakeEvent = { preventDefault: () => {} };
      
      // Set the values in the parent component
      // We need to call onAddDiscount with the proper data
      const discountData = {
        productId: parseInt(selectedProductId),
        discount_percent: parseFloat(discountPercent),
        end_date: discountEndDate || null
      };
      
      // Direct API call to add discount
      const response = await fetch("http://localhost:5001/api/dashboard/discounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(discountData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage({ text: "✅ Discount added successfully!", type: "success" });
        setDiscountPercent("");
        setDiscountEndDate("");
        setSelectedProductId("");
        // Refresh discounts and products
        window.location.reload();
        return true;
      } else {
        setMessage({ text: data.message || "Failed to add discount", type: "error" });
        return false;
      }
    } catch (error) {
      console.error("Error adding discount:", error);
      setMessage({ text: "Server error", type: "error" });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDiscount = async () => {
    if (!selectedCategory) {
      setMessage({ text: "Please select a category", type: "error" });
      return;
    }
    if (!discountPercent) {
      setMessage({ text: "Please enter discount percentage", type: "error" });
      return;
    }

    setLoading(true);
    let successCount = 0;
    let failCount = 0;

    for (const product of filteredProducts) {
      try {
        const response = await fetch("http://localhost:5001/api/dashboard/discounts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            productId: product.id,
            discount_percent: parseFloat(discountPercent),
            end_date: discountEndDate || null
          }),
        });
        
        if (response.ok) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (error) {
        failCount++;
      }
    }

    if (successCount > 0) {
      setMessage({ text: `✅ Discount applied to ${successCount} products in ${selectedCategory}! ${failCount > 0 ? `(${failCount} failed)` : ""}`, type: "success" });
      setDiscountPercent("");
      setDiscountEndDate("");
      setApplyToAll(false);
      setSelectedCategory("");
      window.location.reload();
    } else {
      setMessage({ text: "Failed to add discounts", type: "error" });
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (applyToAll && selectedCategory) {
      await handleBulkDiscount();
    } else if (selectedProductId) {
      await handleSingleDiscount();
    } else {
      setMessage({ text: "Please select a product or category", type: "error" });
    }

    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  return (
    <div className="discounts-container">
      <h2>🏷️ Discount Management</h2>

      {message.text && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}

      {/* Discount Form */}
      <div className="discount-form-card">
        <h3>Set New Discount</h3>
        
        <form onSubmit={handleSubmit} className="discount-form">
          {/* Category Selection */}
          <div className="form-group">
            <label>Select Category (Optional)</label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setSelectedProductId("");
                setApplyToAll(false);
              }}
              className="category-select"
            >
              <option value="">-- All Categories --</option>
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Apply to All Checkbox */}
          {selectedCategory && (
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={applyToAll}
                  onChange={(e) => {
                    setApplyToAll(e.target.checked);
                    if (e.target.checked) setSelectedProductId("");
                  }}
                />
                <span>Apply to ALL {selectedCategory} products ({filteredProducts.length} items)</span>
              </label>
            </div>
          )}

          {/* Product Selection */}
          {(!applyToAll || !selectedCategory) && (
            <div className="form-group">
              <label>Select Product</label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                disabled={applyToAll}
                className="product-select"
              >
                <option value="">-- Select Product --</option>
                {filteredProducts.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} - ${parseFloat(p.price).toFixed(2)}
                    {p.has_discount && " 🔥 (Has Discount)"}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>Discount %</label>
              <input
                type="number"
                placeholder="e.g., 20"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                min="1"
                max="99"
                required
                className="discount-input"
              />
            </div>

            <div className="form-group">
              <label>End Date (Optional)</label>
              <input
                type="datetime-local"
                value={discountEndDate}
                onChange={(e) => setDiscountEndDate(e.target.value)}
                className="date-input"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="submit-discount-btn">
            {loading ? "⏳ Processing..." : (applyToAll ? `✅ Apply to ${filteredProducts.length} Products` : "✅ Set Discount")}
          </button>
        </form>
      </div>

      {/* Active Discounts List */}
      <div className="active-discounts">
        <h3>🎯 Active Discounts</h3>
        
        {discounts.length === 0 ? (
          <p className="no-data">No active discounts found.</p>
        ) : (
          <div className="table-responsive">
            <table className="discounts-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Original Price</th>
                  <th>Discount %</th>
                  <th>Discounted Price</th>
                  <th>End Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {discounts.map((d) => (
                  <tr key={d.id} className="discount-row">
                    <td className="product-name-cell">
                      <strong>{d.productName}</strong>
                    </td>
                    <td>{d.categoryName || "—"}</td>
                    <td className="original-price-cell">
                      ${parseFloat(d.originalPrice).toFixed(2)}
                    </td>
                    <td>
                      <span className="discount-badge-cell">{d.discount_percent}% OFF</span>
                    </td>
                    <td className="discounted-price-cell">
                      <span className="price-highlight">
                        ${parseFloat(d.discountedPrice).toFixed(2)}
                      </span>
                      <span className="save-badge">
                        Save ${(d.originalPrice - d.discountedPrice).toFixed(2)}
                      </span>
                    </td>
                    <td>
                      {d.end_date ? (
                        <span className="end-date-badge">
                          📅 {new Date(d.end_date).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="no-end-date">No limit</span>
                      )}
                    </td>
                    <td>
                      <button 
                        onClick={() => onRemoveDiscount(d.productId)} 
                        className="remove-discount-btn"
                      >
                        🗑️ Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscountsTab;