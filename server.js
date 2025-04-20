const app = require("./app");
const cron = require("node-cron");
const { fetchOrdersFromIdoSell } = require("./services/idoSellService");

const PORT = process.env.PORT || 3000;

cron.schedule("0 0 * * *", fetchOrdersFromIdoSell);

fetchOrdersFromIdoSell();

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
