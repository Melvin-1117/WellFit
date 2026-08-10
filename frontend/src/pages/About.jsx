import { Link } from "react-router-dom";
import "./InfoPages.css";

function About() {
  return (
    <div className="info-page">
      <div className="info-header">
        <span className="info-badge">OUR STORY</span>
        <h1>About WellFit</h1>
        <p className="info-subtitle">
          Crafting modern, comfortable, and sustainable apparel designed to elevate your everyday lifestyle.
        </p>
      </div>

      <div className="info-container">
        {/* Hero Banner */}
        <div className="about-hero-banner">
          <h2>Elevating Everyday Style</h2>
          <p>
            Founded with a vision to merge contemporary aesthetics with effortless comfort, WellFit creates timeless apparel designed for real life. From versatile essentials to statement pieces, we empower you to look and feel your best.
          </p>
        </div>

        {/* Brand Mission & Vision */}
        <div className="info-card">
          <h2>Our Mission</h2>
          <p>
            At WellFit, we believe fashion should be accessible, sustainable, and crafted without compromise. Every garment is thoughtfully engineered using high-quality fabrics, precise tailoring, and ethical manufacturing practices.
          </p>
          <p>
            Whether you are dressing for work, weekend relaxation, or active pursuits, our collections are tailored to provide maximum durability, breathability, and timeless confidence.
          </p>
        </div>

        {/* Key Stats Strip */}
        <div className="stats-strip">
          <div className="stat-item">
            <h3>50K+</h3>
            <p>Happy Customers</p>
          </div>
          <div className="stat-item">
            <h3>100%</h3>
            <p>Eco-Friendly Packaging</p>
          </div>
          <div className="stat-item">
            <h3>500+</h3>
            <p>Curated Styles</p>
          </div>
          <div className="stat-item">
            <h3>24/7</h3>
            <p>Customer Support</p>
          </div>
        </div>

        {/* Core Values */}
        <div className="info-card">
          <h2>Our Core Values</h2>
          <div className="values-grid">
            <div className="value-box">
              <span className="value-icon">✨</span>
              <h3>Premium Quality</h3>
              <p>We source ultra-soft, long-lasting fabrics that maintain shape and vibrancy wash after wash.</p>
            </div>
            <div className="value-box">
              <span className="value-icon">🌿</span>
              <h3>Sustainability</h3>
              <p>Committed to eco-friendly production, zero plastic waste packaging, and ethical workplace practices.</p>
            </div>
            <div className="value-box">
              <span className="value-icon">⚡</span>
              <h3>Modern Design</h3>
              <p>Minimalist, versatile silhouettes designed to integrate seamlessly into your daily wardrobe.</p>
            </div>
            <div className="value-box">
              <span className="value-icon">🤝</span>
              <h3>Customer First</h3>
              <p>Your satisfaction is our focus—offering seamless shopping, 100% free pan-India delivery, and hassle-free returns.</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="cta-banner">
          <h2>Ready to Upgrade Your Wardrobe?</h2>
          <p>Explore our latest arrivals across Men’s, Women’s, and Kids apparel.</p>
          <Link to="/shop" className="btn-cta">
            Shop All Collections
          </Link>
        </div>
      </div>
    </div>
  );
}

export default About;
