import {skeletonFrame} from '../actors/enemies/nightmareSkeletonAnimation';
import {enemyGeometry} from '../actors/enemies/adventureEnemyGeometry';
// Preview tools share the exact complete-pose atlas used by the game renderer.
export function drawNightmareSkeleton(c,e,art,reduced){
 const frame=skeletonFrame(e,reduced),size=enemyGeometry({...e,type:22}).size;
 c.save();c.translate(e.x,e.y);if(e.dir>0)c.scale(-1,1);
 c.drawImage(art['nightmare-skeleton-frames-v4'],frame%4*256,Math.floor(frame/4)*256,256,256,-size/2,-size*250/256,size,size);c.restore();
}
