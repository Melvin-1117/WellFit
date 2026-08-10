import { Link } from "react-router-dom";
import "./InfoPages.css";

function Privacy() {
  return (
    <div className="info-page">
      <div className="info-header">
        <span className="info-badge">LEGAL & SAFETY</span>
        <h1>Privacy Policy</h1>
        <p className="info-subtitle">
          Your privacy is important to us. Learn how WellFit collects, protects, and handles your personal information.
        </p>
      </div>

      <div className="info-container">
        <div className="info-card">
          <h2>1. Overview & Commitment</h2>
          <p>
            WellFit ("we", "our", or "us") is dedicated to safeguarding the privacy of our visitors and customers. This Privacy Policy outlines the types of information we collect when you visit our website, place an order, or communicate with us, and how we protect and use that data.
          </p>
        </div>

        <div className="info-card">
          <h2>2. Information We Collect</h2>
          <p>We may collect personal information necessary to fulfill your orders and enhance your shopping experience, including:</p>
          <ul className="policy-list">
            <li><strong>Contact Details:</strong> Your name, email address, phone number, and shipping/billing address.</li>
            <li><strong>Payment Information:</strong> Encrypted transaction data processed securely via compliant payment gateways (we do not store credit card numbers directly).</li>
            <li><strong>Account Credentials:</strong> Username and hashed passwords when you register an account.</li>
            <li><strong>Browsing & Technical Data:</strong> IP address, device type, browser information, and pages visited via cookies and analytics.</li>
          </ul>
        </div>

        <div className="info-card">
          <h2>3. How We Use Your Information</h2>
          <p>Your information is used strictly for legitimate business purposes:</p>
          <ul className="policy-list">
            <li>To process, ship, and track your merchandise orders.</li>
            <li>To communicate order status updates, delivery notifications, and customer support responses.</li>
            <li>To personalize your shopping experience and recommend tailored product collections.</li>
            <li>To maintain network security, prevent fraud, and comply with legal requirements.</li>
          </ul>
        </div>

        <div className="info-card">
          <h2>4. Data Protection & Security</h2>
          <p>
            We employ industry-standard physical, technical, and administrative security measures, including 256-bit SSL encryption for data transmission and secure server hosting. Access to personal customer data is strictly restricted to authorized staff only.
          </p>
        </div>

        <div className="info-card">
          <h2>5. Cookies & Analytics</h2>
          <p>
            WellFit uses essential cookies to enable shopping cart functionality, remember user preferences, and analyze web traffic performance. You may disable cookies in your browser settings at any time, though some website features may function with reduced capability.
          </p>
        </div>

        <div className="info-card">
          <h2>6. Your Data Rights</h2>
          <p>
            You have the right to request access to, correction of, or deletion of your personal data stored by WellFit. To exercise your privacy rights or opt out of promotional emails, please contact our Privacy Data Officer.
          </p>
        </div>

        <div className="cta-banner">
          <h2>Questions Regarding Your Privacy?</h2>
          <p>Our dedicated privacy officer is here to answer any questions or concerns.</p>
          <Link to="/contact" className="btn-cta">
            Contact Privacy Officer
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Privacy;
