import {groundY} from '../world/adventureTerrain';
import {captureInBubble} from './adventureBubbles';
import {guardEfficiency} from './adventureMods';
export const GUARD_DRAIN=26.4;
export const GUARD_HIT_COST=4.4;
export function updateGuard(s,input,dt){
 const p=s.player;
 p.guardHit=Math.max(0,(p.guardHit||0)-dt);p.guardBreak=Math.max(0,(p.guardBreak||0)-dt);
 s.shieldHit=Math.max(0,(s.shieldHit||0)-dt);s.shieldBreak=Math.max(0,(s.shieldBreak||0)-dt);
 p.magicDelay=Math.max(0,(p.magicDelay||0)-dt);
 if(!input.guard)p.guardExhausted=false;
 const active=!!input.guard&&!p.guardExhausted&&!p.dash&&!p.hitReact&&!p.specialCast&&!p.superCast&&s.magic>0;
 if(active){
  if(!p.guarding)s.events.push('guardRaise');
  p.charge=0;p.pendingSpecial=null;p.guarding=true;p.magicDelay=.6;
  s.magic=Math.max(0,s.magic-GUARD_DRAIN*guardEfficiency(s)*dt);
  if(!s.magic)breakGuard(s);
 }else p.guarding=false;
}
export function breakGuard(s){const p=s.player;p.guarding=false;p.guardExhausted=true;p.guardBreak=.4;p.magicDelay=1;s.events.push('guardBreak');}
export function guardBlocks(s,shot){
 const p=s.player;if(!p.guarding||shot.life<=0)return false;
 const dx=(shot.x-p.x)*p.dir,dy=Math.abs(shot.y-(p.y-43));
 if(dx<18-shot.r||dx>66+shot.r||dy>54+shot.r)return false;
 shot.life=0;p.guardHit=.22;s.magic=Math.max(0,s.magic-GUARD_HIT_COST*guardEfficiency(s));s.events.push('guardBlock');
 s.effects.push({x:shot.x,y:shot.y,defense:true,size:54,age:0,life:.25});
 if(!s.magic)breakGuard(s);return true;
}

// Charged magic clears hostile bullets, including bombs before their explosion.
// Swept distance covers a fast shot crossing a small bullet within one fixed tick.
export function clearPowerProjectiles(s,shots=s.shots){
 for(const q of shots)if((q.heavy||q.kind===3)&&q.life>0){
  let cleared=false;
  for(const h of s.hostile)if(h.life>0){
   const x0=q.previousX??q.x,y0=q.previousY??q.y,dx=q.x-x0,dy=q.y-y0;
   const t=Math.max(0,Math.min(1,((h.x-x0)*dx+(h.y-y0)*dy)/(dx*dx+dy*dy||1)));
   if(Math.hypot(h.x-x0-dx*t,h.y-y0-dy*t)>q.r+h.r)continue;
   if(q.kind===3){if(captureInBubble(q,h))cleared=true;continue;}
   h.life=0;cleared=true;s.effects.push({x:h.x,y:h.y,spell:q.super?undefined:q.kind,super:!!q.super,size:46,age:0,life:.28});
  }
  if(cleared)s.events.push('bulletClear');
 }
}

export function buddyPosition(s,index){
 const p=s.player;
 const x=p.x-p.dir*(42+index*27);
 return {x,y:p.ground!==null&&s.level.groundRoute?groundY(s.platforms,x,p.y):p.y};
}
export function buddyFrame(s,index){
 const cast=s.buddyCast?.[index]||0;
 if(!cast)return null;
 return Math.min(11,Math.floor((.6-cast)*20));
}
export function buddyRollFrame(s){const p=s.player;return p.dash>0&&!p.dashAir?Math.min(7,Math.floor((1-p.dash/p.dashDuration)*8)):null;}
