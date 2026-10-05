import {test,expect} from '@playwright/test';
import {createAdventure,stepAdventure,adventureCarry,playerBody} from '../src/components/arcade/adventureModel';
import {collectAdventureStar} from '../src/components/arcade/adventureRewards';
import {DRINK_SHOTS,equipDrink,collectDrink} from '../src/components/arcade/adventureAmmo';
import {takeLoot,rollLoot} from '../src/components/arcade/adventureLoot';
import {damageSupply} from '../src/components/arcade/adventureSupplies';
import {makeEnemy,updateEnemies} from '../src/components/arcade/adventureEnemies';
import {trapEnemy} from '../src/components/arcade/adventureBubbles';
import {enemyDrawing} from '../src/components/arcade/adventureSprites';
import {cloudPositions} from '../src/components/arcade/adventureSky';
import {hexyPose} from '../src/components/arcade/hexyAnimation';
const tick=(s,n=1,input={})=>{for(let i=0;i<n;i++)stepAdventure(s,input,1/120);};
const clean=()=>{const s=createAdventure();s.supplies=[];s.outposts=[];s.enemies=[];s.cages=[];s.pickups=[];s.hazards=[];s.stars=[];return s;};

test('each star is one unit of money, separate from combat points and ultimate recharge',()=>{
 const s=clean();s.score=70;s.superCooldown=23;const star={};collectAdventureStar(s,star);collectAdventureStar(s,star);
 expect(s.starMoney).toBe(1);expect(s.score).toBe(70);expect(s.superCooldown).toBe(23);
});
test('every level has fewer boxes and none waiting on its opening screen',()=>{
 for(let i=0;i<5;i++){const s=createAdventure(i);expect(s.supplies.length).toBeLessThan(s.level.pickups.length);expect(s.supplies).toHaveLength(3);expect(s.supplies.every(q=>q.x>1000)).toBe(true);}
 expect(DRINK_SHOTS).toEqual([54,42,60,32,45]);
});
test('loot covers drinks, refills, shields and the rare Original, with rare powered flavors',()=>{
 const s=clean();s.lootSeed=123456;s.weapon=0;let boosted=0;const counts={};
 for(let i=0;i<2000;i++){const q=rollLoot(s);counts[q.type]=(counts[q.type]||0)+1;if(q.boosted)boosted++;}
 expect(Object.keys(counts).sort()).toEqual(['ammo','drink','original','shield']);expect(counts.original).toBeLessThan(counts.drink);expect(boosted).toBeGreaterThan(30);expect(boosted).toBeLessThan(150);
 const world=createAdventure(),crate=world.supplies[0];crate.loot={type:'shield'};damageSupply(world,crate,9);damageSupply(world,crate,9);expect(world.pickups).toHaveLength(1);expect(world.pickups[0].type).toBe('shield');
});
test('same flavor upgrades both attack sizes once, random powered cans do the same, and refills preserve tier',()=>{
 const s=clean();equipDrink(s,1,10);tick(s,1,{attack:true});const small=s.shots[0];collectDrink(s,1);expect(s.drinkTier).toBe(2);expect(s.ammo).toBe(42);
 s.shotWait=0;tick(s,1,{attack:true});const big=s.shots.at(-1);expect(big.r/small.r).toBeCloseTo(1.3);expect(big.scale).toBe(1.3);
 s.player.cast=0;tick(s);tick(s,1,{special:true});expect(s.shots.find(q=>q.heavy).scale).toBe(1.3);
 collectDrink(s,1);expect(s.drinkTier).toBe(2);s.ammo=3;takeLoot(s,{type:'ammo'});expect(s.ammo).toBe(27);expect(s.drinkTier).toBe(2);
 const next=createAdventure(1,false,adventureCarry(s));expect(next.drinkTier).toBe(2);expect(next.ammo).toBe(27);
 collectDrink(s,0);expect(s.drinkTier).toBe(1);collectDrink(s,3,true);expect(s.drinkTier).toBe(2);
});
test('shield pickups add one protection each, capped at three, without changing the drink',()=>{
 const s=clean();equipDrink(s,2,17);takeLoot(s,{type:'shield'});expect(s.shield).toBe(1);expect(s.weapon).toBe(2);expect(s.ammo).toBe(17);
 for(let i=0;i<4;i++)takeLoot(s,{type:'shield'});expect(s.shield).toBe(3);
 s.hostile=[{x:s.player.x,y:s.player.y-35,vx:0,vy:0,r:10,life:2,age:0,kind:'ball'}];tick(s);expect(s.shield).toBe(2);expect(s.hearts).toBe(5);
});
test('Original plays a sip, protects for ten active seconds, speeds shooting and then ends',()=>{
 const s=clean();takeLoot(s,{type:'original'});expect(hexyPose(s).sheet).toBe('drink-original');tick(s,84);expect(s.overdrive).toBeCloseTo(10,1);
 s.hostile=[{x:s.player.x,y:s.player.y-35,vx:0,vy:0,r:10,life:2,age:0,kind:'ball'}];tick(s);expect(s.hearts).toBe(5);
 const normal=clean();tick(normal,120,{attack:true});tick(s,120,{attack:true});expect(s.shots.length).toBeGreaterThan(normal.shots.length);
 tick(s,1000);expect(s.overdrive).toBeGreaterThan(.5);tick(s,90);expect(s.overdrive).toBe(0);s.hostile=[{x:s.player.x,y:s.player.y-35,vx:0,vy:0,r:10,life:2,age:0,kind:'ball'}];tick(s);expect(s.hearts).toBe(4);
});
test('both Banana attacks reach far targets and can damage the same target outbound and returning',()=>{
 for(const heavy of [false,true]){const s=clean();equipDrink(s,1);const e=makeEnemy(430,480,5);e.hp=100;e.timer=100;s.enemies=[e];tick(s,1,heavy?{special:true}:{attack:true});const shot=s.shots[0];let furthest=shot.x;for(let i=0;i<480;i++){tick(s);furthest=Math.max(furthest,shot.x);}
  expect(furthest).toBeGreaterThan(480);expect(e.hp).toBe(100-2*(heavy?8:3));expect(shot.returning).toBe(true);
 }
});
test('normal and strong bubbles retain hostile bullets then burst and damage enemies nearby',()=>{
 for(const heavy of [false,true]){const s=clean();equipDrink(s,3);tick(s,1,heavy?{special:true}:{attack:true});const q=s.shots[0];const e=makeEnemy(q.x+60,480,5);e.hp=50;e.timer=100;s.enemies=[e];
  s.hostile=[{x:q.x+4,y:q.y,vx:0,vy:0,r:10,life:3,age:0,kind:'bomb',floor:480}];tick(s);expect(q.captured).toHaveLength(1);expect(s.hostile).toHaveLength(0);tick(s,120);expect(q.popped).toBe(true);expect(e.hp).toBeLessThan(50);expect(s.hostile.some(p=>p.kind==='wave')).toBe(false);
 }
});
test('a trapped enemy stays in place but can still shoot, and its defeat damages nearby enemies',()=>{
 const s=clean(),e=makeEnemy(350,480,1),near=makeEnemy(420,480,5),far=makeEnemy(700,480,5);s.enemies=[e,near,far];s.damage=()=>{};trapEnemy(e,4);e.timer=.01;near.timer=far.timer=100;
 const x=e.x,y=e.y;for(let i=0;i<100;i++)updateEnemies(s,1/120,playerBody,()=>{});expect(e.x).toBe(x);expect(e.y).toBe(y);expect(s.hostile.some(p=>p.kind==='ring')).toBe(true);
 e.hp=1;s.shots=[{x:e.x,y:e.y-30,vx:0,vy:0,r:10,life:1,age:0,kind:-1,damage:2,hits:[]}];tick(s);expect(e.hp).toBe(0);expect(near.hp).toBeCloseTo(near.maxHp-3);expect(far.hp).toBe(far.maxHp);
});
test('purple clown releases matching red, blue and green balls one at a time',()=>{
 const s=clean(),e=makeEnemy(390,480,3);s.enemies=[e];s.damage=()=>{};e.timer=0;const frames=[];
 for(let i=0;i<100;i++){const before=s.hostile.length;updateEnemies(s,1/120,playerBody,()=>{});if(s.hostile.length>before)frames.push(enemyDrawing(e).frame);}
 expect(s.hostile.map(q=>q.kind)).toEqual(['juggle','juggle','juggle']);expect(s.hostile.map(q=>q.color)).toEqual([0,1,2]);expect(frames).toEqual([5,7,9]);
});
test('ordinary enemies get exactly fifteen percent more health',()=>{expect(makeEnemy(0,0,0).hp).toBe(4.6);expect(makeEnemy(0,0,1).hp).toBe(10.35);expect(makeEnemy(0,0,2).hp).toBe(5.75);});
test('clouds move while Hexy stands still and reduced motion freezes their independent drift',()=>{
 const camera={x:0,y:40};expect(cloudPositions(camera,0)).not.toEqual(cloudPositions(camera,15));expect(cloudPositions(camera,0,true)).toEqual(cloudPositions(camera,15,true));expect(cloudPositions({...camera,x:500},15)).not.toEqual(cloudPositions(camera,15));
});

test('only collected stars enter the wallet when the first chapter clears',async({page})=>{
 await page.route('**/src/components/arcade/adventureModel.js*',async route=>{
  const response=await route.fetch(),source=await response.text();await route.fulfill({response,body:source.replace('function stepAdventure(s,input,dt){',`function stepAdventure(s,input,dt){
   if(s.ticks===0)s.stars=[];
   if(s.index===0&&s.ticks===0){const a=s.level.arena;s.player.x=a.right-200;s.player.y=a.y;s.player.ground=s.platforms.length-1;s.boss.hp=0;s.boss.phase='defeated';s.camera={x:a.right-1170,y:a.y-580,zoom:.82};s.enemies=[];s.score=999;s.starMoney=2;}
  `)});
 });
 await page.goto('/arcade');await expect(page.locator('[data-hexy-adventure]')).toHaveAttribute('data-phase','ready',{timeout:30000});await page.locator('[data-insert-coin]').click();
 await expect(page.locator('[data-adventure-canvas]')).toHaveAttribute('data-level','1',{timeout:12000});
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('magic-drink-arcade-v1')).stars)).toBe(2);await expect(page.locator('[data-score-hud]')).toHaveText('2');
});
for(const width of [390,1440])test(`${width}: Original pickup and powered can remain readable in the real HUD`,async({page})=>{
 await page.route('**/src/components/arcade/adventureModel.js*',async route=>{
  const response=await route.fetch(),source=await response.text();await route.fulfill({response,body:source.replace('function stepAdventure(s,input,dt){',`function stepAdventure(s,input,dt){
   if(s.ticks===0){s.weapon=1;s.ammoWeapon=1;s.ammo=21;s.drinkTier=2;s.starMoney=7;s.enemies=[];s.supplies=[];s.outposts=[];s.stars=[];takeLoot(s,{type:'original'});}
  `)});
 });
 await page.setViewportSize({width,height:900});await page.goto('/arcade');await expect(page.locator('[data-hexy-adventure]')).toHaveAttribute('data-phase','ready',{timeout:30000});
 // Observe the short sip from inside the page, before the click's automation
 // round trip completes. A slow screenshot/trace must not miss a valid pose.
 await page.locator('[data-adventure-canvas]').evaluate(c=>{const observer=new MutationObserver(()=>{if(c.dataset.pose?.startsWith('drink-original:')){c.dataset.sipObserved='true';observer.disconnect();}});observer.observe(c,{attributes:true,attributeFilter:['data-pose']});});
 await page.locator('[data-practice]').click();
 const canvas=page.locator('[data-adventure-canvas]');await expect(canvas).toHaveAttribute('data-sip-observed','true');await expect(page.locator('[data-original-buff]')).toBeVisible();await expect(page.locator('[data-drink-charge]')).toHaveAttribute('data-drink-tier','2');await expect(page.locator('[data-score-hud]')).toHaveText('7');
 await expect(canvas).not.toHaveAttribute('data-pose',/drink-original:/);await page.keyboard.press('KeyP');const time=await canvas.getAttribute('data-overdrive');await page.waitForTimeout(250);expect(await canvas.getAttribute('data-overdrive')).toBe(time);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});
