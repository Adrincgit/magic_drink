import {groundY} from '../world/adventureTerrain';

// Platforms remain indexed after breaking, so player.ground never points at
// a different collider. Retry creates fresh copies from the immutable level.
export function stepNightmareBranches(s,dt){
 if(!s.level.nightmareTrail)return;
 for(const [i,q]of s.platforms.entries())if(q.kind==='nightmare-branch'){
  if(q.gone){q.fallAge=(q.fallAge||0)+dt;continue;}
  if(s.player.ground===i)q.loaded=true;
  if(!q.loaded)continue;q.crackAge=(q.crackAge||0)+dt;
  if(q.crackAge>=q.breakAfter){q.gone=true;q.fallAge=0;s.events.push('break');if(s.player.ground===i){s.player.ground=null;s.player.vy=Math.max(35,s.player.vy);}}
 }
}

export function prepareZombieVariant(e){
 e.nightmareVariant??=Math.abs(Math.floor(e.home/37))%6;
 e.walkStride=72;e.lunger??=e.nightmareVariant%2===0;
 // Some arrive already injured; their costume and hat stay consistent.
 if(e.armMissing===undefined)e.armMissing=e.type===18&&e.nightmareVariant===5;
}

export const zombieHasMissingLimb=e=>e.type===21||!!(e.armMissing||e.armLost||e.legLost);
// Stable per spawn: retries do not reroll a corpse every animation tick, and
// successive occupants of the same grave can have different outcomes.
export function zombieReleasesSoul(e){
 const seed=Math.floor(e.home??e.x)*31+(e.spawnSeed||0)*131+17;
 return ((Math.imul(seed,1597334677)>>>0)%100)<35;
}

export const NIGHTMARE_REMAINS_TIME=28;
function releaseClothedLimb(s,e,makeEnemy){
 const arm=e.pendingLimb==='arm',live=arm&&e.hp>0&&e.nightmareVariant%2===0&&s.enemies.filter(q=>q.type===24&&q.hp>0).length<16;
 if(live){const hand=makeEnemy(e.x+e.dir*28,e.y-68,24);Object.assign(hand,{phase:'handFall',active:true,vy:-145,baseY:groundY(s.level.route,e.x),dir:e.dir,nightmareVariant:0});s.enemies.push(hand);}
 else s.looseBones.push({x:e.x+(arm?e.dir*25:-e.dir*16),y:e.y-(arm?72:24),vx:e.dir*(arm?75:-65),vy:-135,key:'nightmare-clothed-limbs-v7',frame:arm?12:14,size:arm?58:65,life:NIGHTMARE_REMAINS_TIME,rotation:0,spin:arm?5:-4});
 e.pendingLimb=null;
}
export function shedZombieParts(s,e,makeEnemy){
 if(e.pendingLimb&&((e.limbHitAge||0)>=.24||e.hp<=0))releaseClothedLimb(s,e,makeEnemy);
 if(e.hp<=0||![18,21].includes(e.type))return;prepareZombieVariant(e);
 if(e.type===18&&!e.armMissing&&e.hp<=e.maxHp*.66&&e.nightmareVariant%3!==1){
  e.armMissing=true;e.armLost=true;e.prey=null;e.pendingLimb='arm';e.limbHit='arm';e.limbHitAge=0;
  e.phase=e.y<e.baseY-2?'injuredFall':'armBreak';e.timer=.96;if(e.phase==='injuredFall')e.vy=Math.max(40,e.vy);s.events.push('break');
 }
 if(e.type===18&&!e.armMissing&&!e.legLost&&e.hp<=e.maxHp*.36&&e.nightmareVariant%3===1){
  e.legLost=true;e.prey=null;e.pendingLimb='leg';e.limbHit='leg';e.limbHitAge=0;e.phase=e.y<e.baseY-2?'injuredFall':'legBreak';e.timer=1.04;
  if(e.phase==='injuredFall')e.vy=Math.max(40,e.vy);else{e.vy=0;e.y=e.baseY;}s.events.push('break');
 }
}

export function beginNightmareDefeat(s,e){
 const zombie=[18,21].includes(e.type);
 e.deadTime=e.type===22?3:zombie?2.1:1.65;e.deathAge=0;e.phase='dying';e.prey=null;e.nightmareHidden=false;
 e.deathStyle??=(Math.floor((e.home??e.x)/19)+(e.spawnSeed||0))%2;
 if(zombie)e.releasesSoul??=zombieReleasesSoul(e);
 e.deathX=e.x;e.deathY=e.y;e.deathVy=Math.max(0,e.vy||0);e.deathDrift=(e.deathStyle?1:-1)*e.dir*30;
}

export function spawnNightmareSoul(s,x,y,makeEnemy,extra={}){
 if(s.nightmarePurged)return null;
 const ghost=makeEnemy(x,y,19,s.enemies.length);Object.assign(ghost,{baseY:groundY(s.level.route,x),phase:'soulRise',timer:1,active:true,nightmareGrave:-1,nightmareHidden:false,blinkCooldown:6,ghostForm:extra.summoned?'sheet':'clown',...extra});s.enemies.push(ghost);return ghost;
}

export function stepNightmareDefeat(s,e,dt,makeEnemy){
 e.deadTime=Math.max(0,e.deadTime-dt);e.deathAge=(e.deathAge||0)+dt;
 if(e.type===22&&e.defeated&&!e.partsReleased&&e.deathAge>=.65){
  e.partsReleased=true;
  if(!s.nightmarePurged)for(const [frame,size,dx]of [[2,34,-12],[3,25,12]])s.looseBones.push({x:e.x+dx,y:e.y-9,frame,size,life:NIGHTMARE_REMAINS_TIME,rotation:Math.PI/2,settled:true});
  if(!s.nightmarePurged)for(const [i,fragmentKind]of ['skull','arm','arm','leg','leg'].entries()){
   const part=makeEnemy(e.x+(i-2)*9,e.y-(i===0?80:i<3?50:20),24,i),dir=i%2?-e.dir:e.dir;
   Object.assign(part,{fragmentKind,active:true,phase:'handFall',vy:-145-i*13,dir,scatterDir:dir,scatterTime:.65,spawnGrace:.45,baseY:groundY(s.level.route,e.x),nightmareGrave:-1,fragmentLife:12+i*.4});s.enemies.push(part);
  }
 }
 if(e.type===24&&!e.remainsDropped&&e.deathAge>=.62){
  e.remainsDropped=true;
  const frame=e.fragmentKind?e.fragmentKind==='skull'?2:e.fragmentKind==='arm'?7:11:11;
  s.looseBones.push({key:e.fragmentKind?'nightmare-skeleton-parts-v7':'nightmare-clothed-limbs-v7',frame,size:e.fragmentKind==='skull'?49:e.fragmentKind?46:58,x:e.x,y:e.y-3,vx:0,vy:0,rotation:0,spin:0,settled:true,life:NIGHTMARE_REMAINS_TIME});
 }
 if([18,21].includes(e.type)&&e.defeated&&!e.soulReleased&&e.deathAge>=.9){e.soulReleased=true;if(e.releasesSoul??zombieReleasesSoul(e))spawnNightmareSoul(s,e.x,e.y-22,makeEnemy,{fromZombie:true});}
 if([18,21,22,24].includes(e.type)){
  e.x+=(e.deathDrift||0)*Math.max(0,1-e.deathAge/.45)*dt;
  const floor=groundY(s.level.route,e.x,e.baseY);e.deathVy=(e.deathVy||0)+900*dt;e.y=Math.min(floor,e.y+e.deathVy*dt);if(e.y===floor)e.deathVy=0;
 }
}
