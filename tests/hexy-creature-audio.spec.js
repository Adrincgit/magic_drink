import {test,expect} from '@playwright/test';
import {createAdventure,stepAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {makeEnemy} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {groundY,groundAt} from '../src/components/arcade/adventure/world/adventureTerrain';
import {beginPumpkinDefeat,stepFallingPumpkin} from '../src/components/arcade/adventure/engine/villagePumpkins';
import {stepWitchAbsorption} from '../src/components/arcade/adventure/engine/villageRescue';
import {stepCreatureVoice} from '../src/components/arcade/adventure/engine/adventureWorldAudio';
const kinds=s=>s.events.map(e=>typeof e==='string'?e:e.kind);
function scene(){
 const s=createAdventure(7),x=9000;s.enemies=[];s.villagers=[];s.carriages=[];s.supplies=[];s.cages=[];s.outposts=[];s.villageRubble=[];s.villageObstacles=[];s.platforms=s.platforms.filter(q=>!q.villageObstacle);s.village.furthest=20000;
 Object.assign(s.player,{x,y:groundY(s.level.route,x),ground:s.platforms.indexOf(groundAt(s.platforms,x)),vx:0,vy:0,dir:1,hurt:999});return s;
}
for(const type of [18,21,25])test(`a lethal shot triggers one recorded creature death, type ${type}`,()=>{
 const s=scene(),e=makeEnemy(s.player.x+150,s.player.y,type,0);Object.assign(e,{hp:1,active:true,timer:99});s.enemies=[e];
 s.shots.push({x:e.x,y:e.y-30,vx:0,vy:0,r:25,kind:0,damage:5,life:1,age:0,hits:[]});stepAdventure(s,{},1/120);
 expect(e.hp).toBe(0);expect(kinds(s).filter(k=>k===(type===25?'pumpkinDeath':'zombieDeath'))).toHaveLength(1);expect(kinds(s)).not.toContain('pop');
 stepAdventure(s,{},1/120);expect(kinds(s)).not.toContain(type===25?'pumpkinDeath':'zombieDeath');
});
test('flying pumpkin sounds at defeat and again only when it hits the ground',()=>{
 const s=scene(),e=makeEnemy(s.player.x+100,s.player.y-130,27,0);s.enemies=[e];e.hp=0;s.events=[];
 beginPumpkinDefeat(s,e);beginPumpkinDefeat(s,e);expect(kinds(s)).toEqual(['pumpkinDeath']);s.events=[];
 for(let i=0;i<240;i++)stepFallingPumpkin(s,e,1/120);
 expect(e.pumpkinFall.landed).toBe(true);expect(kinds(s)).toEqual(['pumpkinBreak']);
});
test('crowd groans are staggered; concealed, distant, trapped and defeated zombies stay silent',()=>{
 const s=scene();s.time=10;s.events=[];
 const enemies=Array.from({length:10},(_,i)=>Object.assign(makeEnemy(s.player.x+70+i*5,s.player.y,18,i),{active:true,voiceWait:0}));
 enemies.forEach(e=>stepCreatureVoice(s,e,.01));expect(kinds(s)).toEqual(['zombieGroan']);expect(s.events[0].actor).toBe(enemies[0]);
 s.events=[];for(const extra of [{hidden:true},{fleeing:true},{hp:0},{trap:1},{active:false},{x:s.player.x+900}]){
  s.time+=2;stepCreatureVoice(s,{...enemies[1],...extra,voiceWait:0},.01);
 }expect(s.events).toEqual([]);
 s.time+=2;stepCreatureVoice(s,enemies[1],.01);expect(kinds(s)).toEqual(['zombieGroan']);
});
test('witch laugh follows the absorbing actor and conjuration waits for the actual pumpkin',()=>{
 const s=scene(),e=Object.assign(makeEnemy(s.player.x+160,s.player.y,26,0),{active:true,timer:0});s.enemies=[e];s.villagers=[{id:'sweet',x:s.player.x+80,y:s.player.y,state:'candy'}];s.events=[];
 stepWitchAbsorption(s,e,.01);expect(kinds(s)).toEqual(['witchAbsorb']);expect(s.events[0].actor).toBe(e);
 s.events=[];e.phaseAge=2.2;stepWitchAbsorption(s,e,.01);expect(kinds(s)).not.toContain('pumpkinBirth');
 e.phaseAge=2.81;stepWitchAbsorption(s,e,.01);stepWitchAbsorption(s,e,.01);expect(kinds(s)).toEqual(['pumpkinBirth']);expect(s.enemies.filter(q=>q.type===27)).toHaveLength(1);
});
test('recorded bank decodes once, limits overlaps, pans and cancels laughter on interruption/pause',async({page})=>{
 await page.route('**/__audio-test',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><title>Audio test</title>'}));await page.goto('/__audio-test');const result=await page.evaluate(async()=>{
  const {createCreaturePlayer}=await import('/src/components/arcade/shared/audio/creatureSamples.js'),{createEffectsBus}=await import('/src/components/arcade/shared/audio/effectsBus.js');
  const rate=32000,ctx=new OfflineAudioContext(2,rate*3,rate),master=ctx.createGain();master.gain.value=.7;master.connect(ctx.destination);
  const starts=[],original=ctx.createBufferSource.bind(ctx);ctx.createBufferSource=()=>{const src=original(),start=src.start.bind(src);src.start=(at)=>{starts.push({at,duration:src.buffer.duration});start(at);};return src;};
  const player=createCreaturePlayer(ctx,createEffectsBus(ctx,master)),first=player.preload(),same=first===player.preload(),load=await first;
  const witch={hp:10,phase:'absorb'},s={enemies:[witch]};
  player.play('witchAbsorb',0,{actor:witch,pan:.7});player.play('witchAbsorb',.7,{actor:witch}); // Same witch cannot layer its own laugh.
  for(let i=0;i<12;i++)player.play('soulCast',.11*i,{pan:.7}); // At most three overlapping fire bursts.
  const before=starts.length,pause=ctx.suspend(.36),render=ctx.startRendering();await pause;witch.phase='recover';player.sync(s);player.stopAll();player.stopAll();await ctx.resume();
  const b=await render;let peak=0,tail=0,left=0,right=0;
  for(let i=0;i<b.length;i++){const l=b.getChannelData(0)[i],r=b.getChannelData(1)[i];peak=Math.max(peak,Math.abs(l),Math.abs(r));if(i>rate*.6)tail=Math.max(tail,Math.abs(l),Math.abs(r));if(i<rate*.3){left+=l*l;right+=r*r;}}
  // Interrupt a laugh without stopAll: actor ownership must also silence it.
  const c=new OfflineAudioContext(1,rate*2,rate),p=createCreaturePlayer(c,c.destination);await p.preload();const actor={hp:1,phase:'absorb'};p.play('witchAbsorb',0,{actor});const suspended=c.suspend(.25),rendered=c.startRendering();await suspended;actor.hp=0;p.sync({enemies:[actor]});await c.resume();let interruptedTail=0;for(const x of (await rendered).getChannelData(0).slice(rate*.4))interruptedTail=Math.max(interruptedTail,Math.abs(x));
  return{same,load,before,starts,peak,tail,left,right,interruptedTail};
 });
 expect(result.load).toEqual({loaded:14,failures:[]});expect(result.same).toBe(true);expect(result.starts.filter(s=>s.duration>1.4)).toHaveLength(1);expect(result.before).toBeLessThanOrEqual(7);expect(result.peak).toBeGreaterThan(.01);expect(result.peak).toBeLessThan(1);expect(result.right).toBeGreaterThan(result.left*2);expect(result.tail).toBeLessThan(.00001);expect(result.interruptedTail).toBeLessThan(.00001);
});
test('muting voices preserves pumpkin crunch and flames; muting FX preserves voices',async({page})=>{
 await page.route('**/__audio-test',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><title>Audio test</title>'}));await page.goto('/__audio-test');
 const levels=await page.evaluate(async()=>{
  const {createCreaturePlayer}=await import('/src/components/arcade/shared/audio/creatureSamples.js'),result=[];
  for(const [effects,voices]of [[1,0],[0,1],[0,0]]){
   const rate=32000,ctx=new OfflineAudioContext(1,rate*3,rate),fx=ctx.createGain(),vo=ctx.createGain();fx.gain.value=effects;vo.gain.value=voices;fx.connect(ctx.destination);vo.connect(ctx.destination);const p=createCreaturePlayer(ctx,fx,vo);await p.preload();
   p.play('zombieDeath',0);p.play('soulCast',1);p.play('pumpkinDeath',2);const d=(await ctx.startRendering()).getChannelData(0);
   result.push([0,1,2].map(t=>{let sum=0;for(let i=t*rate;i<(t+.85)*rate;i++)sum+=d[i]*d[i];return Math.sqrt(sum/(.85*rate));}));
  }return result;
 });
 expect(levels[0][0]).toBe(0);expect(levels[0][1]).toBeGreaterThan(.01);expect(levels[0][2]).toBeGreaterThan(.01);
 expect(levels[1][0]).toBeGreaterThan(.01);expect(levels[1][1]).toBe(0);expect(levels[1][2]).toBeGreaterThan(.01);expect(levels[2]).toEqual([0,0,0]);
});
