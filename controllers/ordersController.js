const { PrismaClient } = require("@prisma/client");
const { exportAndStreamCSV } = require("../utils/exportAndStreamCSV");

const prisma = new PrismaClient();

const loadFilteredOrders = async (req) => {
  const { minWorth, maxWorth } = req;

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
    res
      .status(500)
      .json({ message: "Error fetching orders", error: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { orderID: req.params.id },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    await exportAndStreamCSV(res, [order], `order-${order.orderID}`);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching order", error: error.message });
  }
};

const downloadOrdersCSV = async (req, res) => {
  try {
    const orders = await loadFilteredOrders(req.query);
    await exportAndStreamCSV(res, orders, "orders");
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error downloading orders", error: error.message });
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  downloadOrdersCSV,
};
