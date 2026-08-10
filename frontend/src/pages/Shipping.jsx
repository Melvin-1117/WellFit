import { Link } from "react-router-dom";
import "./InfoPages.css";

function Shipping() {
  return (
    <div className="info-page">
      <div className="info-header">
        <span className="info-badge">100% FREE DELIVERY & EASY RETURNS</span>
        <h1>Shipping & Returns</h1>
        <p className="info-subtitle">
          Everything you need to know about our 100% free pan-India delivery, order tracking, and 30-day hassle-free returns.
        </p>
      </div>

      <div className="info-container">
        {/* Shipping & Delivery Timelines */}
        <div className="info-card">
          <h2>Shipping & Delivery Timelines</h2>

          <div className="free-shipping-highlight">
            <div className="free-shipping-icon">🚚</div>
            <div>
              <h3>100% Free Shipping Across India</h3>
              <p>No delivery fees, no minimum cart requirement, and zero hidden charges on any order nationwide.</p>
            </div>
          </div>

          <div className="shipping-timeline-grid">
            <div className="timeline-card">
              <div className="timeline-header">
                <h3>Metro Cities</h3>
                <span className="timeline-badge metro">FASTEST</span>
              </div>
              <div className="timeline-duration">2 – 3 Business Days</div>
              <p className="timeline-desc">Delhi NCR, Mumbai, Bengaluru, Hyderabad, Chennai, Kolkata, Pune & Ahmedabad.</p>
              <ul className="timeline-features">
                <li>✓ Express courier dispatch</li>
                <li>✓ Real-time SMS & WhatsApp updates</li>
              </ul>
            </div>

            <div className="timeline-card">
              <div className="timeline-header">
                <h3>Tier 2 & Tier 3 Cities</h3>
                <span className="timeline-badge standard">STANDARD</span>
              </div>
              <div className="timeline-duration">3 – 5 Business Days</div>
              <p className="timeline-desc">Covering 19,000+ PIN codes across all Indian states and union territories.</p>
              <ul className="timeline-features">
                <li>✓ Doorstep delivery</li>
                <li>✓ Safe contactless handover</li>
              </ul>
            </div>

            <div className="timeline-card">
              <div className="timeline-header">
                <h3>Special & Hilly Regions</h3>
                <span className="timeline-badge remote">REMOTE</span>
              </div>
              <div className="timeline-duration">5 – 7 Business Days</div>
              <p className="timeline-desc">North-East states, Jammu & Kashmir, Ladakh, Andaman & Nicobar, and Lakshadweep.</p>
              <ul className="timeline-features">
                <li>✓ Speed Post & Air Cargo routing</li>
                <li>✓ Delivery confirmation OTP</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Returns & Exchanges Process */}
        <div className="info-card">
          <h2>30-Day Easy Returns & Exchanges</h2>
          <p>
            We want you to love your WellFit apparel. If a fit isn't quite right or you've changed your mind, you can return or exchange any item free of charge within 30 days of delivery.
          </p>

          <div className="steps-process">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Initiate Return</h3>
              <p>Log in to your account and select the order item you wish to return or exchange.</p>
            </div>

            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Free Doorstep Pickup</h3>
              <p>Our courier partner will pick up the package directly from your doorstep at no cost.</p>
            </div>

            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Quality Check</h3>
              <p>Items are inspected for original tags and condition upon arrival at our fulfillment center.</p>
            </div>

            <div className="step-card">
              <div className="step-number">4</div>
              <h3>Instant Refund</h3>
              <p>Refunds are credited back to your bank account or original payment method within 24–48 hours.</p>
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div className="info-card">
          <h2>Return Eligibility Requirements</h2>
          <ul className="policy-list">
            <li>Items must be returned within <strong>30 days</strong> of delivery date.</li>
            <li>Items must be unworn, unwashed, and free of stains, odors, or pet hair.</li>
            <li>Original garment tags must remain attached.</li>
            <li>Free reverse pickup is available nationwide across India.</li>
          </ul>
        </div>

        {/* CTA */}
        <div className="cta-banner">
          <h2>Need Help with an Order?</h2>
          <p>Our India customer support team is available around the clock to assist with tracking and returns.</p>
          <Link to="/contact" className="btn-cta">
            Contact Support Team
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Shipping;
