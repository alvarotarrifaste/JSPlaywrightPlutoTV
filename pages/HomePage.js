/**
 * HomePage.js — Page Object for the PlutoTV home page
 *
 * The Page Object Model (POM) pattern centralizes all selectors
 * and actions for a page into a single class. Step definitions
 * never touch the DOM directly — they always go through here.
 * Benefit: if PlutoTV changes a selector, only this file needs to be updated.
 */

class HomePage {
  /**
   * @param {import('playwright').Page} page - Playwright page instance
   *        passed from PlaywrightWorld (this.page in the steps)
   */
  constructor(page) {
    this.page = page;
    this.url = 'https://pluto.tv/us/hub/home?lang=en';

    // "Next" button selector for the hero carousel.
    // PlutoTV uses CSS-in-JS with generated class names (e.g. nextButton-0-2-224).
    // The [class*="nextButton"] selector matches any class containing "nextButton",
    // making it resilient to changes in the generated suffix number.
    this.nextSlideBtn = page.locator('button[class*="nextButton"]').first();
  }

  /**
   * Navigates to the PlutoTV home page and waits for the hero carousel to be ready.
   *
   * waitUntil: 'domcontentloaded' → waits for the base HTML to load (without heavy images or JS)
   * Then waits for the carousel nextButton to confirm that the page JS has hydrated
   * and the carousel is interactive.
   */
  async navigate() {
    await this.page.goto(this.url, { waitUntil: 'domcontentloaded' });

    // Wait for the carousel "next" button as a signal that the page is ready
    await this.page.locator('button[class*="nextButton"]').waitFor({ state: 'visible', timeout: 20000 });
  }

  /**
   * Finds and clicks a button in the hero carousel by its text.
   * If the button is not visible on the current slide, advances to the next slide
   * and retries, up to a maximum of 10 slides.
   *
   * This is necessary because hero carousel content is dynamic:
   * sometimes the first slide is a Live channel, other times it is a VOD title.
   *
   * @param {string} buttonText - exact text of the button to click
   *                              e.g. "Watch Live" for Live TV, "Play Now" for VOD
   * @throws {Error} if the button was not found in any of the slides
   */
  async clickHeroCarouselButton(buttonText) {
    const maxSlides = 10;

    for (let i = 0; i < maxSlides; i++) {
      // Locate a <button> whose text matches exactly `buttonText`
      // .filter({ hasText }) is more reliable than the CSS pseudo-selector :has-text()
      const btn = this.page.locator('button').filter({ hasText: buttonText }).first();

      try {
        // Wait up to 2 seconds for the button to be visible on this slide
        await btn.waitFor({ state: 'visible', timeout: 2000 });
        await btn.click();
        return; // found and clicked — exit the loop
      } catch {
        // Button not on this slide → advance to the next one
      }

      try {
        // Click the ">" arrow on the carousel to advance to the next slide
        await this.nextSlideBtn.waitFor({ state: 'visible', timeout: 2000 });
        await this.nextSlideBtn.click();

        // Short pause to let the slide transition animation finish
        await this.page.waitForTimeout(1500);
      } catch {
        // No more slides available — exit the loop
        break;
      }
    }

    throw new Error(`"${buttonText}" button not found in hero carousel after checking ${maxSlides} slides`);
  }

  /**
   * Clicks a link in the PlutoTV top navigation bar.
   *
   * The top bar contains links to "Home", "Live TV", "On Demand", and "Search".
   * Each link has a known URL in PlutoTV, so we use the href as the primary selector
   * rather than text. This is more reliable because:
   *
   *   - PlutoTV is a React SPA that may render the <nav> at the end of the DOM
   *     via portals, even though it appears at the top of the screen visually.
   *     A text-only selector with .first() could match a content card link that
   *     appears earlier in the DOM (e.g. an "On Demand" card).
   *
   *   - The href is unique and unambiguous for each section of the app.
   *
   * navLabel → expected href fragment map:
   *   'Home'      → '/hub/home'
   *   'Live TV'   → '/live-tv'
   *   'On Demand' → '/on-demand'
   *   'Search'    → '/search'
   *
   * @param {string} navLabel - navigation link label (used for the href lookup map)
   */
  async clickNavButton(navLabel) {
    // Map of navLabel → href fragment for each PlutoTV section
    const hrefFragments = {
      'Home':      '/hub/home',
      'Live TV':   '/live-tv',
      'On Demand': '/on-demand',
      'Search':    '/search'
    };

    const hrefFragment = hrefFragments[navLabel];

    // Primary selector: link by href (unique and robust against DOM portals)
    // Falls back to a text-based selector if navLabel is not in the map
    const navLink = hrefFragment
      ? this.page.locator(`a[href*="${hrefFragment}"]`).first()
      : this.page.locator('a').filter({ hasText: navLabel }).first();

    await navLink.waitFor({ state: 'visible', timeout: 10000 });
    await navLink.click();
  }
}

module.exports = HomePage;
