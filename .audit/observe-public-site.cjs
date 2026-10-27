const { chromium } = require('playwright');
const fs = require('node:fs/promises');
(async()=>{
  await fs.mkdir('reports',{recursive:true});
  const browser=await chromium.launch({headless:true});
  try {
    for (const journey of ['home-live','home-vod','movies-vod','live-guide']) {
      const context=await browser.newContext({viewport:{width:1920,height:1080},locale:'en-US'});
      const page=await context.newPage();
      page.setDefaultTimeout(15000);
      await page.addInitScript(()=>{
        window.mediaEvents=[];
        for(const type of ['play','playing','timeupdate','encrypted','waitingforkey','error'])
          document.addEventListener(type,e=>{
            if(e.target instanceof HTMLVideoElement && window.mediaEvents.length<120)
              window.mediaEvents.push({type,time:e.target.currentTime,ready:e.target.readyState});
          },true);
      });
      const state=()=>page.evaluate(()=>({
        url:location.href,
        text:document.body.innerText.slice(0,1800),
        links:[...document.querySelectorAll('a')].filter(n=>n.href.includes('/watch/')||n.getAttribute('data-testid')==='main-cta').slice(0,18).map(n=>({text:n.textContent,aria:n.getAttribute('aria-label'),href:n.getAttribute('href'),testid:n.getAttribute('data-testid')})),
        buttons:[...document.querySelectorAll('button')].slice(0,15).map(n=>({text:n.textContent,aria:n.getAttribute('aria-label'),testid:n.getAttribute('data-testid')})),
        testids:[...new Set([...document.querySelectorAll('[data-testid]')].map(n=>n.getAttribute('data-testid')))].slice(0,70),
        video:[...document.querySelectorAll('video')].map(v=>({src:v.currentSrc||v.src,paused:v.paused,ready:v.readyState,network:v.networkState,time:v.currentTime,error:v.error?.code,keys:!!v.mediaKeys,width:v.videoWidth,height:v.videoHeight})),
        events:window.mediaEvents.slice(-20)
      }));
      async function log(label){console.log('JOURNEY '+journey+' '+label+' '+JSON.stringify(await state()));}
      try {
        await page.goto('https://pluto.tv/us/home/',{waitUntil:'domcontentloaded'});
        await page.getByTestId('spotlight-carousel').waitFor({state:'visible'});
        if(journey==='home-live'){
          const channels=page.locator('a[href*="/watch/live-tv/"][href*="#"]');
          console.log('LIVE_LINKS '+JSON.stringify(await channels.evaluateAll(ns=>ns.slice(0,5).map(n=>({html:n.outerHTML.slice(0,2500),ancestor:n.parentElement.parentElement.className})))));
          await channels.first().click();
        } else if(journey==='live-guide') {
          await page.locator('a[href="/us/watch/live-tv/"]').first().click();
        } else {
          if(journey==='movies-vod') {
            await page.locator('a[href="/us/movies/"]').first().click();
            await page.getByTestId('spotlight-carousel').waitFor({state:'visible'});
          }
          await log('before-details');
          await page.getByTestId('spotlight-carousel').getByTestId('main-cta').click();
          await page.locator('a[href*="/watch/movies/"],a[href*="/watch/shows/"],a[href*="/watch/series/"]').first().waitFor({state:'visible'});
          await log('details');
          await page.locator('a[href*="/watch/movies/"],a[href*="/watch/shows/"],a[href*="/watch/series/"]').first().click();
        }
        await log('watch-start');
        const start=await page.locator('video').first().evaluate(v=>v.currentTime).catch(()=>0);
        const progressing=await page.waitForFunction(t=>{
          const v=document.querySelector('video');
          return v && !v.paused && v.readyState>=2 && v.currentTime>t+2;
        },start,{timeout:20000}).then(()=>true,()=>false);
        await log('watch-after-observation');
        console.log('PROGRESS '+journey+' '+progressing);
        if(journey==='live-guide') console.log('GUIDE_DOM '+await page.locator('main').evaluate(n=>n.outerHTML.slice(-20000)));
      } catch(error){console.log('JOURNEY_ERROR '+journey+' '+error.message);await log('error');}
      await page.screenshot({path:'reports/'+journey+'.png'});
      await context.close();
    }
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});
