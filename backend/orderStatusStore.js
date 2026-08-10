const fs = require("fs");
const path = require("path");

const isVercel = Boolean(process.env.VERCEL);
const STATUS_FILE = isVercel
  ? path.join("/tmp", "orderStatuses.json")
  : path.join(__dirname, "orderStatuses.json");

function loadStatuses() {
  try {
    if (fs.existsSync(STATUS_FILE)) {
      const data = fs.readFileSync(STATUS_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading orderStatuses.json:", err);
  }
  return {};
}

function saveStatuses(statuses) {
  try {
    fs.writeFileSync(STATUS_FILE, JSON.stringify(statuses, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing orderStatuses.json:", err);
  }
}

let memoryStatuses = loadStatuses();

function getOrderStatus(orderId) {
  return memoryStatuses[String(orderId)] || "Pending";
}

function setOrderStatus(orderId, status) {
  memoryStatuses[String(orderId)] = status;
  saveStatuses(memoryStatuses);
}

module.exports = {
  getOrderStatus,
  setOrderStatus,
};
