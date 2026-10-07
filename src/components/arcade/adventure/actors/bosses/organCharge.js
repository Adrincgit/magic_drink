const clamp=(x,left,right)=>Math.max(left,Math.min(right,x));
const ease=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
export const organChargeSpeed=s=>(s.gentle?650:s.boss.transformed?1020:900)*1.15;
function wheelDust(s,b,q,distance,burnout=false){
 q.dustDistance+=distance;
 while(q.dustDistance>=22){
  q.dustDistance-=22;const i=q.dustIndex++,dust=s.organDust??=[];
  for(const wheel of [-108,108])dust.push({x:b.x+wheel,y:s.level.arena.y-5,vx:45+i%4*18,vy:-(burnout?38:28)-i%3*12,r:(burnout?14:10)+i%3*2,age:0,life:(burnout?1:.8)+i%3*.08,floor:s.level.arena.y});
  if(dust.length>96)dust.splice(0,dust.length-96);
 }
}

export function prepareOrganCharge(s){
 const b=s.boss,a=s.level.arena,home=a.right-345;
 // Commit before the warning. Retreating Hexy never moves this destination.
 const target=b.transformed?a.left+(s.gentle?320:250):clamp(s.player.x-140,a.left+(s.gentle?430:370),home-280);
 b.charge={from:b.x,target,duration:Math.max((s.gentle?.95:.78)/1.15,(b.x-target)*1.5/organChargeSpeed(s)),returnAge:0,dustDistance:0,dustIndex:0};
 b.phase='warn';b.timer=s.gentle?2.65:2.3;b.charge.warning=b.timer;
 b.vulnerable=true;b.steamRelease=.65;s.hostile=[];s.events.push('organRev');
}

export function stepOrganCharge(s,dt){
 const b=s.boss,q=b.charge;if(!q||b.move!=='organ-charge')return false;
 const previous=b.x,home=s.level.arena.right-345;
 if(b.phase==='warn'){
  const t=1-Math.max(0,b.timer)/q.warning;
  b.x=q.from+Math.sin(t*Math.PI)*14;b.vulnerable=true;
  wheelDust(s,b,q,dt*(70+t*t*570),true);
  if(b.timer<=0){q.from=b.x;b.phase='attack';b.timer=q.duration;b.attackClock=0;b.vulnerable=false;b.steamRelease=.8;s.events.push('organCharge');}
 }else if(b.phase==='attack'){
  b.attackClock+=dt;b.x=q.from+(q.target-q.from)*ease(b.attackClock/q.duration);b.vulnerable=false;
  // Leave actual world-space dust behind both tyres instead of moving a puff
  // with the machine. Distance-based emission is identical across frame rates.
  wheelDust(s,b,q,Math.abs(b.x-previous));
  s.shake=Math.max(s.shake||0,Math.min(1,Math.abs(b.x-previous)/dt/900)*.05);
  if(b.attackClock>=q.duration){b.x=q.target;b.phase='recover';b.timer=s.gentle?3.5:3.05;b.vulnerable=true;q.returnAge=0;b.steamRelease=.45;wheelDust(s,b,q,66,true);s.events.push('organBrake');}
 }else if(b.phase==='recover'){
  q.returnAge+=dt;b.x=q.target+(home-q.target)*ease(q.returnAge/1.85);b.vulnerable=true;
  if(b.timer<=0){b.x=home;b.driveOffset=0;b.charge=null;return false;}
 }else{return false;}
 b.driveOffset=b.x-home;b.driveSpeed=(b.x-previous)/dt;
 return true;
}
