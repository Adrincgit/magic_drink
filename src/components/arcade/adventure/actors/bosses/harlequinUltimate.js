import {fireImpact,leaveUltimateFire} from './harlequinFire';
import {impactSmoke} from '../../engine/cinematicImpact';
export const HARLEQUIN_ULTIMATE={leap:.85,charge:2.8,travel:.28,fire:.95,recover:2.4,cooldown:28,slow:.34};
export function ultimateHand(b,charging=b.ultimate?.state==='charge'){
 return{x:b.x+b.dir*(charging?47:80)*HARLEQUIN_SCALE,y:b.y-(charging?116:161)*HARLEQUIN_SCALE};
}
export function beginHarlequinUltimate(s){
 const b=s.boss;if(s.index!==3||b.stage!==3||b.hp<=0||s.superCinematic||s.powerClash)return false;
 b.dir=Math.sign(s.player.x-b.x)||-1;b.y=s.level.arena.y;b.driveSpeed=0;
 b.phase='ultimate-leap';b.move='ultimate';b.vulnerable=true;
 const a=s.level.arena,margin=a.throwMargin||125,toX=s.player.x<(a.left+a.right)/2?a.right-margin:a.left+margin;
 b.ultimate={state:'leap',age:0,hit:false,fromX:b.x,toX,target:{x:s.player.x,y:s.player.y-28}};b.ultimateCooldown=HARLEQUIN_ULTIMATE.cooldown;
 s.hostile=[];return true;
}
// This clock uses real seconds. Only ordinary simulation is slowed by it.
export function stepHarlequinUltimate(s,dt){
 const b=s.boss,q=b.ultimate;if(!q)return;
 if(b.hp<=0){delete b.ultimate;return;}
 q.age+=dt;b.clock+=dt;b.flash=Math.max(0,b.flash-dt);
 if(q.state==='leap'){
  const t=Math.min(1,q.age/HARLEQUIN_ULTIMATE.leap),ease=t*t*(3-2*t);
  b.x=q.fromX+(q.toX-q.fromX)*ease;b.y=s.level.arena.y-Math.sin(t*Math.PI)*240;
  b.dir=Math.sign(s.player.x-b.x)||b.dir;
  if(t===1){q.state='charge';q.age=0;b.phase='ultimate-charge';b.y=s.level.arena.y;q.target={x:s.player.x,y:s.player.y-28};s.events.push('harlequinPower','clashLand');s.shake=.16;}
  return;
 }
 if(q.state==='charge'&&Math.floor(q.age/.5)!==Math.floor((q.age-dt)/.5))s.events.push('harlequinPowerPulse');
 if(q.state==='fire'&&!s.powerClash){
  const beam=ultimateBeamGeometry(s);
  leaveUltimateFire(s,beam,q);
  if(beam.progress===1&&!q.endImpact){
   q.endImpact=true;fireImpact(s,beam.b.x,beam.b.y,1.55,beam.b.y>=s.level.arena.y-60);
   impactSmoke(s,beam.b.x,beam.b.y,.7);s.shake=Math.max(s.shake,.24);
  }
 }
 if(q.state==='charge'&&q.age>=HARLEQUIN_ULTIMATE.charge){
  q.state='fire';q.age=0;b.phase='ultimate-fire';s.events.push('harlequinRelease');s.shake=.24;
 }else if(q.state==='fire'&&q.age>=HARLEQUIN_ULTIMATE.fire){
  q.state='recover';q.age=0;b.phase='ultimate-recover';
 }else if(q.state==='recover'&&q.age>=HARLEQUIN_ULTIMATE.recover){
  delete b.ultimate;b.phase='recover';b.timer=.4;b.move='';
 }
}
export function harlequinUltimateScale(s){return s.boss.ultimate?.state==='charge'?HARLEQUIN_ULTIMATE.slow:1;}
export function ultimateBeamGeometry(s){
 const b=s.boss,q=b.ultimate;if(!q||q.state!=='fire')return null;
 const h=ultimateHand(b,false),target=q.target||{x:s.player.x,y:s.level.arena.y-28};
 let x=b.dir<0?s.level.arena.left:s.level.arena.right;
 const slope=(target.y-h.y)/(target.x-h.x||b.dir),floor=s.level.arena.y-16;
 // A low ray can strike the floor beyond its target; it never continues
 // underground. Its aim is fixed while Hexy remains free to jump or retreat.
 if(h.y+(x-h.x)*slope>floor)x=h.x+(floor-h.y)/slope;
 const t=Math.min(1,q.age/HARLEQUIN_ULTIMATE.travel);
 return{a:h,b:{x:h.x+(x-h.x)*t,y:h.y+(x-h.x)*slope*t},radius:44,progress:t};
}
export function checkUltimateHit(s,playerBody,hurt){
 const beam=ultimateBeamGeometry(s),q=s.boss.ultimate;if(!beam||q.hit)return;
 const p=playerBody(s.player);
 // Segment against the expanded hurtbox. A moving beam is not an enormous
 // axis-aligned rectangle, and players above/below it really can dodge.
 let lo=0,hi=1;
 for(const [start,delta,min,max]of [[beam.a.x,beam.b.x-beam.a.x,p.x-beam.radius,p.x+p.w+beam.radius],[beam.a.y,beam.b.y-beam.a.y,p.y-beam.radius,p.y+p.h+beam.radius]]){
  if(Math.abs(delta)<.0001){if(start<min||start>max)return;}
  else{const a=(min-start)/delta,b=(max-start)/delta;lo=Math.max(lo,Math.min(a,b));hi=Math.min(hi,Math.max(a,b));if(lo>hi)return;}
 }
 q.hit=true;
 fireImpact(s,s.player.x,s.player.y-35,1.8);impactSmoke(s,s.player.x,s.player.y,.95);s.shake=Math.max(s.shake,.32);
 hurt();
 if(s.player.hitReact>0||s.playerDefeat){s.player.vx=Math.sign(beam.b.x-beam.a.x)*300;s.player.vy=-320;}
}
import {HARLEQUIN_SCALE} from './harlequinMetrics';
