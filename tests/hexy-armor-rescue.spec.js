import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import sharp from 'sharp';
import {createAdventure,stepAdventure,retryAdventure,playerBody} from '../src/components/arcade/adventure/engine/adventureModel';
import {updateEnemies,updateBoss,bossTargets} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {ZEPPELIN_HEIGHT,ZEPPELIN_WIDTH} from '../src/components/arcade/adventure/actors/enemies/adventureZeppelin';
import {groundY} from '../src/components/arcade/adventure/world/adventureTerrain';
import {burstBubble} from '../src/components/arcade/adventure/engine/adventureBubbles';
import {stepSuper} from '../src/components/arcade/adventure/engine/adventureSuper';
const helpers={say:()=>{},particles:()=>{},body:playerBody};
const artifacts='tests/artifacts/arcade/armor-rescue/';
function clean(){const s=createAdventure(1);for(const k of ['enemies','outposts','supplies','pickups','hazards','stars'])s[k]=[];return s;}
function arena(){const s=clean(),a=s.level.arena;s.cages=[];s.arenaLocked=true;Object.assign(s.player,{x:s.boss.x-330,y:a.y,ground:s.platforms.length-1});Object.assign(s.boss,{phase:'recover',timer:30,vulnerable:true,engaged:true});return s;}
function shot(x,y,heavy=false){return{x,y,vx:0,vy:0,r:heavy?25:8,life:1,age:0,kind:heavy?0:-1,heavy,damage:heavy?10:2,hits:[]};}

test('there are exactly three bunnies: two trail cages and one taller, higher zeppelin out of two',()=>{
 const s=createAdventure(1),ships=s.enemies.filter(e=>e.type===7);
 expect(s.cages).toHaveLength(3);expect(s.cages.filter(c=>!c.carried)).toHaveLength(2);
 expect(ships).toHaveLength(2);expect(ships.filter(e=>e.captive)).toHaveLength(1);
 expect(ships[0].captive).toBe(s.cages[1]);expect(ships[0].baseY).toBe(groundY(s.platforms,ships[0].home)-195);
 expect(ZEPPELIN_HEIGHT/ZEPPELIN_WIDTH).toBeGreaterThan(.69);expect(createAdventure(0).cages).toHaveLength(3);
});

test('defeating the carrier frees its bunny, which falls, joins Hexy once and stays rescued after retry',()=>{
 for(const fps of [60,120,240]){
  const s=createAdventure(1),e=s.enemies.find(e=>e.captive),c=e.captive;
  for(const k of ['outposts','supplies','pickups','hazards','stars'])s[k]=[];s.enemies=[e];
  Object.assign(s.player,{x:e.home-300,y:groundY(s.platforms,e.home-300),ground:1});s.camera.x=e.home-600;
  Object.assign(e,{flightActive:true,hp:1,timer:30});s.shots=[shot(e.x,e.y-50)];stepAdventure(s,{},1/fps);
  expect(c.carried).toBe(false);expect(c.open).toBe(true);expect(c.falling).toBe(true);expect(e.captive).toBeNull();expect(s.rescued).toBe(0);
  for(let i=0;i<fps*3&&c.falling;i++)stepAdventure(s,{},1/fps);
  expect(c.falling).toBe(false);expect(c.y).toBe(groundY(s.platforms,c.x));
  Object.assign(s.player,{x:c.x,y:c.y,ground:s.platforms.findIndex(p=>c.x>=p.x&&c.x<p.x+p.w),vy:0});stepAdventure(s,{},1/fps);
  expect(c.rescued).toBe(true);expect(s.rescued).toBe(1);const score=s.score;
  retryAdventure(s);expect(s.enemies.some(e=>e.captive)).toBe(false);expect(s.rescued).toBe(1);
  Object.assign(s.player,{x:c.x,y:c.y,ground:1});stepAdventure(s,{},1/fps);expect(s.rescued).toBe(1);expect(s.score).toBe(score);
 }
});

test('an escaping carrier permanently loses that rescue within the run, including a checkpoint retry',()=>{
 for(const fps of [60,120,240]){
  const s=createAdventure(1),e=s.enemies.find(e=>e.captive),c=e.captive;s.enemies=[e];
  Object.assign(s.player,{x:e.home-300,y:groundY(s.platforms,e.home-300)});s.camera.x=s.player.x-300;s.damage=()=>{};
  for(let i=0;i<fps*10&&s.enemies.includes(e);i++)updateEnemies(s,1/fps,playerBody,()=>{throw new Error('Escaping is not a defeat');});
  expect(e.escaped).toBe(true);expect(c.lost).toBe(true);expect(c.open).toBe(false);expect(s.rescued).toBe(0);expect(s.score).toBe(0);
  retryAdventure(s);expect(s.enemies.some(e=>e.captive)).toBe(false);expect(c.lost).toBe(true);
  const normal=s.cages.filter(c=>c.carrier===undefined);for(const q of normal){q.open=true;Object.assign(s.player,{x:q.x,y:q.y,ground:s.platforms.findIndex(p=>q.x>=p.x&&q.x<p.x+p.w)});stepAdventure(s,{},1/fps);}
  expect(s.rescued).toBe(2);
 }
});

test('ordinary and heavy shots rebound from either wheel with sparks, no damage and no flash',()=>{
 for(const heavy of [false,true])for(const side of [-1,1]){
  const s=arena(),b=s.boss;s.shots=[shot(b.x+108*side,b.y-40,heavy)];const hp=b.hp;stepAdventure(s,{},1/120);
  expect(b.hp).toBe(hp);expect(b.flash).toBe(0);expect(s.events).toContain('bossBlock');expect(s.events).not.toContain('bossHit');expect(s.events).not.toContain('bossHeavyHit');
  expect(s.effects.some(q=>q.armor)).toBe(true);expect(s.effects.some(q=>q.row===2)).toBe(false);
 }
 const s=arena(),b=s.boss,t=bossTargets(s)[0];b.vulnerable=false;s.shots=[shot(t.x+t.w/2,t.y+t.h/2)];stepAdventure(s,{},1/120);
 expect(b.hp).toBe(b.maxHp);expect(b.flash).toBe(0);expect(s.effects.some(q=>q.armor)).toBe(true);
});

test('standing horizontal fire hits armor, while firing during a real jump damages the central body',()=>{
 for(const fps of [60,120,240]){
  const s=arena(),b=s.boss,hp=b.hp;let blocked=false;
  for(let i=0;i<fps;i++){stepAdventure(s,{attack:true},1/fps);blocked||=s.events.includes('bossBlock');}
  expect(blocked).toBe(true);expect(b.hp).toBe(hp);expect(b.flash).toBe(0);
  for(let i=0;i<fps*2&&b.hp===hp;i++)stepAdventure(s,{attack:true,jump:i<fps*.3},1/fps);
  expect(b.hp).toBeLessThan(hp);expect(b.flash).toBeGreaterThan(0);
 }
});

test('bubble and super effects cannot damage the organ through a wheel-only intersection',()=>{
 const s=arena(),b=s.boss;
 const bubble={...shot(b.x-108,b.y-40),kind:3,captured:[{kind:'note'}]};s.shots=[bubble];stepAdventure(s,{},1/120);
 expect(bubble.armorBlocked).toBe(true);expect(b.hp).toBe(b.maxHp);expect(b.flash).toBe(0);expect(s.events).not.toContain('bubbleBurst');
 const low={x:b.x,y:b.y+5,scale:.5,captured:[{kind:'note'}]};burstBubble(s,low,()=>{});expect(b.hp).toBe(b.maxHp);
 const core=bossTargets(s)[0],high={x:b.x,y:core.y+core.h/2,captured:[{kind:'note'}]};burstBubble(s,high,()=>{});expect(b.hp).toBe(b.maxHp-2);
 b.hp=b.maxHp;b.flash=0;
 // Commit a low horizontal beam whose upper edge stops beneath the body.
 s.player.y=b.y+60;s.player.ground=null;
 s.superCinematic={age:.91,pulses:0,origin:{x:s.player.x,y:b.y+60},dir:1};
 stepSuper(s,1/120,{defeat:()=>{},particles:()=>{},burst:()=>{},say:()=>{}});expect(b.hp).toBe(b.maxHp);expect(b.flash).toBe(0);
});

test('larger notes and bass keep larger collision radii; every two phase-two front volleys fire three notes',()=>{
 for(const transformed of [false,true]){
  const s=arena(),b=s.boss;Object.assign(b,{transformed,hp:transformed?60:b.maxHp,phase:'attack',move:'organ-fanfare',timer:20,shotClock:0,attackClock:0,volley:0,frontVolley:0});
  let counts=[];
  for(let i=0;i<4;i++){s.hostile=[];b.shotClock=0;updateBoss(s,1/120,helpers);counts.push(s.hostile.filter(q=>q.kind==='note').length);
   for(const q of s.hostile){expect(q.drawSize).toBe(q.kind==='note'?(transformed?114:102):(transformed?136:122));const radius=q.kind==='note'?(transformed?29:26):(transformed?26:23);expect(q.fullRadius).toBe(radius);expect(q.r).toBeCloseTo(radius*.8);}
  }
  expect(counts).toEqual(transformed?[1,2,1,2]:[1,1,1,1]);
 }
});

test('the live renderer shows the taller carrier, free falling bunny, larger music and armor ricochet',async({page})=>{
 fs.mkdirSync(artifacts,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/arcade');
 await page.evaluate(async()=>{
  const [{createAdventure,stepAdventure},{loadAdventureArt,renderAdventure}]=await Promise.all([import('/src/components/arcade/adventure/engine/adventureModel.js'),import('/src/components/arcade/adventure/render/adventureCanvas.js')]);
  const art=await loadAdventureArt(),c=document.createElement('canvas');c.id='armor-rescue';c.style='position:fixed;inset:0;z-index:99999;width:1440px;height:810px';document.body.append(c);
  const s=createAdventure(1),e=s.enemies.find(e=>e.captive);for(const k of ['outposts','supplies','pickups','hazards','stars'])s[k]=[];s.enemies=[e];
  Object.assign(s.player,{x:500,y:480,ground:0});s.camera={x:0,y:0,zoom:1};Object.assign(e,{x:650,y:285,baseY:285,flightActive:true,timer:10});renderAdventure(c,s,art);
  window.armorReview={art,c,s,e,renderAdventure,stepAdventure,createAdventure};
 });
 await page.locator('#armor-rescue').screenshot({path:artifacts+'carrier.jpg'});
 await page.evaluate(()=>{const {s,e,c,art,renderAdventure,stepAdventure}=window.armorReview;e.hp=1;s.shots=[{x:e.x,y:e.y-50,vx:0,vy:0,r:8,life:1,age:0,kind:-1,damage:2,hits:[]}];stepAdventure(s,{},1/120);for(let i=0;i<48;i++)stepAdventure(s,{},1/120);renderAdventure(c,s,art);});
 await page.locator('#armor-rescue').screenshot({path:artifacts+'bunny-falling.jpg'});
 await page.evaluate(async()=>{
  const {c,art,renderAdventure,createAdventure,stepAdventure}=window.armorReview,s=createAdventure(1),a=s.level.arena,b=s.boss;for(const k of ['enemies','outposts','supplies','pickups','hazards','stars','cages'])s[k]=[];
  Object.assign(s.player,{x:b.x-500,y:a.y,ground:s.platforms.length-1});Object.assign(b,{phase:'recover',engaged:true,timer:30,vulnerable:true,transformed:true,armorBroken:true});s.arenaLocked=true;s.camera={x:a.right-1200,y:a.y-550,zoom:.8};
  s.shots=[{x:b.x-250,y:b.y-40,vx:510,vy:0,r:8,life:1,age:0,kind:-1,damage:2,hits:[]}];
  for(let i=0;i<150&&!s.effects.some(q=>q.armor);i++)stepAdventure(s,{},1/120);
  const {organProjectileSize}=await import('/src/components/arcade/adventure/actors/bosses/adventureOrganFortress.js'),size=organProjectileSize(s);
  s.effects.forEach(q=>{if(q.armor){q.age=.1;q.size=65;}});s.hostile=[{kind:'note',organ:true,voice:'red',x:b.x-300,y:a.y-120,vx:-240,vy:0,r:size.noteRadius,drawSize:size.note,age:.1,life:3},{kind:'sound-wave',x:b.x-350,y:a.y-28,vx:-355,vy:0,r:size.waveRadius,drawSize:size.wave,age:.15,life:3,floor:a.y}];
  renderAdventure(c,s,art);window.armorReview.boss=s;
  if(!s.effects.some(q=>q.armor)||b.hp!==b.maxHp||b.flash>0)throw new Error('Expected a real armor ricochet without boss damage or flash');
 });
 await page.locator('#armor-rescue').screenshot({path:artifacts+'armor-and-music.jpg'});expect(errors).toEqual([]);
 const meta=await sharp('public/arcade/sprites/effects/armor-ricochet.webp').metadata();expect(meta.hasAlpha).toBe(true);expect(meta.width).toBe(1024);expect(meta.height).toBe(256);
});
