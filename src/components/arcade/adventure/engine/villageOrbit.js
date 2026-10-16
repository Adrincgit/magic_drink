import {villageTarget,villageAim} from './villageTargeting';
const ownerId=e=>`witch:${e.spawnSeed}:${e.home}`;
export function spawnWitchOrbit(s,witch){
 if(!witch.conjurer||witch.escortSpawned)return;
 witch.escortSpawned=true;
 for(let slot=0;slot<3;slot++){
  const seed=30000+witch.spawnSeed*3+slot,e={type:27,home:witch.home,x:witch.x,y:witch.y-80,baseY:witch.baseY,spawnSeed:seed,dir:witch.dir,hp:3,maxHp:3,clock:0,timer:.9+slot*.64,phase:'patrol',phaseAge:0,action:0,deadTime:0,trap:0,flash:0,vy:0,active:true,orbitEscort:true,orbitParent:ownerId(witch),orbitSlot:slot,sourceWitch:ownerId(witch)};
  e.curseId=`orbit:${e.orbitParent}:${slot}`;positionOrbit(e,witch,0);s.enemies.push(e);
 }
}
function positionOrbit(e,parent,dt){
 e.orbitAge=(e.orbitAge||0)+dt;
 const angle=e.orbitAge*1.65+e.orbitSlot*Math.PI*2/3,depth=Math.sin(angle);
 e.orbitDepth=depth;e.x=parent.x+Math.cos(angle)*115;e.y=parent.y-84+depth*58+28;e.baseY=parent.baseY;
}
export function stepWitchOrbit(s,e,dt,shoot){
 const parent=s.enemies.find(q=>q.type===26&&ownerId(q)===e.orbitParent&&q.hp>0);
 if(!parent)return false;
 positionOrbit(e,parent,dt);e.phaseAge+=dt;
 if(e.phase==='windup'){
  if(e.phaseAge>=.52){
   const m={x:e.x+e.dir*16,y:e.y-25},a=e.candyAim;
   shoot(s,m.x,m.y,Math.atan2(a.y-m.y,a.x-m.x),290,'soul-flame',{r:10,life:3,owner:e.curseId,village:true,element:'magic'});
   s.villageFire.push({x:m.x,y:m.y,kind:'soul-muzzle',angle:0,age:0,life:.22});
   e.phase='attack';e.phaseAge=0;e.timer=2.15;
  }return true;
 }
 if(e.phase==='attack'){if(e.phaseAge>.32){e.phase='patrol';e.phaseAge=0;}return true;}
 if(e.timer<=0){const target=villageTarget(s,e,590);if(target){e.dir=Math.sign(target.x-e.x)||e.dir;e.phase='windup';e.phaseAge=0;e.candyAim=villageAim(s,e,target,.52,290,{x:e.x,y:e.y-25});}}
 return true;
}
// Back half of the ellipse is painted behind its witch; front half in front.
export function villageEnemyOrder(enemies){
 const orbit=enemies.filter(e=>e.orbitParent&&e.hp>0),placed=new Set(),result=[];
 for(const e of enemies){
  if(orbit.includes(e))continue;
  const children=e.type===26?orbit.filter(q=>q.orbitParent===ownerId(e)).sort((a,b)=>a.orbitDepth-b.orbitDepth):[];
  result.push(...children.filter(q=>q.orbitDepth<0),e,...children.filter(q=>q.orbitDepth>=0));children.forEach(q=>placed.add(q));
 }
 return [...result,...orbit.filter(q=>!placed.has(q))];
}
