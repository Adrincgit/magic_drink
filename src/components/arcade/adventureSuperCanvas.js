import {SUPER_WINDUP,SUPER_DURATION} from './adventureMagic';
import {cameraView} from './adventureCamera';

const clamp=n=>Math.max(0,Math.min(1,n));
function star(c,x,y,r,color){
 c.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,k=i%2?r*.43:r;c.lineTo(x+Math.cos(a)*k,y+Math.sin(a)*k);}c.closePath();c.fillStyle=color;c.fill();
}

// The world has already been painted. Shade it before drawing Hexy, so her
// silhouette and the hand-painted spell remain the brightest parts of the act.
export function superBackdrop(c,s,reduced){
 const q=s.superCinematic;if(!q)return;
 const fade=clamp(q.age/.18)*clamp((SUPER_DURATION-q.age)/.3),p=s.player;
 const view=cameraView(s);
 c.save();c.fillStyle=`rgba(19,7,45,${.67*fade})`;c.fillRect(s.camera.x-8,s.camera.y-8,view.width+16,view.height+16);
 const g=c.createRadialGradient(p.x,p.y-48,5,p.x,p.y-48,210);g.addColorStop(0,'#eec4ff60');g.addColorStop(.45,'#aa49c529');g.addColorStop(1,'#662ea500');c.fillStyle=g;c.fillRect(p.x-210,p.y-258,420,420);
 if(q.age<SUPER_WINDUP){
  const t=q.age/SUPER_WINDUP;
  for(let i=0;i<16;i++){
   const a=i*Math.PI/8+(reduced?0:q.age*.5),r=35+(1-t)*175;
   c.globalAlpha=fade*(.35+t*.65);star(c,p.x+Math.cos(a)*r,p.y-48+Math.sin(a)*r*.6,2+t*4,i%2?'#ffd977':'#a5f0ff');
  }
  c.globalAlpha=fade;c.strokeStyle='#fff1af';c.lineWidth=2+t*2;c.beginPath();c.ellipse(p.x,p.y+1,28+t*30,6+t*5,0,0,Math.PI*2);c.stroke();
 }
 c.restore();
}

export function superBeam(c,s,art,reduced){
 const q=s.superCinematic;if(!q||q.age<SUPER_WINDUP)return;
 const age=q.age-SUPER_WINDUP,fade=clamp((SUPER_DURATION-q.age)/.3),grow=clamp(age/.12),frame=reduced?1:Math.floor(age*12)%4;
 c.save();c.translate(q.origin.x,q.origin.y);c.scale(q.dir,1);c.globalAlpha=fade;
 // Four broad painted frames flow for two seconds instead of flying away.
 c.shadowColor='#f6c3ff';c.shadowBlur=reduced?8:20;
 c.drawImage(art['super-beam'],0,frame*256,1024,256,-22,-128,1080*grow,256);
 c.shadowBlur=0;
 const core=c.createRadialGradient(0,0,2,0,0,75);core.addColorStop(0,'#fff8d9');core.addColorStop(.2,'#fff0aaba');core.addColorStop(1,'#f486fa00');c.fillStyle=core;c.fillRect(-75,-75,150,150);
 for(let i=0;i<11;i++){
  const x=reduced?i*90:((age*530+i*97)%1050),y=Math.sin(i*4+(reduced?0:age*8))*75;
  star(c,x,y,4+i%3*3,i%2?'#fff1a0':'#b4f6ff');
 }
 if(!reduced&&age<.15){const view=cameraView(s);c.globalAlpha=(1-age/.15)*.25;c.fillStyle='#fff1d5';const left=q.dir>0?s.camera.x-q.origin.x:q.origin.x-s.camera.x-view.width;c.fillRect(left,s.camera.y-q.origin.y,view.width,view.height);}
 c.restore();
}

export function superCaption(c,s,en){
 const q=s.superCinematic;if(!q)return;
 const fade=clamp(q.age/.15)*clamp((SUPER_DURATION-q.age)/.25);
 c.save();c.globalAlpha=fade;c.textAlign='center';c.lineJoin='round';
 const y=c.canvas.clientWidth<600?270:114;c.font='400 36px BakeSoda, sans-serif';c.lineWidth=7;c.strokeStyle='#2a153e';c.fillStyle='#fff0aa';
 const title=en?'STARLIGHT ENCORE!':'¡ENCORE ESTELAR!';c.strokeText(title,480,y);c.fillText(title,480,y);
 c.font='bold 11px sans-serif';c.fillStyle='#f3c5ed';c.fillText(en?'INVINCIBLE · LET THE STARS SING':'INVENCIBLE · QUE CANTEN LAS ESTRELLAS',480,y+22);
 // Smooth bars frame the performance; they do not cover the in-game HUD.
 c.fillStyle='#170c2f99';c.fillRect(0,508,960,32);c.fillStyle='#e9c777';c.fillRect(0,508,960*clamp(q.age/SUPER_DURATION),2);
 c.restore();
}
