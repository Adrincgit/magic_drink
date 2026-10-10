import {groundY} from '../world/adventureTerrain';
import {emberBurnAt} from '../world/adventureEmberTrail';
import {RIVER_TREE_ART} from '../world/riverTreeArt';
import {WOODLAND_EXIT,WOODLAND_RETURN} from './emberComposition';

// Every plant has a fixed world root. The terrain beneath it is never
// resampled at a camera-dependent x; each plane has one rigid transform.
export function woodlandRoot(s,x,depth=1,offset=0){
 const scale=depth*(s.camera.zoom||1),y=groundY(s.level.route,x)+offset;
 return{x:(x-s.camera.x)*scale+480*(1-depth),y:(y-s.camera.y)*scale+330*(1-depth),scale,worldY:y};
}
const stands=[];
for(const [layer,depth]of [.48,.72].entries())for(let i=0;i<70;i++){
 const x=180+i*(layer?550:670)+(i%3-1)*85;
 if(x>29400||x>9850&&x<16000||x>21600&&x<24700)continue;
 stands.push({x,depth,h:(layer?490:540)+i%3*55,key:i%3===1?'river-tree-birch':'forest-tree-2',i:i+layer*101});
}
// These tall edge stands physically hide the narrow panorama join as the
// last trunks pass the camera. The valley itself stays fully opaque.
for(const x of [WOODLAND_EXIT-140,WOODLAND_EXIT,WOODLAND_RETURN,WOODLAND_RETURN+160])stands.push({x,depth:.85,h:565,key:'river-tree-oak',i:Math.floor(x/10)});
export const woodlandStands=()=>stands;
const edgePaintings=new WeakMap();
function edgePainting(img,width,variant,row){
 // Only the three fixed edge sizes use this cache. Pre-scaling prevents
 // clipped atlas resampling from changing pixels as a clump enters view.
 let cache=edgePaintings.get(img);if(!cache){cache=new Map();edgePaintings.set(img,cache);}
 const key=`${width}:${variant}:${row}`;if(cache.has(key))return cache.get(key);
 const frame=document.createElement('canvas');frame.width=width;frame.height=width;
 frame.getContext('2d').drawImage(img,variant*img.width/3,row*img.height/2,img.width/3,img.height/2,0,0,width,width);
 cache.set(key,frame);return frame;
}
export function paintWoodlandBush(c,art,x,y,width,variant,burn=0,edge=false){
 const img=art['forest-shrub-clusters'];if(!img)return;
 const cw=img.width/3,ch=img.height/2,h=width*ch/cw;
 const draw=row=>edge?c.drawImage(edgePainting(img,width,variant%3,row),x-width/2,y-h*.9):c.drawImage(img,variant%3*cw,row*ch,cw,ch,x-width/2,y-h*.9,width,h);
 c.save();const alpha=c.globalAlpha;
 if(burn<1){c.globalAlpha=alpha*(1-burn);draw(0);}
 if(burn>0){c.globalAlpha=alpha*burn;draw(1);}c.restore();
}
export function drawWoodlandPlanes(c,s,art){
 if(s.fortInside)return;
 for(const q of stands){
  const root=woodlandRoot(s,q.x,q.depth,8),height=q.h*root.scale;
  if(root.x+height*.65<0||root.x-height*.65>960)continue;
  const burn=emberBurnAt(q.x),charred=burn>.55,key=charred?'forest-tree-'+(4+q.i%3):q.key,img=art[key];
  const width=height*img.width/img.height,pivot=RIVER_TREE_ART[key]?.rootX??.5;
  c.save();c.translate(root.x,root.y);if(q.i%2)c.scale(-1,1);
  c.drawImage(img,-width*pivot,-height*.977,width,height);c.restore();
  paintWoodlandBush(c,art,root.x,root.y+9*root.scale,Math.max(Math.min(width*.8,290*root.scale),150*root.scale),q.i,burn);
 }
}
// Staggered clumps cross the rear soil edge instead of forming a straight
// decorative strip. Their bases share the ground's world transform.
export function drawWoodlandEdge(c,s,art,left,right){
 for(let i=Math.floor(left/155)-2;i*155<right+220;i++){
  const x=Math.round(i*155+Math.sin(i*2.17)*45);
  if(x<0||s.level.emberPits.some(p=>x>p.x-90&&x<p.x+p.w+90))continue;
  const burn=emberBurnAt(x),width=210+(i%3+3)%3*30,y=Math.round(groundY(s.level.route,x)-38+Math.sin(i*1.81)*13);
  const slope=(groundY(s.level.route,x+width*.4)-groundY(s.level.route,x-width*.4))/(width*.8);
  c.save();c.translate(x,y);c.transform(1,slope,0,1,0,0);paintWoodlandBush(c,art,0,0,width,(i%3+3)%3,burn,true);c.restore();
 }
}
