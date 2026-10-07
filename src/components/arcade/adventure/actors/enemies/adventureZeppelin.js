import {groundY} from '../../world/adventureTerrain';
import {releaseCarriedBunny,loseCarriedBunny} from '../../engine/adventureRescues';
import {AIR_ENEMY_SCALE} from './adventureEnemyGeometry';

export const ZEPPELIN_TYPE=7;
export const ZEPPELIN_HEALTH=12;
export const ZEPPELIN_SPEED=225;
export const ZEPPELIN_SHOT_SPEED=340;
export const ZEPPELIN_WIDTH=228*AIR_ENEMY_SCALE;
export const ZEPPELIN_DUST_DURATION=.9;
// Restore the source cells' vertical ratio after packing them into the atlas.
export const ZEPPELIN_CELL_ASPECT=458/466;
export const ZEPPELIN_HEIGHT=ZEPPELIN_WIDTH*805/1512*ZEPPELIN_CELL_ASPECT/(384/512);
export const zeppelinMuzzle=e=>({x:e.x+ZEPPELIN_WIDTH*.39,y:e.y-ZEPPELIN_HEIGHT*.261});

export function zeppelinFrame(e,reduced=false){
 if(e.hp<=0){const age=e.deathAge||0;return age<.14?4:age<.55?5:age<.78?6:7;}
 if(e.action>0)return reduced||e.action>.22?2:3;
 return e.phase==='windup'?1:0;
}
export function beginZeppelinDefeat(s,e){
 releaseCarriedBunny(e);
 e.deadTime=2.4;e.deathAge=0;e.phase='fall';e.vy=-95;e.deathVx=105;e.action=0;
 s.events.push('zeppelinBreak');
}
export function stepZeppelinDefeat(s,e,dt){
 e.deathAge=(e.deathAge||0)+dt;e.clock+=dt;
 if(e.landed){e.dustAge+=dt;e.deadTime=Math.max(0,ZEPPELIN_DUST_DURATION-e.dustAge);return;}
 // Keep falling wreckage alive until it reaches the actual ground.
 e.deadTime=Math.max(.5,e.deadTime-dt);
 e.x+=(e.deathVx||0)*dt;e.vy+=480*dt;e.y+=e.vy*dt;
 if(e.deathAge>=.55&&!e.broken){
  e.broken=true;s.events.push('zeppelinBurst');s.effects.push({x:e.x,y:e.y-50,row:1,size:155,age:0,life:.45});
 }
 const floor=groundY(s.platforms,e.x);
 if(e.y>=floor){
  e.y=floor;e.vy=0;e.deathVx=0;e.landed=true;e.dustAge=0;e.deadTime=ZEPPELIN_DUST_DURATION;s.events.push('zeppelinCrash');
 }
}

export function updateZeppelin(s,e,dt,shoot){
 const p=s.player,width=960/(s.camera.zoom||1);
 if(!e.flightActive){
  if(Math.abs(p.x-e.home)>600)return;
  e.flightActive=true;e.x=s.camera.x-140;e.timer=.95;e.clock=0;
 }
 if(!e.trap){e.x+=ZEPPELIN_SPEED*dt;e.y=e.baseY+Math.sin(e.clock*2.8)*5;}
 const q=zeppelinMuzzle(e),ahead=p.x>q.x+20;
 e.dir=1;e.phase=e.timer<.42&&ahead?'windup':'flight';
 const visible=e.x>s.camera.x+35&&e.x<s.camera.x+width-45;
 if(e.timer<=0&&visible&&ahead&&Math.abs(e.x-p.x)<620){
  const angle=Math.atan2(p.y-30-q.y,p.x-q.x);
  shoot(s,q.x,q.y,angle,ZEPPELIN_SHOT_SPEED,'red-pellet',{r:7,drawSize:18,life:3.2});
  e.timer=s.gentle?2.15:1.65;e.action=.42;s.events.push('zeppelinShot');
 }
 // A crossing is one opportunity: it escapes past the visible encounter,
 // rather than remaining far ahead until Hexy catches it later in the route.
 if(e.x>s.camera.x+width+180||e.x>s.level.width+250){loseCarriedBunny(e);e.escaped=true;e.hp=0;e.deadTime=0;}
}
