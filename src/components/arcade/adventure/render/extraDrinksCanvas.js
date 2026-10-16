import {orbitPosition} from '../engine/adventureExtraDrinks';
export function drawHoneySlow(c,e,art){const img=art['honey-fx'];if(!img)return;c.save();c.globalAlpha=.8;c.drawImage(img,0,img.height*2/3,img.width/4,img.height/3,e.x-28,e.y-26,56,32);c.restore();}
export function drawDrinkArc(c,q,art,reduced=false){
 const dx=q.toX-q.x,dy=q.toY-q.y,length=Math.hypot(dx,dy)||1;
 const img=art['volt-beam-v2'];if(!img)return;
 const frame=reduced?1:Math.floor(q.age*18)%4,row=q.voltBurst?1:0,h=(q.voltBurst?120:48+32*(q.strength??1));
 c.save();c.globalAlpha*=Math.min(1,(q.life??.19)/.09);c.translate(q.x,q.y);c.rotate(Math.atan2(dy,dx));
 // One complete painted discharge per connection. Repeated tiles introduced
 // a fresh head and a visible gap at every join, especially on long bursts.
 c.drawImage(img,frame*320+32,row*320,276,320,0,-h*.56,length,h);
 const origin=q.voltBurst?42:22;c.drawImage(img,frame*320,640,320,320,-origin/2,-origin/2,origin,origin);
 const pop=q.voltBurst?78:30+18*(q.strength??1);c.drawImage(img,frame*320,640,320,320,length-pop/2,-pop/2,pop,pop);c.restore();
}
export function drawExtraShot(c,q,art,reduced,cell){
 const frame=reduced?0:Math.floor(q.age*12)%4,scale=q.scale||1;
 if(q.kind===9)cell(c,art,9,0,frame,q.x,q.y,75*scale,44*scale,.5,Math.atan2(q.vy,q.vx));
 if(q.kind===10)cell(c,art,10,0,frame,q.x,q.y,47*scale,55*scale,.7,Math.atan2(q.vy,q.vx)-Math.PI/2);
 if(q.kind===11)cell(c,art,11,0,frame,q.x,q.y,60*scale,54*scale,.5,q.orbitLaunched?Math.atan2(q.vy,q.vx):-q.age*10);
}
export function drawExtraField(c,f,art,reduced,cell){
 const frame=reduced?0:Math.floor(f.age*8)%4;
 if(f.kind===10){
  if(f.puddle)cell(c,art,10,2,Math.min(3,Math.floor(f.age*10)),f.x,f.y,110*f.scale,62*f.scale,.81);
  else cell(c,art,10,1,frame,f.x,f.y,96*f.scale*(f.hiveSize||1),92*f.scale*(f.hiveSize||1));
 }else if(f.kind===11){
  for(const orb of f.orbs)if(orb.alive){const p=orbitPosition(f,orb);cell(c,art,11,1,frame,p.x,p.y,59*f.scale*(f.orbSize||1));}
 }
}
