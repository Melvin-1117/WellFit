import { useState } from "react";
import "./Login.css";
function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    console.log("Login form:", formData);
  };

  return (
    <section className="auth-page">
      <div className="auth-card">

        <p className="auth-label">
          WELCOME BACK
        </p>

        <h1>Login</h1>

        <p className="auth-description">
          Sign in to continue to your WellFit account.
        </p>

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label htmlFor="email">
              Email
            </label>

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
            <label htmlFor="password">
              Password
            </label>

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
          >
            LOGIN
          </button>

        </form>

        <p className="auth-footer">
          Don't have an account?{" "}
          <a href="/register">
            Create one
          </a>
        </p>

      </div>
    </section>
  );
}

export default Login;