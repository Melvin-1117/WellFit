import { Link } from "react-router-dom";
import CartButton from "./CartButton";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

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

        {user ? (
          <>
            <Link
              to="/orders"
              className="login-button"
            >
              My Orders
            </Link>

            <button
              type="button"
              className="login-button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="login-button"
          >
            Login
          </Link>
        )}

        <CartButton />

      </div>

    </nav>
  );
}

export default Navbar;