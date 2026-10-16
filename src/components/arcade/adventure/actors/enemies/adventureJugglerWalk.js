export const JUGGLER_WALK_FRAMES=12;
// One supporting foot travels 33 atlas pixels during half a cycle. At the
// juggler's 160/256 render scale, a full cycle therefore covers 41.25 world px.
export const JUGGLER_STRIDE=41.25;
const footX=[128,133.5,139,144.5,150,155.5,161,153,141,129,121,122.5];
const lift=[0,0,0,0,0,0,0,8,14,11,6,0];
const bob=[0,1,2,1,0,-1,0,1,2,1,0,-1];
const phase=gait=>(gait-Math.floor(gait))*JUGGLER_WALK_FRAMES;
const lerp=(a,b,t)=>a+(b-a)*t;
function legPose(p,offsetX=0){
 const frame=Math.floor(p)%JUGGLER_WALK_FRAMES,next=(frame+1)%JUGGLER_WALK_FRAMES,t=p-Math.floor(p);
 return{frame,offsetX:offsetX+lerp(footX[frame],footX[next],t)-footX[frame],offsetY:lift[frame]-lerp(lift[frame],lift[next],t),footX:offsetX+lerp(footX[frame],footX[next],t),lift:lerp(lift[frame],lift[next],t),supporting:frame<6||frame===11};
}
export function jugglerWalkPose(gait=0,reduced=false){
 const p=reduced?0:phase(gait),frame=Math.floor(p),next=(frame+1)%JUGGLER_WALK_FRAMES;
 // Offset time, never swap the front/back layer when the feet cross.
 return{near:legPose(p),far:legPose((p+6)%12,-16),bodyY:lerp(bob[frame],bob[next],p-frame)};
}
