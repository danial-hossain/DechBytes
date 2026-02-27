import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import "./style.css";

const MIN_PRICE = 0;
const MAX_PRICE = 30000;

const CATEGORY_CONFIG = [
  {
    key: "desktops",
    label: "Desktop",
    route: "/desktops",
    apiCategory: "Desktops",
    detailSlug: "desktops",
  },
  {
    key: "laptops",
    label: "Laptop",
    route: "/laptops",
    apiCategory: "Laptops",
    detailSlug: "laptops",
  },
  {
    key: "electronics",
    label: "Electronics",
    route: "/electronics",
    apiCategory: "Electronics",
    detailSlug: "electronics",
  },
  {
    key: "arms",
    label: "Prosthetic Arms",
    route: "/arms",
    apiCategory: "Arms",
    detailSlug: "arms",
  },
  {
    key: "legs",
    label: "Prosthetic Legs",
    route: "/legs",
    apiCategory: "Legs",
    detailSlug: "legs",
  },
];

const AVAILABILITY_OPTIONS = ["In Stock", "Pre Order", "Up Coming"];

const getCategoryFromPath = (pathname) => {
  const match = CATEGORY_CONFIG.find((item) => item.route === pathname);
  return match?.key || "desktops";
};

const parseAvailability = (product) => {
  const candidates = [
    product.availability,
    product.stockStatus,
    product.status,
    product.stock_status,
  ]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase());

  if (candidates.some((value) => value.includes("pre"))) return "Pre Order";
  if (candidates.some((value) => value.includes("up") || value.includes("coming"))) return "Up Coming";
  if (candidates.some((value) => value.includes("stock") || value.includes("available"))) return "In Stock";

  const quantity = Number(product.quantity ?? product.stock ?? product.qty ?? 0);
  if (Number.isFinite(quantity)) {
    if (quantity > 0) return "In Stock";
    if (quantity === 0) return "Up Coming";
  }

  return "In Stock";
};

const ProductListing = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userInfo } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState(getCategoryFromPath(location.pathname));
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [priceMin, setPriceMin] = useState(MIN_PRICE);
  const [priceMax, setPriceMax] = useState(MAX_PRICE);
  const [selectedAvailability, setSelectedAvailability] = useState([]);
  const [showCount, setShowCount] = useState(24);
  const [sortBy, setSortBy] = useState("default");

  useEffect(() => {
    setSelectedCategory(getCategoryFromPath(location.pathname));
  }, [location.pathname]);

  useEffect(() => {
    const currentCategory = CATEGORY_CONFIG.find((item) => item.key === selectedCategory);
    if (!currentCategory) return;

    const fetchProducts = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `http://localhost:5001/api/categories/${currentCategory.apiCategory}/products`
        );
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to fetch products");
        }

        const normalized = (data.products || []).map((product) => ({
          ...product,
          id: product.id ?? product._id,
          _id: product._id ?? product.id,
          price: Number(product.price || 0),
          availabilityLabel: parseAvailability(product),
        }));

        setProducts(normalized);
      } catch (fetchError) {
        setProducts([]);
        setError(fetchError.message || "Failed to fetch products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory]);

  const filteredProducts = useMemo(() => {
    let nextList = [...products];

    nextList = nextList.filter(
      (item) => item.price >= priceMin && item.price <= priceMax
    );

    if (selectedAvailability.length > 0) {
      nextList = nextList.filter((item) =>
        selectedAvailability.includes(item.availabilityLabel)
      );
    }

    if (sortBy === "price-low") {
      nextList.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      nextList.sort((a, b) => b.price - a.price);
    }

    return nextList;
  }, [products, priceMin, priceMax, selectedAvailability, sortBy]);

  const visibleProducts = filteredProducts.slice(0, showCount);

  const handleAvailabilityToggle = (label) => {
    setSelectedAvailability((previous) =>
      previous.includes(label)
        ? previous.filter((item) => item !== label)
        : [...previous, label]
    );
  };

  const handleAddToCart = async (productId) => {
    if (!userInfo) {
      alert("❌ You must be logged in to add items to cart!");
      navigate("/login");
      return;
    }

    try {
      const response = await fetch("http://localhost:5001/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        alert("✅ Added to cart!");
      } else {
        alert(`❌ Failed: ${data.message || "Unknown error"}`);
      }
    } catch (addError) {
      console.error("Error adding to cart:", addError);
      alert("❌ Something went wrong");
    }
  };

  const selectedCategoryConfig = CATEGORY_CONFIG.find((item) => item.key === selectedCategory);

  return (
    <div className="product-listing-page container">
      <div className="listing-layout">
        <aside className="filters-sidebar">
          <div className="filter-card">
            <h3>Price Range</h3>
            <div className="range-wrap">
              <div className="range-overlay">
                <input
                  type="range"
                  min={MIN_PRICE}
                  max={MAX_PRICE}
                  step={1000}
                  value={priceMin}
                  onChange={(event) =>
                    setPriceMin(Math.min(Number(event.target.value), priceMax))
                  }
                />
                <input
                  type="range"
                  min={MIN_PRICE}
                  max={MAX_PRICE}
                  step={1000}
                  value={priceMax}
                  onChange={(event) =>
                    setPriceMax(Math.max(Number(event.target.value), priceMin))
                  }
                />
              </div>
            </div>
            <div className="price-boxes">
              <div className="price-box">{priceMin.toLocaleString()}</div>
              <div className="price-box">{priceMax.toLocaleString()}</div>
            </div>
          </div>

          <div className="filter-card">
            <div className="availability-header">
              <h3>Availability</h3>
              <span>⌃</span>
            </div>
            <div className="availability-list">
              {AVAILABILITY_OPTIONS.map((option) => (
                <label key={option} className="availability-item">
                  <input
                    type="checkbox"
                    checked={selectedAvailability.includes(option)}
                    onChange={() => handleAvailabilityToggle(option)}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        <section className="products-section">
          <div className="products-toolbar">
            <div className="toolbar-control">
              <span>Show:</span>
              <select
                value={showCount}
                onChange={(event) => setShowCount(Number(event.target.value))}
              >
                <option value={24}>24</option>
                <option value={12}>12</option>
                <option value={36}>36</option>
              </select>
            </div>

            <div className="toolbar-control">
              <span>Sort By:</span>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
              >
                <option value="default">Default</option>
                <option value="price-low">Price (Low &gt; High)</option>
                <option value="price-high">Price (High &gt; Low)</option>
              </select>
            </div>
          </div>

          {loading && <p className="listing-message">Loading products...</p>}
          {!loading && error && <p className="listing-message error">{error}</p>}

          {!loading && !error && (
            <>
              <h2 className="listing-title">
                {selectedCategoryConfig?.label || "Products"}
              </h2>
              {visibleProducts.length === 0 ? (
                <p className="listing-message">No products found for selected filters.</p>
              ) : (
                <div className="products-grid">
                  {visibleProducts.map((product) => (
                    <div className="product-card" key={product.id}>
                      <img
                        src={product.photo || "https://via.placeholder.com/300x200?text=No+Image"}
                        alt={product.name}
                        onClick={() =>
                          navigate(`/product/${selectedCategoryConfig?.detailSlug || "desktops"}/${product.id}`)
                        }
                      />
                      <h3
                        onClick={() =>
                          navigate(`/product/${selectedCategoryConfig?.detailSlug || "desktops"}/${product.id}`)
                        }
                      >
                        {product.name}
                      </h3>
                      <p className="product-price">${product.price.toLocaleString()}</p>
                      <p className="product-availability">{product.availabilityLabel}</p>
                      <button onClick={() => handleAddToCart(product.id)} type="button">
                        Add to Cart
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default ProductListing;
