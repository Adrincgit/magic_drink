import {cameraView} from '../render/adventureCamera';
import {stepWorldEffects} from './adventureEffects';
// Completion is part of the world: land, plant, salute and leave the frame.
// It starts after victory even if the player did not rescue a single bunny.
export function beginCompletion(s){
 if(s.clear||s.superCinematic||s.boss.hp>0||(!s.boss.engaged&&!s.boss.defeat&&s.player.x<s.level.arena.entry))return;
 if(s.index===0&&!s.boss.defeat?.ready)return;
 if(s.index===1&&!s.boss.defeat?.ready)return;
 const p=s.player,a=s.level.arena;
 s.clear={age:0,stage:'land',flagX:p.x+51,flagY:a.y};
 s.hostile=[];s.shots=[];s.noticeTime=0;s.arenaLocked=false;
 s.enemies=s.enemies.filter(e=>e.x<a.left);
 Object.assign(p,{dir:1,vx:0,dash:0,spin:0,hitReact:0,cast:0,specialCast:0,superCast:0,charge:0,gliding:false,crouch:false,guarding:false,firing:false,hurt:1});
 s.events.push('win');
}
export function stepCompletion(s,dt){
 const p=s.player,q=s.clear,a=s.level.arena;s.time+=dt;s.boss.deadTime=(s.boss.deadTime||0)+dt;p.hurt=1;
 stepWorldEffects(s,dt);
 if(q.stage==='land'){
  p.vy+=1550*dt;p.y+=p.vy*dt;
  if(p.y>=a.y){p.y=a.y;p.vy=0;p.ground=s.platforms.findIndex(t=>p.x>=t.x&&p.x<=t.x+t.w);q.stage='plant';q.age=0;}
  return;
 }
 q.age+=dt;
 if(q.age<1.9){p.vx=0;return;}
 q.stage='leave';p.vx=255;p.x+=p.vx*dt;p.stride+=p.vx*dt/151.2;
 // The camera deliberately stays at the clearing while Hexy exits it.
 if(p.x>s.camera.x+cameraView(s).width+85){s.done=true;s.won=true;}
}
