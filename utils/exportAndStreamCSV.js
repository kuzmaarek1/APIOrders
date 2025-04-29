const { createObjectCsvStringifier } = require("csv-writer");

const exportAndStreamCSV = async (res, orders, filename = "orders") => {
  const csvStringifier = createObjectCsvStringifier({
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

  const header = csvStringifier.getHeaderString();
  const csvData = csvStringifier.stringifyRecords(records);

  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${filename}.csv"`
  );

  res.write(header);
  res.write(csvData);
  res.end();
};

module.exports = { exportAndStreamCSV };
