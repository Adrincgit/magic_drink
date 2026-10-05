import { test, expect } from '@playwright/test';
import sharp from 'sharp';
import { openLanding, goWorld } from './landing.helpers';
import { journeyChapters, JOURNEY_END } from '../src/data/journeyChapters';

async function expectRefraction(page, parent) {
  await page.addStyleTag({content:'[data-hexy-finish] > :not([data-finish-lens]) { visibility:hidden !important; }'});
  await parent.evaluate(el => {
    const probe=document.createElement('button');
    probe.dataset.finishProbe='';
    probe.style.cssText='position:fixed;left:50%;top:50%;width:80px;height:80px;translate:-50% -50%;padding:0;border:0;background:linear-gradient(90deg,#000 50%,#fff 50%);z-index:9999';
    el.append(probe);
  });
  const box=await page.locator('[data-finish-probe]').boundingBox();
  const {data,info}=await sharp(await page.screenshot()).removeAlpha().raw().toBuffer({resolveWithObject:true});
  const x=Math.round(box.x+box.width/2), y=Math.round(box.y+box.height/2);
  const dispersion=Array.from({length:12},(_,i)=> {
    const p=(y*info.width+x-6+i)*info.channels;
    const rgb=[...data.subarray(p,p+3)];
    return Math.max(...rgb)-Math.min(...rgb);
  });
  expect(Math.max(...dispersion)).toBeGreaterThan(15);
  await page.locator('[data-finish-probe]').evaluate(el=>el.remove());
}

for (const width of [390,1440]) {
  test(`one optical pass covers the whole journey and its central components at ${width}px`, async ({page}) => {
    await page.setViewportSize({width,height:900});
    const errors=[]; page.on('pageerror',error=>errors.push(error.message));
    await openLanding(page);
    await page.locator('[data-finish-grain]').evaluate(el=>el.dataset.continuity='same-canvas');
    for(const progress of [...journeyChapters.map(chapter=>chapter.at),JOURNEY_END-.04]) {
      await goWorld(page,progress);
      await expect(page.locator('[data-finish-grain]')).toHaveCount(1);
      await expect(page.locator('[data-finish-grain]')).toHaveAttribute('data-grain-state','running');
      await expect(page.locator('[data-finish-grain]')).toHaveAttribute('data-continuity','same-canvas');
      expect(await page.locator('[data-finish-grain]').boundingBox()).toEqual({x:0,y:0,width,height:900});
      expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBe(0);
    }
    await expectRefraction(page,page.locator('[data-journey]'));
    expect(errors).toEqual([]);
  });
}

test('menu and questions share the optical pass; toggling preserves camera, focus and player', async ({page}) => {
  await openLanding(page);
  await goWorld(page,journeyChapters.at(-1).at);
  const before=await page.evaluate(()=>({scroll:scrollY,audio:document.querySelector('audio').currentTime}));
  const trigger=page.locator('[data-journey-menu-trigger]');
  await trigger.click();
  const menu=page.locator('[data-journey-menu]');
  await expect(menu.locator('[data-finish-grain]')).toHaveCount(1);
  await expect(page.locator('[data-finish-grain]')).toHaveCount(1);
  await expectRefraction(page,menu);
  const toggle=menu.getByRole('button',{name:/Acabado ilustrado/});
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed','false');
  await expect(page.locator('[data-finish-grain]')).toHaveAttribute('data-grain-state','paused');
  await toggle.click();
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await expect(menu.locator('[data-finish-grain]')).toHaveCount(0);
  await expect(page.locator('[data-finish-grain]')).toHaveAttribute('data-grain-state','running');
  expect(await page.evaluate(()=>({scroll:scrollY,audio:document.querySelector('audio').currentTime}))).toEqual(before);
  await page.getByRole('button',{name:/Hazle otra pregunta/}).click();
  await expect(page.locator('[data-hexy-questions] [data-finish-grain]')).toHaveCount(1);
  await expectRefraction(page,page.locator('[data-hexy-questions]'));
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-hexy-questions] [data-finish-grain]')).toHaveCount(0);
  await expect(page.locator('[data-finish-lens]')).toHaveCSS('clip-path','none');
});

test('reduced motion keeps one still exposure, including the menu, and resumes on preference change', async ({page}) => {
  await page.emulateMedia({reducedMotion:'reduce'});
  await openLanding(page);
  const grain=page.locator('[data-finish-grain]');
  await expect(grain).toHaveAttribute('data-grain-state','still');
  await page.locator('[data-journey-menu-trigger]').click();
  await expect(page.locator('[data-journey-menu] [data-finish-grain]')).toHaveAttribute('data-grain-state','still');
  await page.addStyleTag({content:'[data-finish-grain] {opacity:1!important;mix-blend-mode:normal!important} [data-hexy-finish]>div {display:none!important}'});
  const box=await grain.boundingBox();
  const clip={x:Math.round(box.x+20),y:Math.round(box.y+20),width:100,height:100};
  const first=await page.screenshot({clip});
  await page.waitForTimeout(150);
  expect((await page.screenshot({clip})).equals(first)).toBe(true);
  await page.emulateMedia({reducedMotion:'no-preference'});
  await expect(grain).toHaveAttribute('data-grain-state','running');
});
