class HomePage {
  constructor(page) {
    this.page = page;
    this.hero = page.getByTestId('spotlight-carousel');
    this.featuredDetails = this.hero.getByTestId('main-cta').filter({ hasText: /^Details$/ });
    this.liveChannel = page.locator('main a[data-testid="region-link"][href*="/watch/live-tv/"][href*="#"]').first();
  }

  async navigate() {
    await this.page.goto('https://pluto.tv/us/home/', { waitUntil: 'domcontentloaded' });
    if (!new URL(this.page.url()).pathname.startsWith('/us/')) {
      throw new Error(`This suite targets the US public site; redirected to ${this.page.url()}. Locale does not change network region.`);
    }
    await this.hero.waitFor({ state: 'visible', timeout: 20000 });
  }

  async openLiveChannel() {
    await this.liveChannel.waitFor({ state: 'visible', timeout: 20000 });
    const href = await this.liveChannel.getAttribute('href');
    await this.liveChannel.click();
    await this.page.waitForURL(new URL(href, this.page.url()).href);
    return new URL(href, this.page.url()).hash.slice(1);
  }

  async openFeaturedTitle() {
    try {
      await this.featuredDetails.waitFor({ state: 'visible', timeout: 20000 });
    } catch (error) {
      throw new Error('The current Home hero has no available on-demand Details action. Public promotions can change.', { cause: error });
    }
    const href = await this.featuredDetails.getAttribute('href');
    const label = await this.featuredDetails.getAttribute('aria-label');
    await this.hero.getByRole('link', { name: label, exact: true }).click();
    await this.page.waitForURL(new URL(href, this.page.url()).href);
    return this.page.url();
  }

  async openLiveTv() {
    await this.page.locator('a[href="/us/watch/live-tv/"]').first().click();
    await this.page.waitForURL('https://pluto.tv/us/watch/live-tv/');
  }

  async openMovies() {
    await this.page.locator('a[href="/us/movies/"]').first().click();
    await this.page.waitForURL('https://pluto.tv/us/movies/');
  }
}

module.exports = HomePage;
