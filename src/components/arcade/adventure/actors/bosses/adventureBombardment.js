import {cameraView} from '../../render/adventureCamera';
import {BOMB_SCALE,FALLING_BOMB_SIZE} from './adventureBombs';
import {balloonBombSocket} from './balloonHatch';
export function prepareBombardment(s){
 const b=s.boss,a=s.level.arena,view=cameraView(s);
 const left=Math.max(a.left+80,s.camera.x+85),right=Math.min(a.right-80,s.camera.x+view.width-85);
 const dir=(b.bombingPasses||0)%2===0?-1:1;b.bombingPasses=(b.bombingPasses||0)+1;
 b.bombRun={left,right,dir,startX:b.x,startY:b.y,age:0,nextDrop:0,
  pass:0,gap:(left+right)/2+(dir>0?-1:1)*Math.min(125,(right-left)*.14),gapWidth:s.gentle?180:124};
 b.timer=1.25;b.vulnerable=true;
}
export function stepBombardment(s,dt,shoot){
 const b=s.boss,r=b.bombRun;if(!r||b.move!=='bombing-run'||!['warn','attack'].includes(b.phase))return false;
 const a=s.level.arena,from=r.dir>0?r.left:r.right,to=r.dir>0?r.right:r.left,high=a.y-235;
 if(b.phase==='warn'){
  r.age+=dt;const t=Math.min(1,r.age/1.25),ease=t*t*(3-2*t);
  b.x=r.startX+(from-r.startX)*ease;b.y=r.startY+(high-r.startY)*ease;
  if(r.age>=1.25){b.phase='attack';b.timer=4.7;b.attackClock=0;r.nextDrop=0;}
 }else{
  b.attackClock+=dt;const duration=s.gentle?2.25:1.7,progress=Math.min(1,b.attackClock/duration);
  b.x=from+(to-from)*progress;b.y=high+Math.sin(progress*Math.PI)*-18;b.dir=r.dir;
  // Fixed spatial slots make the gap identical at every simulation frame rate.
  while(r.nextDrop<=duration&&r.nextDrop<=b.attackClock){
   const x=from+(to-from)*(r.nextDrop/duration);r.nextDrop+=.12;
   if(Math.abs(x-r.gap)<r.gapWidth/2)continue;
   shoot(s,x,balloonBombSocket(s).y,Math.PI/2,85,'bomb',{vx:0,gravity:540,floor:a.y,carpet:true,gap:r.gap,gapWidth:r.gapWidth,r:16*BOMB_SCALE,drawSize:FALLING_BOMB_SIZE,life:3});b.release=.16;
  }
  if(b.attackClock>=duration){
   if(!r.pass){r.pass=1;r.dir*=-1;r.nextDrop=0;b.attackClock=0;}
   else{b.phase='recover';b.timer=s.gentle?2.7:1.8;b.vulnerable=true;}
  }
 }
 return true;
}
