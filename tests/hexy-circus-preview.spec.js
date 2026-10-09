import {test,expect} from '@playwright/test';
import {SAVE_KEY,sanitizeSave} from '../src/components/arcade/shared/arcadeStore';
import {LOCAL_RESET_KEY} from '../src/components/arcade/shared/arcadeLocalReset';
import {openAdventureMenu} from './arcade-input.helpers';

for(const [width,practice] of [[1280,false],[390,false],[1280,true]]){
 test(`normal 1-4 entry uses the definitive dark floor: ${practice?'practice':'adventure'}, ${width}px`,async({page})=>{
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.setViewportSize({width,height:800});
  const saved=sanitizeSave({version:1,economy:2,coins:7,stars:43,adventureUnlocked:practice?0:3});
  // Recover an interrupted session only when the player starts from the menu.
  saved.run={id:'interrupted-run',practice:false,collectibles:true,chapter:0,earned:0,banked:0};
  await page.addInitScript(({key,resetKey,saved})=>{
   // This existing save has already completed the owner's earlier local reset.
   localStorage.setItem(resetKey,'done');localStorage.setItem(key,JSON.stringify(saved));
  },{key:SAVE_KEY,resetKey:LOCAL_RESET_KEY,saved});
  await page.goto('/arcade');await openAdventureMenu(page);
  await page.getByRole('button',{name:/Elegir cap/}).click();
  await page.locator('[data-level-choice="3"]').click();
  if(practice)await expect(page.locator('[data-start-adventure]')).toBeDisabled();
  else await expect(page.locator('[data-start-adventure]')).toBeEnabled();
  expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),SAVE_KEY)).toEqual(saved);
  await page.locator(practice?'[data-practice]':'[data-start-adventure]').click();
  const game=page.locator('[data-hexy-adventure]'),canvas=page.locator('[data-adventure-canvas]');
  await expect(game).toHaveAttribute('data-phase','playing',{timeout:30000});
  await expect(canvas).toHaveAttribute('data-level','3');
  await expect(canvas).toHaveAttribute('data-circus-floor','dark');
  await expect(page.locator('[data-title-screen]')).toHaveCount(0);
  await expect(page.locator('[data-presentation]')).toHaveCount(0);
  expect(Number(await canvas.getAttribute('data-player-x'))).toBeLessThan(0);
  const running=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),SAVE_KEY);
  expect(running.run).toMatchObject({practice,chapter:3});
  expect({...running,run:null}).toEqual({...saved,run:null});

  await page.keyboard.down('ArrowRight');
  await expect.poll(async()=>Number(await canvas.getAttribute('data-player-x')),{timeout:12000}).toBeGreaterThan(650);
  await page.keyboard.up('ArrowRight');
  await expect(canvas).toHaveAttribute('data-boss-phase','sleep');
  await canvas.screenshot({path:`tests/artifacts/arcade/inferno/normal-dark-${width}-${practice?'practice':'adventure'}.jpg`});
  await page.keyboard.press('Escape');
  await expect(game).toHaveAttribute('data-phase','paused');
  await page.getByRole('button',{name:practice?'Terminar práctica':'Guardar monedas y volver al título'}).click();
  await expect(game).toHaveAttribute('data-phase','ready');
  await expect(page.locator('[data-title-menu]')).toBeVisible();
  if(practice)await expect(page.locator('[data-start-adventure]')).toBeDisabled();
  else await expect(page.locator('[data-start-adventure]')).toBeEnabled();
  await expect(page.locator('[data-practice]')).toBeEnabled();
  await expect(page.locator('[data-chapter-intro]')).toHaveCount(0);
  const settled=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),SAVE_KEY);
  if(practice)expect(settled).toEqual({...saved,run:null});
  else{
   // Walking into the real chapter legitimately collects its opening stars.
   expect(settled).toMatchObject({run:null,coins:saved.coins,adventureUnlocked:saved.adventureUnlocked,
    adventureCleared:saved.adventureCleared,modsOwned:saved.modsOwned,modsEquipped:saved.modsEquipped,wins:saved.wins});
   expect(settled.stars).toBeGreaterThanOrEqual(saved.stars);
   expect(settled.best).toBeGreaterThanOrEqual(saved.best);
   expect(settled.collectedStars).toEqual(expect.arrayContaining(saved.collectedStars));
  }
  expect(errors).toEqual([]);
 });
}

test('retired comparison links open the normal title without starting or altering a saved run',async({page})=>{
 const saved=sanitizeSave({version:1,economy:2,coins:7,stars:43,adventureUnlocked:0,
  run:{id:'interrupted-run',practice:false,collectibles:true,chapter:0,earned:0,banked:0}});
 await page.addInitScript(({key,resetKey,saved})=>{
  localStorage.setItem(resetKey,'done');localStorage.setItem(key,JSON.stringify(saved));
 },{key:SAVE_KEY,resetKey:LOCAL_RESET_KEY,saved});
 for(const floor of ['dark','wood']){
  await page.goto(`/arcade?circus-floor=${floor}`);await openAdventureMenu(page);
  await expect(page.locator('[data-hexy-adventure]')).toHaveAttribute('data-phase','ready');
  await expect(page.getByRole('button',{name:/Elegir cap/})).toContainText('1-1');
  await expect(page.locator('[data-start-adventure]')).toBeEnabled();
  expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),SAVE_KEY)).toEqual(saved);
 }
});
