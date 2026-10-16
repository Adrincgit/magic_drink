import {villageVillagerProfile} from '../actors/villageVillagers';
export function stepBlockedVillager(s,n,dt){
 if(!n.blocked){n.blockedAge=0;n.climbLift=0;return;}
 n.blockedAge=(n.blockedAge||0)+dt;
 const wall=s.villageObstacles.find(r=>r.id===n.blockedBy),distance=wall?n.x-(wall.x+wall.w/2):Infinity;
 n.atWall=distance<85;
 const t=((n.blockedAge+(n.blockadeOrder??n.style)*.19)%2.1)/2.1;
 n.blockedFrame=n.atWall?Math.min(7,Math.floor(t*8)):[0,6,7,6][Math.floor(t*4)];
 n.climbLift=n.atWall&&t>.22&&t<.62?Math.sin((t-.22)/.4*Math.PI)*Math.min(46,villageVillagerProfile(n.style).h*.4):0;
 n.y-=n.climbLift;
}
