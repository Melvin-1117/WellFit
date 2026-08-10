import { useState } from "react";
import { useCart } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "./Checkout.css";
function Checkout() {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (cart.length === 0) {
      alert("Your cart is empty.");
      navigate("/");
      return;
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        alert("Please login before placing an order.");
        navigate("/login");
        return;
      }

      const response = await fetch(
        `${API_URL}/api/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customer: formData,
            items: cart,
            total: subtotal,
            accessToken: session.access_token,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to place order"
        );
      }

      console.log("Order created:", data);

      clearCart();

      navigate("/order-confirmation", {
        state: {
          order: data.order,
        },
      });
    } catch (error) {
      console.error("Order failed:", error);

      alert(`Order failed: ${error.message}`);
    }
  };

  if (cart.length === 0) {
    return (
      <section className="checkout-page">
        <div className="empty-cart">
          <h2>Your cart is empty</h2>

          <p>
            Add some products before proceeding to checkout.
          </p>

          <Link to="/shop">
            CONTINUE SHOPPING
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="checkout-page">

      <div className="checkout-header">
        <p>COMPLETE YOUR ORDER</p>
        <h1>Checkout</h1>
      </div>

      <div className="checkout-container">

        {/* CUSTOMER FORM */}

        <div className="checkout-form">

          <h2>Contact Information</h2>

          <form onSubmit={handleSubmit}>

            <label>
              Full Name
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Email
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Phone
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </label>

            <h2>Shipping Address</h2>

            <label>
              Address
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              City
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              State
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              PIN Code
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                required
              />
            </label>

            <button type="submit">
              PLACE ORDER
            </button>

          </form>
        </div>

        {/* ORDER SUMMARY */}

        <div className="order-summary">

          <h2>Your Order</h2>

          {cart.map((item) => (
            <div
              className="checkout-item"
              key={`${item.id}-${item.size}`}
            >
              <div>
                <h3>{item.name}</h3>

                <p>Size: {item.size}</p>

                <p>Qty: {item.quantity}</p>
              </div>

              <strong>
                ₹{item.price * item.quantity}
              </strong>
            </div>
          ))}

          <div className="checkout-total">
            <span>Total</span>

            <strong>
              ₹{subtotal}
            </strong>
          </div>

        </div>

      </div>

    </section>
  );
}

export default Checkout;