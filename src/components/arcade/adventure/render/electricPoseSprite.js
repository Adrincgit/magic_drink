// The energy is a filled raster registered to the actual drawing, not a ring
// sized from a collision box. Cache each pose/pulse once, never read it per tick.
const CEL=256,PAD=40,BINS=180,TAU=Math.PI*2;
const bodies=new WeakMap(),energies=new WeakMap();
const surface=(w,h)=>typeof OffscreenCanvas!=='undefined'?new OffscreenCanvas(w,h):Object.assign(document.createElement('canvas'),{width:w,height:h});
const angleBin=a=>Math.floor((a+TAU)%TAU/TAU*BINS)%BINS;
function profile(pixels,fillRows=false){
 let left=CEL,top=CEL,right=0,bottom=0;
 for(let y=0;y<CEL;y++)for(let x=0;x<CEL;x++)if(pixels[(y*CEL+x)*4+3]>64){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
 const x=(left+right)/2,y=(top+bottom)/2,raw=new Float32Array(BINS),radii=new Float32Array(BINS);
 for(let py=top;py<=bottom;py++){
  let start=left,end=right;
  if(fillRows){while(start<=right&&pixels[(py*CEL+start)*4+3]<=64)start++;while(end>=left&&pixels[(py*CEL+end)*4+3]<=64)end--;}
  for(let px=start;px<=end;px++)if(fillRows||pixels[(py*CEL+px)*4+3]>64){const dx=px-x,dy=py-y,i=angleBin(Math.atan2(dy,dx));raw[i]=Math.max(raw[i],Math.hypot(dx,dy));}
 }
 // Close spaces between limbs, retaining the pose's asymmetric reach. The
 // neighbouring samples also cover the entire source at the bin boundaries.
 for(let i=0;i<BINS;i++)for(let d=-2;d<=2;d++)radii[i]=Math.max(radii[i],raw[(i+d+BINS)%BINS]);
 return{x,y,radii,peak:Math.max(...radii)};
}
function readCel(img,frame,fillRows=false){
 const cell=img.width/4,c=surface(CEL,CEL),b=c.getContext('2d',{willReadFrequently:true});
 b.drawImage(img,frame%4*cell,Math.floor(frame/4)*cell,cell,cell,0,0,CEL,CEL);
 const pixels=b.getImageData(0,0,CEL,CEL).data;return{pixels,...profile(pixels,fillRows)};
}
const radiusAt=(profile,a)=>{const index=(a+TAU)%TAU/TAU*BINS,i=Math.floor(index),t=index-i;return profile.radii[i]*(1-t)+profile.radii[(i+1)%BINS]*t;};
export function electricPoseSprite(sheet,frame,energy,phase){
 if(!sheet||!energy)return null;
 let poses=bodies.get(sheet);if(!poses){poses=new Map();bodies.set(sheet,poses);}
 let body=poses.get(frame);if(!body){body={...readCel(sheet,frame,true),pulses:new WeakMap()};poses.set(frame,body);}
 let pulses=body.pulses.get(energy);if(!pulses){pulses=[];body.pulses.set(energy,pulses);}if(pulses[phase])return pulses[phase];
 let fills=energies.get(energy);if(!fills){fills=Array.from({length:4},(_,i)=>readCel(energy,i));energies.set(energy,fills);}
 const fill=fills[phase],out=surface(CEL+PAD*2,CEL+PAD*2),b=out.getContext('2d'),image=b.createImageData(out.width,out.height);
 for(let y=0;y<out.height;y++)for(let x=0;x<out.width;x++){
  const dx=x-PAD-body.x,dy=y-PAD-body.y,r=Math.hypot(dx,dy),a=Math.atan2(dy,dx),edge=radiusAt(fill,a);
  const outer=radiusAt(body,a)+7+Math.pow(edge/fill.peak,5)*24,t=r/outer;if(t>=1)continue;
  const sx=Math.max(0,Math.min(CEL-1,Math.round(fill.x+Math.cos(a)*edge*t*.98))),sy=Math.max(0,Math.min(CEL-1,Math.round(fill.y+Math.sin(a)*edge*t*.98)));
  const source=(sy*CEL+sx)*4,target=(y*out.width+x)*4,opaque=fill.pixels[source+3]>200;
  image.data[target]=opaque?fill.pixels[source]:0;image.data[target+1]=opaque?fill.pixels[source+1]:164;image.data[target+2]=opaque?fill.pixels[source+2]:255;
  // Transparency belongs outside the effect only. Even spaces between the
  // original arms/legs are filled; no scenery bleeds through the active mass.
  image.data[target+3]=Math.round(Math.min(1,outer-r)*255);
 }
 b.putImageData(image,0,0);const result={canvas:out,pad:PAD/CEL,scale:out.width/CEL};pulses[phase]=result;return result;
}
