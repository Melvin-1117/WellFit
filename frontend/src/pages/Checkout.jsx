import { useState } from "react";
import { useCart } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
function Checkout() {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
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
        "http://localhost:5000/api/orders",
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

  alert(
    `Order failed: ${error.message}`
  );
}
  };
  if (cart.length === 0) {
    return (
      <section className="checkout-empty">
        <h1>Your cart is empty</h1>
        <p>
          Add some products before proceeding to checkout.
        </p>
        <Link to="/">
          CONTINUE SHOPPING
        </Link>

      </section>
    );
  }
  return (
    <section className="checkout-page">
      <div className="checkout-header">
        <p>COMPLETE YOUR ORDER</p>
        <h1>Checkout</h1>
      </div>
      <div className="checkout-layout">
        {/* CUSTOMER FORM */}
        <form
          className="checkout-form"
          onSubmit={handleSubmit}
        >
          <h2>Contact Information</h2>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone number"
                required
              />
            </div>
          </div>
          <h2 className="shipping-title">
            Shipping Address
          </h2>
          <div className="form-group">
            <label>Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="House number, street, area"
              rows="3"
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
                required
              />
            </div>
            <div className="form-group">
              <label>State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="State"
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label>PIN Code</label>
            <input
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              placeholder="PIN code"
              required
            />
          </div>
          <button
            type="submit"
            className="place-order-button"
          >
            PLACE ORDER
          </button>
        </form>
        {/* ORDER SUMMARY */}
        <div className="checkout-summary">
          <h2>Your Order</h2>
          <div className="checkout-items">
            {cart.map((item) => (
              <div
                className="checkout-item"
                key={`${item.id}-${item.size}`}
              >
                <img
                  src={item.image}
                  alt={item.name}
                />
                <div>
                  <h3>{item.name}</h3>
                  <p>
                    Size: {item.size}
                  </p>
                  <p>
                    Qty: {item.quantity}
                  </p>
                </div>
               <span>
                  ₹{item.price * item.quantity}
                </span>
              </div>
            ))}
          </div>
          <div className="checkout-divider"></div>
          <div className="checkout-total">
            <span>
              Total
            </span>
            <span>
              ₹{subtotal}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Checkout;