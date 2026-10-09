import {painted,paintedParticle} from './paintedDuelCanvas';
import {clashPortraitFrames,castingWindFrame,opponentLight} from '../engine/clashActing';
import {duelPennants} from './duelCutinCanvas';
import {clashPortraitLayout} from './clashPortraitLayout';
export {clashPortraitLayout} from './clashPortraitLayout';
let portraitBuffer;
const clamp=n=>Math.max(0,Math.min(1,n));
function portraitEnergy(c,art,boss,spill,age,w,h,reduced){
 c.save();c.scale(w/384,h/276);
 for(let i=0;i<(reduced?5:18);i++){
  const t=(age*(1.3+i%3*.2)+i*.618)%1,x=(boss?325:59)+(boss?-1:1)*t*265,y=245-(i%5)*43-Math.sin(t*Math.PI)*22;
  paintedParticle(c,art,boss?(i%5===0?4:3):i%3,age+i*.17,x,y,14+i%3*6,(boss?-1:1)*age*2+i,Math.sin(t*Math.PI)*.85);
 }
 // Incoming enemy paintings lick the shoulder and casting arm, below the face.
 if(spill>.03)for(let i=0;i<(reduced?2:4);i++){
  const t=(age*1.35+i/4)%1,x=(boss?0:384)+(boss?1:-1)*(t*125*spill),y=235-i*30;
  c.save();c.translate(x,y);if(!boss)c.scale(-1,1);
  if(!boss)painted(c,art,'fire',16+Math.floor(age*24+i)%8,0,0,180+spill*55,100,0,Math.sin(t*Math.PI)*spill*.95,.74,.5);
  else{
   painted(c,art,'heads',Math.floor(age*24+i)%8,0,0,170,149,0,Math.sin(t*Math.PI)*spill*.85,.71,.5);
   paintedParticle(c,art,1,age+i,20,-12,28,age,Math.sin(t*Math.PI)*spill);
  }c.restore();
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
 if(q.soot)c.filter='brightness(.52) saturate(.3)';
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
 const frames=clashPortraitFrames(q);c.save();c.globalAlpha=fade;
 for(const [boss,key,frame]of [[false,'hexy-clash-portraits',frames.hexy],[true,'harlequin-clash-portraits',frames.boss]]){
  const {right,x,y,w,h}=clashPortraitLayout(s,boss),flip=right!==boss;
  const push=reduced?0:Math.sin(s.fxTime*27)*(q.tapPulse>0?1.25:.45),cell=castingWindFrame(s.fxTime,reduced);
  if(!portraitBuffer)portraitBuffer=new OffscreenCanvas(384,276);
  const p=portraitBuffer.getContext('2d');p.clearRect(0,0,384,276);
  p.drawImage(art[key],cell*384,frame*448+70,384,276,0,0,384,276);
  // Light stays on the drawing's alpha, never a coloured rectangular panel.
  const spill=opponentLight(q,boss);
  p.globalCompositeOperation='source-atop';
  const light=p.createLinearGradient(boss?0:384,0,boss?384:0,0);
  light.addColorStop(0,boss?`rgba(255,225,135,${spill*.68})`:`rgba(255,151,42,${spill*.72})`);
  light.addColorStop(.55,boss?`rgba(255,111,208,${spill*.28})`:`rgba(255,67,27,${spill*.32})`);light.addColorStop(1,'#00000000');p.fillStyle=light;p.fillRect(0,0,384,276);
  p.globalCompositeOperation='destination-in';const mask=p.createLinearGradient(0,225,0,276);mask.addColorStop(0,'#fff');mask.addColorStop(1,'#ffffff00');p.fillStyle=mask;p.fillRect(0,0,384,276);p.globalCompositeOperation='source-over';
  c.save();c.translate(push,0);duelPennants(c,right,boss,y+18,y+h-13,w/292);
  c.translate(x+(flip?w:0),y);if(flip)c.scale(-1,1);c.drawImage(portraitBuffer,0,0,w,h);portraitEnergy(c,art,boss,spill,s.fxTime,w,h,reduced);c.restore();
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
 const flash=q.state==='contest'?Math.max(clamp(1-q.age/.16)*.12,(q.flashPulse||0)/.075*.09):q.state==='flight'?clamp(1-q.age/.2)*.32:0;
 if(flash){c.save();c.fillStyle=`rgba(255,244,218,${flash})`;c.fillRect(0,0,960,540);c.restore();}
}
