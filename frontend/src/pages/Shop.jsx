import { useState, useEffect } from "react";
import Products from "../components/Products";
import { Link } from "react-router-dom";

function Shop({ category = "all" }) {
  const [productsList, setProductsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const url =
          category === "all"
            ? `${API_URL}/api/products`
            : `${API_URL}/api/products?category=${category}`;

        const res = await fetch(url);
        const data = await res.json();

        if (data.success) {
          setProductsList(data.products || []);
        } else {
          setError(data.message || "Failed to load products");
        }
      } catch (err) {
        console.error("Error fetching storefront products:", err);
        setError("Could not connect to server");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, API_URL]);

  const categoryTitle =
    category === "all"
      ? "New Arrivals"
      : `Shop ${category.charAt(0).toUpperCase() + category.slice(1)}`;

  const shopLabel =
    category === "all"
      ? "NEW ARRIVALS"
      : "OUR COLLECTION";

  const filters = [
    { label: "ALL", path: "/shop", cat: "all" },
    { label: "MEN", path: "/men", cat: "men" },
    { label: "WOMEN", path: "/women", cat: "women" },
    { label: "KIDS", path: "/kids", cat: "kids" },
  ];

  return (
    <section className="shop-section">
      <div className="shop-header">
        <p className="shop-label">{shopLabel}</p>
        <h2>{categoryTitle}</h2>
        <p className="shop-description">
          Discover styles designed for every moment.
        </p>
      </div>

      <div className="category-filters">
        {filters.map((f) => (
          <Link
            key={f.cat}
            to={f.path}
            className={category === f.cat ? "active" : ""}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "80px 20px", fontSize: "16px", color: "#5483B3" }}>
          Loading collection...
        </div>
      ) : error ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#dc2626" }}>
          {error}
        </div>
      ) : productsList.length === 0 ? (
        <div className="empty-cart" style={{ textTransform: "none" }}>
          <h2>No products found</h2>
          <p>Check back soon for new arrivals in this collection.</p>
        </div>
      ) : (
        <div className="product-grid">
          {productsList.map((product) => (
            <Products
              key={product.id}
              product={product}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default Shop;