import { test, expect } from '@playwright/test';
import sharp from 'sharp';
import { openLanding, goWorld } from './landing.helpers';
import { FILM_START, FILM_END, filmShots } from '../src/data/wonderpopFilm';
const position = (i, local=.5) => FILM_START+(i+local)*(FILM_END-FILM_START)/filmShots.length;

test('scroll tells the complete history in both directions, without changing the opening journey', async ({page}) => {
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await openLanding(page);
  const film=page.locator('[data-wonderpop-film]');
  await expect(film.locator('canvas')).toHaveCount(0);
  for (const p of [.162,.3132,.49,.68]) await goWorld(page,p);
  for(const i of [0,1,2,3,4,5,6,7,8,9,10,11,12,13,8,2,0]) {
    await goWorld(page,position(i));
    await expect(film).toHaveAttribute('data-film-shot',filmShots[i].id);
    await expect(film).toHaveAttribute('data-film-renderer','webgl');
    if(i!==13) await expect(film.locator('[data-film-caption] p')).toHaveText(filmShots[i].caption[0]);
  }
  await goWorld(page,position(1));
  await expect(film.getByText('Cincuenta años. Una fórmula.')).toBeVisible();
  await goWorld(page,position(6));
  await expect(film.locator('[data-film-caption] p')).toContainText('Cuatro años después del éxito');
  expect(errors).toEqual([]);
});

test('film texture keeps moving at rest, returns to full color, and sleeps offscreen', async ({page}) => {
  await openLanding(page,'#directorio-wonderpop');
  const film=page.locator('[data-wonderpop-film]');
  await goWorld(page,position(1));
  await expect(film).toHaveAttribute('data-film-renderer','webgl');
  const canvas=film.locator('canvas');
  const a=await sharp(await canvas.screenshot()).removeAlpha().raw().toBuffer();
  const frames=await film.evaluate(el=>el.filmDiagnostics.frames);
  await expect.poll(()=>film.evaluate(el=>el.filmDiagnostics.frames)).toBeGreaterThan(frames+8);
  const b=await sharp(await canvas.screenshot()).removeAlpha().raw().toBuffer();
  let changed=0,monochrome=0;for(let i=0;i<a.length;i+=3){changed+=Math.abs(a[i]-b[i]);monochrome+=Math.abs(a[i]-a[i+1]);}
  expect(changed/(a.length/3)).toBeGreaterThan(.1);
  expect(monochrome/(a.length/3)).toBeLessThan(2);
  await expect(film).toHaveAttribute('data-film-shot','laboratory');
  await goWorld(page,position(13));
  await expect(film).toHaveAttribute('data-film-renderer','webgl');
  const color=await sharp(await canvas.screenshot()).resize(400,200).removeAlpha().raw().toBuffer();
  let saturation=0;for(let i=0;i<color.length;i+=3)saturation+=Math.max(color[i],color[i+1],color[i+2])-Math.min(color[i],color[i+1],color[i+2]);
  expect(saturation/(color.length/3)).toBeGreaterThan(25);
  expect(await film.evaluate(el=>el.filmDiagnostics.textures)).toBeLessThanOrEqual(5);
  await goWorld(page,2.65);
  const count=await film.evaluate(el=>el.filmDiagnostics.frames);await page.waitForTimeout(180);
  expect(await film.evaluate(el=>el.filmDiagnostics.frames)).toBe(count);
  await expect(page.locator('[data-world-copy="interview"]')).toBeVisible();
});

test('the map reveals locations with scroll and the final invitation supports keyboard navigation', async ({page}) => {
  await openLanding(page,'#directorio-wonderpop');
  await goWorld(page,position(8,.1));
  const cities=page.locator('[data-film-place]');
  await expect(cities.first()).toHaveCSS('opacity','1');
  await expect(cities.last()).toHaveCSS('opacity','0');
  await goWorld(page,position(8,.9));
  await expect(cities.last()).toHaveCSS('opacity','1');
  await goWorld(page,position(13,.75));
  const visit=page.locator('[data-wonderpop-film]').getByRole('link',{name:'Ven a visitarnos'});
  await visit.focus();await expect(visit).toBeFocused();await visit.press('Enter');
  await expect(page).toHaveURL(/\/wonderpop-plaza\/?$/);
});

test('WebGL failure keeps the complete photo and scrolling usable', async ({page}) => {
  await openLanding(page,'#directorio-wonderpop');await goWorld(page,position(1));
  const film=page.locator('[data-wonderpop-film]');await expect(film).toHaveAttribute('data-film-renderer','webgl');
  await film.locator('canvas').evaluate(canvas=>{canvas.loss=canvas.getContext('webgl2').getExtension('WEBGL_lose_context');canvas.loss.loseContext()});
  await expect(film).toHaveAttribute('data-film-renderer','fallback');
  await expect(film.locator('[data-film-surface] img')).toBeVisible();
  await goWorld(page,position(6));await expect(film.locator('[data-film-caption] h3')).toHaveText('Cuatro años después');
  await film.locator('canvas').evaluate(canvas=>canvas.loss.restoreContext());
  await expect(film).toHaveAttribute('data-film-renderer','webgl');
  await film.getByRole('link',{name:'Continuar la visita'}).click();
  await expect.poll(()=>page.locator('[data-journey]').getAttribute('data-world-chapter')).toBe('interview');
});

test('reduced motion retains every image and caption in normal flow, in Spanish and English', async ({page}) => {
  await page.emulateMedia({reducedMotion:'reduce'});
  await openLanding(page,'#directorio-wonderpop');
  for(const lang of ['es','en']){
    await page.locator('[data-journey-menu-trigger]').click();
    await page.getByRole('button',{name:lang.toUpperCase(),exact:true}).first().click();
    await page.keyboard.press('Escape');
    const film=page.locator('[data-wonderpop-film]');
    await expect(film.locator('article')).toHaveCount(14);await expect(film.locator('canvas')).toHaveCount(0);
    await expect(film).toContainText(lang==='es'?'Cincuenta años':'Fifty years');
    const imageHeights=await film.locator('article > img').evaluateAll(els=>els.map(el=>el.getBoundingClientRect().height));
    for(const height of imageHeights)expect(height).toBeGreaterThan(100);
    const articles=await film.locator('article').evaluateAll(els=>els.map(el=>({top:el.getBoundingClientRect().top,bottom:el.getBoundingClientRect().bottom})));
    for(let i=1;i<articles.length;i++)expect(articles[i].top).toBeGreaterThan(articles[i-1].bottom);
    const link=film.getByRole('link',{name:lang==='es'?'Ven a visitarnos':'Come visit us'});await link.scrollIntoViewIfNeeded();await link.focus();await expect(link).toBeFocused();
  }
});

test('captions and final invitation fit narrow screens while the paused player remains available', async ({page}) => {
  await page.setViewportSize({width:390,height:844});await openLanding(page,'#directorio-wonderpop');
  for(const size of [{width:390,height:844},{width:390,height:640},{width:820,height:1180},{width:2559,height:1311}]){
    await page.setViewportSize(size);
    for(const i of [0,1,2,6,8,11,13]){
      await goWorld(page,position(i));
      const bounds=await page.locator(i===13?'[data-wonderpop-film] h2':'[data-film-caption]').boundingBox();
      expect(bounds.x).toBeGreaterThanOrEqual(0);expect(bounds.x+bounds.width).toBeLessThanOrEqual(size.width+1);
      expect(bounds.y).toBeGreaterThan(65);expect(bounds.y+bounds.height).toBeLessThan(size.height-90);
      expect(await page.locator('audio').evaluate(el=>el.paused)).toBe(true);
    }
  }
});
