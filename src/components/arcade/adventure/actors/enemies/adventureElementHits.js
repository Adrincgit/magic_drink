// Electrical acting keeps each troop's own drawing; the red clown also has cels.
export const electricTroop=e=>[0,1,3,4,6,10,11,14,18,21,25].includes(e.type);
export const elementForShot=q=>q.kind===9?'electric':q.kind===0?'fire':q.kind===5?'water':q.kind===10?'honey':null;
const rows={electric:0,fire:1,water:2,honey:3};
export function reactToElement(e,q){
 const element=elementForShot(q);
 if(!(e.type===0||element==='electric'&&electricTroop(e))||!element||e.trap||e.emerging||e.elementHit?.element===element&&e.elementCooldown>0)return false;
 e.elementHit={element,age:0,life:.52};e.elementCooldown=.64;
 e.recovery=Math.max(e.recovery||0,.12);return true;
}
export function stepElementHit(e,dt){
 e.elementCooldown=Math.max(0,(e.elementCooldown||0)-dt);
 if(e.elementHit){e.elementHit.age+=dt;e.elementHit.life-=dt;if(e.elementHit.life<=0)e.elementHit=null;}
}
export function elementDrawing(e,reduced=false){
 const hit=e.elementHit;if(!hit||e.type!==0||e.charred)return null;
 return{key:'clown-element-hits',frame:rows[hit.element]*4+(reduced?1:Math.min(3,Math.floor(hit.age/.13)))};
}
export function beginElectricDefeat(s,e,shot){
 if(shot?.kind!==9||!electricTroop(e))return;
 e.charred=true;e.deadTime=1.9;e.deathAge=0;e.elementHit=null;
 s.events.push('electricDefeat');
}
