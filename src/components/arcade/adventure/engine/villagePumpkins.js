import {groundY} from '../world/adventureTerrain';
import {witchVessel} from '../actors/villageWitchAnchors';
import {stepWitchOrbit} from './villageOrbit';
import {villageTarget,villageAim,villageClosestCivilian} from './villageTargeting';

export const SOUL_PUMPKIN=27;
export const pumpkinId=e=>e.curseId||`pumpkin:${e.spawnSeed}:${e.home}`;
export const isCandySpell=q=>['candy-ray','soul-flame','lantern-soul','witch-drop','witch-puddle'].includes(q.kind);
export function releaseVillageVictim(s,q,x=q.candyHomeX??q.x){
 q.state='rescue';q.age=0;q.active=true;q.warned=true;q.tripped=true;q.x=x;q.y=groundY(s.level.route,x);
 delete q.curseOwner;delete q.containerId;delete q.absorbProgress;
 delete q.curseAge;
 s.village.rescued=(s.village.rescued||0)+1;s.events.push('rescue');
}
export function spawnSoulPumpkin(s,witch,victim){
 const seed=10000+(s.village.pumpkinSerial=(s.village.pumpkinSerial||0)+1);
 const vessel=witchVessel(witch);witch.releasePulse=.55;witch.releasePoint={...vessel};
 const e={type:SOUL_PUMPKIN,x:vessel.x,y:vessel.y+40,home:witch.x,baseY:witch.baseY,spawnSeed:seed,dir:witch.dir,hp:3,maxHp:3,clock:0,timer:1.4,phase:'release',phaseAge:0,action:0,deadTime:0,trap:0,flash:0,vy:0,active:true,sourceWitch:`witch:${witch.spawnSeed}:${witch.home}`,releaseY:vessel.y+40,flightHeight:135,carriedId:victim.id};
 e.curseId=pumpkinId(e);victim.state='carried';victim.curseOwner=e.curseId;victim.containerId=e.curseId;victim.active=false;
 s.enemies.push(e);s.events.push('power');return e;
}
export function stepSoulPumpkin(s,e,dt,shoot){
 if(!e.active&&Math.abs(s.player.x-e.x)<800)e.active=true;
 if(!e.active||e.trap>0)return;
 if(e.orbitParent){if(stepWitchOrbit(s,e,dt,shoot))return;e.hp=0;e.defeated=true;beginPumpkinDefeat(s,e);return;}
 e.phaseAge+=dt;
 const floor=groundY(s.level.route,e.x),hover=floor-(e.flightHeight||135)+Math.sin(e.clock*2.3)*9;
 if(e.phase==='release'){
  const u=Math.min(1,e.phaseAge/1.05);e.y=e.releaseY+(hover-e.releaseY)*u;e.x+=e.dir*32*dt;
  if(u===1){e.phase='patrol';e.phaseAge=0;}return;
 }
 e.y=hover;e.baseY=floor;
 if(e.phase==='windup'){
  if(e.phaseAge>.65){const a=e.candyAim,m={x:e.x+e.dir*22,y:e.y-35},angle=Math.atan2(a.y-m.y,a.x-m.x);shoot(s,m.x,m.y,angle,290,'soul-flame',{r:13,life:3,owner:pumpkinId(e),village:true,element:'magic'});e.phase='attack';e.phaseAge=0;e.timer=2.2;}
  return;
 }
 if(e.phase==='attack'){if(e.phaseAge>.42){e.phase='patrol';e.phaseAge=0;}return;}
 const nearby=villageClosestCivilian(s,e,540),dx=(nearby||s.player).x-e.x;
 if(Math.abs(dx)>28)e.dir=Math.sign(dx);
 if(e.timer<=0&&Math.abs(dx)<540){const target=villageTarget(s,e,540);if(target){e.dir=Math.sign(target.x-e.x)||e.dir;e.phase='windup';e.phaseAge=0;e.candyAim=villageAim(s,e,target,.65,290);}return;}
 if(Math.abs(dx)>200)e.x=Math.max(e.home-520,Math.min(e.home+520,e.x+Math.sign(dx)*46*dt));
}
export function beginPumpkinDefeat(s,e){
 if(e.type!==SOUL_PUMPKIN||e.pumpkinFall)return;
 delete e.popcornDefeat;e.pumpkinFall={age:0,vy:-55,vx:-e.dir*45,landed:false,released:false};e.deadTime=4;
 for(const q of s.hostile)if(q.owner===pumpkinId(e))q.life=0;
}
export function stepFallingPumpkin(s,e,dt){
 const q=e.pumpkinFall;if(!q)return false;q.age+=dt;e.deathAge=q.age;
 if(!q.landed){q.vy+=570*dt;e.x+=q.vx*dt;e.y+=q.vy*dt;const floor=groundY(s.level.route,e.x);if(e.y>=floor){e.y=floor;q.landed=true;q.landAge=0;s.events.push('impact');}}
 else{
  q.landAge+=dt;
  if(!q.released&&q.landAge>=.28){q.released=true;let i=0;for(const npc of s.villagers)if(npc.curseOwner===pumpkinId(e))releaseVillageVictim(s,npc,e.x-24-i++*32);}
 }
 e.deadTime=q.landed?Math.max(0,1.45-q.landAge):4;return true;
}
export function pumpkinDrawing(e){
 const fall=e.pumpkinFall;
 if(!fall)return{key:'village-orbit-pumpkin-v9',frame:e.phase==='windup'?4+Math.min(3,Math.floor(e.phaseAge/(e.orbitParent?.52:.65)*4)):e.phase==='attack'?8+Math.min(3,Math.floor(e.phaseAge/.42*4)):Math.floor(e.clock*9)%4};
 if(!e.carriedId)return{key:'village-orbit-pumpkin-v9',frame:12+Math.min(3,Math.floor((fall.landed?fall.landAge+ .15:fall.age)*7))};
 const frame=fall.landed?16+Math.min(7,Math.floor(fall.landAge*8)):12+Math.min(3,Math.floor(fall.age*8));
 return{key:'village-soul-pumpkin-v5',frame};
}
