import {drawForestFloor} from './emberSurfaceCanvas';
import {drawEmberBackgroundLife,drawEmberGroundMist} from './emberBackgroundCanvas';
import {drawWoodlandPlanes,woodlandRoot,paintWoodlandBush} from './emberWoodlandLayers';
import {drawEmberWildlife} from './emberWildlifeCanvas';
export {forestPlaneRoot,emberPlanePosition} from './emberForestProjection';
import {emberTreeFrame} from '../engine/adventureEmberEnvironment';
import {groundY} from '../world/adventureTerrain';
import {painted,energyGlow} from './paintedDuelCanvas';
import {drawWaterDetail} from './paintedWaterCanvas';
export function drawEmberDepth(c,s,art,reduced=false){
 if(s.fortInside)return;
 drawEmberBackgroundLife(c,s,art,reduced);
 drawWoodlandPlanes(c,s,art);
 drawScenicFallingTrees(c,s,art,reduced);
 drawForestFloor(c,s,art);
 drawEmberGroundMist(c,s,art,reduced);
}
export function drawEmberHazards(c,s,art,reduced=false){
 if(s.fortInside)return;
 drawEmberWildlife(c,s,art,reduced);
 const width=960/(s.camera.zoom||1),time=reduced?0:s.fxTime;
 const bush=art['ember-bushes'],cw=bush.width/4;
 for(const q of s.emberEnvironment?.bushes||[]){
  if(q.x<s.camera.x-100||q.x>s.camera.x+width+100)continue;
  const frame=q.state==='charred'?3:q.state==='burning'?Math.min(2,1+Math.floor(q.age/2.5)):0;
  const slope=(groundY(s.level.route,q.x+62)-groundY(s.level.route,q.x-62))/124;
  c.save();c.translate(q.x,q.y+4);c.transform(1,slope,0,1,0,0);
  c.drawImage(bush,frame*cw,0,cw,bush.height,-62,-88*306/384,124,88);c.restore();
  if(q.state==='burning'){
   const flare=q.age<.65,strength=q.fireVisualStrength??q.fireStrength??1,soaked=.25+.75*strength;
   energyGlow(c,true,q.x,q.y-35*soaked,140*soaked,(flare?.9:.45)*strength);
   painted(c,art,'fire-show',8+Math.floor(time*24+q.seed)%8,q.x,q.y,(flare?220:160)*(.7+.3*strength),(flare?220:150)*soaked,0,Math.min(1,(7-q.age)/.6)*(.5+.5*strength),.5,205/256);
  }
 }
 for(const pit of s.emberEnvironment?.pits||s.level.emberPits){
  if(pit.quenched)continue;
  if(pit.x+pit.w<s.camera.x-100||pit.x>s.camera.x+width+100)continue;
  c.save();
  for(let i=0;i<3;i++){
   const x=pit.x+35+i*(pit.w-70)/2;
   const strength=pit.fireVisualStrength??pit.fireStrength??1;
   painted(c,art,'fire-show',8+Math.floor(time*12+i)%8,x,pit.y,62*strength,82*strength,0,.87,.5,205/256);
  }
  c.restore();
 }
}
export const scenicTreeRoot=(s,q)=>woodlandRoot(s,q.x,.72,-14);
function drawScenicFallingTrees(c,s,art,reduced){
 const time=reduced?0:s.fxTime;
 for(const q of s.emberEnvironment?.trees||[]){
  const root=scenicTreeRoot(s,q);
  if(q.phase==='spent'||root.x+q.h*root.scale<0||root.x-q.h*root.scale>960)continue;
  const img=art['forest-falling-tree-frames'],frame=emberTreeFrame(q),scale=q.h/480;
  const slope=(groundY(s.level.route,q.x+q.dir*q.h*.8)-groundY(s.level.route,q.x))/(q.dir*q.h*.8);
  const settle=q.phase==='fallen'?1:q.phase==='falling'?Math.max(0,(q.age-.7)/.35):0;
  c.save();c.translate(root.x,root.y);c.scale(root.scale,root.scale);c.translate(-q.x,-q.y);
  c.save();c.translate(q.x,q.y);c.fillStyle='#160e0d45';c.beginPath();c.ellipse(0,0,85,11,0,0,Math.PI*2);c.fill();c.transform(1,slope*settle,0,1,0,0);c.scale(q.dir,1);
  c.drawImage(img,frame%4*768,Math.floor(frame/4)*640,768,640,-250*scale,-600*scale,768*scale,640*scale);c.restore();
  if(q.burning){
   const fallen=q.phase==='fallen',x=q.x+(fallen?q.dir*q.h*.34:0),y=q.y-(fallen?30:q.h*.42);
   energyGlow(c,true,x,y,fallen?160:210,.2+Math.sin(time*8)*.035);
   for(let j=0;j<3;j++)painted(c,art,'fire-show',8+Math.floor(time*16+j)%8,q.x+(fallen?q.dir*q.h*(.15+j*.22):Math.sin(j)*28),q.y+(fallen?q.dir*q.h*(.15+j*.22)*slope-12:-q.h*(.12+j*.21)),fallen?120:145,fallen?135:190,0,.85,.5,205/256);
  }
  if(q.phase==='warning'){
   // Small painted charcoal/fire fragments fall from the actual leaning crown.
   for(let i=0;i<3;i++){const age=(q.age*.8+i*.31)%1;painted(c,art,'fire-show',Math.floor(time*12+i)%8,q.x+Math.sin(i*2)*37+q.dir*age*16,q.y-q.h*.75+age*q.h*.65,10,17,age,.7*(1-age));}
  }
  paintWoodlandBush(c,art,q.x,q.y+9,125,q.art,1);
  c.restore();
 }
}
export function drawHexyHeat(c,s,art,reduced=false){
 const p=s.player;if(!s.level.emberTrail||p.heat<.5||p.hitReact||p.knockdown||s.playerDefeat||p.heatIdle>.65||p.dash)return;
 const age=reduced?.15:s.time%2.6;if(age>.65)return;
 const alpha=Math.sin(age/.65*Math.PI)*p.heat*.85;
 drawWaterDetail(c,art,0,0,p.x+p.dir*13,p.y-65+age*14,7,10,0,alpha);
}
