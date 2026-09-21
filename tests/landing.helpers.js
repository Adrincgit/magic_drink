import { expect } from '@playwright/test';
export async function openLanding(page, suffix = '') {
  await page.goto(`/${suffix}`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('[data-journey]')).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('[data-journey]')).toHaveAttribute('data-assets-ready', 'true', { timeout: 10000 });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  });
}
export async function goWorld(page, progress) {
  await page.locator('[data-runway]').evaluate((element, p) => {
    const stage = element.querySelector('[data-stage]');
    scrollTo({
      top:
        element.getBoundingClientRect().top +
        scrollY +
        (element.offsetHeight - stage.offsetHeight) * p / Number(element.closest('[data-journey]').dataset.worldEnd || 1),
      behavior: 'instant',
    });
  }, progress);
  await expect
    .poll(() =>
      page.locator('[data-journey]').evaluate((element) => Number(element.dataset.worldProgress)),
    )
    .toBeCloseTo(progress, 2);
}
export async function goTo(page, selector, progress) {
  if (selector !== '[data-runway]') throw new Error('Use goWorld for the continuous world.');
  await goWorld(page, progress * 0.36);
  await expect
    .poll(() =>
      page.locator('[data-journey]').evaluate((element) => Number(element.dataset.progress)),
    )
    .toBeCloseTo(progress, 2);
}
