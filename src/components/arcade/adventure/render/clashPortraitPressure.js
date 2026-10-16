import {painted,paintedParticle} from './paintedDuelCanvas';
let surface,edgeMask;
// The incoming spell travels around the frame, behind the character. A real
// empty centre protects the expression even at maximum zoom, on either side.
export function drawPortraitPressure(target,art,boss,spill,age,w,h,reduced=false){
 if(spill<=.03)return;
 if(!surface){
  surface=new OffscreenCanvas(384,276);edgeMask=new OffscreenCanvas(384,276);
  const m=edgeMask.getContext('2d');
  // Each strip fades at BOTH edges: neither a rectangular outside crop nor
  // an L-shaped hard boundary appears beside the zoomed portrait.
  const bottom=m.createLinearGradient(0,244,0,276);bottom.addColorStop(0,'#ffffff00');bottom.addColorStop(.5,'#fff');bottom.addColorStop(1,'#ffffff00');m.fillStyle=bottom;m.fillRect(0,244,384,32);
  const inner=m.createLinearGradient(352,0,384,0);inner.addColorStop(0,'#ffffff00');inner.addColorStop(.5,'#fff');inner.addColorStop(1,'#ffffff00');m.fillStyle=inner;m.fillRect(352,16,32,260);
 }
 const c=surface.getContext('2d');c.clearRect(0,0,384,276);
 const time=reduced?0:age;
 c.save();
 c.beginPath();c.rect(0,0,384,276);c.rect(32,32,320,210);c.clip('evenodd');
 const reach=70+spill*260,pulse=reduced?1:.9+Math.sin(time*9)*.1;
 const light=c.createRadialGradient(384,248,5,384,248,reach);
 light.addColorStop(0,boss?'#ffe7a7bb':'#ffbf58bb');
 light.addColorStop(.4,boss?'#f59ada66':'#ec4a2755');light.addColorStop(1,'#00000000');
 c.globalAlpha=spill*pulse;c.fillStyle=light;c.fillRect(0,0,384,276);c.globalAlpha=1;
 for(let i=0;i<(reduced?2:6);i++){
  const t=(time*(.9+spill*.4)+i/6)%1,x=390-t*reach,y=260+Math.sin(t*Math.PI)*5;
  const alpha=Math.sin(t*Math.PI)*spill*.85;
  if(boss)painted(c,art,'heads',Math.floor(time*24+i)%8,x,y,102,62,Math.PI,alpha,.71,.5);
  else painted(c,art,'fire',16+Math.floor(time*24+i)%8,x,y,112,56,Math.PI,alpha,.74,.5);
  paintedParticle(c,art,boss?i%3:3,time+i*.11,372+Math.sin(t*6)*7,258-t*205,11+i%2*5,time+i,alpha);
 }
 c.globalCompositeOperation='destination-in';c.drawImage(edgeMask,0,0);c.restore();
 target.save();if(boss){target.translate(w,0);target.scale(-1,1);}target.drawImage(surface,0,0,w,h);target.restore();
}
