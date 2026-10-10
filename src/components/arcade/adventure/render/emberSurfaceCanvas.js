import {groundY} from '../world/adventureTerrain';
import {emberBurnAt} from '../world/adventureEmberTrail';
import {drawEmberAir} from './emberBackgroundCanvas';

const TILE_WIDTH=1200,TILE_HEIGHT=200,REAR=68;
const floorTiles=new WeakMap();
const rootCovers=new WeakMap();
export function forestRootCover(img,variant){
 let cache=rootCovers.get(img);if(!cache){cache=[];rootCovers.set(img,cache);}if(cache[variant])return cache[variant];
 const c=document.createElement('canvas');c.width=Math.floor(img.width/3);c.height=img.height;const g=c.getContext('2d');
 g.drawImage(img,variant*img.width/3,0,img.width/3,img.height,0,0,c.width,c.height);g.globalCompositeOperation='destination-in';
 const horizontal=g.createLinearGradient(0,0,c.width,0);horizontal.addColorStop(0,'#0000');horizontal.addColorStop(.12,'#000');horizontal.addColorStop(.88,'#000');horizontal.addColorStop(1,'#0000');
 g.fillStyle=horizontal;g.fillRect(0,0,c.width,c.height);
 const bottom=g.createLinearGradient(0,c.height*.63,0,c.height);bottom.addColorStop(0,'#000');bottom.addColorStop(1,'#0000');g.fillStyle=bottom;g.fillRect(0,0,c.width,c.height);
 cache[variant]=c;return c;
}
function paintedFloor(art,tile){
 let cache=floorTiles.get(art);if(!cache){cache=new Map();floorTiles.set(art,cache);}
 if(cache.has(tile))return cache.get(tile);
 const canvas=document.createElement('canvas');canvas.width=TILE_WIDTH;canvas.height=TILE_HEIGHT;
 const paint=(g,img)=>{g.save();if(tile%2){g.translate(TILE_WIDTH,0);g.scale(-1,1);}g.drawImage(img,0,0,TILE_WIDTH,TILE_HEIGHT);g.restore();};
 const c=canvas.getContext('2d');paint(c,art['forest-grass-floor']||art['forest-path-0']);
 // Continuous world-coordinate masks keep the joins between tiles invisible.
 for(const [key,opacity]of [['forest-path-0',x=>Math.min(1,Math.max(0,(x-4200)/6500))],['forest-path-1',emberBurnAt]]){
  const layer=document.createElement('canvas');layer.width=TILE_WIDTH;layer.height=TILE_HEIGHT;
  const g=layer.getContext('2d');paint(g,art[key]);
  const fade=g.createLinearGradient(0,0,TILE_WIDTH,0);
  for(let i=0;i<=4;i++)fade.addColorStop(i/4,`rgba(0,0,0,${opacity((tile+i/4)*TILE_WIDTH)})`);
  g.globalCompositeOperation='destination-in';g.fillStyle=fade;g.fillRect(0,0,TILE_WIDTH,TILE_HEIGHT);c.drawImage(layer,0,0);
 }
 cache.set(tile,canvas);return canvas;
}
// A painted 2D surface moves at the same speed at its front and back.
// No scanlines, vanishing point, or camera-dependent terrain samples.
export function drawForestFloor(c,s,art){
 if(s.fortInside)return;
 const zoom=s.camera.zoom||1,left=s.camera.x-5,right=s.camera.x+970/zoom;
 c.save();c.scale(zoom,zoom);c.translate(-s.camera.x,-s.camera.y);
 for(const route of s.level.route){
  const start=Math.max(left,route.x),end=Math.min(right,route.x+route.w);if(end<=start)continue;
  const slope=((route.yEnd??route.y)-route.y)/route.w;
  c.save();c.translate(route.x,route.y);c.transform(1,slope,0,1,0,0);
  c.beginPath();c.rect(start-route.x,-REAR,end-start+1,1800);c.clip();
  for(let tile=Math.floor(start/TILE_WIDTH);tile*TILE_WIDTH<end;tile++){
   const x=tile*TILE_WIDTH,paint=paintedFloor(art,tile);
   for(let y=-REAR;y<1400;y+=TILE_HEIGHT){
    c.drawImage(paint,x-route.x,y,TILE_WIDTH,TILE_HEIGHT+1);
   }
  }
  c.restore();
 }
 // Low vegetation is rooted along the rear edge and hides the panorama seam.
 const rear=art['forest-understory-0'],burnt=art['forest-understory-1'];
 const width=620,height=rear?width*rear.height/rear.width:0;
 if(rear&&burnt)for(let i=Math.floor(left/width)-1;i*width<right;i++){
  const x=i*width,y=groundY(s.level.route,Math.max(0,x)),end=groundY(s.level.route,Math.max(0,x+width));
  c.save();c.translate(x,y-REAR+12);c.transform(1,(end-y)/width,0,1,0,0);
  const burn=emberBurnAt(x+width/2);
  c.globalAlpha=1-burn;c.drawImage(rear,0,-height,width,height);c.globalAlpha=burn;c.drawImage(burnt,0,-height,width,height);c.restore();
 }
 for(const pit of s.level.emberPits){
  if(pit.x+pit.w<left||pit.x>right)continue;
  const mid=pit.x+pit.w/2,y=groundY(s.level.route,mid),burn=emberBurnAt(mid),h=(pit.y-y+36)/.68;
  const slope=(groundY(s.level.route,pit.x+pit.w)-groundY(s.level.route,pit.x))/pit.w;
  c.save();c.translate(mid,pit.y-h*.72);c.transform(1,slope,0,1,0,0);
  c.filter=`saturate(${1-burn*.4}) brightness(${1-burn*.25})`;
  if(art['forest-hollow'])c.drawImage(art['forest-hollow'],-pit.w/2-45,0,pit.w+90,h);
  c.restore();
 }
 c.restore();
}

// Small outcrops use the same world coordinates as their collision surfaces.
export function drawForestTerrain(c,s,q,art){
 if(q.kind!=='stone')return;
 const h=Math.max(65,(groundY(s.level.route,q.x+q.w/2)-q.y+16)/.78),variant=Math.floor(q.x/1000)%2*2,burn=emberBurnAt(q.x);
 c.drawImage(art['forest-outcrop-'+variant],q.x-35,q.y-h*.22,q.w+70,h);
 if(burn>0){c.save();c.globalAlpha=burn;c.drawImage(art['forest-outcrop-'+(variant+1)],q.x-35,q.y-h*.22,q.w+70,h);c.restore();}
}
export function drawEmberForeground(c,s,art,reduced=false){
 if(s.fortInside)return;
 drawEmberAir(c,s,art,reduced);
}
