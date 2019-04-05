const commons = require("./commons");
const logs = require("./logs");

exports.login = async (page, runner, config) => {
  await page.evaluate(auth => {
    api_call_l(
      "signup_or_login",
      { email: auth.email, password: auth.password, only_login: true },
      {}
    );
  }, config.auth);
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
