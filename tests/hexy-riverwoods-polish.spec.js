import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import sharp from 'sharp';
import {createAdventure,stepAdventure,playerBody} from '../src/components/arcade/adventure/engine/adventureModel';
import {groundY,rootedSceneryPlacement} from '../src/components/arcade/adventure/world/adventureTerrain';
import {RIVER_TREE_ART} from '../src/components/arcade/adventure/world/riverTreeArt';
import {updateBoss,updateEnemies,makeEnemy} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {organMechanism,organPipes,organMouths,organBassMouth} from '../src/components/arcade/adventure/actors/bosses/organMechanism';
import {ORGAN_MOVES} from '../src/components/arcade/adventure/actors/bosses/adventureOrganFortress';
import {ZEPPELIN_TYPE,ZEPPELIN_SPEED,ZEPPELIN_SHOT_SPEED,zeppelinMuzzle} from '../src/components/arcade/adventure/actors/enemies/adventureZeppelin';
import {prepareBombardment} from '../src/components/arcade/adventure/actors/bosses/adventureBombardment';
import {balloonBombSocket,balloonLeakJets} from '../src/components/arcade/adventure/actors/bosses/balloonHatch';

const quiet=()=>{const s=createAdventure(1);for(const k of ['enemies','outposts','supplies','pickups','hazards','stars','cages'])s[k]=[];return s;};
const tick=(s,input={},frames=1)=>{for(let i=0;i<frames;i++)stepAdventure(s,input,1/120);};
const helpers={say:()=>{},particles:()=>{},body:playerBody};
const artifacts='tests/artifacts/arcade/riverwoods-polish/';

test('four distinct native tree cutouts alternate along the banks and their whole root footprint is planted',async()=>{
 const s=quiet(),trees=s.level.scenery.filter(p=>p.kind.startsWith('river-tree-'));
 expect(new Set(trees.map(p=>p.kind)).size).toBe(4);expect(trees.length).toBeGreaterThan(8);
 for(let i=1;i<trees.length;i++)expect(trees[i].kind).not.toBe(trees[i-1].kind);
 for(const prop of trees){
  const image=RIVER_TREE_ART[prop.kind],q=rootedSceneryPlacement(prop,s.platforms,image);
  for(let x=q.rootLeft;x<=q.rootRight;x+=2)expect(q.baseline-groundY(s.platforms,x)).toBeGreaterThanOrEqual(27.99);
  expect(q.x+image.rootX*q.w).toBeCloseTo(prop.x);
  const flipped=rootedSceneryPlacement({...prop,flip:true},s.platforms,image);
  expect(flipped.x+(1-image.rootX)*flipped.w).toBeCloseTo(prop.x);
  const file='public/arcade/maps/riverwoods/trees/'+prop.kind.slice(11)+'.webp';
  const meta=await sharp(file).metadata();expect(meta.hasAlpha).toBe(true);expect(meta.height).toBeGreaterThan(prop.h*2.5);
 }
 // An inverted slope and a crest inside the footprint also bury both ends.
 const image=RIVER_TREE_ART['river-tree-oak'],prop={...trees[0],x:500};
 for(const platforms of [[{x:0,w:1000,y:650,yEnd:480,kind:'earth'}],
  [{x:0,w:500,y:480,yEnd:650,kind:'earth'},{x:500,w:500,y:650,yEnd:480,kind:'earth'}]]){
  const q=rootedSceneryPlacement(prop,platforms,image);
  for(let x=q.rootLeft;x<=q.rootRight;x+=2)expect(q.baseline-groundY(platforms,x)).toBeGreaterThanOrEqual(27.99);
 }
});

test('the rolling organ moves its targets and projectile outlets together and notes have musical events',()=>{
 const s=quiet(),b=s.boss,a=s.level.arena;Object.assign(s.player,{x:a.left+200,y:a.y});s.damage=()=>{};
 Object.assign(b,{phase:'attack',move:'organ-chords',timer:4.5,shotClock:0,attackClock:0,volley:0});
 const positions=[],sounds=[];let last=b.x;
 for(let i=0;i<240;i++){
  s.events=[];s.hostile=[];updateBoss(s,1/120,helpers);positions.push(b.x);sounds.push(...s.events);
  expect(Math.abs(b.x-last)).toBeLessThan(2);last=b.x;
  const m=organMechanism(s);expect(m.body.x+170).toBe(b.x);
  for(const shot of s.hostile)expect((shot.rain?organPipes(s):organMouths(s)).some(q=>q.x===shot.x&&q.y===shot.y)).toBe(true);
 }
 expect(Math.max(...positions)-Math.min(...positions)).toBeGreaterThan(40);
 expect(sounds).toContain('organNotes');expect(sounds).toContain('organNotesHigh');expect(sounds).not.toContain('cannon');
 const advanced=b.x;Object.assign(b,{phase:'recover',timer:3});for(let i=0;i<240;i++)updateBoss(s,1/120,helpers);
 expect(b.x-advanced).toBeGreaterThan(40);
});

test('every organ volley launches music, with red front notes, bass waves and a fixed gap in the rain',()=>{
 for(const transformed of [false,true])for(const move of [...ORGAN_MOVES.filter(move=>move!=='organ-charge'),'organ-finale']){
  const s=quiet(),b=s.boss,a=s.level.arena;s.damage=()=>{};s.player.x=a.left+280;
  Object.assign(b,{hp:transformed?50:b.maxHp,transformed,phase:'attack',move,timer:5.8,shotClock:0,attackClock:0,volley:0,rainGap:s.player.x});
  const sounds=[];for(let i=0;i<500;i++){s.events=[];updateBoss(s,1/120,helpers);sounds.push(...s.events);}
  expect(s.hostile.length).toBeGreaterThan(0);expect(s.hostile.every(q=>['note','sound-wave'].includes(q.kind))).toBe(true);
  for(const q of s.hostile){if(q.kind==='sound-wave'){expect(q.drawSize).toBe(transformed?136:122);expect(q.vx).toBeLessThan(0);continue;}expect(q.drawSize).toBeGreaterThanOrEqual(68);if(!q.rain){expect(q.voice).toBe('red');expect(q.vx).toBeLessThan(0);}else expect(Math.abs(q.targetX-s.player.x)).toBeGreaterThan(transformed?50:70);}
  if(move==='organ-fanfare')expect(sounds).toContain('organFanfare');expect(sounds).not.toContain('cannon');
 }
 const s=quiet(),a=s.level.arena;s.player.x=a.left+180;s.player.y=a.y;s.boss.phase='recover';s.boss.timer=20;
 s.hostile=[{x:a.left+500,y:a.y+1,vx:-100,vy:10,gravity:125,floor:a.y,kind:'note',organ:true,voice:'red',r:17,life:3,age:0}];
 tick(s);expect(s.hostile).toHaveLength(0);expect(s.effects.some(q=>q.y===a.y-8)).toBe(true);
});

test('the circus zeppelin flies left to right and telegraphs fast red pellets from its front launcher',()=>{
 const original=createAdventure(1),e=original.enemies.find(q=>q.type===ZEPPELIN_TYPE),s=quiet();s.enemies=[e];s.damage=()=>{};
 expect(original.enemies.filter(q=>q.type===ZEPPELIN_TYPE)).toHaveLength(2);
 for(let type=0;type<ZEPPELIN_TYPE;type++)expect(e.hp).toBeGreaterThan(makeEnemy(0,0,type).hp);
 s.player.x=e.home-500;s.player.y=groundY(s.platforms,s.player.x);s.camera.x=s.player.x-300;
 const shots=[];let warning=false,previous,travel=0;
 for(let i=0;i<600;i++){
  s.events=[];const count=s.hostile.length;updateEnemies(s,1/120,playerBody,()=>{});warning||=e.phase==='windup';
  if(previous!==undefined){expect(e.x-previous).toBeCloseTo(ZEPPELIN_SPEED/120);travel+=e.x-previous;}
  previous=e.x;expect(e.dir).toBe(1);expect(Math.abs(e.y-e.baseY)).toBeLessThanOrEqual(5);
  for(const q of s.hostile.slice(count)){shots.push(q);expect(q.x).toBeCloseTo(zeppelinMuzzle(e).x);expect(q.y).toBeCloseTo(zeppelinMuzzle(e).y);expect(Math.hypot(q.vx,q.vy)).toBeCloseTo(ZEPPELIN_SHOT_SPEED);expect(q.vx).toBeGreaterThan(0);expect(s.events).toContain('zeppelinShot');}
 }
 expect(warning).toBe(true);expect(travel).toBeGreaterThan(1000);expect(shots.length).toBeGreaterThan(0);expect(shots.every(q=>q.kind==='red-pellet'&&q.r===7&&q.life===3.2)).toBe(true);
});

test('balloon bomb doors open before both passes, drops leave the underside, and the broken envelope vents air',()=>{
 const s=createAdventure(0),b=s.boss,a=s.level.arena;s.damage=()=>{};s.enemies=[];s.player.x=a.left+300;s.camera.x=a.left;
 Object.assign(b,{phase:'warn',move:'bombing-run',hp:50,transformed:true,engaged:true});prepareBombardment(s);
 const openings=[],passes=new Set();
 for(let i=0;i<650;i++){
  s.events=[];const before=s.hostile.length;updateBoss(s,1/120,helpers);openings.push(...s.events.filter(e=>e==='hatchOpen'));
  for(const q of s.hostile.slice(before).filter(q=>q.carpet)){expect(b.hatchOpen).toBeGreaterThan(.95);expect(q.y).toBe(balloonBombSocket(s).y);expect(Math.abs(q.x-b.x)).toBeLessThan(8);passes.add(b.bombRun.pass);}
 }
 expect(openings).toHaveLength(1);expect([...passes].sort()).toEqual([0,1]);expect(b.hatchOpen).toBeLessThan(.05);
 const vents=balloonLeakJets(s);expect(vents).toHaveLength(2);expect(vents[0].x).toBe(b.x-104);expect(vents[1].y).toBe(b.y-252);
 const fresh=createAdventure(0);fresh.damage=()=>{};fresh.player.x=fresh.level.arena.entry;Object.assign(fresh.boss,{phase:'recover',timer:2,hp:fresh.boss.maxHp/2});updateBoss(fresh,1/120,helpers);expect(fresh.events).toContain('balloonLeak');
});

for(const superAttack of [false,true])test(`ordinary and super finishers shatter the machine before victory: ${superAttack}`,()=>{
 const s=quiet(),b=s.boss,a=s.level.arena;Object.assign(s.player,{x:a.left+200,y:a.y,ground:s.platforms.length-1});
 Object.assign(b,{hp:superAttack?8:1,engaged:true,phase:'recover',timer:4,vulnerable:true,transformed:true,armorBroken:true});s.arenaLocked=true;
 if(superAttack)tick(s,{super:true});else{s.shots=[{x:b.x,y:a.y-160,vx:0,vy:0,r:10,life:1,age:0,kind:-1,damage:2,hits:[]}];tick(s);}
 let destructionSounds=0,blasts=0,clatters=0,sawPieces=false,sawBeforeVictory=false;
 for(let i=0;i<1800&&!s.done;i++){
  tick(s);destructionSounds+=s.events.filter(e=>e==='organDestroy').length;
  blasts+=s.events.filter(e=>e==='organBlast').length;clatters+=s.events.filter(e=>e==='organClatter').length;
  if(b.shattered){sawPieces||=(s.organDebris||[]).length>=20;sawBeforeVictory||=!s.clear;}
 }
 expect(destructionSounds).toBe(1);expect(sawPieces&&sawBeforeVictory).toBe(true);
 expect(blasts).toBe(2);expect(clatters).toBeGreaterThanOrEqual(3);
 expect(b.shattered).toBe(true);expect(b.defeat.ready).toBe(true);expect(s.score).toBe(60);
 expect(s.organDebris).toHaveLength(0);expect(s.won).toBe(true);
});

test('musical, steam and break effects render non-silent unclipped audio and obey mute',async({page})=>{
 await page.goto('/arcade');
 const audio=await page.evaluate(async()=>{
  const Native=window.AudioContext,report=[];
  try{
   for(const [i,kind] of ['organNotes','organNotesHigh','organSteam','organBreak','organDestroy','organBlast','organClatter','organFanfare','zeppelinShot','balloonLeak','hatchOpen','muted'].entries()){
    const offline=new OfflineAudioContext(1,96000,48000);offline.resume=()=>Promise.resolve();
    window.AudioContext=function(){return offline;};
    const sound=await import('/src/components/arcade/shared/audio/sounds.js?circus-audio='+i);
    if(kind==='muted')sound.muteArcadeSounds(true);
    sound.arcadeSound(kind==='muted'?'organNotes':kind);
    const buffer=await offline.startRendering(),data=buffer.getChannelData(0);let sum=0,peak=0;
    for(const n of data){sum+=n*n;peak=Math.max(peak,Math.abs(n));}
    report.push({kind,rms:Math.sqrt(sum/data.length),peak});
   }
  }finally{window.AudioContext=Native;}
  return report;
 });
 for(const q of audio.filter(q=>q.kind!=='muted')){expect(q.rms).toBeGreaterThan(.001);expect(q.peak).toBeLessThan(.65);}
 expect(audio.at(-1).peak).toBe(0);
 fs.mkdirSync(artifacts,{recursive:true});fs.writeFileSync(artifacts+'audio.json',JSON.stringify(audio,null,2));
});

test('the live renderer shows the zeppelin, red music, bomb hatch and moving bridge water',async({page})=>{
 fs.mkdirSync(artifacts,{recursive:true});await page.setViewportSize({width:1440,height:900});await page.goto('/arcade');
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.evaluate(async()=>{
  const [{createAdventure},{loadAdventureArt,renderAdventure},{drawRiverWater},{groundY},{makeEnemy},{drawBalloonDetails}]=await Promise.all([
   import('/src/components/arcade/adventure/engine/adventureModel.js'),import('/src/components/arcade/adventure/render/adventureCanvas.js'),
   import('/src/components/arcade/adventure/render/adventureRiverCanvas.js'),import('/src/components/arcade/adventure/world/adventureTerrain.js'),
   import('/src/components/arcade/adventure/actors/enemies/adventureEnemies.js'),import('/src/components/arcade/adventure/render/balloonDetailsCanvas.js')]);
  const art=await loadAdventureArt(),c=document.createElement('canvas');c.id='extra-circus';c.style='position:fixed;inset:0;z-index:99999;width:1440px;height:810px';document.body.append(c);
  const clean=index=>{const s=createAdventure(index);for(const k of ['enemies','outposts','supplies','pickups','hazards','stars','cages'])s[k]=[];return s;};
  window.extraCircus={clean,c,art,renderAdventure,drawRiverWater,drawBalloonDetails};
  const s=clean(1);s.player.x=3930;s.player.y=groundY(s.platforms,s.player.x);s.player.ground=3;s.camera={x:3510,y:200,zoom:1};s.time=2;
  const e=makeEnemy(3750,440,7);Object.assign(e,{flightActive:true,phase:'windup',clock:2,action:.2});s.enemies=[e];
  s.hostile=[{x:3910,y:475,kind:'red-pellet',drawSize:18,life:2,r:7,age:0,vx:190,vy:150}];renderAdventure(c,s,art);window.extraCircus.river=s;
 });
 await page.locator('#extra-circus').screenshot({path:artifacts+'zeppelin-bridge.jpg'});
 const water=await page.evaluate(()=>{
  const {river:s,art,drawRiverWater}=window.extraCircus,c=document.createElement('canvas');c.width=850;c.height=340;const ctx=c.getContext('2d');
  const frame=(time,reduced)=>{s.time=time;ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,c.width,c.height);ctx.translate(-s.level.rivers[0].x,-s.level.rivers[0].y+75);drawRiverWater(ctx,s,art,reduced);return new Uint8Array(ctx.getImageData(0,0,c.width,c.height).data);};
  const a=frame(0,false),b=frame(1,false),still=frame(0,true),later=frame(10,true);let moving=0,frozen=0;
  for(let i=0;i<a.length;i+=4){if(a[i]!==b[i]||a[i+1]!==b[i+1]||a[i+2]!==b[i+2])moving++;if(still[i]!==later[i]||still[i+1]!==later[i+1]||still[i+2]!==later[i+2])frozen++;}
  return{moving,frozen};
 });
 expect(water.moving).toBeGreaterThan(20000);expect(water.frozen).toBe(0);
 for(const open of [false,true]){
  await page.evaluate(open=>{const {clean,c,art,renderAdventure}=window.extraCircus,s=clean(0),a=s.level.arena;Object.assign(s.player,{x:a.left+190,y:a.y,ground:s.platforms.length-1});Object.assign(s.boss,{phase:'attack',move:'bombing-run',engaged:true,transformed:true,hatchOpen:open?1:0,x:a.left+560,y:a.y-70});s.camera={x:a.left,y:a.y-590,zoom:.85};s.time=1.4;if(open)s.hostile=[{x:s.boss.x,y:s.boss.y+42,kind:'bomb',carpet:true,life:2,r:18,drawSize:52.8,age:0,vx:0,vy:80}];renderAdventure(c,s,art);},open);
  await page.locator('#extra-circus').screenshot({path:artifacts+(open?'balloon-hatch-open':'balloon-hatch-closed')+'.jpg'});
 }
 await page.evaluate(()=>{const {clean,c,art,renderAdventure}=window.extraCircus,s=clean(1),a=s.level.arena;Object.assign(s.player,{x:a.left+240,y:a.y,ground:s.platforms.length-1});Object.assign(s.boss,{phase:'attack',move:'organ-fanfare',engaged:true,release:.2,activeMouth:1});s.camera={x:a.right-1040,y:a.y-500,zoom:1};s.time=2;s.hostile=[0,1,2].map(i=>({x:s.boss.x-195-i*115,y:a.y-65-i*64,kind:'note',organ:true,voice:'red',life:3,r:17,drawSize:68,age:i*.1,vx:-240,vy:-50}));renderAdventure(c,s,art);});
 await page.locator('#extra-circus').screenshot({path:artifacts+'red-musical-notes.jpg'});
 expect(errors).toEqual([]);
});

test('production renderer shows planted trees on both slopes and the mechanical destruction stages',async({page})=>{
 fs.mkdirSync(artifacts,{recursive:true});await page.setViewportSize({width:1440,height:900});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/arcade');
 await page.evaluate(async()=>{
  const [{createAdventure,stepAdventure,playerBody},{loadAdventureArt,renderAdventure},{groundY,groundAt},{updateBoss},{drawOrgan},{drawOrganDebris}]=await Promise.all([
   import('/src/components/arcade/adventure/engine/adventureModel.js'),import('/src/components/arcade/adventure/render/adventureCanvas.js'),
   import('/src/components/arcade/adventure/world/adventureTerrain.js'),import('/src/components/arcade/adventure/actors/enemies/adventureEnemies.js'),
   import('/src/components/arcade/adventure/render/organCanvas.js'),import('/src/components/arcade/adventure/render/organEffectsCanvas.js')]);
  const art=await loadAdventureArt(),s=createAdventure(1),c=document.createElement('canvas');c.id='river-polish';
  c.style='position:fixed;inset:0;z-index:99999;width:1440px;height:810px';document.body.append(c);
  for(const key of ['enemies','hazards','outposts','stars','supplies','pickups','cages'])s[key]=[];s.rescued=3;
  window.circusReview={s,c,art,createAdventure,stepAdventure,playerBody,renderAdventure,groundY,groundAt,updateBoss,drawOrgan,drawOrganDebris};
 });
 for(const [name,x] of [['oak',900],['birch-slope',1960],['hawthorn-slope',2470],['willow-slope',2990],['second-slope',6530],['bridge',3930]]){
  await page.evaluate(x=>{const {s,c,art,renderAdventure,groundY,groundAt}=window.circusReview;s.player.x=x;s.player.y=groundY(s.platforms,x);s.player.ground=s.platforms.indexOf(groundAt(s.platforms,x));s.camera={x:x-300,y:s.player.y-410,zoom:1};renderAdventure(c,s,art,{reduced:true});},x);
  await page.locator('#river-polish').screenshot({path:artifacts+name+'.jpg'});
 }
 await page.setViewportSize({width:1800,height:1380});
 await page.evaluate(()=>{
  const {c,art,createAdventure,stepAdventure,playerBody,updateBoss,drawOrgan,drawOrganDebris}=window.circusReview;
  c.width=1800;c.height=1380;c.style.width='1800px';c.style.height='1380px';const ctx=c.getContext('2d');ctx.fillStyle='#284b48';ctx.fillRect(0,0,1800,1380);ctx.font='24px sans-serif';
  for(let i=0;i<6;i++){
   const s=createAdventure(1),a=s.level.arena,b=s.boss,x=i%3*600,y=Math.floor(i/3)*690;
   for(const key of ['enemies','hazards','outposts','stars','supplies','pickups','cages'])s[key]=[];
   Object.assign(s.player,{x:a.left+200,y:a.y,ground:s.platforms.length-1});s.damage=()=>{};
   Object.assign(b,{phase:'recover',timer:4,engaged:true});
   if(i===1){Object.assign(b,{phase:'attack',move:'organ-chords',timer:4,shotClock:0,attackClock:0,volley:0});for(let n=0;n<110;n++){s.time+=1/120;updateBoss(s,1/120,{say:()=>{},particles:()=>{},body:playerBody});}}
   if(i>=2){b.hp=b.maxHp/2;for(let n=0;n<170;n++)stepAdventure(s,{},1/120);}
   if(i>=3){Object.assign(b,{hp:0,transformed:true,armorBroken:true});for(let n=0;n<(i===3?25:i===4?80:350);n++)stepAdventure(s,{},1/120);}
   ctx.fillStyle='#fff1bd';ctx.fillText(['Emblema del circo','Avance y vapor','Panel roto','Explosión','Piezas separadas','Máquina retirada'][i],x+24,y+35);
   ctx.save();ctx.beginPath();ctx.rect(x,y+45,600,645);ctx.clip();ctx.translate(x+320,y+650);ctx.scale(1.25,1.25);ctx.translate(-b.x,-a.y);
   drawOrgan(ctx,s,art);drawOrganDebris(ctx,s,art);ctx.restore();
  }
 });
 await page.locator('#river-polish').screenshot({path:artifacts+'circus-destruction.jpg'});
 await page.setViewportSize({width:1440,height:900});
 await page.evaluate(()=>{
  const {c,art,createAdventure,playerBody,updateBoss,renderAdventure}=window.circusReview,s=createAdventure(1),a=s.level.arena;
  for(const key of ['enemies','hazards','outposts','stars','supplies','pickups','cages'])s[key]=[];
  Object.assign(s.player,{x:a.left+250,y:a.y,ground:s.platforms.length-1,cast:.24,firing:true});s.damage=()=>{};
  Object.assign(s.boss,{phase:'attack',move:'organ-chords',transformed:true,armorBroken:true,timer:4,shotClock:0,attackClock:0,volley:0});
  s.camera={x:a.right-1060,y:a.y-495,zoom:1};
  for(let i=0;i<110;i++){s.time+=1/120;updateBoss(s,1/120,{say:()=>{},particles:()=>{},body:playerBody});}
  c.style.width='1440px';c.style.height='810px';renderAdventure(c,s,art);
 });
 await page.locator('#river-polish').screenshot({path:artifacts+'circus-gameplay.jpg'});
 expect(errors).toEqual([]);
});
