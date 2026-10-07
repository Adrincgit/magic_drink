// The vehicle and its crew are independent actors. These same anchors drive
// held props, emitted shots and the clown that actually leaves the basket.
import {HELD_BOMB_SIZE} from './adventureBombs';
import {RED_CLOWN_SCALE} from '../enemies/adventureEnemyGeometry';
export const BALLOON_SIZE=400;
export const CREW_SIZE=148*RED_CLOWN_SCALE;
export const BALLOON_RIM_Y=-84;
const throwMoves=new Set(['balls','bombs','swoop']);
export function balloonSeats(s){
 const b=s.boss,dir=b.crewDir||b.dir||-1;
 return [-72,0,72].map(dx=>({x:b.x+dx,y:b.y-44,dir,size:CREW_SIZE}));
}
const handPoints=[[51,194],[178,111],[187,74],[26,143]];
function pointAt(seat,point){return{x:seat.x+(point[0]-128)*CREW_SIZE/256*(seat.dir>0?-1:1),y:seat.y+(point[1]-250)*CREW_SIZE/256};}
export function balloonVolleySockets(s){
 const seats=balloonSeats(s);
 if(s.boss.move==='drop')return seats;
 if(s.boss.move==='streamers')return seats.map(q=>({x:q.x+q.dir*53*RED_CLOWN_SCALE,y:q.y-57*RED_CLOWN_SCALE}));
 return seats.map(q=>pointAt(q,handPoints[3]));
}
export function balloonShellDrawing(s){
 const b=s.boss;
 if(b.defeat){const q=b.defeat,frame=q.landedAt===null?(q.age<.18?2:q.age<.65?4:5):q.age-q.landedAt<.3?5:q.age-q.landedAt<.65?6:7;return{key:'balloon-shell',frame};}
 return{key:'balloon-shell',frame:(b.transformed?2:0)+(b.release>0?1:0)};
}
function throwPose(b){
 if(b.release>0)return b.release>.15?3:b.release>.06?4:5;
 if(b.phase==='warn')return b.timer>.7?0:b.timer>.3?1:2;
 if(b.move==='swoop'&&(b.attackClock||0)<1.24)return 2;
 if(b.shotClock>.42)return 6;
 if(b.shotClock>.27)return 0;
 if(b.shotClock>.16)return 1;
 return b.shotClock>.055?2:3;
}
export function balloonCrewDrawing(s,reduced=false){
 const b=s.boss,seats=balloonSeats(s),active=['warn','attack'].includes(b.phase);
 if(b.defeat)return []; // The empty vehicle keeps its own continuous fall.
 return seats.flatMap((seat,i)=>{
  let key='red-clown-throw',frame=reduced?6:((b.clock+i*.71)%3.4>3.2?7:6),held=null;
  if(active&&throwMoves.has(b.move)){
   frame=throwPose(b);
   if(b.move==='swoop'&&!b.release&&b.phase==='attack'&&b.attackClock>=1.24&&b.attackClock<1.4)frame=b.attackClock>1.345?3:2;
   if(!b.release&&frame<=3){
    held={...pointAt(seat,handPoints[frame]),frame:b.move==='bombs'?2:0,size:b.move==='bombs'?HELD_BOMB_SIZE:56};
   }
  }else if(active&&b.move==='streamers'){
   key='clown';frame=b.release>0?8:b.phase==='warn'?(b.timer>.35?6:7):b.shotClock<.25?7:9;
  }else if(active&&b.move==='drop'&&i===1){
   if(b.phase==='attack'&&(b.release>0||(b.shotClock>.3&&b.attackClock>.16)))return [];
   key='red-clown-air';frame=b.phase==='attack'&&b.shotClock<.075?1:0;
  }else if(active&&b.move==='bombing-run'){frame=b.release>0?4:0;}
  return [{...seat,key,frame,held}];
 });
}
export function redClownDrawing(e,reduced=false){
 if(e.hp<=0)return{key:'clown',frame:11};
 if(e.flash>0)return{key:'clown',frame:10};
 if(e.type===6){
  const frame=e.clock<.075?1:e.vy< -75?2:e.vy<70?3:e.baseY-e.y<48?5:4;
  return{key:'red-clown-air',frame};
 }
 if(e.landing>0)return{key:'red-clown-air',frame:e.landing>.11?6:7};
 if(e.action>0)return{key:'clown',frame:8};
 if(e.recovery>0)return{key:'clown',frame:9};
 if(e.phase==='windup')return{key:'clown',frame:e.timer>.27?6:7};
 if(e.trap>0||reduced)return{key:'red-clown-throw',frame:6};
 // Gait follows travelled distance, so a stopped or trapped clown cannot skate.
 return{key:'red-clown-walk',frame:Math.floor((e.gait||0)*16)%8};
}
