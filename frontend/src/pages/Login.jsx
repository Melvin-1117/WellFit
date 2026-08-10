import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

function Login() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setError("");
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    const cleanEmail = formData.email.trim();

    try {
      const { data, error: authError } =
        await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: formData.password,
        });

      if (authError) {
        throw authError;
      }

      if (data?.session) {
        navigate("/", { replace: true });
      }
    } catch (err) {
      console.error("Login failed:", err);
      let message = err.message || "Failed to log in. Please try again.";
      if (message.toLowerCase().includes("email not confirmed")) {
        message = "Your email address has not been confirmed yet. Please check your inbox for the confirmation link.";
      } else if (message.toLowerCase().includes("invalid login credentials")) {
        message = "Invalid email or password. If you recently registered, please confirm your email in Supabase or verify your credentials.";
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-card">
        <p className="auth-label">WELCOME BACK</p>

        <h1>Login</h1>

        <p className="auth-description">
          Sign in to continue to your WellFit account.
        </p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? "LOGGING IN..." : "LOGIN"}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account?{" "}
          <Link to="/register">
            Create one
          </Link>
        </p>
      </div>
    </section>
  );
}

export default Login;