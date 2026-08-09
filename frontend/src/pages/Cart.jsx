import { useCart } from "../context/CartContext";
import { useNavigate, Link } from "react-router-dom";

function Cart() {
  const {
    cart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
  } = useCart();

  const navigate = useNavigate();

  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  if (cart.length === 0) {
    return (
      <section className="cart-page empty-cart">

        <p className="cart-label">
          YOUR SHOPPING BAG
        </p>

        <h1>Your Cart Is Empty</h1>

        <p>
          Looks like you haven't added anything yet.
        </p>

        <Link to="/">
          CONTINUE SHOPPING
        </Link>

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

          {cart.map((item) => (
            <div
              className="cart-item"
              key={`${item.id}-${item.size}`}
            >

              <img
                src={item.image}
                alt={item.name}
              />

              <div className="cart-item-info">

                <h3>{item.name}</h3>

                <p>
                  Size: {item.size}
                </p>

                <p className="cart-item-unit-price">
                  ₹{item.price}
                </p>

                <div className="cart-item-actions">

                  <div className="cart-quantity">

                    <button
                      onClick={() =>
                        decreaseQuantity(
                          item.id,
                          item.size
                        )
                      }
                    >
                      −
                    </button>

                    <span>
                      {item.quantity}
                    </span>

                    <button
                      onClick={() =>
                        increaseQuantity(
                          item.id,
                          item.size
                        )
                      }
                    >
                      +
                    </button>

                  </div>

                  <button
                    className="remove-button"
                    onClick={() =>
                      removeFromCart(
                        item.id,
                        item.size
                      )
                    }
                  >
                    REMOVE
                  </button>

                </div>

              </div>

              <div className="cart-item-total">
                ₹{item.price * item.quantity}
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

          <button
            className="checkout-button"
            onClick={() => navigate("/checkout")}
          >
            PROCEED TO CHECKOUT
          </button>

        </div>

      </div>

    </section>
  );
}

export default Cart;