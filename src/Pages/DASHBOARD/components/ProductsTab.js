// DASHBOARD/components/ProductsTab.js
import React from "react";

const ProductsTab = ({ products = [], onDelete, onAvailabilityChange }) => {
  return (
    <div className="table-container">
      <h2>📦 Products Management</h2>
      
      <div className="products-header">
        <button className="refresh-btn" onClick={() => window.location.reload()}>
          🔄 Refresh
        </button>
      </div>

      <div className="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Original Price</th>
              <th>Discount</th>
              <th>Final Price</th>
              <th>Stock</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map((p) => {
                const hasDiscount = p.has_discount || (p.discount_percent && p.discount_percent > 0);
                const originalPrice = parseFloat(p.original_price || p.price).toFixed(2);
                const discountPercent = p.discount_percent || 0;
                const finalPrice = hasDiscount 
                  ? (originalPrice - (originalPrice * discountPercent / 100)).toFixed(2)
                  : originalPrice;
                const availability = p.availability === true || p.availability === 1 ? 1 : 0;

                return (
                  <tr key={p.id} className={hasDiscount ? "product-discount-row" : ""}>
                    <td className="product-name-cell">
                      <div className="product-info">
                        <img 
                          src={p.photo} 
                          alt={p.name} 
                          className="product-img" 
                        />
                        <span className="product-title">{p.name}</span>
                      </div>
                    </td>
                    <td className="category-cell">{p.categoryName || p.category || "—"}</td>
                    
                    <td className={hasDiscount ? "original-price-cell" : ""}>
                      {hasDiscount ? (
                        <span className="old-price">${originalPrice}</span>
                      ) : (
                        <span>${originalPrice}</span>
                      )}
                    </td>
                    
                    <td>
                      {hasDiscount ? (
                        <div className="discount-info">
                          <span className="discount-badge">-{discountPercent}%</span>
                          {p.discount_end_date && (
                            <span className="discount-expiry">
                              ⏱️ {new Date(p.discount_end_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="no-discount">—</span>
                      )}
                    </td>
                    
                    <td className="price-cell">
                      {hasDiscount ? (
                        <>
                          <span className="final-price">${finalPrice}</span>
                          <span className="save-amount">Save ${(originalPrice - finalPrice).toFixed(2)}</span>
                        </>
                      ) : (
                        <span className="regular-price">${finalPrice}</span>
                      )}
                    </td>
                    
                    <td>
                      <select
                        value={availability}
                        onChange={(e) => onAvailabilityChange(p.id, e.target.value)}
                        className={`stock-select ${availability === 1 ? "in-stock" : "out-stock"}`}
                      >
                        <option value={1}>✅ In Stock</option>
                        <option value={0}>❌ Out of Stock</option>
                      </select>
                    </td>
                    
                    <td>
                      <button onClick={() => onDelete(p.id)} className="delete-product-btn">
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="empty-row">No products found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductsTab;