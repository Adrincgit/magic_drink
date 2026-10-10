import {followAdventureCamera} from '../render/adventureCamera';
import {stepWorldEffects} from './adventureEffects';
export function stepFortJourney(s,dt){
 if(s.index!==5)return false;
 const p=s.player,door=s.level.fortDoor;
 if(s.fortInside&&p.x<door.insideX-40){p.x=door.insideX-40;p.vx=Math.max(0,p.vx);}
 if(s.boss.defeat?.ready&&!s.fortInside&&!s.fortEntry&&p.x>=door.x-38){s.fortEntry={age:0};s.hostile=[];s.shots=[];s.events.push('doorOpen');}
 if(s.fortEntry){
  const q=s.fortEntry;q.age+=dt;p.vx=0;p.hurt=1;stepWorldEffects(s,dt);
  s.fortFade=q.age<.65?q.age/.65:Math.max(0,1-(q.age-.65)/.65);
  if(q.age>=.65&&!s.fortInside){s.fortInside=true;p.x=door.insideX;p.y=door.floor;p.vy=0;s.camera.zoom=1;s.camera.x=p.x-300;s.camera.y=door.floor-420;}
  if(q.age>=1.3){s.fortEntry=null;s.fortFade=0;}
  return true;
 }
 if(s.fortInside&&p.x>=s.level.exit[0]-35&&!s.fortExit&&s.enemies.every(e=>e.hp<=0||e.x<door.insideX-80)){
  s.fortExit={age:0};s.hostile=[];s.events.push('win');
 }
 if(s.fortExit){s.fortExit.age+=dt;p.vx=0;p.hurt=1;s.fortFade=Math.min(1,s.fortExit.age/.8);followAdventureCamera(s,dt);if(s.fortExit.age>=1){s.done=true;s.won=true;}return true;}
 return false;
}
