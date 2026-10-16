import {fireImpact} from '../actors/bosses/harlequinFire';
import {burstEmberProjectile} from './adventureEmberBlast';
import {burstWaterProjectile} from '../actors/enemies/adventureDiver';
import {groundY,surfaceY} from '../world/adventureTerrain';
import {captureInBubble} from './adventureBubbles';
import {guardEfficiency,modLevel} from './adventureMods';
import {reflectPellet} from './adventureTacticalMods';
import {ribbonActive,ribbonReflect} from './adventureRibbonState';
export const GUARD_DRAIN=26.4;
export const GUARD_HIT_COST=4.4;
export function updateGuard(s,input,dt){
 const p=s.player;
 for(const key of ['parryWindow','parryWait','parryFlash'])p[key]=Math.max(0,(p[key]||0)-dt);
 p.guardHit=Math.max(0,(p.guardHit||0)-dt);p.guardBreak=Math.max(0,(p.guardBreak||0)-dt);
 s.shieldHit=Math.max(0,(s.shieldHit||0)-dt);s.shieldBreak=Math.max(0,(s.shieldBreak||0)-dt);
 p.magicDelay=Math.max(0,(p.magicDelay||0)-dt);
 if(!input.guard)p.guardExhausted=false;
 const active=!!input.guard&&!p.guardExhausted&&!p.dash&&!p.hitReact&&!p.specialCast&&!p.superCast&&s.magic>0;
 if(active){
  const previousUp=p.guarding&&p.guardY<0;
  const sky=modLevel(s,'sky-guard'),side=sky>=2?(input.right?1:0)-(input.left?1:0):0;
  p.guardY=sky&&input.up?-(side?Math.SQRT1_2:1):0;p.guardX=p.guardY?side*Math.SQRT1_2:p.dir;
  p.guardAge=previousUp===(p.guardY<0)?(p.guardAge||0)+dt:0;
  if(!p.guarding){s.events.push('guardRaise');p.parryUsed=false;if(modLevel(s,'reply-bell')&&!p.parryWait){p.parryWindow=.1+modLevel(s,'reply-bell')*.03;p.parryWait=.65;}}
  p.charge=0;p.pendingSpecial=null;p.guarding=true;p.magicDelay=.6;
  s.magic=Math.max(0,s.magic-GUARD_DRAIN*guardEfficiency(s)*dt);
  if(!s.magic)breakGuard(s);
 }else{p.guarding=false;p.parryWindow=0;p.guardAge=0;}
}
export function breakGuard(s){const p=s.player;p.guarding=false;p.guardExhausted=true;p.guardBreak=.4;p.magicDelay=1;s.events.push('guardBreak');}
export function guardBlocks(s,shot){
 const p=s.player;if(!p.guarding||shot.life<=0)return false;
 if(ribbonActive(s))return ribbonReflect(s,shot);
 const gx=p.guardX??p.dir,gy=p.guardY||0,x=shot.x-p.x,y=shot.y-(p.y-43),dx=x*gx+y*gy,dy=Math.abs(-x*gy+y*gx);
 if(dx<18-shot.r||dx>66+shot.r||dy>54+shot.r)return false;
 if(reflectPellet(s,shot)){p.guardHit=.22;s.magic=Math.max(0,s.magic-GUARD_HIT_COST*guardEfficiency(s));if(!s.magic)breakGuard(s);return true;}
 shot.life=0;p.guardHit=.22;s.magic=Math.max(0,s.magic-GUARD_HIT_COST*guardEfficiency(s));s.events.push('guardBlock');
 if(shot.ember&&!shot.kind.includes('breath'))burstEmberProjectile(s,shot,{damaging:false,multiplier:.75});
 else if(shot.harlequin)fireImpact(s,shot.x,shot.y,.45);
 else if(shot.water||/^barge-(balloon|shell|wave|surf|jet)$/.test(shot.kind))burstWaterProjectile(s,shot);
 s.effects.push({x:shot.x,y:shot.y,defense:true,size:54,age:0,life:.25});
 if(!s.magic)breakGuard(s);return true;
}

// Charged magic clears hostile bullets, including bombs before their explosion.
// Swept distance covers a fast shot crossing a small bullet within one fixed tick.
export const clearsHostileProjectiles=q=>!!(q.heavy&&!q.hidden||q.kind===3||q.popcornStrong||q.powerClear||q.aquaProbe);
export function clearPowerProjectiles(s,shots=s.shots,hostile=s.hostile){
 for(const q of shots)if(clearsHostileProjectiles(q)&&q.life>0){
  let cleared=false;
  for(const h of hostile)if(h.life>0&&!['ember-blast','ember-breath','fort-breath','barge-jet'].includes(h.kind)){
   const x0=(q.previousX??q.x)-(h.previousX??h.x),y0=(q.previousY??q.y)-(h.previousY??h.y),dx=q.x-h.x-x0,dy=q.y-h.y-y0;
   const t=Math.max(0,Math.min(1,-(x0*dx+y0*dy)/(dx*dx+dy*dy||1)));
   if(Math.hypot(x0+dx*t,y0+dy*t)>(q.r||8)+(h.r||10)+(q.popcornStrong?8:0))continue;
   if(q.kind===3){if(captureInBubble(q,h)){cleared=true;continue;}if(!q.heavy)continue;}
   h.life=0;cleared=true;if(h.water||/^barge-(balloon|shell|wave|surf)$/.test(h.kind)){burstWaterProjectile(s,h);continue;}if(h.ember){burstEmberProjectile(s,h,{damaging:false,multiplier:5/6});continue;}if(h.harlequin){fireImpact(s,h.x,h.y,.5,h.kind==='harlequin-groundfire'||h.kind==='harlequin-pyre');continue;}s.effects.push({x:h.x,y:h.y,...(q.kind>=6?{drinkFx:q.kind,duration:.28}:{spell:q.super?undefined:q.kind,super:!!q.super}),size:46,age:0,life:.28});
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
