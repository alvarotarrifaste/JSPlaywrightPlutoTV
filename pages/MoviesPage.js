class MoviesPage {
  constructor(page) {
    this.page = page;
    this.movie = page.locator('main a[data-testid="region-link"][href^="/us/movies/"]').first();
  }

  async waitForPage() {
    await this.page.waitForURL('https://pluto.tv/us/movies/');
    await this.movie.waitFor({ state: 'visible', timeout: 20000 });
  }

  async openMovie() {
    const href = await this.movie.getAttribute('href');
    await this.movie.click();
    await this.page.waitForURL(new URL(href, this.page.url()).href);
    return this.page.url();
  }
}

module.exports = MoviesPage;
