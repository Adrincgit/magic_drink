import {beginHitReaction} from './adventureHitReactions';
// Swept collision prevents the fast unopposed spell skipping Hexy or the
// floor. Direct energy and the harmless expanding wind are separate rules.
export function nightmareStormContact(s,q){
 if(q.kind!=='nightmare-storm')return null;
 const p=s.player,x0=q.previousX??q.x,y0=q.previousY??q.y,dx=q.x-x0,dy=q.y-y0,floor=q.floor??s.level.arena.y;
 const end=dy>0?Math.max(0,Math.min(1,(floor-y0)/dy)):1;
 const t=Math.max(0,Math.min(end,((p.x-x0)*dx+(p.y-36-y0)*dy)/(dx*dx+dy*dy||1)));
 if(Math.hypot(x0+dx*t-p.x,y0+dy*t-p.y+36)<72){q.life=0;s.boss.nightmareBlast={x:p.x,y:p.y,age:0,windHit:true};s.shake=.4;s.events.push('clashExplosion');return 'body';}
 if(q.y>=floor&&q.vy>0){
  q.life=0;const x=x0+dx*end;
  s.boss.nightmareBlast={x,y:floor,age:0,windHit:false};s.shake=.35;s.events.push('clashExplosion','harlequinLand');return 'floor';
 }
 return 'travel';
}
export function stepNightmareBlast(s,dt){
 const q=s.boss.nightmareBlast;if(!q)return;q.age+=dt;
 const distance=Math.hypot(s.player.x-q.x,(s.player.y-q.y)*.5),radius=70+Math.min(1,q.age/.55)*800;
 if(!q.windHit&&q.age<.7&&distance<radius){
  q.windHit=true;const p=s.player,dir=Math.sign(p.x-q.x)||-s.boss.dir;
  beginHitReaction(s,{x:q.x,vx:dir,element:'physical',heavyImpact:true});
  p.vx=dir*460;p.vy=-345;p.guarding=false;p.dash=0;p.charge=0;s.events.push('nightmareBlastWind');
 }
 if(q.age>1.6)delete s.boss.nightmareBlast;
}
