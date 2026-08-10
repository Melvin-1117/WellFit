import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            WellFit
          </Link>
          <p className="footer-tagline">
            Fashion for everyone. Elevate your everyday style with modern, comfortable apparel.
          </p>
        </div>

        <div className="footer-column">
          <h4>SHOP</h4>
          <Link to="/shop">All Collection</Link>
          <Link to="/men">Men's Apparel</Link>
          <Link to="/women">Women's Apparel</Link>
          <Link to="/kids">Kids Collection</Link>
        </div>

        <div className="footer-column">
          <h4>HELP & INFO</h4>
          <Link to="/about">About Us</Link>
          <Link to="/contact">Contact Us</Link>
          <Link to="/shipping">Shipping & Returns</Link>
          <Link to="/privacy">Privacy Policy</Link>
        </div>

        <div className="footer-column">
          <h4>CONNECT</h4>
          <div className="footer-socials">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
              Instagram
            </a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
              Facebook
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter">
              Twitter
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 WellFit Inc. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
