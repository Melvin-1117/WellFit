import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/products/${id}`);
        const data = await res.json();

        if (data.success && data.product) {
          setProduct(data.product);
        } else {
          setProduct(null);
        }
      } catch (err) {
        console.error("Error fetching product details:", err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, API_URL]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px", fontSize: "16px", color: "#5483B3" }}>
        Loading product details...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-not-found" style={{ textAlign: "center", padding: "80px 20px" }}>
        <h2>Product not found</h2>
        <p style={{ color: "#666", margin: "12px 0 24px" }}>
          The product you are looking for does not exist or has been removed.
        </p>
        <button
          type="button"
          className="add-to-cart-button"
          style={{ maxWidth: "200px", margin: "0 auto" }}
          onClick={() => navigate("/shop")}
        >
          RETURN TO SHOP
        </button>
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

  const STANDARD_SIZES = ["S", "M", "L", "XL"];
  const availableSizes =
    product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0
      ? product.sizes
      : STANDARD_SIZES;

  const allDisplaySizes = Array.from(
    new Set([...STANDARD_SIZES, ...availableSizes])
  );

  return (
    <section className="product-details">
      <div className="product-details-image">
        <img
          src={product.image || product.image_url}
          alt={product.name}
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/400x500?text=No+Image";
          }}
        />
      </div>

      <div className="product-details-info">
        <p className="product-category">
          {product.category ? product.category.toUpperCase() : "APPAREL"}
        </p>
        <h1>{product.name}</h1>
        <p className="product-price">
          ₹{product.price}
        </p>
        <p className="product-description">
          {product.description ||
            "Designed for comfort and everyday style. Discover premium quality and a look that fits effortlessly into your wardrobe."}
        </p>

        <div className="size-section">
          <h3>Select Size</h3>
          <div className="size-options">
            {allDisplaySizes.map((size) => {
              const isAvailable = availableSizes.includes(size);
              const isSelected = selectedSize === size;

              return (
                <button
                  key={size}
                  type="button"
                  disabled={!isAvailable}
                  className={`${isSelected ? "selected" : ""} ${
                    !isAvailable ? "unavailable" : ""
                  }`}
                  onClick={() => isAvailable && setSelectedSize(size)}
                  title={
                    isAvailable
                      ? `Select size ${size}`
                      : `Size ${size} is out of stock`
                  }
                >
                  {size}
                </button>
              );
            })}
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