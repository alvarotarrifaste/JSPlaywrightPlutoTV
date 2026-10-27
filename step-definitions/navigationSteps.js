const { Given, When } = require('@cucumber/cucumber');
const HomePage = require('../pages/HomePage');
const LiveTvPage = require('../pages/LiveTvPage');
const MoviesPage = require('../pages/MoviesPage');

Given('I open the Pluto TV US home page', async function () {
  this.homePage = new HomePage(this.page);
  await this.homePage.navigate();
});

When('I open Live TV', async function () {
  await this.homePage.openLiveTv();
  this.liveTvPage = new LiveTvPage(this.page);
  await this.liveTvPage.waitForPage();
});

When('I open Movies', async function () {
  await this.homePage.openMovies();
  this.moviesPage = new MoviesPage(this.page);
  await this.moviesPage.waitForPage();
});
