const { Before, After, Status } = require('@cucumber/cucumber');

Before(async function () {
  await this.openBrowser();
});

After(async function (scenario) {
  if (scenario.result.status === Status.FAILED) {
    const screenshot = await this.page.screenshot();
    await this.attach(screenshot, 'image/png');
  }
  await this.closeBrowser();
});
