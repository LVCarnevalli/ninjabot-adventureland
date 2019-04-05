const commons = require("./commons");
const logs = require("./logs");

exports.login = async (page, runner, config) => {
    await page.evaluate(auth => {
        api_call_l("signup_or_login", { email: auth.email, password: auth.password, only_login: true }, {});
    }, config.auth);
    const responseLogin = await commons.puppeteer.waitForResponse(page, "signup_or_login");
    logs.log(JSON.parse(await responseLogin.text())[0].message, runner);
    await page.waitFor(() => Cookies.get("auth"));
};

exports.getCharacter = async (page, runner) => {
    await page.waitFor(() => X.characters && X.characters.length > 0);
    const characters = await page.evaluate(() => X.characters);
    const character = characters.filter(char => char.name == runner.name)[0];
    if (!character) {
        throw new Error(`Not found character ${runner.name}`);
    }
    if (character.online != 0) {
        throw new Error(`Character ${runner.name} is online now`);
    }
    return character;
};

exports.changeServer = async (page, runner, config) => {
    await page.evaluate(server => {
        server_addr = server.addr;
        server_port = server.port;
        init_socket();
    }, config.servers[runner.server]);

    logs.log("Create error handler", runner);
    await page.waitFor(() => !!socket_welcomed);
    await page.evaluate(() => {
        socket.on("game_error", function(data) {
            window.nb_logError(data);
        });
    });
};

exports.connectCharacter = async (page, character) => {
    await page.evaluate(id => log_in(user_id, id, user_auth), character.id);
    await page.waitFor(() => !!character);
};

exports.runCode = async (page, runner) => {
    await page.waitFor(() => !!character);
    await page.evaluate(
        code => {
            start_runner(0, code);
            actual_code = true;
        },
        await commons.readFile(`../scripts/${runner.code}`)
    );

    setInterval(async () => {
        page.evaluate(
            code => {
                if (!actual_code || !code_run) {
                    window.nb_logInfo("Warning: Retry execute code", runner);
                    start_runner(0, code);
                    actual_code = true;
                }
            },
            await commons.readFile(`../scripts/${runner.code}`)
        );
    }, 1000 * 5);
};