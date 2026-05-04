/**
 * DetailsPage.js — Page Object for the VOD title detail screen on PlutoTV
 *
 * This screen appears after clicking "Details" from the On Demand hero carousel.
 * It shows information about the title (movie or series): background image, title,
 * description, cast, and the main action buttons:
 *   - "Watch Now" → starts playback from the most recent episode/movie
 *   - "Trailer"   → plays the title trailer (if available)
 *
 * The URL for this page varies by content type:
 *   Movies:  pluto.tv/us/on-demand/movies/<slug>
 *   Series:  pluto.tv/us/on-demand/series/<slug>
 *
 * The loaded content depends on the active slide in the On Demand hero at the time
 * "Details" was clicked — it is dynamic and changes between sessions.
 */

class DetailsPage {
  /**
   * @param {import('playwright').Page} page - Playwright page instance
   */
  constructor(page) {
    this.page = page;

    // Primary playback CTA on the details page.
    // PlutoTV may use a <button> or a styled <a> element depending on content type:
    //   - Movies: "Watch Now"
    //   - Series: "Watch Now" (first episode) or "Start Watching"
    // We search both element types with a case-insensitive regex to cover
    // capitalization variants and text alternatives.
    this.watchNowButton = page
      .locator('button, a')
      .filter({ hasText: /Watch Now|Start Watching/i })
      .first();
  }

  /**
   * Waits for the detail page to be ready for interaction.
   *
   * The "Watch Now" button visibility is used as the signal that the page
   * has fully loaded: if the button is visible, the JS has hydrated and the
   * title content is available for playback.
   *
   * A specific URL pattern is not awaited because the URL varies by title
   * (movies vs series) and by the content slug (which changes each session).
   *
   * @param {number} timeout - maximum wait time in ms (default: 40 seconds)
   */
  async waitForPage(timeout = 40000) {
    // Wait for the primary playback CTA to be visible → detail page has loaded.
    // Timeout set to 40 s because PlutoTV's detail page includes rich content
    // (images, metadata, cast, episodes) that may take longer to hydrate.
    await this.watchNowButton.waitFor({ state: 'visible', timeout });
  }

  /**
   * Clicks the "Watch Now" button to start playback of the title.
   *
   * After clicking, PlutoTV navigates to the player with the selected content.
   * For VOD, the browser negotiates the Widevine DRM license before the
   * video begins playing — see PlayerPage.waitForPlayback() for how
   * playback is validated on DRM-protected content.
   */
  async clickWatchNow() {
    await this.watchNowButton.click();
  }
}

module.exports = DetailsPage;
