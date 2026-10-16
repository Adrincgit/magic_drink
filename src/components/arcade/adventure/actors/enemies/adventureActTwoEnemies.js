import {surfaceY} from '../../world/adventureTerrain';
import {worldSound} from '../../engine/adventureWorldAudio';
import {ACT_TWO_ENEMY_MUZZLES} from '../bosses/actTwoAtlas';
import {enemyGeometry} from './adventureEnemyGeometry';
export const isActTwoEnemy=e=>e.type>=29&&e.type<=32;
export function actTwoEnemyDrawing(e,reduced=false){
 if(e.type===32)return{key:'act-two-effects',frame:8+(reduced?0:Math.floor(e.clock*9)%4),size:78};
 const row=(e.type-29)*8;
 return{key:'act-two-enemies',frame:row+(e.hp<=0?7:e.flash>0?6:e.phase==='windup'?4:e.phase==='attack'?5:reduced?0:Math.floor((e.gait||0)*4)%4)};
}
export function stepActTwoEnemy(s,e,dt,shoot){
 const p=s.player;
 if(Math.abs(e.x-p.x)>1050){e.phase='patrol';return;}
 const trapped=e.trap>0;
 if(e.type===32){
  if(!trapped){e.x=e.home+Math.sin(e.clock*.8)*115;e.y=e.baseY+Math.sin(e.clock*2.7)*30;}
  e.dir=Math.sign(p.x-e.x)||-1;
  if(e.timer<.75)e.phase='windup';
  if(e.timer<=0){const a=Math.atan2(p.y-30-e.y,p.x-e.x);shoot(s,e.x,e.y-15,a,210,'act-two-orb',{actTwo:true,element:'magic',r:11});e.timer=3;e.phase='attack';e.action=.35;}return;
 }
 const floor=s.platforms.filter(q=>!q.gone&&e.x>=q.x+10&&e.x<=q.x+q.w-10&&Math.abs(surfaceY(q,e.x)-e.baseY)<35).sort((a,b)=>Math.abs(a.y-e.baseY)-Math.abs(b.y-e.baseY))[0];
 if(!e.actTwoFloor)e.actTwoFloor=floor;
 const footing=e.actTwoFloor;
 e.dir=Math.sign(p.x-e.x)||e.dir;
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
