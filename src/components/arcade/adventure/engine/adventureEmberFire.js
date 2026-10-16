import {fortVents,fortVentRig} from '../actors/bosses/fortVents';
import {groundY} from '../world/adventureTerrain';
import {burstEmberProjectile,emberBlastHitbox} from './adventureEmberBlast';
import {enemyMuzzle} from '../actors/enemies/adventureEnemyGeometry';
import {harlequinFireHitbox,isHarlequinFireHazard} from '../actors/bosses/harlequinFire';
import {impactKind} from './adventureHitReactions';
import {wetGround} from './adventureWater';
export function emberFloor(s,x){
 const pit=s.level.emberPits?.find(p=>x>p.x&&x<p.x+p.w);
 return pit?pit.y:groundY(s.level.route||s.platforms,x);
}
export function igniteEmberGround(s,x,duration=4.2){
 if(!s.level.emberTrail||s.fortInside)return;
 const floor=emberFloor(s,x);
 if(wetGround(s,x,floor))return;
 const old=s.hostile.find(q=>q.source==='forest'&&q.life>0&&Math.abs(q.x-x)<58);
 if(old){old.life=Math.max(old.life,duration);return;}
 s.hostile.push({kind:'harlequin-groundfire',source:'forest',harlequin:true,element:'fire',x,y:floor,floor,vx:0,vy:0,r:0,age:0,life:duration,duration,damaging:false,seed:Math.floor(x/68)});
}
export function igniteEmberBushes(s,x,y,radius){
 for(const q of s.emberEnvironment?.bushes||[]){
  if(q.state==='green'&&!q.wetTime&&!wetGround(s,q.x,q.y)&&Math.abs(q.x-x)<radius+48&&Math.abs(q.y-30-y)<radius+38){q.state='burning';q.age=0;igniteEmberGround(s,q.x,7);s.events.push('emberIgnite');}
 }
}
export function emberBreathHitbox(q){
 if(!['ember-breath','fort-breath'].includes(q.kind))return null;
 if(q.kind==='fort-breath'&&Number.isFinite(q.angle)){const x=q.x+Math.cos(q.angle)*q.range,y=q.y+Math.sin(q.angle)*q.range;return{x:Math.min(q.x,x)-10,y:Math.min(q.y,y)-25,w:Math.abs(x-q.x)+20,h:Math.abs(y-q.y)+50};}
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
  if(bush.state!=='green'||bush.wetTime||wetGround(s,bush.x,bush.y)||box.x+box.w<bush.x-62||box.x>bush.x+62||box.y+box.h<bush.y-60||box.y>bush.y+4)continue;
  bush.state='burning';bush.age=0;igniteEmberGround(s,bush.x,7);s.events.push('emberIgnite');
 }
}
export function stepEmberFire(s,q,dt){
 if(q.ember&&['ember-mortar','ember-fireball','ember-cinder'].includes(q.kind)&&!q.quenched&&q.life>0){
  q.smokeClock=(q.smokeClock||0)-dt;if(q.smokeClock<=0){q.smokeClock+=.055;const speed=Math.hypot(q.vx,q.vy)||1;
   s.effects.push({cinematicSmoke:true,soot:true,x:q.x-q.vx/speed*25,y:q.y-q.vy/speed*25,size:(q.drawSize||96)*.57,vx:-q.vx*.035,vy:-18,age:0,life:.85,duration:.85,seed:Math.floor(q.age*18),alpha:.8});
  }
 }
 if(!['ember-breath','fort-breath'].includes(q.kind))return false;
 const e=q.owner;
 if(!e||e.hp<=0||e.trap>0||e.phase!=='attack'){q.life=0;return true;}
 let mouth=enemyMuzzle(e);
 if(q.kind==='fort-breath'){const v=fortVents(s).find(v=>v.part===q.ventPart);if(!v||v.hp<=0){q.life=0;return true;}const m=fortVentRig(s,v);mouth=m.mouth;q.angle=m.angle;}q.x=mouth.x;q.y=mouth.y;
 q.maxRange??=q.kind==='fort-breath'?380:320;
 q.range=q.maxRange*Math.min(1,q.age/.38)*Math.min(1,q.life/.28);
 igniteEmberFromAttack(s,q);
 q.spillClock=(q.spillClock||0)-dt;
 if(q.range>180&&q.spillClock<=0){
  const x=q.x+(Number.isFinite(q.angle)?Math.cos(q.angle):q.dir)*q.range*.85,floor=emberFloor(s,x);
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
