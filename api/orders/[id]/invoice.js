const app = require("../../../backend/server");

module.exports = (req, res) => {
  const id = req.query.id;
  req.url = `/api/orders/${id}/invoice`;
  return app(req, res);
};
