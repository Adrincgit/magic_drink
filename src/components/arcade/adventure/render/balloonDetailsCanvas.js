import {balloonBombSocket,balloonLeakJets} from '../actors/bosses/balloonHatch';

export function drawBalloonDetails(c,s,art,reduced=false){
 const b=s.boss;if(b.hp<=0)return;
 if(b.transformed){
  c.save();
  for(const q of balloonLeakJets(s))for(let i=0;i<3;i++){
   const t=reduced?(i+.5)/3:((s.time||0)*1.3+i/3)%1,x=q.x+q.dir*t*72,y=q.y-t*30;
   c.globalAlpha=(1-t)*.38;c.strokeStyle='#fff6d9';c.lineWidth=1.4+(1-t)*1.8;
   c.beginPath();c.moveTo(x,y);c.bezierCurveTo(x+q.dir*9,y-5,x+q.dir*21,y+7,x+q.dir*31,y-3);c.stroke();
   const mist=c.createRadialGradient(x,y,0,x,y,10+t*12);mist.addColorStop(0,'#fff7dfaa');mist.addColorStop(1,'#fff7df00');
   c.fillStyle=mist;c.fillRect(x-23,y-23,46,46);
  }
  c.restore();
 }
 const q=balloonBombSocket(s),open=b.hatchOpen||0,w=76,h=19,img=art['balloon-hatch'];
 c.save();c.translate(q.x,q.y-6);
 c.fillStyle='#271428';c.beginPath();c.ellipse(0,0,w/2-4,h/2,0,0,Math.PI*2);c.fill();
 // Each leaf pivots on its outer hinge; the opening is visible before a drop.
 for(const dir of [-1,1]){
  c.save();c.translate(dir*w/2,0);c.rotate(-dir*open*1.05);
  c.drawImage(img,dir<0?0:img.width/2,0,img.width/2,img.height,dir<0?0:-w/2,-h/2,w/2,h);c.restore();
 }
 c.restore();
}
