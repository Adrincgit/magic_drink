import {enemyMuzzle} from './adventureEnemyGeometry';
import {WATER_BOLT,waterSplash} from './adventureDiver';
export const RIVER_BOAT_TYPE=9;
export function updateRiverBoat(s,e,dt,shoot){
 if(!e.boat){
  const bridge=s.platforms.find(q=>q.bridge&&e.home>=q.x&&e.home<=q.x+q.w);
  e.boat=true;e.waterY=(bridge?.y??e.baseY)+143;e.left=(bridge?.x??e.home-250)+115;e.right=(bridge?bridge.x+bridge.w:e.home+250)-115;
  e.sailDir=e.dir;e.y=e.waterY;e.timer=1.4;
 }
 if(e.trap>0)return;
 e.x+=e.sailDir*(s.gentle?60:82)*dt;
 if(e.x<e.left&&e.sailDir<0){e.x=e.left;e.sailDir=1;}if(e.x>e.right&&e.sailDir>0){e.x=e.right;e.sailDir=-1;}
 e.y=e.waterY+Math.sin(e.clock*3)*2;e.dir=Math.sign(s.player.x-e.x)||-1;
 e.phase=e.timer<.65?'windup':e.action>0?'attack':'sail';
 if(e.timer<=0&&Math.abs(e.x-s.player.x)<670){
  for(const offset of [-29,20]){const m={x:e.x+e.dir*offset*1.15,y:e.y-54*1.15},aim=Math.atan2(s.player.y-34-m.y,s.player.x-m.x);shoot(s,m.x,m.y,aim,s.gentle?245:295,WATER_BOLT,{r:9,drawSize:40,life:3.3,water:true});}
  e.action=.3;e.timer=s.gentle?3.2:2.25;s.events.push('diverThrow');
 }
}
export function beginRiverBoatDefeat(s,e){e.deadTime=2.3;e.deathAge=0;e.waterY??=e.y;e.sinkStartY=e.y;waterSplash(s,e.x,e.waterY,155);s.events.push('bargeBreak');}
export function stepRiverBoatDefeat(s,e,dt){
 e.deathAge+=dt;e.deadTime=Math.max(0,e.deadTime-dt);e.x+=(e.sailDir||1)*25*dt;e.y=e.sinkStartY+Math.max(0,e.deathAge-.3)*62;
 if(e.deathAge>.65&&!e.splashed){e.splashed=true;waterSplash(s,e.x,e.waterY,125);}
}
