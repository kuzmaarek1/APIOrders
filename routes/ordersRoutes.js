const express = require("express");
const router = express.Router();
const auth = require("../utils/auth");
const {
  getAllOrders,
  getOrderById,
  downloadOrdersCSV,
} = require("../controllers/ordersController");

router.use(auth);

router.get("/", getAllOrders);
router.get("/csv", downloadOrdersCSV);
router.get("/csv/:id", getOrderById);

module.exports = router;
