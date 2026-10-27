const { chromium } = require('playwright');
const fs = require('node:fs/promises');

(async () => {
  await fs.mkdir('reports', { recursive: true });
  for (const legacy of [false, true]) {
    const browser = await chromium.launch({
      headless: true,
      args: legacy ? ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-blink-features=AutomationControlled'] : [],
    });
    try {
      const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        locale: 'en-US',
        timezoneId: 'America/New_York',
        ...(legacy ? { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36' } : {}),
      });
      const page = await context.newPage();
      page.setDefaultTimeout(20000);
      const failures = [];
      page.on('requestfailed', r => failures.push({url:r.url().split('?')[0], error:r.failure()?.errorText}));
      await page.addInitScript(() => {
        window.mediaEvents = [];
        for (const type of ['play', 'playing', 'timeupdate', 'encrypted', 'waitingforkey', 'error']) {
          document.addEventListener(type, event => {
            if (event.target instanceof HTMLVideoElement && window.mediaEvents.length < 40)
              window.mediaEvents.push({type, time:event.target.currentTime, ready:event.target.readyState});
          }, true);
        }
      });
      await page.goto('https://pluto.tv/us/hub/home?lang=en', {waitUntil:'domcontentloaded'});
      await page.locator('nav a, button').first().waitFor({state:'visible'}).catch(error => console.log(error.message));
      await page.waitForTimeout(5000);
      async function observe(label) {
        const observation = await page.evaluate(() => ({
          url: location.href,
          title: document.title,
          text: document.body.innerText.slice(0,5000),
          buttons: [...document.querySelectorAll('button')].slice(0,30).map(n=>({text:n.textContent,aria:n.getAttribute('aria-label'),class:n.className})),
          links: [...document.querySelectorAll('a')].slice(0,20).map(n=>({text:n.textContent,aria:n.getAttribute('aria-label'),href:n.getAttribute('href')})),
          hero: [...document.querySelectorAll('[class*="hero"],[class*="Hero"],[class*="marquee"],[aria-roledescription="carousel"]')].slice(0,3).map(n=>n.outerHTML.slice(0,18000)),
          video: [...document.querySelectorAll('video')].map(v=>({src:v.currentSrc||v.src,paused:v.paused,readyState:v.readyState,networkState:v.networkState,currentTime:v.currentTime,error:v.error?.code,mediaKeys:!!v.mediaKeys,rect:v.getBoundingClientRect().toJSON()})),
          events: window.mediaEvents,
        }));
        await fs.writeFile('reports/observation-'+label+'.json',JSON.stringify(observation,null,2));
        await page.screenshot({path:'reports/observation-'+label+'.png'});
        console.log('SITE_OBSERVATION '+label+' '+JSON.stringify(observation));
      }
      await observe(legacy ? 'legacy-home' : 'clean-home');
      if (!legacy) {
        for (const section of ['live-tv', 'on-demand']) {
          const link=page.locator('a[href*="/'+section+'"]').first();
          if (await link.isVisible()) {
            await link.click();
            await page.waitForTimeout(4000);
            await observe('clean-'+section);
          }
        }
      }
      console.log('REQUEST_FAILURES '+JSON.stringify(failures.slice(0,10)));
    } finally { await browser.close(); }
  }
})().catch(error=>{console.error(error);process.exitCode=1;});
