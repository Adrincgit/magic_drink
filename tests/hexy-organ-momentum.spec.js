import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {createAdventure,stepAdventure,playerBody} from '../src/components/arcade/adventure/engine/adventureModel';
import {updateBoss,bossTargets,makeEnemy} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {organMechanism,organBassMouth} from '../src/components/arcade/adventure/actors/bosses/organMechanism';
import {prepareOrganCharge} from '../src/components/arcade/adventure/actors/bosses/organCharge';
import {enemyGeometry,enemyBody,enemyMuzzle} from '../src/components/arcade/adventure/actors/enemies/adventureEnemyGeometry';
const artifacts='tests/artifacts/arcade/organ-momentum/';
const helpers={say:()=>{},particles:()=>{},body:playerBody};
function arena(gentle=false){const s=createAdventure(1,gentle),a=s.level.arena;for(const k of ['enemies','outposts','supplies','pickups','hazards','stars','cages'])s[k]=[];Object.assign(s.player,{x:a.left+420,y:a.y,ground:s.platforms.length-1});Object.assign(s.boss,{phase:'recover',timer:30,engaged:true,vulnerable:true});s.arenaLocked=true;return s;}

test('the central body takes real damage throughout musical preparation and firing in both phases',()=>{
 for(const transformed of [false,true])for(const phase of ['warn','attack'])for(const move of ['organ-fanfare','organ-chords','organ-bellows','organ-finale']){
  const s=arena(),b=s.boss;Object.assign(b,{transformed,phase,move,timer:2,shotClock:0,attackClock:0,volley:0,vulnerable:false});
  const t=bossTargets(s)[0],hp=b.hp;s.shots=[{x:t.x+t.w/2,y:t.y+t.h/2,vx:0,vy:0,r:8,life:1,age:0,kind:-1,damage:2,hits:[]}];stepAdventure(s,{},1/120);
  expect(b.hp).toBe(hp-2);expect(b.vulnerable).toBe(true);expect(b.flash).toBe(.3);expect(s.events).toContain('bossHit');expect(s.events).not.toContain('bossBlock');
 }
});

test('musical notes and bass grow smoothly from eighty percent to their full visible collision size',()=>{
 for(const fps of [60,120,240]){
  const s=arena(),b=s.boss;Object.assign(b,{phase:'attack',move:'organ-fanfare',timer:2,shotClock:0,attackClock:0,volley:1});updateBoss(s,1/fps,helpers);
  const shots=[...s.hostile];expect(shots.map(q=>q.kind)).toEqual(['note','sound-wave']);
  for(const q of shots)expect(q.r).toBeCloseTo(q.fullRadius*.8);
  Object.assign(b,{phase:'recover',timer:30});const previous=shots.map(q=>q.r);
  for(let i=0;i<fps*.5;i++){
   stepAdventure(s,{},1/fps);
   for(const [j,q]of shots.entries()){expect(q.r).toBeGreaterThanOrEqual(previous[j]);expect(q.r).toBeLessThanOrEqual(q.fullRadius);previous[j]=q.r;if(q.age>=.24)expect(q.r).toBe(q.fullRadius);}
  }
  for(const q of shots)expect(q.r).toBe(q.fullRadius);
 }
});

test('burnout lasts one extra second, spins eight turns, emits substantial dust and accelerates fifteen percent',()=>{
 for(const fps of [60,120,240])for(const mode of ['normal','phase-two','gentle']){
  const s=arena(mode==='gentle'),b=s.boss;Object.assign(b,{move:'organ-charge',transformed:mode==='phase-two'});prepareOrganCharge(s);
  expect(b.charge.warning).toBe(s.gentle?2.65:2.3);const origin=b.x,target=b.charge.target;let warning=0,rotation=0,dust=0,speed=0,stretch=0,shear=0;
  for(let i=0;i<fps*9&&b.charge;i++){
   const phase=b.phase;stepAdventure(s,{left:true},1/fps);const m=organMechanism(s);
   if(phase==='warn'){warning+=1/fps;if(b.phase==='warn')rotation=Math.max(rotation,Math.abs(m.wheels[0].angle));dust=Math.max(dust,(s.organDust||[]).length);}
   if(b.phase==='attack'){speed=Math.max(speed,-b.driveSpeed);stretch=Math.max(stretch,m.drive.sx);shear=Math.max(shear,m.drive.shear);expect(b.vulnerable).toBe(false);}
   if(b.charge)expect(b.charge.target).toBe(target);
   const still=organMechanism(s,true);expect(still.wheels[0].angle).toBe(0);expect(still.drive.sx).toBe(1);expect(still.drive.sy).toBe(1);expect(still.drive.shear).toBe(0);
  }
  expect(warning).toBeGreaterThanOrEqual(s.gentle?2.65:2.3);expect(rotation).toBeGreaterThan(47);expect(dust).toBeGreaterThan(35);
  expect(speed).toBeGreaterThan(mode==='gentle'?740:mode==='phase-two'?1160:1025);expect(stretch).toBeGreaterThan(1.075);expect(shear).toBeGreaterThan(.06);expect(origin-target).toBeGreaterThan(800);expect(b.charge).toBeNull();
 }
});

test('the second-phase rush reaches the left corner, hits an old safe spot and leaves room for a full retreat',()=>{
 for(const fps of [60,120,240])for(const retreat of [false,true]){
  const s=arena(),b=s.boss,a=s.level.arena;Object.assign(s.player,{x:a.left+(retreat?900:210)});Object.assign(b,{move:'organ-charge',transformed:true});prepareOrganCharge(s);
  const destination=b.charge.target,before=s.hearts;let furthest=b.x,retreatAt=null;
  expect(destination).toBe(a.left+250);
  for(let i=0;i<fps*9&&b.charge;i++){
   stepAdventure(s,retreat?{left:true}:{},1/fps);furthest=Math.min(furthest,b.x);
   if(b.phase==='recover')retreatAt??=s.player.x;
   if(b.charge)expect(b.charge.target).toBe(destination);
  }
  expect(furthest).toBe(destination);
  if(retreat){expect(s.hearts).toBe(before);expect(retreatAt).toBe(a.left+24);}else expect(s.hearts).toBeLessThan(before);
 }
});

test('the bass wave leaves the animated lower horn and descends continuously to the ground',()=>{
 for(const fps of [60,120,240])for(const transformed of [false,true]){
  const s=arena(),b=s.boss,a=s.level.arena;Object.assign(b,{transformed,phase:'attack',move:'organ-fanfare',timer:2,shotClock:.1,attackClock:0,volley:1});
  const preparing=organMechanism(s);expect(preparing.bassPreparing).toBe(true);expect(preparing.horns[0].rotation).toBeLessThan(0);
  b.shotClock=0;updateBoss(s,1/fps,helpers);const q=s.hostile.find(q=>q.kind==='sound-wave'),m=organMechanism(s),mouth=organBassMouth(s);
  expect(q.x).toBe(mouth.x);expect(q.y).toBe(mouth.y);expect(m.bassMouth).toEqual(m.horns[0].mouth);expect(q.y).toBeLessThan(a.y-80);
  Object.assign(b,{phase:'recover',timer:30});s.hostile=[q];let previous=q.y,grounded=false;
  for(let i=0;i<fps*.7;i++){
   stepAdventure(s,{},1/fps);expect(q.y).toBeGreaterThanOrEqual(previous);expect(q.y-previous).toBeLessThan(8);previous=q.y;
   grounded||=Math.abs(q.y-(q.floor-q.r-2))<.01;
  }
  expect(grounded).toBe(true);
 }
});

test('the red walking clown uses the smaller collision box and launches its attack from the smaller drawing',()=>{
 for(const dir of [-1,1]){
  const e=makeEnemy(300,480,0);e.dir=dir;const g=enemyGeometry(e),body=enemyBody(e),mouth=enemyMuzzle(e);
  expect(g.size).toBeCloseTo(125.8);expect(body.w).toBeCloseTo(54.4);expect(body.h).toBeCloseTo(77.35);
  expect(body.y+body.h).toBe(e.y);expect(mouth.x).toBeCloseTo(e.x+dir*45.05);expect(mouth.y).toBeCloseTo(e.y-48.45);
 }
});

test('the live painter shows projectile growth, burnout compression and the stretched moving body',async({page})=>{
 fs.mkdirSync(artifacts,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/arcade');
 await page.evaluate(async()=>{
  const [{createAdventure,stepAdventure},{loadAdventureArt,renderAdventure},{prepareOrganCharge},{updateBoss,makeEnemy}]=await Promise.all([import('/src/components/arcade/adventure/engine/adventureModel.js'),import('/src/components/arcade/adventure/render/adventureCanvas.js'),import('/src/components/arcade/adventure/actors/bosses/organCharge.js'),import('/src/components/arcade/adventure/actors/enemies/adventureEnemies.js')]);
  const art=await loadAdventureArt(),c=document.createElement('canvas');c.id='organ-momentum';c.style='position:fixed;inset:0;z-index:99999;width:1440px;height:810px';document.body.append(c);
  const clean=()=>{const s=createAdventure(1),a=s.level.arena;for(const k of ['enemies','outposts','supplies','pickups','hazards','stars','cages'])s[k]=[];Object.assign(s.player,{x:a.left+420,y:a.y,ground:s.platforms.length-1});Object.assign(s.boss,{phase:'recover',timer:30,engaged:true,vulnerable:true});s.arenaLocked=true;s.camera={x:a.right-1500,y:a.y-600,zoom:.64};return s;};
  window.organMomentum={art,c,clean,renderAdventure,stepAdventure,prepareOrganCharge,updateBoss,makeEnemy};
 });
 await page.evaluate(()=>{const {art,c,clean,renderAdventure,stepAdventure,prepareOrganCharge}=window.organMomentum,s=clean();s.boss.move='organ-charge';prepareOrganCharge(s);for(let i=0;i<252;i++)stepAdventure(s,{left:true},1/120);renderAdventure(c,s,art);window.organMomentum.rush=s;});
 await page.locator('#organ-momentum').screenshot({path:artifacts+'burnout.jpg'});
 await page.evaluate(()=>{const {art,c,renderAdventure,stepAdventure,rush:s}=window.organMomentum;for(let i=0;i<104;i++)stepAdventure(s,{left:true},1/120);renderAdventure(c,s,art);});
 await page.locator('#organ-momentum').screenshot({path:artifacts+'rush-body.jpg'});
 await page.evaluate(()=>{const {art,c,clean,renderAdventure,updateBoss}=window.organMomentum,s=clean();Object.assign(s.boss,{phase:'attack',move:'organ-fanfare',timer:2,shotClock:0,attackClock:0,volley:1});updateBoss(s,1/120,{say:()=>{},particles:()=>{},body:p=>({x:p.x-15,y:p.y-59,w:30,h:58})});renderAdventure(c,s,art);window.organMomentum.music=s;});
 await page.locator('#organ-momentum').screenshot({path:artifacts+'music-at-mouth.jpg'});
 await page.evaluate(()=>{const {art,c,renderAdventure,stepAdventure,music:s}=window.organMomentum;s.boss.phase='recover';s.boss.timer=30;for(let i=0;i<31;i++)stepAdventure(s,{},1/120);renderAdventure(c,s,art);});
 await page.locator('#organ-momentum').screenshot({path:artifacts+'music-grown.jpg'});
 await page.evaluate(()=>{const {art,c,clean,renderAdventure,updateBoss}=window.organMomentum,s=clean();Object.assign(s.boss,{phase:'attack',move:'organ-fanfare',timer:2,shotClock:.1,attackClock:0,volley:1});updateBoss(s,1/120,{say:()=>{},particles:()=>{},body:p=>({x:p.x-15,y:p.y-59,w:30,h:58})});renderAdventure(c,s,art);});
 await page.locator('#organ-momentum').screenshot({path:artifacts+'bass-preparation.jpg'});
 await page.evaluate(()=>{const {art,c,clean,renderAdventure,stepAdventure,prepareOrganCharge}=window.organMomentum,s=clean();Object.assign(s.boss,{transformed:true,move:'organ-charge'});s.player.x=s.level.arena.left+900;prepareOrganCharge(s);for(let i=0;i<800&&s.boss.phase!=='recover';i++)stepAdventure(s,{left:true},1/120);renderAdventure(c,s,art);});
 await page.locator('#organ-momentum').screenshot({path:artifacts+'second-phase-left-corner.jpg'});
 await page.evaluate(()=>{const {art,c,clean,renderAdventure,makeEnemy}=window.organMomentum,s=clean(),a=s.level.arena;s.boss.phase='sleep';Object.assign(s.player,{x:a.left+420,y:a.y,ground:s.platforms.length-1});s.enemies=[makeEnemy(a.left+620,a.y),makeEnemy(a.left+760,a.y,3)];s.enemies[0].dir=1;s.enemies[0].gait=.15;s.camera={x:a.left+260,y:a.y-440,zoom:1};renderAdventure(c,s,art);});
 await page.locator('#organ-momentum').screenshot({path:artifacts+'smaller-red-clown.jpg'});expect(errors).toEqual([]);
});
