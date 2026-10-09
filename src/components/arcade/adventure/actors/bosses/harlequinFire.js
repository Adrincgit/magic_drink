export const PYRE_HEIGHT=420;
export const TRAIL_DURATION=2.1;
export const PYRE_AFTERBURN=3.1;
export const PYRE_DURATION=1.04;
export const PYRE_BASE_DURATION=PYRE_DURATION+PYRE_AFTERBURN;
export const ULTIMATE_TRAIL_DURATION=3.1;
export const harlequinRushSpeed=(stage,gentle=false)=>(870+(stage-1)*145)*(gentle?.85:1);
export const isHarlequinFireHazard=q=>['harlequin-groundfire','harlequin-pyre','harlequin-cloth'].includes(q.kind);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function rushFireScale(q){
 return q.source==='rush'&&q.stage>=2?clamp(q.life/q.duration,0,1)**.8:1;
}
export function fireImpact(s,x,y,power=1,grounded=false){
 s.effects.push({fireBurst:true,x,y,size:270*power,age:0,life:.92,duration:.92,grounded});
 if(!s.events.includes('harlequinFireImpact'))s.events.push('harlequinFireImpact');
}
export function leaveHarlequinFire(s,b,shoot,oldX){
 // Space flames by travelled distance, not frame rate, and keep them behind his boots.
 b.fireDistance=(b.fireDistance||0)+Math.abs(b.x-oldX);
 while(b.fireDistance>=68-1e-7){
  b.fireDistance=Math.max(0,b.fireDistance-68);
  const x=b.x-b.dir*(40+b.fireDistance);
  shoot(s,x,s.level.arena.y,0,0,'harlequin-groundfire',{harlequin:true,r:0,drawSize:110,floor:s.level.arena.y,life:TRAIL_DURATION,duration:TRAIL_DURATION,damaging:false,seed:Math.floor(x/68),source:'rush',stage:b.stage});
 }
}
export function leaveUltimateFire(s,beam,q){
 const distance=Math.hypot(beam.b.x-beam.a.x,beam.b.y-beam.a.y),floor=s.level.arena.y;
 const angle=Math.atan2(beam.b.y-beam.a.y,beam.b.x-beam.a.x);
 q.fireDistance=q.fireDistance||0;
 while(q.fireDistance+78<=distance+1e-7){
  q.fireDistance+=78;
  const x=beam.a.x+Math.cos(angle)*q.fireDistance,y=beam.a.y+Math.sin(angle)*q.fireDistance;
  // Fire spills from the travelling beam onto reachable floor below it.
  // A cast aimed high into the air does not ignite a distant invisible lane.
  if(floor-y>190||x<s.level.arena.left||x>s.level.arena.right)continue;
  s.hostile.push({kind:'harlequin-groundfire',harlequin:true,x,y:floor,floor,vx:0,vy:0,r:0,age:0,life:ULTIMATE_TRAIL_DURATION,duration:ULTIMATE_TRAIL_DURATION,damaging:false,seed:Math.floor(x/78),source:'ultimate'});
 }
}
// Targets are locked when released: both attacks can be read and dodged.
export function castHarlequinFire(s,b,shoot){
 const a=s.level.arena,fast=s.gentle?.82:1;
 if(b.move==='embers'){
  const hand={x:b.x+b.dir*67,y:b.y-145},count=b.stage===3?4:3;
  for(let i=0;i<count;i++){
   const target=clamp(s.player.x+(i-(count-1)/2)*150,a.left+45,a.right-45),flight=(1.2+i*.15)/fast,gravity=520;
   const vx=(target-hand.x)/flight,vy=(a.y-22-hand.y-.5*gravity*flight*flight)/flight;
   shoot(s,hand.x,hand.y,Math.atan2(vy,vx),Math.hypot(vx,vy),'harlequin-ember',{harlequin:true,r:16,drawSize:76,gravity,life:flight+.25});
  }
  b.shotClock=b.stage===3?.72:.94;b.release=.26;s.events.push('harlequinCast');
 }else{
  if(b.volley)return;
  const center=clamp(s.player.x,a.left+210,a.right-210),count=b.stage===3?5:3;
  for(let i=0;i<count;i++){
   const x=clamp(center+(i-(count-1)/2)*160,a.left+55,a.right-55),delay=(s.gentle?1.05:.8)+Math.abs(i-(count-1)/2)*.19;
   shoot(s,x,a.y,0,0,'harlequin-pyre',{harlequin:true,r:0,drawSize:140,delay,life:delay+PYRE_DURATION,damaging:false,floor:a.y});
  }
  b.shotClock=9;b.release=.34;fireImpact(s,b.x+b.dir*37,a.y,.65,true);s.events.push('harlequinLand');s.shake=.22;
 }
 b.volley++;
}
export function harlequinFireHitbox(q){
 if(q.kind==='harlequin-cloth')return q.state==='burn'?{x:q.x-32,y:q.floor-22,w:64,h:22}:{x:q.x-25,y:q.y-17,w:50,h:34};
 if(q.kind==='harlequin-groundfire'){
  const h=q.source==='rush'&&q.stage>=2?88*rushFireScale(q):28;
  return{x:q.x-34,y:q.floor-h,w:68,h};
 }
 if(q.kind!=='harlequin-pyre')return null;
 return{x:q.x-23,y:q.floor-PYRE_HEIGHT,w:46,h:PYRE_HEIGHT};
}
export function stepHarlequinFire(s,q,additions=[]){
 if(q.kind==='harlequin-groundfire'){
  q.damaging=q.age>=(q.source==='pyre'?.16:.12)&&q.life>.45;return true;
 }
 if(q.kind==='harlequin-pyre'){
  if(q.age>=q.delay&&!q.baseStarted){
   // The base ignites with the column, then outlives it. Never restart its
   // animation or safety grace when the tall painting finishes dissipating.
   q.baseStarted=true;const age=q.age-q.delay;
   additions.push({kind:'harlequin-groundfire',harlequin:true,x:q.x,y:q.floor,floor:q.floor,vx:0,vy:0,r:0,drawSize:110,age,life:PYRE_BASE_DURATION-age,duration:PYRE_BASE_DURATION,damaging:age>=.16,seed:Math.floor(q.x/68),source:'pyre'});
  }
  if(q.age>=q.delay+PYRE_DURATION){q.life=0;return true;}
  const was=q.damaging;q.damaging=q.age>=q.delay+.16&&q.age<q.delay+.70;
  if(!was&&q.damaging){s.events.push('harlequinEruption');s.shake=Math.max(s.shake,.1);}
  return true;
 }
 if(['harlequin-ember','harlequin-card'].includes(q.kind)&&q.y>=s.level.arena.y-(q.r||16)){
  q.life=0;fireImpact(s,q.x,s.level.arena.y,.85,true);return true;
 }
 return false;
}

// Start/burn/extinguish use independent paintings at one fixed ground registration.
export function pyreFrame(age,reduced=false){
 if(age<0||age>=PYRE_DURATION)return -1;
 if(age<.16)return Math.min(3,Math.floor(age/.04));
 if(age<.70)return 4+(reduced?2:Math.floor((age-.16)*24)%8);
 return 12+Math.min(3,Math.floor((age-.70)/.085));
}
