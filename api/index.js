const app = require("../backend/server");

module.exports = (req, res) => {
  // If Vercel rewritten URL to /api/index.js, restore original path from Vercel headers or query
  const matchedPath = req.headers["x-matched-path"] || req.headers["x-now-route-matches"];
  if (matchedPath) {
    req.url = matchedPath;
  }
  return app(req, res);
};
