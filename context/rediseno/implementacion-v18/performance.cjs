const { chromium } = require('@playwright/test');
const fs = require('node:fs');
(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await page.goto('http://localhost:4321/#directorio-wonderpop');
    await page.locator('[data-atrium-engine][data-renderer=webgl]').waitFor();
    await page.evaluate(() => document.fonts.ready);
    const session = await page.context().newCDPSession(page);
    await session.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    const result = await page.evaluate(async () => {
      const runway = document.querySelector('[data-runway]'), stage = document.querySelector('[data-stage]');
      const distance = (runway.offsetHeight - stage.offsetHeight) / Number(runway.closest('[data-journey]').dataset.worldEnd);
      const tasks = [], periods = {};
      const observer = new PerformanceObserver(list => tasks.push(...list.getEntries().map(e => Math.round(e.duration))));
      observer.observe({ type: 'longtask' });
      for (const [name, duration, from, to] of [['walk', 7500, .86, .99], ['rest', 2000, .99, .99], ['reverse', 7500, .99, .86]]) {
        const deltas = [];
        await new Promise(resolve => {
          let start, previous;
          const tick = now => {
            start ??= now; if (previous) deltas.push(now - previous); previous = now;
            const part = Math.min(1, (now - start) / duration);
            scrollTo({ top: distance * (from + (to - from) * part), behavior: 'instant' });
            if (part < 1) requestAnimationFrame(tick); else resolve();
          }; requestAnimationFrame(tick);
        });
        deltas.sort((a, b) => a - b);
        periods[name] = { frames: deltas.length, medianMs: +deltas[Math.floor(deltas.length * .5)].toFixed(2), p95Ms: +deltas[Math.floor(deltas.length * .95)].toFixed(2), over50Ms: deltas.filter(n => n > 50).length };
      }
      observer.disconnect();
      return { periods, longTasksMs: tasks, horizontalOverflow: document.documentElement.scrollWidth > innerWidth, stageScroll: stage.scrollTop, renderer: document.querySelector('[data-atrium-engine]').dataset.renderer };
    });
    const report = { environment: 'Local Chrome headless, 390x844, DPR2, touch emulation, CPU 4x, decoded architectural textures. Not a physical phone or a cold network test.', ...result };
    fs.writeFileSync(`${__dirname}/performance.json`, JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
