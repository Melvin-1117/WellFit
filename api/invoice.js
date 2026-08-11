const app = require("../backend/server");

module.exports = (req, res) => {
  req.url = "/api/invoice";
  return app(req, res);
};
