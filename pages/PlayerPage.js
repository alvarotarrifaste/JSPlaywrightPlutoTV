class PlayerPage {
  constructor(page) {
    this.page = page;
    this.videoElement = page.locator('video');
  }

  async waitForPlayer(timeout = 25000) {
    await this.videoElement.waitFor({ state: 'visible', timeout });
  }

  async waitForFullScreenLayout(timeout = 20000) {
    await this.page.waitForFunction(
      () => {
        const video = document.querySelector('video');
        if (!video) return false;
        const rect = video.getBoundingClientRect();
        return (
          rect.width >= window.innerWidth * 0.85 &&
          rect.height >= window.innerHeight * 0.85
        );
      },
      { timeout }
    );
  }

  async waitForPlayback(timeout = 30000) {
    // Live TV: reaches readyState >= 3 quickly once stream delivers data.
    // VOD (DRM via blob URL): stays at readyState 0 but networkState 2 confirms
    // the browser is actively fetching encrypted segments — playback is initiated.
    await this.page.waitForFunction(
      () => {
        const video = document.querySelector('video');
        if (!video) return false;
        const hasSource = video.src !== '' || video.currentSrc !== '';
        return hasSource && !video.paused && (video.readyState >= 3 || video.networkState === 2);
      },
      { timeout }
    );
  }
}

module.exports = PlayerPage;
