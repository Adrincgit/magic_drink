import {balloonShellDrawing,redClownDrawing} from '../actors/bosses/adventureBalloonCrew';
import {organShellDrawing} from '../actors/bosses/adventureOrganFortress';
// Each actor owns a 12-frame sheet. Frames follow gameplay states, not a global pose loop.
export const ACTOR_SHEETS=['clown','balloon','juggler','acrobat','cannon','boss-balloon','serio','alegre','agresivo','muta'];
export const ENEMY_ART=['clown','acrobat','balloon','juggler','acrobat','cannon','clown'];
export function enemyDrawing(e,reduced=false){
 if(e.type===7)return{key:'clown-zeppelin',frame:0};
 if(e.balloonCrew||e.type===0)return redClownDrawing(e,reduced);
 if(e.type===6)return{key:'cannon-clown',frame:reduced?0:Math.min(3,Math.floor(e.clock*6)%4)};
 if(e.type===3){
  let frame=e.hp<=0?11:e.flash>0?10:e.phase==='windup'?4:e.phase==='patrol'?(reduced?0:Math.floor((e.gait||0)*8)%2):2;
  if(e.hp>0&&!e.flash&&e.volleyAge!==undefined)frame=e.action>0?5+(e.ballColor||0)*2:e.volleyCount<3?4+e.volleyCount*2:9;
  return{key:'juggler-actions',frame};
 }
 if(e.type!==1&&e.type!==4)return{key:ENEMY_ART[e.type],frame:actorFrame(e,reduced,ENEMY_ART[e.type])};
 const rings=frame=>({key:'acrobat-rings',frame}),motion=frame=>({key:'acrobat-motion',frame});
 if(e.hp<=0)return rings(11);if(e.flash>0)return rings(10);
 if(e.action>0)return rings(4+(reduced?0:Math.min(1,Math.floor((.32-e.action)/.16))));
 if(e.recovery>0)return rings(e.recovery>.22?6:7);
 if(e.phase==='windup')return rings(reduced?2:Math.max(0,Math.min(3,Math.floor((.55-e.timer)/.55*4))));
 const lift=e.baseY-e.y;
 if(lift>12)return motion(lift>(e.type===4?78:31)?10:e.y<(e.previousY??e.y)?9:11);
 if(e.phase==='patrol')return motion(reduced?0:Math.floor((e.gait||0)*8)%8);
 return rings(reduced?8:8+Math.floor(e.clock*2)%2);
}
export const BOSS_ART=['boss-balloon','organ-machine','alegre','agresivo','muta'];
export function bossDrawing(s,reduced=false){
 const b=s.boss,key=BOSS_ART[s.index];
 if(s.index===0)return balloonShellDrawing(s);
 if(s.index===1)return organShellDrawing(s);
 if(!s.index||b.hp<=0||b.flash>0||!['warn','attack','transform'].includes(b.phase))return {key,frame:actorFrame(b,reduced,key)};
 if(b.phase==='transform')return {key:key+'-actions',frame:b.timer>1.2?8:9};
 const row={serio:{cannons:0,crossfire:1,charge:1},alegre:{juggle:0,rings:1,mirrors:2},agresivo:{slam:0,charge:1,clowns:2},muta:{spiral:0,rain:1,silence:2}}[key][b.move]||0;
 const local=b.phase==='warn'?0:reduced?1:key==='agresivo'&&b.move==='slam'?(b.attackClock<1.3?1:2):1+Math.floor((b.attackClock||0)*6)%3;
 return {key:key+'-actions',frame:row*4+local};
}
const loops={idle:[0,1],rest:[0,1],float:[2,3,4,5],patrol:[2,3,4,5],emerge:[2,3,4,5],windup:[6,7],warn:[6,7],attack:[8],recover:[9],hurt:[10],defeated:[11],intro:[0,1],sleep:[0,1]};
// Inspected against each dedicated atlas. A raised staff belongs to rain;
// a downward punch belongs to slam, rather than reusing one casting pose.
export const BOSS_POSES={
 'boss-balloon':{streamers:{warn:[2],attack:[2,3]},bombs:{warn:[4],attack:[4,5]},balls:{warn:[6],attack:[6,7]},drop:{warn:[8],attack:[8,9]}},
 serio:{cannons:{warn:[6],attack:[6,8,8,9]},crossfire:{warn:[7],attack:[7,8,6,8]},charge:{warn:[7],attack:[2,3,4,5]}},
 alegre:{juggle:{warn:[6],attack:[6,7,8,2]},rings:{warn:[7],attack:[7,8,9,8]},mirrors:{warn:[4],attack:[4,5,4,2]}},
 agresivo:{slam:{warn:[6],attack:[7,8]},charge:{warn:[6],attack:[2,3,4,5]},clowns:{warn:[0,1],attack:[1,7,0,7]}},
 muta:{spiral:{warn:[6],attack:[6,4,6,5]},rain:{warn:[7],attack:[7]},silence:{warn:[6],attack:[6,8,8,5]}},
};
export function actorFrame(actor,reduced=false,sheet=''){
 const state=actor.hp<=0?'defeated':actor.flash>0?'hurt':actor.action>0?'attack':actor.phase;
 const sequence=BOSS_POSES[sheet]?.[actor.move]?.[state];
 if(sequence){
  if(sheet==='agresivo'&&state==='attack'&&actor.move==='slam')return actor.attackClock<1.3?7:8;
  const clock=state==='attack'?(actor.attackClock||0):actor.clock;
  return sequence[reduced?0:Math.floor(clock*(actor.move==='charge'?12:6))%sequence.length];
 }
 if(sheet==='juggler'&&['attack','recover','hurt'].includes(state))return {attack:7,recover:8,hurt:9}[state];
 if(sheet==='boss-balloon'){
  if(state==='intro')return reduced?0:Math.floor(actor.clock*3)%2;
  if(state==='defeated')return 11;if(state==='hurt')return 10;if(state==='recover')return 0;
  if(state==='warn')return actor.move==='bombs'?5:4;
  if(state==='attack')return actor.move==='drop'?7:6;
 }
 if(sheet==='acrobat'&&state==='patrol')return actor.y<actor.baseY-20?4:actor.y<actor.baseY-4?3:5;
 if(['alegre','muta'].includes(sheet)&&state==='intro')return 2+(reduced?0:Math.floor(actor.clock*6)%4);
 const frames=loops[state]||loops.idle;
 return frames[reduced?0:Math.floor((actor.clock||0)*(state==='patrol'?9:5))%frames.length];
}
export const MAGIC_ROWS={'-1':0,0:1,1:2,2:3,3:4,4:5};
export const HOSTILE_ROWS={ball:0,streamer:1,ring:2,bomb:3,note:4,wave:5,clown:6};
export const effectFrame=(row,age,reduced=false)=>row*4+(reduced?0:Math.floor(age*14)%4);
