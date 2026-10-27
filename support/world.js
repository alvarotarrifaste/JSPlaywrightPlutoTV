const { World, setWorldConstructor, setDefaultTimeout } = require('@cucumber/cucumber');
const { chromium } = require('playwright');

setDefaultTimeout(60000);

class PlaywrightWorld extends World {
  async openBrowser() {
    this.browser = await chromium.launch({ headless: process.env.HEADED !== 'true' });
    this.context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 },
      locale: 'en-US',
    });
    this.page = await this.context.newPage();
    this.page.setDefaultTimeout(10000);
    this.page.setDefaultNavigationTimeout(30000);
  }

  async closeBrowser() {
    if (this.browser) await this.browser.close();
  }
}

setWorldConstructor(PlaywrightWorld);
