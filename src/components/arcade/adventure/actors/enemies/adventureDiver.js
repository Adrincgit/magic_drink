import {enemyMuzzle} from './adventureEnemyGeometry';
import {bargeRig} from '../bosses/bargeRig';
import {worldSound} from '../../engine/adventureWorldAudio';
export const DIVER_TYPE=8;
export const WATER_BOLT='water-bolt';
export const diverInWater=e=>e.type===8&&['hidden','emerge','swim','dive','submerged','surfaceFire'].includes(e.phase);
export function burstWaterProjectile(s,q){
 if(q.waterBurst)return;q.waterBurst=true;waterSplash(s,q.x,q.y,q.kind==='barge-balloon'?135:74);
 for(let i=0;i<6;i++)s.effects.push({x:q.x,y:q.y,waterDrop:true,size:12+i%3*3,vx:(i-2.5)*46,vy:-95-i%3*28,floor:q.floor??s.player.y,age:0,life:1.3,duration:1.3});
}
export function waterSplash(s,x,y,size=100){
 s.effects.push({x,y,bargeSplash:true,size,age:0,life:.55});
 if(!s.events.some(q=>(typeof q==='string'?q:q.kind)==='bargeSplash'))worldSound(s,'bargeSplash',x,y);
}
export function updateDiver(s,e,dt,shoot){
 if(!e.aquatic){e.aquatic=true;e.phase='hidden';e.waterY=e.baseY+134;e.y=e.waterY+14;e.swimAge=0;e.swimClock=e.clock;e.deckAge=0;e.phaseAge=0;}
 if(e.trap>0)return;
 e.phaseAge=(e.phaseAge||0)+dt;e.diveWait=Math.max(0,(e.diveWait||0)-dt);
 e.dir=Math.sign(s.player.x-e.x)||-1;
 if(e.phase==='hidden'){if(Math.abs(s.player.x-e.x)<760){e.phase='emerge';e.phaseAge=0;waterSplash(s,e.x,e.waterY,45);}return;}
 if(e.phase==='exit'){
  const m=bargeRig(s),u=Math.min(1,e.phaseAge/.95);e.dir=1;
  e.x=m.stern.x+(m.ledge.x-m.stern.x)*u;e.y=m.stern.y+(m.ledge.y-m.stern.y)*u;e.gait=(e.gait||0)+dt*1.2;
  if(u===1){e.phase='deploy';e.phaseAge=0;e.vy=-200;e.launchVx=85;}return;
 }
 if(e.phase==='deploy'){
  e.dir=e.bargeCrew?1:-1;e.x+=(e.launchVx??-105)*dt;e.vy+=700*dt;e.y+=e.vy*dt;
  if(e.y>=e.waterY&&e.vy>0){e.y=e.waterY+14;e.phase='submerged';e.phaseAge=0;e.home=e.x;waterSplash(s,e.x,e.waterY,110);}return;
 }
 if(e.phase==='emerge'){
  e.y=e.waterY+14;if(e.phaseAge>=.85){e.phase='swim';e.phaseAge=0;e.swimClock=e.clock;e.home=e.x;e.surfaceWait=1.4;}return;
 }
 if(e.phase==='dive'){if(e.phaseAge>.65){e.phase='submerged';e.phaseAge=0;}return;}
 if(e.phase==='submerged'){
  if(e.channelWaterY)e.waterY+=(e.channelWaterY-e.waterY)*(1-Math.exp(-dt*5));
  e.x+=Math.sign(s.player.x-e.x)*115*dt;e.y=e.waterY+14;
  if(e.phaseAge>1.15){e.phase='emerge';e.phaseAge=0;e.home=e.x;e.swimAge=0;e.diveWait=4.5;waterSplash(s,e.x,e.waterY,48);}return;
 }
 if(e.phase==='surfaceFire'){
  if(e.phaseAge>=.35&&!e.surfaceFired){e.surfaceFired=true;const m={x:e.x+e.dir*29,y:e.waterY-41},a=Math.atan2(s.player.y-30-m.y,s.player.x-m.x);shoot(s,m.x,m.y,a,s.gentle?235:285,WATER_BOLT,{water:true,r:10,drawSize:46,life:3});}
  if(e.phaseAge>=.85){e.phase=e.waterOnly?'dive':'swim';e.phaseAge=0;e.home=e.x;e.swimClock=e.clock;e.surfaceWait=2.1;if(e.waterOnly)waterSplash(s,e.x,e.waterY,42);}return;
 }
 if(e.phase==='swim'){
  const oldX=e.x;if(e.bargeCrew&&Math.abs(s.player.x-e.x)>430){e.x+=Math.sign(s.player.x-e.x)*130*dt;e.home=e.x;e.swimClock=e.clock;}else e.x=e.home+Math.sin((e.clock-e.swimClock)*1.4)*88;e.y=e.waterY+14+Math.sin(e.clock*4)*3;
  e.dir=Math.sign(e.x-oldX)||Math.sign(Math.cos((e.clock-e.swimClock)*1.4))||e.dir;
  if(Math.abs(s.player.x-e.x)<570)e.swimAge+=dt;
  e.surfaceWait=(e.surfaceWait??1.4)-dt;
  if(!e.diveWait&&s.shots.some(q=>q.life>0&&Math.abs(q.x-e.x)<155&&Math.abs(q.y-e.waterY)<65)){e.phase='dive';e.phaseAge=0;e.diveWait=4.5;waterSplash(s,e.x,e.waterY,42);return;}
  if(e.surfaceWait<=0&&Math.abs(s.player.x-e.x)<560){e.phase='surfaceFire';e.phaseAge=0;e.surfaceFired=false;return;}
  if(!e.waterOnly&&e.swimAge>2.8){e.phase='leap';e.leapAge=0;e.vy=-665;waterSplash(s,e.x,e.waterY,125);}
  return;
 }
 if(e.phase==='leap'){
  e.leapAge+=dt;const oldY=e.y;e.vy+=1050*dt;e.y+=e.vy*dt;
  if(e.vy>0&&oldY<=e.baseY&&e.y>=e.baseY){e.y=e.baseY;e.vy=0;e.home=e.x;e.patrolAge=0;e.phase='landing';e.recovery=.32;e.timer=.7;}
  return;
 }
 if(e.phase==='landing'&&e.recovery>0)return;
 e.deckAge+=dt;e.y=e.baseY;
 e.phase=e.volleyAge!==undefined?'attack':e.timer<.65?'windup':e.action>0?'attack':e.recovery>0?'recover':'patrol';
 // Pause the walk cycle while aiming and firing so resuming it cannot jump.
 if(e.phase==='patrol'){
  const oldX=e.x;
  e.patrolAge=(e.patrolAge||0)+dt;
  e.x=e.home+Math.sin(e.patrolAge*1.25)*95;
  e.dir=Math.sign(e.x-oldX)||e.dir;
 }
 if(e.timer<=0&&Math.abs(e.x-s.player.x)<700){
  e.volley=0;e.volleyAge=0;e.timer=s.gentle?3.5:2.65;
 }
 if(e.volleyAge!==undefined){
  e.dir=Math.sign(s.player.x-e.x)||e.dir;
  e.volleyAge+=dt;e.phase='attack';
  while(e.volley<3&&e.volleyAge>=e.volley*.14){
   const m=enemyMuzzle(e),aim=Math.atan2(s.player.y-31-m.y,s.player.x-m.x);
   shoot(s,m.x,m.y,aim,s.gentle?250:315,WATER_BOLT,{r:10,drawSize:52,life:3,water:true});
   e.volley++;e.action=.22;
  }
  if(e.volleyAge>.48){delete e.volleyAge;e.recovery=.35;}
 }
}
export function diverDrawing(e,reduced=false){
 if(e.hp<=0)return{key:'river-diver',frame:3};
 if(['emerge','dive','surfaceFire'].includes(e.phase))return{key:'river-diver-water',frame:e.phase==='emerge'?Math.min(3,Math.floor(e.phaseAge/.85*4)):e.phase==='dive'?4+Math.min(3,Math.floor(e.phaseAge/.65*4)):8+Math.min(3,Math.floor(e.phaseAge/.85*4)),columns:4,surface:true};
 if(e.phase==='exit')return{key:'river-diver-aquatic',frame:18+(reduced?0:Math.floor((e.gait||0)*12)%6),columns:6};
 if(e.phase==='deploy')return{key:'river-diver-aquatic',frame:7+Math.min(3,Math.floor(e.phaseAge*5)),columns:6};
 const loop=reduced?0:Math.floor(e.clock*14)%6;
 const frame=e.phase==='swim'?loop:e.phase==='leap'?6+Math.min(4,Math.floor((e.leapAge||0)*5)):e.phase==='landing'?11:e.phase==='patrol'?18+(reduced?0:Math.floor((e.gait||0)*12)%6):12+(e.phase==='windup'?Math.min(1,Math.floor((.65-e.timer)*3)):e.phase==='attack'?2+(reduced?0:Math.floor((e.volleyAge||0)*14)%3):5);
 return{key:'river-diver-aquatic',frame,columns:6};
}
export function beginDiverDefeat(e){e.deadTime=1.25;e.deathAge=0;e.vy=-140;}
export function stepDiverDefeat(s,e,dt){
 e.deathAge+=dt;e.deadTime=Math.max(0,e.deadTime-dt);e.vy+=700*dt;e.y+=e.vy*dt;e.x-=e.dir*45*dt;
 if(!e.splashed&&e.y>(e.waterY??e.baseY+134)){e.splashed=true;waterSplash(s,e.x,e.waterY??e.baseY+132,120);e.deadTime=0;}
}
