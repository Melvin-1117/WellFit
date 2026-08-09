import { Link } from "react-router-dom";
import CartButton from "./CartButton";

function Navbar() {
  return (
    <nav className="navbar">

      <div className="navbar-logo">
        <Link to="/">
          WellFit
        </Link>
      </div>

      <div className="navbar-links">
        <Link to="/">Home</Link>

        <Link to="/men">Men</Link>

        <Link to="/women">Women</Link>

        <Link to="/kids">Kids</Link>
      </div>

      <div className="navbar-actions">
        <button className="login-button">
          Login
        </button>

        <CartButton />
      </div>

    </nav>
  );
}

export default Navbar;