import { Link, useLocation } from "react-router-dom";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import "./OrderConfirmation.css";

function OrderConfirmation() {
  const location = useLocation();
  const order = location.state?.order;

  if (!order) {
    return (
      <section className="confirmation-page">
        <div className="confirmation-card">
          <h1>Order Not Found</h1>

          <p>
            We couldn't find the details for this order.
          </p>

          <Link
            to="/"
            className="confirmation-button"
          >
            CONTINUE SHOPPING
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="confirmation-page">
      <div className="confirmation-card">

        <div className="success-icon">
          <CheckCircleOutlinedIcon style={{ fontSize: 44, color: "#16a34a" }} />
        </div>

        <p className="confirmation-label">
          ORDER CONFIRMED
        </p>

        <h1>
          Thank You For Your Order!
        </h1>

        <p className="confirmation-message">
          Your order has been placed successfully.
        </p>

        <div className="order-details">

          <div className="detail-item">
            <span>ORDER ID</span>
            <strong>#{order.id}</strong>
          </div>

          <div className="detail-divider"></div>

          <div className="detail-item">
            <span>TOTAL</span>
            <strong>₹{order.total}</strong>
          </div>

        </div>

        <p className="confirmation-note">
          Your order has been successfully recorded.
        </p>

        <Link
          to="/"
          className="confirmation-button"
        >
          CONTINUE SHOPPING
        </Link>

      </div>
    </section>
  );
}

export default OrderConfirmation;