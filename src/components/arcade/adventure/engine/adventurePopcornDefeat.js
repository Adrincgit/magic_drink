import {groundY} from '../world/adventureTerrain';
import {enemyGeometry} from '../actors/enemies/adventureEnemyGeometry';
import {spawnNightmareSoul} from './adventureNightmareMotion';

// A cannon finish is cosmetic after defeat: no extra rewards, hurtboxes or
// hostile limbs. Clothes stay on the pieces; clean cartoon bone tips stay on
// the zombie, matching the ordinary injured sprites.
const eligible=new Set([0,1,2,3,4,6,10,11,14,18,19,21,22,24,25,26]);
export function beginPopcornDefeat(s,e,shot){
 if(!shot?.popcorn||!eligible.has(e.type))return false;
 const zombie=[18,21].includes(e.type),variant=Math.abs((e.spawnSeed||0)+Math.floor((e.home??e.x)/97))%3;
 const pumpkin=e.type===25&&!!shot.popcornStrong,strongFinish=!!shot.popcornStrong&&(zombie||pumpkin);
 const style=strongFinish?'launch':zombie?['vapor','scatter','launch'][variant]:'vapor';
 const dir=Math.sign(shot.vx)||s.player.dir,g=enemyGeometry(e),duration=style==='vapor'?.85:1.8;
 const q=e.popcornDefeat={style,zombie,pumpkin,dir,age:0,duration,parts:[],vx:dir*(style==='launch'?330:165),vy:style==='launch'?-260:-140,rotation:0,landed:false,size:g.size,height:g.h};
 if(strongFinish){e.releasesSoul=false;e.soulReleased=true;}
 e.deadTime=duration;e.deathAge=0;e.pendingLimb=null;e.prey=null;e.elementHit=null;e.nightmareHidden=false;e.boosterHidden=false;e.phase='popcornDefeat';
 if((zombie||pumpkin)&&style!=='vapor')for(let i=0;i<4;i++){
  if(i===0&&e.armMissing||i>=2&&(e.legLost||e.type===21))continue;
  q.parts.push({x:e.x+(i%2?1:-1)*18,y:e.y-(i<2?70:20),vx:dir*(110+i*47)+(i%2?80:-60),vy:-240-i*32,rotation:i*.5,spin:(i%2?1:-1)*(6+i),key:pumpkin?'village-pumpkin-finish-v7':'nightmare-clothed-limbs-v7',frame:(pumpkin?4:12)+i,size:i<2?54:59,landed:false});
 }
 s.hitStop=Math.max(s.hitStop,.065);s.shake=Math.max(s.shake,.18);s.events.push('popcornFinish');
 return true;
}
function fall(s,q,dt,height){
 if(q.landed)return;
 q.vy+=850*dt;q.x+=q.vx*dt;q.y+=q.vy*dt;q.rotation+=(q.spin||0)*dt;
 const floor=groundY(s.level.route||s.platforms,q.x,q.y)-height;
 if(q.vy>0&&q.y>=floor){q.y=floor;q.landed=true;q.vy=0;q.vx=0;}
}
export function stepPopcornDefeat(s,e,dt,makeEnemy){
 const q=e.popcornDefeat;if(!q)return false;
 q.age+=dt;e.deathAge=q.age;e.deadTime=Math.max(0,q.duration-q.age);
 if(q.style!=='vapor'){
  const body={x:e.x,y:e.y,vx:q.vx,vy:q.vy,landed:q.landed,rotation:q.rotation,spin:q.dir*(q.style==='launch'?4.8:7)};
  fall(s,body,dt,0);Object.assign(q,{vx:body.vx,vy:body.vy,rotation:body.rotation,landed:body.landed});e.x=body.x;e.y=body.y;e.baseY=groundY(s.level.route||s.platforms,e.x,e.baseY);
  for(const part of q.parts)fall(s,part,dt,8);
  if(q.landed&&!q.landedFx){q.landedFx=true;s.effects.push({popcornPoof:true,x:e.x,y:e.y-20,size:110,age:0,life:.42,duration:.42});s.events.push('popcornLand');}
 }
 if(q.zombie&&!e.soulReleased&&q.age>=Math.min(.7,q.duration-.05)){e.soulReleased=true;if(e.releasesSoul)spawnNightmareSoul(s,e.x,e.y-22,makeEnemy,{fromZombie:true});}
 return true;
}
