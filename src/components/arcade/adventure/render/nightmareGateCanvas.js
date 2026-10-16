import {groundY} from '../world/adventureTerrain';
const lerp=(a,b,t)=>a+(b-a)*t;
export function nightmareGatePlacement(s){
 const x=s.level.cemeteryStart,h=410,w=h*1.5,y=groundY(s.level.route,x)+46;
 return{x,y,h,w,left:x-320,top:y-h};
}
// The gate junction is in the walking plane. Depth increases continuously
// along each fence run, so joined bays share the exact same projection.
// Camera elevation never changes these authored ground coordinates.
export function nightmareFenceRuns(s){
 const q=nightmareGatePlacement(s),k=q.h/1024,near={x:q.left+350*k,y:q.top+982*k,h:142,depth:1},far={x:q.left+1240*k,y:q.top+693*k,h:100,depth:1};
 return{
  near:[near,{x:near.x-360,y:near.y+96,h:202,depth:1.1},{x:near.x-760,y:near.y+220,h:274,depth:1.2}],
  far:[far,{x:far.x+250,y:far.y-18,h:70,depth:.9},{x:far.x+480,y:far.y-32,h:45,depth:.82},{x:far.x+680,y:far.y-42,h:28,depth:.76},{x:far.x+850,y:far.y-48,h:14,depth:.72}],
 };
}
export function projectNightmareFence(s,p){return{...p,x:p.x-(s.camera.x-(s.level.cemeteryStart-300))*(p.depth-1)};}
function triangle(c,img,source,target){
 const [a,b,d]=source,[p,q,r]=target,det=(b.x-a.x)*(d.y-a.y)-(d.x-a.x)*(b.y-a.y);
 const m11=((q.x-p.x)*(d.y-a.y)-(r.x-p.x)*(b.y-a.y))/det,m21=((r.x-p.x)*(b.x-a.x)-(q.x-p.x)*(d.x-a.x))/det;
 const m12=((q.y-p.y)*(d.y-a.y)-(r.y-p.y)*(b.y-a.y))/det,m22=((r.y-p.y)*(b.x-a.x)-(q.y-p.y)*(d.x-a.x))/det;
 c.save();c.beginPath();c.moveTo(p.x,p.y);c.lineTo(q.x,q.y);c.lineTo(r.x,r.y);c.closePath();c.clip();c.transform(m11,m12,m21,m22,p.x-m11*a.x-m21*a.y,p.y-m12*a.x-m22*a.y);c.drawImage(img,0,0);c.restore();
}
function bay(c,img,a,b,fade=false){
 // Subdivide the perspective taper to keep iron bars vertical and the rails
 // continuous. All sub-patches share vertices, including adjoining bays.
 const n=12,w=img.width,h=img.height;
 for(let i=0;i<n;i++){
  const u=i/n,v=(i+1)/n,ax=lerp(a.x,b.x,u),bx=lerp(a.x,b.x,v),ay=lerp(a.y,b.y,u),by=lerp(a.y,b.y,v),ah=lerp(a.h,b.h,u),bh=lerp(a.h,b.h,v);
  const source=[{x:w*u,y:0},{x:w*v,y:0},{x:w*v,y:h},{x:w*u,y:h}],dest=[{x:ax,y:ay-ah},{x:bx,y:by-bh},{x:bx,y:by},{x:ax,y:ay}];
  c.save();if(fade)c.globalAlpha*=1-u;triangle(c,img,[source[0],source[1],source[2]],[dest[0],dest[1],dest[2]]);triangle(c,img,[source[0],source[2],source[3]],[dest[0],dest[2],dest[3]]);c.restore();
 }
}
export {bay as drawFenceBay};
export function drawNightmareSideGate(c,s,art,front=false){
 const q=nightmareGatePlacement(s),view=960/(s.camera.zoom||1),runs=nightmareFenceRuns(s),points=(front?runs.near:runs.far).map(p=>projectNightmareFence(s,p));
 const xs=[q.left,q.left+q.w,...points.map(p=>p.x)];
 // Cull the projected continuation, not the original gate rectangle: the
 // distant end remains in view after the player passes the entrance.
 if(Math.max(...xs)<s.camera.x||Math.min(...xs)>s.camera.x+view)return;
 const img=art['nightmare-gate-oblique-v5'],fence=art['nightmare-fence-bay-v5'];
 c.save();
 c.filter=front?'saturate(.42) brightness(.61) contrast(.92) blur(.65px)':'saturate(.34) brightness(.7) contrast(.8)';
 for(let i=points.length-2;i>=0;i--){c.globalAlpha=front?1:1-i*.13;bay(c,fence,points[i],points[i+1],!front&&i===points.length-2);}
 c.globalAlpha=1;c.filter='saturate(.44) brightness(.72) contrast(.88)';
 if(front){
  // Only the nearer pillar and its opened leaf occlude the crossing actor.
  // The right, receding pillar is always behind the player.
  c.beginPath();c.rect(q.left,q.top,q.w*.405,q.h);c.clip();
 }
 c.drawImage(img,q.left,q.top,q.w,q.h);c.restore();
}
