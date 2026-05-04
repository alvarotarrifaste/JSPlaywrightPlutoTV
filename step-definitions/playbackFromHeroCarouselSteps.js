/**
 * playbackFromHeroCarouselSteps.js — Step definitions for the PlaybackFromHeroCarousel feature
 *
 * Each function here implements a line from the .feature file.
 * Cucumber matches the step text with the expression in Given/When/Then
 * and executes the corresponding function.
 *
 * `this` inside each function is the PlaywrightWorld (support/world.js),
 * which is why we can access this.page, this.homePage, this.playerPage, etc.
 *
 * Steps use `async/await` because all Playwright actions are asynchronous
 * (the browser needs time to execute each action).
 */

const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test'); // Playwright assertions library
const HomePage = require('../pages/HomePage');
const PlayerPage = require('../pages/PlayerPage');

/**
 * Step: "Given I open the PlutoTV home page"
 *
 * Creates a HomePage Page Object instance and navigates to the URL.
 * We store the instance in `this.homePage` to reuse it in subsequent steps
 * (When, Then) within the same scenario.
 *
 * Also initializes `this.activeCarouselPage` pointing to homePage.
 * Navigation steps (Live TV, On Demand) will overwrite this value
 * with the Page Object for the section they navigate to.
 */
Given('I open the PlutoTV home page', async function () {
  this.homePage = new HomePage(this.page);
  await this.homePage.navigate();

  // Home page is the active carousel by default.
  // If the scenario navigates to another section, this value is overwritten in the navigation steps.
  this.activeCarouselPage = this.homePage;
});

/**
 * Step: "When I click the {string} button on the hero carousel"
 *
 * {string} is a Cucumber parameter that captures the text between quotes in the feature.
 * Examples:
 *   When I click the "Watch Live" button        → home page (Live TV slide)
 *   When I click the "Play Now" button          → home page (VOD slide)
 *   When I click the "Watch Live Channel" button → Live TV page
 *   When I click the "Details" button           → On Demand page
 *
 * Uses `this.activeCarouselPage` instead of `this.homePage` directly.
 * This allows the same step to work for the carousel of any section:
 * Home, Live TV, or On Demand — depending on where the scenario navigated.
 *
 * `this.activeCarouselPage` is assigned by:
 *   - This same Given (→ HomePage) for scenarios that do not navigate away
 *   - The "I click the Live TV/On Demand navigation button" steps for the others
 *
 * @param {string} buttonText - text of the button to click in the carousel
 */
When('I click the {string} button on the hero carousel', async function (buttonText) {
  await this.activeCarouselPage.clickHeroCarouselButton(buttonText);
});

/**
 * Step: "Then the video player should be displayed in full screen"
 *
 * Validates that the player opened in fullscreen mode: the <video> is visible AND
 * occupies at least 85% of the viewport width and height.
 *
 * Used for Home page scenarios where clicking the hero CTA navigates to a
 * dedicated player page (full screen).
 *
 * If either condition is not met within the given time, the step fails
 * and the After hook captures a screenshot automatically.
 */
Then('the video player should be displayed in full screen', async function () {
  this.playerPage = new PlayerPage(this.page);

  // First wait for the <video> element to exist and be visible
  await this.playerPage.waitForPlayer();

  // Then wait for it to fill the fullscreen (there may be a transition animation)
  await this.playerPage.waitForFullScreenLayout();
});

/**
 * Step: "Then the video player should be visible"
 *
 * Validates only that the <video> element appeared and is visible on screen.
 * Does NOT validate fullscreen — used for the Live TV page scenario where the player
 * is embedded: the channel plays in the hero area while the EPG
 * and channel strip remain visible below the video.
 *
 * This behavior differs from the Home page (which opens a fullscreen player).
 * Both validations are correct for their respective platform contexts.
 */
Then('the video player should be visible', async function () {
  this.playerPage = new PlayerPage(this.page);

  // Only verify that the <video> mounted and is visible — no dimension check
  await this.playerPage.waitForPlayer();
});

/**
 * Step: "And the playback should be active"
 *
 * Validates that the video is actually playing (or actively loading under DRM).
 * Reuses `this.playerPage` created in the previous step.
 *
 * If the video remains paused or without a source after the timeout, the step fails.
 */
Then('the playback should be active', async function () {
  await this.playerPage.waitForPlayback();
});
