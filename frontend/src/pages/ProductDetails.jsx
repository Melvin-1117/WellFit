import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import products from "../data/products";
import { useCart } from "../context/CartContext";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const product = products.find(
    (item) => item.id === Number(id)
  );
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <div className="product-not-found">
        <h2>Product not found</h2>
      </div>
    );
  }

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Please select a size");
      return;
    }

    addToCart(product, selectedSize, quantity);

    const isMobile = window.innerWidth <= 700;
    if (isMobile) {
      if (window.history.length > 2) {
        navigate(-1);
      } else {
        navigate("/shop");
      }
    } else {
      alert("Product added to cart!");
    }
  };

  return (
    <section className="product-details">
      <div className="product-details-image">
        <img
          src={product.image}
          alt={product.name}
        />
      </div>

      <div className="product-details-info">
        <p className="product-category">
          {product.category.toUpperCase()}
        </p>
        <h1>{product.name}</h1>
        <p className="product-price">
          ₹{product.price}
        </p>
        <p className="product-description">
          Designed for comfort and everyday style.
          Discover premium quality and a look that
          fits effortlessly into your wardrobe.
        </p>

        <div className="size-section">
          <h3>Select Size</h3>
          <div className="size-options">
            {["S", "M", "L", "XL"].map((size) => (
              <button
                key={size}
                type="button"
                className={
                  selectedSize === size ? "selected" : ""
                }
                onClick={() => setSelectedSize(size)}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div className="quantity-section">
          <h3>Quantity</h3>
          <div className="quantity-control">
            <button type="button" onClick={decreaseQuantity}>
              −
            </button>
            <span>{quantity}</span>
            <button type="button" onClick={increaseQuantity}>
              +
            </button>
          </div>
        </div>

        <button
          type="button"
          className="add-to-cart-button"
          onClick={handleAddToCart}
        >
          ADD TO CART
        </button>
      </div>
    </section>
  );
}

export default ProductDetails;