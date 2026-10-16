import {paintedParticle} from './paintedDuelCanvas';
import {clashPortraitSprite,clashPortraitCrop,opponentLight} from '../engine/clashActing';
import {drawPortraitPressure} from './clashPortraitPressure';
import {drawDuelBorders} from './duelCutinCanvas';
import {clashPortraitLayout} from './clashPortraitLayout';
import {clashImpactTiming} from './clashImpactCanvas';
export {clashPortraitLayout} from './clashPortraitLayout';
let portraitBuffer;
const clamp=n=>Math.max(0,Math.min(1,n));
function portraitEnergy(c,art,boss,age,w,h,reduced){
 c.save();c.scale(w/384,h/276);
 for(let i=0;i<(reduced?5:18);i++){
  const t=(age*(1.3+i%3*.2)+i*.618)%1,x=(boss?325:59)+(boss?-1:1)*t*265,y=245-(i%5)*43-Math.sin(t*Math.PI)*22;
  paintedParticle(c,art,boss?(i%5===0?4:3):i%3,age+i*.17,x,y,14+i%3*6,(boss?-1:1)*age*2+i,Math.sin(t*Math.PI)*.85);
 }
 c.restore();
}
export function clashEffect(c,art,row,frame,x,y,size,alpha=1){
 c.save();c.globalAlpha=alpha;c.drawImage(art['harlequin-clash-effects'],frame*256,row*256,256,256,x-size/2,y-size/2,size,size);c.restore();
}
export function drawClashDust(c,art,q){clashEffect(c,art,2,Math.min(3,Math.floor(q.age/.2)),q.x,q.y-q.size*.3,q.size,clamp(q.life/.18));}
export function drawCinematicSmoke(c,art,q){
 const t=q.age/q.duration,size=q.size*(.65+t*1.05);
 c.save();c.translate(q.x,q.y);c.rotate(Math.sin(q.seed)*.14);c.scale(q.seed%2?-1:1,.8);
 if(q.soot)c.filter='brightness(.52) saturate(.3)';else if(q.dust)c.filter='sepia(.45) saturate(.5) brightness(1.1)';
 smokePuff(c,art,Math.min(7,Math.floor(t*8)),0,-size*.25,size,clamp(q.age/.08)*clamp(q.life/.7)*(q.soot?.82:.65)*(q.alpha??1));c.restore();
}
export function smokePuff(c,art,frame,x,y,size,alpha=1){c.save();c.globalAlpha=alpha;c.drawImage(art['impact-smoke'],frame%4*256,Math.floor(frame/4)*256,256,256,x-size/2,y-size/2,size,size);c.restore();}
export function drawClashSparks(c,q,art,reduced){
 for(let i=0;i<q.sparks.length;i++){
  if(reduced&&i%5)continue;const p=q.sparks[i];
  paintedParticle(c,art,p.kind??i%5,p.age,p.x,p.y,p.size*4+5,p.age*(i%2?4:-4)+i,clamp(p.life/.16));
 }
}
export function drawClashPortraits(c,s,art,reduced=false){
 const q=s.powerClash;if(!q||q.state==='windup')return;
 const fade=q.state==='flight'?1-clamp(q.age/.45):q.state==='land'?0:1;if(fade<=0)return;
 c.save();c.globalAlpha=fade;
 for(const boss of [false,true]){
  const {right,x,y,w,h}=clashPortraitLayout(s,boss),flip=right!==boss;
  const push=reduced?0:Math.sin(s.fxTime*27)*(q.tapPulse>0?1.25:.45),pose=clashPortraitSprite(q,boss,s.fxTime,reduced),crop=clashPortraitCrop(q,boss);
  if(!portraitBuffer)portraitBuffer=new OffscreenCanvas(384,276);
  const p=portraitBuffer.getContext('2d');p.clearRect(0,0,384,276);
  p.drawImage(art[pose.key],pose.frame%pose.cols*384+crop.x,Math.floor(pose.frame/pose.cols)*448+70+crop.y,crop.w,crop.h,0,0,384,276);
  // Light stays on the drawing's alpha, never a coloured rectangular panel.
  const spill=opponentLight(q,boss);
  p.globalCompositeOperation='source-atop';
  const light=p.createLinearGradient(boss?0:384,0,boss?384:0,0);
  const flicker=reduced?1:.92+Math.sin(s.fxTime*9)*.08;
  light.addColorStop(0,boss?`rgba(255,225,135,${spill*.34*flicker})`:`rgba(255,151,42,${spill*.36*flicker})`);
  light.addColorStop(.55,boss?`rgba(255,111,208,${spill*.12})`:`rgba(255,67,27,${spill*.14})`);light.addColorStop(1,'#00000000');p.fillStyle=light;p.fillRect(0,0,384,276);
  p.globalCompositeOperation='destination-in';const mask=p.createLinearGradient(0,0,0,276);mask.addColorStop(0,'#ffffff00');mask.addColorStop(.045,'#fff');mask.addColorStop(.815,'#fff');mask.addColorStop(1,'#ffffff00');p.fillStyle=mask;p.fillRect(0,0,384,276);
  const sides=p.createLinearGradient(0,0,384,0);sides.addColorStop(0,'#ffffff00');sides.addColorStop(.045,'#fff');sides.addColorStop(.955,'#fff');sides.addColorStop(1,'#ffffff00');p.fillStyle=sides;p.fillRect(0,0,384,276);p.globalCompositeOperation='source-over';
  const border={right,boss,age:s.fxTime,reduced,x:-10,y:y-16,w:w+26,h:h+36};
  c.save();c.translate(push,0);drawDuelBorders(c,art,border);
  c.save();c.translate(x+(flip?w:0),y);if(flip)c.scale(-1,1);
  drawPortraitPressure(c,art,boss,spill,s.fxTime,w,h,reduced);
  portraitEnergy(c,art,boss,reduced?0:s.fxTime,w,h,reduced);
  c.drawImage(portraitBuffer,0,0,w,h);c.restore();
  drawDuelBorders(c,art,{...border,front:true});c.restore();
 }c.restore();
}
export function drawClashScreenFlash(c,s,reduced){
 const final=s.boss.defeat;
 if(s.index===3&&final&&!reduced){
  const flare=Math.max(0,1-Math.abs(final.age-3.25)/.14)*.24;
  if(flare){c.save();c.fillStyle=`rgba(255,228,188,${flare})`;c.fillRect(0,0,960,540);c.restore();}
 }
 const defeat=s.playerDefeat;
 if(defeat){
  c.save();const shade=defeat.state==='fall'?.08:clamp(defeat.age/1.2)*.24,g=c.createRadialGradient(480,270,130,480,270,550);g.addColorStop(0,'#170b2700');g.addColorStop(1,`rgba(23,11,39,${shade})`);c.fillStyle=g;c.fillRect(0,0,960,540);
  if(!reduced&&defeat.age<.1&&defeat.state!=='lost'){c.fillStyle=`rgba(255,239,218,${(1-defeat.age/.1)*.14})`;c.fillRect(0,0,960,540);}c.restore();
 }
 const q=s.powerClash;if(!q||reduced)return;
 const timing=clashImpactTiming(q);
 const flash=q.state==='contest'?timing.manga>0?0:Math.max(timing.burst**1.5*.56,(q.flashPulse||0)/.075*.09):q.state==='flight'?clamp(1-q.age/.2)*.32:0;
 if(flash){c.save();c.fillStyle=`rgba(255,244,218,${flash})`;c.fillRect(0,0,960,540);c.restore();}
}
