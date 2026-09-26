import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
const dir = 'context/rediseno/implementacion-v37';
await mkdir(dir, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
for (const [label, width, height] of [['desktop', 1440, 1000], ['mobile', 390, 844], ['wide', 2559, 1311]]) {
  const page = await browser.newPage({ viewport: { width, height } });
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://localhost:4321/hexy');
  await page.locator('astro-island[component-url*="HexyShowcase"]:not([ssr])').waitFor({ state: 'attached' });
  await page.getByRole('button', { name: 'ES', exact: true }).click();
  for (const [name, selector] of [
    ['entry', '[data-room-door=backstage]'], ['backstage', '#camerino'],
    ['studio-door', '[data-room-door=studio]'], ['studio', '#estudio'],
    ['records-door', '[data-room-door=records]'], ['records', '#canciones'],
    ['encore-door', '[data-room-door=encore]'], ['encore', '[data-hexy-scene=encore]'],
  ]) {
    await page.locator(selector).evaluate(el => {
      const rect = el.getBoundingClientRect();
      const isDoor = el.hasAttribute('data-room-door');
      scrollTo(0, scrollY + rect.top - (isDoor ? (innerHeight - rect.height) / 2 : 25));
    });
    await page.waitForTimeout(700);
    await page.screenshot({ path: `${dir}/${label}-${name}.png` });
  }
  console.log(label, JSON.stringify({ errors, overflow: await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), rooms: await page.locator('[data-room-backdrop]').evaluateAll(els => els.map(el => ({ name: el.dataset.roomBackdrop, opacity: getComputedStyle(el).opacity }))) }));
  await page.close();
}
await browser.close();
