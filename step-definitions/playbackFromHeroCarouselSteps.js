const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const HomePage = require('../pages/HomePage');
const PlayerPage = require('../pages/PlayerPage');

Given('I open the PlutoTV home page', async function () {
  this.homePage = new HomePage(this.page);
  await this.homePage.navigate();
});

When('I click the {string} button on the hero carousel', async function (buttonText) {
  await this.homePage.clickHeroCarouselButton(buttonText);
});

Then('the video player should be displayed in full screen', async function () {
  this.playerPage = new PlayerPage(this.page);
  await this.playerPage.waitForPlayer();
  await this.playerPage.waitForFullScreenLayout();
});

Then('the playback should be active', async function () {
  await this.playerPage.waitForPlayback();
});
