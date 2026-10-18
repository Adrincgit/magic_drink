import {groundY} from '../world/adventureTerrain';
import {makeEnemy} from '../actors/enemies/adventureEnemies';
import {advanceEnemyStride} from '../actors/enemies/actorCadence';
export function prepareVillageBlockade(s){
 const previous=s.villageBlockade,wall=s.villageObstacles.find(q=>q.blockade);
 s.villageBlockade=wall?{age:0,waves:0,started:false,...previous,wallId:wall.id}:null;
}
export function stepVillageBlockade(s,dt){
 const q=s.villageBlockade,wall=s.villageObstacles?.find(r=>r.id===q?.wallId);if(!q||!wall)return;
 if(!q.started&&s.player.x>=s.level.blockade.trigger&&s.player.x<wall.x+1100){q.started=true;s.notice='villageBlockade';s.noticeTime=5;}
 if(!q.started||wall.broken||Math.abs(s.player.x-wall.x)>1250)return;
 q.age+=dt;
 const schedule=[1.5,8.5,16],types=[[26,27,27],[26,25],[27,27,25]];
 if(q.waves>=schedule.length||q.age<schedule[q.waves])return;
 const wave=q.waves++;
 for(const [i,type] of types[wave].entries()){
  const home=wall.x+680+i*110+wave*25,x=home+160,e=makeEnemy(x,groundY(s.level.route,x),type,40000+wave*10+i);
  Object.assign(e,{home,active:true,phaseAge:0,timer:.6+i*.4,dir:-1,blockadeEnemy:true,blockadeEntry:{from:x,to:home,age:0},flying:type===26,flightHeight:190+i*15,flightDir:-1,rapidLantern:type===25});
  if(type===27)Object.assign(e,{curseId:`blockade:${wave}:${i}`,flightHeight:145+i*12});
  s.enemies.push(e);
 }
}
export function stepBlockadeArrival(s,e,dt){
 const entry=e.blockadeEntry;if(!entry)return false;
 entry.age+=dt;const u=Math.min(1,entry.age/1.6),old=e.x;e.x=entry.from+(entry.to-entry.from)*u;e.baseY=groundY(s.level.route,e.x);advanceEnemyStride(e,e.x-old,dt,90);
 e.y=e.baseY-([26,27].includes(e.type)?e.flightHeight+Math.sin(e.clock*2)*8:0);e.moving=true;
 if(u>=1){delete e.blockadeEntry;e.phase='patrol';e.phaseAge=0;e.timer=.35;}
 return true;
}
