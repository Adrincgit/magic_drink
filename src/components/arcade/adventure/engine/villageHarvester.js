import {groundY} from '../world/adventureTerrain';
import {stepWitchAbsorption,witchId,releaseWitchVictims} from './villageRescue';
import {villageTarget,villageAim} from './villageTargeting';
import {worldSound} from './adventureWorldAudio';
import {HARVESTER_AIR_SIZE,harvesterInRitual,harvesterTransition,HARVESTER_SIZE} from '../actors/harvesterRegistration';
import {harvesterFlightWand} from '../actors/harvesterFlightAtlas';
export {HARVESTER_SIZE} from '../actors/harvesterRegistration';
export const HARVESTER=28,HARVESTER_HEALTH=185;
const change=(e,phase)=>{e.phase=phase;e.phaseAge=0;};
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n)),ease=u=>u*u*(3-2*u);
export function prepareHarvester(s){
 const e=s.enemies.find(e=>e.type===HARVESTER);if(!e)return;
 Object.assign(e,{phase:'sleep',phaseAge:0,active:false,flying:false,harvestTurn:0,harvestStage:1,observedHp:e.hp,timer:0,absorbCooldown:0,flightClock:0,broomPending:false});
}
// Measured bare wand tip, shared with the exact cel held at projectile release.
export function harvesterMuzzle(e){
 const tip=e.flying?harvesterFlightWand:[18.5,121],cell=e.flying?320:256,size=e.flying?HARVESTER_AIR_SIZE:HARVESTER_SIZE;
 return{x:e.x-e.dir*(tip[0]-cell/2)*size/cell,y:e.y+(tip[1]-cell*250/256)*size/cell};
}
function beginBroom(s,e){
 e.harvestStage=2;e.broomFrom={x:e.x-e.dir*570,y:e.baseY-270};change(e,'broom-call');s.events.push('harvesterCrack');worldSound(s,'pumpkinBirth',e.x,e.y);s.shake=Math.max(s.shake,.15);
}
function stepBroom(s,e){
 if(e.phase==='broom-call'){
  const u=ease(clamp(e.phaseAge/1.2,0,1));e.broom={x:e.broomFrom.x+(e.x-e.broomFrom.x)*u,y:e.broomFrom.y+(e.baseY-14-e.broomFrom.y)*u-Math.sin(u*Math.PI)*35};
  if(e.phaseAge>=1.2){change(e,'broom-mount');delete e.broom;}return true;
 }
 if(e.phase==='broom-mount'){
  e.y=e.baseY-ease(clamp((e.phaseAge-.35)/.8,0,1))*28;
  if(e.phaseAge>=1.15){e.flying=true;e.flightDir=-e.dir;change(e,'broom-rise');worldSound(s,'witchDrop',e.x,e.y);}return true;
 }
 if(e.phase==='broom-rise'){
  e.y=e.baseY-28-ease(clamp(e.phaseAge/1.1,0,1))*192;
  if(e.phaseAge>=1.1){change(e,'patrol');e.timer=.3;e.flightClock=0;}return true;
 }
 return false;
}
function flyHarvester(s,e,dt){
 if(!e.flying||harvesterTransition(e)||harvesterInRitual(e))return;
 e.flightClock+=dt;
 const a=s.level.arena,left=a.left+160,right=a.right-130;
 e.flightDir??=-1;if(e.x<=left)e.flightDir=1;if(e.x>=right)e.flightDir=-1;
 const speed=e.phase==='windup'?65:e.phase==='attack'?115:185;
 e.x=clamp(e.x+e.flightDir*speed*dt,left,right);
 e.baseY=groundY(s.level.route,e.x);e.y=e.baseY-220-Math.sin(e.flightClock*1.45)*55;
}
function fireHarvester(s,e,shoot){
 const m=harvesterMuzzle(e),aim=e.candyAim,angle=Math.atan2(aim.y-m.y,aim.x-m.x),owner=witchId(e),air=e.flying;
 if(e.harvestMove==='rain'){
  const offset=(e.burstIndex-2)*.22;
  shoot(s,m.x,m.y,Math.PI/2+offset,air?140:210,'witch-drop',{r:12,life:3.4,gravity:air?420:520,owner,element:'magic',village:true});
 }else{
  const spread=air?(e.harvestMove==='sweep'?[-.12,0,.12]:[-.25,-.125,0,.125,.25]):[-.09,.09];
  for(const offset of spread)shoot(s,m.x,m.y,angle+offset,air?530:420,'candy-ray',{r:9,life:2.6,gravity:air?70:95,owner,element:'magic',village:true});
 }
 e.releasePulse=.32;s.events.push('harvesterCast');
}
export function stepHarvester(s,e,dt,shoot){
 const a=s.level.arena;
 if(e.phase==='sleep'){
  if(s.player.x<e.home-680)return;
  e.active=true;change(e,'intro');s.arenaLocked=true;s.notice='harvesterArrival';s.noticeTime=4;s.events.push('harvesterArrival');
 }
 e.phaseAge=(e.phaseAge||0)+dt;e.hurtAge=(e.hurtAge??10)+dt;e.releasePulse=Math.max(0,(e.releasePulse||0)-dt);
 if(e.hp<e.observedHp)e.hurtAge=0;e.observedHp=e.hp;
 if(e.harvestStage===1&&e.hp<=e.maxHp*.5)e.broomPending=true;
 e.baseY=groundY(s.level.route,e.x);if(!e.flying)e.y=e.baseY;
 if(e.phase==='intro'){if(e.phaseAge>1.65){change(e,'patrol');e.timer=.4;}return;}
 if(stepBroom(s,e))return;
 // Finish the current absorption before mounting; damage never aborts it.
 if(e.harvestStage===1&&e.broomPending&&!harvesterInRitual(e)){beginBroom(s,e);return;}
 flyHarvester(s,e,dt);
 if(stepWitchAbsorption(s,e,dt))return;
 if(e.phase==='windup'){
  if(e.phaseAge<(e.flying?.65:1.05))return;
  change(e,'attack');e.burstIndex=0;e.nextBurst=0;
 }
 if(e.phase==='attack'){
  const bursts=e.harvestMove==='rain'?5:e.harvestMove==='sweep'?3:1,interval=e.harvestMove==='rain'?.13:.16;
  if(e.burstIndex<bursts&&e.phaseAge>=e.nextBurst){fireHarvester(s,e,shoot);e.burstIndex++;e.nextBurst+=interval;}
  if(e.phaseAge>Math.max(.4,(bursts-1)*interval+.2)){change(e,'recover');e.timer=e.flying?.45:.95;}return;
 }
 if(e.phase==='recover'){if(e.timer<=0){change(e,'patrol');e.timer=e.flying?.16:.35;}return;}
 if(e.phase!=='patrol')return;
 e.dir=Math.sign(s.player.x-e.x)||e.dir;
 if(!e.flying){
  const destination=clamp(s.player.x-e.dir*420,a.left+320,a.right-230),dx=destination-e.x;
  if(Math.abs(dx)>20){e.x+=Math.sign(dx)*Math.min(Math.abs(dx),dt*52);e.gait=(e.gait||0)+dt;}
 }
 if(e.timer>0)return;
 const target=villageTarget(s,e,1800);if(!target){e.timer=.3;return;}
 const m=harvesterMuzzle(e);e.candyAim=villageAim(s,e,target,e.flying?.65:1.05,e.flying?530:420,m);e.dir=Math.sign(e.candyAim.x-e.x)||e.dir;
 const moves=e.flying?['fan','rain','sweep','fan','sweep']:['fan','fan','rain'];e.harvestMove=moves[e.harvestTurn++%moves.length];change(e,'windup');
}
export function beginHarvesterDefeat(s,e){
 if(e.type!==HARVESTER)return;
 releaseWitchVictims(s,e);e.phase='defeated';e.deadTime=e.flying?3:2.6;e.deathAge=0;delete e.broom;
 s.harvesterDefeated=true;s.arenaLocked=false;s.hostile=[];s.score+=60;s.hearts=Math.min(s.maxHearts,s.hearts+1);s.events.push('bossDown');s.notice='harvesterDefeated';s.noticeTime=4;
}
export function harvesterDrawing(e,reduced=false){
 const t=e.phaseAge||0,cycle=reduced?1:Math.floor(t*5)%4;
 if(e.hp<=0)return{key:'harvester-ritual',frame:12+Math.min(3,Math.floor((e.deathAge||0)/.42))};
 if(e.phase==='broom-call')return{key:'harvester-ritual',frame:4+Math.min(2,Math.floor(t/.4))};
 if(e.phase==='broom-mount')return{key:'harvester-flight-v15',frame:Math.min(3,Math.floor(t/1.15*4)),size:HARVESTER_AIR_SIZE};
 if(e.flying){
  const frame=harvesterInRitual(e)?12+cycle:e.phase==='windup'?8+Math.min(1,Math.floor(t/.325)):e.phase==='attack'?10:e.phase==='recover'?11:4+cycle;
  return{key:'harvester-flight-v15',frame,size:HARVESTER_AIR_SIZE};
 }
 if(harvesterInRitual(e))return{key:'harvester-ritual',frame:cycle};
 if(e.hurtAge<.4&&e.phase!=='attack')return{key:'harvester-combat',frame:12+Math.min(3,Math.floor(e.hurtAge/.1))};
 if(e.phase==='attack')return{key:'harvester-combat',frame:8};
 if(e.phase==='windup')return{key:'harvester-combat',frame:4+Math.min(3,Math.floor(t/1.05*4))};
 return{key:'harvester-combat',frame:cycle};
}
