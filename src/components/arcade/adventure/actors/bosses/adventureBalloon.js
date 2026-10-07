import {stepWorldEffects} from '../../engine/adventureEffects';
import {followAdventureCamera} from '../../render/adventureCamera';
// The defeated vehicle persists as wreckage. Its effects keep ticking while
// combat ends; they must never become a frozen star hanging in the sky.
export function stepBalloonDefeat(s,dt){
 const b=s.boss,p=s.player,a=s.level.arena;
 if(s.index!==0||b.hp>0||s.superCinematic||(!b.engaged&&p.x<a.entry)||b.defeat?.ready)return false;
 if(!b.defeat){b.defeat={age:0,vy:-45,landedAt:null,ready:false};b.phase='defeated';b.flash=0;s.hostile=[];s.shots=[];s.enemies=s.enemies.filter(e=>e.x<a.left);s.arenaLocked=true;s.noticeTime=0;Object.assign(p,{vx:0,dash:0,spin:0,cast:0,specialCast:0,hitReact:0,firing:false,guarding:false});}
 const q=b.defeat;q.age+=dt;s.time+=dt;p.hurt=1;
 if(q.landedAt===null){
  q.vy+=420*dt;b.y+=q.vy*dt;b.x+=Math.sin(q.age*8)*dt*18;
  if(b.y>=a.y){b.y=a.y;q.landedAt=q.age;s.shake=.3;s.events.push('impact');s.effects.push({x:b.x,y:a.y-20,row:1,size:230,age:0,life:.4});}
 }else if(q.age-q.landedAt>1.15){q.ready=true;s.arenaLocked=false;}
 p.vy+=1550*dt;p.y+=p.vy*dt;if(p.y>=a.y){p.y=a.y;p.vy=0;p.ground=s.platforms.findIndex(t=>p.x>=t.x&&p.x<=t.x+t.w);}
 stepWorldEffects(s,dt);followAdventureCamera(s,dt);return true;
}
export function balloonDefeatFrame(b){
 const q=b.defeat;if(!q)return 0;
 return q.landedAt===null?Math.min(2,Math.floor(q.age*5)):Math.min(7,3+Math.floor((q.age-q.landedAt)*5));
}
