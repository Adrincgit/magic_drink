import {fireImpact} from './harlequinFire';
import {impactSmoke} from '../../engine/cinematicImpact';
import {stepWorldEffects} from '../../engine/adventureEffects';
import {followAdventureCamera} from '../../render/adventureCamera';
export const HARLEQUIN_DEFEAT={land:1.65,extinguish:3.25,finish:4.9};
export function stepHarlequinDefeat(s,dt){
 const b=s.boss,p=s.player,a=s.level.arena;
 if(s.index!==3||b.hp>0||s.superCinematic||!b.engaged||b.defeat?.ready)return false;
 if(!b.defeat){
  const prone=b.clashFlight?.frame===4,dir=Math.sign(b.x-p.x)||-b.dir;
  delete b.ultimate;delete b.clashFlight;
  b.defeat={age:prone?HARLEQUIN_DEFEAT.land:0,ready:false,landed:prone,frame:prone?16:12,fromX:b.x,fromY:b.y,
   toX:Math.max(a.left+130,Math.min(a.right-130,b.x+dir*170))};
  b.phase='dying';b.flash=0;b.scorched=Math.max(.28,b.scorched||0);b.smokeTime=6;s.hostile=[];s.shots=[];s.arenaLocked=true;s.noticeTime=0;
  Object.assign(p,{vx:0,dash:0,spin:0,cast:0,specialCast:0,hitReact:0,firing:false,guarding:false});s.events.push('harlequinDown');}
 const q=b.defeat;q.age+=dt;s.time+=dt;p.hurt=1;b.clock+=dt;
 if(!q.landed){
  const t=Math.max(0,Math.min(1,(q.age-.18)/(HARLEQUIN_DEFEAT.land-.18)));
  b.x=q.fromX+(q.toX-q.fromX)*(1-Math.pow(1-t,2));
  b.y=q.fromY+(a.y-q.fromY)*t-Math.sin(t*Math.PI)*95;
  q.frame=12+Math.min(3,Math.floor(t*4));
  if(q.age>=HARLEQUIN_DEFEAT.land){q.landed=true;q.frame=16;b.y=a.y;fireImpact(s,b.x,a.y-12,1.5,true);impactSmoke(s,b.x,a.y,1.8);s.shake=.32;s.events.push('harlequinDefeatLand');}
 }
 if(q.age>=HARLEQUIN_DEFEAT.extinguish&&!b.shattered){b.shattered=true;b.smokeTime=0;fireImpact(s,b.x,b.y-48,2.6);fireImpact(s,b.x-85,b.y,1.2,true);fireImpact(s,b.x+85,b.y,1.2,true);impactSmoke(s,b.x,b.y,2.35);s.events.push('harlequinVanish');s.shake=.38;}
 p.vy+=1550*dt;p.y+=p.vy*dt;if(p.y>=a.y){p.y=a.y;p.vy=0;p.ground=s.platforms.findIndex(t=>p.x>=t.x&&p.x<=t.x+t.w);}
 stepWorldEffects(s,dt);followAdventureCamera(s,dt);
 if(q.age>=HARLEQUIN_DEFEAT.finish){
  q.ready=true;b.phase='defeated';s.arenaLocked=false;
  // Award once, after the dramatic beat; completion owns the victory fanfare.
  s.hearts=Math.min(s.maxHearts,s.hearts+2);s.score+=60;s.enemies=s.enemies.filter(e=>e.x<a.left);
 }return true;
}
