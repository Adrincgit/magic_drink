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
  if(q.active&&q.x>-450){const oldGait=q.gait,distance=q.speed*dt;q.x-=distance;q.gait+=dt*1.8;q.y=groundY(s.level.route,q.x)-28;villageCarriageDust(s,q,oldGait,distance);}
 }
 for(const q of s.villagers){
  if(stepVillageCandyTimeout(s,q,dt))continue;
  if(q.climbLift&&q.state!=='flee'){q.y=groundY(s.level.route,q.x);q.climbLift=0;}
  if(q.state==='waiting'&&s.player.x>=q.wakeX&&s.player.x<q.x+1000){q.state=q.hidingCover?'hiding':q.rubbleId?'trapped':'flee';q.active=true;}
  if(q.state==='flee'){
   q.runAge??=0;
   if(q.warning&&!q.warned&&q.x<s.level.entrance.x&&s.player.x<q.x-35&&Math.abs(s.player.x-q.x)<280){q.warned=true;q.warningDir=-1;q.state='warning';q.age=0;s.notice='villageWarning';s.noticeTime=3;continue;}
   if(q.trip&&!q.tripped&&q.runAge>1.3&&Math.abs(s.player.x-q.x)<650){q.tripped=true;q.state='trip';q.age=0;continue;}
   const old=q.x,oldAge=q.runAge,profile=villageVillagerProfile(q.style);q.x=blockVillageEscape(s,q,q.x-q.speed*dt);const dx=old-q.x;if(dx>.001)q.runAge+=dt;q.gait+=dx/profile.stride;q.y=groundY(s.level.route,q.x,q.y);
   const step=(s.villageObstacles||[]).find(r=>r.kind==='step'&&!r.broken&&Math.abs(q.x-r.x)<r.w/2+30);if(step)q.y-=Math.sin(Math.PI*(q.x-step.x+step.w/2+30)/(step.w+60))*(step.h+16);
   stepBlockedVillager(s,q,dt);
   villageFootDust(s,q,oldAge,profile,groundY(s.level.route,q.x));
   if(q.x<=q.safeX){q.state='safe';q.active=false;s.village.safe++;}
  }else if(['warning','trip','fallen','help','recover','rescue'].includes(q.state)){
   q.age+=dt;
   if(q.state==='warning'&&(s.player.x>=q.x-20||s.player.x>=s.level.entrance.x)){q.state='flee';q.age=0;continue;}
   if(q.state==='trip'){q.x-=q.speed*.4*dt;q.y=groundY(s.level.route,q.x);if(q.age>.4){q.state='fallen';q.age=0;}}
   else if(q.state==='fallen'){
    const helper=s.villagers.find(n=>n!==q&&n.group===q.group&&n.state==='flee'&&!n.trip&&Math.abs(n.x-q.x)<160);
    if(helper){helper.state='help';helper.age=0;helper.helpId=q.id;q.state='recover';q.age=0;q.helped=true;}
    else if(q.age>1.1){q.state='recover';q.age=0;}
   }else if(q.state==='help'){
    const friend=s.villagers.find(n=>n.id===q.helpId);
    if(friend)q.x=friend.x-45;q.y=groundY(s.level.route,q.x);
    if(q.age>.85){q.state='flee';q.age=0;}
   }else if(q.age>(q.state==='warning'?.85:q.state==='rescue'?.65:.85)){q.state='flee';q.age=0;}
  }else if(q.state==='turning'){
   q.age+=dt;if(q.age>=1.2){q.state='candy';q.age=0;s.village.turned++;}
  }else if(q.state==='candy'||q.state==='absorbing'||q.state==='trapped'||q.state==='hiding')q.age+=dt;
 }
}
