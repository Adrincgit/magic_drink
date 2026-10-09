import {enemyMuzzle} from './adventureEnemyGeometry';
export const DIVER_TYPE=8;
export function updateDiver(s,e,dt,shoot){
 e.dir=Math.sign(s.player.x-e.x)||-1;
 e.phase=e.timer<.7?'windup':e.action>0?'attack':e.recovery>0?'recover':'float';
 // The flippers stay on the deck; anticipation comes from the drawn arm pose.
 const target=e.baseY-(e.phase==='windup'?3:0);
 if(!(e.trap>0))e.y+=(target-e.y)*Math.min(1,dt*7);
 if(e.timer<=0&&Math.abs(e.x-s.player.x)<700){
  const m=enemyMuzzle(e),aim=Math.atan2(s.player.y-31-m.y,s.player.x-m.x);
  shoot(s,m.x,m.y,aim,s.gentle?240:285,'diver-hoop',{r:14,drawSize:44,life:3.4});
  e.timer=s.gentle?3.7:2.8;e.action=.35;e.recovery=.55;e.phase='attack';s.events.push('diverThrow');
 }
}
export function diverDrawing(e){return{key:'river-diver',frame:e.hp<=0?3:e.action>0?2:e.phase==='windup'?1:0};}
export function beginDiverDefeat(e){e.deadTime=1.05;e.deathAge=0;e.vy=-140;}
export function stepDiverDefeat(s,e,dt){
 e.deathAge+=dt;e.deadTime=Math.max(0,e.deadTime-dt);e.vy+=700*dt;e.y+=e.vy*dt;e.x-=e.dir*45*dt;
 if(!e.splashed&&e.y>e.baseY+65){e.splashed=true;s.effects.push({x:e.x,y:e.baseY+90,bargeSplash:true,size:105,age:0,life:.55});s.events.push('bargeSplash');e.deadTime=0;}
}
