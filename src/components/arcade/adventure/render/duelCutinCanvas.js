import {chargingWindFrame} from '../engine/clashActing';
import {paintedParticle} from './paintedDuelCanvas';
const clamp=n=>Math.max(0,Math.min(1,n));
// Local x always points into the duel. Wind travels out, behind the caster.
export function duelWindParticle(age,i,front=false,reduced=false){
 const u=((reduced?0:age*(.58+i%4*.085))+i*.6180339)%1;
 const lane=front?.86+(i%3)*.045:.13+(i%7)*.12;
 return{x:.88-u*1.13,y:lane+Math.sin(u*Math.PI)*((i%2?1:-1)*.055),alpha:Math.sin(u*Math.PI)*.65,u};
}
export function duelSide(s,boss=false){return boss?s.boss.x>s.player.x:s.player.x>s.boss.x;}
// Open, translucent slipstream: no enclosing ring or painted solid border.
export function drawDuelBorders(c,art,{right,boss,age,reduced=false,x=8,y=28,w=300,h=312,front=false}){
 c.save();c.translate(right?960-x:x,y);if(right)c.scale(-1,1);
 if(!front){
  c.save();c.translate(w*.3,h*.55);c.scale(w*.72,h*.46);
  const haze=c.createRadialGradient(0,0,0,0,0,1);haze.addColorStop(0,boss?'#fa532329':'#ab62ee2b');haze.addColorStop(.5,boss?'#c6261915':'#593ac018');haze.addColorStop(1,'#0000');
  c.fillStyle=haze;c.fillRect(-1,-1,2,2);c.restore();
  for(let i=0;i<(reduced?3:8);i++){
   const p=duelWindParticle(age,i),sx=p.x*w,sy=p.y*h;
   const g=c.createLinearGradient(sx-w*.43,0,sx,0);g.addColorStop(0,'#0000');g.addColorStop(.75,boss?'#ff9a5345':'#b0b8ff50');g.addColorStop(1,'#fff2cc00');
   c.strokeStyle=g;c.lineWidth=1+i%2;c.beginPath();c.moveTo(sx,sy);c.quadraticCurveTo(sx-w*.22,sy+(i%2?10:-10),sx-w*.43,sy+(i%2?17:-17));c.stroke();
  }
 }
 for(let i=0;i<(reduced?4:front?7:23);i++){
  const p=duelWindParticle(age,i,front,reduced),kind=boss?3:i%4===0?0:i%2?1:2;
  paintedParticle(c,art,kind,reduced?0:age+i*.11,p.x*w,p.y*h,(front?9:7)+i%4*2.6,(i%3-1)*.12,p.alpha*(front?.64:.8));
 }
 c.restore();
}
export function drawDuelCharge(c,s,art,boss,reduced=false){
 const u=s.boss.ultimate,clash=s.powerClash;
 if(boss?u?.state!=='charge':clash?.state!=='windup')return false;
 const age=boss?u.age+(clash?.state==='windup'?clash.age:0):clash.age,right=duelSide(s,boss),alpha=clamp(age/.13);
 const enter=reduced?0:(right?1:-1)*330*Math.pow(1-clamp(age/.22),3);
 const pose=boss?{key:'harlequin-clash-charge',cols:3,frame:chargingWindFrame(age,reduced)}:null,img=art[boss?pose.key:'hexy-encore-portrait'];if(!img)return false;
 const border={right,boss,age,reduced};
 c.save();c.translate(enter,0);c.globalAlpha=alpha;drawDuelBorders(c,art,border);
 const h=334,w=h*(boss?384/448:img.width/img.height),x=right?950-w:10,y=20;
 const flip=right!==boss;c.save();c.translate(x+(flip?w:0),y);if(flip)c.scale(-1,1);
 // Right-facing Hexy and left-facing harlequin mirror only when necessary.
 // Charge and contact use the same registered artwork, palette and anatomy.
 if(boss)c.drawImage(img,pose.frame%pose.cols*384,Math.floor(pose.frame/pose.cols)*448,384,448,0,0,w,h);
 else c.drawImage(img,0,0,w,h);c.restore();
 drawDuelBorders(c,art,{...border,front:true});c.restore();return true;
}
