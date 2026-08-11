/**
 * Returns the backend API URL dynamically based on environment.
 * - In production (Vercel build or deployed web app), defaults to the live Vercel backend URL.
 * - In local development, defaults to http://localhost:5000.
 * - VITE_API_URL in .env overrides when explicitly set to a remote server.
 */
export function getApiUrl() {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim() !== "" && !envUrl.includes("localhost")) {
    return envUrl.replace(/\/$/, "");
  }

  if (import.meta.env.PROD) {
    return "https://wellfit-backend.vercel.app";
  }

  return "http://localhost:5000";
}

export const API_URL = getApiUrl();
