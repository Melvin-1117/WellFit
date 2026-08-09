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
      ? "Shop Our Collection"
      : `Shop ${category.charAt(0).toUpperCase() + category.slice(1)}`;

  return (
    <section className="shop-section">
      
      <div className="shop-header">
        <p className="shop-label">
          OUR COLLECTION
        </p>

        <h2>{categoryTitle}</h2>

        <p className="shop-description">
          Discover styles designed for every moment.
        </p>
      </div>

      <div className="category-filters">

  <Link to="/shop">
    ALL
  </Link>

  <Link to="/men">
    MEN
  </Link>

  <Link to="/women">
    WOMEN
  </Link>

  <Link to="/kids">
    KIDS
  </Link>

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