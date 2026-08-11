import { useState } from "react";
import { Link } from "react-router-dom";
import CartButton from "./CartButton";
import { useAuth } from "../context/AuthContext";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

function Navbar() {
  const { user, isAdmin, logout } = useAuth();
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
      <div className="navbar-logo">
        <Link to="/" onClick={closeMenu}>
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
            {isAdmin && (
              <Link
                to="/admin"
                className="login-button admin-badge-button"
                style={{ backgroundColor: "#052659", color: "#ffffff", borderColor: "#052659" }}
              >
                Admin Panel
              </Link>
            )}

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

      <button
        type="button"
        className="mobile-menu-button"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle navigation menu"
        aria-expanded={menuOpen}
      >
        {menuOpen ? (
          <CloseIcon style={{ fontSize: 24 }} />
        ) : (
          <MenuIcon style={{ fontSize: 24 }} />
        )}
      </button>

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
            {isAdmin && (
              <Link
                to="/admin"
                onClick={closeMenu}
                style={{ color: "#052659", fontWeight: 700 }}
              >
                Admin Panel
              </Link>
            )}

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