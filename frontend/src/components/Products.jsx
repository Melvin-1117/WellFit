import { Link } from "react-router-dom";

function Products({ product }) {
  return (
    <div className="product-card">
      <Link
        to={`/product/${product.id}`}
        className="product-image-link"
      >
        <div className="product-image-container">
          <img
            src={product.image}
            alt={product.name}
            className="product-image"
            loading="lazy"
          />

          <span className="product-quick-view">
            VIEW PRODUCT
          </span>
        </div>
      </Link>

      <div className="product-info">
        <h3>{product.name}</h3>
        <p>₹{product.price}</p>
      </div>
    </div>
  );
}

export default Products;