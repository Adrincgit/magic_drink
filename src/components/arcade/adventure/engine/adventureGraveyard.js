import {groundY} from '../world/adventureTerrain';
export const ZOMBIE_HEALTH=13.8,GHOST_HEALTH=4,HAND_HEALTH=2,TALL_HEALTH=138;
export const CRYPT_OPEN_TIME=.36,CRYPT_MIST_TIME=.85,CRYPT_SPAWN_GAP=.72;
export const CRYPT_PROCESSION=[18,18,22,18,18,22,18,18];
export const CRYPT_EXIT_TIME=1.8;
export function cryptFrame(q){
 if(q.hp<=0)return(q.collapseAge||0)<.42?6:7;
 if(q.phase==='sealed'||q.phase==='warning')return 0;
 if(q.phase==='opening')return 1+Math.min(2,Math.floor((CRYPT_OPEN_TIME-q.timer)/(CRYPT_OPEN_TIME/3)));
 return q.hp<q.maxHp*.4?5:4;
}
// Wake a fleeing group before its leading sprite can enter the lens. This
// also applies on the first simulation tick, without any player input.
export function fleeingClownInView(s,e){
 const width=960/(s.camera.zoom||1),margin=340;
 return e.x>s.camera.x-margin&&e.x<s.camera.x+width+margin;
}
export function prepareGraveyard(s,fromX=0){
 s.graves=s.level.graves.map((q,index)=>({...q,index,maxHp:q.hp,hp:q.x<fromX?0:q.hp,phase:q.x<fromX?'broken':'sealed',timer:0,spawned:0,flash:0}));s.looseBones=[];
 for(const e of s.enemies){const q=s.level.fugitives.find(q=>q.x===e.home);if(q)Object.assign(e,{fleeing:true,fleeDir:q.dir,tripAfter:q.tripAfter||0,fleeTravel:0,fleeState:'run',fleeAge:0,fleeSpeed:q.speed||350,lookOffset:q.lookOffset||0,fleeGroup:q.group,active:fleeingClownInView(s,e)});}
}
export const graveBody=q=>({x:q.x-(q.kind==='crypt'?180:48),y:q.y-(q.kind==='crypt'?350:112),w:q.kind==='crypt'?360:96,h:q.kind==='crypt'?350:112});
export function graveArmFrame(q){return q.kind==='headstone'&&q.phase==='warning'&&q.timer<=1.15?Math.min(3,Math.floor((1.15-Math.max(0,q.timer))/.2875)):-1;}
export function damageGrave(s,q,damage){
 if(q.hp<=0||!(damage>0))return false;q.hp=Math.max(0,q.hp-damage);q.flash=.18;
 if(!q.hp){q.phase='broken';q.timer=0;q.collapseAge=0;s.events.push('break');s.shake=Math.max(s.shake,.06);for(let i=0;i<7;i++)s.particles.push({x:q.x,y:q.y-38,vx:(i-3)*27,vy:-85-i%3*25,life:.55,color:i%2?'#b6a0bd':'#78677d'});}return true;
}
export function damageGravesInRadius(s,x,y,r,damage){for(const q of s.graves||[]){const b=graveBody(q),cx=Math.max(b.x,Math.min(x,b.x+b.w)),cy=Math.max(b.y,Math.min(y,b.y+b.h));if(Math.hypot(x-cx,y-cy)<r)damageGrave(s,q,damage);}}
function spawnGraveActor(s,q,makeEnemy){
 const crypt=q.kind==='crypt',x=q.x-(crypt?88:0),e=makeEnemy(x,q.y,crypt?CRYPT_PROCESSION[q.spawned%CRYPT_PROCESSION.length]:q.type,q.spawned);
 Object.assign(e,{graveId:q.index,nightmareGrave:q.index,phase:'manifest',nightmareAge:0,nightmareHidden:false,y:q.y+(crypt?-32:115),cryptScale:crypt?.55:1,gait:0,walkStride:72,dir:crypt?-1:Math.sign(s.player.x-q.x)||-1,active:crypt});
 s.enemies.push(e);q.spawned++;
}
function stepCrypt(s,q,dt,near,makeEnemy){
 if(q.phase==='sealed'){if(!near)return;q.phase='warning';q.timer=q.delay;s.events.push('warning');}
 q.timer-=dt;
 if(q.phase==='warning'&&q.timer<=0){q.phase='opening';q.timer=CRYPT_OPEN_TIME;q.openAge=0;s.events.push('break');s.shake=Math.max(s.shake,.12);}
 else if(q.phase==='opening'&&q.timer<=0){q.phase='mist';q.timer=CRYPT_MIST_TIME;}
 else if(q.phase==='mist'&&q.timer<=0){q.phase='releasing';q.timer=0;}
 if(!['sealed','warning'].includes(q.phase))q.openAge=(q.openAge||0)+dt;
 if(q.phase==='releasing'&&q.timer<=0){
  const count=s.enemies.filter(e=>e.graveId===q.index&&e.hp>0).length;
  if(count>=q.capacity){q.phase='open';q.timer=q.interval;}
  else if(!near||s.enemies.filter(e=>!e.fleeing&&e.hp>0).length>=42)q.timer=.5;
  else{spawnGraveActor(s,q,makeEnemy);q.timer=CRYPT_SPAWN_GAP;}
 }else if(q.phase==='open'&&q.timer<=0&&near){q.phase='releasing';q.timer=.5;}
}
export function stepGraveyard(s,dt,makeEnemy){
 if(!s.level.nightmareTrail)return;
 for(const q of s.graves){
  q.flash=Math.max(0,q.flash-dt);if(q.hp<=0){q.collapseAge=(q.collapseAge||0)+dt;continue;}if(s.boss.engaged||s.nightmarePurged)continue;const near=Math.abs(s.player.x-q.x)<680;
  if(q.kind==='crypt'){stepCrypt(s,q,dt,near,makeEnemy);continue;}
  if(q.phase==='sealed'&&near){q.phase='warning';q.timer=q.delay;s.events.push('warning');}
  if(q.phase==='warning'){
   q.timer-=dt;if(q.timer<=0){
    spawnGraveActor(s,q,makeEnemy);q.phase='open';q.timer=0;
   }
  }
 }
 // Capture has a rescue window for the entire fall / struggle / rise.
 // The captor is an actual combat actor: killing or trapping it breaks contact.
 for(const e of s.enemies.filter(e=>e.fleeing&&e.hp>0)){
  // Distant groups have not entered the scene yet. Capturing their frozen
  // actors here produced warning sounds at the very start of the chapter.
  if(!e.active)continue;
  e.rescueGrace=Math.max(0,(e.rescueGrace||0)-dt);
  if(e.capture){
   const q=e.capture,z=q.attacker;
   if(z.hp<=0||z.trap>0||z.ribbonBound>0||z.phase==='legBreak'||Math.abs(z.x-e.x)>85||Math.abs(z.y-e.baseY)>70){
    e.capture=null;e.infection=0;e.fleeState='recover';e.fleeAge=0;e.tripAfter=0;e.fleeAir=false;e.vy=0;e.rescueGrace=3;e.rescued=true;if(z.prey===e){z.prey=null;if(z.phase!=='legBreak'){z.phase='recover';z.timer=.8;}}s.events.push('rescue');continue;
   }
   q.age+=dt;e.infection=3.5-q.age;e.y=e.baseY;z.prey=e;z.phase='feeding';z.dir=Math.sign(e.x-z.x)||z.dir;
   if(q.age>=3.5){e.capture=null;e.infection=0;Object.assign(e,{fleeing:false,type:18,hp:ZOMBIE_HEALTH,maxHp:ZOMBIE_HEALTH,phase:'newlyTurned',timer:.18,gait:0,walkStride:72,active:true,converted:true,nightmareVariant:0,armMissing:false,armLost:false,legLost:false,fleeAir:false,vy:0});z.prey=null;z.phase='recover';z.timer=.6;}
   continue;
  }
  if(e.rescueGrace>0)continue;
  const caught=s.enemies.find(z=>[18,21].includes(z.type)&&z.hp>0&&!(z.trap>0)&&!z.nightmareHidden&&!['manifest','legBreak'].includes(z.phase)&&!z.prey&&Math.abs(z.x-e.x)<38&&Math.abs(z.y-e.y)<45);
  if(caught){e.capture={age:0,attacker:caught};e.infection=3.5;e.active=true;e.phase='infection';e.moving=false;caught.active=true;caught.prey=e;caught.phase='feeding';s.events.push('warning');}
 }
 for(const b of s.looseBones){b.life-=dt;if(!b.settled){b.vy+=620*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;b.rotation+=dt*b.spin;const floor=groundY(s.level.route,b.x)-5;if(b.y>=floor){b.y=floor;b.vx=0;b.vy=0;b.settled=true;b.rotation=b.key?0:b.frame===11?.12:b.frame===9?.15:Math.PI/2;}}}
 s.looseBones=s.looseBones.filter(b=>b.life>0&&!b.collected);
}
export function stepFleeingClown(s,e,dt){
 if(e.capture)return;if(!e.active&&fleeingClownInView(s,e))e.active=true;if(!e.active)return;
 e.dir=e.fleeDir;e.phase='patrol';e.action=0;e.recovery=0;
 e.fleeState||='run';e.fleeAge=(e.fleeAge||0)+dt;
 if(e.fleeState==='run'&&!e.fleeAir&&e.tripAfter>0&&e.fleeTravel>=e.tripAfter){e.fleeState='fall';e.fleeAge=0;e.tripAfter=0;s.events.push('land');}
 if(e.fleeState!=='run'){
  e.phase='stumble';e.moving=false;
  if(e.fleeState==='fall'){e.x+=e.dir*Math.max(0,1-e.fleeAge/.55)*135*dt;if(e.fleeAge>=.6){e.fleeState='prone';e.fleeAge=0;}}
  else if(e.fleeState==='prone'&&e.fleeAge>=3.1){e.fleeState='recover';e.fleeAge=0;}
  else if(e.fleeState==='recover'&&e.fleeAge>=.85){e.fleeState='run';e.fleeAge=0;}
  e.baseY=groundY(s.level.route,e.x,e.baseY);e.y=e.baseY;return;
 }
 const old=e.x,oldFloor=groundY(s.level.route,old,e.baseY);
 if(!e.fleeAir&&groundY(s.level.route,old+e.dir*130,oldFloor)<oldFloor-45){e.fleeAir=true;e.vy=-650;e.y=oldFloor;}
 e.x+=e.dir*(e.fleeSpeed||350)*dt;e.fleeTravel=(e.fleeTravel||0)+Math.abs(e.x-old);e.baseY=groundY(s.level.route,e.x,e.baseY);e.gait=(e.gait||0)+Math.abs(e.x-old)/150;const step=(e.gait*2)%1;
 if(!e.fleeAir&&e.baseY>oldFloor+24){e.fleeAir=true;e.vy=0;e.y=oldFloor;}
 if(e.fleeAir){e.vy+=1100*dt;e.y+=e.vy*dt;if(e.vy>=0&&e.y>=e.baseY){e.y=e.baseY;e.fleeAir=false;e.vy=0;}}
 else e.y=e.baseY-(step>.55?Math.sin((step-.55)/.45*Math.PI)*7:0);e.moving=true;
 if(e.x< -180||e.x>s.level.width+180){e.hp=0;e.deadTime=0;}
}
export function stepSpookyIdle(s,input,dt){
 const p=s.player,enabled=s.level.spookyIdle||Number(s.level.chapter?.split('-')[0])>=5;
 const busy=!enabled||Math.abs(p.vx)>2||p.ground===null||p.cast>0||p.firing||p.hitReact>0||p.guarding||p.charge>0||p.dash>0||p.crouch||p.specialCast>0||p.drinkCast>0||p.aimY!==0||['left','right','up','down','jump','attack','special','dash','super','guard'].some(k=>input[k]);
 if(busy){p.spookyIdle=0;p.fearAge=-1;return;}p.spookyIdle=(p.spookyIdle||0)+dt;const cycle=(p.spookyIdle-4.5)%8;p.fearAge=p.spookyIdle>=4.5&&cycle<1.6?cycle:-1;p.fearVariant=Math.floor(Math.max(0,p.spookyIdle-4.5)/8)%3;
}
