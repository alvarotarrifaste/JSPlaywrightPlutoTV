class HomePage {
  constructor(page) {
    this.page = page;
    this.url = 'https://pluto.tv/us/hub/home?lang=en';
    this.nextSlideBtn = page.locator('button[class*="nextButton"]').first();
  }

  async navigate() {
    await this.page.goto(this.url, { waitUntil: 'domcontentloaded' });
    await this.page.locator('button[class*="nextButton"]').waitFor({ state: 'visible', timeout: 20000 });
  }

  async clickHeroCarouselButton(buttonText) {
    const maxSlides = 10;

    for (let i = 0; i < maxSlides; i++) {
      const btn = this.page.locator('button').filter({ hasText: buttonText }).first();

      try {
        await btn.waitFor({ state: 'visible', timeout: 2000 });
        await btn.click();
        return;
      } catch {
        // Target button not on current slide — advance carousel
      }

      try {
        await this.nextSlideBtn.waitFor({ state: 'visible', timeout: 2000 });
        await this.nextSlideBtn.click();
        await this.page.waitForTimeout(1500);
      } catch {
        break;
      }
    }

    throw new Error(`"${buttonText}" button not found in hero carousel after checking ${maxSlides} slides`);
  }
}

module.exports = HomePage;
