import {drawHexy} from './hexyCanvas';
export function drawDiveKick(c,q,art,reduced){
 const img=art.impacts;if(!img)return;
 const cell=img.width/4,frame=reduced?1:Math.min(3,Math.floor(q.age/.08)),size=42+q.age*95;
 c.save();c.globalAlpha=Math.min(1,q.life*8);c.translate(q.x-q.dx*q.age*35,q.y-q.dy*q.age*35);
 c.rotate(Math.atan2(q.dy,q.dx)-Math.PI/2);
 c.drawImage(img,frame*cell,0,cell,cell,-size/2,-size*.65,size,size*.65);c.restore();
}
const paperCache=new WeakMap();
function paperFigure(art){
 if(paperCache.has(art))return paperCache.get(art);
 const canvas=document.createElement('canvas');canvas.width=canvas.height=160;const c=canvas.getContext('2d');
 drawHexy(c,art,{sheet:'reactions',frame:0},80,145,false);
 c.globalCompositeOperation='source-in';c.fillStyle='#ffe4b7';c.fillRect(0,0,160,160);
 c.globalCompositeOperation='source-atop';c.strokeStyle='#d871b8';c.lineWidth=7;
 for(let y=0;y<190;y+=22){c.beginPath();c.moveTo(0,y);c.lineTo(160,y-50);c.stroke();}
 c.fillStyle='#a75a99';c.fillRect(79,0,2,160);
 paperCache.set(art,canvas);return canvas;
}
export function drawPaperDecoy(c,s,art,reduced){
 const d=s.confettiDecoy;if(!d)return;
 const paper=paperFigure(art),grow=reduced?1:Math.min(1,.75+d.age*3);
 c.save();c.globalAlpha*=Math.min(1,d.life/.22);c.translate(d.x,d.y);c.scale(d.dir*grow,grow);
 c.drawImage(paper,-80,-145);c.strokeStyle='#6d3877';c.lineWidth=2;
 c.beginPath();c.moveTo(-15,0);c.lineTo(0,-9);c.lineTo(15,0);c.stroke();c.restore();
}
export function drawTacticalFX(c,q,reduced){
 c.save();c.globalAlpha*=Math.min(1,q.life/.16);
 if(q.confetti){
  for(let i=0;i<24;i++){const a=i*2.4,v=36+i%5*13,t=q.age,x=q.x+Math.cos(a)*v*t,y=q.y+Math.sin(a)*v*t+120*t*t;
   c.save();c.translate(x,y);c.rotate(reduced?i:t*5+i);c.fillStyle=['#ffd575','#de76b6','#77dce1'][i%3];c.fillRect(-3,-2,6,4);c.restore();}
 }else{
  c.translate(q.x,q.y);c.strokeStyle='#fff7cb';c.lineWidth=3;
  for(let i=0;i<3;i++){c.beginPath();c.arc(0,0,12+q.age*65+i*7,-1.1,1.1);c.stroke();}
  c.fillStyle='#ffe876';c.font='bold 26px Georgia';c.textAlign='center';c.fillText('♪',0,-12-q.age*35);
 }c.restore();
}
export function drawReturnedBolt(c,q){
 c.save();c.translate(q.x,q.y);c.rotate(Math.atan2(q.vy,q.vx));
 c.fillStyle='#fce09c';c.strokeStyle='#74449f';c.lineWidth=2;
 c.beginPath();c.moveTo(14,0);c.lineTo(-8,-9);c.lineTo(-3,0);c.lineTo(-8,9);c.closePath();c.fill();c.stroke();
 c.strokeStyle='#fff1bb';c.beginPath();c.moveTo(-14,-4);c.lineTo(-26,-4);c.moveTo(-14,4);c.lineTo(-22,4);c.stroke();c.restore();
}
