function Products({ product }) {
  return (
    <div className="product-card">

      <div className="product-image-container">
        <img
          src={product.image}
          alt={product.name}
          className="product-image"
        />

        <button className="product-quick-view">
          QUICK VIEW
        </button>
      </div>

      <div className="product-info">
        <h3>{product.name}</h3>
        <p>₹{product.price}</p>
      </div>

    </div>
  );
}

export default Products;