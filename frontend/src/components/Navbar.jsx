function Navbar() {
  return (
    <nav className="navbar">

      <div className="navbar-logo">
        WellFit
      </div>

      <div className="navbar-links">
        <a href="/">Home</a>
        <a href="/men">Men</a>
        <a href="/women">Women</a>
        <a href="/kids">Kids</a>
      </div>

      <div className="navbar-actions">
        <button className="login-button">Login</button>

        <button className="cart-button" aria-label="Shopping cart">
          🛒
        </button>
      </div>

    </nav>
  );
}

export default Navbar;