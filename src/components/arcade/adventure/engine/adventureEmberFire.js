import {groundY} from '../world/adventureTerrain';
import {burstEmberProjectile,emberBlastHitbox} from './adventureEmberBlast';
import {enemyMuzzle} from '../actors/enemies/adventureEnemyGeometry';
import {harlequinFireHitbox,isHarlequinFireHazard} from '../actors/bosses/harlequinFire';
import {impactKind} from './adventureHitReactions';
export function emberFloor(s,x){
 const pit=s.level.emberPits?.find(p=>x>p.x&&x<p.x+p.w);
 return pit?pit.y:groundY(s.level.route||s.platforms,x);
}
export function igniteEmberGround(s,x,duration=4.2){
 if(!s.level.emberTrail||s.fortInside)return;
 const floor=emberFloor(s,x);
 const old=s.hostile.find(q=>q.source==='forest'&&q.life>0&&Math.abs(q.x-x)<58);
 if(old){old.life=Math.max(old.life,duration);return;}
 s.hostile.push({kind:'harlequin-groundfire',source:'forest',harlequin:true,element:'fire',x,y:floor,floor,vx:0,vy:0,r:0,age:0,life:duration,duration,damaging:false,seed:Math.floor(x/68)});
}
export function igniteEmberBushes(s,x,y,radius){
 for(const q of s.emberEnvironment?.bushes||[]){
  if(q.state==='green'&&Math.abs(q.x-x)<radius+48&&Math.abs(q.y-30-y)<radius+38){q.state='burning';q.age=0;igniteEmberGround(s,q.x,7);s.events.push('emberIgnite');}
 }
}
export function emberBreathHitbox(q){
 if(!['ember-breath','fort-breath'].includes(q.kind))return null;
 return{x:q.dir>0?q.x:q.x-q.range,y:q.y-28,w:q.range,h:88};
}
// All live fire uses the same brush contact path, including Hexy's Dragon
// Grape, ascending projectiles, continuous jets and the flaming blast frames.
export function igniteEmberFromAttack(s,q,friendly=false){
 if(!s.level.emberTrail||s.fortInside||q.life<=0||q.quenched||q.extinguished)return;
 if(!(friendly&&q.kind===0)&&impactKind(q)!=='fire')return;
 if(isHarlequinFireHazard(q)&&!q.damaging)return;
 // Propagation takes time; newly created ground flames cannot consume a
 // whole thicket during the same iteration of the projectile array.
 if(q.source==='forest'&&q.age<.65)return;
 let box=emberBreathHitbox(q)||emberBlastHitbox(q)||harlequinFireHitbox(q);
 if(q.kind==='ember-blast'&&!box)return;
 if(!box){const r=q.r||12,x=q.previousX??q.x,y=q.previousY??q.y;box={x:Math.min(x,q.x)-r,y:Math.min(y,q.y)-r,w:Math.abs(q.x-x)+r*2,h:Math.abs(q.y-y)+r*2};}
 if(box.w<=0||box.h<=0)return;
 for(const bush of s.emberEnvironment?.bushes||[]){
  if(bush.state!=='green'||box.x+box.w<bush.x-62||box.x>bush.x+62||box.y+box.h<bush.y-60||box.y>bush.y+4)continue;
  bush.state='burning';bush.age=0;igniteEmberGround(s,bush.x,7);s.events.push('emberIgnite');
 }
}
export function stepEmberFire(s,q,dt){
 if(!['ember-breath','fort-breath'].includes(q.kind))return false;
 const e=q.owner;
 if(!e||e.hp<=0||e.trap>0||e.phase!=='attack'){q.life=0;return true;}
 const mouth=q.kind==='fort-breath'?{x:e.x+q.offsetX,y:e.y-68}:enemyMuzzle(e);q.x=mouth.x;q.y=mouth.y;
 q.maxRange??=q.kind==='fort-breath'?380:320;
 q.range=q.maxRange*Math.min(1,q.age/.38)*Math.min(1,q.life/.28);
 igniteEmberFromAttack(s,q);
 q.spillClock=(q.spillClock||0)-dt;
 if(q.range>180&&q.spillClock<=0){
  const x=q.x+q.dir*q.range*.85,floor=emberFloor(s,x);
  if(floor-q.y<140){igniteEmberGround(s,x,3.6);q.spillClock=.45;}
 }
 return true;
}
export function landEmberFire(s,q){
 if(!q.ember||q.quenched||q.extinguished||['ember-breath','fort-breath'].includes(q.kind)||q.vy<=0)return false;
 const floor=emberFloor(s,q.x);
 igniteEmberBushes(s,q.x,q.y,q.r||24);
 if(q.y+(q.r||16)<floor)return false;
 q.life=0;burstEmberProjectile(s,{...q,y:floor},{grounded:true});igniteEmberGround(s,q.x,4.5);igniteEmberBushes(s,q.x,floor,90);return true;
}
