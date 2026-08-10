import { Link } from "react-router-dom";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import IconButton from "@mui/material/IconButton";
import { useCart } from "../context/CartContext";

function CartButton() {
  const { cart } = useCart();
  const itemCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );
  return (
    <Link
      to="/cart"
      className="cart-link"
      aria-label={`Shopping cart with ${itemCount} items`}
    >
      <IconButton aria-label={`Shopping cart with ${itemCount} items`}>
        <ShoppingCartIcon />
        {itemCount > 0 && (
          <span className="cart-count">
            {itemCount}
          </span>
        )}
      </IconButton>
    </Link>
  );
}

export default CartButton;