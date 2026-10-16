import {hexyMuzzle} from '../actors/hexy/hexyAnimation';
export function drawRibbonControls(c,s,art,reduced=false){
 const img=art['ribbon-bind'];if(!img)return;
 const hand=hexyMuzzle(s);
 for(const e of s.enemies){
  const f=e.ribbonControl;if(!f||e.hp<=0&&!['slam','airbind'].includes(f.kind))continue;
  const x=e.x,y=e.y-32;
  c.save();
  if(f.kind==='pull'||f.kind==='airbind'||f.kind==='slam'&&f.age<.22){
   const origin=f.reel?{x:s.player.x-s.player.dir*20,y:s.player.y-27}:hand,dx=x-origin.x,dy=y-origin.y,len=Math.hypot(dx,dy);c.translate(origin.x,origin.y);c.rotate(Math.atan2(dy,dx));c.globalAlpha=Math.min(1,(f.duration-f.age)*12);
   c.drawImage(img,(reduced?0:Math.floor(f.age*16)%3)*320,320,320,320,-len*.1,-15,len*1.2,30);c.restore();c.save();
  }
  if(f.kind==='bind'||f.kind==='airbind'||f.bound){
   const frame=f.age<.08?0:f.age<.16?1:reduced?2:2+Math.floor(f.age*7)%2;
   c.globalAlpha=Math.min(1,(f.duration-f.age)*7);c.drawImage(img,frame*320,0,320,320,x-44,y-42,88,88);
  }
  c.restore();
 }
}
export function drawRibbonShot(c,q,art){
 const f=q.ribbonPaint,img=art[f?.key||'ribbon-whip'];if(!f||!img)return;
 c.save();c.globalAlpha=q.echoCopy?.7:Math.min(1,q.life*18);c.translate(q.x,q.y);c.rotate(f.angle);c.scale(1,f.flip??(q.ribbonAimX<0?-1:1));
 c.beginPath();c.rect(-f.u*f.w,-f.v*f.h,(f.cut)*f.w,f.h);c.clip();c.drawImage(img,f.frame%4*320,Math.floor(f.frame/4)*320,320,320,-f.u*f.w,-f.v*f.h,f.w,f.h);c.restore();
}
export function drawRibbonImpact(c,q,art,reduced=false){
 if(q.ribbonSlam&&art['ribbon-slam']){const size=q.size||95,frame=reduced?1:Math.min(3,Math.floor(q.age/(q.duration||.34)*4));c.save();c.globalAlpha=Math.min(1,q.life*12);c.drawImage(art['ribbon-slam'],frame*320,320,320,320,q.x-size/2,q.y-size*.78,size,size);c.restore();return;}
 const img=art['ribbon-satin'];if(img){const size=q.size||65;c.save();c.globalAlpha=Math.min(1,q.life*8);c.drawImage(img,(reduced?1:Math.min(3,Math.floor(q.age/.09)))*320,320,320,320,q.x-size/2,q.y-size/2,size,size);c.restore();return;}
 c.save();c.globalAlpha=Math.min(1,q.life*8);
 for(let i=0;i<5;i++){const a=i*Math.PI*2/5,d=8+q.age*60,x=q.x+Math.cos(a)*d,y=q.y+Math.sin(a)*d;c.save();c.translate(x,y);c.rotate(a+q.age*4);c.fillStyle=i%2?'#ffcbdf':'#f35a9a';c.strokeStyle='#692440';c.lineWidth=1.5;c.beginPath();c.moveTo(-7,-4);c.quadraticCurveTo(0,5,7,-4);c.lineTo(6,3);c.quadraticCurveTo(0,9,-7,3);c.closePath();c.fill();c.stroke();c.restore();}
 c.restore();
}
