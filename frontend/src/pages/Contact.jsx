import { useState } from "react";
import { Link } from "react-router-dom";
import MailOutlinedIcon from "@mui/icons-material/MailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import "./InfoPages.css";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }
  };

  return (
    <div className="info-page">
      <div className="info-header">
        <span className="info-badge">GET IN TOUCH</span>
        <h1>Contact Us</h1>
        <p className="info-subtitle">
          Have a question about an order, size guide, or product? We’d love to hear from you.
        </p>
      </div>

      <div className="info-container">
        <div className="contact-layout">
          {/* Left Info Cards */}
          <div className="contact-info-cards">
            <div className="contact-info-card">
              <div className="contact-info-icon"><MailOutlinedIcon style={{ fontSize: 24 }} /></div>
              <div className="contact-info-content">
                <h3>Email Support</h3>
                <p>support@wellfit.in</p>
                <p>Response within 24 hours</p>
              </div>
            </div>

            <div className="contact-info-card">
              <div className="contact-info-icon"><PhoneOutlinedIcon style={{ fontSize: 24 }} /></div>
              <div className="contact-info-content">
                <h3>Phone & Hotline</h3>
                <p>+91 1800-200-WELL</p>
                <p>Mon - Sat: 9:00 AM - 7:00 PM IST</p>
              </div>
            </div>

            <div className="contact-info-card">
              <div className="contact-info-icon"><LocationOnOutlinedIcon style={{ fontSize: 24 }} /></div>
              <div className="contact-info-content">
                <h3>Headquarters</h3>
                <p>100 Fashion Hub, Lower Parel</p>
                <p>Mumbai, Maharashtra 400013, India</p>
              </div>
            </div>

            <div className="contact-info-card">
              <div className="contact-info-icon"><ChatBubbleOutlineOutlinedIcon style={{ fontSize: 24 }} /></div>
              <div className="contact-info-content">
                <h3>Live Chat</h3>
                <p>Available on our website 24/7 for instant support.</p>
              </div>
            </div>
          </div>

          {/* Right Form */}
          <div className="contact-form-container">
            <h2>Send Us a Message</h2>

            {submitted && (
              <div className="form-alert-success">
                <CheckCircleOutlinedIcon style={{ fontSize: 20, marginRight: 6 }} />
                <span>Thank you! Your message has been sent successfully. We'll get back to you shortly.</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Your Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Rahul Sharma"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="rahul@example.com"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Order Inquiry, Sizing, Feedback, etc."
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="How can we help you today?"
                  required
                />
              </div>

              <button type="submit" className="btn-submit">
                Send Message
              </button>
            </form>
          </div>
        </div>

        {/* Quick FAQ Section */}
        <div className="info-card">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-list">
            <div className="faq-item">
              <h3>How can I track my order?</h3>
              <p>
                Once your order dispatches, you will receive SMS and email updates with a live tracking link. You can also track your order under <Link to="/orders" style={{ color: "#052659", fontWeight: 600 }}>My Orders</Link> when logged in.
              </p>
            </div>

            <div className="faq-item">
              <h3>Is shipping free across India?</h3>
              <p>
                Yes! We offer <strong>100% Free Shipping on all orders</strong> across India with zero hidden fees or minimum order limits.
              </p>
            </div>

            <div className="faq-item">
              <h3>What is your return policy?</h3>
              <p>
                We offer hassle-free returns within 30 days of delivery with free doorstep pickup across India. Items must be unworn, unwashed, and in original condition with tags attached.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
