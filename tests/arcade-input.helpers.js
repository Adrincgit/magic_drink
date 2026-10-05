import {expect} from '@playwright/test';
// A deterministic nearby crate isolates drink controls from level travel and
// random loot. Only the intercepted test module receives this fixture.
export async function fixtureStartingDrink(page){
 await page.route('**/src/components/arcade/adventureModel.js*',async route=>{
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
