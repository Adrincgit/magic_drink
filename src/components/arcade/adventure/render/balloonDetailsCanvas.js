import {balloonBombSocket,balloonLeakJets} from '../actors/bosses/balloonHatch';

export function drawBalloonDetails(c,s,art,reduced=false){
 const b=s.boss;if(b.hp<=0)return;
 if(b.transformed)for(const q of balloonLeakJets(s)){
  const frame=reduced?2:(Math.floor((s.time||0)*12)+(q.dir<0?4:0))%8;
  c.save();c.translate(q.x,q.y);c.scale(q.dir,1);c.rotate(-.16);
  // All eight source tips are registered at (20,212), pinned to the tear.
  c.globalAlpha=.88;c.drawImage(art['balloon-air'],frame%4*512,Math.floor(frame/4)*384,512,384,-6.4,-67.84,163.84,122.88);c.restore();
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
