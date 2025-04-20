const fs = require("fs");
const path = require("path");
const { exportToCSV } = require("../utils/csvExporter");
const { downloadAndDelete } = require("../utils/fileHandler");

const ordersFile = path.join(__dirname, "../data/orders.json");

const loadFilteredOrders = (req) => {
  const { minWorth, maxWorth } = req;
  console.log(minWorth, maxWorth);
  let orders = JSON.parse(fs.readFileSync(ordersFile));

  if (minWorth) {
    orders = orders.filter((o) => o.orderWorth >= parseFloat(minWorth));
  }
  if (maxWorth) {
    orders = orders.filter((o) => o.orderWorth <= parseFloat(maxWorth));
  }

  return orders;
};

const getAllOrders = (req, res) => {
  const orders = loadFilteredOrders(req.query);
  res.json(orders);
};

const getOrderById = async (req, res) => {
  const orders = loadFilteredOrders(req.query);

  const order = orders.find((o) => o.orderID === req.params.id);

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  const csvPath = await exportToCSV([order], `order-${order.orderID}`);
  downloadAndDelete(res, csvPath);
};

const downloadOrdersCSV = async (req, res) => {
  const orders = loadFilteredOrders(req.query);

  const csvPath = await exportToCSV(orders);
  downloadAndDelete(res, csvPath);
};

module.exports = {
  getAllOrders,
  getOrderById,
  downloadOrdersCSV,
};
