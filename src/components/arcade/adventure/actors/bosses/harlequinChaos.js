import {fireImpact} from './harlequinFire';

export const CLOTH_BURN_DURATION=1.2;
export function stepHarlequinChaos(s,dt,shoot){
 if(s.index!==3)return;
 const b=s.boss,wind=b.move==='dash'&&b.phase==='attack'?(b.driveSpeed||0)/1160:0;
 b.heatWind=(b.heatWind||0)+(wind-(b.heatWind||0))*(1-Math.exp(-dt*9));
 if(b.stage<2||b.hp<=0||!s.arenaLocked||['intro','sleep','transform','defeated'].includes(b.phase)||b.ultimate)return;
 b.debrisClock=(b.debrisClock??3.2)-dt;
 if(b.debrisClock>0)return;
 const a=s.level.arena,serial=b.debrisSerial||0;
 const offsets=[0,-150,220,30],target=Math.max(a.left+90,Math.min(a.right-90,s.player.x+offsets[serial%4]));
 // Lock the landing lane at release. Flutter is visible during the entire
 // fall; no target marker and no tracking of Hexy after the cloth detaches.
 const x=Math.max(a.left+90,Math.min(a.right-90,target)),y=Math.min(-120,s.camera.y-80);
 if(s.hostile.filter(q=>q.kind==='harlequin-cloth'&&q.state==='fall').length<2){
  shoot(s,x,y,0,0,'harlequin-cloth',{harlequin:true,state:'fall',seed:serial,drift:serial%2?-12:12,r:0,drawSize:118,floor:a.y,life:8,damaging:true,rotation:0,spin:serial%2?-1:1,originX:x});
 }
 b.debrisSerial=serial+1;b.debrisClock=(b.stage===3?4.6:6.2)+(serial%3)*.55+(s.gentle?1.8:0);
}

export function stepBurningCloth(s,q,dt){
 if(q.state==='fall'){
  q.vy=Math.min(510,q.vy+380*dt);q.x+=q.drift*dt;q.y+=q.vy*dt;q.rotation+=q.spin*dt;
  if(q.y>=q.floor-24){
   q.state='burn';q.y=q.floor;q.rotation=0;q.burnAge=0;q.life=CLOTH_BURN_DURATION;q.vy=0;
   fireImpact(s,q.x,q.floor,.3,true);
  }
 }else{
  q.burnAge+=dt;q.damaging=q.burnAge<.68;
 }
 return true;
}
