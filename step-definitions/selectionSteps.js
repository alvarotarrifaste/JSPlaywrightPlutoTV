const { When } = require('@cucumber/cucumber');
const assert = require('node:assert/strict');
const DetailsPage = require('../pages/DetailsPage');

When('I choose an available live channel from Home', async function () {
  this.selectedChannel = await this.homePage.openLiveChannel();
});

When('I open the featured on-demand title', async function () {
  this.selectedTitleUrl = await this.homePage.openFeaturedTitle();
});

When('I choose another channel from the guide', async function () {
  this.selectedChannel = await this.liveTvPage.selectAnotherChannel();
  assert.equal(await this.liveTvPage.selectedChannelId(), this.selectedChannel);
});

When('I choose an available movie', async function () {
  this.selectedTitleUrl = await this.moviesPage.openMovie();
});

When('I start watching the selected title', async function () {
  this.detailsPage = new DetailsPage(this.page);
  await this.detailsPage.waitForPage();
  assert.equal(this.page.url(), this.selectedTitleUrl);
  assert.ok((await this.detailsPage.title.innerText()).trim().length > 0);
  await this.detailsPage.startWatching();
});
