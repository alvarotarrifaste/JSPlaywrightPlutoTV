/**
 * PlayerPage.js — Page Object for the PlutoTV video player
 *
 * Contains all validations related to the player:
 * - Detect that the player appeared on screen
 * - Confirm it is in fullscreen mode
 * - Confirm that playback is active
 */

class PlayerPage {
  /**
   * @param {import('playwright').Page} page - Playwright page instance
   */
  constructor(page) {
    this.page = page;

    // Selector for the native HTML <video> element
    // PlutoTV renders the video directly in the main DOM (not inside a separate iframe)
    this.videoElement = page.locator('video');
  }

  /**
   * Waits for the <video> element to be visible on screen.
   * This confirms the player was mounted by PlutoTV after the click.
   *
   * @param {number} timeout - maximum wait time in ms (default: 30 seconds)
   */
  async waitForPlayer(timeout = 30000) {
    await this.videoElement.waitFor({ state: 'visible', timeout });
  }

  /**
   * Waits until the video occupies at least 85% of the window width and height.
   * This validates that the player is in fullscreen mode (not in a docked mini-player).
   *
   * Uses waitForFunction instead of a one-shot check because the player has a
   * transition animation: it first appears small and then expands.
   *
   * getBoundingClientRect() returns the element's position and size in pixels.
   * window.innerWidth/innerHeight are the visible viewport dimensions.
   *
   * Timeout increased to 25 s (was 20 s) to cover cases where the player expansion
   * animation is slower (Live TV pages, On Demand with DRM loading).
   * The step that calls this method has a 60 s total budget (setDefaultTimeout).
   *
   * @param {number} timeout - maximum wait time in ms (default: 25 seconds)
   */
  async waitForFullScreenLayout(timeout = 25000) {
    await this.page.waitForFunction(
      () => {
        const video = document.querySelector('video');
        if (!video) return false;
        const rect = video.getBoundingClientRect();
        return (
          rect.width  >= window.innerWidth  * 0.85 &&
          rect.height >= window.innerHeight * 0.85
        );
      },
      { timeout }
    );
  }

  /**
   * Waits until playback is confirmed as active.
   *
   * PlutoTV uses two different mechanisms depending on content type:
   *
   * LIVE TV (e.g. live channel):
   *   The MPEG-DASH stream delivers data immediately.
   *   readyState reaches >= 3 (HAVE_FUTURE_DATA) quickly,
   *   confirming enough buffer is available to play.
   *
   * VOD — Movies/Series (on-demand content):
   *   PlutoTV uses Widevine DRM. The video loads as a blob URL
   *   (blob:https://pluto.tv/...) while the browser negotiates the DRM license.
   *   In this state readyState may stay at 0 (HAVE_NOTHING) for 30+ seconds,
   *   but networkState === 2 (NETWORK_LOADING) confirms the browser is actively
   *   downloading the encrypted segments.
   *
   * The condition covers both cases:
   *   - hasSource: the <video> has a src assigned (not an empty element)
   *   - !video.paused: the browser executed play() — not paused by the user
   *   - readyState >= 3 OR networkState === 2: playing or actively buffering
   *
   * @param {number} timeout - maximum wait time in ms (default: 30 seconds)
   */
  async waitForPlayback(timeout = 30000) {
    await this.page.waitForFunction(
      () => {
        const video = document.querySelector('video');
        if (!video) return false;

        // Verify the <video> has a source assigned
        const hasSource = video.src !== '' || video.currentSrc !== '';

        // readyState >= 3: enough buffer to play (Live TV)
        // networkState === 2: actively downloading DRM segments (VOD)
        const isPlayingOrBuffering = !video.paused && (video.readyState >= 3 || video.networkState === 2);

        return hasSource && isPlayingOrBuffering;
      },
      { timeout }
    );
  }
}

module.exports = PlayerPage;
