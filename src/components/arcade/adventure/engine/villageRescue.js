import {groundY} from '../world/adventureTerrain';
import {isCandySpell,spawnSoulPumpkin,releaseVillageVictim,beginPumpkinDefeat} from './villagePumpkins';
import {beginPlayerDefeat} from './playerDefeat';
import {witchVessel} from '../actors/villageWitchAnchors';

export const witchId=e=>`witch:${e.spawnSeed}:${e.home}`;
export const villageNight=s=>Math.min(1,Math.max(0,(s.village?.furthest??s.player.x)/(s.level.width*.52)));
export const CANDY_ESCAPE_PRESSES=21,HEXY_ABSORB_DURATION=4.8;
export function beginCandyCapture(s,source){
 if(!isCandySpell(source)||s.player.candy)return;
 const p=s.player;
 p.candy={age:0,effort:0,required:CANDY_ESCAPE_PRESSES,pulse:0,last:{},owner:source.owner};
 Object.assign(p,{vx:0,vy:0,charge:0,jumpBuffer:0,dash:0,cast:0,specialCast:0,firing:false,hitReact:0,knockdown:null});
 s.aquaJet=null;s.voltBeam=null;s.placement=null;
 s.notice='villageCandyEscape';s.noticeTime=5;s.events.push('power');
}
// Count fresh presses and stick direction changes. Holding one input is not mashing.
export function stepCandyCapture(s,input,dt){
 const q=s.player.candy;if(!q)return false;
 q.age+=dt;q.pulse=Math.max(0,q.pulse-dt*4);
 const keys=['left','right','up','down','jump','attack','special','dash','guard'];
 if(keys.some(k=>input[k]&&!q.last[k])){q.effort++;q.pulse=1;}
 q.last={...input};s.player.vx=0;s.player.charge=0;s.player.firing=false;
 if(!q.terminal&&!q.pumpkin&&q.age>.55&&(q.effort>=CANDY_ESCAPE_PRESSES||q.age>=30)){
  const witch=s.enemies.find(e=>witchId(e)===q.absorber);if(witch?.phase==='absorb-player'){witch.phase='recover';witch.phaseAge=0;witch.timer=1.7;}
  delete s.player.candy;s.player.hurt=Math.max(s.player.hurt,.8);s.events.push('rescue');s.notice='villageCandyFree';s.noticeTime=2;return false;
 }
 let witch=s.enemies.find(e=>e.type===26&&e.hp>0&&witchId(e)===q.absorber);
 if(witch&&(witch.flash>0||witch.trap>0||witch.phase!=='absorb-player')){delete q.absorber;delete q.tether;q.noAbsorbUntil=q.age+1.4;witch=null;}
 if(!witch&&q.age>Math.max(1.05,q.noAbsorbUntil||0)){
  // Capture has priority over the next attack/recovery timer. Waiting for a
  // zero-timer patrol frame races the enemy update and can starve forever.
  witch=s.enemies.filter(e=>e.type===26&&e.hp>0&&e.active&&!e.trap&&e.flash<=0&&!['absorb','absorb-player'].includes(e.phase)&&!(e.phase==='attack'&&e.phaseAge<.25)&&Math.abs(e.x-s.player.x)<620).sort((a,b)=>Math.abs(a.x-s.player.x)-Math.abs(b.x-s.player.x))[0];
  if(witch){q.absorber=witchId(witch);q.absorbAge=0;q.from={x:s.player.x,y:s.player.y};witch.phase='absorb-player';witch.phaseAge=0;witch.dir=Math.sign(s.player.x-witch.x)||witch.dir;s.notice='villageHexyAbsorbed';s.noticeTime=6;s.events.push('power');}
 }
 if(witch){
  q.absorbAge+=dt;const u=Math.max(0,Math.min(1,(q.absorbAge-.55)/(HEXY_ABSORB_DURATION-.55))),ease=u*u*(3-2*u);
  const vessel=witchVessel(witch);q.absorbProgress=u;q.tether={x:q.from.x+(vessel.x-q.from.x)*ease,y:q.from.y+(vessel.y+25-q.from.y)*ease-Math.sin(u*Math.PI)*65};
  if(q.absorbAge>=HEXY_ABSORB_DURATION){s.player.x=q.tether.x;s.player.y=q.tether.y;q.pumpkin=true;q.convertAge=0;s.hearts=0;beginPlayerDefeat(s);}
 }
 return true;
}
export function releaseWitchVictims(s,e){
 if(e.type!==26)return;
 const owner=witchId(e);
 for(const orb of s.enemies)if(orb.orbitParent===owner&&orb.hp>0){orb.hp=0;orb.defeated=true;beginPumpkinDefeat(s,orb);}
 if(s.player.candy?.absorber===owner){const q=s.player.candy;delete q.absorber;delete q.tether;q.noAbsorbUntil=q.age+1.4;}
 for(const q of s.villagers||[])if(q.curseOwner===owner&&['turning','candy','absorbing','absorbed'].includes(q.state)){
  releaseVillageVictim(s,q);
 }
 // An already airborne spell cannot imprison another victim after its owner dies.
 for(const q of s.hostile)if(isCandySpell(q)&&q.owner===owner)q.life=0;
 if(e.flying){delete e.popcornDefeat;e.witchFall={age:0,vy:-95,vx:-e.dir*65,landed:false};e.deadTime=3;}
}
export function stepFallingWitch(s,e,dt){
 const q=e.witchFall;if(!q)return false;
 q.age+=dt;e.deathAge=q.age;
 if(!q.landed){q.vy+=630*dt;e.x+=q.vx*dt;e.y+=q.vy*dt;const floor=groundY(s.level.route,e.x);if(e.y>=floor){e.y=floor;q.landed=true;q.landAge=0;s.events.push('impact');}}
 else q.landAge+=dt;
 e.deadTime=q.landed?Math.max(0,1.1-q.landAge):3;
 return true;
}
export function stepWitchAbsorption(s,e,dt){
 if(e.phase==='absorb'){
  const victim=s.villagers.find(q=>q.id===e.absorbId);
  if(!victim||(!e.absorbCommitted&&!['candy','absorbing'].includes(victim.state))||e.flash>0){
   if(victim?.state==='absorbed'&&e.absorbCommitted&&!e.absorbLaunched){spawnSoulPumpkin(s,e,victim);e.absorbLaunched=true;}
   if(victim?.state==='absorbing'){victim.state='candy';victim.x=victim.candyHomeX;victim.y=groundY(s.level.route,victim.x);}
   e.phase='recover';e.phaseAge=0;e.timer=1;return true;
  }
  if(!e.absorbCommitted){
   const u=Math.max(0,Math.min(1,(e.phaseAge-.7)/1.45));victim.state='absorbing';victim.absorbProgress=u;
   const vessel=witchVessel(e);victim.x=victim.candyHomeX+(vessel.x-victim.candyHomeX)*u;victim.y=groundY(s.level.route,victim.candyHomeX)+(vessel.y+9-groundY(s.level.route,victim.candyHomeX))*u-Math.sin(u*Math.PI)*45;
   if(u>=1){e.absorbCommitted=true;victim.state='absorbed';e.hp=Math.min(e.maxHp,e.hp+3);e.healGlow=.8;}
  }
  if(e.absorbCommitted&&!e.absorbLaunched&&e.phaseAge>=2.8){spawnSoulPumpkin(s,e,victim);e.absorbLaunched=true;s.notice='villagePumpkinRescue';s.noticeTime=3;}
  if(e.phaseAge>=3.05){e.phase='recover';e.phaseAge=0;e.timer=2.3;}
  return true;
 }
 e.healGlow=Math.max(0,(e.healGlow||0)-dt);
 if(e.phase!=='patrol'||e.timer>0||s.enemies.filter(q=>q.hp>0&&!q.orbitEscort&&q.sourceWitch===witchId(e)).length>=3)return false;
 const victim=s.villagers.find(q=>q.state==='candy'&&Math.abs(q.x-e.x)<620);
 if(!victim)return false;
 e.phase='absorb';e.dir=Math.sign(victim.x-e.x)||e.dir;e.phaseAge=0;e.absorbId=victim.id;e.absorbCommitted=false;e.absorbLaunched=false;victim.candyHomeX=victim.x;victim.curseOwner=witchId(e);return true;
}
