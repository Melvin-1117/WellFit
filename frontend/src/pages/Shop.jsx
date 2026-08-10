import { useState, useEffect } from "react";
import Products from "../components/Products";
import { supabase } from "../lib/supabase";

function Shop({ category = "all" }) {
  const [productsList, setProductsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "" : "http://localhost:5000");

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
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setProductsList(data.products || []);
            setLoading(false);
            return;
          }
        }

        // Direct Supabase fallback for high availability in production
        let query = supabase.from("products").select("*").order("id", { ascending: true });
        if (category !== "all") {
          query = query.eq("category", category.toLowerCase());
        }

        const { data: dbData, error: dbErr } = await query;

        if (dbData && dbData.length > 0) {
          const formatted = dbData.map((p) => ({
            id: p.id,
            name: p.name,
            price: Number(p.price),
            category: p.category,
            image: p.image || p.image_url || "/products/men/item1.jpg",
            image_url: p.image_url || p.image || "/products/men/item1.jpg",
            description: p.description || "",
          }));
          setProductsList(formatted);
        } else if (dbErr) {
          setError(dbErr.message);
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

  if (loading) {
    return (
      <section className="shop-page">
        <div style={{ textAlign: "center", padding: "100px 20px", color: "#5483B3" }}>
          Loading products catalog...
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="shop-page">
        <div style={{ textAlign: "center", padding: "80px 20px", color: "#e63946" }}>
          <h2>Error Loading Products</h2>
          <p style={{ marginTop: "10px" }}>{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="shop-page">
      <div className="shop-header">
        <p className="shop-label">WELLFIT COLLECTION</p>
        <h1>{categoryTitle}</h1>
        <p>Explore our premium apparel designed for performance and everyday style.</p>
      </div>

      {productsList.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#666" }}>
          No products found in this category.
        </div>
      ) : (
        <div className="products-grid">
          {productsList.map((product) => (
            <Products key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}

export default Shop;