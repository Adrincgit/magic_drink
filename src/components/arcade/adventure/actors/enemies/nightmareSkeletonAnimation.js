export const SKELETON_POSE_TIME=.16;
export const SKELETON_PLUCK_TIME=SKELETON_POSE_TIME*4;
export const SKELETON_THROW_TIME=SKELETON_POSE_TIME*2;
export const SKELETON_RECOVER_TIME=SKELETON_POSE_TIME*2;
const pose=(duration,timer,count)=>Math.min(count-1,Math.max(0,Math.floor((duration-timer)/SKELETON_POSE_TIME)));
// Whole painted poses use the same stepped cadence as the other enemies.
export function skeletonFrame(e,reduced=false){
 if(e.hp<=0)return 16+Math.min(7,Math.floor((e.deathAge||0)/.13));
 if(e.phase==='pluck')return 8+pose(SKELETON_PLUCK_TIME,e.timer,4);
 if(e.phase==='throw')return 12+pose(SKELETON_THROW_TIME,e.timer,2);
 if(e.phase==='recover')return 14+pose(SKELETON_RECOVER_TIME,e.timer,2);
 return !reduced&&e.moving?Math.floor((e.gait||0)*8)%8:15;
}
// Registered open hand in release pose 14. No procedural limb transforms.
export function skeletonThrowOrigin(e){return{x:e.x+e.dir*64,y:e.y-61};}
