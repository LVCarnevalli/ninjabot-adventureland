const puppeteer = require("puppeteer");
const monitor = require("./monitor");
const commons = require("./commons");
const logs = require("./logs");
const pageEvents = require("./pageEvents");
const pageFunctions = require("./pageFunctions");
const requestInterception = require("./requestInterception");
const game = require("./game");

const instanceBrowser = async () => {
    if (!!process.env.BROWSERLESS) {
        return await puppeteer.connect({
            browserWSEndpoint: "ws://localhost:3000?--no-sandbox=true" +
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

const instancePage = async (index, browser, config) => {
    const url = "https://adventure.land";
    const runner = config.characters[index];

    logs.log("Create new page for character", runner);
    const page = await browser.newPage();

    logs.log("Init request interceptor", runner);
    await requestInterception.on(page);
    logs.log("Configure page events", runner);
    await pageEvents.on(page);
    logs.log("Configure page functions", runner);
    await pageFunctions.on(page);

    logs.log("Open game", runner);
    await page.goto(`${url}?no_html=true`);
    logs.log("Wait game loaded", runner);
    await page.waitFor(() => game_loaded);

    logs.log("Login in account", runner);
    await game.login(page, runner, config);
    logs.log("Request login account", runner);
    await page.goto(`${url}/character/${runner.name}/in/${runner.server.split(" ")[0]}/${runner.server.split(" ")[1]}/?no_html=true`);
    logs.log("Configure monitors", runner);
    await monitor.characterInfo(page);
    await monitor.isDead(page);
    await monitor.runCode(page);
    logs.log("Execute code", runner);
    await game.runCode(page, runner);
    logs.log("Character is active", runner);
};

(async () => {
    logs.log("Read configurations");
    const config = JSON.parse(await commons.readFile("../config.json"));
    logs.log("Start browser");
    const browser = await instanceBrowser();

    try {
        for (let index = 0; index < config.characters.length; index++) {
            await instancePage(index, browser, config);
        }
        logs.log("Load all characters with successful!");
    } catch (e) {
        logs.error(e);
        await browser.close();
        process.exit();
    }
})();