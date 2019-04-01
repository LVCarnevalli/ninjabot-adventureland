const logs = require("./logs");

exports.on = async (page) => {
  await page.exposeFunction("nb_logError", text =>
    logs.error(text)
  );
  await page.exposeFunction("nb_logInfo", text =>
    logs.info(text)
  );
};