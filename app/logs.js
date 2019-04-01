const colors = require("colors");

const log = (message, runner) => {
    if (runner) {
        console.log(`[NB][${new Date().toISOString()}][${colors.green(runner.name)}] ${message}`);
    } else {
        console.log(`[NB][${new Date().toISOString()}] ${message}`);
    }
};

module.exports = {
    log: log,
    info: (message, runner) => log(colors.yellow(message), runner),
    error: (message, runner) => log(colors.red(message), runner)
};