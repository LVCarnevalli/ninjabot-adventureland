const puppeteer = require("puppeteer");
const colors = require("colors");
const fs = require("fs");

const log = (message, runner) => {
    if (runner) {
        console.log(`[${colors.green(runner.name)}] ${message}`);
    } else {
        console.log(message);
    }
};

const readFile = file => {
    return new Promise(resolve => {
        fs.readFile(file, "utf8", function(err, data) {
            if (err) throw err;
            resolve(data);
        });
    });
};

const waitForResponse = (page, url) => {
    return new Promise(resolve => {
        page.on("response", function callback(response) {
            if (response.url().includes(url)) {
                resolve(response);
                page.removeListener("response", callback);
            }
        });
    });
};

(async () => {
    log("Read configurations");
    const config = JSON.parse(await readFile("../config.json"));
    log("Start browser");
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    try {
        await config.characters.forEach(async runner => {
            log("Create new page for character", runner);
            const page = await browser.newPage();

            log("Expose functions", runner);
            await page.exposeFunction("nb_logError", text =>
                log(colors.red(text), runner)
            );
            await page.exposeFunction("nb_logInfo", text =>
                log(colors.blue(text), runner)
            );

            log("Open game", runner);
            await page.goto("https://adventure.land", { waitUntil: 'networkidle2' });
            log("Wait game loaded", runner);
            await page.waitFor(() => game_loaded);

            log("Login in account", runner);
            await page.evaluate(auth => {
                api_call_l(
                    "signup_or_login", { email: auth.email, password: auth.password, only_login: true }, {}
                );
            }, config.auth);
            const responseLogin = await waitForResponse(page, "signup_or_login");
            log(JSON.parse(await responseLogin.text())[0].message, runner);
            await page.waitFor(() => user_auth);

            log("Get characters", runner);
            await page.waitFor(() => X.characters && X.characters.length > 0);
            const characters = await page.evaluate(() => X.characters);
            const character = characters.filter(char => char.name == runner.name)[0];
            if (!character) {
                throw new Error(`Not found character ${runner.name}`);
            }
            if (character.online != 0) {
                throw new Error(`Character ${runner.name} is online now`);
            }

            log(`Connect server ${runner.server}`, runner);
            await page.evaluate(server => {
                server_addr = server.addr;
                server_port = server.port;
                init_socket();
            }, config.servers[runner.server]);
            await page.waitFor(5000);

            log("Create error handler", runner);
            await page.evaluate(() => {
                socket.on("game_error", function(data) {
                    window.nb_logError(data);
                });
            });

            log("Request login account", runner);
            await page.evaluate(id => {
                log_in(user_id, id, user_auth);
            }, character.id);
            await page.waitFor(() => !!character);

            log("Execute code", runner);
            await page.evaluate(
                code => start_runner(0, code),
                await readFile(`../scripts/${runner.code}`)
            );

            log("Character is active!", runner);
        });
    } catch (e) {
        console.log(e);
        process.exit();
    } finally {
        await browser.close();
    }
})();