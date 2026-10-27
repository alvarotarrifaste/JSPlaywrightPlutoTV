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
      return {
        source: video.currentSrc || video.src,
        time: video.currentTime,
        frames: quality.totalVideoFrames - quality.droppedVideoFrames,
        paused: video.paused,
        readyState: video.readyState,
        networkState: video.networkState,
        errorCode: video.error?.code || null,
        mediaKeysAttached: !!video.mediaKeys,
      };
    }, undefined, { timeout: 1000 });
  }

  async waitForProgress() {
    await this.page.waitForFunction(selector => {
      const video = document.querySelector(selector);
      return video && !video.paused && !video.seeking && !video.error &&
        video.readyState >= 2 && video.videoWidth > 0;
    }, this.selector, { timeout: 20000 });

    let before = await this.readState();
    const deadline = Date.now() + 30000;
    try {
      // Ads may replace/reset media. Resample within the original deadline.
      while (Date.now() < deadline) {
        const handle = await this.page.waitForFunction(({ selector, before }) => {
          const video = document.querySelector(selector);
          if (!video) return false;
          const quality = video.getVideoPlaybackQuality();
          const state = {
            source: video.currentSrc || video.src,
            time: video.currentTime,
            frames: quality.totalVideoFrames - quality.droppedVideoFrames,
            paused: video.paused,
            readyState: video.readyState,
            networkState: video.networkState,
            errorCode: video.error?.code || null,
            mediaKeysAttached: !!video.mediaKeys,
          };
          if (state.source !== before.source || state.time < before.time || state.frames < before.frames) {
            return { reset: true, state };
          }
          if (state.source && !state.paused && !video.seeking && !state.errorCode &&
              state.readyState >= 2 && state.time > before.time + 1 && state.frames > before.frames + 15) {
            return { reset: false, state };
          }
          return false;
        }, { selector: this.selector, before }, { timeout: Math.max(1, deadline - Date.now()), polling: 250 });

        const observation = await handle.jsonValue();
        await handle.dispose();
        if (observation.reset) {
          before = observation.state;
        } else {
          return { before, after: observation.state };
        }
      }
      throw new Error('Media kept resetting within the 30-second observation window');
    } catch (error) {
      const after = await this.readState();
      throw new Error(`Media did not progress on the selected player: ${JSON.stringify({ before, after })}`, { cause: error });
    }
  }
}

module.exports = PlayerPage;
