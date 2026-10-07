import {test,expect} from '@playwright/test';
import {createAdventure,stepAdventure,retryAdventure,adventureCarry,playerBody} from '../src/components/arcade/adventure/engine/adventureModel';
import {COLLECTIBLES} from '../src/components/arcade/adventure/engine/adventureCollectibles';
import {collectAdventureStar} from '../src/components/arcade/adventure/engine/adventureRewards';
import {damageOutpost} from '../src/components/arcade/adventure/actors/enemies/adventureOutposts';
import {takeLoot} from '../src/components/arcade/adventure/engine/adventureLoot';
import {updateGuard,guardBlocks} from '../src/components/arcade/adventure/engine/adventureDefense';
import {BASIC_SPECIAL,STRONG_COST} from '../src/components/arcade/adventure/engine/adventureMagic';
import {hexyPose,hexyMuzzle} from '../src/components/arcade/adventure/actors/hexy/hexyAnimation';
import {updateBoss} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {organPipes,stepOrganRain} from '../src/components/arcade/adventure/actors/bosses/adventureOrganFortress';
import {stepWorldEffects} from '../src/components/arcade/adventure/engine/adventureEffects';
import {sanitizeSave} from '../src/components/arcade/shared/arcadeStore';
import {openAdventureMenu} from './arcade-input.helpers';

const quiet=(index=0,carry={})=>{const s=createAdventure(index,false,carry);for(const k of ['enemies','outposts','supplies','pickups','hazards','cages'])s[k]=[];return s;};
const tick=(s,keys={},n=1)=>{for(let i=0;i<n;i++)stepAdventure(s,keys,1/120);};
test('five permanent ten-star treasures per chapter; tents reveal them only once',()=>{
 const ids=COLLECTIBLES.flat().map(q=>q.id);expect(new Set(ids).size).toBe(ids.length);
 for(let index=0;index<5;index++){
  const s=createAdventure(index),treasures=s.stars.filter(q=>q.value===10);expect(treasures).toHaveLength(5);
  for(const q of treasures){if(q.hidden){expect(collectAdventureStar(s,q)).toBe(false);damageOutpost(s,s.outposts[q.outpost],99);expect(q.hidden).toBe(false);}expect(collectAdventureStar(s,q)).toBe(true);expect(collectAdventureStar(s,q)).toBe(false);}
  expect(s.starMoney).toBe(50);retryAdventure(s);expect(s.stars.filter(q=>q.value===10&&q.taken)).toHaveLength(5);
  const again=createAdventure(index,false,{collectedStars:treasures.map(q=>q.id)});expect(again.stars.filter(q=>q.value===10&&!q.taken)).toHaveLength(0);expect(again.stars.some(q=>q.value===1&&!q.taken)).toBe(true);
 }
});
test('held diagonal down stays standing and stationary; ordinary Down still crouches',()=>{
 for(const dir of [-1,1]){
  const s=quiet(),x=s.player.x;tick(s,{hold:true,down:true,[dir<0?'left':'right']:true,attack:true},20);
  expect(s.player.x).toBe(x);expect(s.player.crouch).toBe(false);expect(s.player.ground).not.toBeNull();expect(s.player.aimY).toBeCloseTo(Math.SQRT1_2);expect(hexyPose(s).sheet).toBe('ground-aim');
  const tip=hexyMuzzle(s);expect((tip.x-x)*dir).toBeGreaterThan(30);expect(tip.y-s.player.y).toBeGreaterThan(-45);expect(s.shots[0].vy).toBeGreaterThan(0);expect(s.shots[0].vx*dir).toBeGreaterThan(0);
  tick(s,{down:true});expect(s.player.crouch).toBe(true);
 }
});
test('Original duration follows equipped tier, is carried, and never spends drink shots',()=>{
 for(const [tier,duration]of [8,10,12,14,15].entries()){
  const s=quiet(0,{mods:tier?['lasting-magic']:[],modLevels:{'lasting-magic':tier},weapon:1,ammo:20});takeLoot(s,{type:'original'});expect(s.overdrive).toBe(duration);expect(s.overdriveDuration).toBe(duration);
  s.player.drinkCast=0;tick(s,{attack:true},120);expect(s.ammo).toBe(20);expect(s.overdrive).toBeCloseTo(duration-1);const next=createAdventure(1,false,adventureCarry(s));expect(next.overdriveDuration).toBe(duration);expect(next.overdrive).toBeCloseTo(duration-1);
 }
});
test('guard baseline costs 10 percent more, four tiers reduce drain and hit cost; strong spells cost 15 percent more',()=>{
 for(let tier=0;tier<=4;tier++){
  const s=quiet(0,{mods:tier?['gentle-guard']:[],modLevels:{'gentle-guard':tier}}),factor=1-tier*.05;
  updateGuard(s,{guard:true},1);expect(s.magic).toBeCloseTo(100-26.4*factor);
  const shot={x:s.player.x+45,y:s.player.y-43,r:10,life:1};expect(guardBlocks(s,shot)).toBe(true);expect(s.magic).toBeCloseTo(100-(26.4+4.4)*factor);
 }
 expect(STRONG_COST).toBeCloseTo(30*1.15);expect(BASIC_SPECIAL.cost).toBeCloseTo(15*1.15);
});
test('organ sends notes above the screen before they become a vertical rain',()=>{
 const s=quiet(1),b=s.boss,a=s.level.arena;s.damage=()=>{};s.camera.y=a.y-410;s.player.x=a.left+300;
 Object.assign(b,{phase:'attack',move:'organ-chords',timer:5,attackClock:0,shotClock:0,volley:0,rainGap:a.left+300});updateBoss(s,1/120,{body:playerBody});
 const shot=s.hostile[0];expect(shot.rain).toBe('rise');expect(organPipes(s).some(p=>p.x===shot.x&&p.y===shot.y)).toBe(true);expect(shot.vy).toBeLessThan(0);
 let minY=shot.y,wait=false,fall=false;for(let i=0;i<900&&shot.y<a.y;i++){stepOrganRain(shot,s,1/120);minY=Math.min(minY,shot.y);wait||=shot.rain==='wait';fall||=shot.rain==='fall';if(fall)expect(shot.vx).toBe(0);}
 expect(minY).toBeLessThan(s.camera.y-60);expect(wait&&fall).toBe(true);expect(shot.y).toBeGreaterThanOrEqual(a.y);expect(shot.x).toBe(shot.targetX);
 // Recovery between volleys must not replay a firing pose or sound without notes.
 b.volley=3;b.shotClock=0;s.events=[];const count=s.hostile.length;updateBoss(s,1/120,{body:playerBody});expect(s.hostile).toHaveLength(count);expect(b.release).toBe(0);expect(s.events).not.toContain('cannon');
});
test('phase two opens once, throws temporary debris and leaves a wider first-phase dodge margin',()=>{
 const s=quiet(1),b=s.boss,a=s.level.arena;s.damage=()=>{};s.player.x=a.left+300;Object.assign(b,{phase:'recover',timer:1,hp:b.maxHp/2});updateBoss(s,.01,{body:playerBody});expect(b.phase).toBe('transform');expect(s.organDebris||[]).toHaveLength(0);expect(b.vulnerable).toBe(false);
 for(let i=0;i<140;i++)updateBoss(s,1/120,{body:playerBody});expect(s.organDebris).toHaveLength(6);expect(b.armorBroken).toBe(true);
 const initial=s.organDebris[0].y;stepWorldEffects(s,.1);expect(s.organDebris[0].y).not.toBe(initial);for(let i=0;i<40;i++)stepWorldEffects(s,.1);expect(s.organDebris).toHaveLength(0);
 const attacks=transformed=>{s.hostile=[];Object.assign(b,{hp:transformed?50:b.maxHp,transformed,phase:'attack',move:'organ-finale',timer:5.8,attackClock:0,shotClock:0,volley:0,rainGap:a.left+300});for(let i=0;i<500;i++)updateBoss(s,1/120,{body:playerBody});return s.hostile;};
 const first=attacks(false),second=attacks(true);expect(second.filter(q=>q.rain).length).toBeGreaterThan(first.length);expect(second.some(q=>q.kind==='note'&&q.voice==='red')).toBe(true);expect(second.some(q=>q.kind==='ball')).toBe(false);
 for(const q of second.filter(q=>q.rain))expect(Math.abs(q.targetX-(a.left+300))).toBeGreaterThan(50);
});
test('fresh saves have one slot; legacy purchases, levels and three equipped charms survive migration',()=>{
 expect(sanitizeSave(null).modSlots).toBe(1);
 const legacy=sanitizeSave({version:1,economy:2,stars:420,modsOwned:['quick-cast','bright-spark','grand-flourish'],modsEquipped:['quick-cast','bright-spark','grand-flourish'],modLevels:{'bright-spark':3}});
 expect(legacy.modSlots).toBe(3);expect(legacy.modsEquipped).toHaveLength(3);expect(legacy.modLevels['bright-spark']).toBe(3);expect(legacy.stars).toBe(420);
});

test('coin transactions survive replay and reload, ignore duplicates across tabs and never pay settlement twice',async({page,context})=>{
 await page.goto('/arcade');const second=await context.newPage();await second.goto('/arcade');
 const run=await page.evaluate(async()=>{const m=await import('/src/components/arcade/shared/arcadeStore.js');await m.recoverRun();return m.beginRun(false,0,true);});
 const ids=COLLECTIBLES[0].filter(q=>q.value===1).slice(0,2).map(q=>q.id).concat(COLLECTIBLES[0].find(q=>q.value===10).id);
 const paid=await Promise.all([page,second].map(p=>p.evaluate(async({run,ids})=>{const m=await import('/src/components/arcade/shared/arcadeStore.js');return m.claimAdventureStars(run.id,0,ids.concat(ids, '0:fake', '1:treasure:jump-0'));},{run,ids})));
 expect(paid.reduce((a,b)=>a+b)).toBe(12);await page.reload();
 const saved=await page.evaluate(async({run,ids})=>{const m=await import('/src/components/arcade/shared/arcadeStore.js');await m.bankAdventureStars(run.id,0,999);await m.finishRun(run.id,{stars:999,won:false,level:0});const next=await m.beginRun(false,0,true);const again=await m.claimAdventureStars(next.id,0,ids);await m.finishRun(next.id,{stars:999,won:false,level:0});const practice=await m.beginRun(true,0,true);await m.claimAdventureStars(practice.id,0,['0:treasure:jump-1']);await m.finishRun(practice.id,{stars:10,won:true,level:0});return{again,save:JSON.parse(localStorage.getItem(m.SAVE_KEY))};},{run,ids});
 expect(saved.again).toBe(0);expect(saved.save.stars).toBe(12);expect(saved.save.collectedStars.sort()).toEqual(ids.sort());expect(saved.save.adventureUnlocked).toBe(0);await second.close();
});
test('shop enforces chapter stock, costly upgrades and five purchased slots with duplicate request protection',async({page})=>{
 await page.goto('/arcade');const result=await page.evaluate(async()=>{
  const m=await import('/src/components/arcade/shared/arcadeStore.js');localStorage.setItem(m.SAVE_KEY,JSON.stringify(m.sanitizeSave({version:1,economy:2,stars:5000})));
  const read=()=>JSON.parse(localStorage.getItem(m.SAVE_KEY));const blocked=await m.buyAdventureMod('full-bubble');await m.buyAdventureMod('lasting-magic');await m.buyAdventureMod('quick-cast');await m.toggleAdventureMod('lasting-magic');const full=await m.toggleAdventureMod('quick-cast'),early=await m.upgradeAdventureMod('lasting-magic',1);
  const slots=await Promise.all([m.buyAdventureSlot(1),m.buyAdventureSlot(1)]);await m.toggleAdventureMod('quick-cast');const chapter=await m.beginRun(false,0,true);await m.advanceAdventure(chapter.id,{level:0,stars:0});const before=read().stars,upgrade=await Promise.all([m.upgradeAdventureMod('lasting-magic',1),m.upgradeAdventureMod('lasting-magic',1)]),cost=before-read().stars;
  for(let i=2;i<5;i++)await m.buyAdventureSlot(i);const max=await m.buyAdventureSlot(5);return{blocked,full,early,slots,upgrade,cost,max,save:read()};
 });expect(result.blocked||result.full||result.early||result.max).toBe(false);expect(result.slots.sort()).toEqual([false,true]);expect(result.upgrade.sort()).toEqual([false,true]);expect(result.cost).toBe(125);expect(result.save.modSlots).toBe(5);expect(result.save.modsEquipped).toHaveLength(2);
});
test('graphics menu previews every filter, allows zero, saves monochrome and restores it after reload',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/arcade');await openAdventureMenu(page);await page.locator('[data-open-settings]').click();await page.getByRole('button',{name:'Imagen ✦',exact:true}).click();
 for(const key of ['grain','chromatic','vignette']){const input=page.locator(`[data-visual-setting="${key}"]`);await input.fill('0');await expect(input).toHaveValue('0');}
 await page.locator('[data-monochrome-toggle]').click();await expect(page.locator('[data-finish-monochrome]')).toBeVisible();await page.screenshot({path:'tests/artifacts/arcade/progression-polish/settings-monochrome.jpg'});
 await page.reload();await openAdventureMenu(page);await expect(page.locator('[data-finish-monochrome]')).toBeVisible();await page.locator('[data-open-settings]').click();await page.getByRole('button',{name:'Imagen ✦',exact:true}).click();for(const key of ['grain','chromatic','vignette'])await expect(page.locator(`[data-visual-setting="${key}"]`)).toHaveValue('0');await page.getByRole('button',{name:'Restablecer imagen',exact:true}).click();await expect(page.locator('[data-finish-monochrome]')).toBeHidden();await page.screenshot({path:'tests/artifacts/arcade/progression-polish/settings-color.jpg'});expect(errors).toEqual([]);
});
test('actual game queues collected coins immediately and keeps them absent when restarted',async({page})=>{
 await page.route('**/src/components/arcade/adventure/engine/adventureModel.js*',async route=>{const response=await route.fetch(),source=await response.text();await route.fulfill({response,body:source.replace('function stepAdventure(s,input,dt){',`function stepAdventure(s,input,dt){if(s.ticks===0){const q=s.stars.find(q=>q.value===1);q.x=s.player.x;q.y=s.player.y-35;}`)});});
 await page.goto('/arcade');await openAdventureMenu(page);await page.locator('[data-title-menu] button').first().click();await expect(page.locator('[data-hexy-adventure]')).toHaveAttribute('data-phase','playing');
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('magic-drink-arcade-v1')).stars)).toBe(1);await page.reload();await openAdventureMenu(page);await page.locator('[data-title-menu] button').first().click();await expect(page.locator('[data-hexy-adventure]')).toHaveAttribute('data-phase','playing');await page.waitForTimeout(300);expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('magic-drink-arcade-v1')).stars)).toBe(1);
});
test('Original changes music tempo temporarily, including restoration on pause and expiry',async({page})=>{
 await page.route('**/src/components/arcade/adventure/engine/adventureModel.js*',async route=>{const response=await route.fetch(),source=await response.text();await route.fulfill({response,body:source.replace('function stepAdventure(s,input,dt){',`function stepAdventure(s,input,dt){if(s.ticks===0){s.overdrive=3;s.overdriveDuration=3;}`)});});
 await page.goto('/arcade');await openAdventureMenu(page);await page.locator('[data-practice]').click();const tempo=()=>page.locator('audio[data-music-track]').evaluate(e=>e.playbackRate);await expect.poll(tempo).toBe(1.2);await page.keyboard.press('Escape');await expect.poll(tempo).toBe(1);await page.getByRole('button',{name:/Continuar/}).click();await expect.poll(tempo).toBe(1.2);await expect.poll(tempo,{timeout:7000}).toBe(1);
});
test('buying slots in Miso’s collection equips five charms and carries all five into the HUD',async({page})=>{
 await page.addInitScript(()=>{if(!localStorage.getItem('magic-drink-arcade-v1'))localStorage.setItem('magic-drink-arcade-v1',JSON.stringify({version:1,economy:2,stars:1000,modSlots:1,adventureUnlocked:4,modsOwned:['quick-cast','bright-spark','grand-flourish','lasting-magic','gentle-guard'],modsEquipped:[]}));});
 await page.goto('/arcade');await openAdventureMenu(page);await page.locator('[data-insert-coin]').click();const root=page.locator('[data-hexy-adventure]'),canvas=page.locator('[data-adventure-canvas]');await expect(root).toHaveAttribute('data-phase','playing');await canvas.focus();await page.keyboard.down('ArrowRight');await page.waitForFunction(()=>+document.querySelector('[data-adventure-canvas]').dataset.playerX>320);await page.keyboard.up('ArrowRight');await page.keyboard.press('KeyE');await expect(root).toHaveAttribute('data-phase','shop');
 await page.locator('[data-shop-collection]').click();await page.screenshot({path:'tests/artifacts/arcade/progression-polish/slots-one.jpg'});
 const before=Number(await page.locator('[data-shop-money]').textContent());for(let count=1;count<5;count++){await page.locator('[data-buy-slot]').click();await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('magic-drink-arcade-v1')).modSlots)).toBe(count+1);}
 await expect(page.locator('[data-buy-slot]')).toHaveCount(0);await expect(page.locator('[data-shop-money]')).toHaveText(String(before-430));
 for(const id of ['quick-cast','bright-spark','grand-flourish','lasting-magic','gentle-guard']){if(!await page.locator(`[data-collection-mod="${id}"]`).count())await page.getByRole('button',{name:'Más amuletos',exact:true}).click();await page.locator(`[data-collection-mod="${id}"]`).click();await page.locator(`[data-equip-mod="${id}"]`).click();await page.getByRole('button',{name:'Cerrar artículo',exact:true}).click();}
 await expect(page.locator('[data-equipped-slot]:not([data-equipped-slot=""])')).toHaveCount(5);await page.screenshot({path:'tests/artifacts/arcade/progression-polish/slots-five.jpg'});await page.getByRole('button',{name:'Salir de la tienda',exact:true}).click();await expect(root).toHaveAttribute('data-phase','playing');await expect(page.locator('[data-hud-mod]')).toHaveCount(5);await page.keyboard.press('KeyF');await page.screenshot({path:'tests/artifacts/arcade/progression-polish/hud-five.jpg'});
});
