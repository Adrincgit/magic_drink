import {groundY} from '../world/adventureTerrain';
import {drawMeadowSky} from '../world/adventureSky';
import {RIVER_PLANES,riverPlanePlacement,riverWaterfallPlacement,riverWoodlandPlacement} from '../world/adventureRiverDepth';

export function drawRiverBackdrop(c,s,art,reduced=false){
 drawMeadowSky(c,{...s,time:s.time*1.5},art,reduced);
 for(const plane of RIVER_PLANES){const p=riverPlanePlacement(s,art[plane.key],plane);c.drawImage(art[plane.key],p.x,p.y,p.w,p.h);}
 drawRiverWaterfall(c,s,art,reduced);
 // Uneven groups of different native trees let the valley show between them.
 for(const q of s.level.woodland||[]){
  const img=art[q.key],p=riverWoodlandPlacement(s,img,q);
  if(p.x+p.w<0||p.x>960)continue;c.drawImage(img,p.x,p.y,p.w,p.h);
 }
}
export function drawRiverWaterfall(c,s,art,reduced=false){
 const img=art.world1,q=riverWaterfallPlacement(s,img);if(q.x+q.w<0||q.x>960)return;
 const frame=reduced?0:Math.floor(s.time*10)%4;
 c.save();c.beginPath();c.rect(q.x+q.w*.12,q.y,q.w*.76,q.h);c.clip();c.globalAlpha=.42;
 const shift=frame/4*q.h;
 for(const y of [q.y+shift-q.h,q.y+shift])c.drawImage(img,img.width*.309,img.height*.374,img.width*.025,img.height*.281,q.x,y,q.w,q.h);
 c.restore();
}
export function riverFlow(s,river,reduced=false){
 const time=reduced?0:s.time;
 // Water under a physical bridge shares its world position. Only the surface
 // ripples flow; moving the camera cannot move the riverbed under the piers.
 return{time,far:0,near:-time*14};
}
function waterPlane(c,s,img,river,flow,reduced,near=false){
 const h=300,w=h*img.width/img.height,phase=near?flow.near:flow.far,offset=((phase%w)+w)%w,tile=Math.floor(phase/w),band=10;
 const left=Math.max(river.x-w,s.camera.x-w),right=Math.min(river.x+river.w+w,s.camera.x+960/(s.camera.zoom||1)+w);
 c.save();if(near){c.globalAlpha=.23;c.globalCompositeOperation='screen';}
 for(let y=near?70:0;y<h;y+=band){
  const drift=reduced||!near?0:Math.sin(flow.time*2.1+y*.017)*2.5;
  const sourceY=y/h*img.height,sourceH=Math.min(img.height-sourceY,(band+1.5)/h*img.height);
  for(let i=Math.floor((left-river.x-offset)/w),x=river.x+i*w+offset;x<right;i++,x+=w){
   if(Math.abs(i-tile)%2){c.save();c.translate(x+drift+w,0);c.scale(-1,1);c.drawImage(img,0,sourceY,img.width,sourceH,0,river.y-h*.25+y,w,sourceH/img.height*h);c.restore();}
   else c.drawImage(img,0,sourceY,img.width,sourceH,x+drift,river.y-h*.25+y,w,sourceH/img.height*h);
  }
 }c.restore();
}
export function drawRiverWater(c,s,art,reduced=false){
 const img=art['river-water'],h=300;
 for(const river of s.level.rivers){
  if(river.x+river.w<s.camera.x-150||river.x>s.camera.x+960/(s.camera.zoom||1)+150)continue;
  const flow=riverFlow(s,river,reduced),time=flow.time;
  c.save();c.beginPath();c.rect(river.x-32,river.y-50,river.w+64,600);c.clip();
  waterPlane(c,s,img,river,flow,reduced);waterPlane(c,s,img,river,flow,reduced,true);
  c.save();c.lineWidth=1.2;c.strokeStyle='#fff2ba';
  for(let i=0;i<Math.ceil(river.w/180);i++){
   const t=reduced?.4:((time*.32+i*.24)%1);c.globalAlpha=(1-t)*.3;
   c.beginPath();c.ellipse(river.x+90+i*180+t*45,river.y+40+i%2*43,16+t*32,3+t*6,-.05,0,Math.PI*2);c.stroke();
  }c.restore();
  c.fillStyle='#245758';c.fillRect(river.x-32,river.y+h*.75,river.w+64,600);c.restore();
 }
}
export function riverBridgeSegments(q,img){
 const h=240,scale=h/img.height,cap=img.width*.18,capW=cap*scale,w=q.w+54,inside=w-capW*2,count=Math.ceil(inside/(img.width*.64*scale)),span=inside/count,y=q.y-h*.4;
 const parts=[{sx:0,sw:cap,x:q.x-27,y,w:capW,h}];
 for(let i=0;i<count;i++)parts.push({sx:cap,sw:img.width*.64,x:q.x-27+capW+i*span,y,w:span+.5,h});
 parts.push({sx:img.width-cap,sw:cap,x:q.x+q.w+27-capW,y,w:capW,h});return parts;
}
export function drawRiverBridge(c,q,art){
 const img=art['river-bridge'];for(const p of riverBridgeSegments(q,img))c.drawImage(img,p.sx,0,p.sw,img.height,p.x,p.y,p.w,p.h);
}
// Measured centres and foot height in the original bridge artwork. Stretching
// a deck section also transforms its two pillars, so the wakes use that same
// section mapping instead of guessing uniform world-space positions.
export function riverBridgePiers(q,img){
 const source=[img.width*.284,img.width*.713],piers=[];
 for(const part of riverBridgeSegments(q,img))for(const x of source){
  if(x<part.sx||x>=part.sx+part.sw)continue;
  piers.push({x:part.x+(x-part.sx)/part.sw*part.w,y:part.y+part.h*.86,w:part.w/part.sw*img.width*.047});
 }return piers;
}
export function drawRiverPierWater(c,s,art,reduced=false){
 const img=art['river-bridge'],foam=art['pier-foam'],time=reduced?0:s.time;
 for(const bridge of s.platforms.filter(q=>q.bridge))for(const [i,q] of riverBridgePiers(bridge,img).entries()){
  if(q.x<s.camera.x-100||q.x>s.camera.x+960/(s.camera.zoom||1)+100)continue;
  const frame=reduced?1:Math.floor(time*9+i)%4,w=Math.max(100,q.w*2.5),h=62;
  c.save();
  c.fillStyle='#164c4c';c.globalAlpha=.38;c.beginPath();c.ellipse(q.x,q.y+1,q.w*.7,5,0,0,Math.PI*2);c.fill();
  c.globalAlpha=.86;
  // Ignore empty atlas padding and stray marks above the actual splash.
  c.drawImage(foam,frame*512,210,512,302,q.x-w*.45,q.y-h*.65+h*210/512,w,h*302/512);
  // Broken pale arcs carry the wake downstream past the wooden base.
  c.strokeStyle='#e7f9de';c.lineWidth=1.6;
  for(let n=0;n<3;n++){
   const t=reduced?.45:(time*.6+n*.33+i*.2)%1;c.globalAlpha=(1-t)*.45;
   c.beginPath();c.ellipse(q.x+18+t*65,q.y+5+t*8,28+t*35,4+t*7,0,-.1,Math.PI*.85);c.stroke();
  }c.restore();
 }
}
