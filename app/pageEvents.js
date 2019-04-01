const logs = require("./logs");

exports.on = async (page) => {
  await page.on("error", err => {
    logs.error(err, runner);
  });
};