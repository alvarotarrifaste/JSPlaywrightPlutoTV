/**
 * playbackFromHeroCarouselLiveTvPageSteps.js — Steps for the PlaybackValidationFromHeroCarouselLiveTvPage scenario
 *
 * This file implements the steps specific to the Live TV section.
 * Shared steps (Given home page, carousel button, player validations)
 * are defined in playbackFromHeroCarouselSteps.js and resolved automatically
 * by Cucumber since it loads all step-definitions/ files together.
 *
 * This file adds only the navigation step for the Live TV menu:
 *   When I click the "Live TV" navigation button
 *
 * Scenario flow:
 *   Given I open the PlutoTV home page              ← playbackFromHeroCarouselSteps.js
 *   When  I click the "Live TV" navigation button   ← this file
 *   And   I click the "Watch Live Channel" button on the hero carousel ← shared step
 *   Then  the video player should be visible                           ← shared step
 *   And   the playback should be active                                ← shared step
 */

const { When } = require('@cucumber/cucumber');
const LiveTvPage = require('../pages/LiveTvPage');

/**
 * Step: 'When I click the "Live TV" navigation button'
 *
 * Sequence of actions:
 * 1. Calls HomePage.clickNavButton('Live TV') → clicks the top nav link
 * 2. Instantiates LiveTvPage with the same `this.page` reference
 *    (Playwright keeps the same page instance even when the URL changes)
 * 3. Waits for the Live TV page to be fully hydrated (waitForPage)
 * 4. Updates `this.activeCarouselPage` → the carousel step will use LiveTvPage
 *    instead of HomePage to find the "Watch Live Channel" button
 *
 * Why use a literal string instead of {string}:
 *   If we used When('I click the {string} navigation button'), Cucumber
 *   could create ambiguity with the On Demand step if both use the same expression.
 *   With a literal string each step is unique and there is no risk of conflict.
 */
When('I click the "Live TV" navigation button', async function () {
  // Step 1: click the "Live TV" link in the top menu (defined in HomePage)
  await this.homePage.clickNavButton('Live TV');

  // Step 2: instantiate the Live TV Page Object (the page already navigated after the click)
  this.liveTvPage = new LiveTvPage(this.page);

  // Step 3: wait for the Live TV page to be loaded and interactive
  await this.liveTvPage.waitForPage();

  // Step 4: set LiveTvPage as the active carousel for the next step
  // The "I click the {string} button on the hero carousel" step will use this reference
  this.activeCarouselPage = this.liveTvPage;
});
