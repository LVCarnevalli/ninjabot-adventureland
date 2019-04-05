const commons = require("./commons");
const logs = require("./logs");

exports.login = async (page, runner, auth) => {
  await page.evaluate(auth => {
    api_call_l(
      "signup_or_login",
      { email: auth.email, password: auth.password, only_login: true },
      {}
    );
  }, auth);
  const responseLogin = await commons.puppeteer.waitForResponse(
    page,
    "signup_or_login"
  );
  logs.log(JSON.parse(await responseLogin.text())[0].message, runner);
  await page.waitFor(() => Cookies.get("auth"));
};

exports.runCode = async (page, runner) => {
  await page.waitFor(() => window["character"]);
  await page.evaluate(code => {
    start_runner(0, code);
    actual_code = true;
  }, await commons.readFile(`../scripts/${runner.code}`));
};

exports.open = async (page, runner, url) => {
  await page.goto(`${url}?no_html=true`);
  logs.log("Wait game loaded", runner);
  await page.waitFor(() => window["game_loaded"]);
};

exports.connectCharacter = async (page, runner, url) => {
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
};

exports.isStoppedRunCode = async page => {
  return await page.evaluate(
    () => !window["actual_code"] || !window["code_run"]
  );
};
