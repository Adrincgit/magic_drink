import {enemyDrawing} from './adventureSprites';
const clamp=x=>Math.max(0,Math.min(1,x));
function cell(c,img,frame,x,y,size,flip=false,center=false){
 if(!img)return;const w=img.width/4;c.save();c.translate(x,y);if(flip)c.scale(-1,1);c.drawImage(img,frame%4*w,Math.floor(frame/4)*w,w,w,-size/2,center?-size/2:-size*250/256,size,size);c.restore();
}
export function drawPopcornPoof(c,q,art,reduced){
 c.save();c.globalAlpha*=clamp(q.life/.14);cell(c,art['popcorn-defeat-v2'],12+(reduced?1:Math.min(3,Math.floor(q.age/q.duration*4))),q.x,q.y,q.size,false,true);c.restore();
}
export function drawPopcornDefeat(c,e,art,reduced){
 const q=e.popcornDefeat;if(!q)return false;
 const a=q.age,fade=clamp((q.duration-a)/.45),zombie=q.zombie;
 c.save();c.globalAlpha*=fade;
 if(q.style==='vapor'&&zombie){cell(c,art['popcorn-defeat-v2'],Math.min(7,Math.floor(a/.105)),e.x+q.dir*a*18,e.y,q.size*.91,e.dir>0);}
 else{
  c.save();c.translate(e.x,e.y-q.height*.4);
  if(q.style!=='vapor')c.rotate(zombie?(q.landed?0:Math.max(-.4,Math.min(.4,q.rotation*.2))):q.landed?q.dir*1.45:Math.max(-2,Math.min(2,q.rotation)));
  else{c.globalAlpha*=clamp(1-a/.55);c.translate(q.dir*a*35,-a*30);c.scale(1+a*.2,1-a*.3);}
  if(q.pumpkin)cell(c,art['village-pumpkin-finish-v7'],q.landed?3:Math.min(2,Math.floor(a/.14)),0,q.height*.4,q.size*.82,e.dir>0);
  else if(zombie)cell(c,art['popcorn-defeat-v2'],q.landed?11:8+Math.min(2,Math.floor(a/.14)),0,q.height*.4,q.size*.72,e.dir>0);
  else{const drawing=enemyDrawing({...e,hp:1,flash:.1,phase:'patrol',action:0,elementHit:null},true);cell(c,art[drawing.key],drawing.frame,0,q.height*.4,drawing.size||q.size,e.dir>0);}
  c.restore();
  for(const p of q.parts){c.save();c.translate(p.x,p.y);c.rotate(p.landed?(p.frame%2?.13:-.12):p.rotation);cell(c,art[p.key||'nightmare-clothed-limbs-v7'],p.frame,0,0,p.size,false,true);c.restore();}
  if(q.style==='vapor')drawPopcornPoof(c,{x:e.x+q.dir*a*30,y:e.y-q.height*.5,size:q.size*(.85+a*.6),age:a,duration:q.duration,life:q.duration-a},art,reduced);
  else if(a>1.15){for(const p of q.parts)drawPopcornPoof(c,{x:p.x,y:p.y,size:57,age:a-1.15,duration:.65,life:q.duration-a},art,reduced);}
 }
 c.restore();return true;
}
