import {painted} from './paintedDuelCanvas';
const clamp=n=>Math.max(0,Math.min(1,n));
export function drawAquaJet(c,s,art,reduced=false){
 const jet=s.aquaJet,points=jet?.points;if(!points||points.length<2)return;
 const fade=clamp(jet.life/.16),flow=reduced?0:jet.age*22;
 const width=t=>(4+Math.min(1,t/1.1)*11)*(1+Math.sin(t*31-flow)*.1)*jet.scale;
 c.save();c.globalAlpha*=fade;
 // A continuous ribbon follows the same ballistic samples used by collision.
 // Narrow at the wand, heavier at the falling end; white currents travel along it.
 for(const [color,factor]of [['#075a86',1],['#31bceb',.76],['#bdf8ff',.34]]){
  c.beginPath();
  for(const side of [1,-1])for(let j=0;j<points.length;j++){
   const i=side===1?j:points.length-1-j,p=points[i],a=points[Math.max(0,i-1)],b=points[Math.min(points.length-1,i+1)];
   const dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1;
   const ripple=Math.sin(p.t*44-flow+side)*Math.min(1,p.t*6)*jet.scale;
   const w=width(p.t)*factor*side+ripple;
   const x=p.x-dy/len*w,y=p.y+dx/len*w;
   if(side===1&&j===0)c.moveTo(x,y);else c.lineTo(x,y);
  }
  c.closePath();c.fillStyle=color;c.globalAlpha=fade*(color==='#075a86'?.8:.85);c.fill();
 }
 c.strokeStyle='#f2ffff';c.lineCap='round';c.lineWidth=2*jet.scale;c.globalAlpha=fade*.8;
 for(let i=1;i<points.length-2;i++)if((i-Math.floor((reduced?0:jet.age)*85))%9===0){const a=points[i],b=points[i+2];c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();}
 // Small painted crests travel with the current, breaking up the flat ribbon.
 const img=art['aqua-fx'],sw=img.width/4,sh=img.height/2;
 for(let i=4;i<points.length-2;i+=9){
  const index=4+(i-4+Math.floor((reduced?0:jet.age)*38))%(points.length-5),p=points[index],next=points[index+1];
  const w=width(p.t)*4.4;
  c.save();c.translate(p.x,p.y);c.rotate(Math.atan2(next.y-p.y,next.x-p.x));c.globalAlpha=fade*.75;
  c.drawImage(img,(reduced?1:Math.floor(jet.age*12+i)%4)*sw,0,sw,sh,-w*.56,-w*.4,w,w*.8);c.restore();
 }
 const head=points.at(-1),before=points.at(-2);
 drawAquaShot(c,{...head,age:jet.age,vx:head.x-before.x,vy:head.y-before.y,scale:jet.scale*(jet.grounded?1.15:1.8)},art,reduced);
 c.restore();
}
function waterCell(c,art,row,frame,x,y,w,h,alpha=1,anchor=.5){
 const img=art['aqua-quench'];if(!img||alpha<=0)return;
 c.save();c.globalAlpha*=alpha;
 c.drawImage(img,frame*256,row*256,256,256,x-w/2,y-h*anchor,w,h);c.restore();
}
export function drawAquaShot(c,q,art,reduced){
 const img=art['aqua-fx'],cw=img.width/4,ch=img.height/2,frame=reduced?1:Math.floor(q.age*16)%4;
 const w=(q.heavy?175:66)*(q.scale||1),h=(q.heavy?116:44)*(q.scale||1);
 c.save();c.translate(q.x,q.y);c.rotate(Math.atan2(q.vy,q.vx));
 c.drawImage(img,frame*cw,0,cw,ch,-w*.56,-h/2,w,h);c.restore();
}
export function drawAquaGround(c,s,art,reduced=false){
 for(const q of s.effects){
  if(q.aquaKind==='puddle'||q.aquaKind==='landing'){
   const t=clamp(q.age/q.duration),landing=q.aquaKind==='landing';
   c.save();c.translate(q.x,q.y);c.transform(1,q.slope||0,0,1,0,0);
   waterCell(c,art,landing?0:2,Math.min(3,Math.floor(t*4)),0,0,q.size*(landing?1:1+t*.3),q.size,clamp(q.life/(landing?.12:.8))*(landing?.8:.42),landing?228/256:.5);
   c.restore();
  }else if(q.aquaKind==='extinction'){
   const t=clamp(q.age/q.duration),strength=(.25+.75*q.strength)*(1-t);
   painted(c,art,'fire-show',8+(reduced?2:Math.floor(q.age*24)%8),q.x,q.y,q.size*(.65+.35*strength),q.height*strength,0,(1-t)*.85,.5,205/256);
  }
 }
}
export function drawAquaSplash(c,q,art,reduced=false){
 if(q.age<0)return;
 if(['puddle','landing','extinction'].includes(q.aquaKind))return;
 if(q.aquaKind==='drop'){
  if(reduced&&q.seed%2)return;
  c.save();c.translate(q.x,q.y);c.rotate(Math.atan2(q.vy,q.vx)-Math.PI/2);
  waterCell(c,art,3,q.seed%4,0,0,q.size*1.4,q.size*1.4,clamp(q.life/.15));c.restore();return;
 }
 if(q.aquaKind==='steam'){
  if(reduced&&q.seed===2)return;
  const t=clamp(q.age/q.duration),frame=(reduced?1:t*3),lo=Math.floor(frame),mix=frame-lo;
  const size=q.size*(.65+t*.75),x=q.x+q.vx*q.age,y=q.y-q.rise*q.age-8*q.age*q.age;
  const alpha=clamp(q.age/.14)*Math.pow(1-t,1.2)*(q.opacity||.6);
  waterCell(c,art,1,lo,x,y,size,size,alpha*(1-mix),228/256);
  if(mix>0)waterCell(c,art,1,Math.min(3,lo+1),x,y,size,size,alpha*mix,228/256);
  return;
 }
 if(q.aquaKind==='impact'){
  const t=clamp(q.age/q.duration),frame=Math.min(3,Math.floor(t*4));
  c.save();c.translate(q.x,q.y);
  if(q.grounded){c.transform(1,q.slope||0,0,1,0,0);waterCell(c,art,0,frame,0,0,q.size,q.size,clamp(q.life/.13),228/256);}
  else{
   // Air contact bursts outward; the ground crown is reserved for landing.
   const img=art['aqua-fx'],cw=img.width/4,ch=img.height/2;
   c.globalAlpha*=clamp(q.life/.24)*.85;
   c.drawImage(img,Math.min(1,frame)*cw,ch,cw,ch,-q.size/2,-q.size/2,q.size,q.size);
  }
  c.restore();return;
 }
 const img=art['aqua-fx'],cw=img.width/4,ch=img.height/2,t=Math.min(1,q.age/(q.duration||.32)),frame=Math.min(3,Math.floor(t*4));
 c.save();c.globalAlpha=Math.min(1,(1-t)*3);
 c.drawImage(img,frame*cw,ch,cw,ch,q.x-q.size/2,q.y-q.size*.72,q.size,q.size);c.restore();
}
export function drawVitalHeart(c,art,x,y,size=55){
 const img=art['vital-heart'];c.drawImage(img,x-size/2,y-size/2,size,size);
}
