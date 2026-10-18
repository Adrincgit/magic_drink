import {surfaceY} from '../../world/adventureTerrain';
import {worldSound} from '../../engine/adventureWorldAudio';
import {ACT_TWO_ENEMY_MUZZLES} from '../bosses/actTwoAtlas';
import {enemyGeometry} from './adventureEnemyGeometry';
import {faceTarget} from './enemyFacing';
import {CORN_CARTOON_CELL,CORN_CARTOON_MUZZLES} from '../cornfieldCartoonRegistration';
export const isActTwoEnemy=e=>e.type>=29&&e.type<=32;
export function actTwoEnemyDrawing(e,reduced=false){
 if(e.cornCrow)return{key:'corn-flock',frame:reduced?2:Math.floor(e.clock*12)%8,size:112*4/3};
 if(e.cornImp)return{key:'corn-imp',frame:e.hp<=0?15:e.phase==='emerge'?12:e.phase==='windup'?13:e.phase==='attack'?14:reduced||!e.moving?0:Math.floor((e.gait||0)*12)%12,size:184*4/3};
 if(e.type===32)return{key:'act-two-effects',frame:8+(reduced?0:Math.floor(e.clock*9)%4),size:78};
 const row=(e.type-29)*8;
 return{key:'act-two-enemies',frame:row+(e.hp<=0?7:e.flash>0?6:e.phase==='windup'?4:e.phase==='attack'?5:reduced?0:Math.floor((e.gait||0)*4)%4)};
}
export function stepActTwoEnemy(s,e,dt,shoot){
 const p=s.player;
 if(Math.abs(e.x-p.x)>1050){e.phase='patrol';return;}
 const trapped=e.trap>0;
 if(e.cornImp){stepCornImp(s,e,dt,shoot);return;}
 if(e.cornCrow){stepCornCrow(s,e,dt);return;}
 if(e.type===32){
  if(!trapped){e.x=e.home+Math.sin(e.clock*.8)*115;e.y=e.baseY+Math.sin(e.clock*2.7)*30;}
  e.dir=faceTarget(e,p.x);
  if(e.timer<.75)e.phase='windup';
  if(e.timer<=0){const a=Math.atan2(p.y-30-e.y,p.x-e.x);shoot(s,e.x,e.y-15,a,210,e.cornCrow?'act-two-straw':'act-two-orb',{actTwo:true,corn:e.cornCrow,element:'magic',r:11});e.timer=3;e.phase='attack';e.action=.35;}return;
 }
 const floor=s.platforms.filter(q=>!q.gone&&e.x>=q.x+10&&e.x<=q.x+q.w-10&&Math.abs(surfaceY(q,e.x)-e.baseY)<35).sort((a,b)=>Math.abs(a.y-e.baseY)-Math.abs(b.y-e.baseY))[0];
 if(!e.actTwoFloor)e.actTwoFloor=floor;
 const footing=e.actTwoFloor;
 e.dir=faceTarget(e,p.x);
 if(e.phase==='windup'){
  if(e.flash>0)return;
  e.windup-=dt;
  if(e.windup<=0){e.phase='attack';e.action=.4;
   const point=ACT_TWO_ENEMY_MUZZLES[e.type],size=enemyGeometry(e).size,x=e.x+(point[0]/320-.5)*size*(e.dir>0?-1:1),y=e.y+(point[1]/320-.975)*size,a=Math.atan2(e.aim.y-y,e.aim.x-x);
   if(e.type===31){shoot(s,x,y,e.dir>0?0:Math.PI,285,'act-two-slash',{actTwo:true,r:20,life:.32,element:'physical'});worldSound(s,'stoneThrow',x,y);}
   else shoot(s,x,y,a,e.type===29?245:265,e.type===29?'act-two-straw':'act-two-orb',{actTwo:true,element:'magic',r:12});
   e.timer=e.type===31?2.7:2.3;
  }
 }else if(e.action>0)e.phase='attack';
 else if(e.timer<=0&&Math.abs(e.x-p.x)<(e.type===31?190:630)){
  e.phase='windup';e.windup=e.type===31?.9:.8;e.aim={x:p.x,y:p.y-35};
 }else{
  e.phase='patrol';
  if(!trapped&&Math.abs(p.x-e.x)>(e.type===31?85:190))e.x+=e.dir*(e.type===29?60:e.type===30?85:46)*dt;
  if(footing&&!footing.gone){e.x=Math.max(footing.x+24,Math.min(footing.x+footing.w-24,e.x));e.baseY=surfaceY(footing,e.x);}
  e.y=e.baseY;
 }
}
function stepCornImp(s,e,dt,shoot){
 const p=s.player,trapped=e.trap>0,dx=p.x-e.x;
 e.dir=faceTarget(e,p.x);
 const floor=s.platforms.filter(q=>!q.gone&&e.x>=q.x&&e.x<=q.x+q.w&&Math.abs(surfaceY(q,e.x)-e.baseY)<30).sort((a,b)=>Math.abs(a.y-e.baseY)-Math.abs(b.y-e.baseY))[0];
 if(floor)e.actTwoFloor=floor;
 if(e.phase==='windup'){
  e.windup-=dt;
  if(e.windup<=0){e.phase='attack';e.action=e.cornRole==='runner'?.65:.35;e.timer=e.cornRole==='runner'?2.8:2.5;e.attackDir=e.dir;
   if(e.cornRole!=='runner'){
    const point=CORN_CARTOON_MUZZLES.imp[14],size=184*4/3,x=e.x+(point[0]/CORN_CARTOON_CELL-.5)*size*(e.dir>0?-1:1),y=e.y+(point[1]/CORN_CARTOON_CELL-.975)*size,a=Math.atan2(e.aim.y-y,e.aim.x-x);
    shoot(s,x,y,a,240,'act-two-straw',{actTwo:true,corn:true,element:'magic',r:10,life:3.6});
   }
  }
 }else if(e.action>0){e.phase='attack';if(e.cornRole==='runner'&&!trapped)e.x+=e.attackDir*220*dt;}
 else if(e.timer<=0&&Math.abs(dx)<(e.cornRole==='runner'?310:570)){
  e.phase='windup';e.windup=e.cornRole==='runner'?.7:.8;e.aim={x:p.x,y:p.y-35};
 }else{e.phase='patrol';if(!trapped&&Math.abs(dx)>(e.cornRole==='runner'?140:300))e.x+=e.dir*(e.cornRole==='runner'?85:58)*dt;}
 const q=e.actTwoFloor;
 if(q&&!q.gone){e.x=Math.max(q.x+25,Math.min(q.x+q.w-25,e.x));e.baseY=surfaceY(q,e.x);e.vy=0;}
 else if(q?.gone){const previous=e.baseY;e.vy=(e.vy||0)+850*dt;e.baseY+=e.vy*dt;
  const landing=s.platforms.find(o=>!o.gone&&e.x>=o.x&&e.x<=o.x+o.w&&surfaceY(o,e.x)>=previous&&surfaceY(o,e.x)<=e.baseY);
  if(landing){e.baseY=surfaceY(landing,e.x);e.actTwoFloor=landing;e.vy=0;}
 }e.y=e.baseY;
}
function stepCornCrow(s,e,dt){
 if(e.trap>0)return;
 e.phaseAge=(e.phaseAge||0)+dt;
 if(e.phase==='windup'){
  if(e.phaseAge>=.7){e.phase='attack';e.phaseAge=0;}return;
 }
 if(e.phase==='attack'){
  const t=Math.min(1,e.phaseAge/1.05),half=t<.55,u=half?t/.55:(t-.55)/.45,ease=u*u*(3-2*u);
  e.x=half?e.swoopFrom.x+(e.aim.x-e.swoopFrom.x)*ease:e.aim.x+e.attackDir*200*ease;
  e.y=half?e.swoopFrom.y+(e.aim.y-e.swoopFrom.y)*ease:e.aim.y+(e.baseY-45-e.aim.y)*ease;
  if(t>=1){e.phase='recover';e.phaseAge=0;e.timer=1.2;}return;
 }
 if(e.phase==='recover'){
  e.x+=(e.home-e.x)*Math.min(1,dt*2);e.y+=(e.baseY-e.y)*Math.min(1,dt*3);
  if(e.timer<=0){e.phase='patrol';e.phaseAge=0;e.timer=1.7;}return;
 }
 e.phase='patrol';e.dir=faceTarget(e,s.player.x);e.x=e.home+Math.sin(e.clock*.9)*90;e.y=e.baseY+Math.sin(e.clock*2.7)*20;
 if(e.timer<=0&&Math.abs(e.x-s.player.x)<620){e.phase='windup';e.phaseAge=0;e.swoopFrom={x:e.x,y:e.y};e.aim={x:s.player.x,y:s.player.y-15};e.attackDir=e.dir;}
}
