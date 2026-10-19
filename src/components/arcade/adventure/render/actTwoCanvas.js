import {episodeTwoArtPaths,drawCastleBackdrop,drawEpisodeScenery,drawEpisodeSlope,episodeCel} from './episodeTwoCanvas';
import {actTwoBossDrawing,actTwoBossMuzzle} from '../actors/bosses/adventureActTwoBosses';
import {paintMagicLight} from './projectileLightsCanvas';
import {nightmareGameWarnings} from '../actors/bosses/nightmareGames';
import {drawNightmareVortex} from './nightmareEnergyCanvas';
import {drawNightmareRefraction,drawNightmareAfterimages} from './nightmareIllusionCanvas';
import {NIGHTMARE_STAFF_TIPS} from '../actors/bosses/nightmareStormRegistration';
import {nightmareSpritePoint} from '../actors/bosses/nightmareDrawing';
import {drawNightmareMote} from './nightmareMotesCanvas';
import {nightmareStormFrame,nightmareFX} from './nightmarePaintedFX';
import {nightmareStaffHidden} from '../actors/bosses/nightmareStaffCombo';
import {drawNightmareSlam,drawNightmareForceWind,drawNightmareStaffContact} from './nightmareComboCanvas';
import {drawRingContactShadow} from './grandRingFloor';
import {drawNightmareBlast} from './nightmareBlastCanvas';
import {cornfieldArtPaths,drawCornDepth,drawCornScenery,drawCornTerrain,drawCornEncounter,drawCornProjectile} from './cornfieldCanvas';
const root='/arcade/act-two/';
export function actTwoArtPaths(){
 const paths={...cornfieldArtPaths(),...episodeTwoArtPaths()};for(const name of ['straw','count','harlequin','enemies','effects'])paths['act-two-'+name]=root+name+'-v1.webp';
 paths['act-two-harlequin']='/arcade/act-two/episode-two-v1/harlequin.webp';paths['act-two-count']='/arcade/act-two/episode-two-v1/couple.webp';
 paths['act-two-garden']=root+'garden-v1.webp';
 for(let i=0;i<12;i++)paths['act-two-prop-'+i]=root+'prop-'+i+'-v1.webp';return paths;
}
function cel(c,img,frame,x,y,size,flip=false,center=false,angle=0){
 c.save();c.translate(x,y);c.rotate(angle);if(flip)c.scale(-1,1);const side=img.width/4,crop=[frame%4*side,Math.floor(frame/4)*side,side,side];
 c.drawImage(img,...crop,-size/2,center?-size/2:-size*.975,size,size);c.restore();
}
function prop(c,art,i,x,y,w,h,flip=false){const img=art['act-two-prop-'+i];if(!img)return;c.save();c.translate(x,y);if(flip){c.translate(w,0);c.scale(-1,1);}c.drawImage(img,0,0,w,h);c.restore();}
export function drawActTwoBackdrop(c,s,art,reduced){
 if(drawCastleBackdrop(c,s,art,reduced)){drawNightmareRefraction(c,s,reduced);return;}
 const height=650,offset=s.camera.x*.085,y=-90-(s.camera.backdropY??0)*.08;
 const paint=(img,left=0,right=960)=>{
  if(right<=0||left>=960)return;const width=height*img.width/img.height,tile=Math.floor(offset/width);
  c.save();c.beginPath();c.rect(Math.max(0,left),0,Math.min(960,right)-Math.max(0,left),540);c.clip();
  for(let i=tile-1;i<=tile+2;i++){c.save();c.translate(i*width-offset,y);if(i%2){c.translate(width,0);c.scale(-1,1);}c.drawImage(img,0,0,width,height);c.restore();}c.restore();
 };
 c.save();
 if(s.level.maskMansion){const edge=s.level.castleCircus?960:(1700-s.camera.x)*(s.camera.zoom||1);paint(art['act-two-garden'],0,edge);paint(art['world'+s.index],edge,960);}
 else if(s.level.cornfield&&art['episode-corn-sunset']){
  paint(art['episode-corn-sunset']);const reveal=s.episodeTwo?.sunsetReveal||0;
  if(reveal>0&&art['episode-corn-night']){c.save();c.globalAlpha=reveal;paint(art['episode-corn-night']);c.restore();}
 }else paint(art['world'+s.index]);
 if(s.level.cornfield){
  // Clouds have independent drift; the landscape keeps its own slow parallax.
  const clouds=art['nightmare-depth-clouds-v2'];if(clouds){c.save();c.globalAlpha=.12;c.globalCompositeOperation='screen';const w=1300,shift=(s.camera.x*.035+(reduced?0:s.time*4))%w;for(let i=-1;i<2;i++)c.drawImage(clouds,i*w-shift,-100,w,220);c.restore();}
  drawCornDepth(c,s,art,reduced);
 }c.restore();
}
export function drawActTwoScenery(c,s,art,reduced){
 drawEpisodeScenery(c,s,art,reduced);
 if(s.level.cornfield){drawCornScenery(c,s,art,reduced);return;}
 const left=s.camera.x-400,right=s.camera.x+960/(s.camera.zoom||1)+400;
 if(s.level.cornfield){
  for(let i=Math.floor(left/240);i<right/240;i++){
   const worldX=i*240+105,x=s.camera.x+(worldX-s.camera.x)*.97,root=480+8,h=160+(Math.abs(i)%3)*18;
   c.save();c.translate(x,root);c.transform(1,0,reduced?0:Math.sin(s.time*1.2+i)*.022,1,0,0);prop(c,art,0,-145,-h,290,h,i%2===0);c.restore();
  }
 }else if(s.level.maskMansion){
  if(!s.level.castleCircus)prop(c,art,9,1675,-360,50,1050);
  for(const x of [550,1560,3370,4330,5890,6950]){if(x<left||x>right)continue;const floor=s.level.platforms.find(q=>q.kind==='earth'&&x>=q.x&&x<q.x+q.w)?.y??480;prop(c,art,6,x-55,floor-175,110,175);}
 }
}
export function drawActTwoTerrain(c,s,q,art){
 if(s.level.openNightmare)return;
 if(q.gone)return;
 if(drawEpisodeSlope(c,s,q,art))return;
 if(s.level.cornfield&&drawCornTerrain(c,s,q,art))return;
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
 if(s.level.cornfield){drawCornEncounter(c,s,art,reduced);return;}
 const b=s.boss,a=s.level.arena;
 drawNightmareSlam(c,s,art,reduced);drawNightmareForceWind(c,s,art,reduced);drawNightmareStaffContact(c,s,art,reduced);drawNightmareBlast(c,s,art,reduced);
 for(const q of s.strawPiles){if(q.hp<=0)continue;prop(c,art,1,q.x-54,q.y-65,108,65);if(b.phase==='rebuild'){
  const t=(b.phaseAge*.65+q.x*.003)%1,x=q.x+(b.x-q.x)*t,y=q.y-30+(b.y-100-q.y+30)*t-Math.sin(t*Math.PI)*70;paintMagicLight(c,x,y,42,'#ffc86b',.35);cel(c,art['act-two-effects'],Math.floor(s.time*8)%4,x,y,44,false,true,Math.atan2(b.y-100-y,b.x-x)+Math.PI);
 }}
 for(const q of s.dreamMirrors){if(q.hp<=0)continue;c.save();if(q.flash)c.filter='brightness(2)';prop(c,art,11,q.x-42,q.y-q.h,84,q.h);c.globalAlpha=.48;episodeCel(c,art[b.stage===3?'nightmare-phase-three':b.stage===2?'nightmare-phase-two':'episode-harlequin'],q.age>1.1?5:4,q.x,q.y,235,q.dir>0);c.restore();paintMagicLight(c,q.x,q.y-65,75,'#77deff',.25);}
 for(const q of nightmareGameWarnings(s)){
  paintMagicLight(c,q.x,q.y-4,q.w*.65,q.safe?'#81ffd1':'#e7a1ff',q.safe?.18:.25);
  if(!q.safe){c.save();c.globalAlpha=.5+Math.sin(b.phaseAge*12)*.15;
   if(s.level.badDreams)nightmareFX(c,art,'fast-wind',Math.floor(s.fxTime*18)%8,q.x,q.y-8,q.w,24,false,.7);
   else if(q.kind==='blink'){c.strokeStyle='#d7a5ff';c.lineWidth=2;c.beginPath();c.ellipse(q.x,q.y-5,q.w*.48,9,0,0,Math.PI*2);c.stroke();}
   else episodeCel(c,art['episode-effects'],q.kind==='landing'?3:1,q.x,q.y-40,q.kind==='landing'?110:65,false,true);c.restore();}
 }
 if(['wind-blink','staff-counter'].includes(b.game?.kind)&&b.phase==='game-attack'&&b.phaseAge<.78){
  for(const [x,alpha]of [[b.originX,.35],[b.targetX,.65]]){
   nightmareFX(c,art,'fast-wind',Math.floor(s.fxTime*22)%8,x,a.y-53,75,120,false,alpha*(1-b.phaseAge/1.1),Math.PI/2);paintMagicLight(c,x,a.y-50,70,'#b57cff',.14);
  }
 }
 for(const q of s.dreamHazards){if(q.safe)continue;
  const active=q.age>=q.delay;c.save();c.globalAlpha=active?.8:.35+.15*Math.sin(q.age*15);c.fillStyle=active?'#8624b988':'#8ccfff44';c.fillRect(q.x,q.y-5,q.w,8);c.strokeStyle='#d9c8ff';c.setLineDash(active?[]:[12,12]);c.strokeRect(q.x,q.y-8,q.w,9);c.restore();
  if(active)for(let x=q.x+30;x<q.x+q.w;x+=95)drawNightmareMote(c,art,1,s.fxTime,x,q.y-18,76,-Math.PI/2,.85);
 }
 for(const q of s.actTwoAmbushes)if(!q.fired&&q.warning>0){const x=q.enemies[0][0];c.save();c.globalAlpha=.35+.3*Math.sin(s.time*20);paintMagicLight(c,x,q.enemies[0][1]-45,85,'#ffcb66',.4);prop(c,art,s.level.cornfield?0:11,x-35,q.enemies[0][1]-85,70,85);c.restore();}
 if(b.phase==='sleep'||b.phase==='defeated'&&b.defeat?.ready)return;
 const drawing=actTwoBossDrawing(s,reduced);
 drawNightmareAfterimages(c,s,art,drawing,cel,reduced);
 if(s.level.openNightmare)drawRingContactShadow(c,b.x,a.y,25,Math.max(.035,.2-(a.y-b.y)/8000));
 c.save();if(b.phase==='dying')c.globalAlpha=Math.min(1,Math.max(0,(2.7-b.phaseAge)/.5));if(b.flash>0)c.filter='brightness(1.6)';
 if(b.phase==='swarm'){
  for(let i=0;i<3;i++){const t=b.clock*3+i*2.1;episodeCel(c,art['episode-effects'],11,b.x+Math.cos(t)*75,b.y-70+Math.sin(t)*60,90,false,true,Math.sin(t)*.15);}
 }else if(!nightmareStaffHidden(b)&&!(b.game?.kind==='wind-blink'&&b.phase==='game-attack'&&b.phaseAge<.3))cel(c,art[drawing.key],drawing.frame,b.x+(drawing.offsetX||0)*(b.dir>0?-1:1),b.y,drawing.size,b.dir>0);
 if(s.level.maskMansion&&b.countess){const q=b.countess,frame=q.phase==='defeated'?15:q.phase==='warn'?11:q.phase==='cast'?10:q.phase==='recover'?14:8+Math.floor(q.age*3)%2;episodeCel(c,art['episode-couple'],frame,q.x,q.y,246,q.dir>0);}
 for(const q of s.curtainChandeliers||[]){const broken=q.y>=q.floor-30;episodeCel(c,art['episode-effects'],broken?10:q.falling?9:8,q.x,q.y,broken?190:155,false,true);if(!q.falling){paintMagicLight(c,q.x,q.floor-4,100,'#cc9aff',.25);}}
 c.restore();
 if(b.game?.kind==='staff-counter'&&b.phase==='game-attack'&&b.phaseAge>=.5&&b.phaseAge<.82){
  const tip=NIGHTMARE_STAFF_TIPS[drawing.key]?.[drawing.frame];
  if(tip){const m=nightmareSpritePoint(s,drawing,tip),fade=Math.sin(Math.min(1,(b.phaseAge-.5)/.32)*Math.PI);
   paintMagicLight(c,m.x,m.y,55,'#b06dff',fade*.5);
   drawNightmareMote(c,art,1,s.fxTime,m.x,m.y,82,b.dir>0?0:Math.PI,fade*.85);
  }
 }
 if(b.muzzleTime>0){const m=actTwoBossMuzzle(s);paintMagicLight(c,m.x,m.y,95,s.level.cornfield?'#ffc15d':s.level.badDreams?'#bd76ff':'#6fdfff',.6);if(s.level.badDreams)drawNightmareMote(c,art,1,s.fxTime,m.x,m.y,54,b.dir>0?0:Math.PI,.9);else cel(c,art['act-two-effects'],s.level.cornfield?0:4,m.x,m.y,54,b.dir>0,true);}
 if(b.phase==='windup'&&b.move==='rush'){
  c.save();c.globalAlpha=.5;c.strokeStyle='#cdb6ff';c.lineWidth=3;c.setLineDash([16,12]);c.beginPath();c.moveTo(b.x,a.y-5);c.lineTo(Math.max(a.left+100,Math.min(a.right-100,b.x+b.attackDir*395)),a.y-5);c.stroke();c.restore();
 }
}
export function drawActTwoProjectile(c,q,art){
 if(!q.actTwo)return false;if(q.life<=0)return true;
 if(drawCornProjectile(c,q,art))return true;
 if(q.kind==='nightmare-storm'){
  const len=Math.max(1,Math.hypot(q.vx,q.vy)),tail={x:q.x-q.vx/len*650,y:q.y-q.vy/len*650};
  drawNightmareVortex(c,art,nightmareStormFrame(art,q.age),tail,q,520);paintMagicLight(c,q.x,q.y,290,'#bf8bff',.7);return true;
 }
 if(q.kind==='nightmare-gust'){
  const angle=Math.atan2(q.vy,q.vx),shear=q.windShape==='wind-shear',rain=q.windShape==='nightmare-rain',spiral=q.windShape==='spiral-volley',length=shear?175:rain?140:115;
  const tail={x:q.x-Math.cos(angle)*length,y:q.y-Math.sin(angle)*length};
  nightmareFX(c,art,'fast-wind',Math.floor(q.age*24)%8,(tail.x+q.x)/2,(tail.y+q.y)/2,length,shear?44:rain?50:62,false,1,angle-Math.PI);
  paintMagicLight(c,q.x,q.y,75,'#c083ff',.4);return true;
 }
 if(q.kind==='nightmare-wheel'){episodeCel(c,art['aerial-candy-vortex'],Math.floor(q.age*16)%8,q.x,q.y,210,false,true,q.age*.8);paintMagicLight(c,q.x,q.y,120,'#ba80ff',.4);return true;}
 if(['act-two-mask','act-two-orb','act-two-bat'].includes(q.kind)){const bat=q.kind==='act-two-bat',frame=bat?11:q.kind==='act-two-mask'?Math.floor(q.age*9)%4:1;episodeCel(c,art['episode-effects'],frame,q.x,q.y,bat?72:q.kind==='act-two-mask'?84:52,false,true,bat?Math.sin(q.age*12)*.15:q.age*.7);paintMagicLight(c,q.x,q.y,70,'#b397ff',.3);return true;}
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
