const clamp=n=>Math.max(0,Math.min(1,n));
export const woodlandSmooth=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t);};
const smooth=woodlandSmooth;
// Authored opening in the canopy, independent of camera height and lens.
export const emberVistaAt=x=>smooth(7900,10600,x)*(1-smooth(14500,17900,x));
export const WOODLAND_EXIT=10200,WOODLAND_RETURN=15700;
export function emberForestEdges(s){
 const scale=.85*(s.camera.zoom||1);
 return{exit:(WOODLAND_EXIT-s.camera.x)*scale+72,entry:(WOODLAND_RETURN-s.camera.x)*scale+72};
}
export function woodlandCoverage(s,x){
 const edge=emberForestEdges(s);
 return Math.min(1,1-smooth(edge.exit-28,edge.exit+28,x)+smooth(edge.entry-28,edge.entry+28,x));
}
export function emberForestPlacement(s,img){
 const w=1320,h=w*img.height/img.width;
 const step=w-100,offset=s.camera.x*.16,tile=Math.floor(offset/step),x=tile*step-offset;
 // Continue behind the arena's rear soil edge too (406 at half zoom).
 return{x,y:420-h,w,h,tile,step};
}
export function emberValleyPlacement(s,img){
 const h=510,w=h*img.width/img.height;
 const x=-clamp(s.camera.x/(s.level.fortDoor.x-800))*(w-960);
 return{x,y:-30,w,h};
}
export function emberSceneryTrees(level){
 const trees=[];
 for(let i=0;i<49;i++){
  const x=580+i*625+(i%3-1)*80;
  if(x>level.arena.left-250||x>9450&&x<16000||level.emberPits.some(p=>x>p.x-200&&x<p.x+p.w+200)||level.fallingTrees.some(q=>Math.abs(q.x-x)<260)||level.branchTrees.some(q=>Math.abs(q.x-x)<300))continue;
  trees.push({x,i,h:i%3===2?405:315+i%2*25});
 }
 return trees;
}
