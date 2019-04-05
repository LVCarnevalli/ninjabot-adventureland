const colors = require("colors");

const log = (type, message, runner) => {
  if (runner) {
    console.log(
      `[NB][${new Date().toISOString()}][${type}][${colors.green(
        runner.name
      )}] ${message}`
    );
  } else {
    console.log(`[NB][${new Date().toISOString()}][${type}] ${message}`);
  }
};

module.exports = {
  log: (message, runner) => log("LOG", message, runner),
  info: (message, runner) => log("INFO", colors.green(message), runner),
  error: (message, runner) => log("ERROR", colors.red(message), runner),
  monitor: (message, runner) => log("MONITOR", colors.yellow(message), runner)
};
