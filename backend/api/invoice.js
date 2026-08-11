const app = require("../server");

module.exports = (req, res) => {
  req.url = "/api/invoice";
  return app(req, res);
};
