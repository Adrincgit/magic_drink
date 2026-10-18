import {groundY,surfaceY} from '../world/adventureTerrain';
import {cornKingDrawing,cornKingMuzzle} from '../actors/bosses/cornfieldKing';
import {paintMagicLight} from './projectileLightsCanvas';
import {drawChargeStreak} from './chargeEnergyCanvas';
const root='/arcade/act-two/cornfield-v2/';
const actors='/arcade/act-two/cornfield-cartoon-v3/';
export function cornfieldArtPaths(){
 const paths={};for(const name of ['king','harvest','king-walk','harvest-walk','imp','flock'])paths['corn-'+name]=actors+name+'.webp';
 for(let i=0;i<6;i++)paths['corn-prop-'+i]=root+'prop-'+i+'.webp';return paths;
}
function image(c,img,x,y,w,h,flip=false){if(!img)return;c.save();c.translate(x,y);if(flip)c.scale(-1,1);c.drawImage(img,-w/2,-h,w,h);c.restore();}
function cel(c,art,key,frame,x,y,size,flip=false,center=false,angle=0){
 const img=art[key];if(!img)return;const side=img.width/4;c.save();c.translate(x,y);c.rotate(angle);if(flip)c.scale(-1,1);
 const drawSize=key==='corn-flock'?size*4/3:size;
 c.drawImage(img,frame%4*side,Math.floor(frame/4)*side,side,side,-drawSize/2,center?-drawSize/2:-drawSize*.975,drawSize,drawSize);c.restore();
}
export function drawCornDepth(c,s,art,reduced){
 // Hills at .085 belong to the existing panorama. Farm silhouettes and the
 // first crop bank move separately, ahead of it and behind the playable row.
 const farm=art['corn-prop-2'];
 for(let i=Math.floor(s.camera.x*.28/1000)-1;i<=Math.floor(s.camera.x*.28/1000)+2;i++){
  c.save();c.filter='brightness(.8) saturate(.75)';image(c,farm,i*1000+400-s.camera.x*.28,340,520,205,i%2===0);c.restore();
 }
 const img=art['corn-prop-1'];
 for(let i=Math.floor(s.camera.x*.56/260)-1;i<Math.floor(s.camera.x*.56/260)+6;i++){
  image(c,img,i*260-s.camera.x*.56,470,300,158+(i%3)*12,i%2===0);
 }
 if(reduced)return;
 // Drifting painted husks supply movement without drawing geometric lines.
 for(let i=0;i<12;i++){
  const x=((i*173+s.time*(12+i%3*3)-s.camera.x*.45)%1160+1160)%1160-100,y=125+(i*67)%280+Math.sin(s.time+i)*13;
  c.save();c.globalAlpha=.25;c.translate(x,y);c.rotate(Math.sin(s.time*.4+i));image(c,art['corn-prop-5'],0,0,16,22,i%2===0);c.restore();
 }
}
function plants(c,s,art,x,h,w,variant,reduced,extra=0){
 const y=groundY(s.level.route,x)+18;
 const rustle=s.actTwoAmbushes.some(q=>!q.fired&&q.warning>0&&q.enemies.some(e=>Math.abs(e[0]-x)<210));
 const bend=reduced?0:Math.sin(s.time*(rustle?18:1.6)+x*.017)*(rustle?.08:.018)+extra;
 c.save();c.translate(x,y);c.transform(1,0,bend,1,0,0);image(c,art['corn-prop-'+variant],0,0,w,h,Math.floor(x/200)%2===0);c.restore();
}
export function drawCornScenery(c,s,art,reduced){
 const left=s.camera.x-450,right=s.camera.x+960/(s.camera.zoom||1)+450;
 for(const bed of s.level.cornBeds)for(let x=bed.left;x<bed.right;x+=255){if(x<left||x>right)continue;plants(c,s,art,x,268+(Math.floor(x/255)%3)*18,310,Math.floor(x/255)%2,reduced);}
 for(const q of s.level.cornDecor)if(q.x>left&&q.x<right)image(c,art['corn-prop-'+q.prop],q.x,groundY(s.level.route,q.x)+6,q.w,q.h);
 // A final clearing gives the two forms a clean silhouette, with corn at the
 // edges and the abandoned farm a full plane behind the fighting space.
 if(right>s.level.arena.left){image(c,art['corn-prop-2'],14970,480,1050,400);plants(c,s,art,13810,295,300,0,reduced);plants(c,s,art,15520,295,300,1,reduced);}
}
export function drawCornTerrain(c,s,q,art){
 if(q.cornShed){
  // The roof surface is the collision platform itself; the painted shed hangs
  // underneath instead of suggesting a walkable roof at another height.
  image(c,art['corn-prop-3'],q.x+q.w/2,q.y+205,q.w+24,232);return true;
 }
 if(q.kind!=='earth'&&!q.solid){
  const img=art['river-bridge'];
  if(img){c.drawImage(img,img.width*.12,img.height*.18,img.width*.76,img.height*.66,q.x,q.y-7,q.w,50);return true;}
 }
 if(q.kind!=='earth')return false;
 const img=art['act-two-prop-8'];
 c.save();c.beginPath();c.moveTo(q.x,surfaceY(q,q.x)-7);c.lineTo(q.x+q.w,surfaceY(q,q.x+q.w)-7);c.lineTo(q.x+q.w,1400);c.lineTo(q.x,1400);c.closePath();c.clip();
 c.fillStyle='#322a28';c.fillRect(q.x,Math.min(q.y,q.yEnd??q.y),q.w,1400);
 // Narrow source strips follow both slopes using the collision's surfaceY.
 const from=Math.max(q.x,Math.floor((s.camera.x-20)/16)*16),to=Math.min(q.x+q.w,s.camera.x+960/(s.camera.zoom||1)+20);
 for(let x=from;x<to;x+=16){const width=Math.min(16,q.x+q.w-x),sx=((x%260)+260)%260/260*img.width*.76+img.width*.12;
  c.drawImage(img,sx,0,Math.min(img.width-sx,width/260*img.width*.76),img.height,x,surfaceY(q,x)-8,width+.2,170);
 }c.restore();return true;
}
export function drawCornForeground(c,s,art,reduced){
 const left=s.camera.x-350,right=s.camera.x+960/(s.camera.zoom||1)+350;
 for(const bed of s.level.cornBeds)for(let x=bed.left+120;x<bed.right;x+=430){
  if(x<left||x>right)continue;
  // Keep every nearby opponent, projectile and the player's feet readable.
  let distance=Math.abs(s.player.x-x);
  for(const e of s.enemies)if(e.hp>0&&!e.emerging)distance=Math.min(distance,Math.abs(e.x-x));
  const alpha=.14+.7*Math.min(1,Math.max(0,(distance-85)/200));
  c.save();c.globalAlpha=alpha;const px=x+(x-s.camera.x)*.035;plants(c,s,art,px,230,205,Math.floor(x/430)%2,reduced);c.restore();
 }
}
function leafBurst(c,s,art,q,reduced){
 const t=q.age/q.life,size=q.size||135;
 c.save();c.globalAlpha=Math.min(1,(1-t)*2);cel(c,art,'corn-flock',12+Math.min(3,Math.floor(t*4)),q.x,q.y-20,size+t*45,false,true);c.restore();
 if(reduced)return;
 for(let i=0;i<5;i++){
  const x=q.x+Math.cos(i*2.4)*q.age*100,y=q.y-30-Math.sin(t*Math.PI)*45-i*3;
  c.save();c.globalAlpha=(1-t)*.8;c.translate(x,y);c.rotate(i+q.age*3);image(c,art['corn-prop-5'],0,0,18,23,i%2===0);c.restore();
 }
}
export function drawCornEncounter(c,s,art,reduced){
 const b=s.boss,a=s.level.arena;
 for(const q of s.actTwoAmbushes)if(!q.fired&&q.warning>0)for(const [x,y]of q.enemies){
  paintMagicLight(c,x,y-55,65,'#f4a84b',.14);if(!reduced)for(let i=0;i<3;i++){c.save();c.globalAlpha=.7;image(c,art['corn-prop-5'],x+Math.sin(s.time*4+i)*25,y-80-Math.abs(Math.sin(s.time*3+i))*40,15,23);c.restore();}
 }
 for(const q of s.cornHazards){
  const active=q.age>=q.delay&&!q.rain;
  c.save();c.globalAlpha=active?.95:.3+.16*Math.sin(q.age*20);
  image(c,art['corn-prop-1'],q.x,q.y+8,q.w,active?116:28+Math.sin(q.age*14)*4);c.restore();
  paintMagicLight(c,q.x,q.y-12,active?80:60,'#ffc66c',active?.35:.18);
 }
 for(const q of s.strawPiles)if(q.hp>0){
  c.save();if(q.flash>0)c.filter='brightness(1.7)';image(c,art['act-two-prop-1'],q.x,q.y,110,65);c.restore();
  if(b.phase==='rebuild')for(let i=0;i<4;i++){
   const t=((b.phaseAge*.7+i*.24)%1),x=q.x+(b.x-q.x)*t,y=q.y-25+(b.y-130-q.y+25)*t-Math.sin(t*Math.PI)*80;
   paintMagicLight(c,x,y,36,'#ffc56e',.28);cel(c,art,'corn-flock',8+Math.floor(s.time*10)%4,x,y,28,false,true,Math.atan2(b.y-130-y,b.x-x)-Math.PI);
  }
 }
 for(const q of s.cornBursts)leafBurst(c,s,art,q,reduced);
 if(b.phase==='sleep'||b.phase==='defeated'&&b.defeat?.ready)return;
 const d=cornKingDrawing(s,reduced);
 c.save();c.fillStyle='#241b25aa';c.beginPath();c.ellipse(b.x,a.y+3,b.stage===2?74:53,12,0,0,Math.PI*2);c.fill();
 if(b.flash>0)c.filter='brightness(1.65)';if(b.phase==='dying')c.globalAlpha=Math.min(1,(2.7-b.phaseAge)/.5);
 cel(c,art,d.key,d.frame,b.x+(d.offsetX||0)*(b.dir>0?-1:1),b.y,d.size,b.dir>0);c.restore();
 if(b.phase==='windup'){
  const m=cornKingMuzzle(s),progress=1-b.timer/b.phaseDuration;
  paintMagicLight(c,m.x,m.y,75+progress*35,'#ffc96b',.25+progress*.2);
  if(b.move==='harvest')for(let i=0;i<16;i++){
   const t=(progress*1.2+i/16)%1,angle=i*2.4,from={x:m.x+Math.cos(angle)*220,y:m.y+Math.sin(angle)*150};
   const sample=u=>({x:from.x+(m.x-from.x)*u,y:from.y+(m.y-from.y)*u-Math.sin(u*Math.PI)*20});
   drawChargeStreak(c,[sample(Math.max(0,t-.09)),sample(Math.max(0,t-.04)),sample(t)],.65,reduced);
  }
  if(b.move==='leap'||b.move==='rush'){
   const x=b.move==='leap'?b.targetX:b.rushTo;
   for(let i=0;i<3;i++){c.save();c.globalAlpha=.4;image(c,art['corn-prop-5'],x+(i-1)*33,a.y-7,26,37);c.restore();}
   paintMagicLight(c,x,a.y-8,b.move==='leap'?105:60,'#ffc57b',.24);
  }
 }
 if(b.muzzleTime>0){const m=cornKingMuzzle(s);paintMagicLight(c,m.x,m.y,90,'#ffd18a',.6);}
}
export function drawCornProjectile(c,q,art){
 if(!q.corn)return false;
 const angle=Math.atan2(q.vy,q.vx)-Math.PI;
 paintMagicLight(c,q.x,q.y,65,'#ffbf5f',.3);
 for(let i=3;i>0;i--){c.save();c.globalAlpha=.11*(4-i);cel(c,art,'corn-flock',8+Math.floor(q.age*12)%4,q.x-q.vx*.018*i,q.y-q.vy*.018*i,50-i*5,false,true,angle);c.restore();}
 cel(c,art,'corn-flock',8+Math.floor(q.age*12)%4,q.x,q.y,57,false,true,angle);return true;
}
