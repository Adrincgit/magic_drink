const { chromium } = require('@playwright/test');
const fs = require('node:fs');
(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await page.goto('http://localhost:4321/#galeria-wonderpop');
    await page.locator('[data-journey][data-assets-ready=true]').waitFor();
    const gallery = page.locator('[data-world-scene="gallery"]');
    await gallery.getByRole('button', { name: 'Hexy', exact: true }).click();
    await gallery.getByRole('button', { name: 'Escucha a Hexy' }).click();
    await page.locator('[data-exhibit-screen][data-renderer=webgl]').waitFor();
    await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.querySelectorAll('[data-continuation] img')].map(img => img.decode().catch(() => {}))); });
    const session = await page.context().newCDPSession(page);
    await session.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    const result = await page.evaluate(async () => {
      const runway = document.querySelector('[data-runway]'), stage = document.querySelector('[data-stage]');
      const distance = (runway.offsetHeight - stage.offsetHeight) / Number(runway.closest('[data-journey]').dataset.worldEnd);
      const tasks = [], periods = {};
      const observer = new PerformanceObserver(list => tasks.push(...list.getEntries().map(e => Math.round(e.duration))));
      observer.observe({ type: 'longtask' });
      for (const [name, duration, from, to] of [['atrium', 2400, .99, .99], ['crossing', 4500, .99, 1.2], ['gallery', 2400, 1.2, 1.2]]) {
        scrollTo({ top: distance * from, behavior: 'instant' });
        const deltas = [];
        await new Promise(resolve => {
          let first, previous;
          const tick = now => {
            first ??= now;
            if (previous) deltas.push(now - previous);
            previous = now;
            const part = Math.min(1, (now - first) / duration);
            if (from !== to) scrollTo({ top: distance * (from + (to - from) * part), behavior: 'instant' });
            if (part < 1) requestAnimationFrame(tick); else resolve();
          };
          requestAnimationFrame(tick);
        });
        deltas.sort((a, b) => a - b);
        periods[name] = { frames: deltas.length, medianMs: +deltas[Math.floor(deltas.length * .5)].toFixed(2), p95Ms: +deltas[Math.floor(deltas.length * .95)].toFixed(2), over50Ms: deltas.filter(n => n > 50).length };
      }
      observer.disconnect();
      return { periods, longTasksMs: tasks, horizontalOverflow: document.documentElement.scrollWidth > innerWidth, stageScroll: stage.scrollTop, shader: document.querySelector('[data-exhibit-screen]').exhibitDiagnostics() };
    });
    const report = { environment: 'Local Chrome headless, 390x844, DPR2, touch emulation, CPU 4x, music playing, decoded assets. Not a physical phone or cold network test.', ...result };
    fs.writeFileSync(`${__dirname}/performance.json`, JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
