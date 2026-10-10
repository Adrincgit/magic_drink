import {groundY} from '../world/adventureTerrain';

// Scenery touching the path is part of the stage. Its world height never
// depends on camera x, zoom, or a reprojected sample of another hillside.
export function forestElevation(s,x){
 return groundY(s.level.route,Math.max(0,Math.min(s.level.width,x)));
}
export function forestPlaneRoot(s,x){
 const zoom=s.camera.zoom||1;
 return{x:(x-s.camera.x)*zoom,y:(forestElevation(s,x)-s.camera.y)*zoom,zoom,groundX:x};
}
export function forestWorldX(camera,x){return camera.x+x/(camera.zoom||1);}
export function forestTreeRoot(s,x,_depth,width){
 const q=forestPlaneRoot(s,x),half=width*.3;
 const y=Math.max(...[-half,0,half].map(dx=>forestElevation(s,x+dx)))+5;
 return{...q,y:(y-s.camera.y)*q.zoom};
}
// Conventional 2D scenery has a fixed altitude and no lens breathing.
export function emberPlanePosition(camera,x,y,depth){return{x:x-camera.x*depth,y,zoom:1};}
