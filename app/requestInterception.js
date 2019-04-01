// Credits: https://hackernoon.com/tips-and-tricks-for-web-scraping-with-puppeteer-ed391a63d952

const blockedResourceTypes = [
    "media",
    "font",
    "texttrack",
    "object",
    "beacon",
    "csp_report",
    "imageset"
];

const skippedResources = [
    "quantserve",
    "adzerk",
    "doubleclick",
    "adition",
    "exelator",
    "sharethrough",
    "cdn.api.twitter",
    "google-analytics",
    "googletagmanager",
    "google",
    "fontawesome",
    "facebook",
    "analytics",
    "optimizely",
    "clicktale",
    "mixpanel",
    "zedo",
    "clicksor",
    "tiqcdn"
];

exports.on = async page => {
    await page.setRequestInterception(true);
    await page.on("request", request => {
        const requestUrl = request._url.split("?")[0].split("#")[0];
        if (
            blockedResourceTypes.indexOf(request.resourceType()) !== -1 ||
            skippedResources.some(resource => requestUrl.indexOf(resource) !== -1)
        ) {
            request.abort();
        } else {
            request.continue();
        }
    });
};