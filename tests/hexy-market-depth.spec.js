import {test,expect} from '@playwright/test';
import {createAdventure,stepAdventure,adventureCarry} from '../src/components/arcade/adventureModel';
import {grantStartingDrink,refillDrink,collectDrink,DRINK_SHOTS} from '../src/components/arcade/adventureAmmo';
import {updateMods} from '../src/components/arcade/adventureMods';
import {tickRewards} from '../src/components/arcade/adventureRewards';
import {hexyPose,hexyMuzzle} from '../src/components/arcade/hexyAnimation';
import {buddyRollFrame} from '../src/components/arcade/adventureDefense';
import {canEnterShop,shopForLevel} from '../src/components/arcade/adventureShop';
import {sanitizeSave} from '../src/components/arcade/arcadeStore';
const tick=(s,n=1,input={})=>{for(let i=0;i<n;i++)stepAdventure(s,input,1/120);};
const clean=(mods=[])=>{const s=createAdventure(0,false,{mods});for(const key of ['enemies','cages','pickups','supplies','outposts','stars','hazards'])s[key]=[];return s;};

test('old saves keep their wallet and accessories; only owned, unique Mods fit the three slots',()=>{
 const old=sanitizeSave({version:1,stars:270,coins:2,owned:['crown'],equipped:'crown'});
 expect(old.stars).toBe(270);expect(old.equipped).toBe('crown');expect(old.modsOwned).toEqual([]);expect(old.modsEquipped).toEqual([]);
 const next=sanitizeSave({...old,modsOwned:['starter-0','starter-1','quick-cast','bright-spark','grand-flourish','fake'],modsEquipped:['fake','encore-pocket','starter-0','starter-1','quick-cast','quick-cast','bright-spark','grand-flourish']});
 expect(next.modsEquipped).toEqual(['starter-0','quick-cast','bright-spark']);expect(next.modsOwned).not.toContain('fake');
});
test('equipped fire-rate and size Mods affect the actual shots, including basic strong magic',()=>{
 const base=clean(),mod=clean(['quick-cast','bright-spark','grand-flourish']);tick(base,1,{attack:true});tick(mod,1,{attack:true});
 expect(base.shotWait/mod.shotWait).toBeCloseTo(1.2);expect(mod.shots[0].r/base.shots[0].r).toBeCloseTo(1.3);expect(mod.shots[0].scale).toBeCloseTo(1.3);expect(mod.shots[0].damage).toBe(base.shots[0].damage);
 tick(base);tick(mod);tick(base,1,{special:true});tick(mod,1,{special:true});expect(mod.shots.find(q=>q.heavy).scale).toBeCloseTo(1.3);
 collectDrink(mod,1,true);mod.shotWait=0;mod.player.specialCast=0;tick(mod,1,{attack:true});expect(mod.shots.at(-1).scale).toBeCloseTo(1.69);
});
test('starting flavor has double capacity across chapters and cannot be refilled by changing equipment',()=>{
 const s=clean(['starter-1']);expect(s.ammo).toBe(84);expect(s.ammoCapacity).toBe(84);s.ammo=10;refillDrink(s);expect(s.ammo).toBe(57);
 const next=createAdventure(1,false,adventureCarry(s));expect(next.ammo).toBe(57);expect(next.ammoCapacity).toBe(84);
 updateMods(next,[]);updateMods(next,['starter-3']);grantStartingDrink(next);expect(next.weapon).toBe(1);expect(next.ammo).toBe(57);
 collectDrink(next,1);expect(next.ammo).toBe(84);expect(next.drinkTier).toBe(2);collectDrink(next,3);expect(next.ammo).toBe(DRINK_SHOTS[3]);
});
test('second super reserve still requires mana and recovery, then recharges independently',()=>{
 const s=clean(['encore-pocket']);tick(s,1,{super:true});expect(s.superReserve).toBe(1);expect(s.superCooldown).toBe(40);expect(s.magic).toBe(10);
 tick(s,380);expect(s.exhaustion).toBeGreaterThan(7);s.magic=100;tick(s,1,{super:true});expect(s.superCinematic).toBeNull();
 tick(s,980);s.magic=89;tick(s,1,{super:true});expect(s.superCinematic).toBeNull();tick(s);s.magic=100;tick(s,1,{super:true});
 expect(s.superCinematic).not.toBeNull();expect(s.superReserve).toBe(0);expect(s.reserveCooldown).toBe(40);expect(s.magic).toBe(10);
 tick(s,380);const carried=createAdventure(1,false,adventureCarry(s));expect(carried.superReserve).toBe(0);expect(carried.reserveCooldown).toBeCloseTo(s.reserveCooldown);
 tickRewards(carried,40);expect(carried.superReserve).toBe(1);expect(carried.superCooldown).toBe(0);
});
test('unequipping the reserve cannot manufacture a super charge',()=>{
 const s=clean();updateMods(s,['encore-pocket']);expect(s.superReserve).toBe(0);expect(s.reserveCooldown).toBe(40);
 tickRewards(s,10);updateMods(s,['encore-pocket']);expect(s.reserveCooldown).toBe(30);
 updateMods(s,[]);updateMods(s,['encore-pocket']);expect(s.superReserve).toBe(0);expect(s.reserveCooldown).toBe(40);
});
test('air super uses its own windup and release while its beam stays attached in both directions',()=>{
 for(const dir of [-1,1]){const s=clean();s.player.ground=null;s.player.y=330;s.player.dir=dir;tick(s,1,{super:true});expect(hexyPose(s)).toEqual({sheet:'air-super',frame:0});
  tick(s,60);expect(hexyPose(s).frame).toBe(2);tick(s,70);expect(hexyPose(s).sheet).toBe('air-super');expect(hexyPose(s).frame).toBeGreaterThanOrEqual(4);expect(s.player.y).toBe(330);
  expect(s.superCinematic.origin).toEqual(hexyMuzzle(s));expect((s.superCinematic.origin.x-s.player.x)*dir).toBeGreaterThan(30);
 }
 const ground=clean();tick(ground,1,{super:true});expect(hexyPose(ground).sheet).toBe('super-charge');tick(ground,130);expect(hexyPose(ground).sheet).toBe('super-release');
});
test('all rescued bunnies roll with Hexy on the ground, not during an air dash',()=>{
 const s=clean();s.rescued=3;tick(s,1,{dash:true});expect(buddyRollFrame(s)).toBe(hexyPose(s).frame);
 tick(s,21);expect(buddyRollFrame(s)).toBe(hexyPose(s).frame);expect(buddyRollFrame(s)).toBeGreaterThan(3);tick(s,30);expect(buddyRollFrame(s)).toBeNull();
 s.player.ground=null;s.player.dashWait=0;tick(s,1,{dash:true});expect(s.player.dashAir).toBe(true);expect(buddyRollFrame(s)).toBeNull();
});
test('shop appears once at each existing thematic entry and is inaccessible during combat/cinematics',()=>{
 for(let i=0;i<5;i++){const s=createAdventure(i),shop=shopForLevel(s.level);expect(!!shop).toBe([0,3,4].includes(i));if(!shop)continue;s.player.x=shop.x;s.player.y=shop.y;expect(canEnterShop(s)).toBe(true);s.arenaLocked=true;expect(canEnterShop(s)).toBe(false);s.arenaLocked=false;s.player.ground=null;expect(canEnterShop(s)).toBe(false);}
 const start=createAdventure();expect(start.enemies.every(e=>e.home-shopForLevel(start.level).x>350)).toBe(true);
});

const ready=async page=>{await page.goto('/arcade');await expect(page.locator('[data-hexy-adventure]')).toHaveAttribute('data-phase','ready',{timeout:30000});};
test('shop banking, simultaneous purchases and final settlement never duplicate stars or purchases',async({page,context})=>{
 await ready(page);const second=await context.newPage();await ready(second);
 const setup=await page.evaluate(async()=>{const m=await import('/src/components/arcade/arcadeStore.js');localStorage.setItem(m.SAVE_KEY,JSON.stringify(m.sanitizeSave({version:1,coins:1,stars:100})));const run=await m.beginRun();const deposits=await Promise.all([m.bankAdventureStars(run.id,0,5),m.bankAdventureStars(run.id,0,5)]);return{run,deposits};});
 expect(setup.deposits).toEqual([5,5]);
 const buys=await Promise.all([page,second].map(p=>p.evaluate(async()=>{const m=await import('/src/components/arcade/arcadeStore.js');return m.buyAdventureMod('quick-cast');})));expect(buys.sort()).toEqual([false,true]);
 const settled=await page.evaluate(async({run})=>{const m=await import('/src/components/arcade/arcadeStore.js');await m.bankAdventureStars(run.id,0,7);await m.advanceAdventure(run.id,{level:0,stars:10});await m.finishRun(run.id,{level:1,stars:4,won:false});return JSON.parse(localStorage.getItem(m.SAVE_KEY));},setup);
 expect(settled.stars).toBe(89);expect(settled.modsOwned).toEqual(['quick-cast']);expect(settled.run).toBeNull();
 const practice=await page.evaluate(async()=>{const m=await import('/src/components/arcade/arcadeStore.js'),r=await m.beginRun(true);const bank=await m.bankAdventureStars(r.id,0,150);await m.finishRun(r.id,{stars:150,won:true,level:0});return{bank,wallet:JSON.parse(localStorage.getItem(m.SAVE_KEY)).stars,poor:await m.buyAdventureMod('starter-4')};});expect(practice.bank).toBe(0);expect(practice.wallet).toBe(89);expect(practice.poor).toBe(true);
 expect(await page.evaluate(async()=>{const m=await import('/src/components/arcade/arcadeStore.js');return m.buyAdventureMod('grand-flourish');})).toBe(false);await second.close();
});
test('touch super control can spend the equipped reserve while the first charge recharges',async({page})=>{
 await page.route('**/src/components/arcade/adventureModel.js*',async route=>{const response=await route.fetch(),source=await response.text();await route.fulfill({response,body:source.replace('function stepAdventure(s,input,dt){',`function stepAdventure(s,input,dt){if(s.ticks===0){s.mods=['encore-pocket'];s.superReserve=1;s.superCooldown=30;s.magic=100;s.enemies=[];s.supplies=[];s.outposts=[];}`)});});
 await page.setViewportSize({width:390,height:900});await ready(page);await page.locator('[data-practice]').click();await expect(page.locator('[data-game-hud] [data-super-reserve]')).toHaveAttribute('data-super-reserve','1');
 const button=page.locator('[data-super-control]');await expect(button).toBeEnabled();await button.click();await expect(page.locator('[data-adventure-canvas]')).toHaveAttribute('data-super-active','true');await expect(page.locator('[data-game-hud] [data-super-reserve]')).toHaveAttribute('data-super-reserve','0');await expect(button).toBeDisabled();
});
