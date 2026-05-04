/**
 * OnDemandPage.js — Page Object for the PlutoTV On Demand section
 *
 * Represents the /on-demand screen with its hero carousel at the top.
 * Unlike the Home and Live TV carousels (which use next/prev arrows),
 * the On Demand hero uses dot indicators with auto-rotation:
 *
 *   ‖  • • • • •   (pause button + 5 pagination dots)
 *
 * Each slide shows a featured movie or series with a single visible CTA:
 *   - "Details" (yellow) → navigates to the title detail page
 *
 * For this reason, clickHeroCarouselButton is simpler than in HomePage/LiveTvPage:
 * it just waits for the CTA to be visible and clicks it, without iterating slides with arrows.
 *
 * Page structure:
 *   Hero carousel (auto-rotating, dots navigation)
 *   └── Active slide: title, genre, description, "Details"
 *   Content carousels: CBS Latest Episodes, Most Popular Movies, etc.
 *   Left sidebar: categories (Featured, April Ghouls, Action, Comedy, etc.)
 */

class OnDemandPage {
  /**
   * @param {import('playwright').Page} page - Playwright page instance
   */
  constructor(page) {
    this.page = page;
  }

  /**
   * Waits for the On Demand page to be fully loaded and interactive.
   *
   * 1. Waits for the URL to contain "on-demand" → navigation was successful
   * 2. Waits for the "Details" hero button to be visible → carousel has hydrated
   *
   * The On Demand hero always shows a "Details" button as its only CTA,
   * making it a reliable ready signal.
   */
  async waitForPage() {
    // Wait for the URL to change to /on-demand before looking for elements
    await this.page.waitForURL(/on-demand/, { timeout: 15000 });

    // Wait for the hero carousel "Details" button to be visible
    await this.page
      .locator('button')
      .filter({ hasText: 'Details' })
      .first()
      .waitFor({ state: 'visible', timeout: 25000 });
  }

  /**
   * Clicks the CTA button visible on the On Demand hero carousel.
   *
   * The On Demand hero has NO next/prev arrows to iterate slides manually.
   * It uses auto-rotation with dot indicators for pagination.
   * The current slide's CTA is always visible, so no iteration is needed.
   *
   * In the On Demand flow, this method is used to click "Details",
   * which navigates to the title detail page before initiating playback.
   *
   * @param {string} buttonText - text of the button to click: "Details"
   * @throws {Error} if the button is not visible within the wait timeout
   */
  async clickHeroCarouselButton(buttonText) {
    // The active slide CTA is always visible in the On Demand hero
    const btn = this.page.locator('button').filter({ hasText: buttonText }).first();
    await btn.waitFor({ state: 'visible', timeout: 10000 });
    await btn.click();
  }
}

module.exports = OnDemandPage;
