import {enemyMuzzle} from './adventureEnemyGeometry';
import {emberFloor} from '../../engine/adventureEmberFire';
import {faceTarget} from './enemyFacing';
export function beginEmberBalloonDefeat(e){e.deadTime=4;e.deathAge=0;e.vy=-35;e.deathVx=e.dir*35;e.trap=0;e.landed=false;}
export function stepEmberBalloonDefeat(s,e,dt){
 e.deathAge+=dt;
 if(e.landed){e.landAge+=dt;e.deadTime=Math.max(0,e.deadTime-dt);return;}
 if(e.deathAge<.3)return;
 e.vy+=640*dt;e.x+=e.deathVx*dt;e.y+=e.vy*dt;
 const floor=emberFloor(s,e.x);
 if(e.y>=floor){e.y=floor;e.landed=true;e.landAge=0;e.deadTime=1.15;s.events.push('emberDefeat');}
}
export function emberBalloonDefeatFrame(e){
 if(e.landed)return e.landAge<.18?5:e.landAge<.7?6:7;
 return e.deathAge<.12?0:e.deathAge<.26?1:e.deathAge<.43?2:e.deathAge<.6?3:4;
}
export function updateEmberBalloon(s,e,dt,shoot){
 if(e.trap>0)return;
 e.fireState??='float';e.fireAge=(e.fireAge||0)+dt;
 const near=Math.abs(s.player.x-e.x)<580;
 if(e.fireState==='float'){
  e.x=e.home+Math.sin(e.clock*.4)*110;e.y=e.baseY+Math.sin(e.clock*1.2)*18;
  e.dir=faceTarget(e,s.player.x);
  if(near&&e.timer<=0){e.fireState='windup';e.fireAge=0;s.events.push('emberInhale');}
 }else if(e.fireState==='windup'&&e.fireAge>=1.3){e.fireState='attack';e.fireAge=0;e.shotClock=0;}
 else if(e.fireState==='attack'){
  e.shotClock-=dt;
  if(e.shotClock<=0){const m=enemyMuzzle(e);shoot(s,m.x,m.y,e.dir>0?.9:Math.PI-.9,110,'ember-cinder',{ember:true,element:'fire',r:16,drawSize:80,gravity:240,life:3.6});e.shotClock=.55;s.events.push('emberBreath');}
  if(e.fireAge>=1.35){e.fireState='float';e.fireAge=0;e.timer=3.3;}
 }
 e.phase=e.fireState;
}
