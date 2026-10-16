import {actTwoBossDrawing,actTwoBossMuzzle} from '../actors/bosses/adventureActTwoBosses';
import {paintMagicLight} from './projectileLightsCanvas';
const root='/arcade/act-two/';
export function actTwoArtPaths(){
 const paths={};for(const name of ['straw','count','harlequin','enemies','effects'])paths['act-two-'+name]=root+name+'-v1.webp';
 paths['act-two-garden']=root+'garden-v1.webp';
 for(let i=0;i<12;i++)paths['act-two-prop-'+i]=root+'prop-'+i+'-v1.webp';return paths;
}
function cel(c,img,frame,x,y,size,flip=false,center=false,angle=0){
 c.save();c.translate(x,y);c.rotate(angle);if(flip)c.scale(-1,1);const side=img.width/4;c.drawImage(img,frame%4*side,Math.floor(frame/4)*side,side,side,-size/2,center?-size/2:-size*.975,size,size);c.restore();
}
function prop(c,art,i,x,y,w,h,flip=false){const img=art['act-two-prop-'+i];if(!img)return;c.save();c.translate(x,y);if(flip){c.translate(w,0);c.scale(-1,1);}c.drawImage(img,0,0,w,h);c.restore();}
export function drawActTwoBackdrop(c,s,art,reduced){
 const height=650,offset=s.camera.x*.085,y=-90-(s.camera.backdropY??0)*.08;
 const paint=(img,left=0,right=960)=>{
  if(right<=0||left>=960)return;const width=height*img.width/img.height,tile=Math.floor(offset/width);
  c.save();c.beginPath();c.rect(Math.max(0,left),0,Math.min(960,right)-Math.max(0,left),540);c.clip();
  for(let i=tile-1;i<=tile+2;i++){c.save();c.translate(i*width-offset,y);if(i%2){c.translate(width,0);c.scale(-1,1);}c.drawImage(img,0,0,width,height);c.restore();}c.restore();
 };
 c.save();
 if(s.level.maskMansion){const edge=(1700-s.camera.x)*(s.camera.zoom||1);paint(art['act-two-garden'],0,edge);paint(art['world'+s.index],edge,960);}
 else paint(art['world'+s.index]);
 if(s.level.cornfield){
  // Clouds have independent drift; the landscape keeps its own slow parallax.
  const clouds=art['nightmare-depth-clouds-v2'];if(clouds){c.globalAlpha=.12;c.globalCompositeOperation='screen';const w=1300,shift=(s.camera.x*.035+(reduced?0:s.time*4))%w;for(let i=-1;i<2;i++)c.drawImage(clouds,i*w-shift,-100,w,220);}
 }c.restore();
}
export function drawActTwoScenery(c,s,art,reduced){
 const left=s.camera.x-400,right=s.camera.x+960/(s.camera.zoom||1)+400;
 if(s.level.cornfield){
  for(let i=Math.floor(left/240);i<right/240;i++){
   const worldX=i*240+105,x=s.camera.x+(worldX-s.camera.x)*.97,root=480+8,h=160+(Math.abs(i)%3)*18;
   c.save();c.translate(x,root);c.transform(1,0,reduced?0:Math.sin(s.time*1.2+i)*.022,1,0,0);prop(c,art,0,-145,-h,290,h,i%2===0);c.restore();
  }
 }else if(s.level.maskMansion){
  prop(c,art,9,1675,-360,50,1050);
  for(const x of [550,1560,3370,4330,5890,6950]){if(x<left||x>right)continue;const floor=s.level.platforms.find(q=>q.kind==='earth'&&x>=q.x&&x<q.x+q.w)?.y??480;prop(c,art,6,x-55,floor-175,110,175);}
 }
}
export function drawActTwoTerrain(c,s,q,art){
 if(q.gone)return;
 if(q.kind==='earth'){
  const img=art['act-two-prop-'+(s.level.cornfield?8:s.level.maskMansion?9:10)],h=s.level.cornfield?190:185,w=h*img.width/img.height;
  c.save();c.beginPath();c.rect(q.x,q.y-8,q.w,1200);c.clip();
  c.fillStyle=s.level.world.soil[1];c.fillRect(q.x,q.y,q.w,1200);
  for(let x=Math.floor(q.x/w)*w;x<q.x+q.w;x+=w){
   c.save();c.translate(x-.5,q.y);if(Math.abs(Math.round(x/w))%2){c.translate(w,0);c.scale(-1,1);}
   if(s.level.cornfield)c.drawImage(img,img.width*.12,32,img.width*.76,img.height-34,0,0,w+1,h);
   c.drawImage(img,img.width*.12,0,img.width*.76,img.height,0,s.level.cornfield?-8:0,w+1,h);c.restore();
  }
  c.restore();return;
 }
 if(q.dream){c.save();c.shadowColor='#8fdfff';c.shadowBlur=14;prop(c,art,10,q.x,q.y,q.w,40);c.restore();return;}
 const h=q.h>30?q.h:q.art===6?95:q.art===5?115:70,top=q.art===5?.49:q.art===2?.2:q.art===6?.5:0;
 c.save();if(q.flash>0)c.filter='brightness(1.7)';prop(c,art,q.art??5,q.x,q.y-h*top,q.w,h*(1+top));c.restore();
 // A narrow matching ledge registers the walkable surface with the artwork.
 if(q.art===5||q.art===6)prop(c,art,9,q.x,q.y,q.w,17);
}
export function drawActTwoEncounter(c,s,art,reduced){
 const b=s.boss,a=s.level.arena;
 for(const q of s.strawPiles){if(q.hp<=0)continue;prop(c,art,1,q.x-54,q.y-65,108,65);if(b.phase==='rebuild'){
  const t=(b.phaseAge*.65+q.x*.003)%1,x=q.x+(b.x-q.x)*t,y=q.y-30+(b.y-100-q.y+30)*t-Math.sin(t*Math.PI)*70;paintMagicLight(c,x,y,42,'#ffc86b',.35);cel(c,art['act-two-effects'],Math.floor(s.time*8)%4,x,y,44,false,true,Math.atan2(b.y-100-y,b.x-x)+Math.PI);
 }}
 for(const q of s.dreamMirrors){if(q.hp<=0)continue;c.save();if(q.flash)c.filter='brightness(2)';prop(c,art,11,q.x-42,q.y-q.h,84,q.h);c.restore();paintMagicLight(c,q.x,q.y-65,75,'#77deff',.25);}
 for(const q of s.dreamHazards){if(q.safe)continue;
  const active=q.age>=q.delay;c.save();c.globalAlpha=active?.8:.35+.15*Math.sin(q.age*15);c.fillStyle=active?'#8624b988':'#8ccfff44';c.fillRect(q.x,q.y-5,q.w,8);c.strokeStyle='#d9c8ff';c.setLineDash(active?[]:[12,12]);c.strokeRect(q.x,q.y-8,q.w,9);c.restore();
  if(active)for(let x=q.x+30;x<q.x+q.w;x+=70)cel(c,art['act-two-effects'],12+Math.floor(s.time*9)%4,x,q.y-18,66,false,true,-Math.PI/2);
 }
 for(const q of s.actTwoAmbushes)if(!q.fired&&q.warning>0){const x=q.enemies[0][0];c.save();c.globalAlpha=.35+.3*Math.sin(s.time*20);paintMagicLight(c,x,q.enemies[0][1]-45,85,'#ffcb66',.4);prop(c,art,s.level.cornfield?0:11,x-35,q.enemies[0][1]-85,70,85);c.restore();}
 if(b.phase==='sleep'||b.phase==='defeated'&&b.defeat?.ready)return;
 const drawing=actTwoBossDrawing(s,reduced);
 c.save();if(b.phase==='dying')c.globalAlpha=Math.min(1,Math.max(0,(2.7-b.phaseAge)/.5));if(b.flash>0)c.filter='brightness(1.6)';
 if(b.phase==='swarm'){
  for(let i=0;i<5;i++){const t=b.clock*3+i*1.4;cel(c,art['act-two-effects'],8+Math.floor(b.clock*9+i)%4,b.x+Math.cos(t)*75,b.y-70+Math.sin(t)*60,70,false,true);}
 }else cel(c,art[drawing.key],drawing.frame,b.x,b.y,drawing.size,b.dir>0);
 c.restore();
 if(b.muzzleTime>0){const m=actTwoBossMuzzle(s);paintMagicLight(c,m.x,m.y,95,s.level.cornfield?'#ffc15d':'#6fdfff',.6);cel(c,art['act-two-effects'],s.level.cornfield?0:4,m.x,m.y,54,b.dir>0,true);}
 if(b.phase==='windup'&&b.move==='rush'){
  c.save();c.globalAlpha=.5;c.strokeStyle='#cdb6ff';c.lineWidth=3;c.setLineDash([16,12]);c.beginPath();c.moveTo(b.x,a.y-5);c.lineTo(Math.max(a.left+100,Math.min(a.right-100,b.x+b.attackDir*395)),a.y-5);c.stroke();c.restore();
 }
}
export function drawActTwoProjectile(c,q,art){
 if(!q.actTwo)return false;if(q.life<=0)return true;
 if(q.kind==='act-two-slash'){
  c.save();c.strokeStyle='#d1e8ff';c.lineWidth=5;c.beginPath();c.arc(q.x,q.y,32,-1.3,1.3);c.stroke();c.restore();return true;
 }
 const row=q.kind==='act-two-straw'?0:q.kind==='act-two-orb'?4:q.kind==='act-two-bat'?8:12,angle=row===8?0:Math.atan2(q.vy,q.vx)-Math.PI;
 paintMagicLight(c,q.x,q.y,row===8?40:80,row===0?'#ffc167':'#7ecbff',row===8?.15:.4);
 cel(c,art['act-two-effects'],row+Math.floor(q.age*11)%4,q.x,q.y,row===0?78:row===8?60:84,false,true,angle);return true;
}
export function drawActTwoDust(c,s,art){
 for(const q of s.actTwoDust){c.save();c.globalAlpha=(1-q.age/q.life)*.5;c.filter=s.level.cornfield?'sepia(.45)':'saturate(.3)';const img=art['impact-smoke'];if(img)cel(c,img,Math.min(3,Math.floor(q.age/.1)),q.x,q.y-4,q.size+q.age*36,false,true);c.restore();}
 for(const q of s.actTwoDebris){c.save();c.globalAlpha=Math.min(1,(q.life-q.age)*4);c.translate(q.x,q.y);c.rotate(q.rotation);prop(c,art,q.art,-16,-13,32,26);c.restore();}
}
