import {cameraView} from './adventureCamera';
import {ultimateHand} from '../actors/bosses/harlequinUltimate';
import {clashContact} from '../engine/adventurePowerClash';
import {clashEffect} from './clashSpectacleCanvas';
import {painted,paintedParticle} from './paintedDuelCanvas';
import {opponentLight} from '../engine/clashActing';
const clamp=n=>Math.max(0,Math.min(1,n));
export function drawChargeStreams(c,s,art,reduced){
 const u=s.boss.ultimate;if(u?.state!=='charge')return;
 const h=ultimateHand(s.boss),v=cameraView(s),age=u.age+(s.powerClash?.age||0),count=reduced?10:48;
 c.save();
 for(let i=0;i<count;i++){
  const phase=(age*(.65+(i%5)*.06)+i*.618)%1,t=phase*phase,angle=i*2.399;
  // Spawn around the viewport perimeter, converge on the actual hands.
  const startX=s.camera.x+v.width*(.5+Math.cos(angle)*.49),startY=s.camera.y+v.height*(.47+Math.sin(angle)*.46);
  const x=startX+(h.x-startX)*t,y=startY+(h.y-startY)*t+Math.sin(phase*Math.PI)*Math.sin(angle)*80;
  const size=15+i%4*5,alpha=clamp(phase*8)*clamp((1-phase)*8)*clamp(age/.2);
  paintedParticle(c,art,i%7===0?4:3,age+i*.1,x,y,size,angle+age*3,alpha);
 }c.restore();
}
export function drawClashAtmosphere(c,s,art,reduced){
 const q=s.powerClash;if(!q||!['contest','resolve'].includes(q.state))return;
 const h=clashContact(s),age=q.contestAge,view=cameraView(s),floor=s.level.arena.y;
 c.save();
 // Recoil plumes originate under the planted shoes, behind EACH caster.
 // No floating floor dust under an airborne Hexy.
 for(const [boss,actor]of [[false,s.player],[true,s.boss]]){
  const planted=boss?Math.abs(actor.y-floor)<4:actor.ground!==null&&Math.abs(actor.y-floor)<4;
  if(planted)for(let i=0;i<(reduced?1:3);i++){
   const t=(age*.9+i/3)%1,frame=Math.min(7,Math.floor(t*8));
   // The drawing itself evolves from a low jet into a rising, detached curl.
   // Keep its source at the heel; only released late wisps drift away.
   const drift=Math.max(0,t-.6)*90;
   c.save();c.translate(actor.x-actor.dir*(20+drift),floor-Math.max(0,t-.65)*45);c.scale(-actor.dir,1);
   painted(c,art,'dust',frame,0,0,230,287,0,clamp(t/.10)*clamp((1-t)/.22)*.53,.08,.89);c.restore();
  }
  // Enemy-coloured reflected light grows as the collision approaches a caster.
  const spill=opponentLight(q,boss);
  if(spill>0){
   c.save();c.globalCompositeOperation='screen';c.globalAlpha=spill*(reduced?.4:.4+Math.sin(age*18)*.06);
   const x=actor.x+actor.dir*25,y=actor.y-(boss?90:55),g=c.createRadialGradient(x,y,5,x,y,125);
   g.addColorStop(0,boss?'#ffe793b0':'#ff8c39b0');g.addColorStop(.45,boss?'#f176bd65':'#ea482653');g.addColorStop(1,'#ffffff00');c.fillStyle=g;c.fillRect(x-125,y-125,250,250);c.restore();
  }
 }
 // Painted ground dust expands away from the contact, anchored to the stage.
 for(let side=-1;side<=1;side+=2)for(let i=0;i<3;i++){
  const t=(age*.6+i/3)%1,size=100+t*150;
  clashEffect(c,art,2,Math.min(3,Math.floor(t*4)),h.x+side*(70+t*350),floor-size*.14,size,(1-t)*.2);
 }
 if(!reduced){
  // Painted crescents break apart rather than outlining geometric circles.
  for(let i=0;i<4;i++){
   const t=(age*.8+i/4)%1,side=i%2?1:-1,r=85+t*270;
   painted(c,art,'heads',16+(i%2)*8+Math.floor(t*8),h.x+side*r,h.y-45-t*110,110+t*150,100+t*135,side*.7,(1-t)*.3);
  }
  // Different depth/speed/size for falling stage chips. Deterministic and bounded.
  for(let i=0;i<22;i++){
   const depth=.5+(i%4)*.35,t=(age*(.19+depth*.13)+i*.618)%1,x=s.camera.x+((i*.381966+Math.sin(age*.4+i)*.018)%1)*view.width;
   const y=s.camera.y-30+t*(view.height+90),size=(3+i%5)*depth;
   paintedParticle(c,art,5,age+i,x,y,size*3.5,age*(i%2?1:-1)*depth+i,clamp(age/.5)*clamp(t*12)*clamp((1-t)*9)*.8);
  }
 }c.restore();
}
