import {expect} from '@playwright/test';
// Enter through the real title controls, keeping gameplay tests independent of
// the skippable branding and entrance sequence.
export async function openAdventureMenu(page){
 const title=page.locator('[data-title-screen]');await expect(title).toBeVisible({timeout:30000});
 // The presentation can finish between visibility and click actionability.
 // Its real keyboard shortcut also safely advances the title if that happens.
 const brand=page.locator('[data-presentation]');if(await brand.isVisible())await page.keyboard.press('Space');
 await expect(title).toHaveAttribute('data-entrance',/entering|settled/);
 if(await title.getAttribute('data-entrance')!=='settled')await page.locator('[data-title-start]').click();
 await expect(title).toHaveAttribute('data-entrance','settled');
 if(!await page.locator('[data-title-menu]').isVisible())await page.locator('[data-title-start]').click();
 await expect(page.locator('[data-title-menu]')).toBeVisible();
}
// A deterministic nearby crate isolates drink controls from level travel and
// random loot. Only the intercepted test module receives this fixture.
export async function fixtureStartingDrink(page){
 await page.route('**/src/components/arcade/adventure/engine/adventureModel.js*',async route=>{
  const response=await route.fetch(),source=await response.text();
  await route.fulfill({response,body:source.replace('function stepAdventure(s,input,dt){',`function stepAdventure(s,input,dt){
   if(s.ticks===0)s.supplies=[{x:210,y:s.player.y,kind:s.index,id:0,hp:4,maxHp:4,flash:0,age:0,loot:{type:'drink',kind:s.index}}];
  `)});
 });
}
// Break the first supply crate, stop beside it and collect the ejected can.
export async function collectStartingDrink(page,kind){
 const canvas=page.locator('[data-adventure-canvas]');
 await page.keyboard.down('KeyZ');await page.keyboard.down('ArrowRight');
 await expect.poll(async()=>Number(await canvas.getAttribute('data-player-x'))).toBeGreaterThan(185);
 await page.keyboard.up('ArrowRight');await page.keyboard.up('KeyZ');
 await expect(canvas).toHaveAttribute('data-weapon',String(kind),{timeout:5000});
}
