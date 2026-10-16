import {makeEnemy} from '../actors/enemies/adventureEnemies';

export function createCampTents(level,from=-Infinity){
 return (level.campTents||[]).map((q,id)=>({...q,id,age:0,spawned:0,wait:0,state:q.x<from+220?'cleared':'closed'}));
}
export function stepCampTents(s,dt){
 if(!s.level.circusCamp||s.player.x>=0||s.circusEntry)return;
 for(const q of s.campTents){
  if(q.state==='cleared')continue;
  if(q.state==='closed'){
   if(Math.abs(s.player.x-q.x)>570)continue;
   q.state='opening';q.age=0;q.wait=.95;s.events.push('doorOpen');
  }
  q.age+=dt;q.wait-=dt;
  const active=s.enemies.filter(e=>e.campTent===q.id&&e.hp>0).length;
  if(q.spawned<q.crew.length&&q.wait<=0&&active<2&&Math.abs(s.player.x-q.x)<1050){
   const e=makeEnemy(q.x,480,q.crew[q.spawned],q.id*3+q.spawned);
   Object.assign(e,{campTent:q.id,dir:s.player.x<q.x?-1:1,emerging:1.1,timer:2.25,phase:'emerge',y:468,hatchX:q.x});
   s.enemies.push(e);q.spawned++;q.wait=s.gentle?3.5:2.8;q.state='open';
  }
  if(q.spawned===q.crew.length&&!s.enemies.some(e=>e.campTent===q.id&&e.hp>0)){q.state='cleared';q.age=0;}
 }
}
