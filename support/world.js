const { setWorldConstructor, World, setDefaultTimeout } = require('@cucumber/cucumber');
const { chromium } = require('playwright');

setDefaultTimeout(30000);

class PlaywrightWorld extends World {
  constructor(options) {
    super(options);
    this.browser = null;
    this.context = null;
    this.page = null;
  }

  async openBrowser() {
    this.browser = await chromium.launch({
      headless: process.env.HEADED !== 'true'
    });
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

setWorldConstructor(PlaywrightWorld);
