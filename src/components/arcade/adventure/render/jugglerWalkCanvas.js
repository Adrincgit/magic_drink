import {jugglerWalkFrame} from '../actors/enemies/adventureJugglerWalk';
export function drawJugglerWalk(c,e,art,size=160,reduced=false){
 const frame=jugglerWalkFrame(e.gait||0,reduced);
 c.save();c.translate(e.x,e.y);if(e.dir>0)c.scale(-1,1);
 c.drawImage(art['juggler-walk-v2'],frame%4*256,Math.floor(frame/4)*256,256,256,-size/2,-size*250/256,size,size);c.restore();
}
