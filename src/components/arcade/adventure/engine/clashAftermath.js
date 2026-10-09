import {SUPER_EXHAUSTION,SUPER_BOSS_DAMAGE} from './adventureMagic';
import {HARLEQUIN_ULTIMATE} from '../actors/bosses/harlequinUltimate';
import {followAdventureCamera} from '../render/adventureCamera';
import {impactSmoke} from './cinematicImpact';
import {fireImpact} from '../actors/bosses/harlequinFire';
import {clashThrowTarget} from './clashGeometry';
export const CLASH_DAMAGE=SUPER_BOSS_DAMAGE*3;
export const CLASH_FLIGHT=1.3;
export const CLASH_RECOVERY=3.4;
export function launchClashLoser(s){
 const q=s.powerClash,p=s.player,b=s.boss,loser=q.won?b:p,winner=q.won?p:b;
 q.state='flight';q.age=0;q.loser=q.won?'boss':'hexy';q.blastAge=0;
 q.explosion={x:loser.x,y:loser.y-(q.won?85:40)};
 q.flight={fromX:loser.x,fromY:loser.y,toX:clashThrowTarget(s,loser,winner,q.won)};
 loser.clashFlight={frame:0};loser.vx=0;loser.vy=0;p.charge=0;p.superCast=0;
 if(b.ultimate)b.ultimate.state='recover';
 if(q.won){b.trailHp=Math.max(b.trailHp||b.hp,b.hp);b.hp=Math.max(0,b.hp-CLASH_DAMAGE);b.flash=.15;b.scorched=Math.min(.4,(b.scorched||0)+.28);b.smokeTime=10;b.smokeClock=0;}
 s.events.push('clashExplosion');s.shake=.45;
 fireImpact(s,loser.x,loser.y-40,1.8);impactSmoke(s,loser.x,loser.y,2.05);
}
export function stepClashAftermath(s,dt,{hurt,finishBoss}){
 const q=s.powerClash,p=s.player,b=s.boss,loser=q.won?b:p,floor=s.level.arena.y;
 q.blastAge+=dt;p.charge=0;p.superCast=0;
 if(q.state==='flight'){
  const t=Math.min(1,q.age/CLASH_FLIGHT),ease=1-Math.pow(1-t,2.1);
  loser.x=q.flight.fromX+(q.flight.toX-q.flight.fromX)*ease;
  loser.y=q.flight.fromY+(floor-q.flight.fromY)*t-Math.sin(t*Math.PI)*210;
  loser.clashFlight.frame=Math.min(3,Math.floor(t*4));
  if(t===1){q.state='land';q.age=0;loser.y=floor;loser.clashFlight.frame=4;
   s.events.push('clashLand');s.shake=.28;impactSmoke(s,loser.x,floor,1.4);}
 }else{
  const survives=q.won?b.hp>0:s.hearts>4;
  // Both new fall sequences use the fifth drawing for a prone defeat.
  // The next drawing begins sitting up, so a lethal blow must stay prone.
  loser.clashFlight.frame=!survives?4:q.age<.85?4:q.age<1.65?5:q.age<2.5?6:7;
  if(q.age>=(survives?CLASH_RECOVERY:1.9)){
   s.superCinematic=null;s.exhaustion=SUPER_EXHAUSTION;delete b.ultimate;b.ultimateCooldown=HARLEQUIN_ULTIMATE.cooldown;
   delete p.clashFlight;if(b.hp>0)delete b.clashFlight;delete s.powerClash;
   if(b.hp>0){b.phase='recover';b.timer=q.won?3:1.3;b.exhausted=q.won?3:0;b.vulnerable=true;b.move='';}
   if(q.won){p.hurt=Math.max(p.hurt,.7);finishBoss(s);}
   else{p.hurt=0;hurt();p.hitReact=0;p.vx=0;p.vy=0;p.ground=s.platforms.findIndex(t=>p.x>=t.x&&p.x<=t.x+t.w);if(s.done)p.clashFlight={frame:4};
    // The approach is real floor: allow Hexy to run back after landing there.
    if(!s.done&&(p.x<s.level.arena.left+24||p.x>s.level.arena.right-24))s.clashRetreatBounds={left:Math.min(s.level.arena.left+24,p.x-60),right:Math.max(s.level.arena.right-24,p.x+60)};
   }
  }
 }
 followAdventureCamera(s,dt);
}
