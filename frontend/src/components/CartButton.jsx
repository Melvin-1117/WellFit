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
    <Link to="/cart" className="cart-link">
      <IconButton>
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