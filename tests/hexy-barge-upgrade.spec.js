import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {createAdventure,stepAdventure,retryAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {bargeRig,bargeTargets} from '../src/components/arcade/adventure/actors/bosses/adventureBarge';
import {bargeParts} from '../src/components/arcade/adventure/actors/bosses/bargeSystems';
import {hexyPose} from '../src/components/arcade/adventure/actors/hexy/hexyAnimation';
const tick=(s,n,input={})=>{for(let i=0;i<n;i++)stepAdventure(s,input,1/120);};
function battle(){
 const s=createAdventure(2),a=s.level.arena;for(const k of ['enemies','stars','supplies','outposts','hazards','cages'])s[k]=[];
 Object.assign(s.player,{x:a.left+650,y:a.y,ground:s.platforms.findIndex(q=>q.x===a.left),hurt:100});
 Object.assign(s.boss,{phase:'recover',engaged:true,vulnerable:true,timer:50});s.arenaLocked=true;return s;
}
function hitPart(s,part,damage,captured){while(s.hitStop>0)tick(s,1);const t=bargeTargets(s).find(t=>t.part===part);expect(t).toBeTruthy();s.shots.push({x:t.x+t.w/2,y:t.y+t.h/2,vx:0,vy:0,r:10,kind:captured?3:-1,heavy:!!captured,damage,age:0,life:1,hits:[],captured});tick(s,1);}

test('parts break from localized hits, change attacks and reset on retry',()=>{
 const s=battle(),parts=bargeParts(s),tankHP=parts.tank.hp;
 hitPart(s,'drum',40);expect(parts.drum.hp).toBe(40);expect(parts.tank.hp).toBe(tankHP);expect(s.boss.hp).toBe(280);
 hitPart(s,'drum',40);expect(parts.drum.hp).toBe(0);expect(s.boss.armorBroken).toBe(true);expect(s.events).toContain('bargeDrumBreak');
 const moves=new Set();s.boss.timer=0;
 for(let i=0;i<4500;i++){stepAdventure(s,{},1/120);if(s.boss.phase==='warn')moves.add(s.boss.move);}
 expect(moves.has('drumroll')).toBe(false);expect(moves.has('jet')).toBe(true);
 retryAdventure(s);expect(bargeParts(s).drum.hp).toBe(80);expect(bargeParts(s).tank.hp).toBe(96);expect(s.player.knockdown).toBeNull();
});

test('half health changes the phase without destroying untouched equipment',()=>{
 const s=battle();s.boss.hp=150;tick(s,270);expect(s.boss.transformed).toBe(true);expect(bargeParts(s).drum.hp).toBe(80);expect(s.boss.armorBroken).toBeFalsy();
});

test('destroying both weapons leaves a hittable core and a winnable battle',()=>{
 const s=battle();hitPart(s,'drum',80);hitPart(s,'tank',96);tick(s,270);
 expect(s.boss.hp).toBe(144);expect(bargeTargets(s).map(q=>q.part)).toEqual(['core']);
 s.boss.phase='recover';s.boss.timer=50;
 // Fire horizontally from the real player wand height, outside the hull.
 for(let i=0;i<20&&s.boss.hp>0;i++){
  s.shots.push({x:s.boss.x-420,y:s.level.arena.y-40,vx:620,vy:0,r:10,kind:-1,damage:12,age:0,life:2,hits:[]});tick(s,120);
 }
 expect(s.boss.hp).toBe(0);tick(s,600);expect(s.boss.defeat.ready).toBe(true);expect(s.clear).toBeTruthy();
});

test('the intake fills before a dedicated nozzle fires; breaking the tank stops the stream',()=>{
 const s=battle();Object.assign(s.boss,{phase:'warn',move:'jet',timer:1.6,tankFill:0});tick(s,90);
 expect(s.boss.tankFill).toBeGreaterThan(.43);expect(s.boss.tankFill).toBeLessThan(.7);expect(s.hostile.some(q=>q.kind==='barge-jet')).toBe(false);
 tick(s,160);const jet=s.hostile.find(q=>q.kind==='barge-jet'),m=bargeRig(s);expect(jet).toBeTruthy();expect(jet.x).toBeCloseTo(m.jetMuzzle.x);expect(Math.abs(jet.x-m.muzzle.x)).toBeGreaterThan(90);expect(s.boss.tankFill).toBeLessThan(.9);
 hitPart(s,'tank',96);expect(bargeParts(s).tank.hp).toBe(0);expect(jet.emission).toBeLessThanOrEqual(jet.age);expect(s.boss.tankFill).toBe(0);tick(s,160);expect(s.hostile.some(q=>q.kind==='barge-jet'&&q.life>0)).toBe(false);
 s.boss.timer=0;const moves=new Set();for(let i=0;i<4500;i++){stepAdventure(s,{},1/120);if(s.boss.phase==='warn')moves.add(s.boss.move);}expect(moves.has('jet')).toBe(false);
});

test('a captured water balloon jams charging pressure and creates a punish window',()=>{
 const s=battle();Object.assign(s.boss,{phase:'warn',move:'jet',timer:1,tankFill:.3});
 hitPart(s,'tank',4,[{kind:'barge-balloon',water:true,barge:true}]);expect(s.boss.pressureStun).toBeGreaterThan(2);expect(s.boss.phase).toBe('recover');expect(s.events).toContain('bargePressureJam');expect(s.hostile.some(q=>q.kind==='barge-jet')).toBe(false);
});

test('drum attacks create air pressure and sound reactions instead of water or gold hoops',()=>{
 const s=battle();Object.assign(s.boss,{phase:'warn',move:'drumroll',timer:.001});tick(s,35);
 expect(s.hostile.some(q=>q.kind==='barge-sonic')).toBe(true);expect(s.hostile.some(q=>q.kind==='barge-hoop')).toBe(false);
 const q=s.hostile.find(q=>q.kind==='barge-sonic');Object.assign(q,{x:s.player.x+10,y:s.player.y-30,vx:-20,vy:0});s.player.hurt=0;tick(s,1);
 expect(s.player.hitType).toBe('sound');expect(hexyPose(s)).toEqual({sheet:'element-hits',frame:8});expect(s.events).toContain('hitSound');
});

test('elemental impacts use distinct poses and push away from the attacker regardless of facing',()=>{
 for(const [kind,extra,type,row]of [['water-bolt',{water:true},'water',0],['harlequin-ember',{},'fire',4],['barge-sonic',{barge:true},'sound',8]])for(const dir of [-1,1]){
  const s=battle();Object.assign(s.player,{hurt:0,dir});s.hostile=[{x:s.player.x+8,y:s.player.y-30,vx:-50,vy:0,kind,r:18,life:2,age:0,...extra}];tick(s,1);
  expect(s.player.hitType).toBe(type);expect(s.player.vx).toBeLessThan(0);expect(hexyPose(s)).toEqual({sheet:type==='fire'?'fire-hit':'element-hits',frame:type==='fire'?0:row});
 }
});

test('heavy water hits land, get up and protect recovery while ordinary droplets never knock down',()=>{
 const s=battle();s.player.hurt=0;s.hostile=[{kind:'barge-surf',barge:true,x:s.player.x+15,y:s.player.y-40,floor:s.player.y,drawSize:178,r:55,vx:-60,vy:0,life:3,age:0}];tick(s,1);
 expect(s.player.knockdown.stage).toBe('air');const hp=s.hearts,poses=new Set();
 for(let i=0;i<180;i++){
  s.hostile.push({kind:'water-bolt',water:true,x:s.player.x,y:s.player.y-25,vx:0,vy:0,r:10,life:.02,age:0});
  tick(s,1,{attack:true,jump:true,dash:true,right:true});poses.add(hexyPose(s).sheet+':'+hexyPose(s).frame);
 }
 expect(s.hearts).toBe(hp);expect(poses.has('knockdown:3')).toBe(true);expect(poses.has('knockdown:6')).toBe(true);expect(s.player.knockdown).toBeNull();
 s.hostile=[];tick(s,70);s.player.hurt=0;s.hostile=[{kind:'water-bolt',water:true,x:s.player.x,y:s.player.y-25,vx:0,vy:0,r:10,life:1,age:0}];tick(s,1);expect(s.player.knockdown).toBeNull();
});

test('float plane stays separate from the walking bridge and death waits for the crew escape',()=>{
 const s=battle(),m=bargeRig(s);s.level={...s.level,arena:{...s.level.arena,y:s.level.arena.y+25}};expect(bargeRig(s).body).toEqual(m.body);
 s.level={...s.level,arena:{...s.level.arena,y:s.level.arena.y-25}};
 s.boss.hp=1;s.boss.transformed=true;hitPart(s,'drum',2);expect(s.boss.hp).toBe(0);expect(s.events).not.toContain('bossDown');tick(s,90);expect(s.boss.shattered).toBeFalsy();expect(s.clear).toBeFalsy();
 tick(s,120);expect(s.boss.shattered).toBe(true);expect(s.clear).toBeFalsy();let victories=0;for(let i=0;i<400;i++){tick(s,1);victories+=s.events.filter(e=>e==='bossDown').length;}expect(victories).toBe(1);expect(s.boss.defeat.ready).toBe(true);expect(s.clear).toBeTruthy();
});

test('upgraded machinery and every impact pose render in the live game',async({page})=>{
 const folder='tests/artifacts/arcade/barge-upgrade/';fs.mkdirSync(folder,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/arcade',{waitUntil:'domcontentloaded'});
 await page.evaluate(async()=>{
  const [{createAdventure,stepAdventure},{loadAdventureArt,renderAdventure},{followAdventureCamera},{bargeParts},{beginHitReaction}]=await Promise.all([import('/src/components/arcade/adventure/engine/adventureModel.js'),import('/src/components/arcade/adventure/render/adventureCanvas.js'),import('/src/components/arcade/adventure/render/adventureCamera.js'),import('/src/components/arcade/adventure/actors/bosses/bargeSystems.js'),import('/src/components/arcade/adventure/engine/adventureHitReactions.js')]);
  const art=await loadAdventureArt(),s=createAdventure(2),c=document.createElement('canvas');c.id='upgrade-review';c.style='position:fixed;inset:0;z-index:99999;width:1440px;height:810px';document.body.append(c);
  for(const k of ['enemies','stars','supplies','outposts','hazards','cages'])s[k]=[];s.noticeTime=0;s.arenaLocked=true;
  Object.assign(s.player,{x:s.level.arena.left+500,y:s.level.arena.y,ground:s.platforms.findIndex(q=>q.x===s.level.arena.left),hurt:100});Object.assign(s.boss,{phase:'warn',move:'jet',timer:1.6,engaged:true,vulnerable:true});
  for(let i=0;i<500;i++)followAdventureCamera(s,1/120);
  const paint=()=>renderAdventure(c,s,art);window.upgrade={s,c,art,paint,stepAdventure,bargeParts,beginHitReaction};paint();
 });
 const shot=async name=>page.locator('#upgrade-review').screenshot({path:folder+name+'.jpg'});
 await shot('empty-tank');await page.evaluate(()=>{const w=window.upgrade;for(let i=0;i<140;i++)w.stepAdventure(w.s,{},1/120);w.paint();});await shot('charging');
 await page.evaluate(()=>{const w=window.upgrade;for(let i=0;i<85;i++)w.stepAdventure(w.s,{},1/120);w.paint();});await shot('water-gun');
 await page.evaluate(()=>{const w=window.upgrade;Object.assign(w.s.boss,{phase:'warn',move:'drumroll',timer:.001});w.s.hostile=[];for(let i=0;i<200;i++)w.stepAdventure(w.s,{},1/120);w.paint();});await shot('sound-pressure');
 await page.evaluate(()=>{const w=window.upgrade,p=w.bargeParts(w.s);p.drum.hp=p.tank.hp=0;w.s.boss.armorBroken=true;w.s.hostile=[];w.paint();});await shot('broken-parts');
 for(const type of ['water','fire','sound']){await page.evaluate(type=>{const w=window.upgrade;w.s.player.hurt=0;w.beginHitReaction(w.s,{element:type,x:w.s.player.x+40});w.paint();},type);await shot('hit-'+type);}
 await page.evaluate(()=>{const w=window.upgrade;w.s.player.hitReact=0;w.s.player.knockdown={stage:'ground',groundAge:.3};w.paint();});await shot('getting-up');
 await page.evaluate(()=>{const w=window.upgrade;w.s.boss.hp=0;for(let i=0;i<140;i++)w.stepAdventure(w.s,{},1/120);w.paint();});await shot('evacuation');
 const movie=await page.evaluate(async()=>{
  const w=window.upgrade,{createAdventure}=await import('/src/components/arcade/adventure/engine/adventureModel.js');
  const s=createAdventure(2);w.s=s;for(const k of ['enemies','stars','supplies','outposts','hazards','cages'])s[k]=[];
  Object.assign(s.player,{x:s.level.arena.left+560,y:s.level.arena.y,ground:s.platforms.findIndex(q=>q.x===s.level.arena.left),hurt:100});
  Object.assign(s.boss,{phase:'warn',move:'jet',timer:1.6,engaged:true,vulnerable:true});s.arenaLocked=true;s.noticeTime=0;
  const {renderAdventure}=await import('/src/components/arcade/adventure/render/adventureCanvas.js');
  const {followAdventureCamera}=await import('/src/components/arcade/adventure/render/adventureCamera.js');for(let i=0;i<500;i++)followAdventureCamera(s,1/120);
  const stream=w.c.captureStream(30),recorder=new MediaRecorder(stream,{mimeType:'video/webm'}),parts=[];recorder.ondataavailable=e=>parts.push(e.data);recorder.start();
  const frames=[];let n=0;
  await new Promise(resolve=>{const animate=()=>{
   if(n===120)Object.assign(s.boss,{phase:'warn',move:'drumroll',timer:.5});
   if(n===220)w.beginHitReaction(s,{element:'water',heavyImpact:true,x:s.player.x+80});
   if(n===320){const p=w.bargeParts(s);p.drum.hp=p.tank.hp=0;s.boss.armorBroken=true;}
   if(n===365){s.boss.hp=0;s.hostile=[];}
   for(let i=0;i<4;i++)w.stepAdventure(s,{},1/120);renderAdventure(w.c,s,w.art);
   if([25,55,85,135,170,225,247,267,285,325,380,403,428,450,485].includes(n))frames.push({n,png:w.c.toDataURL('image/png').split(',')[1]});
   if(++n<515)requestAnimationFrame(animate);else resolve();
  };requestAnimationFrame(animate);});
  await new Promise(resolve=>{recorder.onstop=resolve;recorder.stop();});for(const track of stream.getTracks())track.stop();const bytes=new Uint8Array(await new Blob(parts).arrayBuffer());let binary='';for(const byte of bytes)binary+=String.fromCharCode(byte);return{video:btoa(binary),frames};
 });
 fs.writeFileSync(folder+'upgrade-motion.webm',Buffer.from(movie.video,'base64'));for(const q of movie.frames)fs.writeFileSync(folder+'motion-'+q.n+'.png',Buffer.from(q.png,'base64'));
 expect(errors).toEqual([]);
});
