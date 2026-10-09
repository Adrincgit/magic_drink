import {SUPER_WINDUP} from './adventureMagic';
import {hexyMuzzle} from '../actors/hexy/hexyAnimation';
import {ultimateHand} from '../actors/bosses/harlequinUltimate';
import {stepWorldEffects} from './adventureEffects';
import {launchClashLoser,stepClashAftermath} from './clashAftermath';
import {emitClashSparks,stepClashSparks} from './clashParticles';
import {followAdventureCamera} from '../render/adventureCamera';
import {clashPressureWave,clashResistance} from './clashActing';
import {updateSupplies} from '../world/adventureSupplies';
export {clashPortraitFrames} from './clashActing';

export const CLASH_DURATION=20;
export const CLASH_MIN_DURATION=6;
export const CLASH_TRAVEL=.34;
export const CLASH_TAP_STRENGTH={normal:.0215,gentle:.02795};
export function canPowerClash(s){return s.index===3&&s.boss.hp>0&&s.boss.stage===3&&s.boss.ultimate?.state==='charge';}
export function beginPowerClash(s){
 if(!s.superCinematic||!canPowerClash(s))return false;
 const p=s.player,b=s.boss;p.dir=Math.sign(b.x-p.x)||1;s.superCinematic.dir=p.dir;
 Object.assign(p,{vx:0,vy:0,dash:0,spin:0,gliding:false,guarding:false,firing:false,hitReact:0});
 s.powerClash={state:'windup',age:0,contestAge:0,pressure:.5,taps:0,lastTap:-1,tapPulse:0,won:null,rally:0,sparks:[],sparkSeed:0,sparkClock:0};
 s.shots=[];s.hostile=[];s.hitStop=0;b.vulnerable=false;return true;
}
export function clashContact(s){
 const q=s.powerClash,a=hexyMuzzle(s),b=ultimateHand(s.boss,false),t=q?.pressure??.5;
 return{x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,a,b};
}
function resolve(s,won){
 const q=s.powerClash;q.state='resolve';q.age=0;q.won=won;
 s.events.push(won?'clashWin':'clashLose');s.shake=.3;
}
export function stepPowerClash(s,input,dt,{hurt,finishBoss}){
 const q=s.powerClash,p=s.player,b=s.boss;if(!q)return;
 updateSupplies(s,dt);
 q.flashPulse=Math.max(0,(q.flashPulse||0)-dt);
 q.age+=dt;s.time+=dt;b.flash=Math.max(0,b.flash-dt);q.tapPulse=Math.max(0,q.tapPulse-dt);q.rally=Math.max(0,q.rally-dt);stepWorldEffects(s,dt);stepClashSparks(q,dt);
 if(q.state==='windup'){
  s.superCinematic.age=Math.min(SUPER_WINDUP,q.age);p.charge=q.age;p.superCast=0;
  if(Math.floor(q.age/.5)!==Math.floor((q.age-dt)/.5))s.events.push('harlequinPowerPulse');
  if(q.age>=SUPER_WINDUP){
   q.state='travel';q.age=0;p.charge=0;p.superCast=.32;b.ultimate.state='fire';b.ultimate.age=0;b.phase='ultimate-fire';
   s.superCinematic.origin=hexyMuzzle(s);s.events.push('superCast','harlequinRelease');s.shake=.18;
  }
 }else if(q.state==='travel'){
  p.superCast=.32;s.superCinematic.age=SUPER_WINDUP+q.age;b.ultimate.age=q.age;
  if(q.age>=CLASH_TRAVEL){q.state='contest';q.age=0;s.events.push('clashImpact');s.shake=.3;const h=clashContact(s);emitClashSparks(q,h.x,h.y,40);}
 }else if(q.state==='contest'){
  q.contestAge=q.age;p.charge=0;p.superCast=.32;s.superCinematic.age=SUPER_WINDUP+.2+(q.age%.2);
  // Each press edge counts once. Keyboard repeat/holding cannot win, and a
  // sane input-rate cap keeps refresh rate and multi-button bindings fair.
  if(input.attack&&!s.lastInput.attack&&q.age-q.lastTap>=.075){
   q.lastTap=q.age;q.taps++;if(q.pressure<.55&&q.taps%3===0)q.rally=.8;
   q.pressure+=s.gentle?CLASH_TAP_STRENGTH.gentle:CLASH_TAP_STRENGTH.normal;q.tapPulse=.12;s.events.push('clashTap');
  }
  const previousWave=q.wave||0;q.wave=clashPressureWave(q.age,s.gentle);
  if(previousWave<.1&&q.wave>=.1){s.events.push('harlequinPowerPulse');s.shake=.18;q.flashPulse=.075;}
  const resistance=clashResistance(q.age,s.gentle);
  q.pressure=Math.max(.02,Math.min(.98,q.pressure-dt*resistance));
  const h=clashContact(s);q.sparkClock+=dt;
  while(q.sparkClock>=.04){q.sparkClock-=.04;emitClashSparks(q,h.x,h.y,2);}
  if(Math.floor((q.age-dt)/.4)!==Math.floor(q.age/.4))s.events.push('clashPulse');
  if(q.age>=CLASH_MIN_DURATION&&(q.pressure>=.97||q.pressure<=.03))resolve(s,q.pressure>.5);
  else if(q.age>=CLASH_DURATION)resolve(s,q.pressure>=.5);
  // Sparse, uneven electrical cracks ride the existing impact sparks. They
  // belong to the contest, never to breakthrough, flight or recovery.
  if(q.state==='contest'&&q.age>=(q.nextArc??.18)){
   q.arcCount=(q.arcCount||0)+1;
   q.nextArc=q.age+[.27,.52,.34,.68,.41][(q.arcCount-1)%5]*(q.wave>.6?.7:1);
   s.events.push('clashArc');
  }
 }else if(q.state==='resolve'){
  q.pressure+=(q.won?1-q.pressure:-q.pressure)*Math.min(1,dt*8);
  p.charge=0;p.superCast=.32;s.superCinematic.age=SUPER_WINDUP+.25;
  followAdventureCamera(s,dt);
  if(q.age>=.35){launchClashLoser(s);emitClashSparks(q,q.explosion.x,q.explosion.y,65);}
 }else stepClashAftermath(s,dt,{hurt,finishBoss});
 if(s.powerClash&&['windup','travel','contest'].includes(s.powerClash.state))followAdventureCamera(s,dt);
}
