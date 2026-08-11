const app = require("../backend/server");

module.exports = (req, res) => {
  if (req.query && req.query.path) {
    const p = Array.isArray(req.query.path) ? req.query.path.join("/") : req.query.path;
    req.url = "/api/" + p;
  }
  return app(req, res);
};
