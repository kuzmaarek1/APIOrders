const { PrismaClient } = require("@prisma/client");
const { exportToCSV } = require("../utils/csvExporter");
const { downloadAndDelete } = require("../utils/fileHandler");

const prisma = new PrismaClient();

const loadFilteredOrders = async (req) => {
  const { minWorth, maxWorth } = req;
  console.log(minWorth, maxWorth);
  
  let whereClause = {};
  
  if (minWorth || maxWorth) {
    whereClause.orderWorth = {};
    if (minWorth) whereClause.orderWorth.gte = parseFloat(minWorth);
    if (maxWorth) whereClause.orderWorth.lte = parseFloat(maxWorth);
  }

  return await prisma.order.findMany({ where: whereClause });
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await loadFilteredOrders(req.query);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { orderID: req.params.id }
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const csvPath = await exportToCSV([order], `order-${order.orderID}`);
    downloadAndDelete(res, csvPath);
  } catch (error) {
    res.status(500).json({ message: "Error fetching order", error: error.message });
  }
};

const downloadOrdersCSV = async (req, res) => {
  try {
    const orders = await loadFilteredOrders(req.query);
    const csvPath = await exportToCSV(orders);
    downloadAndDelete(res, csvPath);
  } catch (error) {
    res.status(500).json({ message: "Error downloading orders", error: error.message });
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  downloadOrdersCSV,
};
