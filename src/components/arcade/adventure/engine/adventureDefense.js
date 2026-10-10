import {fireImpact} from '../actors/bosses/harlequinFire';
import {burstEmberProjectile} from './adventureEmberBlast';
import {burstWaterProjectile} from '../actors/enemies/adventureDiver';
import {groundY,surfaceY} from '../world/adventureTerrain';
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
 if(shot.ember&&!shot.kind.includes('breath'))burstEmberProjectile(s,shot,{damaging:false,multiplier:.75});
 else if(shot.harlequin)fireImpact(s,shot.x,shot.y,.45);
 else if(shot.water||/^barge-(balloon|shell|wave|surf|jet)$/.test(shot.kind))burstWaterProjectile(s,shot);
 s.effects.push({x:shot.x,y:shot.y,defense:true,size:54,age:0,life:.25});
 if(!s.magic)breakGuard(s);return true;
}

// Charged magic clears hostile bullets, including bombs before their explosion.
// Swept distance covers a fast shot crossing a small bullet within one fixed tick.
export function clearPowerProjectiles(s,shots=s.shots){
 for(const q of shots)if((q.heavy||q.kind===3)&&q.life>0){
  let cleared=false;
  for(const h of s.hostile)if(h.life>0&&h.kind!=='ember-blast'){
   const x0=q.previousX??q.x,y0=q.previousY??q.y,dx=q.x-x0,dy=q.y-y0;
   const t=Math.max(0,Math.min(1,((h.x-x0)*dx+(h.y-y0)*dy)/(dx*dx+dy*dy||1)));
   if(Math.hypot(h.x-x0-dx*t,h.y-y0-dy*t)>q.r+h.r)continue;
   if(q.kind===3){if(captureInBubble(q,h))cleared=true;continue;}
   h.life=0;cleared=true;if(h.water||/^barge-(balloon|shell|wave|surf)$/.test(h.kind)){burstWaterProjectile(s,h);continue;}if(h.ember){burstEmberProjectile(s,h,{damaging:false,multiplier:5/6});continue;}if(h.harlequin){fireImpact(s,h.x,h.y,.5,h.kind==='harlequin-groundfire'||h.kind==='harlequin-pyre');continue;}s.effects.push({x:h.x,y:h.y,spell:q.super?undefined:q.kind,super:!!q.super,size:46,age:0,life:.28});
  }
  if(cleared)s.events.push('bulletClear');
 }
}

export function buddyPosition(s,index){
 if(s.buddies?.[index])return s.buddies[index];
 const p=s.player;
 const x=p.x-p.dir*(42+index*27);
 const platform=s.platforms[p.ground];
 const y=p.ground!==null?(platform?.kind==='earth'&&s.level.groundRoute?groundY(s.platforms,x,p.y):platform?surfaceY(platform,x):p.y):p.y;
 return {x,y,ground:p.ground,vy:p.vy,vx:p.vx,dir:p.dir};
}
// Follow Hexy's recent path, including the surface she actually stood on.
// Position changes are bounded; landing or turning cannot teleport a bunny.
export function stepBuddies(s,dt){
 if(!s.rescued)return;
 const p=s.player;s.buddies??=[];s.buddyPath??=[];
 s.buddyPath.push({x:p.x,y:p.y,dir:p.dir,ground:p.ground,time:s.time});
 while(s.buddyPath.length>1&&s.buddyPath[1].time<s.time-.5)s.buddyPath.shift();
 for(let i=0;i<s.rescued;i++){
  const past=s.time-.09-i*.065;
  let sample=s.buddyPath[0];for(const q of s.buddyPath){if(q.time>past)break;sample=q;}
  const x=sample.x-sample.dir*(42+i*27),platform=s.platforms[sample.ground];
  const y=sample.ground!==null?(platform?.kind==='earth'&&s.level.groundRoute?groundY(s.platforms,x,sample.y):platform?surfaceY(platform,x):sample.y):sample.y;
  const pet=s.buddies[i]??=buddyPosition(s,i),oldX=pet.x,oldY=pet.y;
  const follow=1-Math.exp(-dt*24),limit=(v,max)=>Math.max(-max,Math.min(max,v));
  pet.x+=limit((x-pet.x)*follow,620*dt);pet.y+=limit((y-pet.y)*follow,850*dt);
  if(Math.abs(y-pet.y)<.02)pet.y=y;
  pet.vx=(pet.x-oldX)/dt;pet.vy=(pet.y-oldY)/dt;pet.dir=Math.abs(pet.vx)>10?Math.sign(pet.vx):sample.dir;
  pet.ground=sample.ground!==null&&Math.abs(pet.y-y)<2?sample.ground:null;
 }
}
export function buddyFrame(s,index){
 const cast=s.buddyCast?.[index]||0;
 if(!cast)return null;
 return Math.min(11,Math.floor((.6-cast)*20));
}
export function buddyRollFrame(s){const p=s.player;return p.dash>0&&!p.dashAir?Math.min(7,Math.floor((1-p.dash/p.dashDuration)*8)):null;}
