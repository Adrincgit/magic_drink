import {NIGHTMARE_PRESSURE_PORTRAITS,NIGHTMARE_PRESSURE_PORTRAIT_TIPS} from '../actors/bosses/nightmarePressureRegistration';
import {nightmarePressureFrame} from '../engine/nightmarePressureActing';
import {paintedParticle} from './paintedDuelCanvas';
import {paintMagicLight} from './projectileLightsCanvas';
import {drawNightmareMote} from './nightmareMotesCanvas';
import {NIGHTMARE_CLASH} from '../engine/nightmarePowerClash';
import {NIGHTMARE_COMBAT_PORTRAITS} from '../actors/bosses/nightmareCombatRegistration';
export function nightmareCornerLayout(s,boss=false){
 const right=boss?s.boss.x>s.player.x:s.player.x>s.boss.x,w=boss?300:340,h=boss?232:270;
 return{right,x:right?960-w:0,y:boss?0:540-h,w,h,boss};
}
export function nightmareMangaBorders(s){
 return[false,true].map(boss=>{const p=nightmareCornerLayout(s,boss);return boss?(p.right?[[p.x,0],[960,p.h]]:[[p.w,0],[0,p.h]]):(p.right?[[960,p.y],[p.x,540]]:[[0,p.y],[p.w,540]]);});
}
export const nightmareMangaDivider=nightmareMangaBorders;
export function nightmareGleeActive(q){return q?.state==='boss-boost'&&q.age>=.12&&q.age<=NIGHTMARE_CLASH.bossCharge-.18;}
function cornerPath(c,p){
 const points=p.boss?(p.right?[[0,0],[p.w,0],[p.w,p.h]]:[[0,0],[p.w,0],[0,p.h]]):(p.right?[[p.w,0],[p.w,p.h],[0,p.h]]:[[0,0],[p.w,p.h],[0,p.h]]);
 c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(p.x+x,p.y+y):c.moveTo(p.x+x,p.y+y));c.closePath();
}
function magic(c,s,art,p,reduced){
 const t=reduced?0:s.fxTime,img=art['nightmare-corner-magic'];
 c.save();cornerPath(c,p);c.clip();c.fillStyle=p.boss?'#241044':'#5c104e';c.fillRect(p.x,p.y,p.w,p.h);
 if(img){const sw=img.width/2,offset=Math.sin(t*.48)*24;c.drawImage(img,p.boss?sw:0,0,sw,img.height,p.x-48+offset,p.y-35+Math.cos(t*.43)*12,p.w+96,p.h+70);}
 c.fillStyle='#09061a44';c.fillRect(p.x,p.y,p.w,p.h);
 for(let i=0;i<(reduced?4:17);i++){
  const u=(t*(.45+i%3*.1)+i*.618)%1,x=p.right?p.x+u*p.w:p.x+(1-u)*p.w,y=p.boss?p.y+u*p.h:p.y+(1-u)*p.h;
  if(p.boss)drawNightmareMote(c,art,i%3?1:0,t+i,x,y,15+i%4*6,t*.6+i,Math.sin(u*Math.PI)*.8);
  else paintedParticle(c,art,i%3,t+i,x,y,8+i%4*3,t*.6+i,Math.sin(u*Math.PI)*.8);
 }
 c.restore();
}
export function drawNightmarePressurePanels(c,s,art,reduced=false){
 const q=s.powerClash;if(!q||!['travel','contest','boss-boost','hexy-boost','breakthrough','resolve'].includes(q.state))return;
 const glee=nightmareGleeActive(q);
 for(const boss of [false,true])if(!boss||!glee)magic(c,s,art,nightmareCornerLayout(s,boss),reduced);
 c.save();c.strokeStyle='#08050c';c.lineWidth=9;c.lineCap='round';
 for(const [i,[[x,y],[ex,ey]]]of nightmareMangaBorders(s).entries()){if(i===1&&glee)continue;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo((x+ex)/2+2,(y+ey)/2-2,ex,ey);c.stroke();}c.restore();
 for(const boss of [true,false]){
  if(boss&&glee)continue;
  const name=boss?'boss-portraits':'hexy-portraits',img=art['pressure-'+name],frame=nightmarePressureFrame(q,s.fxTime,boss,reduced),crop=boss?NIGHTMARE_COMBAT_PORTRAITS[frame]:NIGHTMARE_PRESSURE_PORTRAITS[name][frame],p=nightmareCornerLayout(s,boss);
  if(!img)continue;c.save();
  if(boss){cornerPath(c,p);c.clip();const size=324;c.translate(p.right?960:0,0);if(!p.right)c.scale(-1,1);c.drawImage(img,...crop,-115-335/crop[2]*size,65-260/crop[3]*size,size,size*crop[3]/crop[2]);}
  else{
   const size=350,x=-68,y=310,tip=NIGHTMARE_PRESSURE_PORTRAIT_TIPS[frame];c.translate(p.right?960:0,0);if(p.right)c.scale(-1,1);
   c.drawImage(img,...crop,x,y,size,size*crop[3]/crop[2]);
   // Screen-space light has no source-image boundary to reveal. The wand
   // itself is opaque painted gold, with a registered tip for every cel.
   if(tip)paintMagicLight(c,x+tip[0]/crop[2]*size,y+tip[1]/crop[3]*size,23,'#ffe6b4',.55);
  }
  c.restore();
 }
}
export function drawNightmareGleeCutin(c,s,art,reduced=false){
 const q=s.powerClash,img=art['nightmare-glee-portraits'];
 if(!img||!nightmareGleeActive(q))return;
 const alpha=Math.min(1,(q.age-.12)/.15,(NIGHTMARE_CLASH.bossCharge-.18-q.age)/.2);
 const cel=reduced?0:[0,1,2,3,2,1][Math.floor((q.actingTime||0)*10)%6],slide=reduced?0:(1-alpha)*80;
 c.save();c.globalAlpha=alpha;c.translate(slide,0);
 // A large transparent expression overlay enters directly from the right;
 // no small panel or rectangular frame contains the character.
 paintMagicLight(c,850,210,270,'#b055ff',alpha*.22);
 c.drawImage(img,cel*704,704,704,704,555,-80,650,650);
 c.restore();
}
