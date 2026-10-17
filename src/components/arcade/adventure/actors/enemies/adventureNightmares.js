import {stepBellkeeper,bellkeeperDrawing} from '../bosses/adventureBellkeeper';
import {groundY} from '../../world/adventureTerrain';
import {enemyBody} from './adventureEnemyGeometry';
import {skeletonThrowOrigin,skeletonFrame,SKELETON_PLUCK_TIME,SKELETON_THROW_TIME,SKELETON_RECOVER_TIME} from './nightmareSkeletonAnimation';
import {guardBlocks} from '../../engine/adventureDefense';
import {prepareGraveyard,CRYPT_EXIT_TIME} from '../../engine/adventureGraveyard';
import {prepareZombieVariant,zombieHasMissingLimb,beginNightmareDefeat} from '../../engine/adventureNightmareMotion';
import {enemyCastSound} from '../../engine/adventureWorldAudio';
export const NIGHTMARE_ZOMBIE=18,NIGHTMARE_GHOST=19,NIGHTMARE_TALL=20,NIGHTMARE_CRAWLER=21,NIGHTMARE_SKELETON=22,NIGHTMARE_BELL=23,NIGHTMARE_HAND=24;
export const isNightmare=e=>e.type>=18&&e.type<=24;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export function prepareNightmares(s,fromX=0){
 if(!s.level.nightmareTrail&&!s.level.villageTrail)return;if(s.level.nightmareTrail)prepareGraveyard(s,fromX);
 for(const e of s.enemies)if(isNightmare(e)){Object.assign(e,{nightmareGrave:-1,nightmareHidden:false,phase:'patrol',gait:0,walkStride:72,timer:1.2,nightmareAge:0,vy:0,active:false,blinkCooldown:5+e.clock%3,y:e.type===19?e.baseY-135:e.baseY});if([18,21].includes(e.type))prepareZombieVariant(e);}
 if(s.level.nightmareTrail)Object.assign(s.boss,{type:23,baseY:s.level.arena.y,nightmareGrave:-1,nightmareHidden:false,vy:0,gait:0});
}
function advance(e,s,dx){const old=e.x;e.x=clamp(e.x+dx,24,s.level.width-24);e.baseY=groundY(s.level.route,e.x,e.baseY);e.y=e.baseY;e.gait=(e.gait||0)+Math.abs(e.x-old)/(e.walkStride||60);}
function contact(s,e,body){
 if(e.nightmareHidden||e.spawnGrace>0||['manifest','vanish','appear','soulRise','legBreak','armBreak'].includes(e.phase)||s.player.dash>0)return;const a=body(s.player),b=enemyBody(e);
 if(a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y&&!guardBlocks(s,{x:e.x,y:e.y-35,r:22,life:1}))s.damage({x:e.x});
}
function skeleton(s,e,dt){
 e.walkStride??=72;e.moving=false;
 if(e.phase==='pluck'){
  // Mime pulling a rib free; the rib cage stays whole throughout the attack.
  if(e.timer<=SKELETON_PLUCK_TIME/2)e.heldBone=9;
  if(e.timer<=0){e.phase='throw';e.timer=SKELETON_THROW_TIME;}return;
 }
 if(e.phase==='throw'){
  if(e.timer<=0){const {x,y}=skeletonThrowOrigin(e),angle=Math.atan2(s.player.y-33-y,s.player.x-x);s.hostile.push({x,y,vx:Math.cos(angle)*260,vy:Math.sin(angle)*260-35,r:11,life:3.5,age:0,kind:'bone',boneFrame:9,gravity:85});enemyCastSound(s,'bone',x,y);e.heldBone=null;e.phase='recover';e.timer=SKELETON_RECOVER_TIME;}return;
 }
 if(e.phase==='recover'){if(e.timer<=0){if(e.volleyLeft>1){e.volleyLeft--;e.phase='pluck';e.timer=SKELETON_PLUCK_TIME;}else{e.phase='patrol';e.timer=1.7+(e.spawnSeed||0)%3*.25;}}return;}
 const dx=s.player.x-e.x;e.dir=Math.sign(dx)||e.dir;
 if(Math.abs(dx)<440&&Math.abs(s.player.y-e.baseY)<190&&e.timer<=0){e.phase='pluck';e.timer=SKELETON_PLUCK_TIME;e.heldBone=null;e.volleyLeft=3;return;}
 if(Math.abs(dx)>145){advance(e,s,e.dir*61*dt);e.moving=true;}
}
export function stepNightmare(s,e,dt,body){
 e.spawnGrace=Math.max(0,(e.spawnGrace||0)-dt);
 if(e.limbHitAge!==undefined)e.limbHitAge+=dt;
 if(e.phase==='newlyTurned'){if(e.timer<=0){e.phase='patrol';e.timer=.8;}return;}
 const p=s.player,prey=[18,21].includes(e.type)?s.enemies.filter(q=>q.fleeing&&q.active&&q.hp>0&&!q.capture&&!(q.rescueGrace>0)&&Math.abs(q.x-e.x)<(q.fleeState==='run'?200:420)).sort((a,b)=>Math.abs(a.x-e.x)-Math.abs(b.x-e.x))[0]:null,dx=(prey?.x??p.x)-e.x;
 if(e.phase==='manifest'){
  e.nightmareAge+=dt;const q=s.graves?.find(q=>q.index===e.graveId),crypt=q?.kind==='crypt',rise=clamp((e.nightmareAge-.18)/(crypt?CRYPT_EXIT_TIME-.18:1.05),0,1);
  e.nightmareHidden=false;
  if(crypt){e.x=e.home-125*rise;e.baseY=groundY(s.level.route,e.x,q.y);e.y=e.baseY-32*(1-rise);e.cryptScale=.55+.45*rise;e.gait=rise*1.8;e.moving=true;}
  else e.y=e.baseY+115*(1-rise)-(e.type===19?70*rise:0);
  if(e.nightmareAge>=(crypt?CRYPT_EXIT_TIME:1.35)){e.phase='patrol';e.timer=.8;e.active=true;e.cryptScale=1;e.y=e.baseY-(e.type===19?70:0);}return;
 }
 if(!e.active&&Math.abs(dx)<780)e.active=true;if(!e.active)return;
 if(e.trap>0){e.timer=Math.max(e.timer,.5);return;}
 // A spell may leave the actor in a generic jump/emerge state after landing.
 if(['jump','emerge','buried'].includes(e.phase)){e.phase='patrol';e.timer=.6;}
 if(e.type===18||e.type===21){
  prepareZombieVariant(e);
  const above=!prey&&p.y<e.baseY-85;
  if(e.phase==='reachUp'){
   e.reachAge=(e.reachAge||0)+dt;
   if(!above||Math.abs(dx)>95){e.phase='patrol';e.timer=.55;}else return;
  }
  if(['patrol','recover'].includes(e.phase)&&above&&Math.abs(dx)<55){e.phase='reachUp';e.reachAge=0;e.moving=false;return;}
  if(zombieHasMissingLimb(e)){
   if(e.phase==='windup'&&e.attackKind==='lunge')e.attackKind='bite';
   if(e.phase==='lunge'){e.phase='injuredFall';e.vy=Math.max(40,e.vy);}
  }
  if(e.phase==='injuredFall'){
   e.x=clamp(e.x+(e.attackDir||e.dir)*80*dt,24,s.level.width-24);e.vy+=790*dt;e.y+=e.vy*dt;e.baseY=groundY(s.level.route,e.x,e.baseY);
   if(e.y>=e.baseY){e.y=e.baseY;e.vy=0;e.phase='recover';e.timer=.65;if(e.legLost)e.type=21;}return;
  }
  if(e.phase==='feeding'){if(e.prey?.capture?.attacker===e)return;e.prey=null;e.phase='recover';e.timer=.5;}
  if(e.phase==='armBreak'){if(e.timer<=0){e.phase='recover';e.timer=.35;}return;}
  if(e.phase==='legBreak'){if(e.timer<=0){e.type=21;e.phase='recover';e.timer=.5;e.walkStride=68;}return;}
  if(e.phase==='idle')e.phase='patrol';
  if(e.phase==='patrol'){
   const closing=clamp((360-Math.abs(dx))/250,0,1),speed=e.type===21?38+closing*54:58+closing*95;
   if(Math.abs(dx)>18)e.dir=Math.sign(dx);if(Math.abs(dx)>24)advance(e,s,e.dir*speed*(s.gentle?.82:1)*dt);
   const leap=!zombieHasMissingLimb(e)&&e.lunger&&Math.abs(dx)>100;
   if(Math.abs(dx)<(leap?240:110)&&Math.abs((prey?.baseY??p.y)-e.baseY)<155&&e.timer<=0){e.phase='windup';e.timer=leap?.6:.48;e.attackDir=e.dir;e.attackKind=leap?'lunge':'bite';}
  }else if(e.phase==='windup'&&e.timer<=0){e.phase=e.attackKind==='lunge'?'lunge':'rush';e.timer=e.phase==='lunge'?1.1:.36;if(e.phase==='lunge')e.vy=-250;}
  else if(e.phase==='lunge'){
   e.x=clamp(e.x+e.attackDir*335*dt,24,s.level.width-24);e.vy+=790*dt;e.y+=e.vy*dt;e.baseY=groundY(s.level.route,e.x,e.baseY);
   if((e.vy>0&&e.y>=e.baseY)||e.timer<=0){e.y=e.baseY;e.vy=0;e.phase='recover';e.timer=.85;e.landingAge=0;}
  }else if(e.phase==='rush'){advance(e,s,e.attackDir*(e.type===21?150:220)*dt);if(e.timer<=0){e.phase='recover';e.timer=.8;}}
  else if(e.phase==='recover'){if(e.landingAge!==undefined)e.landingAge+=dt;if(e.timer<=0){e.phase='patrol';e.timer=1.35;delete e.landingAge;}}
 }else if(e.type===19){
  e.blinkCooldown=(e.blinkCooldown??6)-dt;
  if(e.phase==='soulRise'){e.y-=48*dt;if(e.timer<=0){e.phase='patrol';e.timer=1;e.blinkCooldown=5;}return;}
  if(e.phase==='vanish'){
   if(e.timer<=0){e.nightmareHidden=true;e.x=e.blinkX;e.y=e.blinkY;e.baseY=groundY(s.level.route,e.x);e.phase='hidden';e.timer=.35;}return;
  }
  if(e.phase==='hidden'){if(e.timer<=0){e.nightmareHidden=false;e.phase='appear';e.timer=.75;}return;}
  if(e.phase==='appear'){if(e.timer<=0){e.phase='patrol';e.timer=.9;e.blinkCooldown=6.5+e.clock%2;}return;}
  if(e.phase==='patrol'||e.phase==='idle'){
   e.dir=Math.sign(dx)||e.dir;e.x=clamp(e.x+e.dir*66*dt,24,s.level.width-24);e.baseY=groundY(s.level.route,e.x,e.baseY);
   const target=e.baseY-132+Math.sin(e.clock*1.8)*27;e.y+=(target-e.y)*Math.min(1,dt*2.8);
   if(e.blinkCooldown<=0&&Math.abs(dx)<520){e.phase='vanish';e.timer=.5;e.blinkX=clamp(p.x-(p.dir||1)*195,s.arenaLocked?s.level.arena.left+55:60,s.arenaLocked?s.level.arena.right-55:s.level.arena.entry-80);e.blinkY=Math.min(groundY(s.level.route,e.blinkX)-110,p.y-42);s.events.push('warning');}
   else if(Math.abs(dx)<310&&e.timer<=0){e.phase='windup';e.timer=.85;e.attackDir=e.dir;}
  }else if(e.phase==='windup'&&e.timer<=0){e.phase='rush';e.timer=.75;e.rushVx=clamp((p.x-e.x)/.75,-300,300);e.rushVy=clamp((p.y-20-e.y)/.75,-155,155);}
  else if(e.phase==='rush'){e.x=clamp(e.x+e.rushVx*dt,24,s.level.width-24);e.y+=e.rushVy*dt;if(e.timer<=0){e.phase='recover';e.timer=.8;}}
  else if(e.phase==='recover'){
   e.x=clamp(e.x+e.rushVx*e.timer/.8*.24*dt,24,s.level.width-24);e.baseY=groundY(s.level.route,e.x,e.baseY);e.y+=(e.baseY-132-e.y)*Math.min(1,dt*2.2);
   if(e.timer<=0){e.phase='patrol';e.timer=1.4;}
  }
 }else if(e.type===24){
  if(e.fragmentKind){e.fragmentLife-=dt;e.scatterTime=Math.max(0,(e.scatterTime||0)-dt);if(e.fragmentLife<=0){e.hp=0;beginNightmareDefeat(s,e);return;}}
  if(e.phase==='handFall'||e.phase==='handLeap'){e.vy+=700*dt;e.y+=e.vy*dt;if(e.phase==='handLeap'||e.fragmentKind)e.x+=e.dir*(e.fragmentKind?105:210)*dt;e.baseY=groundY(s.level.route,e.x);if(e.y>=e.baseY){e.y=e.baseY;e.phase='patrol';e.timer=.65;}}
  else{if(Math.abs(dx)>24)e.dir=e.scatterTime>0?e.scatterDir:Math.sign(dx);advance(e,s,e.dir*(e.fragmentKind==='skull'?112:e.fragmentKind==='arm'?92:e.fragmentKind?135:155)*dt);if((Math.abs(dx)<72||e.fragmentKind==='leg')&&e.timer<=0){e.phase='handLeap';e.vy=e.fragmentKind?-155:-195;}}
 }else if(e.type===22)skeleton(s,e,dt);
 else if(e.type===20){
  e.dir=Math.sign(dx)||e.dir;
  if(e.phase==='patrol'||e.phase==='idle'){if(Math.abs(dx)>140)advance(e,s,e.dir*28*dt);else if(e.timer<=0){e.phase='windup';e.timer=.9;}}
  else if(e.phase==='windup'&&e.timer<=0){e.phase='slam';e.timer=.35;const x=e.x+e.dir*75;s.effects.push({x,y:e.y-8,row:1,size:75,age:0,life:.32});if(Math.abs(p.x-x)<100&&p.y>e.y-40)s.damage({x,heavyImpact:true});}
  else if(e.phase==='slam'&&e.timer<=0){e.phase='recover';e.timer=1.2;}else if(e.phase==='recover'&&e.timer<=0){e.phase='patrol';e.timer=.6;}
 }
 contact(s,e,body);
}
export const nightmareGuardianAlive=s=>!!s.level.nightmareTrail&&(s.boss.hp>0||!s.boss.defeat?.ready);
export function updateNightmareBoss(s,dt,helpers){stepBellkeeper(s,dt,{...helpers,contact});}
export function stepNightmareGate(s){if(s.level.nightmareTrail&&nightmareGuardianAlive(s)&&s.player.x>s.level.nightmareGate.x-44)s.player.x=s.level.nightmareGate.x-44;}
export function nightmareDrawing(e,reduced=false){
 if(e.type===23)return bellkeeperDrawing(e,reduced);
 if(e.type===22)return{key:'nightmare-skeleton-frames-v4',frame:skeletonFrame(e,reduced)};
 if(e.type===24){
  if(e.fragmentKind){const row=e.fragmentKind==='skull'?0:e.fragmentKind==='arm'?4:8;return{key:'nightmare-skeleton-parts-v7',frame:row+(e.hp<=0?3:reduced?0:Math.floor((e.clock||0)*8)%4)};}
  return{key:'nightmare-clothed-limbs-v7',frame:e.hp<=0?8+Math.min(3,Math.floor((e.deathAge||0)/.15)):e.phase==='handLeap'||e.phase==='handFall'?4+(reduced?0:Math.floor((e.clock||0)*10)%4):reduced?0:Math.floor((e.gait||0)*6)%4};
 }
 if(e.type===18||e.type===21){
  if(e.hp<=0){const row=e.type===21||e.legLost?3:e.armMissing?2:e.deathStyle||0;return{key:'nightmare-zombie-defeat-v3',frame:row*4+Math.min(3,Math.floor((e.deathAge||0)/.19))};}
  if(e.limbHit&&e.limbHitAge<(e.limbHit==='leg'?1.04:.96))return{key:'nightmare-zombie-reactions-v8',frame:(e.limbHit==='leg'?8:0)+Math.min(7,Math.floor(e.limbHitAge/(e.limbHit==='leg'?.13:.12)))};
  if(e.phase==='reachUp'&&e.type!==21)return{key:'nightmare-zombie-reactions-v8',frame:(e.armMissing?20:16)+(reduced?0:Math.floor((e.reachAge||0)*5)%4)};
  if(e.type===18&&!e.armMissing&&e.phase==='recover')return{key:'nightmare-zombie-recover',frame:e.landingAge===undefined?3:Math.min(3,Math.floor(e.landingAge*9))};
  if(e.type===18&&!e.armMissing&&['windup','lunge','rush','feeding'].includes(e.phase))return{key:'nightmare-actions',frame:e.phase==='windup'?0:e.phase==='lunge'?1:2};
  const walking=['patrol','rush','manifest'].includes(e.phase),frame=reduced?0:walking?Math.floor((e.gait||0)*8)%8:e.phase==='windup'?5:e.phase==='recover'?6:0;
  return{key:e.type===21||e.armMissing?'nightmare-injured-v8':'nightmare-zombie-walk',frame:e.type===21?8+frame:frame,size:e.type===21?148:undefined};
 }
 if(e.type===19)return{key:e.ghostForm==='sheet'?'nightmare-ghost':'nightmare-clown-ghost-v3',frame:e.hp<=0?e.deathAge>.35?11:10:e.phase==='windup'?4+(reduced?0:Math.floor(e.clock*8)%2):e.phase==='rush'?6+(reduced?0:Math.floor(e.clock*10)%2):e.phase==='recover'?8:e.phase==='soulRise'&&e.ghostForm!=='sheet'?9:reduced?0:Math.floor(e.clock*5)%4};
 return{key:'nightmare-tall',frame:e.hp<=0?11:e.phase==='windup'?8:e.phase==='slam'?9:e.phase==='recover'?7:Math.floor(e.clock*3)%2};
}
