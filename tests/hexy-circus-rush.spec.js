import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
import {createAdventure,stepAdventure,playerBody} from '../src/components/arcade/adventure/engine/adventureModel';
import {makeEnemy,updateEnemies} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {ZEPPELIN_TYPE,ZEPPELIN_SHOT_SPEED,zeppelinFrame} from '../src/components/arcade/adventure/actors/enemies/adventureZeppelin';
import {groundY} from '../src/components/arcade/adventure/world/adventureTerrain';

const artifacts='tests/artifacts/arcade/circus-rush/';
function quiet(){const s=createAdventure(1);for(const k of ['enemies','outposts','supplies','pickups','hazards','stars','cages'])s[k]=[];s.player.x=1200;s.camera.x=850;s.damage=()=>{};return s;}

test('the sonic and zeppelin atlases contain eight different transparent illustrated frames',async()=>{
 for(const [path,height]of [['effects/organ-sonic.webp',512],['enemies/zeppelin-actions.webp',384]]){
  const file='public/arcade/sprites/'+path,meta=await sharp(file).metadata();expect(meta.width).toBe(2048);expect(meta.height).toBe(height*2);expect(meta.hasAlpha).toBe(true);
  const hashes=[];for(let i=0;i<8;i++){const bytes=await sharp(file).extract({left:i%4*512,top:Math.floor(i/4)*height,width:512,height}).raw().toBuffer();hashes.push(createHash('sha256').update(bytes).digest('hex'));}
  expect(new Set(hashes).size).toBe(8);
 }
});

test('the pilot prepares, fires, recoils and returns to flight; red pellets are nineteen percent faster',()=>{
 const s=quiet(),e=makeEnemy(s.player.x-250,315,ZEPPELIN_TYPE);Object.assign(e,{flightActive:true,timer:.35});s.enemies=[e];
 const frames=new Set();let fired=false;
 for(let i=0;i<100;i++){
  updateEnemies(s,1/240,playerBody,()=>{});frames.add(zeppelinFrame(e));
  if(s.hostile.length){fired=true;expect(Math.hypot(s.hostile[0].vx,s.hostile[0].vy)).toBeCloseTo(ZEPPELIN_SHOT_SPEED);}
 }
 // Continue the follow-through after the zeppelin passes Hexy.
 for(let i=0;i<140;i++){updateEnemies(s,1/240,playerBody,()=>{});frames.add(zeppelinFrame(e));}
 expect([...frames]).toEqual(expect.arrayContaining([0,1,2,3]));expect(fired).toBe(true);expect(ZEPPELIN_SHOT_SPEED/285).toBeGreaterThan(1.19);
});

test('a lethal shot tears, deflates, bursts and drops the zeppelin before removing it at 60, 120 and 240 fps',()=>{
 for(const fps of [60,120,240]){
  const s=quiet(),e=makeEnemy(1350,315,ZEPPELIN_TYPE);Object.assign(e,{hp:1,flightActive:true,timer:10});s.enemies=[e];
  s.shots=[{x:e.x,y:e.y-28,vx:0,vy:0,r:8,life:1,age:0,kind:-1,damage:2,hits:[]}];stepAdventure(s,{},1/fps);
  expect(e.hp).toBe(0);expect(e.deadTime).toBeGreaterThan(2);expect(s.events).toContain('zeppelinBreak');
  const frames=new Set([zeppelinFrame(e)]),events=new Set(s.events),score=s.score;let landing=false;
  for(let i=0;i<fps*3&&s.enemies.includes(e);i++){
   stepAdventure(s,{},1/fps);frames.add(zeppelinFrame(e));s.events.forEach(q=>events.add(q));landing||=!!e.landed;
   expect(e.y).toBeLessThanOrEqual(groundY(s.platforms,e.x));expect(s.hostile).toHaveLength(0);expect(s.score).toBe(score);
  }
  expect([...frames]).toEqual([4,5,6,7]);expect(landing).toBe(true);expect(events.has('zeppelinBurst')).toBe(true);expect(events.has('zeppelinCrash')).toBe(true);expect(s.enemies).not.toContain(e);
 }
});

test('the real painter renders the pilot and four stages of falling destruction without a white frozen corpse',async({page})=>{
 fs.mkdirSync(artifacts,{recursive:true});await page.setViewportSize({width:1440,height:900});await page.goto('/arcade');
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.evaluate(async()=>{
  const [{createAdventure,stepAdventure},{makeEnemy},{loadAdventureArt,renderAdventure}]=await Promise.all([
   import('/src/components/arcade/adventure/engine/adventureModel.js'),import('/src/components/arcade/adventure/actors/enemies/adventureEnemies.js'),import('/src/components/arcade/adventure/render/adventureCanvas.js')]);
  const art=await loadAdventureArt(),c=document.createElement('canvas');c.id='circus-rush';c.style='position:fixed;inset:0;z-index:99999;width:1440px;height:810px';document.body.append(c);
  const s=createAdventure(1);for(const k of ['enemies','outposts','supplies','pickups','hazards','stars','cages'])s[k]=[];
  Object.assign(s.player,{x:500,y:480,ground:0});s.camera={x:0,y:0,zoom:1};s.damage=()=>{};
  const e=makeEnemy(650,315,7);Object.assign(e,{flightActive:true,timer:10,action:.4});s.enemies=[e];renderAdventure(c,s,art);
  window.circusReview={art,c,s,e,renderAdventure,stepAdventure};
 });
 await page.locator('#circus-rush').screenshot({path:artifacts+'pilot-fire.jpg'});
 await page.evaluate(()=>{const {s,e,stepAdventure}=window.circusReview;e.hp=1;s.shots=[{x:e.x,y:e.y-28,vx:0,vy:0,r:8,life:1,age:0,kind:-1,damage:2,hits:[]}];stepAdventure(s,{},1/120);});
 for(const age of [.13,.35,.65,1.15]){
  await page.evaluate(age=>{const {s,e,c,art,renderAdventure,stepAdventure}=window.circusReview;while(e.deathAge<age)stepAdventure(s,{},1/120);renderAdventure(c,s,art);},age);
  await page.locator('#circus-rush').screenshot({path:artifacts+`zeppelin-fall-${age}.jpg`});
 }
 expect(errors).toEqual([]);
});
