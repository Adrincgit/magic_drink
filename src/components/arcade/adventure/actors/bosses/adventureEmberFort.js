import {fortWindowTargets,hitFortWindow,updateFortWindows} from './adventureFortWindows';
import {impactSmoke} from '../../engine/cinematicImpact';
import {fortVents,fortVentRig,fortVentTargets,stepFortVents} from './fortVents';
import {breakFortCannon,fortRupture,fortCollapseCover} from './fortDestruction';
import {fireImpact} from './harlequinFire';
import {fortRig,FORT_SCALE} from './fortGeometry';
export {fortRig} from './fortGeometry';
export const FORT_HEALTH=400;
export function fortBallistics(s,port,target=s.boss.targetX??s.player.x){
 const m=fortRig(s)[port],gravity=430,barrel=326/513*156*FORT_SCALE,lip=44/513*156*FORT_SCALE;
 const floor=s.level.arena.y-28,flight=Math.max(s.gentle?1.8:1.45,Math.sqrt(Math.max(0,2*(floor-m.y)/gravity))+.18);
 // A target behind the fixed gun never makes it turn through its operator.
 target=Math.min(target,m.x-barrel-145);
 const dx=target-m.x,dy=floor-m.y-.5*gravity*flight*flight;
 // Solve the lip offset analytically so launch velocity follows the bore.
 const rotation=Math.atan2(-dy,-dx)-Math.asin(lip/Math.hypot(dx,dy));
 const x=m.x-Math.cos(rotation)*barrel+Math.sin(rotation)*lip,y=m.y-Math.sin(rotation)*barrel-Math.cos(rotation)*lip;
 const vx=(target-x)/flight,vy=(floor-y-.5*gravity*flight*flight)/flight;
 return{x,y,vx,vy,gravity,flight,rotation};
}
export function fortSystems(s){
 const b=s.boss,k=b.maxHp/FORT_HEALTH;
 return b.fortParts??=(Object.fromEntries([['wall',48],['gate',62],['upper',60],['lower',60],['core',170]].map(([key,hp])=>[key,{hp:hp*k,maxHp:hp*k,flash:0}])));
}
export function fortTargets(s){
 const parts=fortSystems(s),rig=fortRig(s);
 const barrier=parts.wall.hp>0?'wall':parts.gate.hp>0?'gate':'core';
 const m=rig[barrier],w=barrier==='wall'?238:170,h=barrier==='wall'?310:barrier==='core'?340:250;
 return [...fortVentTargets(s),{part:barrier,x:m.x-w/2,y:m.y-h/2,w,h},...fortWindowTargets(s),...['upper','lower'].filter(key=>parts[key].hp>0).map(part=>({part,x:rig[part].x-78*FORT_SCALE,y:rig[part].y-55*FORT_SCALE,w:156*FORT_SCALE,h:110*FORT_SCALE}))];
}
export function fortPartHit(s,part,damage){
 if(part.startsWith('window-')){hitFortWindow(s,part,damage);return 0;}
 if(part.startsWith('vent-')){const v=fortVents(s).find(q=>q.part===part);if(!v||v.hp<=0||v.deploy<=.55)return 0;v.hp=Math.max(0,v.hp-damage);v.flash=.2;if(!v.hp){const m=fortVentRig(s,v);fireImpact(s,m.x,m.y,.5);s.events.push('impact');}return 0;}
 const parts=fortSystems(s),q=parts[part];if(!q||q.hp<=0)return 0;
 if((part==='gate'||part==='core')&&parts.wall.hp>0||part==='core'&&(parts.gate.hp>0||!s.boss.coreOpened))return 0;
 const dealt=Math.min(q.hp,damage);q.hp-=dealt;q.flash=.2;
 if(q.hp<=0){
  const point=fortRig(s)[part];fireImpact(s,point.x,point.y,.58);s.events.push('impact');s.shake=.24;
  if(part==='wall')s.boss.wallBreakAge=0;
  if(['upper','lower'].includes(part))breakFortCannon(s,point,s.boss.gunAngles?.[part]||0);
 }
 // The heart powers the entire bastion. Its destruction wins even when the
 // player chose to brave the guns instead of spending shots disabling them.
 return part==='core'&&q.hp<=0?s.boss.hp:dealt;
}
export function updateEmberFort(s,dt,{makeEnemy},shoot){
 const b=s.boss,parts=fortSystems(s),rig=fortRig(s),p=s.player;
 if(b.coreOpened)b.assemblyAge=(b.assemblyAge||0)+dt;
 stepFortVents(s,dt);
 if(b.furnacePulse){const before=b.furnacePulse.age;b.furnacePulse.age+=dt;
  if(before<.72&&b.furnacePulse.age>=.72){impactSmoke(s,rig.core.x,b.y-6,1.05);s.events.push('impact');s.shake=.18;}
  if(b.furnacePulse.age>b.furnacePulse.duration+1.15)delete b.furnacePulse;
 }
 const stop=parts.wall.hp>0?rig.wall.x-146:parts.core.hp>0?rig.core.x-104:b.x+440;
 if(p.x>stop){p.x=stop;p.vx=Math.min(0,p.vx);}
 if(b.wallBreakAge!==undefined)b.wallBreakAge+=dt;
 const guns=['lower','upper'].filter(key=>parts[key].hp>0);
 b.fortStage=b.coreOpened?2:1;b.stage=b.fortStage;
 b.hatchOpen=Math.max(0,(b.hatchOpen||0)-dt);
 b.gunBursts??={};for(const key of Object.keys(b.gunBursts)){b.gunBursts[key]+=dt;if(b.gunBursts[key]>1.2)delete b.gunBursts[key];}
 if(parts.gate.hp<=0&&!b.coreOpened){b.coreOpened=true;b.assemblyAge=0;impactSmoke(s,rig.core.x,b.y-85,.85);b.phase='transform';b.timer=2.3;b.turn=1;b.vulnerable=true;s.hostile=[];s.events.push('towerTransform');s.shake=.2;}
 if(b.phase==='transform'){
  b.coreDrop=1;b.vulnerable=true;
  if(b.timer<=0){b.coreDrop=1;b.phase='recover';b.timer=1.4;}
  return;
 }
 b.gunAngles??={upper:0,lower:0};
 for(const key of guns){const target=fortBallistics(s,key).rotation;b.gunAngles[key]+=(target-b.gunAngles[key])*Math.min(1,dt*3);}
 for(const q of Object.values(parts))q.flash=Math.max(0,q.flash-dt);
 // Breaking the outer wall opens the approach beneath the gun decks.
 // The reactor remains solid; touching the machinery never deals damage.
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
    for(const v of fortVents(s).filter(v=>v.hp>0&&v.deploy>.9)){const m=fortVentRig(s,v);shoot(s,m.mouth.x,m.mouth.y,0,0,'fort-breath',{ember:true,element:'fire',owner:b,ventPart:v.part,dir:v.dir,angle:m.angle,r:0,life:1.8,duration:1.8,range:0});}
    b.shotClock=4;s.events.push('emberBreath');
   }else if(b.move==='reinforce'){
    if(s.enemies.filter(e=>e.fortCrew&&e.hp>0).length<3){const e=makeEnemy(rig.hatch.x,s.level.arena.y,b.turn%2?10:11,b.turn);e.fortCrew=true;e.hatchX=rig.hatch.x;e.emerging=2.1;e.dir=-1;e.timer=2.8;e.home=rig.hatch.x-430;s.enemies.push(e);}
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
    b.gunAngles[part]=q.rotation;b.gunBursts[part]=0;
    b.firedPort=part;b.release=.23;b.shotClock=s.gentle?.85:.65;s.events.push('cannon');
   }
  }
  if(b.timer<=0){b.phase='recover';b.timer=s.gentle?1.9:1.35;}
 }else if(b.timer<=0){
  b.phase='warn';const turn=b.turn++%4;b.move=turn===2?'reinforce':b.coreOpened&&fortVents(s).some(v=>v.hp>0)&&(turn===1||turn===3)?'vent':guns.length?'salvo':'furnace';b.timer=b.move==='vent'?1.65:s.gentle?1.55:1.25;b.targetX=p.x;
  if(b.move==='reinforce')b.hatchOpen=4.8;
  if(!guns.length&&b.move==='furnace'){
   b.furnacePulse={age:0,duration:b.timer+.5,targets:[]};
   const center=Math.max(s.level.arena.left+225,Math.min(b.x-535,p.x));
   for(const dx of [-145,145]){const x=center+dx;const delay=b.timer+.5;b.furnacePulse.targets.push(x);shoot(s,x,s.level.arena.y,0,0,'harlequin-pyre',{harlequin:true,element:'fire',r:0,drawSize:140,fortSource:true,delay,life:delay+1.04,damaging:false,floor:s.level.arena.y});}
  }
  s.events.push('warning');
 }
}
export function stepFortDefeat(s,dt){
 if(s.index!==5||s.boss.hp>0||!s.boss.engaged)return;
 const b=s.boss;
 if(!b.defeat){b.defeat={age:0,ready:false,burst:0,coverFrame:-1};b.phase='defeated';s.hostile=[];s.enemies=s.enemies.filter(e=>e.x<s.level.arena.left);s.arenaLocked=false;s.hearts=Math.min(s.maxHearts,s.hearts+2);s.score+=60;s.events.push('bossDown');}
 const d=b.defeat;d.age+=dt;
 d.coverFrame??=-1;const cover=Math.min(3,Math.floor((d.age+.18)/1.05));if(cover>d.coverFrame){d.coverFrame=cover;fortCollapseCover(s,cover);}
 if(d.age<3.65&&d.age>d.burst){d.burst+=.24;const seed=Math.round(d.burst/.24);fortRupture(s,b.x-95+Math.sin(seed*2.4)*440,b.y-70-Math.abs(Math.cos(seed*1.7))*565,seed);s.shake=.16;if(seed%3===0)s.events.push('impact');}
 if(d.age>=4.4)d.ready=true;
}
