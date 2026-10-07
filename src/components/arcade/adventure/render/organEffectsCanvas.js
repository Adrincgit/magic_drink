// Soft steam and physical pieces use the same world geometry as the machine.
import {organShotScale} from '../actors/bosses/adventureOrganFortress';
import {organDrivePoint} from '../actors/bosses/organMechanism';
export function drawOrganWave(c,q,art,reduced=false){
 const size=(q.drawSize||86)*organShotScale(q),frame=reduced?0:Math.floor(q.age*12)%4;
 c.save();c.beginPath();c.rect(q.x-size,q.y-size,size*2,Math.max(1,(q.floor??q.y+18)-q.y+size));c.clip();
 c.drawImage(art['organ-sonic'],frame*512,0,512,512,q.x-size*.34,q.y-size*.72,size,size);c.restore();
}
export function drawOrganDriveTrail(c,s,m,reduced=false){
 if(reduced)return;
 for(const q of s.organDust||[]){
  const t=q.age/(q.life+q.age),r=q.r+q.age*32;
  c.save();c.beginPath();c.rect(q.x-r*1.5,q.y-r*1.4,r*3,Math.max(1,q.floor+5-q.y+r*1.4));c.clip();
  c.globalAlpha=Math.min(1,q.age/.06)*(1-t)*.8;c.translate(q.x,q.y);c.scale(r,r);
  c.beginPath();c.moveTo(-1,.1);c.bezierCurveTo(-1.2,-.4,-.75,-.65,-.45,-.5);
  c.bezierCurveTo(-.55,-1.1,.25,-1.05,.35,-.55);c.bezierCurveTo(.95,-.8,1.3,-.2,1,.2);
  c.bezierCurveTo(.85,.65,-.65,.6,-1,.1);
  const color=c.createLinearGradient(0,-1,0,.6);color.addColorStop(0,'#f4e5be');color.addColorStop(1,'#b49a70');
  c.fillStyle=color;c.fill();c.strokeStyle='#827259';c.lineWidth=1.6/r;c.stroke();c.restore();
 }
 const b=s.boss;if(!b.charge||b.phase!=='attack'||b.driveSpeed>=0)return;
 const speed=Math.min(1,Math.abs(b.driveSpeed)/900);if(speed<.22)return;
 c.save();c.lineCap='round';
 for(let i=0;i<7;i++){
  const t=((s.time||0)*5+i*.23)%1,y=m.body.y+30+i*34,x=m.body.x+m.body.w-18+t*40,length=(48+i%3*22)*speed;
  const trail=c.createLinearGradient(x,y,x+length,y);trail.addColorStop(0,'#fff0c1');trail.addColorStop(1,'#fff0c100');
  c.globalAlpha=(1-t*.7)*speed*.48;c.strokeStyle=trail;c.lineWidth=i%2?1.5:2.7;
  c.beginPath();c.moveTo(x,y);c.lineTo(x+length,y);c.stroke();
 }
 c.restore();
}
export function drawOrganRedNote(c,q,art,reduced=false){
 const size=(q.drawSize||68)*1.35*organShotScale(q),frame=reduced?0:Math.floor(q.age*12)%4;
 c.save();c.translate(q.x,q.y);if(q.vx>0)c.scale(-1,1);
 c.drawImage(art['organ-sonic'],frame*512,512,512,512,-size*.38,-size*.56,size,size);c.restore();
}
export function drawOrganSteam(c,s,m,reduced=false){
 const b=s.boss,burst=b.steamRelease||0;
 if(b.phase==='sleep'||(b.shattered&&!burst))return;
 const vents=b.shattered?[{x:m.anchor.x-45,y:m.anchor.y-185},{x:m.anchor.x+45,y:m.anchor.y-205}]:
  [{x:m.body.x+44,y:m.body.y+62},{x:m.body.x+m.body.w-44,y:m.body.y+62}];
 if(!b.shattered&&b.move!=='organ-fanfare'&&b.release>0)vents.push(...m.outlets);
 c.save();
 for(let j=0;j<vents.length;j++)for(let i=0;i<4;i++){
  const t=reduced?(i+.4)/4:((s.time||0)*.72+i/4+j*.21)%1;
  const q=organDrivePoint(m.drive,vents[j]),radius=7+t*(burst?22:12),x=q.x+(j%2?1:-1)*t*23,y=q.y-t*(burst?100:62);
  const glow=c.createRadialGradient(x,y,0,x,y,radius);
  const alpha=(1-t)*(burst?.26:.12);
  glow.addColorStop(0,`rgba(255,247,225,${alpha})`);glow.addColorStop(.5,`rgba(236,235,218,${alpha*.72})`);glow.addColorStop(1,'rgba(233,236,223,0)');
  c.fillStyle=glow;c.fillRect(x-radius,y-radius,radius*2,radius*2);
 }
 c.restore();
}

export function drawOrganDebris(c,s,art,reduced=false){
 for(const q of s.organDebris||[]){
  const img=art[q.art];if(!img)continue;
  const [x,y,w,h]=q.crop;
  c.save();c.globalAlpha=Math.min(1,q.life/.7);c.translate(q.x,q.y);c.rotate(reduced?0:q.rotation);
  if(q.jagged){
   const edge=[[-.5,-.47],[-.1,-.5],[.12,-.43],[.48,-.5],[.44,-.1],[.5,.19],[.43,.5],[-.13,.45],[-.5,.5],[-.44,.13],[-.5,-.1]];
   c.beginPath();edge.forEach(([px,py])=>c.lineTo(px*q.w,py*q.h));c.closePath();c.clip();
  }
  c.drawImage(img,x*img.width,y*img.height,w*img.width,h*img.height,-q.w/2,-q.h/2,q.w,q.h);c.restore();
 }
}
