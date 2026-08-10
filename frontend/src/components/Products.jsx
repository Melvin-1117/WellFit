import { Link } from "react-router-dom";

function Products({ product }) {
  const imageUrl = product.image || product.image_url || "/products/men/item1.jpg";

  return (
    <div className="product-card">
      <Link
        to={`/product/${product.id}`}
        className="product-image-link"
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <div className="product-image-container">
          <img
            src={imageUrl}
            alt={product.name}
            className="product-image"
            loading="lazy"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/300x400?text=WellFit";
            }}
          />

          <span className="product-quick-view">
            VIEW PRODUCT
          </span>
        </div>

        <div className="product-info">
          <h3>{product.name}</h3>
          <p>₹{product.price}</p>
        </div>
      </Link>
    </div>
  );
}

export default Products;