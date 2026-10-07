import {makeEnemy} from './adventureEnemies';
import {releaseItem} from '../../world/adventureSupplies';
import {rollLoot} from '../../engine/adventureLoot';
export const OUTPOST_SIZE=280;
export const outpostBody=q=>({x:q.x-93,y:q.y-160,w:186,h:160});
export const createOutposts=level=>(level.outposts||[]).map((q,id)=>({...q,id,hp:26,maxHp:26,clock:0,spawnIn:2,spawned:0,flash:0,deadTime:0}));
export function damageOutpost(s,q,damage){
 if(q.hp<=0)return;
 q.hp=Math.max(0,q.hp-damage);q.flash=.18;
 s.effects.push({x:q.x,y:q.y-70,row:1,size:q.hp?65:155,age:0,life:.35});
 s.events.push(q.hp?'bossHit':'impact');
 if(!q.hp){for(const star of s.stars)if(star.outpost===q.id)star.hidden=false;q.deadTime=0;s.score+=12;releaseItem(s,q.x+36,q.y,rollLoot(s,q.drink??0));}
}
export function updateOutposts(s,dt){
 for(const q of s.outposts){
  q.clock+=dt;q.flash=Math.max(0,q.flash-dt);
  if(q.hp<=0){q.deadTime+=dt;continue;}
  if(s.arenaLocked||Math.abs(s.player.x-q.x)>650)continue;
  const active=s.enemies.filter(e=>e.hp>0&&e.outpost===q.id).length;
  if(active>=3){q.spawnIn=Math.max(.9,q.spawnIn);continue;}
  q.spawnIn-=dt;
  if(q.spawnIn<=0){
   const type=q.spawned%3===2?3:0,e=makeEnemy(q.x,q.y,type,q.spawned);
   e.dir=s.player.x<q.x?-1:1;e.outpost=q.id;e.emerging=.8;e.timer=1.5;e.phase='emerge';
   s.enemies.push(e);q.spawned++;q.spawnIn=s.gentle?5.5:4.2;
  }
 }
}
export function outpostFrame(q){
 if(q.hp<=0)return q.deadTime<.35?5:q.deadTime<.8?6:7;
 const open=q.spawnIn<.8||q.spawnIn>3.75;
 return q.hp<=q.maxHp/2?(open?4:3):open?(q.spawnIn<.35||q.spawnIn>3.75?2:1):0;
}
