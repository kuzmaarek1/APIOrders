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

    const functionCall = await prisma.functionCall.findUnique({
      where: { name: "fetchOrdersFromIdoSell" },
    });

    const now = new Date();
    const isFirstCall = !functionCall;
    const isMoreThan24Hours =
      functionCall && now - functionCall.lastRun >= 24 * 60 * 60 * 1000;

    if (isFirstCall) {
      console.log("This is the first call.");
    } else if (isMoreThan24Hours) {
      console.log("24 hours have passed since the last call.");
    } else {
      console.log(
        "This is not the first call. Last call was less than 24 hours ago."
      );
    }
    let dateStart, dateEnd;
    if (!isFirstCall) {
      dateEnd = now.toISOString().slice(0, 19).replace("T", " ");
      dateStart = functionCall.lastRun
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");
    }

    await prisma.functionCall.upsert({
      where: { name: "fetchOrdersFromIdoSell" },
      update: { lastRun: now },
      create: { name: "fetchOrdersFromIdoSell", lastRun: now },
    });

    let page = 0;
    let totalPages = 1;

    while (page !== totalPages) {
      if (!isMoreThan24Hours && !isFirstCall) {
        console.log(
          "Stopping the loop because 24 hours haven't passed and it's not the first call."
        );
        break;
      }

      const params = {
        orderPrepaidStatus: "orderPrepaidStatus",
        resultsPage: page,
      };

      if (!isFirstCall) {
        params.ordersRange = {
          ordersDateRange: {
            ordersDateBegin: dateStart,
            ordersDateEnd: dateEnd,
            ordersDateType: "add",
          },
        };
      }

      const requestBody = { params };
      console.log(
        requestBody.params.ordersRange.ordersDateRange.ordersDateBegin
      );
      console.log(requestBody.params.ordersRange.ordersDateRange.ordersDateEnd);

      const response = await axios.post(SEARCH_URL, requestBody, {
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          "X-API-KEY": process.env.API_KEY,
        },
      });

      const results = response.data.Results;

      if (page === 0 && response.data.resultsNumberPage > 1) {
        totalPages = response.data.resultsNumberPage;
      }

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
      console.log(`Page ${page}: ${results.length} orders saved.`);
      page++;
    }
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
