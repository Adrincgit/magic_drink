import {groundY} from '../world/adventureTerrain';
import {villageVillagerBody} from '../actors/villageVillagers';
import {witchId,stepWitchAbsorption} from './villageRescue';
import {prepareVillageResistance} from './villageResistance';
import {stepVillageCrowd} from './villageCrowd';
import {spawnWitchOrbit} from './villageOrbit';
import {villageTarget,villageAim,villageClownWindup,villageClosestCivilian} from './villageTargeting';
import {prepareVillageObstacles,stepVillageObstacles} from './villageObstacles';
import {prepareVillageBlockade,stepVillageBlockade,stepBlockadeArrival} from './villageBlockade';
import {SOUL_PUMPKIN,pumpkinId,isCandySpell,stepSoulPumpkin,pumpkinDrawing} from './villagePumpkins';
export const PUMPKIN_CLOWN=25,VILLAGE_WITCH=26;
export const isVillageEnemy=e=>e.type===PUMPKIN_CLOWN||e.type===VILLAGE_WITCH||e.type===SOUL_PUMPKIN;
export function prepareVillage(s,fromX=0){
 if(!s.level.villageTrail)return;
 const previous=new Map((s.villagers||[]).map(q=>[q.id,q]));
 s.villagers=s.level.villagers.map(q=>{const old=previous.get(q.id);return old&&old.state!=='waiting'?{...old}:{...q,state:q.wakeX<fromX?(q.hidingCover?'hiding':q.rubbleId?'trapped':'flee'):'waiting',age:0,gait:0,dir:-1,active:q.wakeX<fromX};});
 const furthest=Math.max(fromX,s.village?.furthest||0);
 s.carriages=s.level.carriages.map(q=>({...q,active:false,gait:0}));
 s.village={furthest,safe:s.villagers.filter(q=>q.state==='safe').length,turned:s.villagers.filter(q=>q.state==='candy').length,complete:false};
 s.looseBones=[];
 s.villageFire=[];
 s.villageDust=[];
 Object.assign(s.boss,{hp:1,maxHp:1,phase:'sleep',vulnerable:false});
 const witchHomes=s.level.enemies.filter(q=>q[2]===26).map(q=>q[0]);
 let lanternIndex=0;
 for(const e of s.enemies)if(isVillageEnemy(e)){if(e.type===26){const index=witchHomes.indexOf(e.home);e.flying=index%2===1;e.conjurer=index===1||index===3;e.flightHeight=155+(Math.max(0,index)%3)*22;}if(e.type===25)e.rapidLantern=lanternIndex++%3===1;e.timer=.9+(e.spawnSeed%3)*.3;e.phaseAge=0;e.active=false;}
 for(const e of s.enemies)if(e.type===19)e.ghostForm='sheet';
 // A retry may retire enemies behind the checkpoint. Their retained hostages
 // must not be left attached to an owner that can no longer be defeated.
 const owners=new Set(s.enemies.filter(e=>e.type===26||e.type===SOUL_PUMPKIN).map(e=>e.type===SOUL_PUMPKIN?pumpkinId(e):witchId(e)));
 for(const q of s.villagers)if(q.curseOwner&&!owners.has(q.curseOwner)&&['candy','turning','absorbed','absorbing','carried'].includes(q.state)){
  q.state='rescue';q.age=0;q.active=true;q.warned=true;q.tripped=true;q.x=q.candyHomeX??q.x;q.y=groundY(s.level.route,q.x);delete q.curseOwner;delete q.containerId;delete q.absorbProgress;
 }
 prepareVillageResistance(s);prepareVillageObstacles(s);prepareVillageBlockade(s);s.notice='villageStart';s.noticeTime=6;
}
export function stepVillagers(s,dt){
 if(!s.level.villageTrail)return;
 s.village.furthest=Math.max(s.village.furthest||0,s.player.x);
 for(const q of s.villageFire)q.age+=dt;
 s.villageFire=s.villageFire.filter(q=>q.age<q.life);
 if(!s.village.plazaSeen&&s.player.x>=s.level.arena.left-150){s.village.plazaSeen=true;s.notice='villageSquare';s.noticeTime=5;}
 for(const b of s.looseBones){b.life-=dt;if(!b.settled){b.vy+=620*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;b.rotation+=dt*b.spin;const floor=groundY(s.level.route,b.x)-5;if(b.y>=floor){b.y=floor;b.vx=0;b.vy=0;b.settled=true;b.rotation=0;}}}
 s.looseBones=s.looseBones.filter(b=>b.life>0&&!b.collected);
 stepVillageCrowd(s,dt);stepVillageObstacles(s,dt);stepVillageBlockade(s,dt);
 if(s.player.x>=s.level.arena.entry&&!s.enemies.some(e=>e.hp>0&&e.home>=s.level.arena.left)){
  s.village.complete=true;s.boss.hp=0;s.boss.phase='defeated';s.boss.deadTime=3;s.hostile=[];
 }
}
// Measured on the packed v7 release drawings: ground (20,145), air (26,179).
// The renderer uses exactly these release cels when the shot is born.
export const villageWitchMuzzle=e=>({x:e.x+e.dir*(e.flying?78.89:83.53),y:e.y-(e.flying?54.91:81.21)});
export const villageClownMuzzle=e=>({x:e.x+e.dir*44.08,y:e.y-75.88});
function flyVillageWitch(s,e,dt){
 if(!e.flying||['absorb','absorb-player'].includes(e.phase))return;
 e.flightDir??=e.spawnSeed%2?1:-1;
 const range=310;if(e.x>=e.home+range)e.flightDir=-1;if(e.x<=e.home-range)e.flightDir=1;
 const old=e.x;e.x+=e.flightDir*112*dt*(e.phase==='windup'?.65:1);e.moving=true;e.baseY=groundY(s.level.route,e.x,e.baseY);e.gait=(e.gait||0)+Math.abs(e.x-old)/90;
}
function phase(e,key){e.phase=key;e.phaseAge=0;}
export function stepVillageEnemy(s,e,dt,shoot){
 if(stepBlockadeArrival(s,e,dt))return;
 if(e.type===SOUL_PUMPKIN){stepSoulPumpkin(s,e,dt,shoot);return;}
 e.moving=false;
 if(!e.active&&Math.abs(s.player.x-e.x)<740)e.active=true;
 if(!e.active||e.trap>0)return;
 e.phaseAge=(e.phaseAge||0)+dt;
 e.releasePulse=Math.max(0,(e.releasePulse||0)-dt);
 if(e.type===26){if(e.witchObservedHp!==undefined&&e.hp<e.witchObservedHp)e.witchHitAge=0;else if(e.witchHitAge!==undefined)e.witchHitAge+=dt;e.witchObservedHp=e.hp;}
 flyVillageWitch(s,e,dt);e.y=e.baseY-(e.flying?(e.flightHeight||170)+Math.sin(e.clock*1.7)*24:0);
 if(e.type===26)spawnWitchOrbit(s,e);
 if(e.phase==='absorb-player'){if(s.player.candy?.absorber!==witchId(e)){phase(e,'recover');e.timer=1.5;}return;}
 if(e.type===26&&stepWitchAbsorption(s,e,dt))return;
 if(e.flash>0&&e.phase==='windup'){phase(e,'recover');e.timer=1.05;e.candyAim=null;return;}
 if(e.phase==='windup'){
  const witch=e.type===VILLAGE_WITCH,duration=witch?(e.flying?.62:1.1):villageClownWindup(e);
  if(e.phaseAge<duration)return;
  phase(e,'attack');e.action=.38;
  const m=e.type===PUMPKIN_CLOWN?villageClownMuzzle(e):e.castMode==='drop'?{x:e.x-e.dir*12,y:e.y-46}:villageWitchMuzzle(e);
  if(witch){
   const a=e.candyAim||{x:s.player.x,y:s.player.y-35},angle=Math.atan2(a.y-m.y,a.x-m.x);
   if(e.castMode==='drop')shoot(s,m.x,m.y,Math.PI/2,60,'witch-drop',{r:12,life:3,gravity:460,owner:witchId(e),element:'magic',village:true});
   else shoot(s,m.x,m.y,angle,610,'candy-ray',{r:9,life:2,gravity:140,owner:witchId(e),element:'magic',village:true});
  }else{
   const a=e.candyAim||{x:s.player.x,y:s.player.y-35},angle=Math.atan2(a.y-m.y,a.x-m.x);
   s.villageFire.push({x:m.x,y:m.y,angle,kind:'soul-muzzle',age:0,life:.32});
   for(const [i,spread] of [-.18,0,.18].entries())shoot(s,m.x,m.y,angle+spread,e.rapidLantern?325:245,'lantern-soul',{r:11,life:2,village:true,element:'magic',owner:`lantern:${e.spawnSeed}:${e.home}`,fireSeed:i*2});
  }
  return;
 }
 if(e.phase==='attack'){if(e.phaseAge>.38){phase(e,'recover');e.timer=e.type===VILLAGE_WITCH?(e.flying?.45:1.15):e.rapidLantern?1.05:1.45;}return;}
 if(e.phase==='recover'){if(e.timer<=0){phase(e,'patrol');e.timer=e.flying?.28:.8;}return;}
 // Select only at commitment, so alternating priorities do not churn each tick.
 const range=e.type===26||e.rapidLantern?580:470,near=villageClosestCivilian(s,e,range),approach=near||s.player,dx=approach.x-e.x;
 if(Math.abs(dx)>24)e.dir=Math.sign(dx);
 if(Math.abs(dx)<range&&e.timer<=0){
  const target=villageTarget(s,e,range);if(!target)return;
  phase(e,'windup');
  if(e.type===26&&e.flying){e.airCasts=(e.airCasts||0)+1;e.castMode=e.airCasts%3===2?'drop':'ray';}
  // The wand animation warns; aim commits once, without a targeting overlay.
  // A fleeing target is led, but the aim never snaps after the warning.
  e.candyAim=villageAim(s,e,target,e.type===26?(e.flying?.62:1.1):villageClownWindup(e),e.type===26?610:e.rapidLantern?325:245);
  e.dir=Math.sign(e.candyAim.x-e.x)||e.dir;return;
 }
 if(!e.flying&&Math.abs(dx)>265){const old=e.x;e.x=Math.max(e.home-210,Math.min(e.home+210,e.x+e.dir*(e.type===VILLAGE_WITCH?34:44)*dt));e.moving=Math.abs(e.x-old)>.001;e.gait=(e.gait||0)+Math.abs(e.x-old)/90;e.baseY=groundY(s.level.route,e.x,e.baseY);e.y=e.baseY;}
}
// Slab intersection catches a fast beam between simulation frames.
export function villageSegmentHit(x0,y0,x1,y1,box){
 let near=0,far=1;
 for(const [start,delta,lo,hi] of [[x0,x1-x0,box.x,box.x+box.w],[y0,y1-y0,box.y,box.y+box.h]]){
  if(Math.abs(delta)<1e-8){if(start<lo||start>hi)return null;continue;}
  const a=(lo-start)/delta,b=(hi-start)/delta;near=Math.max(near,Math.min(a,b));far=Math.min(far,Math.max(a,b));if(near>far)return null;
 }return near;
}
export function resolveVillageProjectile(s,q,playerBox){
 if(!s.level.villageTrail||!q.village||q.life<=0)return false;
 if(q.kind==='lantern-ember'){
  const floor=groundY(s.level.route,q.x,q.y+100);
  if(q.y>=floor-13){q.y=floor-13;q.life=0;villageFireImpact(s,q);s.events.push('impact');return true;}
  return false;
 }
 if(!isCandySpell(q))return false;
 if(q.kind==='witch-puddle'){
  q.villagePlayerHit=false;
  const touches=box=>box.x<q.x+q.r&&box.x+box.w>q.x-q.r&&box.y<q.y+14&&box.y+box.h>q.y-14;
  for(const npc of s.villagers)if(['flee','warning','trip','fallen','help','recover','defend','trapped','hiding'].includes(npc.state)&&touches(villageVillagerBody(npc))){npc.state='turning';npc.age=0;npc.curseAge=0;npc.curseOwner=q.owner;npc.candyHomeX=npc.x;npc.active=false;s.events.push('power');}
  q.villagePlayerHit=touches(playerBox);return false;
 }
 const x0=q.previousX??q.x,y0=q.previousY??q.y,hit=box=>villageSegmentHit(x0,y0,q.x,q.y,box),playerHit=hit(playerBox);
 let terrain=null,previous=0;
 const steps=Math.max(1,Math.ceil(Math.hypot(q.x-x0,q.y-y0)/8));
 for(let i=0;i<=steps;i++){const t=i/steps,x=x0+(q.x-x0)*t,y=y0+(q.y-y0)*t,d=y-groundY(s.level.route,x)+8;if(d>=0){const u=i===0?0:((i-1)+Math.max(0,Math.min(1,-previous/(d-previous||1))))/steps;terrain=u;break;}previous=d;}
 let victim=null,first=playerHit??Infinity;
 for(const npc of s.villagers)if(['flee','warning','trip','fallen','help','recover','defend','trapped','hiding'].includes(npc.state)){
  const at=hit(villageVillagerBody(npc,q.r));
  if(at!==null&&at<first){first=at;victim=npc;}
 }
 if(terrain!==null&&terrain<first){q.x=x0+(q.x-x0)*terrain;q.y=groundY(s.level.route,q.x)-8;q.groundImpact=true;q.life=0;villageFireImpact(s,q);return true;}
 if(victim){q.life=0;villageFireImpact(s,q);victim.state='turning';victim.age=0;victim.curseAge=0;victim.curseOwner=q.owner;victim.candyHomeX=victim.x;victim.active=false;s.events.push('power');s.notice='villageTurned';s.noticeTime=3.5;return true;}
 if(playerHit!==null)q.villagePlayerHit=true;
 return false;
}
export function villageFireImpact(s,q){
 if(q.kind==='witch-drop'&&!q.fireImpact){q.fireImpact=true;s.villageFire.push({x:q.x,y:q.y,kind:'drop-impact',age:0,life:.4,angle:0});if(q.groundImpact)s.hostile.push({x:q.x,y:q.y,vx:0,vy:0,r:40,age:0,life:3.8,kind:'witch-puddle',owner:q.owner,element:'magic',village:true});return;}
 if(!['lantern-ember','soul-flame','lantern-soul','candy-ray'].includes(q.kind)||q.fireImpact)return;
 q.fireImpact=true;s.villageFire.push({x:q.x,y:q.y,kind:q.kind==='candy-ray'?'ray-impact':q.kind==='lantern-ember'?'impact':'soul-impact',age:0,life:.38,angle:0});
}
export function villageEnemyDrawing(e,reduced=false){
 if(e.type===SOUL_PUMPKIN)return pumpkinDrawing(e);
 if(e.type===26&&e.hp>0){
  const key=e.flying?'village-witch-air-v7':'village-witch-ground-v7';let frame=0;
  if(e.witchHitAge>=0&&e.witchHitAge<.36)frame=12+Math.min(3,Math.floor(e.witchHitAge/.09));
  else if(['absorb','absorb-player'].includes(e.phase))frame=(e.flying?20:16)+Math.min(e.flying?3:7,Math.floor((e.phaseAge||0)/(e.phase==='absorb'?3.05:4.8)*(e.flying?4:8)));
  else if(e.castMode==='drop'&&e.phase==='windup')frame=16+Math.min(1,Math.floor(e.phaseAge/.31));
  else if(e.castMode==='drop'&&e.phase==='attack')frame=18+Math.min(1,Math.floor(e.phaseAge/.19));
  else if(e.phase==='windup')frame=4+Math.min(3,Math.floor(e.phaseAge/(e.flying?.62:1.1)*4));
  else if(e.phase==='attack')frame=e.flying?9+Math.min(1,Math.floor(e.phaseAge/.19)):8+Math.min(2,Math.floor(e.phaseAge/.127));
  else if(e.phase==='recover')frame=11;
  else frame=reduced?0:Math.floor(e.clock*7)%4;
  return{key,frame};
 }
 if(e.type===26)return{key:'village-witch-v1',frame:20+Math.min(3,Math.floor((e.deathAge||0)/.22))};
 const key='village-pumpkin-clean-v7';
 const frame=e.hp<=0?20+Math.min(3,Math.floor((e.deathAge||0)/.22)):e.phase==='windup'?8+Math.min(3,Math.floor(e.phaseAge/villageClownWindup(e)*4)):e.phase==='attack'?12+Math.min(3,Math.floor(e.phaseAge/.38*4)):e.phase==='recover'?16+Math.min(3,Math.floor(e.phaseAge/.25)):reduced?0:Math.floor((e.gait||0)*8)%8;
 return{key,frame};
}
