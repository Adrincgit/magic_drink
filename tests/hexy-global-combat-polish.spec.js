import {test,expect} from '@playwright/test';
import fs from 'node:fs/promises';
import {createAdventure,stepAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {makeEnemy,enemyShot,updateEnemies,bossTargets} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {enemyBody} from '../src/components/arcade/adventure/actors/enemies/adventureEnemyGeometry';
import {enemyClass,canControlEnemy} from '../src/components/arcade/adventure/actors/enemies/adventureEnemyTraits';
import {canTrapEnemy,trapEnemy} from '../src/components/arcade/adventure/engine/adventureBubbles';
import {extraDrinkHit} from '../src/components/arcade/adventure/engine/adventureExtraDrinks';
import {reactToElement} from '../src/components/arcade/adventure/actors/enemies/adventureElementHits';
import {beginCreativeSpecial,stepDrinkFields} from '../src/components/arcade/adventure/engine/adventureCreativeDrinks';
import {hexyPose,hexyMuzzle} from '../src/components/arcade/adventure/actors/hexy/hexyAnimation';
import {SUPER_WINDUP,SUPER_DURATION} from '../src/components/arcade/adventure/engine/adventureMagic';
const dir='context/arcade/global-combat-polish/';
const kinds=s=>s.events.map(q=>typeof q==='string'?q:q.kind);
function quiet(index=7){
 const s=createAdventure(index);for(const k of ['enemies','hostile','outposts','supplies','cages','stars','hazards','villagers','villageRubble','villageStones','villageObstacles','villageBlockades','carriages','campTents'])s[k]=[];
 s.platforms=[{x:0,y:480,w:30000,h:400,baseY:480,kind:'earth',dx:0,dy:0}];s.level={...s.level,route:s.platforms,checkpoints:[],shop:null,ambushes:[]};
 Object.assign(s.player,{x:9000,y:480,ground:0,hurt:999});if(s.village)s.village.furthest=20000;s.boss.phase='sleep';return s;
}
test('roles do not depend on HP, artwork size or whether a miniboss lives in the troop array',()=>{
 for(const type of [0,1,3,4,6,8,10,11,14,18,19,21,22,24,25,26,27,29,30,32])expect(enemyClass(makeEnemy(0,0,type))).toBe('basic');
 for(const type of [5,7,9,12,13,20,31])expect(enemyClass(makeEnemy(0,0,type))).toBe('strong');
 for(const type of [23,28])expect(enemyClass(makeEnemy(0,0,type))).toBe('miniboss');
 expect(enemyClass({...makeEnemy(0,0,0),hp:9999})).toBe('basic');
 for(const combatClass of ['strong','miniboss','boss']){
  const e={...makeEnemy(0,0,0),combatClass};for(const effect of ['bubble','slow','launch','bind','push','electric-stun'])expect(canControlEnemy(e,effect)).toBe(false);
  expect(canTrapEnemy({heavy:true},e)).toBe(false);expect(trapEnemy(e,5)).toBe(false);expect(e.trap).toBe(0);
 }
 expect(enemyClass(quiet(3).boss)).toBe('boss');expect(enemyClass(quiet(7).boss)).toBe('miniboss');
 expect(canControlEnemy({type:100,machine:true},'bubble')).toBe(false);
});
for(const type of [0,18,5,9,12,20,28,31])test(`real heavy bubble contact damages enemy ${type} and respects its role`,()=>{
 const s=quiet(),e=makeEnemy(9160,480,type);Object.assign(e,{timer:99,active:true});s.enemies=[e];
 // The boat establishes its water line on activation; aim at that actual hull.
 if(type===9)updateEnemies(s,0,()=>({x:0,y:0,w:0,h:0}),()=>{});
 const b=enemyBody(e),hp=e.hp;
 s.shots=[{kind:3,heavy:true,x:b.x+b.w/2,y:b.y+b.h/2,vx:0,vy:0,r:25,scale:1,damage:1,life:.5,age:0,hits:[],hitTimes:new Map()}];stepAdventure(s,{},1/120);
 expect(e.hp).toBeLessThan(hp);expect(e.trap>0).toBe(enemyClass(e)==='basic');expect(kinds(s).filter(k=>k==='bubbleCapture').length).toBe(enemyClass(e)==='basic'?1:0);
 if(enemyClass(e)!=='basic')expect(s.effects.find(q=>q.spell===3).size).toBeLessThanOrEqual(90);
});
test('honey slows basic zombies while machinery and the village miniboss keep moving; absorption stays committed',()=>{
 const s=quiet();for(const type of [18,12,20,28]){const e=makeEnemy(9160,480,type);extraDrinkHit(s,{kind:10,x:e.x,y:440,scale:1},e,true);expect((e.snare||0)>0).toBe(enemyClass(e)==='basic');}
 const witch=makeEnemy(9160,480,26);Object.assign(witch,{phase:'absorb',phaseAge:.5,recovery:0});reactToElement(witch,{kind:9});
 expect(witch.recovery).toBe(0);expect(canTrapEnemy({heavy:true},witch)).toBe(false);extraDrinkHit(s,{kind:10,scale:1},witch,true);expect(witch.snare||0).toBe(0);expect(witch.phase).toBe('absorb');
 const strong=makeEnemy(9200,480,31),basic=makeEnemy(9250,480,0);s.enemies=[strong,basic];reactToElement(strong,{kind:9});reactToElement(basic,{kind:9});
 for(let i=0;i<24;i++)updateEnemies(s,1/120,()=>({x:0,y:0,w:0,h:0}),()=>{});
 expect(strong.clock).toBeCloseTo(.2);expect(basic.clock).toBeCloseTo(.2*.32);
});
test('Jelly lifts an ordinary zombie without lifting large actors, machines, minibosses or bosses',()=>{
 const s=quiet();beginCreativeSpecial(s,6,1);const f=s.drinkFields[0];s.player.x=f.x-150;
 s.enemies=[18,12,20,28].map(type=>makeEnemy(f.x,f.y,type));s.enemies.push({...makeEnemy(f.x,f.y,0),combatClass:'boss'});
 stepDrinkFields(s,.2);expect(s.enemies[0].jellyLift).toBe(1.5);for(const e of s.enemies.slice(1))expect(e.jellyLift).toBeUndefined();expect(f.charges).toBe(2);
});
test('launch audio follows actual projectiles, folds a fan into one cue and attenuates off-screen sources',()=>{
 const s=quiet();for(const kind of ['streamer','ring','juggle','water-bolt','ember-torch'])enemyShot(s,9150,440,0,200,kind);
 expect(kinds(s)).toEqual(['enemyStreamer','enemyRing','enemyJuggle','diverThrow','enemyFlame']);
 expect(s.events.every(e=>e.pan>0&&e.gain>0&&e.gain<1)).toBe(true);
 s.events=[];s.time++;for(let i=0;i<3;i++)enemyShot(s,9150,440,i*.2,200,'ring');expect(kinds(s)).toEqual(['enemyRing']);
 enemyShot(s,12000,440,0,200,'ring');expect(kinds(s)).toEqual(['enemyRing']);expect(s.hostile).toHaveLength(9);
});
for(const [kind,cue]of [[0,'impactFire'],[5,'impactWater'],[6,'impactJelly'],[10,'impactHoney']])test(`ordinary material ${kind} produces its own audible and painted contact`,()=>{
 const s=quiet(),e=makeEnemy(9160,480,18);e.timer=99;s.enemies=[e];s.shots=[{kind,x:e.x,y:430,vx:0,vy:0,r:22,scale:1,damage:1,life:.5,age:0,hits:[]}];stepAdventure(s,{},1/120);
 expect(kinds(s).filter(k=>k===cue)).toHaveLength(1);
 if(kind===0){expect(e.burning).toBeTruthy();expect(s.effects.some(q=>q.dragon)).toBe(true);}
 if(kind===5)expect(s.effects.some(q=>q.aquaKind==='impact')).toBe(true);
 if(kind===6||kind===10)expect(s.effects.some(q=>q.drinkFx===kind)).toBe(true);
 if(kind===10)expect(e.honeyed).toBeGreaterThan(0);
});
test('aerial ultimate holds all four registered release poses in both directions and resumes falling after the cinematic',()=>{
 for(const direction of [-1,1]){
  const s=quiet();Object.assign(s.player,{x:9000,y:290,ground:null,vy:180,dir:direction});stepAdventure(s,{super:true},1/120);const frames=new Set();
  while(s.superCinematic){stepAdventure(s,{},1/120);if(s.superCinematic?.age>=SUPER_WINDUP){const pose=hexyPose(s);expect(pose.sheet).toBe('air-super-release');frames.add(pose.frame);expect(s.superCinematic.origin).toEqual(hexyMuzzle(s));expect(s.player.y).toBe(290);}}
  expect(frames.size).toBe(4);stepAdventure(s,{},1/120);expect(s.player.y).toBeGreaterThan(290);expect(hexyPose(s).sheet).not.toBe('air-super-release');
 }
 const ground=quiet();stepAdventure(ground,{super:true},1/120);while(ground.superCinematic.age<SUPER_WINDUP+.1)stepAdventure(ground,{},1/120);expect(hexyPose(ground).sheet).toBe('super-cast');
});
test('normal honey and Jelly contacts retain their material on a vulnerable boss without applying control',()=>{
 for(const kind of [6,10]){
  const s=quiet(0);Object.assign(s.boss,{x:9300,y:480,phase:'recover',timer:20,vulnerable:true});const b=bossTargets(s)[0],hp=s.boss.hp;
  s.shots=[{kind,x:b.x+b.w/2,y:b.y+b.h/2,vx:0,vy:0,r:18,scale:1,damage:1,life:.5,age:0,hits:[]}];stepAdventure(s,{},1/120);
  expect(s.boss.hp).toBeLessThan(hp);expect(s.effects.some(q=>q.drinkFx===kind)).toBe(true);expect(s.boss.trap||0).toBe(0);expect(s.boss.snare||0).toBe(0);expect(s.boss.jellyLift||0).toBe(0);
 }
});
test('the actual FX output renders distinct material contacts and a crowded mix with stereo placement, silence controls and no clipping',async({page})=>{
 await page.route('**/__material_audio',r=>r.fulfill({contentType:'text/html',body:'<body></body>'}));await page.goto('/__material_audio');
 const result=await page.evaluate(async()=>{
  const render=async({muted=false,effects=1,voices=0,mix=false}={})=>{
   const names=['impactFire','impactWater','impactHoney','impactJelly','impactElectric','bubbleCapture','bubbleBurst','jellyBounce','bargeSplash','diverThrow','cannon','enemyStreamer','enemyRing','enemyJuggle','enemyFlame'],rate=32000,duration=mix?5:names.length*1.1+1;
   const context=new OfflineAudioContext(2,rate*duration,rate);let time=0;
   const proxy=new Proxy(context,{get(target,key){if(key==='currentTime')return time;if(key==='state')return 'running';const value=Reflect.get(target,key,target);return typeof value==='function'?value.bind(target):value;}}),original=window.AudioContext;
   window.AudioContext=function(){return proxy;};
   try{const m=await import('/src/components/arcade/shared/audio/sounds.js?material='+crypto.randomUUID());m.setArcadeSoundsVolume(1,effects,voices);m.muteArcadeSounds(muted);for(const [i,kind]of names.entries()){time=mix?.1+i*.11:i*1.1;m.arcadeSound({kind,pan:.65,gain:1});}}
   finally{window.AudioContext=original;}
   const buffer=await context.startRendering(),channels=[buffer.getChannelData(0),buffer.getChannelData(1)];let peak=0,left=0,right=0,nonFinite=0;
   for(let i=0;i<buffer.length;i++){const l=channels[0][i],r=channels[1][i];peak=Math.max(peak,Math.abs(l),Math.abs(r));left+=l*l;right+=r*r;if(!Number.isFinite(l+r))nonFinite++;}
   const windows=mix?[]:names.map((kind,i)=>{let energy=0;for(const d of channels)for(let j=Math.floor(i*1.1*rate);j<(i*1.1+.8)*rate;j++)energy+=d[j]**2;return{kind,rms:Math.sqrt(energy/(rate*1.6))};});
   const wav=new ArrayBuffer(44+buffer.length*4),v=new DataView(wav),word=(o,t)=>{for(let i=0;i<t.length;i++)v.setUint8(o+i,t.charCodeAt(i));};word(0,'RIFF');v.setUint32(4,36+buffer.length*4,true);word(8,'WAVE');word(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,2,true);v.setUint32(24,rate,true);v.setUint32(28,rate*4,true);v.setUint16(32,4,true);v.setUint16(34,16,true);word(36,'data');v.setUint32(40,buffer.length*4,true);
   for(let i=0;i<buffer.length;i++)for(let ch=0;ch<2;ch++)v.setInt16(44+(i*2+ch)*2,Math.max(-1,Math.min(1,channels[ch][i]))*32767,true);
   let binary='';const bytes=new Uint8Array(wav);for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
   return{peak,left,right,nonFinite,windows,wav:btoa(binary)};
  };
  return{materials:await render(),mix:await render({mix:true}),silent:await render({effects:0}),muted:await render({muted:true})};
 });
 await fs.mkdir(dir,{recursive:true});
 for(const name of ['materials','mix']){const r=result[name];await fs.writeFile(dir+'audio-'+name+'.wav',Buffer.from(r.wav,'base64'));expect(r.nonFinite).toBe(0);expect(r.peak).toBeGreaterThan(.05);expect(r.peak).toBeLessThan(.95);expect(r.right).toBeGreaterThan(r.left*2);}
 for(const w of result.materials.windows)expect(w.rms,'audible '+w.kind).toBeGreaterThan(.005);
 expect(result.silent.peak).toBe(0);expect(result.muted.peak).toBe(0);
 for(const r of Object.values(result))delete r.wav;await fs.writeFile(dir+'audio-levels.json',JSON.stringify(result,null,2));
});
