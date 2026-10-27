const { Then } = require('@cucumber/cucumber');
const assert = require('node:assert/strict');
const PlayerPage = require('../pages/PlayerPage');

Then('the selected live channel should open in the player', async function () {
  const url = new URL(this.page.url());
  assert.match(url.pathname, /^\/us\/watch\/live-tv\//);
  assert.ok(url.hash === `#${this.selectedChannel}` || url.pathname.endsWith(`/${this.selectedChannel}/`),
    `Expected selected channel ${this.selectedChannel} in ${url.href}`);
  this.playerPage = new PlayerPage(this.page, 'live');
  await this.playerPage.waitForPlayer();
});

Then('the selected on-demand title should open in the player', async function () {
  const url = new URL(this.page.url());
  assert.ok(url.pathname.startsWith(new URL(this.selectedTitleUrl).pathname));
  assert.equal(url.hash, '#open');
  this.playerPage = new PlayerPage(this.page, 'vod');
  await this.playerPage.waitForPlayer();
});

Then('media should progress in the selected player', async function () {
  const observation = await this.playerPage.waitForProgress();
  await this.attach(JSON.stringify(observation, null, 2), 'application/json');
  assert.equal(observation.after.source, observation.before.source);
  assert.ok(observation.after.time > observation.before.time + 1);
  assert.ok(observation.after.frames > observation.before.frames + 15);
  assert.equal(observation.after.errorCode, null);
});
