import {openAdventureMenu} from './arcade-input.helpers';
import {test,expect} from '@playwright/test';
test.use({hasTouch:true});
import {createAdventure,stepAdventure,playerBody} from '../src/components/arcade/adventure/engine/adventureModel';
import {hexyPose,hexyMuzzle} from '../src/components/arcade/adventure/actors/hexy/hexyAnimation';
import {surfaceY} from '../src/components/arcade/adventure/world/adventureTerrain';
import {bossTargets} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
const tick=(s,keys={},n=1)=>{for(let i=0;i<n;i++)stepAdventure(s,keys,1/120);};

test('opening route stays grounded and its three rescues precede the boss clearing',()=>{
 const s=createAdventure(),a=s.level.arena;let edge=0;
 let previous=480;for(const p of s.platforms){expect(p.x).toBe(edge);expect(p.y).toBe(previous);previous=surfaceY(p,p.x+p.w);edge=p.x+p.w;}
 expect(edge).toBe(s.level.width);expect(s.cages.every(c=>s.platforms.some(p=>c.x>=p.x&&c.x<=p.x+p.w&&surfaceY(p,c.x)===c.y)&&c.x<a.entry)).toBe(true);
 expect(s.level.scenery.find(p=>p.kind==='trees').x).toBeGreaterThan(800);
 expect(s.outposts[0].x).toBeGreaterThan(2000);expect(s.outposts).toHaveLength(3);
});

test('crouch locomotion animates, rolling lowers the body and keeps its direction',()=>{
 const s=createAdventure(),poses=new Set();s.enemies=[];
 for(let i=0;i<100;i++){tick(s,{down:true,right:true});poses.add(hexyPose(s).frame);expect(s.player.y).toBe(480);}
 expect(hexyPose(s).sheet).toBe('crouch-walk');expect(poses.size).toBeGreaterThan(5);
 const start=s.player.x;tick(s,{dash:true});expect(playerBody(s.player).h).toBe(38);
 const rolling=new Set();for(let i=0;i<39;i++){rolling.add(hexyPose(s).frame);tick(s,{left:true});expect(s.player.dir).toBe(1);}
 expect(s.player.x-start).toBeGreaterThan(130);expect(rolling.size).toBe(8);tick(s,{},5);expect(s.player.dash).toBe(0);
 const hurt=createAdventure();hurt.player.hitReact=.3;tick(hurt,{attack:true});expect(hurt.shots).toHaveLength(0);tick(hurt,{dash:true});expect(hexyPose(hurt).sheet).toBe('roll');
});

test('upward poses, airborne poses and shot origins follow the new artwork',()=>{
 const s=createAdventure();s.enemies=[];tick(s,{up:true},15);
 expect(hexyPose(s)).toEqual({sheet:'ground-aim',frame:4});
 tick(s,{up:true,attack:true});expect(hexyPose(s)).toEqual({sheet:'ground-aim',frame:5});
 const m=hexyMuzzle(s);expect(s.shots[0].x).toBeCloseTo(m.x);expect(s.shots[0].y).toBeLessThan(s.player.y-80);
 const jump=createAdventure();jump.enemies=[];tick(jump,{jump:true},16);expect(hexyPose(jump)).toEqual({sheet:'jump',frame:2});
 tick(jump,{},45);expect(hexyPose(jump).sheet).toBe('jump');expect(hexyPose(jump).frame).toBeGreaterThanOrEqual(5);
});

test('Dragon Grape fires immediately, costs 34.5 and remains available during a jump',()=>{
 const s=createAdventure();s.weapon=0;s.enemies=[];s.pickups=[];s.supplies=[];
 tick(s,{special:true});expect(s.shots).toHaveLength(1);expect(s.shots[0]).toMatchObject({heavy:true,damage:14,kind:0});expect(s.magic).toBe(65.5);
 tick(s,{special:true},70);expect(s.shots.filter(q=>q.heavy)).toHaveLength(1);expect(s.magic).toBeGreaterThan(65.5);
 tick(s,{jump:true},15);tick(s,{special:true});expect(s.player.specialCast).toBeGreaterThan(0);expect(s.magic).toBeLessThan(50);
 const plain=createAdventure();tick(plain,{special:true});expect(plain.player.charge).toBe(0);expect(plain.magic).toBe(82.75);expect(plain.shots[0].heavy).toBe(true);expect(plain.shots[0].kind).toBe(-1);
});

test('boss body hits during firing pause and react, while wheel hits give blocked feedback without flashing',()=>{
 for(const bodyHit of [true,false]){
  const s=createAdventure(1),b=s.boss;s.enemies=[];s.player.x=s.level.arena.left+160;s.player.y=s.level.arena.y;
  Object.assign(b,{phase:'attack',move:'organ-fanfare',timer:1,attackClock:0,shotClock:2});tick(s);
  expect(b.vulnerable).toBe(true);const [core]=bossTargets(s);
  const hp=b.hp;s.shots=[{x:core.x+core.w/2,y:bodyHit?core.y+core.h/2:b.y-55,vx:100,vy:0,r:28,life:2,age:0,kind:0,heavy:true,damage:14,hits:[]}];
  tick(s);
  if(bodyHit){expect(b.hp).toBe(hp-14);expect(s.events).toContain('bossHeavyHit');expect(b.flash).toBeGreaterThan(.1);expect(s.hitStop).toBeGreaterThan(0);expect(s.effects.some(e=>e.dragon)).toBe(true);
   const clock=s.time;tick(s,{},3);expect(s.time).toBe(clock);expect(s.events).toHaveLength(0);tick(s,{},12);expect(s.time).toBeGreaterThan(clock);expect(b.hp).toBe(hp-14);
  }else{expect(b.hp).toBe(hp);expect(s.hitStop).toBe(0);expect(b.flash).toBe(0);expect(s.events).toContain('bossBlock');expect(s.effects.some(e=>e.armor)).toBe(true);}
 }
});

test('mobile super starts on a tap, pauses safely and resumes without charging or spending again',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/arcade');await openAdventureMenu(page);await expect(page.locator('[data-hexy-adventure]')).toHaveAttribute('data-phase','ready',{timeout:30000});
 await page.locator('[data-practice]').click();await expect(page.locator('[data-hexy-adventure]')).toHaveAttribute('data-phase','playing');const canvas=page.locator('[data-adventure-canvas]');
 // The general super is available immediately. Stay in the safe opening so
 // an enemy hit reaction cannot consume the tap this UI test is checking.
 const button=page.getByRole('button',{name:'Súper ataque',exact:true});await expect(button).toBeEnabled();const rect=await button.boundingBox();expect(rect.x).toBeGreaterThanOrEqual(0);expect(rect.x+rect.width).toBeLessThanOrEqual(390);
 await button.click();await expect(canvas).toHaveAttribute('data-super-active','true');
 const energy=page.getByRole('meter',{name:'Energía de magia',exact:true});await expect(energy).toHaveAttribute('value','10');
 await page.keyboard.press('KeyP');await expect(page.locator('[data-hexy-adventure]')).toHaveAttribute('data-phase','paused');const charge=await canvas.getAttribute('data-charge');await page.waitForTimeout(400);expect(await canvas.getAttribute('data-charge')).toBe(charge);
 await page.getByRole('button',{name:'Continuar ▶',exact:true}).click();await expect(canvas).toHaveAttribute('data-pose',/super-release:/);await expect(canvas).toHaveAttribute('data-super-active','false',{timeout:6000});expect(Number(await energy.getAttribute('value'))).toBeLessThan(15);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
