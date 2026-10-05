import {collectStartingDrink,fixtureStartingDrink} from './arcade-input.helpers';
import {test,expect} from '@playwright/test';
import {createAdventure,stepAdventure} from '../src/components/arcade/adventureModel';
import {makeEnemy,updateEnemies} from '../src/components/arcade/adventureEnemies';
import {SPECIALS,specialShots} from '../src/components/arcade/adventureMagic';
const tick=(s,keys={},n=1)=>{for(let i=0;i<n;i++)stepAdventure(s,keys,1/120);};
function empty(kind){const s=createAdventure();s.enemies=[];s.pickups=[];s.supplies=[];s.stars=[];s.cages=[];s.weapon=kind;return s;}

test('every drink fires immediately once per press and pays the same strong cost',()=>{
 for(let kind=0;kind<5;kind++){
  const s=empty(kind);tick(s,{special:true,attack:true});expect(s.shots).toHaveLength(kind===4?5:kind===3?2:1);expect(s.shots.every(q=>q.kind===kind&&q.heavy)).toBe(true);
  expect(s.magic).toBe(100-SPECIALS[kind].cost);tick(s,{special:true},12);expect(s.magic).toBe(100-SPECIALS[kind].cost);
  const dry=empty(kind);dry.magic=SPECIALS[kind].cost-15;tick(dry,{special:true},30);tick(dry,{},30);expect(dry.shots).toHaveLength(0);expect(dry.notice).toBe('lowMagic');
 }
});

test('strong magic works during a jump and cannot repeat merely by holding the button',()=>{
 for(let kind=0;kind<5;kind++){
  const s=empty(kind);tick(s,{jump:true},20);tick(s,{special:true});expect(s.shots.every(q=>q.heavy)).toBe(true);expect(s.magic).toBe(70);
  tick(s,{special:true},30);expect(s.magic).toBe(70);expect(s.player.charge).toBe(0);
 }
});

test('large boomerang can hit on both legs, collects a distant star and returns',()=>{
 const s=empty(1),e=makeEnemy(265,480,5);e.hp=40;e.timer=100;s.enemies=[e];s.stars=[{x:315,y:442,taken:false}];
 s.shots=specialShots(1,{x:110,y:442},{x:1,y:0});tick(s,{},320);
 expect(e.hp).toBe(24);expect(s.stars[0].taken).toBe(true);expect(s.starMoney).toBe(1);expect(s.shots).toHaveLength(0);
});

test('leaf cyclone hits at intervals and slows enemy movement and attack clocks',()=>{
 const s=empty(2),e=makeEnemy(215,480,5);e.hp=40;e.timer=100;s.enemies=[e];s.shots=specialShots(2,{x:195,y:442},{x:1,y:0});
 tick(s,{},10);expect(e.hp).toBe(38);expect(e.snare).toBeGreaterThan(0);tick(s,{},30);expect(e.hp).toBe(36);
 const normal=empty(2),slow=empty(2);normal.enemies=[makeEnemy(400,480,0)];slow.enemies=[makeEnemy(400,480,0)];slow.enemies[0].snare=1;
 for(const q of [normal,slow]){q.damage=()=>{};updateEnemies(q,.2,()=>({x:0,y:0,w:0,h:0}),()=>{});}
 expect(400-slow.enemies[0].x).toBeLessThan((400-normal.enemies[0].x)/2);expect(slow.enemies[0].timer).toBeGreaterThan(normal.enemies[0].timer);
});

test('two travelling bubbles clear bombs and each deal one impact before bursting',()=>{
 const s=empty(3),e=makeEnemy(165,480,5);e.hp=30;e.timer=100;s.enemies=[e];
 s.shots=specialShots(3,{x:100,y:444},{x:1,y:0});s.hostile=[{x:115,y:474,vx:0,vy:80,r:15,life:1,age:0,kind:'bomb',floor:480}];
 tick(s,{},2);expect(s.hostile).toHaveLength(0);expect(s.hearts).toBe(5);expect(e.trap).toBeGreaterThan(0);
 // Two 9-point impacts plus the 2-point explosion of the captured bomb.
 tick(s,{},126);expect(e.hp).toBe(10);expect(s.events).not.toContain('impact');tick(s,{},40);expect(e.hp).toBe(10);expect(s.shots).toHaveLength(0);
});

test('five stars fan out, steer toward visible targets and expire without any target',()=>{
 const s=empty(4),e=makeEnemy(370,390,5);e.hp=30;e.timer=100;s.enemies=[e];s.shots=specialShots(4,{x:100,y:440},{x:1,y:0});
 expect(new Set(s.shots.map(q=>Math.round(q.vy))).size).toBe(5);tick(s,{},105);expect(e.hp).toBeLessThanOrEqual(14);
 const noTargets=empty(4);noTargets.shots=specialShots(4,{x:100,y:400},{x:0,y:-1});tick(noTargets,{},240);expect(noTargets.shots).toHaveLength(0);
 const ground=empty(4);ground.shots=[specialShots(4,{x:110,y:450},{x:1,y:1})[2]];tick(ground,{},12);expect(ground.shots).toHaveLength(0);expect(ground.effects.some(q=>q.spell===4)).toBe(true);
});

test('new spells respect boss invulnerability and have bounded damage',()=>{
 for(const kind of [1,2,3,4])for(const vulnerable of [false,true]){
  const s=createAdventure(1),b=s.boss;s.enemies=[];s.pickups=[];s.supplies=[];s.cages=[];s.weapon=kind;s.player.x=b.x-95;s.player.y=b.y;s.player.ground=9;s.player.hurt=10;
  Object.assign(b,{phase:vulnerable?'recover':'intro',timer:5,vulnerable});
  s.shots=specialShots(kind,{x:b.x-20,y:b.y-55},{x:1,y:0});const hp=b.hp;tick(s,{},180);
  expect(hp-b.hp).toBeLessThanOrEqual(kind===1?16:kind===4?20:kind===3?18:12);
  if(vulnerable)expect(b.hp,`spell ${kind} must damage an exposed boss`).toBeLessThan(hp);else expect(b.hp,`spell ${kind} must respect invulnerability`).toBe(hp);
 }
});

test('mobile offers the special for all drinks and shows each spell and cost',async({page})=>{
 await fixtureStartingDrink(page);await page.setViewportSize({width:390,height:844});await page.goto('/arcade');const root=page.locator('[data-hexy-adventure]');await expect(root).toHaveAttribute('data-phase','ready',{timeout:20000});
 for(let kind=1;kind<5;kind++){
  await page.locator(`[data-level-choice="${kind}"]`).click();await page.locator('[data-practice]').click();await expect(root).toHaveAttribute('data-phase','playing');
  const canvas=page.locator('[data-adventure-canvas]');await collectStartingDrink(page,kind);
  const control=page.getByRole('button',{name:'Magia fuerte',exact:true});await expect(control).toBeEnabled();await expect(page.locator('[data-special-tip]')).toContainText(SPECIALS[kind].name[0]);
  await page.keyboard.press('KeyC');
  await expect.poll(async()=>Number(await page.getByRole('meter',{name:'Energía de magia',exact:true}).getAttribute('value'))).toBeLessThan(100-SPECIALS[kind].cost+5);
  await page.keyboard.press('KeyP');await page.getByRole('button',{name:'Terminar práctica',exact:true}).click();
 }
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('cancelling a touch after activation keeps the paid super running without a second charge',async({browser})=>{
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),page=await context.newPage();
 await fixtureStartingDrink(page);await page.addInitScript(()=>localStorage.setItem('lang','en'));await page.goto('/arcade');const root=page.locator('[data-hexy-adventure]');await expect(root).toHaveAttribute('data-phase','ready',{timeout:20000});
 await page.locator('[data-level-choice="3"]').tap();await page.locator('[data-practice]').tap();await expect(root).toHaveAttribute('data-phase','playing');
 const canvas=page.locator('[data-adventure-canvas]');await collectStartingDrink(page,3);
 const control=page.getByRole('button',{name:'Super attack',exact:true});await control.scrollIntoViewIfNeeded();const r=await control.boundingBox(),session=await context.newCDPSession(page);
 await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:r.x+r.width/2,y:r.y+r.height/2,id:1}]});await expect(control).toHaveAttribute('data-charged','true');
 await session.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});await expect(canvas).toHaveAttribute('data-pose',/super-release:/);
 await expect(page.getByRole('meter',{name:'Magic energy'})).toHaveAttribute('value','10');await expect(canvas).toHaveAttribute('data-super-active','false',{timeout:6000});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await context.close();
});
