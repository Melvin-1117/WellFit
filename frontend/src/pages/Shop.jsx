import { useState } from "react";
import Products from "../components/Products";
import products from "../data/products";

function Shop() {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredProducts =
    activeCategory === "all"
      ? products
      : products.filter(
          (product) => product.category === activeCategory
        );

  return (
    <section className="shop-section">

      <div className="shop-header">
        <p className="shop-label">OUR COLLECTION</p>

        <h2>Shop Our Collection</h2>

        <p className="shop-description">
          Discover styles designed for every moment.
        </p>
      </div>

      <div className="category-filters">

        <button
          className={activeCategory === "all" ? "active" : ""}
          onClick={() => setActiveCategory("all")}
        >
          ALL
        </button>

        <button
          className={activeCategory === "men" ? "active" : ""}
          onClick={() => setActiveCategory("men")}
        >
          MEN
        </button>

        <button
          className={activeCategory === "women" ? "active" : ""}
          onClick={() => setActiveCategory("women")}
        >
          WOMEN
        </button>

        <button
          className={activeCategory === "kids" ? "active" : ""}
          onClick={() => setActiveCategory("kids")}
        >
          KIDS
        </button>

      </div>

      <div className="product-grid">

        {filteredProducts.map((product) => (
          <Products
            key={product.id}
            product={product}
          />
        ))}

      </div>

    </section>
  );
}

export default Shop;