/**
 * hooks.js — Global Cucumber hooks (Before / After)
 *
 * Hooks run automatically before and after EVERY scenario.
 * They do not need to be called from feature files — Cucumber detects them automatically.
 *
 * Before → opens the browser before the scenario steps begin
 * After  → closes the browser when done; captures a screenshot if the scenario failed
 */

const { Before, After, Status } = require('@cucumber/cucumber');

/**
 * Before hook: runs once before each scenario.
 * `this` is an instance of PlaywrightWorld (defined in world.js),
 * which is why we can call this.openBrowser().
 */
Before(async function () {
  await this.openBrowser();
});

/**
 * After hook: runs once after each scenario.
 *
 * @param {object} scenario - Cucumber object with information about the executed scenario
 *
 * If the scenario FAILED (Status.FAILED), takes a screenshot of the page
 * at the moment of failure and attaches it to the Cucumber HTML report.
 * This is essential for debugging: you can see exactly what the browser
 * was showing when the test failed.
 */
After(async function (scenario) {
  if (scenario.result.status === Status.FAILED) {
    // page.screenshot() returns the PNG as a Buffer (binary data)
    const screenshot = await this.page.screenshot();

    // attach() adds the screenshot to the Cucumber report
    // with the image/png MIME type so it renders as an image
    await this.attach(screenshot, 'image/png');
  }

  // Always close the browser, regardless of whether the scenario passed or failed
  await this.closeBrowser();
});
