const { Before, After, Status } = require('@cucumber/cucumber');
const fs = require('node:fs/promises');

Before(async function () {
  await this.openBrowser();
});

After(async function ({ result, pickle }) {
  try {
    if (result?.status === Status.FAILED && this.page && !this.page.isClosed()) {
      try {
        await fs.mkdir('reports', { recursive: true });
        const screenshot = await this.page.screenshot({
          path: `reports/failure-${pickle.id}.png`,
          timeout: 5000,
        });
        await this.attach(screenshot, 'image/png');
        const state = await this.page.locator('video').evaluateAll(videos => videos.map(video => ({
          sourceAssigned: !!(video.currentSrc || video.src),
          paused: video.paused,
          currentTime: video.currentTime,
          readyState: video.readyState,
          networkState: video.networkState,
          errorCode: video.error?.code || null,
          mediaKeysAttached: !!video.mediaKeys,
        })));
        await this.attach(JSON.stringify({ url: this.page.url(), video: state }, null, 2), 'application/json');
      } catch (error) {
        await this.attach(`Failure diagnostics could not be captured: ${error.message}`, 'text/plain');
      }
    }
  } finally {
    await this.closeBrowser();
  }
});
