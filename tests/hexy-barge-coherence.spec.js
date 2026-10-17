import {test,expect} from '@playwright/test';
import fs from 'node:fs/promises';
import {createAdventure,stepAdventure,retryAdventure,playerBody} from '../src/components/arcade/adventure/engine/adventureModel';
import {bargeRig,bargeWaterHitbox,stepBargeProjectile,updateBarge} from '../src/components/arcade/adventure/actors/bosses/adventureBarge';
import {spoutPoint,releaseTidalWave} from '../src/components/arcade/adventure/actors/bosses/bargeWaterAttacks';
import {bargeParts} from '../src/components/arcade/adventure/actors/bosses/bargeSystems';
import {enemyShot,makeEnemy} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {hexyPose} from '../src/components/arcade/adventure/actors/hexy/hexyAnimation';
import {captureInBubble} from '../src/components/arcade/adventure/engine/adventureBubbles';
const scene=()=>{const s=createAdventure(2),a=s.level.arena;for(const key of ['enemies','outposts','supplies','stars','cages','hazards'])s[key]=[];Object.assign(s.player,{x:a.left+400,y:a.y,ground:s.platforms.findIndex(p=>p.x===a.left),hurt:99});Object.assign(s.boss,{x:a.right-400,phase:'recover',engaged:true,timer:99,vulnerable:true});s.arenaLocked=true;return s;};
const tick=(s,seconds,keys={})=>{for(let i=0;i<Math.round(seconds*120);i++)stepAdventure(s,keys,1/120);};

for(const fps of [60,120,240])test(`tidal water travels from the cannon, impacts once and produces two readable waves at ${fps} fps`,()=>{
 const s=scene();Object.assign(s.boss,{phase:'warn',move:'tidal',timer:.01});const born=[],spouts=[];
 for(let i=0;i<fps*4;i++){
  const before=new Set(s.hostile);stepAdventure(s,{},1/fps);
  for(const q of s.hostile)if(!before.has(q)){
   if(q.kind==='barge-spout')spouts.push(q);
   if(['barge-wave','barge-surf'].includes(q.kind)){born.push(q);const source=spouts.find(p=>p.waveReleased&&!p.checked);expect(source).toBeTruthy();source.checked=true;expect(Math.abs(q.x-spoutPoint(source,source.flight).x)).toBeLessThan(1);expect(q.floor).toBe(s.level.arena.y);}
  }
  for(const q of s.hostile.filter(p=>p.kind==='barge-spout')){const m=bargeRig(s);expect(q.x).toBeCloseTo(m.muzzle.x);expect(q.y).toBeCloseTo(m.muzzle.y);if(q.age<q.flight)expect(q.waveReleased).toBeFalsy();}
 }
 expect(born.map(q=>q.kind)).toEqual(['barge-wave','barge-surf']);expect(born[1].drawSize).toBeGreaterThan(born[0].drawSize*1.5);
 expect(born[1].heavyImpact).toBe(true);
});

test('the sustained jet stops at the deck and its collision follows the visible stream',()=>{
 const s=scene();Object.assign(s.boss,{phase:'attack',move:'jet',timer:2,jetAngle:-.25});
 const q={kind:'barge-jet',barge:true,age:1,r:26,life:1};stepBargeProjectile(s,q,1/120,[]);
 expect(q.y-q.length*Math.sin(q.angle)).toBeCloseTo(s.level.arena.y);
 const at={x:q.x-q.length*.6*Math.cos(q.angle),y:q.y-q.length*.6*Math.sin(q.angle)};
 const body=bargeWaterHitbox(q,{x:at.x});expect(at.y).toBeGreaterThanOrEqual(body.y);expect(at.y).toBeLessThanOrEqual(body.y+body.h);
 expect(bargeWaterHitbox(q,{x:q.x-q.length-200}).w).toBe(0);
});

test('drum beats emit one physical strike effect and sonic pulse on the same tick',()=>{
 const s=scene();Object.assign(s.boss,{phase:'attack',move:'drumroll',timer:1,shotClock:0,volley:0});
 updateBarge(s,1/120,{body:playerBody,makeEnemy},enemyShot);
 expect(s.hostile.filter(q=>q.kind==='barge-sonic')).toHaveLength(1);expect(s.effects.filter(q=>q.bargeBeat)).toHaveLength(1);expect(s.events.filter(q=>q==='bargeBeat')).toHaveLength(1);expect(s.boss.drumKick).toBeGreaterThan(0);
});

test('water hits keep Hexy water acting and dripping after the initial splash; large waves knock her down',()=>{
 for(const large of [false,true]){
  const s=scene();s.player.hurt=0;s.hostile=[{kind:large?'barge-surf':'barge-wave',barge:true,water:true,heavyImpact:large,x:s.player.x+4,y:s.player.y-20,floor:s.player.y,vx:-20,vy:0,r:25,drawSize:large?174:108,life:1,age:0}];
  stepAdventure(s,{},1/120);expect(s.hearts).toBe(s.maxHearts-1);expect(s.player.hitType).toBe('water');expect(s.player.wetTime).toBeGreaterThan(1);
  if(large)expect(s.player.knockdown).toBeTruthy();else expect(hexyPose(s)).toEqual({sheet:'element-hits',frame:0});
  tick(s,.7);expect(s.effects.some(q=>q.waterDrop)).toBe(true);retryAdventure(s);expect(s.player.wetTime).toBeUndefined();
 }
});

test('transformation opens only hull panels and defeat detaches structural pieces once',()=>{
 const s=scene(),parts=bargeParts(s);s.boss.hp=150;
 tick(s,.45);expect(s.boss.hullOpened).toBeFalsy();tick(s,.2);expect(s.boss.hullOpened).toBe(true);expect(s.organDebris).toHaveLength(3);
 expect(parts.drum.hp).toBe(parts.drum.maxHp);expect(parts.tank.hp).toBe(parts.tank.maxHp);
 tick(s,2);s.boss.hp=0;tick(s,1.6);expect(s.boss.shattered).toBe(true);
 const chunks=s.organDebris.filter(q=>['barge-phase-two','barge-wheel','barge-cannon'].includes(q.art));expect(chunks).toHaveLength(8);
 expect(chunks.every(q=>q.crop[2]>0&&q.crop[3]>0)).toBe(true);tick(s,3);expect(s.boss.defeat.ready).toBe(true);
});

test('continuous spouts and big waves cannot be miniaturized inside Bubble Tape',()=>{
 for(const kind of ['barge-spout','barge-surf'])expect(captureInBubble({kind:3,heavy:true,life:1},{kind,life:1})).toBe(false);
});

test('a real jump clears the small wave and a double jump clears the large wave',()=>{
 for(const large of [false,true]){
  let safe=false;
  for(let start=.05;start<1.3&&!safe;start+=.05){
   const s=scene();s.player.hurt=0;
   const q={x:s.player.x+430,y:s.player.y-150,vx:0,gravity:300,flight:1,floor:s.player.y,large};releaseTidalWave(s,q,s.hostile);s.hostile[0].x=s.player.x+350;
   let landed=false;
   for(let i=0;i<360;i++){const t=i/120,jump=t>=start&&t<start+(large?.7:.45)&&(!large||t<start+.19||t>start+.24);stepAdventure(s,{jump},1/120);if(t>start+.8&&s.player.ground!==null)landed=true;}
   safe=s.hearts===s.maxHearts&&landed;
  }
  expect(safe,large?'large wave has a clean double jump window':'small wave has a clean jump window').toBe(true);
 }
});

test('barge percussion, rushing water and pressure ruptures reach the actual FX bus without clipping',async({page})=>{
 await page.route('**/__barge_audio',r=>r.fulfill({contentType:'text/html',body:'<body></body>'}));await page.goto('/__barge_audio');
 const result=await page.evaluate(async()=>{
  const render=async silent=>{
   const rate=32000,ctx=new OfflineAudioContext(2,rate*8,rate),names=['bargeBeat','bargeJet','bargeSpout','bargeSurge','bargePressureBurst'];let time=0;
   const proxy=new Proxy(ctx,{get(target,key){if(key==='currentTime')return time;if(key==='state')return 'running';const v=Reflect.get(target,key,target);return typeof v==='function'?v.bind(target):v;}}),original=window.AudioContext;
   window.AudioContext=function(){return proxy;};
   try{const m=await import('/src/components/arcade/shared/audio/sounds.js?barge='+crypto.randomUUID());m.setArcadeSoundsVolume(1,silent?0:1,0);for(const [i,kind]of names.entries()){time=i*1.1;m.arcadeSound({kind,pan:.3,gain:1});}for(const [i,kind]of names.entries()){time=5+i*.025;m.arcadeSound({kind,pan:-.3,gain:1});}}
   finally{window.AudioContext=original;}
   const b=await ctx.startRendering(),data=[b.getChannelData(0),b.getChannelData(1)];let peak=0,nonFinite=0;for(const ch of data)for(const v of ch){peak=Math.max(peak,Math.abs(v));if(!Number.isFinite(v))nonFinite++;}
   const levels=names.map((kind,i)=>{let sum=0;for(const ch of data)for(let j=Math.floor(i*1.1*rate);j<(i*1.1+.7)*rate;j++)sum+=ch[j]**2;return{kind,rms:Math.sqrt(sum/(rate*1.4))};});
   const wav=new ArrayBuffer(44+b.length*4),v=new DataView(wav),word=(o,s)=>{for(let i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i));};word(0,'RIFF');v.setUint32(4,36+b.length*4,true);word(8,'WAVE');word(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,2,true);v.setUint32(24,rate,true);v.setUint32(28,rate*4,true);v.setUint16(32,4,true);v.setUint16(34,16,true);word(36,'data');v.setUint32(40,b.length*4,true);
   for(let i=0;i<b.length;i++)for(let ch=0;ch<2;ch++)v.setInt16(44+(i*2+ch)*2,Math.max(-1,Math.min(1,data[ch][i]))*32767,true);
   const bytes=new Uint8Array(wav);let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));return{peak,nonFinite,levels,wav:btoa(binary)};
  };return{audible:await render(false),silent:await render(true)};
 });
 const dir='context/arcade/barge-coherence/';await fs.writeFile(dir+'barge-fx.wav',Buffer.from(result.audible.wav,'base64'));
 expect(result.audible.nonFinite).toBe(0);expect(result.audible.peak).toBeGreaterThan(.05);expect(result.audible.peak).toBeLessThan(.95);for(const q of result.audible.levels)expect(q.rms).toBeGreaterThan(.005);expect(result.silent.peak).toBe(0);
 await fs.writeFile(dir+'audio-levels.json',JSON.stringify({peak:result.audible.peak,levels:result.audible.levels,silent:result.silent.peak},null,2));
});
