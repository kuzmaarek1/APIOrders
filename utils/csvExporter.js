const { createObjectCsvWriter } = require("csv-writer");
const path = require("path");

const exportToCSV = async (orders, filename = "orders") => {
  const csvPath = path.join(__dirname, `../data/${filename}.csv`);

  const csvWriter = createObjectCsvWriter({
    path: csvPath,
    header: [
      { id: "orderID", title: "Order ID" },
      { id: "productID", title: "Product ID" },
      { id: "quantity", title: "Quantity" },
      { id: "orderWorth", title: "Order Worth" },
    ],
  });

  const records = orders.flatMap((order) =>
    order.products.map((product) => ({
      orderID: order.orderID,
      productID: product.productID,
      quantity: product.quantity,
      orderWorth: order.orderWorth,
    }))
  );

  await csvWriter.writeRecords(records);
  return csvPath;
};

module.exports = { exportToCSV };
