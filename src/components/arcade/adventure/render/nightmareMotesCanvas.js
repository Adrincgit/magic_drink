export function drawNightmareMote(c,art,kind,age,x,y,size,angle=0,alpha=1){
 const img=art['nightmare-purple-energy'];if(!img||alpha<=0)return;
 const side=img.width/4,frame=(kind?4:0)+Math.floor(age*12)%4;
 c.save();c.globalAlpha*=alpha;c.translate(x,y);c.rotate(angle);
 c.drawImage(img,frame%4*side,Math.floor(frame/4)*side,side,side,-size/2,-size/2,size,size);c.restore();
}
export function drawNightmareChargeTrail(c,points,alpha,reduced=false){
 if(points.length<2||alpha<=0)return;const a=points[0],b=points.at(-1);
 c.save();c.globalCompositeOperation='screen';c.globalAlpha*=alpha;
 const g=c.createLinearGradient(a.x,a.y,b.x,b.y);g.addColorStop(0,'#6924cf00');g.addColorStop(.5,'#9d4eff88');g.addColorStop(1,'#e0b5ffff');
 c.strokeStyle=g;c.lineWidth=reduced?3:7;c.lineCap='round';c.lineJoin='round';c.shadowBlur=reduced?0:13;c.shadowColor='#8a37ff';
 c.beginPath();points.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.stroke();c.restore();
}
