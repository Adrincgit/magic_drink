import {cameraView} from './adventureCamera';
export function prepareBombardment(s){
 const b=s.boss,a=s.level.arena,view=cameraView(s);
 const left=Math.max(a.left+80,s.camera.x+85),right=Math.min(a.right-80,s.camera.x+view.width-85);
 const dir=(b.bombingPasses||0)%2===0?-1:1;b.bombingPasses=(b.bombingPasses||0)+1;
 b.bombRun={left,right,dir,startX:b.x,startY:b.y,age:0,nextDrop:0,
  gap:(left+right)/2+(dir>0?-1:1)*Math.min(125,(right-left)*.14),gapWidth:s.gentle?230:190};
 b.timer=1.8;b.vulnerable=true;
}
export function stepBombardment(s,dt,shoot){
 const b=s.boss,r=b.bombRun;if(!r||b.move!=='bombing-run'||!['warn','attack'].includes(b.phase))return false;
 const a=s.level.arena,from=r.dir>0?r.left:r.right,to=r.dir>0?r.right:r.left,high=a.y-235;
 if(b.phase==='warn'){
  r.age+=dt;const t=Math.min(1,r.age/1.8),ease=t*t*(3-2*t);
  b.x=r.startX+(from-r.startX)*ease;b.y=r.startY+(high-r.startY)*ease;
  if(r.age>=1.8){b.phase='attack';b.timer=4.4;b.attackClock=0;r.nextDrop=0;}
 }else{
  b.attackClock+=dt;const duration=3.5,progress=Math.min(1,b.attackClock/duration);
  b.x=from+(to-from)*progress;b.y=high+Math.sin(progress*Math.PI)*-18;b.dir=r.dir;
  // Fixed spatial slots make the gap identical at every simulation frame rate.
  while(r.nextDrop<=duration&&r.nextDrop<=b.attackClock){
   const x=from+(to-from)*(r.nextDrop/duration);r.nextDrop+=.18;
   if(Math.abs(x-r.gap)<r.gapWidth/2)continue;
   shoot(s,x,b.y-18,Math.PI/2,85,'bomb',{vx:0,gravity:540,floor:a.y,carpet:true,r:16,life:3});b.release=.16;
  }
  if(b.attackClock>=4.4){b.phase='recover';b.timer=s.gentle?2.7:2.1;b.vulnerable=true;}
 }
 return true;
}
