// Both attacks start on a press. R plays its own uninterruptible preparation.
export const SUPER_WINDUP=.9;
export const SUPER_DURATION=3.15;
export const STRONG_COST=34.5;
export const SUPER_COST=90;
export const SUPER_EXHAUSTION=8;
export const BASIC_SPECIAL={key:'wand-burst',cost:17.25,name:['Chispa cercana','Close spark'],tip:['Un destello corto de la varita: golpea de cerca y despeja proyectiles.','A short wand burst: strikes up close and clears projectiles.'],size:88,r:24,damage:5,speed:260,life:.24};
export const SPECIALS=[
 {key:'dragon',cost:35,name:['Gran llamarada','Great fireball'],tip:['Una gran bola de fuego que atraviesa enemigos.','A great fireball that pierces enemies.'],size:110,r:28,damage:14,speed:420,life:2.3},
 {key:'banana',cost:35,name:['Luna de ida y vuelta','Returning crescent'],tip:['Un gran búmeran: golpea al salir y al volver, y recoge estrellas.','A great boomerang: hits outward and back, and collects stars.'],size:140,r:36,damage:8,speed:500,life:3.6},
 {key:'kiwi',cost:40,name:['Remolino de hojas','Leaf cyclone'],tip:['Frena enemigos cercanos y golpea varias veces mientras avanza.','Slows nearby enemies and hits repeatedly as it advances.'],size:130,r:42,damage:2,speed:180,life:1.6},
 {key:'bubble',cost:40,name:['Doble burbuja','Twin bubbles'],tip:['Dos burbujas grandes capturan disparos y los hacen estallar; inmovilizan enemigos que aún pueden atacar.','Two large bubbles capture shots and burst them; rooted enemies can still attack.'],size:106,r:36,damage:9,speed:275,life:2.3},
 {key:'sparkle',cost:45,name:['Coro de estrellas','Star chorus'],tip:['Cinco estrellas buscan enemigos en la dirección que apuntas.','Five stars seek enemies in the direction you aim.'],size:60,r:15,damage:4,speed:430,life:1.8},
].map(spell=>({...spell,cost:STRONG_COST}));
export const spellFor=kind=>SPECIALS[kind]||BASIC_SPECIAL;
export const specialArt=kind=>kind<0?'wand-burst':kind===0?'dragon':'special-'+SPECIALS[kind].key;

export function specialShots(kind,muzzle,aim){
 const spec=spellFor(kind),angles=kind===4?[-.56,-.28,0,.28,.56]:kind===3?[-.17,.17]:[0],angle=Math.atan2(aim.y,aim.x);
 return angles.map(offset=>({x:muzzle.x-(kind===3?Math.sin(angle)*Math.sign(offset)*14:0),y:muzzle.y+(kind===3?Math.cos(angle)*Math.sign(offset)*14:0),vx:Math.cos(angle+offset)*spec.speed,vy:Math.sin(angle+offset)*spec.speed,
  r:spec.r,life:spec.life,age:0,kind,heavy:true,damage:spec.damage,hits:[],hitTimes:new Map(),aimX:aim.x,aimY:aim.y}));
}

export function updateSpecialShot(s,q,dt){
 if(q.kind===1&&q.age>.95){
  if(!q.returning){q.returning=true;q.hits=[];}
  const dx=s.player.x-q.x,dy=s.player.y-38-q.y,d=Math.hypot(dx,dy)||1;
  q.vx+=(dx/d*510-q.vx)*Math.min(1,dt*10);q.vy+=(dy/d*510-q.vy)*Math.min(1,dt*10);
  if(d<25)q.life=0;
 }else if(q.kind===2){
  q.vx*=Math.exp(-dt*.8);q.vy*=Math.exp(-dt*.8);
 }else if(q.kind===3&&!q.captured?.length){
  q.vy-=dt*14;
 }else if(q.kind===4&&q.age>.16){
  const candidates=s.enemies.filter(e=>e.hp>0).map(e=>({x:e.x,y:e.y-32}));
  if(s.boss.hp>0&&!['sleep','intro'].includes(s.boss.phase))candidates.push({x:s.boss.x,y:s.boss.y-(s.index===0?75:s.index===1?204:55)});
  let target,distance=500;
  for(const t of candidates){const dx=t.x-q.x,dy=t.y-q.y,d=Math.hypot(dx,dy);
   if(d<distance&&(dx*q.aimX+dy*q.aimY)/Math.max(1,d)>.08&&Math.abs(t.x-s.camera.x-480)<560){target=t;distance=d;}
  }
  if(target){const d=Math.max(1,distance),a=Math.min(1,dt*8);q.vx+=((target.x-q.x)/d*430-q.vx)*a;q.vy+=((target.y-q.y)/d*430-q.vy)*a;}
 }
}

export function canSpecialHit(q,target){
 return q.heavy&&q.kind===2?q.age-(q.hitTimes.get(target)??-10)>=.3:!q.hits.includes(target);
}
export function rememberSpecialHit(q,target){
 if(q.heavy&&q.kind===2)q.hitTimes.set(target,q.age);else q.hits.push(target);
}
export function specialImpact(s,q,size=95){
 s.effects.push({x:q.x,y:q.y,spell:q.super?undefined:q.kind,super:!!q.super,dragon:!q.super&&q.kind===0,size:q.super?210:size,age:0,life:.32});
}

// Run after enemies fire, before hostile projectiles move or hurt the player.
// A cleared bomb must never reach its normal floor-explosion branch.
export {clearPowerProjectiles as clearBubbleProjectiles} from './adventureDefense';
