import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import sharp from 'sharp';
import {createAdventure,stepAdventure,retryAdventure,playerBody} from '../src/components/arcade/adventure/engine/adventureModel';
import {updateBoss} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {harlequinBody,harlequinFrame,harlequinHand,HARLEQUIN_HEALTH} from '../src/components/arcade/adventure/actors/bosses/adventureHarlequin';
import {followAdventureCamera,adventureBounds} from '../src/components/arcade/adventure/render/adventureCamera';
import {grandRingBackdropPlacement} from '../src/components/arcade/adventure/render/harlequinCanvas';
import {openAdventureMenu} from './arcade-input.helpers';
const folder='tests/artifacts/arcade/grand-harlequin/';
const helpers={body:playerBody,say:()=>{},particles:()=>{}};
function battle(move='fan',stage=1){const s=createAdventure(3),a=s.level.arena;s.supplies=[];s.stars=[];s.arenaLocked=true;s.damage=()=>{};Object.assign(s.player,{x:a.left+260,y:a.y,ground:1});Object.assign(s.boss,{phase:'warn',timer:.01,engaged:true,vulnerable:true,move,stage,hp:stage===1?720:stage===2?420:180});return s;}
function tick(s,n,input={}){for(let i=0;i<n;i++)stepAdventure(s,input,1/120);}

test('dedicated boss level has a short safe approach, no interior checkpoint and a gradual arrival',()=>{
 const s=createAdventure(3);expect(s.level.bossOnly).toBe(true);expect(s.enemies).toHaveLength(0);expect(s.cages).toHaveLength(0);expect(s.stars.filter(q=>q.value===10)).toHaveLength(0);
 tick(s,400,{right:true});expect(s.boss.phase).toBe('sleep');expect(s.player.x).toBeLessThan(0);
 for(let i=0;i<1100&&s.boss.phase==='sleep';i++)tick(s,1,{right:true});
 expect(s.boss.phase).toBe('intro');expect(s.checkpointAt).toBeNull();
 const y=s.boss.y;tick(s,180);expect(s.boss.y).toBeGreaterThan(y);expect(s.boss.phase).toBe('intro');expect(s.hearts).toBe(s.maxHearts);tick(s,380);expect(s.boss.phase).not.toBe('intro');
 expect(HARLEQUIN_HEALTH.normal).toBeGreaterThan(createAdventure(2).boss.maxHp*2);expect(createAdventure(3,true).boss.hp).toBe(480);
});

test('three stages transition separately with a visible safe intermission and increasing pressure',()=>{
 const s=battle();s.boss.hp=480;tick(s,1);expect(s.boss.phase).toBe('transform');expect(s.boss.vulnerable).toBe(false);tick(s,230);expect(s.boss.stage).toBe(2);expect(s.boss.vulnerable).toBe(true);
 s.boss.hp=240;tick(s,1);expect(s.boss.phase).toBe('transform');tick(s,230);expect(s.boss.stage).toBe(3);expect(s.boss.vulnerable).toBe(true);
 s.boss.hp=1;tick(s,5);expect(s.boss.stage).toBe(3);
 const stats=[];for(const stage of [1,2,3]){const q=battle('fan',stage);for(let i=0;i<264;i++)updateBoss(q,1/120,helpers);stats.push({count:q.hostile.length,speed:Math.hypot(q.hostile[0].vx,q.hostile[0].vy)});}
 expect(stats[1].count).toBeGreaterThan(stats[0].count);expect(stats[2].count).toBeGreaterThan(stats[1].count);expect(stats[2].speed).toBeGreaterThan(stats[1].speed);
});

test('each attack remains vulnerable, uses its matching pose, and throws from a drawn hand',()=>{
 for(const move of ['fan','ribbon','dash','vault','curtain']){
  const s=battle(move,move==='curtain'?2:1);updateBoss(s,.02,helpers);expect(s.boss.phase).toBe('attack');expect(s.boss.vulnerable).toBe(true);
  const box=harlequinBody(s),hp=s.boss.hp;s.shots.push({x:box.x+box.w/2,y:box.y+box.h/2,vx:0,vy:0,damage:2,age:0,life:1,kind:-1,hits:[]});tick(s,1);expect(s.boss.hp).toBe(hp-2);
 }
 const s=battle();updateBoss(s,.02,helpers);updateBoss(s,.25,helpers);const h=harlequinHand(s.boss);expect(harlequinFrame(s.boss)).toBe(2);expect(s.hostile[0].x).toBe(h.x);expect(s.hostile[0].y).toBe(h.y);
});

test('cards and low ribbons threaten stationary Hexy and dash is not projectile protection',()=>{
 for(const move of ['fan','ribbon']){const s=battle(move);tick(s,850);expect(s.hearts).toBeLessThan(s.maxHearts);}
 const s=battle();s.boss.timer=100;const p=s.player;s.hostile=[{x:p.x+12,y:p.y-20,vx:-330,vy:0,r:13,drawSize:66,life:3,age:0,kind:'harlequin-card',harlequin:true}];tick(s,1,{dash:true});expect(s.hearts).toBe(s.maxHearts-1);
});

test('a low dash can be jumped and its speed increases in every stage',()=>{
 const speeds=[];
 for(const stage of [1,2,3]){const s=battle('dash',stage);updateBoss(s,.02,helpers);updateBoss(s,.05,helpers);speeds.push(Math.abs(s.boss.driveSpeed));expect(harlequinBody(s).h).toBeLessThan(105);}
 expect(speeds[1]).toBeGreaterThan(speeds[0]);expect(speeds[2]).toBeGreaterThan(speeds[1]);
 const s=battle('dash');s.boss.x=s.player.x+100;s.boss.endX=s.level.arena.left+155;Object.assign(s.player,{y:320,ground:null,vy:-100});tick(s,10);expect(s.hearts).toBe(s.maxHearts);
});

test('vaults change sides and phase two adds grounded landing waves; curtain rain has open lanes',()=>{
 const s=battle('vault',2),start=s.boss.x;let highest=480;
 for(let i=0;i<230;i++){updateBoss(s,1/120,helpers);highest=Math.min(highest,s.boss.y);}
 expect(s.boss.x).toBeLessThan(start-800);expect(highest).toBeLessThan(270);expect(s.hostile.filter(q=>q.kind==='harlequin-ribbon')).toHaveLength(2);
 const rain=battle('curtain',3);for(let i=0;i<180;i++)updateBoss(rain,1/120,helpers);
 expect(rain.boss.y).toBeLessThan(480);expect(rain.hostile.length).toBeGreaterThanOrEqual(7);expect(rain.hostile.every(q=>q.gravity===100&&q.vy>0)).toBe(true);
});

test('camera keeps both fighters visible and zoom does not lift the distant architecture',()=>{
 const s=battle(),img={width:2172,height:724};s.camera.backdropY=40;const bg=grandRingBackdropPlacement(s,img);
 for(let i=0;i<800;i++)followAdventureCamera(s,1/120);
 const width=960/s.camera.zoom;expect(Math.min(s.player.x,s.boss.x)-s.camera.x).toBeGreaterThan(20);expect(Math.max(s.player.x,s.boss.x)-s.camera.x).toBeLessThan(width-20);expect(s.camera.x+width).toBeLessThan(s.level.width);
 expect((480-s.camera.y)*s.camera.zoom).toBeCloseTo(454,1);expect(grandRingBackdropPlacement(s,img).y).toBeCloseTo(bg.y,1);
});

test('defeat falls, lands, vanishes and only then starts victory; retry restores all stages',()=>{
 const s=battle('fan',3);s.checkpointAt=[1150,480];s.boss.hp=0;tick(s,90);expect(harlequinFrame(s.boss)).toBe(7);expect(s.boss.shattered).toBeFalsy();expect(s.clear).toBeFalsy();
 tick(s,330);expect(s.boss.shattered).toBe(true);expect(s.effects.some(q=>q.cinematicSmoke)).toBe(true);tick(s,220);expect(s.clear).toBeTruthy();
 retryAdventure(s);expect(s.boss.hp).toBe(720);expect(s.boss.stage).toBe(1);expect(s.boss.shattered).toBeUndefined();expect(s.player.x).toBe(s.level.spawn[0]);expect(s.hostile).toHaveLength(0);
});

test('an airborne ultimate can defeat the final phase without skipping the exit animation',()=>{
 const s=battle('fan',3);s.boss.hp=35;s.boss.timer=100;Object.assign(s.player,{x:s.boss.x-410,y:400,ground:null,vy:0,dir:1});tick(s,1,{super:true});expect(s.superCinematic).toBeTruthy();tick(s,430);expect(s.boss.hp).toBe(0);tick(s,1450);expect(s.won).toBe(true);
});

test('both painted sheets contain eight visible transparent poses',async()=>{
 for(const name of ['poses','final']){const img=sharp('public/arcade/sprites/bosses/harlequin/'+name+'.webp'),m=await img.metadata();expect([m.width,m.height,m.hasAlpha]).toEqual([2048,1024,true]);
  for(let i=0;i<8;i++){const {data}=await img.clone().extract({left:i%4*512,top:Math.floor(i/4)*512,width:512,height:512}).raw().toBuffer({resolveWithObject:true});let visible=0;for(let k=3;k<data.length;k+=4)if(data[k]>70)visible++;expect(visible).toBeGreaterThan(20000);expect(visible).toBeLessThan(150000);}
 }
});

test('actual chapter menu loads the encounter and omits nonexistent rescue objectives',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/arcade');await openAdventureMenu(page);await page.getByRole('button',{name:/Elegir cap/}).click();await expect(page.locator('[data-level-choice="3"]')).toContainText('1-4');await page.locator('[data-level-choice="3"]').click();await page.locator('[data-practice]').click();
 await expect(page.locator('[data-hexy-adventure]')).toHaveAttribute('data-phase','playing');
 const canvas=page.locator('[data-adventure-canvas]');await expect(canvas).toHaveAttribute('data-level','3');await expect(page.locator('[data-bunny-hud]')).toHaveCount(0);await expect(page.locator('[data-treasure-hud]')).toHaveCount(0);
 await canvas.screenshot({path:folder+'mobile-entry.jpg'});
});

test('render real arrival, all three phases and defeat without errors',async({page})=>{
 fs.mkdirSync(folder,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/arcade');
 await page.evaluate(async()=>{
  const [{createAdventure,stepAdventure},{renderAdventure,loadAdventureArt},{followAdventureCamera}]=await Promise.all([import('/src/components/arcade/adventure/engine/adventureModel.js'),import('/src/components/arcade/adventure/render/adventureCanvas.js'),import('/src/components/arcade/adventure/render/adventureCamera.js')]);
  const art=await loadAdventureArt(),c=document.createElement('canvas');c.id='harlequin-review';c.style='position:fixed;inset:0;z-index:99999;width:1440px;height:810px';document.body.append(c);
  const scene=(stage=1,move='fan',frames=60)=>{const s=createAdventure(3),a=s.level.arena;s.supplies=[];s.stars=[];s.arenaLocked=true;s.noticeTime=0;
   Object.assign(s.player,{x:a.left+220,y:a.y,ground:1});Object.assign(s.boss,{phase:'warn',timer:.01,engaged:true,vulnerable:true,move,stage,hp:stage===1?720:stage===2?420:180});
   for(let i=0;i<600;i++)followAdventureCamera(s,1/120);for(let i=0;i<frames;i++)stepAdventure(s,{},1/120);renderAdventure(c,s,art);window.harlequinReview.s=s;return s;};
  window.harlequinReview={scene,art,c,renderAdventure,stepAdventure,createAdventure};scene();
 });
 for(const [name,stage,move,frames]of [['phase-one-cards',1,'fan',100],['phase-one-ribbon',1,'ribbon',100],['phase-two-vault',2,'vault',100],['phase-three-rain',3,'curtain',170],['phase-three-dash',3,'dash',90]]){await page.evaluate(args=>window.harlequinReview.scene(...args),[stage,move,frames]);await page.locator('#harlequin-review').screenshot({path:folder+name+'.jpg'});}
 await page.evaluate(()=>{const w=window.harlequinReview,s=w.createAdventure(3);s.player.x=1390;s.player.ground=1;s.noticeTime=0;for(let i=0;i<255;i++)w.stepAdventure(s,{},1/120);w.renderAdventure(w.c,s,w.art);});await page.locator('#harlequin-review').screenshot({path:folder+'arrival.jpg'});
 await page.evaluate(()=>{const w=window.harlequinReview,s=w.scene(3,'fan',0);s.boss.hp=0;for(let i=0;i<160;i++)w.stepAdventure(s,{},1/120);w.renderAdventure(w.c,s,w.art);});await page.locator('#harlequin-review').screenshot({path:folder+'defeat.jpg'});
 expect(errors).toEqual([]);
});
