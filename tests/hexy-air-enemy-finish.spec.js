import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {createAdventure,stepAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {makeEnemy} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {enemyGeometry,enemyMuzzle} from '../src/components/arcade/adventure/actors/enemies/adventureEnemyGeometry';
import {ZEPPELIN_WIDTH,zeppelinMuzzle} from '../src/components/arcade/adventure/actors/enemies/adventureZeppelin';
import {groundY} from '../src/components/arcade/adventure/world/adventureTerrain';
const artifacts='tests/artifacts/arcade/air-enemy-finish/';
const quiet=()=>{const s=createAdventure(1);for(const k of ['enemies','outposts','supplies','pickups','hazards','stars','cages'])s[k]=[];return s;};

test('airship and balloon clown shrink fifteen percent together with collision and projectile origins',()=>{
 const balloon=makeEnemy(300,315,2),ship=makeEnemy(600,315,7);
 expect(enemyGeometry(balloon).size).toBe(187);expect(enemyGeometry(balloon).w).toBeCloseTo(55.25);expect(enemyGeometry(balloon).h).toBeCloseTo(89.25);
 expect(ZEPPELIN_WIDTH).toBeCloseTo(193.8);expect(enemyGeometry(ship).w).toBeCloseTo(206*.85);expect(enemyGeometry(ship).h).toBeCloseTo(153*.85);
 balloon.dir=1;expect(enemyMuzzle(balloon).x).toBeCloseTo(balloon.x+57*.85);expect(enemyMuzzle(balloon).y).toBeCloseTo(balloon.y-85*.85);
 expect(zeppelinMuzzle(ship).x).toBeCloseTo(ship.x+193.8*.39);
 expect(enemyGeometry(makeEnemy(0,0,0)).size).toBeCloseTo(148*.85);expect(enemyGeometry(makeEnemy(0,0,3)).size).toBe(160);
});

test('wreckage reaches the real ground even after a high fall, then dust clears without sliding or duplicate rewards',()=>{
 for(const fps of [60,120,240])for(const height of [170,700]){
  const s=quiet(),floor=groundY(s.platforms,1350),e=makeEnemy(1350,floor-height,7);Object.assign(e,{flightActive:true,hp:1,timer:30});s.enemies=[e];s.player.x=1000;s.player.y=480;s.player.ground=0;s.camera.x=850;
  s.shots=[{x:e.x,y:e.y-28,vx:0,vy:0,r:8,life:1,age:0,kind:-1,damage:2,hits:[]}];stepAdventure(s,{},1/fps);
  expect(e.defeated).toBe(true);const score=s.score;let landedAt=null,landedX=null,crashes=0,seenDust=false;
  for(let i=0;i<fps*6&&s.enemies.includes(e);i++){
   stepAdventure(s,{},1/fps);expect(s.score).toBe(score);crashes+=s.events.filter(q=>q==='zeppelinCrash').length;
   if(e.landed){landedAt??=e.deathAge;landedX??=e.x;expect(e.x).toBe(landedX);expect(e.y).toBe(groundY(s.platforms,e.x));seenDust||=e.dustAge>.5;}
   else expect(s.enemies).toContain(e);
  }
  expect(crashes).toBe(1);expect(seenDust).toBe(true);expect(e.deathAge-landedAt).toBeGreaterThan(.8999);expect(e.deathAge-landedAt).toBeLessThan(.92);expect(s.enemies).not.toContain(e);expect(s.hostile).toHaveLength(0);
 }
});

test('the live painter shows smaller airborne enemies and ground dust dispersing to an empty landing',async({page})=>{
 fs.mkdirSync(artifacts,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/arcade');
 await page.evaluate(async()=>{
  const [{createAdventure,stepAdventure},{makeEnemy},{loadAdventureArt,renderAdventure}]=await Promise.all([import('/src/components/arcade/adventure/engine/adventureModel.js'),import('/src/components/arcade/adventure/actors/enemies/adventureEnemies.js'),import('/src/components/arcade/adventure/render/adventureCanvas.js')]);
  const art=await loadAdventureArt(),c=document.createElement('canvas');c.id='air-enemy-finish';c.style='position:fixed;inset:0;z-index:99999;width:1440px;height:810px';document.body.append(c);
  const s=createAdventure(1),e=s.enemies.find(e=>e.captive);for(const k of ['outposts','supplies','pickups','hazards','stars'])s[k]=[];
  const balloon=makeEnemy(420,315,2);balloon.timer=30;s.enemies=[e,balloon];Object.assign(e,{x:650,y:285,baseY:285,flightActive:true,timer:30});
  Object.assign(s.player,{x:500,y:480,ground:0});s.camera={x:0,y:0,zoom:1};renderAdventure(c,s,art);
  window.airFinish={art,c,s,e,renderAdventure,stepAdventure};
 });
 await page.locator('#air-enemy-finish').screenshot({path:artifacts+'smaller-air-enemies.jpg'});
 await page.evaluate(()=>{
  const {s,e,stepAdventure}=window.airFinish;s.enemies=[e];e.hp=1;s.shots=[{x:e.x,y:e.y-28,vx:0,vy:0,r:8,life:1,age:0,kind:-1,damage:2,hits:[]}];stepAdventure(s,{},1/120);
  for(let i=0;i<600&&!e.landed;i++)stepAdventure(s,{},1/120);if(!e.landed)throw new Error('The wreck did not reach the ground');
 });
 for(const age of [0,.3,.6,.85,1]){
  const state=await page.evaluate(age=>{const {s,e,c,art,renderAdventure,stepAdventure}=window.airFinish;while(e.dustAge<age&&s.enemies.includes(e))stepAdventure(s,{},1/120);s.camera={x:0,y:0,zoom:1};renderAdventure(c,s,art);return{dustAge:e.dustAge,present:s.enemies.includes(e)};},age);
  await page.locator('#air-enemy-finish').screenshot({path:artifacts+`dust-${age}.jpg`});
  if(age===1)expect(state.present).toBe(false);
 }
 expect(errors).toEqual([]);
});
