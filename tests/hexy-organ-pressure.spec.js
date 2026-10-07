import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {createAdventure,stepAdventure,playerBody} from '../src/components/arcade/adventure/engine/adventureModel';
import {updateBoss,bossTargets} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {organBassMouth,organMouths} from '../src/components/arcade/adventure/actors/bosses/organMechanism';
import {prepareOrganCharge} from '../src/components/arcade/adventure/actors/bosses/organCharge';
import {adventureBounds,followAdventureCamera,cameraView} from '../src/components/arcade/adventure/render/adventureCamera';
import {bossHitFilter} from '../src/components/arcade/adventure/actors/bosses/bossFeedback';

const helpers={say:()=>{},particles:()=>{},body:playerBody};
const artifacts='tests/artifacts/arcade/organ-pressure/';
function arena(gentle=false,index=1){
 const s=createAdventure(index,gentle),a=s.level.arena;
 for(const k of ['enemies','outposts','supplies','pickups','hazards','stars','cages'])s[k]=[];
 Object.assign(s.player,{x:a.left+600,y:a.y,ground:s.platforms.length-1});
 Object.assign(s.boss,{phase:'recover',timer:30,engaged:true,vulnerable:true});
 s.arenaLocked=true;s.camera={x:a.left,y:a.y-500,zoom:.8};s.damage=()=>{};return s;
}
const tick=(s,keys={},dt=1/120)=>stepAdventure(s,keys,dt);

test('front notes actually damage standing Hexy at short, middle and long distances in both modes',()=>{
 for(const gentle of [false,true])for(const distance of [350,650,1000]){
  const s=arena(gentle),b=s.boss;s.player.x=b.x-distance;
  Object.assign(b,{phase:'attack',move:'organ-fanfare',timer:2,shotClock:0,attackClock:0,volley:0});
  updateBoss(s,1/120,helpers);const q=s.hostile[0],mouth=organMouths(s)[2];
  expect(q.kind).toBe('note');expect(q.x).toBe(mouth.x);expect(q.y).toBe(mouth.y);expect(q.gravity).toBe(0);expect(q.vy).toBeGreaterThan(0);
  expect(q.y+(s.player.x-q.x)*q.vy/q.vx).toBeCloseTo(s.level.arena.y-42);
  Object.assign(b,{phase:'recover',timer:30});const before=s.hearts;
  for(let i=0;i<600&&s.hearts===before;i++)tick(s);
  expect(s.hearts).toBe(before-1);
 }
});

test('bass waves hit standing and crouched Hexy but a short timed jump clears them at 60, 120 and 240 fps',()=>{
 for(const fps of [60,120,240])for(const action of ['idle','crouch','jump']){
  const s=arena(),b=s.boss;s.player.x=b.x-650;
  Object.assign(b,{phase:'attack',move:'organ-fanfare',timer:2,shotClock:0,attackClock:0,volley:1});updateBoss(s,1/120,helpers);
  s.hostile=s.hostile.filter(q=>q.kind==='sound-wave');expect(s.hostile).toHaveLength(1);
  const q=s.hostile[0],mouth=organBassMouth(s);expect(q.x).toBe(mouth.x);expect(q.y).toBe(mouth.y);expect(s.events).toContain('organLowWave');
  Object.assign(b,{phase:'recover',timer:30});const before=s.hearts;let jumpAt=null,clearance=false;
  for(let i=0;i<fps*3;i++){
   if(action==='jump'&&jumpAt===null&&q.x-s.player.x<100)jumpAt=i/fps;
   tick(s,{down:action==='crouch',jump:jumpAt!==null&&i/fps-jumpAt<.13},1/fps);
   if(Math.abs(q.x-s.player.x)<31&&s.player.y<s.level.arena.y-35)clearance=true;
  }
  if(action==='jump'){expect(clearance).toBe(true);expect(s.hearts).toBe(before);}else expect(s.hearts).toBe(before-1);
 }
});

test('rain plus bass prevents camping in the rain gap while timed jumps remain possible',()=>{
 for(const jumping of [false,true]){
  const s=arena(),b=s.boss,p=s.player;p.x=s.level.arena.left+700;
  Object.assign(b,{phase:'attack',move:'organ-bellows',timer:4.5,shotClock:0,attackClock:0,volley:0,rainGap:p.x});
  const before=s.hearts;let jumpUntil=0,jumps=0;
  for(let i=0;i<720;i++){
   const approaching=s.hostile.find(q=>q.kind==='sound-wave'&&!q.jumped&&q.x-p.x<100&&q.x>p.x);
   if(jumping&&approaching){approaching.jumped=true;jumpUntil=s.time+.13;jumps++;}
   tick(s,{jump:jumping&&s.time<jumpUntil});
  }
  if(jumping){expect(jumps).toBeGreaterThan(0);expect(s.hearts).toBe(before);}else expect(s.hearts).toBeLessThan(before);
 }
});

test('the larger arena allows full horizontal retreat and keeps player and boss in the camera',()=>{
 const s=arena(),a=s.level.arena,bounds=adventureBounds(s);expect(a.right-a.left).toBe(1600);expect(bounds.right-bounds.left).toBe(1552);
 for(const x of [bounds.left,a.left+600,bounds.right]){
  s.player.x=x;for(let i=0;i<360;i++)followAdventureCamera(s,1/120);
  const view=cameraView(s);expect(s.camera.x).toBeGreaterThanOrEqual(a.left-1);expect(s.camera.x+view.width).toBeLessThanOrEqual(a.right+1);
  expect(x-s.camera.x).toBeGreaterThan(15);expect(x-s.camera.x).toBeLessThan(view.width-15);
  expect(s.boss.x+170).toBeLessThan(s.camera.x+view.width);expect(s.boss.x-204).toBeGreaterThan(s.camera.x);
 }
 Object.assign(s.boss,{phase:'intro',timer:100});s.player.x=a.left+300;
 for(let i=0;i<720;i++)tick(s,{left:true});expect(s.player.x).toBe(bounds.left);
 for(let i=0;i<1000;i++)tick(s,{right:true});expect(s.player.x).toBe(bounds.right);expect(s.player.y).toBe(a.y);
});

test('the charge warns, locks its destination, accelerates, hits campers and can be avoided by retreating',()=>{
 for(const fps of [60,120,240])for(const retreat of [false,true]){
  const s=arena(),b=s.boss,a=s.level.arena;s.player.x=a.left+700;b.move='organ-charge';prepareOrganCharge(s);
  const target=b.charge.target,origin=b.x,before=s.hearts;let warning=0,peak=0,advance=0,recovery=false;
  for(let i=0;i<fps*9&&b.charge;i++){
   const phase=b.phase;tick(s,retreat?{left:true}:{},1/fps);
   if(phase==='warn')warning+=1/fps;
   if(b.charge)expect(b.charge.target).toBe(target);
   if(b.phase==='attack'){peak=Math.max(peak,Math.abs(b.driveSpeed));advance=Math.max(advance,origin-b.x);expect(b.vulnerable).toBe(false);}
   if(b.phase==='recover'){recovery=true;expect(b.vulnerable).toBe(true);}
   expect(b.x).toBeGreaterThanOrEqual(a.left+370);expect(b.x).toBeLessThan(a.right-300);
  }
  expect(warning).toBeGreaterThanOrEqual(2.3);expect(peak).toBeGreaterThan(1000);expect(advance).toBeGreaterThan(650);expect(recovery).toBe(true);expect(b.charge).toBeNull();
  expect(b.x).toBeCloseTo(a.right-345);expect(s.hearts).toBe(retreat?before:before-1);
 }
});

test('long rushes leave bounded world-space dust, keep a retreat margin and grow faster in phase two',()=>{
 for(const fps of [60,120,240])for(const mode of ['normal','phase-two','gentle']){
  const s=arena(mode==='gentle'),a=s.level.arena,b=s.boss;
  Object.assign(b,{move:'organ-charge',transformed:mode==='phase-two'});s.player.x=a.left+420;prepareOrganCharge(s);
  expect(b.charge.target).toBe(a.left+(b.transformed?(s.gentle?320:250):(s.gentle?430:370)));
  const origin=b.x;let peak=0,furthest=0,clouds=0,trail=false;
  for(let i=0;i<fps*9&&b.charge;i++){
   tick(s,{left:true},1/fps);peak=Math.max(peak,-b.driveSpeed);furthest=Math.max(furthest,origin-b.x);
   clouds=Math.max(clouds,(s.organDust||[]).length);expect((s.organDust||[]).length).toBeLessThanOrEqual(96);
   trail||=(s.organDust||[]).some(q=>q.age>.2&&q.x>b.x+130);
  }
  expect(peak).toBeGreaterThan(mode==='gentle'?725:mode==='phase-two'?1140:1000);
  expect(furthest).toBeGreaterThan(820);expect(clouds).toBeGreaterThan(20);expect(trail).toBe(true);
  expect(s.organDust).toHaveLength(0);expect(s.hearts).toBe(s.maxHearts);
 }
});

test('real hits on both bosses pulse their native art longer; blocked hits do not trigger the impact sound',()=>{
 for(const index of [0,1])for(const vulnerable of [false,true]){
  const s=arena(false,index),b=s.boss,t=bossTargets(s)[0];b.vulnerable=vulnerable;
  s.shots=[{x:t.x+t.w/2,y:t.y+t.h/2,vx:0,vy:0,r:8,life:1,age:0,kind:-1,damage:1,hits:[]}];
  const hp=b.hp;tick(s);
  if(vulnerable){
   expect(b.hp).toBe(hp-1);expect(s.events).toContain('bossHit');expect(b.flash).toBe(.3);
   const pulses=new Set(),reduced=new Set();for(let i=0;i<30;i++){pulses.add(bossHitFilter(b));reduced.add(bossHitFilter(b,true));b.flash-=.01;}
   expect(pulses.size).toBe(2);expect(reduced.size).toBe(1);
  }else{expect(b.hp).toBe(hp);expect(s.events).not.toContain('bossHit');expect(s.events).toContain('bossBlock');}
 }
});

test('boss impacts have bright metallic energy; front notes are bassier, audible and respect mute',async({page})=>{
 await page.goto('/arcade');
 const report=await page.evaluate(async()=>{
  const Native=window.AudioContext,report=[];
  try{
   for(const [i,kind]of ['bossHit','bossHeavyHit','organFanfare','organNotes','organLowWave','organRev','organCharge','organBrake','muted'].entries()){
    const offline=new OfflineAudioContext(1,48000,48000);offline.resume=()=>Promise.resolve();window.AudioContext=function(){return offline;};
    const sound=await import('/src/components/arcade/shared/audio/sounds.js?pressure-audio='+i);
    if(kind==='muted')sound.muteArcadeSounds(true);sound.arcadeSound(kind==='muted'?'bossHit':kind);
    const buffer=await offline.startRendering(),data=buffer.getChannelData(0);let sum=0,high=0,peak=0,last=0,filtered=0;
    for(const n of data){filtered=.8546*(filtered+n-last);last=n;sum+=n*n;high+=filtered*filtered;peak=Math.max(peak,Math.abs(n));}
    const wav=new ArrayBuffer(44+data.length*2),view=new DataView(wav),label=(at,value)=>{for(let j=0;j<value.length;j++)view.setUint8(at+j,value.charCodeAt(j));};
    label(0,'RIFF');view.setUint32(4,wav.byteLength-8,true);label(8,'WAVE');label(12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);view.setUint32(24,48000,true);view.setUint32(28,96000,true);view.setUint16(32,2,true);view.setUint16(34,16,true);label(36,'data');view.setUint32(40,data.length*2,true);
    for(let j=0;j<data.length;j++)view.setInt16(44+j*2,Math.max(-1,Math.min(1,data[j]))*32767,true);
    let binary='';for(const byte of new Uint8Array(wav))binary+=String.fromCharCode(byte);
    report.push({kind,rms:Math.sqrt(sum/data.length),highRatio:sum?Math.sqrt(high/sum):0,peak,wav:btoa(binary)});
   }
  }finally{window.AudioContext=Native;}
  return report;
 });
 for(const q of report){if(q.kind==='muted')expect(q.peak).toBe(0);else{expect(q.rms).toBeGreaterThan(.001);expect(q.peak).toBeLessThan(.65);}}
 for(const q of report.filter(q=>q.kind.startsWith('boss')))expect(q.highRatio).toBeGreaterThan(.6);
 expect(report.find(q=>q.kind==='organFanfare').highRatio).toBeLessThan(report.find(q=>q.kind==='organNotes').highRatio);
 fs.mkdirSync(artifacts,{recursive:true});for(const q of report)if(['bossHit','bossHeavyHit','organFanfare','organLowWave'].includes(q.kind))fs.writeFileSync(artifacts+q.kind+'.wav',Buffer.from(q.wav,'base64'));
 fs.writeFileSync(artifacts+'audio.json',JSON.stringify(report.map(({wav,...q})=>q),null,2));
});

test('the live painter shows bass waves, the charge warning, its advance and the stronger impact flash',async({page})=>{
 fs.mkdirSync(artifacts,{recursive:true});await page.setViewportSize({width:1440,height:900});await page.goto('/arcade');
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.evaluate(async()=>{
  const [{createAdventure,stepAdventure,playerBody},{loadAdventureArt,renderAdventure},{updateBoss},{prepareOrganCharge},{followAdventureCamera}]=await Promise.all([
   import('/src/components/arcade/adventure/engine/adventureModel.js'),import('/src/components/arcade/adventure/render/adventureCanvas.js'),
   import('/src/components/arcade/adventure/actors/enemies/adventureEnemies.js'),import('/src/components/arcade/adventure/actors/bosses/organCharge.js'),
   import('/src/components/arcade/adventure/render/adventureCamera.js')]);
  const art=await loadAdventureArt(),c=document.createElement('canvas');c.id='organ-pressure';c.style='position:fixed;inset:0;z-index:99999;width:1440px;height:810px';document.body.append(c);
  const clean=(index=1)=>{const s=createAdventure(index),a=s.level.arena;for(const k of ['enemies','outposts','supplies','pickups','hazards','stars','cages'])s[k]=[];Object.assign(s.player,{x:a.left+700,y:a.y,ground:s.platforms.length-1});Object.assign(s.boss,{phase:'recover',timer:30,engaged:true,vulnerable:true});s.arenaLocked=true;s.camera={x:a.left,y:a.y-500,zoom:.8};for(let i=0;i<240;i++)followAdventureCamera(s,1/120);return s;};
  window.organReview={art,c,clean,renderAdventure,stepAdventure,playerBody,updateBoss,prepareOrganCharge,followAdventureCamera};
 });
 await page.evaluate(()=>{
  const {art,c,clean,renderAdventure,stepAdventure}=window.organReview,s=clean(),b=s.boss;
  Object.assign(b,{phase:'attack',move:'organ-fanfare',timer:2.35,shotClock:0,attackClock:0,volley:0});
  for(let i=0;i<210;i++)stepAdventure(s,{},1/120);renderAdventure(c,s,art);window.organReview.notes=s;
 });
 await page.locator('#organ-pressure').screenshot({path:artifacts+'front-notes-and-bass.jpg'});
 const anticipation=await page.evaluate(async()=>{
  const {art,c,clean,renderAdventure,stepAdventure,prepareOrganCharge}=window.organReview,s=clean(),b=s.boss;b.move='organ-charge';prepareOrganCharge(s);
  const {organMechanism}=await import('/src/components/arcade/adventure/actors/bosses/organMechanism.js');const initial=organMechanism(s).wheels[0].angle;
  for(let i=0;i<96;i++)stepAdventure(s,{left:true},1/120);
  renderAdventure(c,s,art);window.organReview.charge=s;
  return{phase:b.phase,rotation:Math.abs(organMechanism(s).wheels[0].angle-initial),reduced:organMechanism(s,true).wheels[0].angle,dust:(s.organDust||[]).length};
 });
 expect(anticipation.phase).toBe('warn');expect(anticipation.rotation).toBeGreaterThan(4);expect(anticipation.reduced).toBe(0);expect(anticipation.dust).toBeGreaterThan(0);
 fs.writeFileSync(artifacts+'anticipation.json',JSON.stringify(anticipation,null,2));
 await page.locator('#organ-pressure').screenshot({path:artifacts+'charge-warning.jpg'});
 await page.evaluate(()=>{const {art,c,renderAdventure,stepAdventure,charge:s}=window.organReview;for(let i=0;i<240;i++)stepAdventure(s,{left:true},1/120);renderAdventure(c,s,art);});
 await page.locator('#organ-pressure').screenshot({path:artifacts+'charge-advance.jpg'});
 await page.evaluate(()=>{
  const {art,c,clean,renderAdventure,stepAdventure,prepareOrganCharge}=window.organReview,s=clean();s.boss.move='organ-charge';prepareOrganCharge(s);
  for(let i=0;i<366;i++)stepAdventure(s,{},1/120);renderAdventure(c,s,art);
 });
 await page.locator('#organ-pressure').screenshot({path:artifacts+'charge-close.jpg'});
 for(const index of [0,1])for(const flash of [0,.3,.23]){
  await page.evaluate(({index,flash})=>{const {art,c,clean,renderAdventure}=window.organReview,s=clean(index);s.boss.flash=flash;s.boss.flashDuration=.3;s.time=1.4;renderAdventure(c,s,art);},{index,flash});
  await page.locator('#organ-pressure').screenshot({path:artifacts+`boss-${index}-flash-${flash}.jpg`});
 }
 expect(errors).toEqual([]);
});
