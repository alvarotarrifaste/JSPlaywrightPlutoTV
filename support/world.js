/**
 * world.js — Custom Cucumber World for Playwright
 *
 * In Cucumber, the "World" is the `this` object available in every step and hook.
 * By extending it with PlaywrightWorld, we share the browser, context, and page
 * across all steps of the same scenario without passing variables manually.
 *
 * setDefaultTimeout(30000) applies a 30-second timeout to ALL steps
 * and hooks in the project. Without this, Cucumber uses 5 seconds by default,
 * which is insufficient for loading streaming pages like PlutoTV.
 */

const { setWorldConstructor, World, setDefaultTimeout } = require('@cucumber/cucumber');
const { chromium } = require('playwright');

// Global timeout: 60 seconds per step/hook.
// Increased from 30 s to 60 s because some steps combine multiple waits:
// waitForPlayer (up to 30 s) + waitForFullScreenLayout (up to 25 s) = 55 s theoretical maximum.
// PlutoTV also has DRM load time and Widevine license negotiation,
// which can add extra latency to playback validation.
setDefaultTimeout(60000);

class PlaywrightWorld extends World {
  /**
   * The constructor receives `options` from Cucumber (world parameters, reporter, etc.)
   * and calls super() so Cucumber initializes its base logic.
   * The browser, context, and page properties start as null and are assigned in openBrowser().
   */
  constructor(options) {
    super(options);
    this.browser = null;   // browser instance (Chromium)
    this.context = null;   // browser context (equivalent to an isolated profile)
    this.page = null;      // active tab where actions are executed
  }

  /**
   * Opens a Chrome instance and creates a new tab.
   * Called in the Before hook (support/hooks.js) at the start of each scenario.
   *
   * headless: false  → browser is VISIBLE (headed mode, local development)
   * headless: true   → browser runs in the background with no window (CI mode)
   *
   * Environment variables that control behavior:
   *   HEADED=true    → visible browser (npm run test:headed)
   *   CI_MODE=true   → enables hardening options for GitHub Actions
   *
   * --- Chromium args for CI (CI_MODE=true) ---
   *
   * --no-sandbox, --disable-setuid-sandbox:
   *   Required in Linux containers (GitHub Actions ubuntu-latest) because
   *   the Chromium sandbox needs kernel privileges that containers do not grant.
   *   Without this, Chromium may crash on startup.
   *
   * --disable-dev-shm-usage:
   *   In CI containers, /dev/shm (shared memory) typically has only 64 MB.
   *   Chromium uses it for rendering and can run out of space → crash.
   *   This flag makes it use /tmp instead.
   *
   * --disable-blink-features=AutomationControlled:
   *   Removes the `navigator.webdriver = true` flag that sites detect
   *   to identify automated browsers (basic bot detection).
   *
   * --- Browser context ---
   *
   * userAgent: mimics a real Chrome on Windows 10 to avoid User-Agent-based
   *   bot detection. Headless Chrome by default includes "HeadlessChrome"
   *   in the UA, which many sites block.
   *
   * viewport: 1920x1080 → simulates a standard desktop. PlutoTV adapts its layout
   *   to the viewport; a small viewport can hide elements or change the DOM.
   *
   * locale / timezoneId: simulates a US user to correctly receive PlutoTV US content
   *   (the platform is geo-dependent).
   */
  async openBrowser() {
    const isCI = process.env.CI_MODE === 'true';

    // Additional args only in CI: required to run Chromium in Linux containers
    const ciArgs = [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-blink-features=AutomationControlled'
    ];

    this.browser = await chromium.launch({
      headless: process.env.HEADED !== 'true',
      args: isCI ? ciArgs : []
    });

    // Context options to simulate a real browser (applies in both CI and local)
    const contextOptions = {
      // Chrome 131 User-Agent on Windows 10 — avoids the default "HeadlessChrome" UA
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',

      // Standard desktop viewport — PlutoTV may render differently on smaller viewports
      viewport: { width: 1920, height: 1080 },

      // US locale and timezone — PlutoTV serves geo-dependent content
      locale: 'en-US',
      timezoneId: 'America/New_York'
    };

    // newContext() creates an isolated profile: no cookies or storage from previous sessions
    this.context = await this.browser.newContext(contextOptions);

    // newPage() opens a new tab within the context
    this.page = await this.context.newPage();
  }

  /**
   * Closes the browser and releases all associated resources (context, pages, etc.)
   * Called in the After hook (support/hooks.js) at the end of each scenario.
   */
  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Register PlaywrightWorld as the World constructor for all scenarios
setWorldConstructor(PlaywrightWorld);
