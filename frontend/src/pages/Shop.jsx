import Products from "../components/Products";
import products from "../data/products";
import { Link } from "react-router-dom";

function Shop({ category = "all" }) {
  const filteredProducts =
    category === "all"
      ? products
      : products.filter(
          (product) => product.category === category
        );

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