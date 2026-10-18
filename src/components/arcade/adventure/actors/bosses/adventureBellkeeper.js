import {beginNightmareDefeat,spawnNightmareSoul} from '../../engine/adventureNightmareMotion';
import {BELLKEEPER_OFFSETS} from './bellkeeperRegistration';
import {faceTarget} from '../enemies/enemyFacing';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export const BELL_BREAK_TIME=2.04;
export const BELL_DEFEAT_TIME=2.3;
const enter=(b,phase,duration)=>Object.assign(b,{phase,timer:duration,phaseDuration:duration,phaseAge:0});

export function breakBellkeeperShell(s){
 const b=s.boss;if(b.bellBroken)return;
 Object.assign(b,{bellBroken:true,stage:2,vulnerable:false,turn:0,summonSites:[],breakY:b.y});
 enter(b,'transform',BELL_BREAK_TIME);s.hostile=[];s.arenaLocked=true;s.shake=.2;
 // The reveal is readable and cannot become a surprise collision from a summon.
 s.player.hurt=Math.max(s.player.hurt,BELL_BREAK_TIME+.65);
 for(const e of s.enemies)if(e.summoned&&e.hp>0){e.hp=0;e.defeated=true;e.soulReleased=true;beginNightmareDefeat(s,e);}
 s.events.push('break','towerTransform');
}

// Every damage source stops at the shell boundary, including multi-hit supers.
// This keeps the second form alive and guarantees one complete transformation.
export function damageBellkeeper(s,damage){
 const b=s.boss;if(!b.vulnerable||b.hp<=0)return;
 const floor=b.bellBroken?0:b.maxHp*.5;
 b.hp=Math.max(floor,b.hp-Math.max(0,damage));
 if(!b.bellBroken&&b.hp<=floor)breakBellkeeperShell(s);
}

function prepareSummon(s){
 const b=s.boss,a=s.level.arena,p=s.player;
 b.summonSites=[];
 for(const dx of [-235,235,-440,440]){
  const x=clamp(p.x+dx,a.left+95,a.right-95);
  if(Math.abs(x-p.x)>150&&b.summonSites.every(q=>Math.abs(q.x-x)>140))b.summonSites.push({x,y:a.y-110});
  if(b.summonSites.length===2)break;
 }
 s.events.push('warning');
}
function recover(b,time){b.recoverFrom=b.phase;b.vulnerable=true;b.summonSites=[];enter(b,'recover',time);}
function projectile(s,x,y,vx,vy,kind='bell-wisp',r=17){s.hostile.push({x,y,vx,vy,r,life:4.2,age:0,kind,drawSize:kind==='bell-wave'?86:72});}

export function stepBellkeeper(s,dt,helpers){
 const b=s.boss,p=s.player,a=s.level.arena;b.flash=Math.max(0,b.flash-dt);b.clock+=dt;
 if(b.hp<=0){
  if(!s.nightmarePurged){s.nightmarePurged=true;s.hostile=[];b.summonSites=[];
   for(const e of s.enemies){e.soulReleased=true;if(e.hp<=0)continue;e.hp=0;e.defeated=true;beginNightmareDefeat(s,e);}
   for(const q of s.graves){q.hp=0;q.phase='broken';q.timer=0;}s.events.push('break');
  }
  b.hp=0;b.flash=0;b.vulnerable=false;b.defeat||={age:0,ready:false};b.defeat.age+=dt;b.deathAge=b.defeat.age;b.phase='dying';
  b.y+=(a.y-b.y)*Math.min(1,dt*2.5);
  if(b.deathAge>=BELL_DEFEAT_TIME&&!b.defeat.ready){b.defeat.ready=true;s.arenaLocked=false;s.hostile=[];s.hearts=Math.min(s.maxHearts,s.hearts+2);s.score+=60;s.events.push('bossDown');}
  if(b.defeat.ready)b.phase='defeated';return;
 }
 if(b.phase==='sleep'){
  if(p.x<a.entry)return;
  Object.assign(b,{engaged:true,dir:-1,vulnerable:false,y:b.baseY-28,stage:1,bellBroken:false});enter(b,'intro',1.3);
  s.arenaLocked=true;s.hostile=[];s.events.push('boss');helpers.say?.(s,'boss');s.enemies=s.enemies.filter(e=>!e.fleeing&&Math.abs(e.x-p.x)<750);return;
 }
 if(!b.bellBroken&&b.hp<=b.maxHp*.5&&b.phase!=='intro')breakBellkeeperShell(s);
 b.timer-=dt;b.phaseAge=(b.phaseAge||0)+dt;
 if(b.phase==='transform'){
  b.vulnerable=false;b.y=b.breakY; // Keep the painted shell, face and fragments registered.
  if(b.timer<=0){b.dir=Math.sign(p.x-b.x)||b.dir;recover(b,1.05);}return;
 }
 if(b.phase==='intro'){
  b.y=b.baseY-28-Math.sin(b.phaseAge*2.4)*10;
  if(b.timer<=0){b.vulnerable=true;enter(b,'patrol',.65);}return;
 }
 const spooky=!!b.bellBroken;
 if(b.phase==='patrol'){
  b.dir=faceTarget(b,p.x);
  if(Math.abs(p.x-b.x)>230)b.x=clamp(b.x+b.dir*(spooky?90:55)*dt,a.left+140,a.right-180);
  b.y+=(b.baseY-(spooky?30:22)+Math.sin(b.clock*2.2)*7-b.y)*Math.min(1,dt*3);
  if(b.timer<=0){
   const moves=spooky?['soulWindup','hauntWindup','summonWindup','hauntWindup']:['summonWindup','ringWindup','charge','slamWindup'];
   const next=moves[b.turn++%moves.length];b.attackDir=b.dir;b.targetX=clamp(p.x,a.left+120,a.right-140);
   enter(b,next,next==='summonWindup'?1.05:next==='slamWindup'||next==='hauntWindup'?1.1:.8);
   if(next==='summonWindup')prepareSummon(s);else s.events.push('warning');
   if(next==='hauntWindup'){b.dashFrom=b.x;b.dashTo=clamp(b.x+b.attackDir*clamp(Math.abs(p.x-b.x)+110,240,570),a.left+120,a.right-140);}
  }
 }else if(b.phase==='summonWindup'){
  if(b.timer<=0){enter(b,'summon',.65);let count=s.enemies.filter(e=>e.type===19&&e.hp>0).length;
   for(const q of b.summonSites)if(count++<4)spawnNightmareSoul(s,q.x,q.y,helpers.makeEnemy,{summoned:true,timer:1.3});
  }
 }else if(b.phase==='summon'){if(b.timer<=0)recover(b,.75);}
 else if(b.phase==='ringWindup'){if(b.timer<=0){enter(b,'ring',.96);b.rings=0;}}
 else if(b.phase==='ring'){
  const due=Math.min(3,1+Math.floor(b.phaseAge/.32));
  while(b.rings<due){const n=b.rings++;projectile(s,b.x+b.attackDir*91,b.baseY-[25,109,25][n],b.attackDir*(205+n*18),0);s.events.push('bellToll');}
  if(b.timer<=0)recover(b,.85);
 }else if(b.phase==='charge'){if(b.timer<=0){b.vulnerable=false;enter(b,'rush',.85);}}
 else if(b.phase==='rush'){
  b.x=clamp(b.x+b.attackDir*320*dt,a.left+120,a.right-140);b.y+=(b.baseY-7-b.y)*Math.min(1,dt*6);
  if(b.timer<=0||b.x<=a.left+120||b.x>=a.right-140)recover(b,1.2);
 }else if(b.phase==='slamWindup'){
  b.y+=(b.baseY-92-b.y)*Math.min(1,dt*4);
  if(b.timer<=0){b.vulnerable=false;b.slamFrom=b.y;enter(b,'slam',.24);}
 }else if(b.phase==='slam'){
  const t=clamp(b.phaseAge/.24,0,1);b.y=b.slamFrom+(b.baseY+12-b.slamFrom)*t*t;
  if(b.timer<=0){for(const dir of [-1,1])projectile(s,b.x+dir*90,b.baseY-16,dir*245,0,'bell-wave',15);s.shake=.2;s.events.push('bellSlam');recover(b,1.3);}
 }else if(b.phase==='soulWindup'){
  if(b.timer<=0){b.volleyTarget={x:p.x,y:p.y-38};b.rings=0;enter(b,'soulVolley',1.04);}
 }else if(b.phase==='soulVolley'){
  const due=Math.min(2,1+Math.floor(b.phaseAge/.52));
  while(b.rings<due){b.rings++;const x=b.x+b.attackDir*72,y=b.y-110,angle=Math.atan2(b.volleyTarget.y-y,b.volleyTarget.x-x);
   for(const offset of [-.23,0,.23])projectile(s,x,y,Math.cos(angle+offset)*225,Math.sin(angle+offset)*225,'bell-soul',13);s.events.push('warning');
  }if(b.timer<=0)recover(b,1);
 }else if(b.phase==='hauntWindup'){
  b.y+=(b.baseY-22-b.y)*Math.min(1,dt*4);if(b.timer<=0)enter(b,'hauntRush',.82);
 }else if(b.phase==='hauntRush'){
  // Commit to the marked lane; no homing or teleporting onto Hexy.
  const t=clamp(b.phaseAge/.82,0,1);b.x=b.dashFrom+(b.dashTo-b.dashFrom)*(t*t*(3-2*t));
  if(b.timer<=0)recover(b,1.15);
 }else if(b.phase==='recover'){
  b.y+=(b.baseY-(spooky?30:22)-b.y)*Math.min(1,dt*2);
  if(b.timer<=0)enter(b,'patrol',spooky?.5:.65);
 }
 helpers.contact(s,b,helpers.body);
}

const pose=(age,start,count,duration)=>start+Math.min(count-1,Math.floor(Math.max(0,age)/Math.max(.001,duration)*count));
export function bellkeeperDrawing(b,reduced=false){
 const age=b.phaseAge||0,duration=b.phaseDuration||1;
 const art=(name,frame)=>{const [x,y]=BELLKEEPER_OFFSETS[name][frame];return{key:'nightmare-'+name+'-v9',frame,offsetX:x*350/320,offsetY:y*350/320};};
 const once=(name,start,count,time=duration,at=age)=>art(name,pose(at,start,count,time));
 const loop=(name,start,count,rate=12)=>art(name,start+(reduced?0:Math.floor(age*rate)%count));
 if(b.hp<=0)return once('wraith-defeat',0,24,BELL_DEFEAT_TIME,b.deathAge||0);
 if(b.phase==='transform')return once('break',0,24,BELL_BREAK_TIME);
 if(b.bellBroken){
  if(['soulWindup','summonWindup'].includes(b.phase))return once('wraith-cast',0,8);
  if(b.phase==='soulVolley')return once('wraith-cast',8,16);
  if(b.phase==='summon')return once('wraith-cast',8,8);
  if(b.phase==='hauntWindup')return once('wraith-dash',0,8);
  if(b.phase==='hauntRush')return once('wraith-dash',8,12);
  if(b.phase==='recover'){
   // The dash brakes before its tail gathers back into the hovering silhouette.
   if(b.recoverFrom==='hauntRush')return age<.24?once('wraith-dash',20,4,.24):once('wraith-idle',12,12,duration-.24,age-.24);
   if(b.recoverFrom!=='transform')return once('wraith-idle',12,12);
  }
  return loop('wraith-idle',0,12);
 }else{
  if(b.phase==='ringWindup')return once('bell-ring',0,8);
  if(b.phase==='ring')return once('bell-ring',8,16);
  if(b.phase==='charge')return once('bell-impact',0,6);
  if(b.phase==='rush')return loop('bell-impact',6,6);
  if(b.phase==='slamWindup')return once('bell-impact',12,8);
  if(b.phase==='slam')return once('bell-impact',20,4);
  if(b.phase==='summonWindup')return once('bell-summon',0,12);
  if(b.phase==='summon')return once('bell-summon',12,12);
  if(b.phase==='recover')return once('bell-idle',12,12);
  return loop('bell-idle',0,12);
 }
}
