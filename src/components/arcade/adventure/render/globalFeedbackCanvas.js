import {enemyGeometry} from '../actors/enemies/adventureEnemyGeometry';
import {hexyMuzzle} from '../actors/hexy/hexyAnimation';
import {paintMagicLight} from './projectileLightsCanvas';

function cel(c,img,frame,x,y,w,h=w,rotation=0,baseline=.5){
 if(!img)return;c.save();c.translate(x,y);c.rotate(rotation);
 c.drawImage(img,frame%4*320,Math.floor(frame/4)*320,320,320,-w/2,-h*baseline,w,h);c.restore();
}
export function drawSurfaceDust(c,s,art,reduced){
 for(const q of s.surfaceDust||[]){
  const u=q.age/q.life,row=q.material==='sand'?2:q.material==='soil'?3:4;
  c.save();c.globalAlpha=q.opacity*(1-u)*(reduced?.65:1);
  cel(c,art['feedback-elements'],row*4+Math.min(3,Math.floor(u*4)),q.x,q.y,q.size*(1+u*.35),q.size*.65,0,270/320);c.restore();
 }
}
export function drawFireTrails(c,s,art,reduced){
 for(const q of s.shots){
  if(q.kind!==0||q.hidden||q.life<=0)continue;
  const angle=Math.atan2(q.vy,q.vx),trail=q.fireTrail||[],size=q.heavy?48:28;
  for(const [i,p]of trail.entries()){
   if(reduced&&i%3!==0)continue;const fade=Math.max(0,1-p.age/.22),taper=.32+fade*.68;
   c.save();c.globalAlpha=fade*(q.heavy?.56:.42);
   cel(c,art['feedback-elements'],20+(Math.floor(q.age*18)+i)%4,p.x,p.y,size*1.7*taper,size*.75*taper,angle);c.restore();
  }
  paintMagicLight(c,q.x,q.y,q.heavy?100:59,'#ff9d3b',q.heavy?.42:.22);
 }
}
export function drawEnemyFlames(c,e,art,reduced){
 if(!e.burning||e.charred)return;
 const {w,h}=enemyGeometry(e),burn=e.burning,fade=Math.min(1,burn.life/.24);
 for(let i=0;i<3;i++){
  const size=Math.min(49,h*.4)*(i===1?1:.75),x=e.x+(i-1)*w*.27,y=e.y-h*(i===1?.45:.22);
  c.save();c.globalAlpha=fade*.9;
  cel(c,art['feedback-elements'],reduced?2:(Math.floor(burn.age*16)+i*2)%8,x,y,size,size*1.15,0,300/320);c.restore();
 }
 paintMagicLight(c,e.x,e.y-h*.4,h*.65,'#ff9c36',fade*.18);
}
export function drawHexyCastFlame(c,s,art,reduced){
 const p=s.player;if(s.weapon!==0||s.basicFire||p.candy||p.cast<=0&&p.specialCast<=0)return;
 const m=hexyMuzzle(s),angle=Math.atan2(p.aimY,p.aimX||p.dir),size=p.specialCast>0?48:28;
 c.save();c.globalAlpha=Math.min(1,Math.max(p.cast/.24,p.specialCast/.36))*.8;
 cel(c,art['feedback-elements'],20+(reduced?1:Math.floor(s.time*18)%4),m.x+Math.cos(angle)*5,m.y+Math.sin(angle)*5,size,size*.8,angle);c.restore();
}
