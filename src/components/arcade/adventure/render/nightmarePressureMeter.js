import {paintedParticle} from './paintedDuelCanvas';
import {drawDuelBeamTexture,duelBeamPhase} from './duelBeamFrames';
import {NIGHTMARE_METER_WINDOW as aperture} from '../actors/bosses/nightmarePressureRegistration';
const clamp=n=>Math.max(0,Math.min(1,n));
// This is contest pressure, never boss health. Each side has its own palette
// and painted spell texture; no flame frame or fire beam is sampled here.
export function drawNightmarePressureMeter(c,s,art,reduced=false){
 const img=art['pressure-meter'];if(!img)return;const q=s.powerClash,left=s.player.x<s.boss.x,x=298,y=3,w=364,h=76;
 const ix=x+w*aperture.x,iy=y+h*aperture.y,iw=w*aperture.w,ih=h*aperture.h,ratio=clamp(q.pressure),split=left?ratio:1-ratio;
 c.save();c.beginPath();c.roundRect(ix,iy,iw,ih,ih*.5);c.clip();
 const fill=(a,b,boss)=>{
  if(b<=a)return;const bx=ix+iw*a,bw=iw*(b-a);c.save();c.beginPath();c.rect(bx,iy,bw,ih);c.clip();
  const g=c.createLinearGradient(0,iy,0,iy+ih);g.addColorStop(0,boss?'#8cf6ff':'#ffe0f5');g.addColorStop(.45,boss?'#9271e5':'#f38dd0');g.addColorStop(1,boss?'#402769':'#a12d91');c.fillStyle=g;c.fillRect(bx,iy,bw,ih);
  c.globalAlpha=.5;if(boss){const vortex=art['aerial-candy-vortex'],side=vortex.width/4,frame=reduced?2:Math.floor(s.fxTime*15)%8;c.drawImage(vortex,frame%4*side,Math.floor(frame/4)*side,side,side,ix,iy-ih*2,iw,ih*5);}else drawDuelBeamTexture(c,art['super-beam'],duelBeamPhase(s.fxTime,reduced),ix,iy-ih*.6,iw,ih*2.2);c.restore();
 };
 fill(0,split,!left);fill(split,1,left);c.restore();
 c.save();if(!left){c.translate(x+w,y);c.scale(-1,1);c.drawImage(img,0,0,w,h);}else c.drawImage(img,x,y,w,h);c.restore();
 paintedParticle(c,art,0,reduced?0:s.fxTime,ix+iw*split,iy+ih*.5,22,0,.95);
}
