/**
 * playbackFromHeroCarouselOnDemandPageSteps.js — Steps for the PlaybackValidationFromHeroCarouselOnDemandPage scenario
 *
 * Implements the steps specific to the On Demand flow that are not in other files:
 *   1. Navigation to the On Demand menu
 *   2. Clicking "Watch Now" from the title detail screen
 *
 * Shared steps (Given home page, carousel "Details" button, player validations)
 * are resolved automatically by Cucumber from playbackFromHeroCarouselSteps.js.
 *
 * Full scenario flow:
 *   Given I open the PlutoTV home page              ← playbackFromHeroCarouselSteps.js
 *   When  I click the "On Demand" navigation button ← this file
 *   And   I click the "Details" button on the hero carousel  ← shared step (uses OnDemandPage)
 *   And   I click the "Watch Now" button on the details page ← this file
 *   Then  the video player should be displayed in full screen ← shared step
 *   And   the playback should be active                       ← shared step
 */

const { When } = require('@cucumber/cucumber');
const OnDemandPage = require('../pages/OnDemandPage');
const DetailsPage = require('../pages/DetailsPage');

/**
 * Step: 'When I click the "On Demand" navigation button'
 *
 * Navigates to the On Demand section by clicking the top menu link.
 *
 * Sequence:
 * 1. Click the "On Demand" link in the top nav (via HomePage.clickNavButton)
 * 2. Instantiate OnDemandPage and wait for the hero carousel to be ready
 * 3. Set OnDemandPage as the active carousel for the "Details" step that follows
 *
 * Why literal string instead of {string}:
 *   Prevents ambiguity with the "Live TV" step defined in playbackFromHeroCarouselLiveTvPageSteps.js.
 *   Each step is unique with its literal text → no Cucumber resolution conflict.
 */
When('I click the "On Demand" navigation button', async function () {
  // Step 1: click the "On Demand" link in the top menu
  await this.homePage.clickNavButton('On Demand');

  // Step 2: instantiate OnDemandPage and wait for the hero carousel to hydrate
  this.onDemandPage = new OnDemandPage(this.page);
  await this.onDemandPage.waitForPage();

  // Step 3: set OnDemandPage as the active carousel
  // The "I click the {string} button on the hero carousel" step will call
  // this.onDemandPage.clickHeroCarouselButton("Details")
  this.activeCarouselPage = this.onDemandPage;
});

/**
 * Step: 'And I click the "Watch Now" button on the details page'
 *
 * This step runs AFTER the "Details" step has navigated the user to the
 * title detail page (featured movie or series).
 *
 * Sequence:
 * 1. Instantiate DetailsPage and wait for the "Watch Now" button to be visible
 *    (signal that the detail page has fully loaded)
 * 2. Click "Watch Now" → PlutoTV opens the player with the DRM-protected content
 *
 * Why create DetailsPage here and not earlier:
 *   The detail page does not exist until the previous step ("Details" button)
 *   completes the navigation. Instantiating it here guarantees that `this.page`
 *   is already on the correct title URL.
 */
When('I click the "Watch Now" button on the details page', async function () {
  // Instantiate DetailsPage with the current page (now showing the title detail)
  this.detailsPage = new DetailsPage(this.page);

  // Wait for "Watch Now" to be visible → detail page fully loaded
  await this.detailsPage.waitForPage();

  // Click "Watch Now" → starts playback (with Widevine DRM license negotiation)
  await this.detailsPage.clickWatchNow();
});
