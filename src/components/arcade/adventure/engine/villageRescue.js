import {worldSound} from './adventureWorldAudio';
import {groundY} from '../world/adventureTerrain';
import {isCandySpell,spawnSoulPumpkin,releaseVillageVictim,beginPumpkinDefeat,hasSoulPumpkinRoom} from './villagePumpkins';
import {beginPlayerDefeat} from './playerDefeat';
import {witchVessel} from '../actors/villageWitchAnchors';

export const witchId=e=>`witch:${e.spawnSeed}:${e.home}`;
export const villageNight=s=>Math.min(1,Math.max(0,(s.village?.furthest??s.player.x)/(s.level.width*.52)));
export const CANDY_ESCAPE_PRESSES=21,HEXY_ABSORB_DURATION=4.8;
const absorbing=e=>['absorb','absorb-player'].includes(e.phase);
const pendingVictims=(s,e)=>(s.villagers||[]).filter(q=>q.curseOwner===witchId(e)&&['absorbing','absorbed'].includes(q.state));
function finishAbsorption(e){e.phase='recover';e.phaseAge=0;e.timer=1.1;e.absorbIds=[];e.absorbCooldown=3;delete e.absorbDuration;}
function beginAbsorption(s,e,player=false){
 if(absorbing(e))return;
 e.phase=player?'absorb-player':'absorb';e.phaseAge=0;e.absorbIds=[];e.absorbSerial=0;e.nextPumpkinAt=0;e.absorbDuration=player?HEXY_ABSORB_DURATION:3.05;
 worldSound(s,'witchAbsorb',e.x,e.y,e);
}
function gatherCandies(s,e){
 // A finite intake window prevents a stream of reinforcements from keeping
 // the boss in the same ritual indefinitely.
 if(e.phaseAge>1.2)return;
 for(const q of s.villagers||[])if(q.state==='candy'&&(q.absorbRestUntil||0)<=(s.time||0)&&Math.abs(q.x-e.x)<620){
  q.state='absorbing';q.candyHomeX??=q.x;q.curseOwner=witchId(e);
  q.absorbFrom={x:q.x,y:q.y};q.absorbStartedAt=e.phaseAge;q.absorbProgress=0;
  q.absorbSlot=e.absorbSerial++;e.absorbIds.push(q.id);
  e.absorbDuration=Math.max(e.absorbDuration,e.phaseAge+3.05+q.absorbSlot*.18);
 }
}
export function beginCandyCapture(s,source){
 if(!isCandySpell(source)||s.player.candy)return;
 const p=s.player;
 p.candy={age:0,effort:0,required:CANDY_ESCAPE_PRESSES,pulse:0,last:{},owner:source.owner};
 Object.assign(p,{vx:0,vy:0,charge:0,jumpBuffer:0,dash:0,cast:0,specialCast:0,firing:false,hitReact:0,knockdown:null});
 s.aquaJet=null;s.voltBeam=null;s.placement=null;
 s.notice='villageCandyEscape';s.noticeTime=5;worldSound(s,'candyTransform',p.x,p.y);
}
// Count fresh presses and stick direction changes. Holding one input is not mashing.
export function stepCandyCapture(s,input,dt){
 const q=s.player.candy;if(!q)return false;
 q.age+=dt;q.pulse=Math.max(0,q.pulse-dt*4);
 const keys=['left','right','up','down','jump','attack','special','dash','guard'];
 if(keys.some(k=>input[k]&&!q.last[k])){q.effort++;q.pulse=1;}
 q.last={...input};s.player.vx=0;s.player.charge=0;s.player.firing=false;
 if(!q.terminal&&!q.pumpkin&&q.age>.55&&(q.effort>=CANDY_ESCAPE_PRESSES||q.age>=30)){
  const witch=s.enemies.find(e=>witchId(e)===q.absorber);if(witch&&absorbing(witch)&&!pendingVictims(s,witch).length)finishAbsorption(witch);
  delete s.player.candy;s.player.hurt=Math.max(s.player.hurt,.8);worldSound(s,'candyRelease',s.player.x,s.player.y);s.notice='villageCandyFree';s.noticeTime=2;return false;
 }
 let witch=s.enemies.find(e=>[26,28].includes(e.type)&&e.hp>0&&witchId(e)===q.absorber);
 if(witch&&!absorbing(witch)){delete q.absorber;delete q.tether;q.absorbProgress=0;q.noAbsorbUntil=q.age+1.4;witch=null;}
 if(!witch&&q.age>Math.max(1.05,q.noAbsorbUntil||0)){
  // Capture has priority over the next attack/recovery timer. Waiting for a
  // zero-timer patrol frame races the enemy update and can starve forever.
  witch=s.enemies.filter(e=>[26,28].includes(e.type)&&e.hp>0&&e.active&&(absorbing(e)||!e.trap&&e.flash<=0)&&!['sleep','intro','crack','broom-call','broom-mount','broom-rise'].includes(e.phase)&&!(e.phase==='attack'&&e.phaseAge<.25)&&Math.abs(e.x-s.player.x)<620).sort((a,b)=>Math.abs(a.x-s.player.x)-Math.abs(b.x-s.player.x))[0];
  if(witch){q.absorber=witchId(witch);q.absorbAge=0;q.from={x:s.player.x,y:s.player.y};if(!absorbing(witch))witch.dir=Math.sign(s.player.x-witch.x)||witch.dir;beginAbsorption(s,witch,true);witch.absorbDuration=Math.max(witch.absorbDuration,witch.phaseAge+HEXY_ABSORB_DURATION);gatherCandies(s,witch);s.notice='villageHexyAbsorbed';s.noticeTime=6;}
 }
 if(witch){
  q.absorbAge+=dt;const u=Math.max(0,Math.min(1,(q.absorbAge-.55)/(HEXY_ABSORB_DURATION-.55))),ease=u*u*(3-2*u);
  const vessel=witchVessel(witch);q.absorbProgress=u;q.tether={x:q.from.x+(vessel.x-q.from.x)*ease,y:q.from.y+(vessel.y+25-q.from.y)*ease-Math.sin(u*Math.PI)*65};
  if(q.absorbAge>=HEXY_ABSORB_DURATION){
   s.player.x=q.tether.x;s.player.y=q.tether.y;q.pumpkin=true;q.convertAge=0;
   if(hasSoulPumpkinRoom(s,false)){const pumpkin=spawnSoulPumpkin(s,witch,{id:'hexy',playerSoul:true});q.containerId=pumpkin.curseId;s.player.x=pumpkin.x;s.player.y=pumpkin.y;}
   if(!pendingVictims(s,witch).length)finishAbsorption(witch);
   s.hearts=0;beginPlayerDefeat(s);
  }
 }
 return true;
}
export function releaseWitchVictims(s,e){
 if(![26,28].includes(e.type))return;
 const owner=witchId(e);
 for(const orb of s.enemies)if(orb.orbitParent===owner&&orb.hp>0){orb.hp=0;orb.defeated=true;beginPumpkinDefeat(s,orb);}
 if(s.player.candy?.absorber===owner){const q=s.player.candy;delete q.absorber;delete q.tether;q.absorbProgress=0;q.noAbsorbUntil=q.age+1.4;}
 for(const q of s.villagers||[])if(q.curseOwner===owner&&['turning','candy','absorbing','absorbed'].includes(q.state)){
  releaseVillageVictim(s,q);
 }
 e.absorbIds=[];
 // An already airborne spell cannot imprison another victim after its owner dies.
 for(const q of s.hostile)if(isCandySpell(q)&&q.owner===owner)q.life=0;
 if(e.flying){delete e.popcornDefeat;e.witchFall={age:0,vy:-95,vx:-e.dir*65,landed:false};e.deadTime=3;}
}
export function stepFallingWitch(s,e,dt){
 const q=e.witchFall;if(!q)return false;
 q.age+=dt;e.deathAge=q.age;
 if(!q.landed){q.vy+=630*dt;e.x+=q.vx*dt;e.y+=q.vy*dt;const floor=groundY(s.level.route,e.x);if(e.y>=floor){e.y=floor;q.landed=true;q.landAge=0;worldSound(s,'bodyFall',e.x,e.y);}}
 else q.landAge+=dt;
 e.deadTime=q.landed?Math.max(0,1.1-q.landAge):3;
 return true;
}
export function stepWitchAbsorption(s,e,dt){
 e.healGlow=Math.max(0,(e.healGlow||0)-dt);
 e.absorbCooldown=Math.max(0,(e.absorbCooldown||0)-dt);
 if(!absorbing(e)){
  if(e.phase!=='patrol'||e.timer>0||e.flash>0||e.trap>0||e.absorbCooldown>0||!hasSoulPumpkinRoom(s))return false;
  const first=(s.villagers||[]).find(q=>q.state==='candy'&&(q.absorbRestUntil||0)<=(s.time||0)&&Math.abs(q.x-e.x)<620);if(!first)return false;
  e.dir=Math.sign(first.x-e.x)||e.dir;beginAbsorption(s,e);
 }
 // Damage still reduces health, but an established ritual persists until death.
 // Hexy's own escape and each captive's 30-second timeout remain independent.
 gatherCandies(s,e);
 for(const q of pendingVictims(s,e)){
  // Recover retained captives from old saves/phase changes with no pull clock.
  if(!Number.isFinite(q.absorbStartedAt)){q.absorbStartedAt=0;q.absorbFrom={x:q.candyHomeX??q.x,y:groundY(s.level.route,q.candyHomeX??q.x)};q.absorbSlot??=0;}
  const age=e.phaseAge-q.absorbStartedAt,v=witchVessel(e);
  if(q.state==='absorbing'){
   const u=Math.max(0,Math.min(hasSoulPumpkinRoom(s)?1:.92,(age-.7)/1.45)),from=q.absorbFrom;
   q.absorbProgress=u;q.x=from.x+(v.x-from.x)*u;q.y=from.y+(v.y+9-from.y)*u-Math.sin(u*Math.PI)*(45+q.absorbSlot%3*14);
   if(u>=1){q.state='absorbed';if(!q.absorbHealed){e.hp=Math.min(e.maxHp,e.hp+3);q.absorbHealed=true;}e.healGlow=.8;}
  }
  // One victim per shell. Space and stagger affect release, never ownership.
  if(q.state==='absorbed'&&age>=2.8&&e.phaseAge>=e.nextPumpkinAt&&hasSoulPumpkinRoom(s)){
   spawnSoulPumpkin(s,e,q);e.nextPumpkinAt=e.phaseAge+.18;s.notice='villagePumpkinRescue';s.noticeTime=3;
  }
 }
 // Running out of shell capacity ends the completed spell naturally. Candies
 // remain cursed and rescuable; hits never interrupt the ritual.
 if(e.phaseAge>=(e.absorbDuration||3.05)+.8&&s.player.candy?.absorber!==witchId(e)){
  for(const q of pendingVictims(s,e)){q.state='candy';q.x=q.candyHomeX??q.x;q.y=groundY(s.level.route,q.x);q.absorbRestUntil=(s.time||0)+4;delete q.absorbProgress;delete q.absorbFrom;}
  finishAbsorption(e);return true;
 }
 const pending=pendingVictims(s,e);e.absorbIds=pending.map(q=>q.id);
 if(!pending.length&&s.player.candy?.absorber!==witchId(e)&&e.phaseAge>=3.05)finishAbsorption(e);
 return true;
}
