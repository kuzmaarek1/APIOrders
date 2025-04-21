const axios = require("axios");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const prisma = new PrismaClient();
const DOMAIN = process.env.DOMAIN;
const SEARCH_URL = `${DOMAIN}/api/admin/v5/orders/orders/search`;
//const ORDER_URL = (id) => `${DOMAIN}/api/admin/v5/orders/orders/${id}`;

const fetchOrdersFromIdoSell = async () => {
  try {
    console.log("Fetching order list...");

    const response = await axios.post(
      SEARCH_URL,
      { params: { orderPrepaidStatus: "orderPrepaidStatus" } },
      {
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          "X-API-KEY": process.env.API_KEY,
        },
      }
    );

    const results = response.data.Results;

    if (!results || results.length === 0) {
      console.log("No orders found.");
      return;
    }

    for (const result of results) {
      const orderId = result.orderId;
      const products = result.orderDetails.productsResults || [];
      const worth =
        result.orderDetails?.payments?.orderCurrency?.orderProductsCost || 0;

      const formattedOrder = {
        orderID: orderId,
        products: products.map((p) => ({
          productID: p.productId,
          quantity: p.productQuantity,
        })),
        orderWorth: worth,
      };

      await prisma.order.upsert({
        where: { orderID: orderId },
        update: formattedOrder,
        create: formattedOrder,
      });
    }

    console.log(`${results.length} orders saved to database.`);
  } catch (err) {
    if (err.response) {
      console.error("API error:", err.response.status, err.response.data);
    } else {
      console.error("Unexpected error:", err.message);
    }
  }
};

module.exports = {
  fetchOrdersFromIdoSell,
};
