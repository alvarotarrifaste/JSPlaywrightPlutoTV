class PlayerPage {
  constructor(page, kind) {
    this.page = page;
    this.selector = kind === 'live'
      ? '[data-testid="epg-hero-player-container"] video'
      : '[data-testid="aop-vod-slot"] video';
    this.video = page.locator(this.selector);
  }

  async waitForPlayer() {
    await this.video.waitFor({ state: 'visible', timeout: 30000 });
  }

  async readState() {
    return this.video.evaluate(video => {
      const quality = video.getVideoPlaybackQuality();
      return ({
      source: video.currentSrc || video.src,
      time: video.currentTime,
      frames: quality.totalVideoFrames - quality.droppedVideoFrames,
      paused: video.paused,
      readyState: video.readyState,
      networkState: video.networkState,
      errorCode: video.error?.code || null,
      mediaKeysAttached: !!video.mediaKeys,
      });
    });
  }

  async waitForProgress() {
    await this.page.waitForFunction(selector => {
      const video = document.querySelector(selector);
      return video && !video.paused && !video.seeking && !video.error &&
        video.readyState >= 2 && video.videoWidth > 0;
    }, this.selector, { timeout: 20000 });

    const before = await this.readState();
    // Compare media on the selected surface, not the autoplay mini-player.
    await this.page.waitForFunction(({ selector, before }) => {
      const video = document.querySelector(selector);
      if (!video) return false;
      const quality = video.getVideoPlaybackQuality();
      return (video.currentSrc || video.src) === before.source &&
        !video.paused && !video.seeking && !video.error && video.readyState >= 2 &&
        video.currentTime > before.time + 1 &&
        quality.totalVideoFrames - quality.droppedVideoFrames > before.frames + 15;
    }, { selector: this.selector, before }, { timeout: 30000, polling: 250 });

    return { before, after: await this.readState() };
  }
}

module.exports = PlayerPage;
