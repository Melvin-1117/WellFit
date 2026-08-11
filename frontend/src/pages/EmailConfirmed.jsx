import { Link } from "react-router-dom";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import "./Login.css";

function EmailConfirmed() {
  return (
    <section className="auth-page">
      <div className="auth-card">

        <div className="success-icon">
          <CheckCircleOutlinedIcon style={{ fontSize: 44, color: "#16a34a" }} />
        </div>

        <p className="auth-label">
          EMAIL VERIFIED
        </p>

        <h1>Email Confirmed</h1>

        <p className="auth-description">
          Your email address has been successfully verified.
          You can now log in to your WellFit account.
        </p>

        <Link
          to="/login"
          className="auth-button"
          style={{
            display: "block",
            textAlign: "center",
            textDecoration: "none",
            boxSizing: "border-box",
          }}
        >
          GO TO LOGIN
        </Link>

      </div>
    </section>
  );
}

export default EmailConfirmed;