const clamp=n=>Math.max(0,Math.min(1,n));
const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t);};
// Authored opening in the canopy, independent of camera height and lens.
export const emberVistaAt=x=>smooth(7900,10600,x)*(1-smooth(14500,17900,x));
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
 for(let i=0;i<105;i++){
  const x=260+i*284+i%3*37;
  if(x>level.arena.left-250||x>9000&&x<15500||level.emberPits.some(p=>x>p.x-170&&x<p.x+p.w+170)||level.fallingTrees.some(q=>Math.abs(q.x-x)<190)||level.branchTrees.some(q=>Math.abs(q.x-x)<230))continue;
  trees.push({x,i,h:250+i%3*22});
 }
 return trees;
}
