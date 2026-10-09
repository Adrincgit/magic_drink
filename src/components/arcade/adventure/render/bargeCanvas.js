import {bargeRig} from '../actors/bosses/adventureBarge';
import {bossHitFilter} from '../actors/bosses/bossFeedback';
import {drawHullWater} from './harborWaterCanvas';
const TAU=Math.PI*2;
function part(c,img,x,y,w,h,angle=0){c.save();c.translate(x,y);c.rotate(angle);c.drawImage(img,-w/2,-h/2,w,h);c.restore();}
function crew(c,art,x,y,frame,size){const img=art['red-clown-throw'];c.drawImage(img,(frame%4)*256,Math.floor(frame/4)*256,256,256,x-size/2,y-size*.98,size,size);}
export function drawHarborFX(c,art,row,frame,x,y,w,h=w,flip=false,angle=0){
 const img=art['harbor-effects'];c.save();c.translate(x,y);c.rotate(angle);if(flip)c.scale(-1,1);c.drawImage(img,frame*256,row*256,256,256,-w/2,-h/2,w,h);c.restore();
}
export function drawBarge(c,s,art,reduced=false){
 const b=s.boss;if(b.phase==='sleep'||b.shattered)return;
 const m=bargeRig(s),t=reduced?0:Math.floor((s.time||0)*12)/12,preparing=b.phase==='warn',strike=b.release>0;
 drawHullWater(c,art[b.armorBroken?'barge-damaged':'barge-body'],b.x,b.y+74,m.body.w,m.body.h,t,reduced);
 c.save();c.filter=bossHitFilter(b,reduced);
 // Painted crew and machinery share the same world rig; no sliding overlay.
 const mainFrame=preparing?0:strike?2:3;
 crew(c,art,m.pilot.x,m.pilot.y,mainFrame,115);crew(c,art,m.stern.x,m.stern.y,strike?2:0,91);
 const hull=m.body;
 c.drawImage(art[b.armorBroken?'barge-damaged':'barge-body'],hull.x,hull.y,hull.w,hull.h);
 // Keep their heads and gesturing arms in front of the deck rail.
 c.save();c.beginPath();c.rect(m.pilot.x-65,m.pilot.y-125,130,100);c.clip();crew(c,art,m.pilot.x,m.pilot.y,mainFrame,115);c.restore();
 c.save();c.beginPath();c.rect(m.stern.x-48,m.stern.y-99,96,80);c.clip();crew(c,art,m.stern.x,m.stern.y,strike?2:0,91);c.restore();
 part(c,art['barge-wheel'],m.wheel.x,m.wheel.y,154,154,reduced?0:b.wheelAngle||t*2.6);
 if(!b.armorBroken)part(c,art['barge-shield'],m.drum.x,m.drum.y,148+(strike?6:0),148-(strike?7:0));
 else{
  c.save();c.globalAlpha=.16+.08*Math.sin(t*7);c.fillStyle='#ffe88a';c.beginPath();c.ellipse(m.core.x,m.core.y,31,37,0,0,TAU);c.fill();c.restore();
 }
 part(c,art['barge-cannon'],m.cannon.x,m.cannon.y,132,79,m.cannon.angle);
 // The drawn mallet's handle ends at its bottom-right corner. Rotate around
 // the drummer's grip, quantizing the motion to an illustrated 12 fps beat.
 const hammerAngle=preparing&&b.move==='drumroll'?.28:strike&&b.move==='drumroll'?-1.32+(1-Math.min(1,b.release/.25))*.82:-.35+Math.sin(t*2)*.06;
 c.save();c.translate(m.drum.x+101,m.drum.y-102);c.rotate(hammerAngle);
 c.drawImage(art['barge-mallet'],-116,-122,142,146);
 c.fillStyle='#bc8228';c.strokeStyle='#4d302d';c.lineWidth=2;c.beginPath();c.arc(0,0,8,0,TAU);c.fill();c.stroke();c.restore();
 c.restore();
 if(strike&&b.move==='tidal'){
  // The low crest is pumped visibly from the bow cannon onto the deck.
  const x=m.muzzle.x,y=m.muzzle.y+12,tip=m.wave;
  c.save();c.fillStyle='#6bd5e4';c.strokeStyle='#285473';c.lineWidth=2;
  c.beginPath();c.moveTo(x+6,y-5);c.bezierCurveTo(x-28,y+2,tip.x-25,tip.y-12,tip.x-18,tip.y+10);c.lineTo(tip.x+17,tip.y+10);c.bezierCurveTo(tip.x-2,tip.y-8,x-6,y+18,x+8,y+7);c.closePath();c.fill();c.stroke();
  c.strokeStyle='#e4fff0';c.beginPath();c.moveTo(x-5,y+3);c.quadraticCurveTo(x-27,y+27,tip.x-7,tip.y+3);c.stroke();c.restore();
 }
 // Foam originates at the wheel/hull contact, not somewhere ahead of it.
 const frame=reduced?1:Math.floor(t*8)%4,force=b.phase==='attack'&&b.move==='surge';
 drawHarborFX(c,art,2,frame,m.wheel.x,m.wheel.y+66,force?170:108,force?100:50);
 if(force)drawHarborFX(c,art,0,frame,b.x-280,b.y+44,145,90);
 // Small, stepped painted steam puffs keep the stacks visibly alive.
 for(const [j,vent] of m.vents.entries())for(let i=0;i<(b.transformed?4:2);i++){
  const age=reduced?(i+.5)/4:(t*.85+i*.27+j*.1)%1,r=7+age*14;
  c.save();c.globalAlpha=(1-age)*.55;c.fillStyle=b.transformed?'#d8e5ee':'#f4e2c3';c.strokeStyle='#899daa';c.lineWidth=1;
  c.beginPath();c.moveTo(vent.x-r,vent.y-age*72);c.bezierCurveTo(vent.x-r*1.7,vent.y-age*72-r,vent.x,vent.y-age*72-r*1.8,vent.x+r*.45,vent.y-age*72-r);c.bezierCurveTo(vent.x+r*1.7,vent.y-age*72-r,vent.x+r*1.4,vent.y-age*72+r*.5,vent.x-r,vent.y-age*72);c.fill();c.stroke();c.restore();
 }
}
export function drawBargeProjectile(c,q,art,reduced=false){
 const frame=reduced?1:Math.floor(q.age*12)%4,size=q.drawSize||65;
 if(q.kind==='barge-wave')drawHarborFX(c,art,0,frame,q.x,q.y-9,size,size*.85,q.vx>0);
 else if(q.kind==='barge-shell'){
  part(c,art['barge-shield'],q.x,q.y,size,size,reduced?0:q.age*6);
 }else{
  c.save();if(q.kind==='diver-hoop')c.filter='hue-rotate(130deg)';drawHarborFX(c,art,1,frame,q.x,q.y,size,size,false,Math.atan2(q.vy,q.vx)*.08);c.restore();
 }
}
