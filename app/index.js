const puppeteer = require("puppeteer");
const monitor = require("./monitor");
const commons = require("./commons");
const logs = require("./logs");
const pageEvents = require("./pageEvents");
const pageFunctions = require("./pageFunctions");
const requestInterception = require("./requestInterception");
const game = require("./game");

const url = "https://adventure.land";

const instanceBrowser = async () => {
  if (!!process.env.BROWSERLESS) {
    return await puppeteer.connect({
      browserWSEndpoint:
        "ws://localhost:3000?--no-sandbox=true" +
        "&--disable-setuid-sandbox=true" +
        "&--disable-dev-shm-usage=true" +
        "&--disable-accelerated-2d-canvas=true" +
        "&--disable-gpu=true"
    });
  } else {
    return await puppeteer.launch({
      dumpio: false,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
        "--remote-debugging-port=9222",
        "--remote-debugging-address=0.0.0.0"
      ]
    });
  }
};

const instancePage = async (browser, runner, auth) => {
  logs.log("Create new page for character", runner);
  const page = await browser.newPage();
  try {
    logs.log("Init request interceptor", runner);
    await requestInterception.on(page);
    logs.log("Configure page events", runner);
    await pageEvents.on(page);
    logs.log("Configure page functions", runner);
    await pageFunctions.on(page);

    logs.log("Open game", runner);
    await page.goto(`${url}?no_html=true`);
    logs.log("Wait game loaded", runner);
    await page.waitFor(() => window["game_loaded"]);

    logs.log("Login in account", runner);
    await game.login(page, runner, auth);

    logs.log("Request login account", runner);
    await page.goto(
      `${url}/character/${runner.name}/in/${runner.server.split(" ")[0]}/${
        runner.server.split(" ")[1]
      }/?no_html=true`,
      {
        timeout: 1000 * 120
      }
    );

    logs.log("Create error handler", runner);
    await page.waitFor(() => window["socket_welcomed"]);
    await page.evaluate(() => {
      socket.on("game_error", function(data) {
        window.nb_logError(`${data}`);
      });
    });

    logs.log("Waiting connected", runner);
    await page.waitForXPath("//div[contains(text(), 'Connected')]", {
      timeout: 1000 * 120
    });

    logs.log("Configure monitors", runner);
    await monitor.characterInfo(page);
    await monitor.runCode(page);
    logs.log("Execute code", runner);
    await game.runCode(page, runner);
    logs.log("Character is active", runner);
    verifyRetryInstancePage(browser, runner, auth, page);
  } catch (e) {
    logs.error("Occurred error in init character", runner);
    retryInstancePage(browser, runner, auth, page);
  }
};

let intervalRetryInstancePage = [];
const verifyRetryInstancePage = async (browser, runner, auth, page) => {
  intervalRetryInstancePage[runner.name] = setInterval(async () => {
    const notRun = await page.evaluate(
      () => !window["actual_code"] || !window["code_run"]
    );
    if (notRun) {
      retryInstancePage(browser, runner, auth, page);
    }
  }, 1000 * 60);
};

const retryInstancePage = async (browser, runner, auth, page) => {
  clearInterval(intervalRetryInstancePage[runner.name]);
  await page.close();
  setTimeout(async () => {
    logs.log("Warning: Retry init character", runner);
    try {
      await instancePage(browser, runner, auth);
    } catch (e) {
      logs.error("Occurred error in retry init character", runner);
      retryInstancePage(browser, runner, auth, page);
    }
  }, 1000 * 30);
};

(async () => {
  logs.log("Read configurations");
  const config = JSON.parse(await commons.readFile("../config.json"));
  logs.log("Start browser");
  const browser = await instanceBrowser();

  try {
    for (let index = 0; index < config.characters.length; index++) {
      const runner = config.characters[index];
      await instancePage(browser, runner, config.auth);
    }
    logs.log("Finish process all characters!");
  } catch (e) {
    logs.error(e);
    await browser.close();
    process.exit();
  }
})();
