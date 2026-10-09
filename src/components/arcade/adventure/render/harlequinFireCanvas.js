import {painted,paintedParticle} from './paintedDuelCanvas';
import {rushFireScale} from '../actors/bosses/harlequinFire';
const clamp=n=>Math.max(0,Math.min(1,n));
export function drawFireImpact(c,art,q,reduced){
 const progress=clamp(q.age/q.duration),frame=Math.min(7,Math.floor(progress*8)),fade=clamp(q.life/.16);
 // Fixed scale: the actual paintings expand and then break into charcoal smoke.
 painted(c,art,'fire-show',frame,q.x,q.y,q.size,q.size*2/3,0,fade,.5,q.grounded?205/256:.55);
 for(let i=0;i<(reduced?3:10);i++){
  const angle=i*2.4,t=q.age,speed=70+i%4*35;
  paintedParticle(c,art,3,t+i*.13,q.x+Math.cos(angle)*speed*t,q.y-12-Math.abs(Math.sin(angle))*speed*t+t*t*75,14-i%3,t*5,fade*(1-progress));
 }
}
export function drawGroundHeat(c,art,x,y,progress,age,reduced=false){
 const heat=clamp(progress),frame=16+Math.min(7,Math.floor(heat*7.99));
 // Organic painted hot wood and reflected light, without rings, arrows or outlines.
 c.save();c.globalCompositeOperation='screen';
 painted(c,art,'fire-show',frame,x,y+1,125,83,0,.45+heat*.55,.5,205/256);c.restore();
 if(!reduced&&heat>.35)for(let i=0;i<3;i++){
  const t=(age*1.2+i/3)%1;
  paintedParticle(c,art,3,age+i,x-24+i*24,y-t*25,8,age+i,Math.sin(t*Math.PI)*heat*.4);
 }
}
export function drawGroundFire(c,art,q,reduced=false){
 const dying=q.life<.45,fade=clamp(q.age/.08)*clamp(q.life/.45),frame=8+(reduced?2:Math.floor(q.age*24+(q.seed||0))%8);
 // Rush flames are born tall, then consume themselves. Column bases retain
 // their own fixed size and continuity as the tall column dissipates.
 const rush=q.source==='rush'&&q.stage>=2,scale=rushFireScale(q);
 painted(c,art,'fire-show',frame,q.x,q.floor,rush?122*(.55+.45*scale):122,rush?260*scale:82,0,fade,.5,205/256);
 if(dying)for(let i=0;i<3;i++){const t=1-q.life/.45;paintedParticle(c,art,3,q.age+i,q.x+(i-1)*22,q.floor-15-t*35,11,0,fade);}
}
