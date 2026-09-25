import { test, expect } from '@playwright/test';
import { openLanding, goWorld } from './landing.helpers';
import { hexyQuestions, interviewStop, INTERVIEW_START, INTERVIEW_FINISH } from '../src/data/hexyInterview';
import { INTERVIEW_READY, INTERVIEW_STEP } from '../src/data/hexyInterviewTiming';

test('the interview advances and reverses through questions, answers and matching poses with scroll', async ({ page }) => {
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await openLanding(page);
  const scene = page.locator('[data-hexy-interview]');
  await expect(scene.locator('img')).toHaveCount(0);
  const span = (INTERVIEW_FINISH - INTERVIEW_START) / 3;
  for (const i of [0, 1, 2, 1, 0]) {
    await goWorld(page, INTERVIEW_START + (i + .06) * span);
    await expect(scene).toHaveAttribute('data-pose', 'listen');
    await expect(scene).toHaveAttribute('data-answer-visible', 'false');
    await goWorld(page, interviewStop(i));
    await expect(scene).toHaveAttribute('data-question', ['music', 'boring', 'addiction'][i]);
    await expect(scene).toHaveAttribute('data-pose', i === 0 ? 'excited' : 'thoughtful');
    await expect(scene.locator('[data-hexy-answer]')).toContainText(hexyQuestions[i].answer[0]);
  }
  await expect(scene.locator('[data-character-pose="excited"]')).toBeVisible();
  await expect.poll(() => scene.locator('img').evaluateAll(imgs => imgs.every(img => img.complete && img.naturalWidth > 0))).toBe(true);
  await goWorld(page, .49);
  await expect(scene).toHaveAttribute('data-interview-active', 'false');
  expect(errors).toEqual([]);
});

test('questions are keyboard accessible, selection survives rest and scrolling resumes the interview', async ({ page }) => {
  await openLanding(page, '#preguntas-wonderpop'); await goWorld(page, interviewStop(0));
  const scene = page.locator('[data-hexy-interview]'), trigger = scene.getByRole('button', { name: 'Hazle otra pregunta' });
  const before = await page.evaluate(() => scrollY);
  await trigger.focus(); await page.keyboard.press('Enter');
  const dialog = scene.locator('dialog'); await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Lo que se dice', exact: true }).click();
  await expect(dialog.locator('[data-ask]')).toHaveCount(4);
  await dialog.locator('[data-ask="cost"]').click();
  await expect(dialog).not.toBeVisible();
  await expect(scene).toHaveAttribute('data-question', 'cost');
  await expect(scene.locator('[data-hexy-answer]')).toContainText('no me gustaría', { ignoreCase: true });
  await expect(trigger).toBeFocused();
  expect(Math.abs((await page.evaluate(() => scrollY)) - before)).toBeLessThan(4);
  await trigger.click(); await dialog.locator('[data-ask="cost"]').click();
  await expect(scene).toHaveAttribute('data-answer-visible', 'true');
  await trigger.click(); await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await goWorld(page, interviewStop(1));
  await expect(scene).toHaveAttribute('data-question', 'boring');
  await expect(scene).toHaveAttribute('data-pose', 'thoughtful');
});

test('the scenery has independent depth while dialogue stays still and music remains available', async ({ page }) => {
  await openLanding(page); await goWorld(page, interviewStop(0));
  const scene = page.locator('[data-hexy-interview]');
  const bounds = () => scene.locator('[data-interview-layer]').evaluateAll(els => els.map(el => ({ name: el.dataset.interviewLayer, x: el.getBoundingClientRect().x })));
  await page.mouse.move(150, 200); await page.waitForTimeout(550); const left = await bounds();
  const copyX = await scene.locator('[data-world-copy]').evaluate(el => el.getBoundingClientRect().x);
  await page.mouse.move(1250, 600); await page.waitForTimeout(650); const right = await bounds();
  const moves = right.map((el, i) => Math.abs(el.x - left[i].x));
  expect(moves[0]).toBeGreaterThan(2); expect(moves[1]).toBeGreaterThan(moves[0] * 2);
  expect(moves[2]).toBeGreaterThan(moves[1]);
  expect(await scene.locator('[data-world-copy]').evaluate(el => el.getBoundingClientRect().x)).toBeCloseTo(copyX, 1);
  await expect(page.locator('[data-compact-player]')).toBeVisible();
});

test('phone layout keeps answers and controls readable above the mini player', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openLanding(page); await goWorld(page, interviewStop(2));
  const scene = page.locator('[data-hexy-interview]');
  const copy = await scene.locator('[data-world-copy]').boundingBox();
  const player = await page.locator('[data-compact-player]').boundingBox();
  const heading = await scene.locator('[data-interview-heading]').boundingBox();
  const question = await scene.locator('#hexy-question').boundingBox();
  expect(heading.y + heading.height).toBeLessThan(question.y);
  expect(copy.x).toBeGreaterThanOrEqual(0); expect(copy.x + copy.width).toBeLessThanOrEqual(390);
  expect(copy.y + copy.height).toBeLessThan(player.y);
  await scene.getByRole('button', { name: 'Hazle otra pregunta' }).click();
  const dialog = scene.locator('dialog');
  await dialog.getByRole('button', { name: 'Su música', exact: true }).click();
  await dialog.locator('[data-ask="composer"]').click();
  await expect(scene.locator('[data-hexy-answer]')).toContainText('DJ Sweet Hex');
});

test('reduced motion retains all questions and language changes without animated scenery', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openLanding(page, '#preguntas-wonderpop');
  const scene = page.locator('[data-hexy-interview]');
  await scene.scrollIntoViewIfNeeded();
  await expect(scene).toBeVisible();
  await expect(scene.locator('[data-hexy-answer]')).toContainText(hexyQuestions[0].answer[0]);
  await scene.getByRole('button', { name: 'Hazle otra pregunta' }).click();
  await expect(scene.locator('[data-ask]')).toHaveCount(hexyQuestions.length);
  await page.keyboard.press('Escape');
  await page.locator('[data-journey-menu-trigger]').click();
  await page.getByRole('button', { name: 'EN', exact: true }).first().click(); await page.keyboard.press('Escape');
  await scene.getByRole('button', { name: 'Ask her something else' }).click();
  await scene.locator('[data-ask="addiction"]').click();
  await expect(scene.locator('[data-hexy-answer]')).toContainText(hexyQuestions[2].answer[1]);
  await expect(scene.locator('[data-hexy-typed]')).toHaveText(hexyQuestions[2].answer[1]);
  await expect(scene.getByRole('button', { name: 'Show all' })).toHaveCount(0);
  await expect(scene.locator('[data-interview-layer="hexy"]')).toHaveCSS('transform', 'none');
});

test('arrival is fully visible before replies start and each question has a longer reading stretch', async ({ page }) => {
  await openLanding(page);
  const scene = page.locator('[data-hexy-interview]');
  for (const position of [2.54, INTERVIEW_READY + .01, INTERVIEW_START + .01]) {
    await goWorld(page, position);
    await expect(scene).toHaveAttribute('data-question', 'music');
    await expect(scene).toHaveAttribute('data-answer-visible', 'false');
    await expect(scene.locator('[data-hexy-typed]')).toHaveCount(0);
  }
  await expect(scene.locator('[data-world-copy]')).toHaveCSS('opacity', '1');
  await goWorld(page, interviewStop(0));
  const first = await page.evaluate(() => scrollY);
  await page.mouse.wheel(0, 850);
  await expect(page.locator('html')).not.toHaveClass(/lenis-scrolling/);
  await expect(scene).toHaveAttribute('data-question', 'music');
  await goWorld(page, interviewStop(1));
  const distance = await page.evaluate(() => scrollY) - first;
  expect(distance).toBeGreaterThan(1800);
  expect(INTERVIEW_STEP).toBeGreaterThan(.091667 * 2.5);
  await goWorld(page, .49);
  const unchanged = await page.locator('[data-runway]').evaluate(el => scrollY - (el.getBoundingClientRect().top + scrollY));
  expect(unchanged).toBeCloseTo(900 * 9.4 * .49, 0);
});

test('Hexy types at rest, pauses for questions, and can reveal the answer without shifting the layout', async ({ page }) => {
  await openLanding(page); await goWorld(page, interviewStop(0));
  const scene = page.locator('[data-hexy-interview]');
  const typed = scene.locator('[data-hexy-typed]');
  const answer = scene.locator('[data-hexy-answer]');
  await expect(typed).not.toHaveText('');
  const initial = await typed.textContent();
  expect(initial.length).toBeLessThan(hexyQuestions[0].answer[0].length);
  const bounds = await answer.boundingBox();
  const scroll = await page.evaluate(() => scrollY);
  await expect.poll(async () => (await typed.textContent()).length).toBeGreaterThan(initial.length + 12);
  expect(await page.evaluate(() => scrollY)).toBe(scroll);
  await scene.getByRole('button', { name: 'Hazle otra pregunta' }).click();
  const paused = await typed.textContent();
  await page.waitForTimeout(250);
  await expect(typed).toHaveText(paused);
  await page.keyboard.press('Escape');
  await expect.poll(async () => (await typed.textContent()).length).toBeGreaterThan(paused.length);
  await scene.getByRole('button', { name: 'Mostrar todo' }).click();
  await expect(typed).toHaveText(hexyQuestions[0].answer[0]);
  expect((await answer.boundingBox()).height).toBeCloseTo(bounds.height, 0);
  await goWorld(page, interviewStop(1));
  await expect(typed).not.toHaveText('');
  expect((await typed.textContent()).length).toBeLessThan(hexyQuestions[1].answer[0].length);
  await goWorld(page, .49);
  await page.waitForTimeout(250);
  expect(await typed.count()).toBe(0);
  await goWorld(page, interviewStop(0));
  await expect(typed).toHaveText(hexyQuestions[0].answer[0]);
  await goWorld(page, interviewStop(1));
  await expect(typed).toHaveText(hexyQuestions[1].answer[0], { timeout: 12000 });
});
