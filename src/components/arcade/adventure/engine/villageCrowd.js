import {groundY} from '../world/adventureTerrain';
import {villageVillagerProfile} from '../actors/villageVillagers';
import {blockVillageEscape} from './villageObstacles';
import {stepVillageDust,villageFootDust,villageCarriageDust} from './villageDust';
import {stepBlockedVillager} from './villageBlockedCrowd';
import {stepVillageCandyTimeout} from './villageCandyTimeout';

export function stepVillageCrowd(s,dt){
 stepVillageDust(s,dt);
 for(const q of s.carriages||[]){
  if(!q.active&&s.player.x>=q.wakeX)q.active=true;
  if(q.active&&q.x>-450){const oldGait=q.gait,distance=q.speed*dt;q.x-=distance;q.gait+=dt*1.8;q.y=groundY(s.level.route,q.x)-52;villageCarriageDust(s,q,oldGait,distance);}
 }
 for(const q of s.villagers){
  if(stepVillageCandyTimeout(s,q,dt))continue;
  // Retire the old unpaired trip/help vignette, including retained state.
  if(['trip','fallen','help'].includes(q.state)){q.state='flee';q.age=0;q.tripped=true;delete q.helpId;}
  if(q.climbLift&&q.state!=='flee'){q.y=groundY(s.level.route,q.x);q.climbLift=0;}
  if(q.state==='waiting'&&s.player.x>=q.wakeX&&s.player.x<q.x+1000){q.state=q.hidingCover?'hiding':q.rubbleId?'trapped':'flee';q.active=true;}
  if(q.state==='flee'){
   q.runAge??=0;
   if(q.warning&&!q.warned&&q.x<s.level.entrance.x&&s.player.x<q.x-35&&Math.abs(s.player.x-q.x)<280){q.warned=true;q.warningDir=-1;q.warningFrom=q.x;q.state='warning';q.age=0;s.notice='villageWarning';s.noticeTime=3;continue;}
   const old=q.x,oldAge=q.runAge,oldGait=q.gait,profile=villageVillagerProfile(q.style);q.x=blockVillageEscape(s,q,q.x-q.speed*dt);const dx=old-q.x;if(dx>.001)q.runAge+=dt;q.gait+=dx/profile.stride;q.y=groundY(s.level.route,q.x,q.y);
   const step=(s.villageObstacles||[]).find(r=>r.kind==='step'&&!r.broken&&Math.abs(q.x-r.x)<r.w/2+30);if(step)q.y-=Math.sin(Math.PI*(q.x-step.x+step.w/2+30)/(step.w+60))*(step.h+16);
   stepBlockedVillager(s,q,dt);
   villageFootDust(s,q,oldAge,profile,groundY(s.level.route,q.x),oldGait);
   if(q.x<=q.safeX){q.state='safe';q.active=false;s.village.safe++;}
  }else if(['warning','recover','rescue'].includes(q.state)){
   q.age+=dt;
   if(q.state==='warning'&&q.warningFrom!==undefined){q.x=q.warningFrom-28*Math.min(1,q.age/.3);q.y=groundY(s.level.route,q.x);}
   if(q.state==='warning'&&(s.player.x>=q.x-20||s.player.x>=s.level.entrance.x)){q.state='flee';q.age=0;continue;}
   if(q.age>(q.state==='warning'?2.8:q.state==='rescue'?.65:.85)){q.state='flee';q.age=0;}
  }else if(q.state==='turning'){
   q.age+=dt;if(q.age>=1.2){q.state='candy';q.age=0;s.village.turned++;}
  }else if(q.state==='candy'||q.state==='absorbing'||q.state==='trapped'||q.state==='hiding')q.age+=dt;
 }
}
