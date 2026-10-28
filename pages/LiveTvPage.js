class LiveTvPage {
  constructor(page) {
    this.page = page;
    this.playerContainer = page.getByTestId('epg-hero-player-container');
    this.availableChannel = page.locator('[role="row"][data-epg-row-id][data-playing="false"]').first();
  }

  async waitForPage() {
    await this.playerContainer.waitFor({ state: 'visible', timeout: 20000 });
    await this.availableChannel.waitFor({ state: 'visible', timeout: 20000 });
  }

  async selectAnotherChannel() {
    const channelId = await this.availableChannel.getAttribute('data-epg-row-id');
    await this.availableChannel.getByRole('link', { name: /^Channel / }).click();
    await this.page.getByRole('dialog').getByRole('button', { name: /^Watch (Live )?Channel$/i }).click();
    await this.page.waitForFunction(id => {
      const row = document.querySelector(`[data-epg-row-id="${id}"]`);
      return row?.getAttribute('data-playing') === 'true';
    }, channelId, { timeout: 15000 });
    return channelId;
  }

  async selectedChannelId() {
    return this.page.locator('[role="row"][data-playing="true"]').first().getAttribute('data-epg-row-id');
  }
}

module.exports = LiveTvPage;
