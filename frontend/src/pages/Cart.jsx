import { useCart } from "../context/CartContext";

function Cart() {
  const { cart } = useCart();

  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  if (cart.length === 0) {
    return (
      <section className="cart-page empty-cart">
        <h1>Your Cart</h1>

        <p>Your cart is currently empty.</p>

        <a href="/">CONTINUE SHOPPING</a>
      </section>
    );
  }

  return (
    <section className="cart-page">

      <div className="cart-header">
        <p>YOUR SHOPPING BAG</p>
        <h1>Your Cart</h1>
      </div>

      <div className="cart-layout">

        <div className="cart-items">

          {cart.map((item, index) => (
            <div
              className="cart-item"
              key={`${item.id}-${item.size}-${index}`}
            >
              <img
                src={item.image}
                alt={item.name}
              />

              <div className="cart-item-info">
                <h3>{item.name}</h3>

                <p>Size: {item.size}</p>

                <p>Quantity: {item.quantity}</p>

                <p className="cart-item-price">
                  ₹{item.price * item.quantity}
                </p>
              </div>
            </div>
          ))}

        </div>

        <div className="cart-summary">

          <h2>Order Summary</h2>

          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{subtotal}</span>
          </div>

          <div className="summary-row">
            <span>Shipping</span>
            <span>FREE</span>
          </div>

          <div className="summary-divider"></div>

          <div className="summary-total">
            <span>Total</span>
            <span>₹{subtotal}</span>
          </div>

          <button className="checkout-button">
            PROCEED TO CHECKOUT
          </button>

        </div>

      </div>

    </section>
  );
}

export default Cart;