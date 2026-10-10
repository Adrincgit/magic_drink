import {drawHullWater} from './harborWaterCanvas';
export const HARBOR_DEPTH={mountains:.022,fair:.18};
const reflectionRipple=(time,y)=>Math.sin(time*1.3+y*.075)*1.2;
// Distant views use screen-space elevation independent of combat zoom.
export function harborPanoramaPlacement(s,img){
 const h=545,w=Math.max(h*img.width/img.height,965+s.level.width*HARBOR_DEPTH.mountains);
 return{x:-s.camera.x*HARBOR_DEPTH.mountains,y:-12-((s.camera.backdropY??90)-90)*.08,w,h};
}
export function harborFairPlacement(s,img){
 const h=480,w=h*img.width/img.height;
 return{x:-s.camera.x*HARBOR_DEPTH.fair,y:327-h*.612-((s.camera.backdropY??90)-90)*.1,w,h};
}
export const HARBOR_BOATS=[{x:3500,h:36,depth:.34,y:355},{x:8100,h:48,depth:.43,y:375,flip:true},{x:11900,h:40,depth:.36,y:362}];
export function harborBoatPlacement(s,q){return{x:480+(q.x-s.camera.x-480)*q.depth,y:q.y-((s.camera.backdropY??90)-90)*.1,h:q.h};}
export function drawHarborBackdrop(c,s,art,reduced=false){
 const img=art['harbor-distant'],p=harborPanoramaPlacement(s,img),time=reduced?0:s.time;
 // Preserve the original sunset and painted clouds as one composition.
 // The fair and river retain their separate depth in front of the panorama.
 c.drawImage(img,p.x,p.y,p.w,p.h);
 // Use the quiet blue water from this same painting beneath the fair. Its
 // texture and the fair reflections share one depth and one ripple offset.
 // The old sun reflection no longer slides beneath a second reflection plate.
 const waterTop=p.y+p.h*.575,waterW=p.w*.31,waterX=-s.camera.x*HARBOR_DEPTH.fair;
 for(let y=waterTop;y<540;y+=6){
  const sourceY=Math.min(img.height-9,img.height*.585+(y-waterTop)/p.h*img.height),drift=reduced?0:reflectionRipple(time,y);
  for(let tile=Math.floor((-waterX-drift)/waterW);waterX+drift+tile*waterW<960;tile++){
   c.save();c.translate(waterX+drift+tile*waterW,y);if(Math.abs(tile)%2){c.translate(waterW,0);c.scale(-1,1);}
   c.drawImage(img,img.width*.68,sourceY,img.width*.31,7/p.h*img.height,0,0,waterW,7);c.restore();
  }
 }
 // This alpha plate has its own trees, tents and reflections. Mirroring at
 // the quiet banks joins identical edges; the mountains are never stretched
 // or moved with it. A 200-unit camera pan moves it 36 px versus 4.4 px far away.
 const fair=art['harbor-fair'],f=harborFairPlacement(s,fair),first=Math.floor(-f.x/f.w);
 for(let tile=first;f.x+tile*f.w<960;tile++){
  const x=f.x+tile*f.w;c.save();c.translate(x,f.y);if(Math.abs(tile)%2){c.translate(f.w,0);c.scale(-1,1);}
  const bank=fair.height*.622;c.drawImage(fair,0,0,fair.width,bank,0,0,f.w,f.h*.622);
  for(let y=bank;y<fair.height;y+=6){const h=Math.min(6,fair.height-y),drift=reduced?0:reflectionRipple(time,f.y+y/fair.height*f.h);c.drawImage(fair,0,y,fair.width,h,drift,y/fair.height*f.h,f.w,h/fair.height*f.h);}c.restore();
 }
 // A few small boats occupy a third depth, out on the river. They are not
 // attached to the walking piers, whose foam and pilings remain world-fixed.
 const boat=art['harbor-boat'];
 for(const q of HARBOR_BOATS){const at=harborBoatPlacement(s,q),w=at.h*boat.width/boat.height;if(at.x+w<0||at.x-w>960)continue;
  const bob=reduced?0:Math.sin(time*1.2+q.x)*1.1;c.save();c.translate(at.x,at.y+bob);if(q.flip)c.scale(-1,1);
  drawHullWater(c,boat,0,-at.h*.04,w,at.h,time,reduced,art);
  c.drawImage(boat,-w/2,-at.h,w,at.h);c.restore();
 }
}
export function drawHarborProps(c,s,art,_reduced=false){
 const width=960/(s.camera.zoom||1);
 for(const q of s.level.harborProps){if(q.x<s.camera.x-180||q.x>s.camera.x+width+180)continue;
  const img=art[q.kind],w=q.h*img.width/img.height;c.drawImage(img,q.x-w/2,q.y-q.h,w,q.h);
 }
}
export function drawHarborDockSupports(c,q,art){
 const img=art['river-bridge'],w=q.w;
 // These stems are painted before the bank. Its opaque soil and ragged grass
 // cover the buried ends, instead of timber hanging in front of the cliff.
 for(const cx of [.284,.713])c.drawImage(img,img.width*(cx-.025),img.height*.61,img.width*.05,img.height*.245,q.x+(cx-.025)*w,q.y+34,w*.05,q.footY-q.y+12);
}
export function drawHarborDock(c,q,art){
 const img=art['river-bridge'],h=100,w=q.w;
 c.drawImage(img,0,img.height*.24,img.width,img.height*.66,q.x,q.y-24,w,h);
}
