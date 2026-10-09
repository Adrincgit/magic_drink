import {CLOTH_BURN_DURATION} from '../actors/bosses/harlequinChaos';
import {paintedParticle} from './paintedDuelCanvas';

function cell(c,img,frame,x,y,w,h,anchor=.5){
 c.drawImage(img,frame%4*384,Math.floor(frame/4)*384,384,384,x-w/2,y-h*anchor,w,h);
}
export function drawBurningCloth(c,q,art,reduced=false){
 const img=art['circus-chaos'];if(!img)return;
 const grounded=q.state==='burn',frame=grounded?8+Math.min(7,Math.floor(q.burnAge/CLOTH_BURN_DURATION*8)):reduced?1:Math.floor(q.age*16+q.seed)%8;
 c.save();c.translate(q.x,q.y);if(!grounded)c.rotate(q.rotation+Math.sin(q.age*9+q.seed)*.12);
 cell(c,img,frame,0,0,grounded?148:118,grounded?148:118,grounded?350/384:.5);c.restore();
 if(!grounded)for(let i=0;i<(reduced?2:6);i++){
  const t=(q.age*1.4+i*.618)%1;
  paintedParticle(c,art,3,q.age+i,q.x-q.drift*t*.6+Math.sin(i)*t*24,q.y-t*90,8+i%3*3,q.age+i,(1-t)*.75);
 }
}
export function drawPaintedHeatAura(c,s,art,reduced=false){
 const img=art['circus-chaos'];if(!img)return;
 const b=s.boss,wind=reduced?0:Math.max(-1,Math.min(1,b.heatWind||0)),strength=b.stage===3?1:.8;
 const frame=16+(reduced?1:Math.floor(s.fxTime*24)%8),w=190*(1+Math.abs(wind)*.3),h=255*(b.stage===3?1.08:1)*(1-Math.abs(wind)*.28),foot=h*350/384;
 // Bend the painted flame progressively above the boots. The foot stays
 // planted while the upper tongues stream behind the direction of travel.
 c.save();c.globalAlpha*=strength*.78;
 for(let i=0;i<48;i++){
  const sy=i*8,localY=sy/384*h-foot,progress=Math.max(0,-localY/foot);
  const bend=-wind*125*progress*progress;
  c.drawImage(img,frame%4*384,Math.floor(frame/4)*384+sy,384,8,b.x-w/2+bend,b.y+localY,w,h/48+.25);
 }
 c.restore();
}
