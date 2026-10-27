class DetailsPage {
  constructor(page) {
    this.page = page;
    this.title = page.getByTestId('lockup-heading-title').first();
    this.playButton = page.getByTestId('main-cta').filter({ hasText: /^(Play Now|Watch Now|Start Watching)$/i });
  }

  async waitForPage() {
    await this.title.waitFor({ state: 'visible', timeout: 20000 });
    await this.playButton.waitFor({ state: 'visible', timeout: 20000 });
  }

  async startWatching() {
    const titlePath = new URL(this.page.url()).pathname;
    await this.playButton.click();
    await this.page.waitForURL(url => url.hash === '#open' && url.pathname.startsWith(titlePath));
  }
}

module.exports = DetailsPage;
