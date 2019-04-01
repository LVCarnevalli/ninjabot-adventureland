const fs = require("fs");

exports.readFile = file => {
  return new Promise(resolve => {
    fs.readFile(file, "utf8", function(err, data) {
      if (err) throw err;
      resolve(data);
    });
  });
};

exports.puppeteer = {
  waitForResponse: (page, url) => {
    return new Promise(resolve => {
      page.on("response", function callback(response) {
        if (response && response.url() && response.url().includes(url)) {
          resolve(response);
          page.removeListener("response", callback);
        }
      });
    });
  }
};