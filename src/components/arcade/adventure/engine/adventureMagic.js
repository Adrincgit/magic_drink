import {POPCORN_COST} from './adventurePopcorn';
// Both attacks start on a press. R plays its own uninterruptible preparation.
export {SUPER_WINDUP,SUPER_DURATION} from './adventureSuperTiming';
export const STRONG_COST=34.5;
export const SUPER_COST=90;
export const SUPER_EXHAUSTION=8;
export const BASIC_SPECIAL={key:'wand-burst',cost:17.25,name:['Chispa cercana','Close spark'],tip:['Un destello corto de la varita: golpea de cerca y despeja proyectiles.','A short wand burst: strikes up close and clears projectiles.'],size:88,r:24,damage:5,speed:260,life:.24};
export const SPECIALS=[
 {key:'dragon',cost:35,name:['Gran llamarada','Great fireball'],tip:['Una gran bola de fuego que atraviesa enemigos.','A great fireball that pierces enemies.'],size:110,r:28,damage:14,speed:420,life:2.3},
 {key:'banana',cost:35,name:['Luna de ida y vuelta','Returning crescent'],tip:['Un gran búmeran: golpea al salir y al volver, y recoge estrellas.','A great boomerang: hits outward and back, and collects stars.'],size:140,r:36,damage:8,speed:500,life:3.6},
 {key:'kiwi',cost:40,name:['Remolino de hojas','Leaf cyclone'],tip:['Golpea varias veces y frena enemigos pequeños. Máquinas, gigantes y jefes resisten el frenado.','Hits repeatedly and slows small enemies. Machines, giants and bosses resist the slowdown.'],size:130,r:42,damage:2,speed:180,life:1.6},
 {key:'bubble',cost:40,name:['Doble burbuja','Twin bubbles'],tip:['Capturan disparos e inmovilizan enemigos pequeños, que aún pueden atacar. Máquinas, gigantes y jefes resisten la captura.','Catch projectiles and root small enemies, which can still attack. Machines, giants and bosses resist capture.'],size:106,r:36,damage:9,speed:275,life:2.3},
 {key:'sparkle',cost:45,name:['Coro de estrellas','Star chorus'],tip:['Cinco estrellas buscan enemigos en la dirección que apuntas.','Five stars seek enemies in the direction you aim.'],size:60,r:15,damage:4,speed:430,life:1.8},
 {key:'aqua',cost:35,name:['Manguera de bayas','Berry hose'],tip:['Orienta el chorro con arriba y abajo. El agua cae en arco y apaga el fuego por contacto sostenido.','Aim the stream up and down. Water arcs to the ground and quenches fire with sustained contact.'],size:145,r:42,damage:10,speed:400,life:1.85},
 {key:'jelly',name:['Resorte de cereza','Cherry spring'],tip:["Cerezas que rebotan. Mantén C y apunta con ← →; suelta para plantar un trampolín.", "Bouncing cherries. Hold C and aim with ← →; release to plant a trampoline."],size:100,r:40,damage:5,speed:0,life:5},
 {key:'prism',name:['Prisma de durazno','Peach prism'],tip:['Coloca un prisma: los disparos que lo atraviesan se dividen en tres.','Place a prism: shots passing through split into three.'],size:85,r:30,damage:0,speed:0,life:5.5},
 {key:'echo',name:['Encore de melón','Melon encore'],tip:['Y / C activa ecos que te siguen y disparan contigo, gastando munición extra de Echo Melon. Pulsa Y / C otra vez para retirarlos.','Y / C enables echoes that follow you and shoot with you, spending extra Echo Melon ammo. Press Y / C again to dismiss them.'],size:100,r:25,damage:0,speed:0,life:1},
 {key:'volt',name:['Relámpago de lichi','Lychee lightning'],tip:["Mantén Z: el rayo gana fuerza y encadena enemigos. C lanza una descarga larga instantánea.", "Hold Z: the beam grows stronger and chains enemies. C fires a long instant discharge."],size:95,r:13,damage:7,speed:0,life:.36},
 {key:'honey',name:['Lluvia de miel','Honey shower'],tip:["Miel que ralentiza. Mantén C y usa las flechas para colocar la lluvia; suelta para invocarla.", "Slowing honey. Hold C and use arrows to position the shower; release to summon it."],size:110,r:13,damage:3,speed:0,life:2.65},
 {key:'orbit',name:['Pequeño sistema solar','Little solar system'],tip:['Tres satélites te acompañan. Cada uno se consume al golpear o bloquear un proyectil.','Three satellites follow you. Each is consumed on a hit or projectile block.'],size:60,r:17,damage:4,speed:0,life:4.2},
 {key:'ribbon',name:['Danza de frambuesa','Raspberry dance'],tip:['X,Y atrae; X,X,Y gira y amarra. Y levanta y otro Y remata contra el suelo. Dirección + Y aleja; abajo + Y remata. Mantén Y para prolongar el giro. Teclado: Z y C.','X,Y pulls; X,X,Y spins and binds. Y launches and another Y slams down. Direction + Y pushes; down + Y slams. Hold Y to extend the spin. Keyboard: Z and C.'],size:120,r:12,damage:5,speed:0,life:.7},
 {key:'popcorn',name:['Descarga de largo alcance','Long-range blast'],tip:['La misma descarga de siete dulces, con el doble de alcance. Consume 45 de magia y una carga.','The same seven-candy blast, with double reach. Uses 45 magic and one charge.'],size:120,r:8,damage:3.2,speed:1200,life:.4},
].map(spell=>({...spell,cost:spell.key==='popcorn'?POPCORN_COST:spell.key==='volt'?42:spell.key==='prism'?28:STRONG_COST}));
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
  const candidates=s.enemies.filter(e=>e.hp>0&&!e.fleeing).map(e=>({x:e.x,y:e.y-32}));
  if(s.boss.hp>0&&!['sleep','intro'].includes(s.boss.phase))candidates.push({x:s.boss.x,y:s.boss.y-(s.index===0?75:s.index===1?204:55)});
  let target,distance=500;
  for(const t of candidates){const dx=t.x-q.x,dy=t.y-q.y,d=Math.hypot(dx,dy);
   if(d<distance&&(dx*q.aimX+dy*q.aimY)/Math.max(1,d)>.08&&Math.abs(t.x-s.camera.x-480)<560){target=t;distance=d;}
  }
  if(target){const d=Math.max(1,distance),a=Math.min(1,dt*8);q.vx+=((target.x-q.x)/d*430-q.vx)*a;q.vy+=((target.y-q.y)/d*430-q.vy)*a;}
 }
}

export function canSpecialHit(q,target){
 if(q.orbitOrb&&!q.orbitOrb.alive)return false;
 return q.heavy&&q.kind===2?q.age-(q.hitTimes.get(target)??-10)>=.3:!q.hits.includes(target);
}
export function rememberSpecialHit(q,target){
 if(q.orbitOrb){q.orbitOrb.alive=false;q.life=0;}
 if(q.heavy&&q.kind===2)q.hitTimes.set(target,q.age);else q.hits.push(target);
}
export function specialImpact(s,q,size=95){
 if(q.kind>=6){s.effects.push({drinkFx:q.kind,x:q.x,y:q.y,size,age:0,life:.36,duration:.36});return;}
 s.effects.push({x:q.x,y:q.y,spell:q.super?undefined:q.kind,super:!!q.super,dragon:!q.super&&q.kind===0,size:q.super?210:size,age:0,life:.32});
}

// Run after enemies fire, before hostile projectiles move or hurt the player.
// A cleared bomb must never reach its normal floor-explosion branch.
export {clearPowerProjectiles as clearBubbleProjectiles} from './adventureDefense';
export const SUPER_BOSS_DAMAGE=8*8;
