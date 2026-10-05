const CLOUDS=[
 {x:200,y:150,w:630,h:190,frame:2,speed:1.8,depth:.022,alpha:.7},
 {x:810,y:155,w:680,h:180,frame:0,speed:2.1,depth:.028,alpha:.65},
 {x:1420,y:150,w:640,h:180,frame:3,speed:1.6,depth:.019,alpha:.65},
 {x:2020,y:155,w:600,h:185,frame:2,speed:2,depth:.025,alpha:.7},
 {x:40,y:65,w:560,h:280,frame:0,speed:5,depth:.055},
 {x:610,y:18,w:550,h:350,frame:1,speed:7,depth:.085},
 {x:1200,y:115,w:530,h:235,frame:2,speed:4,depth:.045},
 {x:1730,y:15,w:620,h:345,frame:3,speed:6,depth:.075},
];
export function cloudPositions(camera,time,reduced=false){
 const result=[],period=2350;
 for(const q of CLOUDS){const base=q.x-camera.x*q.depth+(reduced?0:time*q.speed),x=((base+500)%period+period)%period-500;
  for(const at of [x-period,x,x+period])if(at+q.w/2>0&&at-q.w/2<960)result.push({...q,x:at,y:q.y-camera.y*.07});
 }return result;
}
export function drawMeadowSky(c,s,art,reduced){
 c.drawImage(art['sunset-sky'],0,0,960,540);
 const sunX=1090-s.camera.x*.055,sunY=184-s.camera.y*.08;
 const glow=c.createRadialGradient(sunX,sunY,24,sunX,sunY,70);glow.addColorStop(0,'#fff3b99c');glow.addColorStop(1,'#fff3b900');c.fillStyle=glow;c.fillRect(sunX-70,sunY-70,140,140);
 c.fillStyle='#fff0b5';c.beginPath();c.arc(sunX,sunY,34,0,Math.PI*2);c.fill();
 c.save();for(const q of cloudPositions(s.camera,s.time,reduced)){c.globalAlpha=q.alpha??1;c.drawImage(art['sunset-clouds'],q.frame*512,0,512,512,q.x-q.w/2,q.y-q.h/2,q.w,q.h);}c.restore();
}
