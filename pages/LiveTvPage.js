/**
 * LiveTvPage.js — Page Object for the PlutoTV Live TV section
 *
 * Represents the /live-tv screen with its hero carousel at the top.
 * The Live TV hero carousel displays live channels with two CTAs:
 *   - "Watch Live Channel" (yellow) → opens the channel player directly
 *   - "Details" (grey) → navigates to the channel detail page
 *
 * Below the hero there is a horizontal strip of channel thumbnails and a
 * left sidebar with categories (Featured, Live Sports, Movies, etc.)
 *
 * Page structure:
 *   Hero carousel (with nextButton arrows)
 *   └── Active slide: channel title, "Watch Live Channel", "Details"
 *   Horizontal channel strip (channel thumbnails)
 *   EPG / program guide
 */

class LiveTvPage {
  /**
   * @param {import('playwright').Page} page - Playwright page instance
   *        (the same reference passed from PlaywrightWorld)
   */
  constructor(page) {
    this.page = page;

    // "Next" button for the hero carousel.
    // Live TV uses the same CSS-in-JS pattern as the home page:
    // generated class names like "nextButton-0-2-224" → robust selector with [class*="nextButton"]
    // .first() → targets the first nextButton in the DOM (belonging to the hero carousel)
    this.nextSlideBtn = page.locator('button[class*="nextButton"]').first();
  }

  /**
   * Waits for the Live TV page to be fully loaded and ready for interaction.
   *
   * Two conditions must be met:
   * 1. The URL must contain "live-tv" → confirms navigation was successful
   * 2. A hero carousel CTA button must be visible → confirms the JS has hydrated
   *    and the carousel is interactive
   *
   * We wait for "Watch Live Channel" OR "Details" because the hero content
   * is dynamic: the primary CTA may vary depending on the featured channel.
   */
  async waitForPage() {
    // Wait for the URL to change to /live-tv before looking for elements
    await this.page.waitForURL(/live-tv/, { timeout: 15000 });

    // Wait for the hero carousel to hydrate: at least one CTA must be visible
    await this.page
      .locator('button')
      .filter({ hasText: /Watch Live Channel|Details/ })
      .first()
      .waitFor({ state: 'visible', timeout: 25000 });
  }

  /**
   * Finds and clicks a button in the Live TV hero carousel by its text.
   * If the button is not on the current slide, advances to the next slide and retries,
   * up to a maximum of 10 slides.
   *
   * The Live TV hero carousel works the same way as the Home page carousel:
   * content is dynamic and the featured channel changes between sessions,
   * so we need to iterate through slides until we find the target CTA.
   *
   * @param {string} buttonText - button text: "Watch Live Channel" or "Details"
   * @throws {Error} if the button is not found in any of the slides
   */
  async clickHeroCarouselButton(buttonText) {
    const maxSlides = 10;

    for (let i = 0; i < maxSlides; i++) {
      // Locate a <button> whose text matches exactly buttonText
      const btn = this.page.locator('button').filter({ hasText: buttonText }).first();

      try {
        // Wait up to 2 seconds for the button to be visible on the current slide
        await btn.waitFor({ state: 'visible', timeout: 2000 });
        await btn.click();
        return; // found and clicked — exit the loop
      } catch {
        // Button not on this slide → try advancing to the next one
      }

      try {
        // Click the ">" arrow on the hero carousel to advance to the next slide
        await this.nextSlideBtn.waitFor({ state: 'visible', timeout: 2000 });
        await this.nextSlideBtn.click();

        // Pause to let the slide transition animation finish
        await this.page.waitForTimeout(1500);
      } catch {
        // No "next" button available → no more slides
        break;
      }
    }

    throw new Error(
      `"${buttonText}" button not found in Live TV hero carousel after checking ${maxSlides} slides`
    );
  }
}

module.exports = LiveTvPage;
