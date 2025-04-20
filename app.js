const express = require("express");
const ordersRoutes = require("./routes/ordersRoutes");
require("dotenv").config();

const app = express();

app.use("/orders", ordersRoutes);

module.exports = app;
