import {SUPER_COST,SUPER_EXHAUSTION,SUPER_WINDUP,SUPER_DURATION} from './adventureMagic';
import {hexyMuzzle} from '../actors/hexy/hexyAnimation';
import {bossTargets} from '../actors/enemies/adventureEnemies';
import {damageOutpost} from '../actors/enemies/adventureOutposts';
import {damageSupply} from '../world/adventureSupplies';
import {bossHitFeedback} from '../actors/bosses/bossFeedback';
import {SUPER_RECHARGE} from './adventureRewards';
import {superCapacity,reserveRecharge} from './adventureMods';
import {stepSuperRecoil} from './adventureSuperRecoil';

// R commits immediately. The cinematic owns simulation time until it ends;
// enemies, ordinary bullets, platforms and the camera remain exactly frozen.
// Hexy alone retreats gently under the force of the sustained discharge.
export function beginSuper(s,input){
 const p=s.player;
 if(!input.super||s.lastInput.super)return false;
 const reserve=superCapacity(s)>1&&s.superReserve>0;
 if(s.superCooldown>0&&!reserve){s.notice='superRecharging';s.noticeTime=2;return false;}
 if(s.exhaustion>0){s.notice='exhausted';s.noticeTime=3;return false;}
 if(s.magic<SUPER_COST){s.notice='superLow';s.noticeTime=3;return false;}
 if(p.dash||p.hitReact||p.guarding||p.specialCast||p.drinkCast>0)return false;
 const axis=(input.right?1:0)-(input.left?1:0);if(axis)p.dir=axis;
 s.superCinematic={age:0,pulses:0,origin:{x:p.x+p.dir*28,y:p.y-44},dir:p.dir,airborne:p.ground===null};
 if(s.superCooldown>0){s.superReserve=0;s.reserveCooldown=reserveRecharge(s);}else s.superCooldown=SUPER_RECHARGE;
 s.magic-=SUPER_COST;p.charge=.001;p.superCast=0;p.spin=0;p.gliding=false;p.cast=0;p.firing=false;p.pendingSpecial=null;
 s.hitStop=0;s.events.push('superCharge');return true;
}

export function stepSuper(s,dt,{defeat,particles,burst,say}){
 const q=s.superCinematic,p=s.player,previous=q.age;q.age+=dt;
 p.charge=q.age<SUPER_WINDUP?q.age:0;
 p.superCast=q.age>=SUPER_WINDUP?.32:0;
 stepSuperRecoil(s,previous);
 if(previous<SUPER_WINDUP&&q.age>=SUPER_WINDUP){q.origin=hexyMuzzle(s);s.events.push('superCast');s.shake=.26;}
 if(q.age>=SUPER_WINDUP)q.origin=hexyMuzzle(s);
 const inBeam=(x,y,pad=0)=>{const distance=(x-q.origin.x)*q.dir;return distance>=-50-pad&&distance<=1050+pad&&Math.abs(y-q.origin.y)<110+pad;};
 const bodyInBeam=t=>{const ends=[(t.x-q.origin.x)*q.dir,(t.x+t.w-q.origin.x)*q.dir];return Math.max(...ends)>-50&&Math.min(...ends)<1050&&t.y<q.origin.y+110&&t.y+t.h>q.origin.y-110;};
 const due=q.age<SUPER_WINDUP?0:Math.min(8,1+Math.floor((q.age-SUPER_WINDUP)/.24));
 while(q.pulses<due){
  q.pulses++;s.events.push('superPulse');s.shake=Math.max(s.shake,.16);
  for(const shot of s.hostile)if(shot.life>0&&inBeam(shot.x,shot.y,shot.r)){shot.life=0;particles(s,shot.x,shot.y,'#bcecff',3);}
  for(const cage of s.cages)if(!cage.open&&!cage.carried&&!cage.lost&&inBeam(cage.x,cage.y-32,30)){cage.hp=0;cage.open=true;particles(s,cage.x,cage.y-30,'#ffe6a7',8);}
  for(const tent of s.outposts)if(tent.hp>0&&inBeam(tent.x,tent.y-65,90))damageOutpost(s,tent,8);
  for(const crate of s.supplies)if(crate.hp>0&&inBeam(crate.x,crate.y-30,40))damageSupply(s,crate,8);
  for(const enemy of s.enemies)if(enemy.hp>0&&inBeam(enemy.x,enemy.y-32,30)){
   enemy.hp-=8;enemy.flash=.18;burst(s,enemy.x,enemy.y-32,0,85);if(enemy.hp<=0)defeat(s,enemy);
  }
  const b=s.boss;
  if(b.hp>0&&!['sleep','intro','transform','defeated'].includes(b.phase)&&bossTargets(s).some(t=>s.index===1?bodyInBeam(t):inBeam(t.x+t.w/2,t.y+t.h/2,Math.max(t.w,t.h)/2))){
   b.trailHp=Math.max(b.trailHp||b.hp,b.hp);b.hp=Math.max(0,b.hp-8);bossHitFeedback(s,true);b.recoil=q.dir;
   burst(s,b.x,b.y-(s.index===1?204:55),0,150);particles(s,b.x,b.y-(s.index===1?204:50),'#fff1a4',6);
   if(!b.hp){b.phase='defeated';s.arenaLocked=false;s.hearts=Math.min(s.maxHearts,s.hearts+2);s.score+=60;s.events.push('bossDown');say(s,'bossDown');s.hostile=[];s.enemies=s.enemies.filter(e=>e.x<s.level.arena.left);}
  }
 }
 if(q.age>=SUPER_DURATION){
  s.superCinematic=null;s.exhaustion=SUPER_EXHAUSTION;p.charge=0;p.superCast=0;p.hurt=Math.max(p.hurt,.4);p.magicDelay=.1;
  s.hostile=s.hostile.filter(h=>h.life>0);s.shots=s.shots.filter(h=>h.life>0);
 }
}
