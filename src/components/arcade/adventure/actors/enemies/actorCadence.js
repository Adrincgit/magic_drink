// A gait is one whole left/right cycle, regardless of the atlas's cel count.
// Travel owns the feet; clocks own hovering, breathing and sustained effects.
export const ACTOR_MAX_FPS=24;
export const walkCels=e=>e.cornImp||[20,25,26,28].includes(e.type)?12:e.type===8?6:[14,24].includes(e.type)?4:8;
export function travelFrame(gait,count,reduced=false){
 return reduced?0:((Math.floor((gait||0)*count)%count)+count)%count;
}
export function loopFrame(age,count,fps,reduced=false){
 return travelFrame(Math.max(0,age||0)*Math.min(ACTOR_MAX_FPS,fps)/count,count,reduced);
}
export function advanceEnemyStride(e,distance,dt,stride){
 const moved=Math.abs(distance),count=walkCels(e);
 e.moving=moved>.001;
 if(e.moving)e.gait=(e.gait||0)+Math.min(moved/stride,ACTOR_MAX_FPS/count*dt);
}
export const enemyStride=e=>[0,6].includes(e.type)?47.5:e.type===8?64:e.type===14?48:[10,11].includes(e.type)?64:95;
