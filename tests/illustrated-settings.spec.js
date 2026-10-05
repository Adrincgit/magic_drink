import { test, expect } from '@playwright/test';
import sharp from 'sharp';
import { openLanding, goWorld } from './landing.helpers';
import { INTERVIEW_ENTRY, interviewStop } from '../src/data/hexyInterviewTiming';

const overlap = (a,b) => a.x < b.x+b.width && a.x+a.width > b.x && a.y < b.y+b.height && a.y+a.height > b.y;
const effectState = page => page.locator('[data-hexy-finish]').evaluate(el => ({
  grain: getComputedStyle(el.querySelector('[data-finish-grain]')).opacity,
  vignette: getComputedStyle(el.querySelector('[data-finish-vignette]')).opacity,
  shift: Number(document.querySelector('feOffset[result="redRegistered"]').getAttribute('dx')),
}));

test('one configurator independently adjusts and disables effects, retaining preferences across all three experiences', async ({ page }) => {
  await openLanding(page); await goWorld(page,.49);
  await page.locator('[data-compact-player]').getByRole('button',{name:/Reproducir/}).click();
  await expect.poll(()=>page.locator('audio').evaluate(el=>el.paused)).toBe(false);
  const before = await page.evaluate(()=>scrollY);
  await page.locator('[data-journey-menu-trigger]').click();
  const menu=page.locator('[data-illustrated-menu]');
  await expect(menu.locator('[data-finish-grain]')).toHaveCount(1);
  const initial=await effectState(page);
  const chromatic=menu.getByRole('slider',{name:'Aberración cromática'});
  const vignette=menu.getByRole('slider',{name:'Viñeta'});
  const grain=menu.getByRole('slider',{name:'Grano de película'});
  await chromatic.focus();await chromatic.press('End');
  await expect(chromatic).toHaveValue('100');
  const colored=await effectState(page);
  expect(colored.shift).toBeGreaterThan(initial.shift);
  expect(colored.grain).toBe(initial.grain);expect(colored.vignette).toBe(initial.vignette);
  await vignette.focus();await vignette.press('Home');
  await expect(page.locator('[data-finish-vignette]')).toHaveCSS('opacity','0');
  expect((await effectState(page)).grain).toBe(initial.grain);
  await grain.focus();await grain.press('Home');
  await expect(page.locator('[data-finish-grain]')).toHaveCSS('opacity','0');
  await expect(page.locator('[data-finish-grain]')).toHaveAttribute('data-grain-state','paused');
  const toggle=menu.getByRole('button',{name:/Acabado ilustrado/});
  await toggle.click();
  for (const slider of [chromatic,vignette,grain]) await expect(slider).toBeDisabled();
  await expect(page.locator('[data-hexy-finish]')).toHaveAttribute('data-enabled','false');
  await toggle.click();await expect(chromatic).toHaveValue('100');await expect(grain).toHaveValue('0');
  await chromatic.focus();await chromatic.press('Home');
  await expect(page.locator('[data-finish-lens]')).toBeHidden();
  await chromatic.press('ArrowRight');await chromatic.press('ArrowRight');
  await expect(chromatic).toHaveValue('10');
  await page.keyboard.press('Escape');
  expect(await page.evaluate(()=>scrollY)).toBe(before);
  expect(await page.locator('audio').evaluate(el=>el.paused)).toBe(false);
  for(const route of ['/hexy','/bebidas']) {
    await page.goto(route);
    await page.locator('button[aria-haspopup="dialog"]').first().click();
    await expect(page.locator('[data-finish-controls]')).toHaveCount(1);
    await expect(page.locator('[data-illustrated-menu] [data-finish-grain]')).toHaveCount(1);
    const sliders=page.locator('[data-finish-controls] input');
    await expect(sliders.nth(0)).toHaveValue('10');await expect(sliders.nth(1)).toHaveValue('0');await expect(sliders.nth(2)).toHaveValue('0');
    await page.locator('[data-illustrated-menu]').getByRole('button',{name:'EN',exact:true}).click();
    await expect(page.getByRole('slider',{name:'Chromatic aberration'})).toHaveValue('10');
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-hexy-finish]')).toHaveCount(1);
  }
});

test('chromatic intensity changes actual central pixels and zero removes the color split', async ({ page }) => {
  await openLanding(page);
  await page.locator('[data-journey-menu-trigger]').click();
  await page.addStyleTag({content:'[data-finish-grain],[data-finish-vignette] {visibility:hidden!important}'});
  await page.locator('[data-illustrated-menu]').evaluate(el=>{
    const probe=document.createElement('div');probe.dataset.opticalProbe='';
    probe.style.cssText='position:absolute;left:50%;top:50%;width:80px;height:80px;translate:-50% -50%;background:linear-gradient(90deg,#000 50%,#fff 50%);z-index:9999;pointer-events:none';el.append(probe);
  });
  const slider=page.getByRole('slider',{name:'Aberración cromática'});
  const dispersion=async()=>{
    const b=await page.locator('[data-optical-probe]').boundingBox();
    const {data,info}=await sharp(await page.screenshot()).removeAlpha().raw().toBuffer({resolveWithObject:true});
    const x=Math.round(b.x+b.width/2),y=Math.round(b.y+b.height/2);
    return Array.from({length:16},(_,i)=>{const p=(y*info.width+x-8+i)*info.channels;const rgb=[...data.subarray(p,p+3)];return Math.max(...rgb)-Math.min(...rgb);}).reduce((a,b)=>a+b,0);
  };
  await slider.focus();await slider.press('Home');const neutral=await dispersion();
  await slider.press('End');const split=await dispersion();
  expect(neutral).toBeLessThan(5);expect(split).toBeGreaterThan(neutral+80);
});

for(const [width,height] of [[360,640],[390,844],[820,1180]]) {
  test(`mobile compositions preserve Hexy's face and the music dock stays above every scene at ${width}px`,async({page})=>{
    await page.setViewportSize({width,height});await openLanding(page);
    await goWorld(page,.49);
    const dock=page.locator('[data-compact-player]');
    const fixed=await dock.boundingBox();
    const menu=await page.locator('[data-journey-menu-trigger]').boundingBox();
    expect(overlap(fixed,menu)).toBe(false);expect(fixed.y).toBeLessThan(25);
    for(const progress of [.38,.49,.60,.68,.78,1.8,INTERVIEW_ENTRY,interviewStop(1),interviewStop(2),.3132,.162]) {
      // Playing state ensures that the same dock exists before and after Hexy.
      if(progress === .38) await dock.getByRole('button',{name:/Reproducir/}).click();
      await goWorld(page,progress);
      if(width>700 && progress===.3132) continue; // Desktop uses the full music page here.
      await expect(dock).toBeVisible();
      expect((await dock.boundingBox()).y).toBeCloseTo(fixed.y,1);
      if(progress===.49) {
        const hexy=await page.locator('[data-dj]').boundingBox();
        const card=await page.locator('[data-world-copy="festival"] [data-story-panel]').boundingBox();
        expect(hexy.y+hexy.height*.5).toBeLessThan(card.y-10);
      }
      if(progress>=INTERVIEW_ENTRY && progress<3.4) {
        const hexy=await page.locator('[data-interview-layer="hexy"]').boundingBox();
        const card=await page.locator('[data-world-copy="interview"]').boundingBox();
        expect(hexy.y+hexy.height*.42).toBeLessThan(card.y);
        expect(card.x).toBeGreaterThanOrEqual(10);expect(card.x+card.width).toBeLessThan(width-10);
      }
      expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBe(0);
    }
    if(width<=700) {
      await dock.getByRole('button',{name:'Lista de canciones',exact:true}).click();
      const list=dock.locator('[data-song-list]');await expect(list).toBeVisible();
      const b=await list.boundingBox();expect(b.x).toBeGreaterThanOrEqual(10);expect(b.x+b.width).toBeLessThanOrEqual(width-10);expect(b.y+b.height).toBeLessThan(height-40);
      await list.getByRole('button',{name:'Cerrar y detener la música'}).click();
      await expect(dock).toHaveCount(0);expect(await page.locator('audio').evaluate(el=>el.paused)).toBe(true);
    }
  });
}
