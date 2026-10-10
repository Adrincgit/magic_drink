import {fortWindowTargets,hitFortWindow,updateFortWindows} from './adventureFortWindows';
import {fireImpact} from './harlequinFire';
export const FORT_HEALTH=280;
export function fortRig(s){const b=s.boss;return{upper:{x:b.x-190,y:b.y-290},lower:{x:b.x-255,y:b.y-165},core:{x:b.x+24,y:b.y-95},hatch:{x:b.x-292,y:b.y}};}
export function fortBallistics(s,port,target=s.boss.targetX??s.player.x){
 const m=fortRig(s)[port],flight=s.gentle?1.8:1.45,gravity=430;
 let x=m.x-72,y=m.y;
 let vx=(target-x)/flight,vy=(s.level.arena.y-28-y-.5*gravity*flight*flight)/flight;
 const rotation=Math.atan2(vy,vx)+Math.PI;
 x=m.x-Math.cos(rotation)*72;y=m.y-Math.sin(rotation)*72;
 vx=(target-x)/flight;vy=(s.level.arena.y-28-y-.5*gravity*flight*flight)/flight;
 return{x,y,vx,vy,gravity,flight,rotation};
}
export function fortSystems(s){
 const b=s.boss,k=b.maxHp/FORT_HEALTH;
 return b.fortParts??=(Object.fromEntries([['upper',70],['lower',70],['core',140]].map(([key,hp])=>[key,{hp:hp*k,maxHp:hp*k,flash:0}])));
}
export function fortTargets(s){
 const parts=fortSystems(s),rig=fortRig(s);
 return [...fortWindowTargets(s),...['upper','lower','core'].filter(key=>parts[key].hp>0).map(part=>({part,x:rig[part].x-(part==='core'?60:78),y:rig[part].y-55,w:part==='core'?120:156,h:110}))];
}
export function fortPartHit(s,part,damage){
 if(part.startsWith('window-')){hitFortWindow(s,part,damage);return 0;}
 const q=fortSystems(s)[part];if(!q||q.hp<=0)return 0;
 const dealt=Math.min(q.hp,damage);q.hp-=dealt;q.flash=.2;
 if(q.hp<=0){
  const point=fortRig(s)[part];fireImpact(s,point.x,point.y,.58);s.events.push('impact');s.shake=.24;
  if(part!=='core')for(let i=0;i<4;i++)(s.organDebris??=[]).push({art:'barge-cannon',crop:[i/4,0,.25,1],x:point.x+(i-2)*24,y:point.y,w:36,h:75,vx:(i-2)*65,vy:-120-i%2*75,rotation:0,spin:(i%2?1:-1)*2,age:0,life:2.2,floor:s.level.arena.y,water:false,jagged:true});
 }
 // The heart powers the entire bastion. Its destruction wins even when the
 // player chose to brave the guns instead of spending shots disabling them.
 return part==='core'&&q.hp<=0?s.boss.hp:dealt;
}
export function updateEmberFort(s,dt,{makeEnemy},shoot){
 const b=s.boss,parts=fortSystems(s),rig=fortRig(s),p=s.player;
 if(p.x>b.x+270){p.x=b.x+270;p.vx=Math.min(0,p.vx);}
 const guns=['lower','upper'].filter(key=>parts[key].hp>0);
 b.fortStage=b.coreOpened?2:1;b.stage=b.fortStage;
 b.hatchOpen=Math.max(0,(b.hatchOpen||0)-dt);
 if((!guns.length||parts.core.hp<=parts.core.maxHp*.5)&&!b.coreOpened){b.coreOpened=true;b.phase='transform';b.timer=2.3;b.turn=1;b.vulnerable=true;s.hostile=[];s.events.push('towerTransform');s.shake=.2;}
 if(b.phase==='transform'){
  b.coreDrop=1;b.vulnerable=true;
  if(b.timer<=0){b.coreDrop=1;b.phase='recover';b.timer=1.4;}
  return;
 }
 b.gunAngles??={upper:0,lower:0};
 for(const key of guns){const target=fortBallistics(s,key).rotation;b.gunAngles[key]+=(target-b.gunAngles[key])*Math.min(1,dt*3);}
 for(const q of Object.values(parts))q.flash=Math.max(0,q.flash-dt);
 // Hexy can walk beneath the gun decks to reach the heart. Only the rear
 // bulkhead blocks passage; touching the machinery never deals damage.
 b.vulnerable=b.phase!=='intro';
 if(b.phase==='intro'){if(b.timer<=0){b.phase='recover';b.timer=.6;}return;}
 updateFortWindows(s,dt,shoot);
 if(b.phase==='warn'){
  if(b.timer<=0){b.phase='attack';b.timer=2.1;b.shotClock=0;b.attackClock=0;}
 }else if(b.phase==='attack'){
  b.attackClock+=dt;b.shotClock-=dt;
  if(b.shotClock<=0){
   const ports=guns;
   if(b.move==='vent'){
    for(const dir of [-1,1])shoot(s,b.x+dir*145,b.y-68,0,0,'fort-breath',{ember:true,element:'fire',owner:b,offsetX:dir*145,dir,r:0,life:1.8,duration:1.8,range:0});
    b.shotClock=4;s.events.push('emberBreath');
   }else if(b.move==='reinforce'){
    if(s.enemies.filter(e=>e.fortCrew&&e.hp>0).length<3){const e=makeEnemy(rig.hatch.x,s.level.arena.y,b.turn%2?10:11,b.turn);e.fortCrew=true;e.hatchX=rig.hatch.x;e.emerging=1.5;e.dir=-1;e.timer=2.8;e.home=rig.hatch.x-165;s.enemies.push(e);}
    b.shotClock=1.1;
   }else if(!ports.length){
    const x=rig.core.x-52,y=rig.core.y-25,flight=1.65,gravity=470;
    const target=Math.max(s.level.arena.left+90,Math.min(b.x+200,b.targetX+(b.attackClock<1? -100:110)));
    const vx=(target-x)/flight,vy=(s.level.arena.y-26-y-.5*gravity*flight*flight)/flight;
    shoot(s,x,y,Math.atan2(vy,vx),Math.hypot(vx,vy),'ember-mortar',{ember:true,element:'fire',r:27,drawSize:100,gravity,life:3,floor:s.level.arena.y});
    b.shotClock=1.05;b.release=.3;s.events.push('harlequinCast');
   }else{
    const part=ports[Math.floor(b.attackClock/.7)%ports.length];
    const q=fortBallistics(s,part);
    shoot(s,q.x,q.y,Math.atan2(q.vy,q.vx),Math.hypot(q.vx,q.vy),'ember-mortar',{element:'fire',ember:true,r:26,drawSize:96,gravity:q.gravity,life:q.flight+.7,floor:s.level.arena.y,port:part});
    b.firedPort=part;b.release=.23;b.shotClock=s.gentle?.85:.65;s.events.push('cannon');
   }
  }
  if(b.timer<=0){b.phase='recover';b.timer=s.gentle?1.9:1.35;}
 }else if(b.timer<=0){
  b.phase='warn';const turn=b.turn++%4;b.move=turn===2?'reinforce':turn===1||turn===3?'vent':guns.length?'salvo':'furnace';b.timer=b.move==='vent'?1.65:s.gentle?1.55:1.25;b.targetX=p.x;
  if(b.move==='reinforce')b.hatchOpen=4.8;
  if(!guns.length&&b.move==='furnace'){
   for(const dx of [-145,145]){const x=Math.max(s.level.arena.left+80,Math.min(b.x-390,p.x+dx));const delay=b.timer+.5;shoot(s,x,s.level.arena.y,0,0,'harlequin-pyre',{harlequin:true,element:'fire',r:0,drawSize:140,delay,life:delay+1.04,damaging:false,floor:s.level.arena.y});}
  }
  s.events.push('warning');
 }
}
export function stepFortDefeat(s,dt){
 if(s.index!==5||s.boss.hp>0||!s.boss.engaged)return;
 const b=s.boss;
 if(!b.defeat){b.defeat={age:0,ready:false,burst:0};b.phase='defeated';s.hostile=[];s.enemies=s.enemies.filter(e=>!e.fortCrew);s.arenaLocked=false;s.hearts=Math.min(s.maxHearts,s.hearts+2);s.score+=60;s.events.push('bossDown');}
 const d=b.defeat;d.age+=dt;
 if(d.age<2.5&&d.age>d.burst){d.burst+=.3;fireImpact(s,b.x-220+Math.sin(d.burst*18)*180,b.y-90-Math.abs(Math.cos(d.burst*7))*250,.52);s.shake=.18;}
 if(d.age>=2.8)d.ready=true;
}
