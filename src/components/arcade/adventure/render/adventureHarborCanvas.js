import {riverBridgePiers} from './adventureRiverCanvas';
import {drawHullWater} from './harborWaterCanvas';
export const HARBOR_DEPTH={mountains:.022,fair:.18};
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
 c.drawImage(img,p.x,p.y,p.w,p.h);
 // Animate only the reflected surface: shore, wheel and tents stay fixed.
 c.save();c.beginPath();c.rect(0,p.y+p.h*.61,960,p.h*.39);c.clip();
 for(let y=.61;y<1;y+=.025){const drift=reduced?0:Math.sin(time*1.3+y*29)*1.8;
  c.drawImage(img,0,img.height*y,img.width,Math.min(img.height*(1-y),img.height*.027),p.x+drift,p.y+p.h*y,p.w,p.h*.027);
 }c.restore();
 // This alpha plate has its own trees, tents and reflections. Mirroring at
 // the quiet banks joins identical edges; the mountains are never stretched
 // or moved with it. A 200-unit camera pan moves it 36 px versus 4.4 px far away.
 const fair=art['harbor-fair'],f=harborFairPlacement(s,fair),first=Math.floor(-f.x/f.w);
 for(let tile=first;f.x+tile*f.w<960;tile++){
  const x=f.x+tile*f.w;c.save();c.translate(x,f.y);if(Math.abs(tile)%2){c.translate(f.w,0);c.scale(-1,1);}
  const bank=fair.height*.622;c.drawImage(fair,0,0,fair.width,bank,0,0,f.w,f.h*.622);
  for(let y=bank;y<fair.height;y+=10){const h=Math.min(10,fair.height-y),drift=reduced?0:Math.sin(time*1.25+y*.026)*1.1;c.drawImage(fair,0,y,fair.width,h,drift,y/fair.height*f.h,f.w,h/fair.height*f.h);}c.restore();
 }
 // A few small boats occupy a third depth, out on the river. They are not
 // attached to the walking piers, whose foam and pilings remain world-fixed.
 const boat=art['harbor-boat'];
 for(const q of HARBOR_BOATS){const at=harborBoatPlacement(s,q),w=at.h*boat.width/boat.height;if(at.x+w<0||at.x-w>960)continue;
  const bob=reduced?0:Math.sin(time*1.2+q.x)*1.1;c.save();c.translate(at.x,at.y+bob);if(q.flip)c.scale(-1,1);
  drawHullWater(c,boat,0,-at.h*.04,w,at.h,time,reduced);
  c.drawImage(boat,-w/2,-at.h,w,at.h);c.restore();
 }
}
export function harborMooring(s,q,bridgeArt){
 const bridge=s.platforms.find(p=>p.bridge&&q.x>=p.x&&q.x<=p.x+p.w);
 if(!bridge)return null;
 const pier=riverBridgePiers(bridge,bridgeArt).reduce((a,b)=>Math.abs(a.x-q.x)<Math.abs(b.x-q.x)?a:b);
 return{x:pier.x,y:bridge.y+24};
}
export function drawHarborProps(c,s,art,reduced=false){
 const width=960/(s.camera.zoom||1);
 for(const q of s.level.harborProps){if(q.x<s.camera.x-180||q.x>s.camera.x+width+180)continue;
  const img=art[q.kind],w=q.h*img.width/img.height,bob=q.kind==='harbor-boat'&&!reduced?Math.sin(s.time*1.2+q.x)*2:0;
  if(q.kind==='harbor-boat'){
   drawHullWater(c,img,q.x,q.y+bob-q.h*.04,w,q.h,s.time,reduced);
   const tie=harborMooring(s,q,art['river-bridge']);
   if(tie){
    const bow={x:q.x+(tie.x<q.x?-1:1)*w*.36,y:q.y-q.h*.37+bob};
    c.save();c.lineWidth=3;c.strokeStyle='#3c3845';c.beginPath();c.moveTo(tie.x,tie.y);c.quadraticCurveTo((tie.x+bow.x)/2,Math.max(tie.y,bow.y)+14,bow.x,bow.y);c.stroke();c.lineWidth=1.2;c.strokeStyle='#b7a06a';c.stroke();c.restore();
   }
  }
  c.drawImage(img,q.x-w/2,q.y-q.h+bob,w,q.h);
 }
}
export function drawHarborDock(c,q,art){
 const img=art['river-bridge'],h=100,w=q.w;
 // Extend the painted timber directly beneath the original pillar centres.
 // The platform and its feet share world coordinates, including on slopes.
 for(const cx of [.284,.713])c.drawImage(img,img.width*(cx-.025),img.height*.61,img.width*.05,img.height*.245,q.x+(cx-.025)*w,q.y+34,w*.05,q.footY-q.y-22);
 c.drawImage(img,0,img.height*.24,img.width,img.height*.66,q.x,q.y-24,w,h);
}
