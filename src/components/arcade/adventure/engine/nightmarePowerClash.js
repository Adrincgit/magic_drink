import {hexyMuzzle} from '../actors/hexy/hexyAnimation';
import {nightmareCrown,nightmareHand,NIGHTMARE_ULTIMATE} from '../actors/bosses/nightmareUltimate';
import {SUPER_WINDUP,SUPER_EXHAUSTION} from './adventureMagic';
import {followAdventureCamera} from '../render/adventureCamera';
import {stepSuperSurface} from './adventureSuperSurface';
import {stepWorldEffects} from './adventureEffects';
import {emitClashSparks,stepClashSparks} from './clashParticles';
import {nightmarePressureWave,nightmareResistance} from './nightmareActing';
import {impactSmoke} from './cinematicImpact';
import {worldSound} from './adventureWorldAudio';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export const NIGHTMARE_CLASH={duration:20,extension:10,maxRemaining:20,bossCharge:1.25,bossRelease:.85,boostCharge:.85,boostRelease:.28,damage:260,flight:1.45,land:2.4};
export const nightmareClashRemaining=q=>Math.max(0,q.limit-q.contestAge);
function extendClock(q){q.limit=q.contestAge+Math.min(NIGHTMARE_CLASH.maxRemaining,nightmareClashRemaining(q)+NIGHTMARE_CLASH.extension);}
function bossCounter(s){const q=s.powerClash;q.bossBoost=true;q.boostPressure=q.pressure;q.state='boss-boost';q.age=0;s.events.push('harlequinPowerPulse');}
function resolve(s,won,reason){
 const q=s.powerClash;q.state='resolve';q.age=0;q.won=won;q.resolutionReason=reason;q.resolveFrom=q.pressure;
 q.resolveDuration=.22+Math.abs((won?1:0)-q.pressure)*.65;s.events.push(won?'clashWin':'clashLose');
}
export const canNightmareClash=s=>!!s.level.badDreams&&s.boss.hp>0&&s.boss.nightmareUltimate?.state==='charge';
export function beginNightmareClash(s){
 if(!s.superCinematic||!canNightmareClash(s))return false;
 const p=s.player,h=nightmareHand(s),dx=h.x-p.x,dy=h.y-(p.y-55),len=Math.max(1,Math.hypot(dx,dy));
 p.dir=Math.sign(dx)||p.dir;s.superCinematic.aim={x:dx/len,y:dy/len};s.superCinematic.dir=p.dir;
 Object.assign(p,{vx:0,vy:0,dash:0,spin:0,gliding:false,guarding:false,firing:false,hitReact:0});
 s.powerClash={kind:'nightmare',state:'windup',age:0,contestAge:0,pressure:.5,portraitPressure:.5,taps:0,lastTap:-1,tapPulse:0,won:null,sparks:[],sparkSeed:0,sparkClock:0,crown:nightmareCrown(s),bossCharged:s.boss.nightmareUltimate.age,windup:Math.max(SUPER_WINDUP,NIGHTMARE_ULTIMATE.charge-s.boss.nightmareUltimate.age),bossBoost:false,hexyBoost:false,boostReady:false,limit:NIGHTMARE_CLASH.duration,impactAge:99,boostFlash:0,bossAmplification:0,hexyAmplification:0,surgeAge:0,windFlow:-1,windPhase:0};
 s.hostile=[];s.shots=[];s.hitStop=0;s.boss.vulnerable=false;return true;
}
export function nightmareContact(s){
 const q=s.powerClash,a=hexyMuzzle(s),b=nightmareHand(s),t=clamp(q?.pressure??.5,0,1);
 return{x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,a,b};
}
function contest(s){const q=s.powerClash;q.state='contest';q.age=0;s.player.charge=0;s.player.superCast=.32;s.superCinematic.age=SUPER_WINDUP+.25;}
function impact(s,cause='contact'){const q=s.powerClash;impactSmoke(s,s.player.x,s.level.arena.y,q.hexyBoost?1.5:1);q.impactAge=0;q.impactCause=cause;q.boostFlash=.24;s.shake=.3;s.events.push('clashImpact');const h=nightmareContact(s);emitClashSparks(q,h.x,h.y,38);}
function launch(s){
 const q=s.powerClash,p=s.player,b=s.boss,loser=q.won?b:p,dir=Math.sign(b.x-p.x)||1;
 q.state='flight';q.age=0;q.explosion={x:loser.x,y:loser.y-70};q.bossReturnY=b.y;q.flight={x:loser.x,y:loser.y,toX:clamp(loser.x+(q.won?dir:-dir)*1250,130,s.level.width-130)};
 loser.clashFlight={frame:0};p.superCast=0;
 if(q.won){b.hp=Math.max(0,b.hp-NIGHTMARE_CLASH.damage);s.dreamRoofTorn=true;}else{s.hearts=0;worldSound(s,'candyTransform',p.x,p.y);}
 // The manga flash belongs to the actual explosion on the losing actor,
 // after the winning beam has travelled there, rather than the verdict.
 q.impactAge=0;q.impactCause='explosion';q.boostFlash=.24;s.events.push('clashImpact');
 impactSmoke(s,loser.x,s.level.arena.y,1.8);emitClashSparks(q,q.explosion.x,q.explosion.y,70);s.events.push('clashExplosion');s.shake=.42;
}
function finish(s,hurt){
 const q=s.powerClash,p=s.player,b=s.boss,won=q.won;
 s.powerClash=null;s.superCinematic=null;p.charge=0;p.superCast=0;delete p.clashFlight;delete b.clashFlight;delete b.nightmareUltimate;
 b.y=s.level.arena.y;b.phase='recover';b.timer=won?3:1.7;b.phaseAge=0;b.vulnerable=true;b.nightmareCooldown=NIGHTMARE_ULTIMATE.cooldown;s.exhaustion=SUPER_EXHAUSTION;
 // The landing has already played her fall. Continue with its last cel
 // instead of restarting an upright hit/fall sequence on the next tick.
 if(won&&b.hp<=0){b.phase='dying';b.phaseAge=2.2;b.timer=.5;b.defeat={ready:false};b.vulnerable=false;}
 if(won)p.hurt=Math.max(p.hurt,.7);else{p.hurt=0;hurt();p.vx=0;p.vy=0;p.hitReact=0;if(s.done)p.clashFlight={frame:4};}
}
export function stepNightmareClash(s,input,dt,{hurt}){
 if(s.episodeTwo)s.episodeTwo.captionAge=Math.max(0,s.episodeTwo.captionAge-dt);
 const q=s.powerClash,p=s.player,b=s.boss;q.age+=dt;
 const holding=q.state==='boss-boost'&&q.age<NIGHTMARE_CLASH.bossCharge||q.state==='hexy-boost'&&q.age<NIGHTMARE_CLASH.boostCharge;
 if(!holding)q.windPhase+=dt*q.windFlow;
 q.impactAge+=dt;q.tapPulse=Math.max(0,q.tapPulse-dt);q.boostFlash=Math.max(0,q.boostFlash-dt);s.time+=dt;b.clock+=dt;
 if(q.counterReactionAge!==undefined)q.counterReactionAge+=dt;
 q.portraitPressure+=(q.pressure-q.portraitPressure)*(1-Math.exp(-dt*6));q.wave=Math.max(nightmarePressureWave(q.contestAge),q.finalSurgeAge!==undefined?Math.sin(Math.PI*clamp(q.finalSurgeAge/1.2,0,1)):0);stepWorldEffects(s,dt);stepClashSparks(q,dt);
 q.actingTime=(q.actingTime||0)+dt*(q.state==='boss-boost'&&q.age<NIGHTMARE_CLASH.bossCharge?.55:1);
 q.visualTime=(q.visualTime||0)+dt*(holding?0:1);
 if(q.bossBoost&&!q.hexyBoost&&q.portraitPressure<.25)q.bossJoyTier=2;
 p.vx=0;p.vy=0;p.hitReact=0;
 if(q.state==='windup'){
  q.crown=nightmareCrown(s);const chargeAge=Math.min(1,q.age/q.windup)*SUPER_WINDUP;s.superCinematic.age=chargeAge;p.charge=chargeAge;p.superCast=0;
  if(q.age>=q.windup){q.state='travel';q.age=0;p.charge=0;p.superCast=.32;s.superCinematic.origin=hexyMuzzle(s);s.events.push('superCast','harlequinRelease');}
 }else if(q.state==='travel'){
  s.superCinematic.age=SUPER_WINDUP+q.age;p.superCast=.32;
  if(q.age>=.55){contest(s);impact(s);}
 }else if(q.state==='contest'){
  q.contestAge+=dt;q.surgeAge+=q.bossBoost?dt:0;p.charge=0;p.superCast=.32;s.superCinematic.age=SUPER_WINDUP+.25;
  if(q.finalSurgeAge!==undefined)q.finalSurgeAge+=dt;
  if(input.attack&&!s.lastInput.attack&&q.contestAge-q.lastTap>=.045){q.lastTap=q.contestAge;q.taps++;q.pressure+=s.gentle?.037:.029;q.tapPulse=.12;s.events.push('clashTap');}
  q.pressure=clamp(q.pressure-dt*nightmareResistance(q,s.gentle),0,1);
  if(q.hexyBoost&&!q.finalSurgeUsed&&q.pressure>=.82&&q.age>.4){
   q.finalSurgeUsed=true;q.finalSurgeAge=0;q.pressure=Math.max(.5,q.pressure-(s.gentle?.055:.085));
   q.tapPulse=.16;s.events.push('harlequinPowerPulse','clashPulse');
  }
  // The clock commits a winner, but the beam must visibly travel to its
  // target before damage. Her one surprise intercepts that apparent win.
  if(!q.bossBoost&&q.pressure>=.88){
   bossCounter(s);
  }else if(nightmareClashRemaining(q)<=0){
   if(!q.bossBoost&&q.pressure>=.5){q.state='breakthrough';q.age=0;q.breakthroughFrom=q.pressure;}
   else resolve(s,q.pressure>=.5,'time');
  }else if(q.pressure<=0||q.pressure>=1){
   resolve(s,q.pressure>=1,'contact');
  }else if(q.boostReady&&!q.hexyBoost&&input.super&&!s.lastInput.super){
   q.hexyBoost=true;q.boostReady=false;q.boostPressure=q.pressure;q.state='hexy-boost';q.age=0;s.events.push('superCharge');
  }
  q.dustClock=(q.dustClock||0)+dt;if(q.dustClock>.48){q.dustClock=0;const direction=q.windFlow;for(let i=0;i<3;i++)s.effects.push({cinematicSmoke:true,x:p.x+direction*(80+i*90),y:s.level.arena.y-4,size:50+i*16,vx:direction*(130+i*25),vy:-25,age:0,life:1.1,duration:1.1,seed:i,alpha:.5});}
  const h=nightmareContact(s);q.sparkClock+=dt;while(q.sparkClock>=.035){q.sparkClock-=.035;emitClashSparks(q,h.x,h.y,2);}
  if(q.contestAge>=(q.nextArc??.3)){q.nextArc=q.contestAge+[.32,.48,.27,.61][q.taps%4];s.events.push('clashArc','clashPulse');}
 }else if(q.state==='breakthrough'){
  p.charge=0;p.superCast=.32;
  const t=clamp(q.age/.72,0,1),ease=t*t*(3-2*t);q.pressure=q.breakthroughFrom+(.91-q.breakthroughFrom)*ease;
  if(t>=1)bossCounter(s);
 }else if(q.state==='boss-boost'){
  p.charge=0;p.superCast=.32;q.bossAmplification=clamp((q.age-NIGHTMARE_CLASH.bossCharge)/NIGHTMARE_CLASH.bossRelease,0,1);
  if(q.age>=NIGHTMARE_CLASH.bossCharge&&!q.bossReleased){q.bossReleased=true;extendClock(q);impact(s,'boss-surge');s.events.push('harlequinRelease');}
  if(q.bossReleased){q.contestAge+=dt;q.surgeAge+=dt;if(input.attack&&!s.lastInput.attack&&q.contestAge-q.lastTap>=.045){q.lastTap=q.contestAge;q.taps++;q.bossReleaseTaps=(q.bossReleaseTaps||0)+1;q.tapPulse=.12;s.events.push('clashTap');}}
  q.pressure=clamp(q.boostPressure+(Math.max(.16,Math.min(.34,q.boostPressure-.4))-q.boostPressure)*q.bossAmplification+Math.min(.13,(q.bossReleaseTaps||0)*.016),0,1);
  if(q.age>=NIGHTMARE_CLASH.bossCharge+NIGHTMARE_CLASH.bossRelease){q.boostReady=true;contest(s);}
 }else if(q.state==='hexy-boost'){
  const charge=clamp(q.age/NIGHTMARE_CLASH.boostCharge,0,1),release=clamp((q.age-NIGHTMARE_CLASH.boostCharge)/NIGHTMARE_CLASH.boostRelease,0,1);
  q.hexyAmplification=release;q.windFlow=-1+2*release;
  s.superCinematic.age=charge*SUPER_WINDUP;p.charge=charge*SUPER_WINDUP;p.superCast=0;
  if(charge>=1&&!q.hexyReleased){q.hexyReleased=true;extendClock(q);q.counterReactionAge=0;impact(s,'hexy-reversal');s.events.push('superCast');}
  if(q.hexyReleased)q.contestAge+=dt;
  const ease=release*release*(3-2*release);q.pressure=q.boostPressure+(.5-q.boostPressure)*ease;
  if(release>=1){stepSuperSurface(s,dt);for(const d of s.superCinematic.surfaceDust||[]){d.vx*=1.8;d.vy*=1.3;d.size*=1.25;}q.pressure=.5;q.portraitPressure=.5;contest(s);}
 }else if(q.state==='resolve'){
  p.charge=0;p.superCast=.32;
  const t=clamp(q.age/q.resolveDuration,0,1),ease=t*t*(3-2*t);q.pressure=q.resolveFrom+((q.won?1:0)-q.resolveFrom)*ease;
  if(t>=1)launch(s);
 }else if(q.state==='flight'){
  p.charge=0;p.superCast=0;const loser=q.won?b:p,t=clamp(q.age/NIGHTMARE_CLASH.flight,0,1),ease=1-(1-t)**2;
  loser.x=q.flight.x+(q.flight.toX-q.flight.x)*ease;loser.y=q.flight.y+(s.level.arena.y-q.flight.y)*t-Math.sin(t*Math.PI)*(q.won?330:260);loser.clashFlight.frame=Math.min(3,Math.floor(t*4));
  if(t>=1){q.state='land';q.age=0;loser.y=s.level.arena.y;loser.clashFlight.frame=4;impactSmoke(s,loser.x,loser.y,1.65);s.events.push('clashLand');s.shake=.28;}
 }else if(q.state==='land'){
  if(!q.won){const t=clamp(q.age/1.8,0,1);b.y=q.bossReturnY+(s.level.arena.y-q.bossReturnY)*t*t;}
  const loser=q.won?b:p;loser.clashFlight.frame=q.age<.85?4:q.age<1.4?5:q.age<1.9?6:7;
  if(q.age>=NIGHTMARE_CLASH.land)finish(s,hurt);
 }
 if(s.powerClash){const h=nightmareContact(s);q.focus={x:h.x,y:h.y};}
 if(s.superCinematic)stepSuperSurface(s,dt);followAdventureCamera(s,dt);
}
