import {openAdventureMenu} from './arcade-input.helpers';
import {test,expect} from '@playwright/test';
import {createAdventure,stepAdventure,adventureCarry,playerBody} from '../src/components/arcade/adventure/engine/adventureModel';
import {collectAdventureStar,SUPER_RECHARGE} from '../src/components/arcade/adventure/engine/adventureRewards';
import {BASIC_SPECIAL,SPECIALS,SUPER_EXHAUSTION} from '../src/components/arcade/adventure/engine/adventureMagic';
import {damageSupply,supplyFrame} from '../src/components/arcade/adventure/world/adventureSupplies';
import {makeEnemy,updateEnemies} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {enemyDrawing} from '../src/components/arcade/adventure/render/adventureSprites';
const tick=(s,n=1,input={})=>{for(let i=0;i<n;i++)stepAdventure(s,input,1/120);};
const clean=()=>{const s=createAdventure();s.supplies=[];s.enemies=[];s.pickups=[];s.outposts=[];s.stars=[];s.hazards=[];s.cages=[];return s;};

test('a full mana bar cannot bypass the one-charge 80-second super recharge',()=>{
 const s=clean();tick(s,1,{super:true});while(s.superCinematic)tick(s);expect(s.superCooldown).toBe(SUPER_RECHARGE);expect(s.exhaustion).toBe(8);
 tick(s,1200);expect(s.magic).toBeGreaterThan(50);s.magic=100;tick(s,1,{super:true});expect(s.superCinematic).toBeNull();expect(s.notice).toBe('superRecharging');
 tick(s,SUPER_RECHARGE*120-1202);expect(s.superCooldown).toBeGreaterThan(0);tick(s,3);expect(s.superCooldown).toBe(0);
 s.magic=80;tick(s,1,{super:true});expect(s.superCinematic).toBeNull();expect(s.notice).toBe('superLow');tick(s);s.magic=100;tick(s,1,{super:true});expect(s.superCinematic).toBeTruthy();
});
test('stars grant money once without affecting or banking super charges',()=>{
 const s=clean();s.superCooldown=40;const star={x:100,y:400};collectAdventureStar(s,star);collectAdventureStar(s,star);expect(s.starMoney).toBe(1);expect(s.superCooldown).toBe(40);
 for(let i=0;i<60;i++)collectAdventureStar(s,{x:100,y:400});expect(s.superCooldown).toBe(40);expect(s.score).toBe(0);expect(s.starMoney).toBe(61);
 s.superCooldown=0;collectAdventureStar(s,{x:100,y:400});expect(s.superCooldown).toBe(0);
 s.superCooldown=18;s.exhaustion=4;const next=createAdventure(1,false,adventureCarry(s));expect(next.superCooldown).toBe(18);expect(next.exhaustion).toBe(4);expect(next.starMoney).toBe(0);
});
test('walking into a star and retrieving one by boomerang both award one unit of money',()=>{
 for(const ranged of [false,true]){
  const s=clean();s.superCooldown=30;s.stars=[{x:ranged?250:s.player.x,y:s.player.y-(ranged?59:35),taken:false}];
  if(ranged){s.weapon=1;tick(s,35,{attack:true});}else tick(s);
  expect(s.stars[0].taken).toBe(true);expect(s.starMoney).toBe(1);expect(s.superCooldown).toBeCloseTo(30-(ranged?35:1)/120,4);
 }
});
test('basic strong magic is available without a drink, directional, brief and less powerful',()=>{
 for(const keys of [{},{down:true},{up:true},{right:true,up:true}]){
  const s=clean();tick(s,1,{special:true,...keys});expect(s.shots).toHaveLength(1);const shot=s.shots[0];expect(shot.kind).toBe(-1);expect(shot.heavy).toBe(true);expect(s.magic).toBe(82.75);expect(s.weapon).toBe(-1);expect(s.ammo).toBe(0);
  expect(shot.damage).toBeLessThan(SPECIALS[0].damage);expect(BASIC_SPECIAL.speed*BASIC_SPECIAL.life).toBeLessThan(65);tick(s,32,{special:true});expect(s.shots).toHaveLength(0);
 }
 const s=clean();Object.assign(s.player,{ground:null,y:200,vy:0});tick(s,1,{special:true,down:true,left:true});expect(s.shots[0].vx).toBeLessThan(0);expect(s.shots[0].vy).toBeGreaterThan(0);
});
test('basic burst hits a nearby enemy and cancels a projectile but does not reach a distant enemy',()=>{
 const s=clean();s.enemies=[makeEnemy(180,480,1),makeEnemy(360,480,1)];s.enemies.forEach(e=>{e.timer=5;e.clock=0;});
 tick(s,1,{special:true});const burst=s.shots[0];s.hostile=[{x:burst.x+10,y:burst.y,vx:0,vy:0,r:10,life:3,age:0,kind:'ball'}];tick(s);expect(s.hostile).toHaveLength(0);tick(s,35);expect(s.enemies[0].hp).toBeCloseTo(5.35);expect(s.enemies[1].hp).toBe(10.35);
});
test('supply crates hide cans until broken, eject one physical drop, and remain ruined',()=>{
 const s=createAdventure(),q=s.supplies[0];s.enemies=[];q.loot={type:'drink',kind:q.kind};expect(s.pickups).toHaveLength(0);
 damageSupply(s,q,2);expect(q.hp).toBe(2);expect(supplyFrame(q)).toBe(1);expect(s.pickups).toHaveLength(0);
 damageSupply(s,q,2);damageSupply(s,q,10);expect(s.pickups).toHaveLength(1);expect(s.pickups[0].vy).toBeLessThan(0);expect(supplyFrame(q)).toBe(2);
 tick(s,160);expect(s.pickups[0].y).toBe(s.pickups[0].floor);expect(supplyFrame(q)).toBe(7);
 s.player.x=q.x;tick(s);expect(s.weapon).toBe(q.kind);expect(s.pickups[0].taken).toBe(true);expect(s.ammo).toBeGreaterThan(0);
});
test('basic shots, basic strong magic and super can break crates',()=>{
 for(const input of [{attack:true},{special:true},{super:true}]){
  const s=createAdventure();s.enemies=[];s.cages=[];const q=s.supplies[0];q.loot={type:'drink',kind:q.kind};
  // Isolate each attack on flat ground; the first real crate is now downhill.
  q.x=700;q.y=480;s.player.x=q.x-110;tick(s,1,input);if(input.super)while(s.superCinematic)tick(s);else tick(s,90,input);
  expect(q.hp).toBe(0);expect(s.pickups.filter(p=>p.kind===q.kind)).toHaveLength(1);
 }
});
test('green harlequins release 15-percent larger curved rings with dedicated throw art',()=>{
 for(const type of [1,4]){const s=clean(),e=makeEnemy(330,480,type);s.enemies=[e];s.damage=()=>{};e.timer=.4;updateEnemies(s,1/120,playerBody,()=>{});expect(enemyDrawing(e).key).toBe('acrobat-rings');expect(enemyDrawing(e).frame).toBeLessThan(4);
  e.timer=0;updateEnemies(s,1/120,playerBody,()=>{});expect(s.hostile[0].r).toBeCloseTo(16.1);expect(s.hostile[0].kind).toBe('ring');expect(s.hostile[0].arc).toBeDefined();expect(enemyDrawing(e).frame).toBe(4);
 }
 const frames=new Set();for(let i=0;i<8;i++)frames.add(enemyDrawing({type:4,hp:9,clock:0,phase:'patrol',baseY:480,y:480,gait:i/8}).frame);expect(frames.size).toBe(8);
});

for(const width of [390,1440])test(`${width}: can fill reflects ammunition, super ignores full mana and pause freezes its recharge`,async({page})=>{
 await page.route('**/src/components/arcade/adventure/engine/adventureModel.js*',async route=>{
  const response=await route.fetch(),source=await response.text();
  await route.fulfill({response,body:source.replace('function stepAdventure(s,input,dt){',`function stepAdventure(s,input,dt){
   if(s.ticks===0){s.weapon=0;s.ammoWeapon=0;s.ammo=27;s.superCooldown=20;s.magic=100;s.starMoney=120;s.enemies=[];s.supplies=[];s.outposts=[];s.stars=[];}
  `)});
 });
 await page.setViewportSize({width,height:900});await page.goto('/arcade');await openAdventureMenu(page);const root=page.locator('[data-hexy-adventure]'),canvas=page.locator('[data-adventure-canvas]');
 await expect(root).toHaveAttribute('data-phase','ready',{timeout:30000});await page.locator('[data-practice]').click();
 await expect(page.locator('[data-drink-charge]')).toHaveAttribute('data-drink-charge','0.500');
 expect(await page.locator('[data-drink-charge] img').last().evaluate(e=>getComputedStyle(e).clipPath)).toBe('inset(50% 0px 0px)');
 await expect(page.getByRole('meter',{name:'Energía de magia',exact:true})).toHaveAttribute('value','100');
 await expect(page.locator('[data-super-control]')).toBeDisabled();await expect(page.locator('[data-score-hud]')).toHaveText('120');
 await page.keyboard.press('KeyR');await expect(canvas).toHaveAttribute('data-super-active','false');
 await page.keyboard.press('KeyP');await expect(root).toHaveAttribute('data-phase','paused');const remaining=await canvas.getAttribute('data-super-cooldown');
 await page.waitForTimeout(350);expect(await canvas.getAttribute('data-super-cooldown')).toBe(remaining);
 await page.getByRole('button',{name:/^Continuar/}).click();await expect.poll(async()=>Number(await canvas.getAttribute('data-super-cooldown'))).toBeLessThan(Number(remaining));
 await page.keyboard.press('KeyZ');await expect(page.locator('[data-drink-charge]')).toHaveAttribute('data-drink-charge','0.481');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});
