import {groundY} from '../world/adventureTerrain';
export {nightmareGatePlacement,drawNightmareSideGate} from './nightmareGateCanvas';
const mod=(n,d)=>((n%d)+d)%d;
export const NIGHTMARE_PLANES=[
 {key:'depth-mountains-v2',depth:.10,root:315,height:180},
 {key:'depth-woods-v2',depth:.27,root:370,height:135},
 {key:'depth-bank-v2',depth:.55,root:448,height:285},
];
export const nightmarePlaneX=(camera,x,depth)=>x-camera*depth;
// Backdrop planes keep their authored vertical position. Only world scenery
// touches the traversable floor, and that scenery uses the full camera transform.
export const nightmarePlanePosition=(camera,x,plane)=>({x:nightmarePlaneX(camera.x,x,plane.depth),y:plane.root});
function rooted(c,img,x,y,h,flip=false){const w=h*img.width/img.height;c.save();c.translate(x,y);if(flip)c.scale(-1,1);c.drawImage(img,-w/2,-h,w,h);c.restore();}
function sheet(c,img,frame,x,y,size){c.drawImage(img,frame%4*256,Math.floor(frame/4)*256,256,256,x-size/2,y-size*250/256,size,size);}
function cemeteryFloorTile(art,x,start){
 const transition=x<start+230&&x+960>start-80,flip=mod(Math.floor(x/960),2),key=transition?x:'full-'+flip,cache=art.nightmareFloorTiles||(art.nightmareFloorTiles=new Map());
 if(cache.has(key))return cache.get(key);
 const tile=document.createElement('canvas');tile.width=960;tile.height=1040;const c=tile.getContext('2d');
 c.save();if(flip){c.translate(960,0);c.scale(-1,1);}for(let y=0;y<1040;y+=360)c.drawImage(art['nightmare-cemetery-path-v2'],0,y,960,360);c.restore();
 c.globalCompositeOperation='destination-in';const top=c.createLinearGradient(0,0,0,95);top.addColorStop(0,'#0000');top.addColorStop(1,'#000');c.fillStyle=top;c.fillRect(0,0,960,1040);
 if(transition){const edge=c.createLinearGradient(start-80-x,0,start+230-x,0);edge.addColorStop(0,'#0000');edge.addColorStop(1,'#000');c.fillStyle=edge;c.fillRect(0,0,960,1040);}
 cache.set(key,tile);return tile;
}
function bankEntrance(art){
 if(art.nightmareBankEntrance)return art.nightmareBankEntrance;
 const img=art['nightmare-cemetery-bank-v2'],tile=document.createElement('canvas');tile.width=img.width;tile.height=img.height;const c=tile.getContext('2d');c.drawImage(img,0,0);
 c.globalCompositeOperation='destination-in';const edge=c.createLinearGradient(0,0,img.width*.22,0);edge.addColorStop(0,'#0000');edge.addColorStop(1,'#000');c.fillStyle=edge;c.fillRect(0,0,img.width,img.height);art.nightmareBankEntrance=tile;return tile;
}
function band(c,img,offset,root,h,{start=-Infinity,fill=null,entrance=null}={}){
 const w=h*img.width/img.height,first=Math.max(Number.isFinite(start)?0:-Infinity,Math.floor((offset-start)/w));
 const origin=Number.isFinite(start)?start:0,index=Number.isFinite(start)?first:Math.floor(offset/w);
 for(let i=index;i*w+origin-offset<970;i++){
  const x=i*w+origin-offset;c.save();if(i%2){c.translate(x+w,root-h);c.scale(-1,1);}else c.translate(x,root-h);c.drawImage(i===0&&entrance?entrance:img,0,0,w+1,h);
  if(fill){if(i===0&&entrance){const edge=c.createLinearGradient(0,0,w*.22,0);edge.addColorStop(0,'#34384100');edge.addColorStop(1,fill);c.fillStyle=edge;}else c.fillStyle=fill;c.fillRect(0,h-1,w+1,600);}c.restore();
 }
}
export function drawNightmareDepth(c,s,art){
 c.save();c.filter='brightness(.72) saturate(.64)';c.drawImage(art['sunset-sky'],0,-40,960,580);c.restore();
 band(c,art['nightmare-depth-clouds-v2'],s.camera.x*.045+s.fxTime*4,205,180);
 for(const p of NIGHTMARE_PLANES)band(c,art['nightmare-'+p.key],s.camera.x*p.depth,p.root,p.height,{fill:p.depth===.55?'#343841':null});
 // Each closer landscape carries its own opaque earth. Its tree bases and
 // headstones cannot drift away from that ground during camera elevation.
 band(c,art['nightmare-cemetery-bank-v2'],s.camera.x*.72,455,365,{start:(s.level.cemeteryStart-180)*.72,fill:'#343841',entrance:bankEntrance(art)});
}
export function drawNightmareTrees(c,s,art){
 // Decorative trees belong to the painted banks, with their own ground and
 // distant palette. Only climbable trees are planted in the walking plane.
 const width=960/(s.camera.zoom||1);c.save();c.filter='saturate(.52) brightness(.82) contrast(.88)';
 for(const q of s.level.branchTrees){if(q.x+300<s.camera.x||q.x-300>s.camera.x+width)continue;rooted(c,art['nightmare-branch-trunk'],q.x,q.y,q.h);}c.restore();
}
export function drawNightmareTerrain(c,s,q,art){
 if(q.kind==='earth'){
  const img=art['nightmare-path'],h=400,w=h*img.width/img.height,slope=((q.yEnd??q.y)-q.y)/q.w;
  const width=q.w;
  c.save();c.translate(q.x,q.y);c.transform(1,slope,0,1,0,0);c.fillStyle='#24232c';c.fillRect(0,95,width,800);c.beginPath();c.rect(0,-290,width,1200);c.clip();
  for(let x=Math.floor(q.x/w)*w;x<q.x+q.w;x+=w){c.drawImage(img,x-q.x,-290,w+1,h);for(let y=108;y<850;y+=125)c.drawImage(img,0,img.height*.7,img.width,img.height*.3,x-q.x,y,w+1,127);}
  // The broad walking plane remains intact; flat slate and moss establish
  // the cemetery beyond the gate, blending only along this terrain seam.
  const from=Math.max(q.x,s.level.cemeteryStart-80),end=q.x+q.w;
  if(end>from){const tw=960;
   for(let x=Math.floor(from/tw)*tw;x<end;x+=tw){
    const a=Math.max(x,from),b=Math.min(x+tw,end);
    c.save();c.beginPath();c.rect(a-q.x,-165,b-a,1040);c.clip();
    c.drawImage(cemeteryFloorTile(art,x,s.level.cemeteryStart),x-q.x,-165);c.restore();
   }
  }c.restore();return;
 }
 if(q.kind==='nightmare-branch'){
  if(q.gone&&q.fallAge>1.1)return;
  const falling=q.gone,age=q.fallAge||0,img=art['nightmare-bough'],b=q.paint,stress=Math.max(0,((q.crackAge||0)-q.breakAfter*.65)/(q.breakAfter*.35)),shake=q.loaded&&!falling?Math.sin(s.time*45)*stress*2.2:0;
  c.save();c.filter='saturate(.52) brightness(.82) contrast(.88)';c.translate(b.x+b.w/2,b.y+b.h/2+shake+(falling?age*age*230:0));if(falling){c.rotate(age*(q.side||1)*1.5);c.globalAlpha=1-age/1.1;}if(q.side<0)c.scale(-1,1);c.drawImage(img,-b.w/2,-b.h/2,b.w,b.h);c.restore();
 }
}
export function nightmareFogStrength(x,start){const u=Math.max(0,Math.min(1,(x-start+750)/1000));return u*u*(3-2*u);}
export function drawNightmareFog(c,s,art,front=false){
 const img=art['nightmare-mist-v4'];if(!img)return;
 const spacing=820,speed=front?12:7,shift=s.fxTime*speed,view=960/(s.camera.zoom||1),first=Math.floor((s.camera.x+shift)/spacing)-1;
 for(let i=first;i*spacing-shift<s.camera.x+view+500;i++){
  const x=i*spacing-shift+spacing*.5,strength=nightmareFogStrength(x,s.level.cemeteryStart);if(!strength)continue;
  const y=groundY(s.level.route,x)+(front?48:-46),w=1100,h=front?135:165;
  c.save();c.globalAlpha=strength*(front?.16:.28);if(i%2){c.translate(x,y);c.scale(-1,1);c.drawImage(img,-w/2,-h,w,h);}else c.drawImage(img,x-w/2,y-h,w,h);c.restore();
 }
}
export function drawNightmareTelegraphs(c,s,art,reduced){
 const t=reduced?0:s.fxTime;
 for(const e of s.enemies){
  if(e.capture){const age=e.capture.age;if(age>.42&&age<2.7){c.save();c.globalAlpha=Math.min(1,(age-.42)*3,(2.7-age)*3)*.28;sheet(c,art['nightmare-fx'],Math.floor(t*9)%3,e.x,e.baseY+6,132);c.restore();}}
  if(e.hp<=0&&e.type!==22&&e.type!==24&&e.deathAge>([18,21].includes(e.type)?1.15:.55)){const age=e.deathAge-([18,21].includes(e.type)?1.15:.55);c.save();c.globalAlpha=Math.max(0,1-age/1.1);sheet(c,art['nightmare-fx'],4+Math.min(3,Math.floor(age*4)),e.x,e.y+10,155);c.restore();}
  if(e.type===19&&['vanish','hidden','appear'].includes(e.phase)){
   c.save();c.globalAlpha=.6;sheet(c,art['nightmare-fx'],6+Math.floor(t*8)%2,e.blinkX,e.blinkY+20,90);c.restore();
  }
 }
 if(s.boss.hp>0)for(const q of s.boss.summonSites||[]){c.save();c.globalAlpha=.7;sheet(c,art['nightmare-fx'],4+Math.floor(t*7)%4,q.x,q.y+20,120);c.restore();}
 const b=s.boss;
 if(b.hp>0&&['slamWindup','hauntWindup'].includes(b.phase)){
  c.save();c.strokeStyle='#d9c2f3';c.fillStyle='#a78bc2';c.globalAlpha=.16+Math.min(.16,(b.phaseAge||0)*.15);c.lineWidth=2;
  if(b.phase==='slamWindup'){c.beginPath();c.ellipse(b.x,b.baseY+3,104,14,0,0,Math.PI*2);c.fill();c.stroke();}
  else{const from=b.dashFrom,to=b.dashTo;c.setLineDash([12,12]);c.beginPath();c.moveTo(from,b.baseY-18);c.lineTo(to,b.baseY-18);c.stroke();c.setLineDash([]);c.beginPath();c.ellipse(to,b.baseY,32,8,0,0,Math.PI*2);c.stroke();}
  c.restore();
 }
}
export function drawNightmareForeground(c,s,art){
 if(!s.level.nightmareTrail)return;
 const spacing=800,depth=1.12,start=Math.floor(s.camera.x*depth/spacing)-1;
 for(let i=start;i<start+4;i++){
  const x=nightmarePlaneX(s.camera.x,i*spacing+300,depth);
  c.save();c.filter='blur(2px)';rooted(c,art['nightmare-depth-4'],x,566,118+mod(i,3)*20,i%2===0);c.restore();
 }
}
