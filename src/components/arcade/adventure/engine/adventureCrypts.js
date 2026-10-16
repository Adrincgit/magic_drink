import {graveBody} from './adventureGraveyard';
// Solid side walls use the same footprint as projectile collisions. Sweep
// from the previous position so a dash cannot tunnel through the masonry.
export function resolveCryptWalls(s,oldX){
 if(!s.level.nightmareTrail)return;
 const p=s.player,half=13;
 for(const q of s.graves||[]){
  if(q.kind!=='crypt'||q.hp<=0)continue;
  const b=graveBody(q);
  if(p.y<=b.y||p.y-68>=q.y+30)continue;
  const left=b.x-half,right=b.x+b.w+half;
  if(oldX<=left&&p.x>left||p.x>left&&p.x<right&&oldX<q.x){p.x=left;p.vx=0;}
  else if(oldX>=right&&p.x<right||p.x>left&&p.x<right&&oldX>=q.x){p.x=right;p.vx=0;}
 }
}
