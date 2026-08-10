import { useState } from "react";
import { Link } from "react-router-dom";
import CartButton from "./CartButton";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">

      {/* Logo */}
      <div className="navbar-logo">
        <Link to="/" onClick={closeMenu}>
          WellFit
        </Link>
      </div>

      {/* Desktop Navigation */}
      <div className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/men">Men</Link>
        <Link to="/women">Women</Link>
        <Link to="/kids">Kids</Link>
      </div>

      {/* Desktop Actions */}
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

      {/* Mobile Menu Button */}
      <button
        type="button"
        className="mobile-menu-button"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle navigation menu"
      >
        {menuOpen ? "✕" : "☰"}
      </button>

      {/* Mobile Menu */}
      <div
        className={`mobile-menu ${
          menuOpen ? "mobile-menu-open" : ""
        }`}
      >

        <Link
          to="/"
          onClick={closeMenu}
        >
          Home
        </Link>

        <Link
          to="/men"
          onClick={closeMenu}
        >
          Men
        </Link>

        <Link
          to="/women"
          onClick={closeMenu}
        >
          Women
        </Link>

        <Link
          to="/kids"
          onClick={closeMenu}
        >
          Kids
        </Link>

        {user ? (
          <>
            <Link
              to="/orders"
              onClick={closeMenu}
            >
              My Orders
            </Link>

            <button
              type="button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            to="/login"
            onClick={closeMenu}
          >
            Login
          </Link>
        )}

        <div className="mobile-cart">
          <CartButton />
        </div>

      </div>

    </nav>
  );
}

export default Navbar;