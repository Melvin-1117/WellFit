import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <p className="not-found-label">404 ERROR</p>
        <h1>Page Not Found</h1>
        <p className="not-found-description">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="not-found-button">
          RETURN TO HOME
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
