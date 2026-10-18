import {cameraView} from './adventureCamera';
import {ultimateHand,HARLEQUIN_ULTIMATE} from '../actors/bosses/harlequinUltimate';
import {SUPER_WINDUP} from '../engine/adventureMagic';
import {clashContact} from '../engine/adventurePowerClash';
import {clashEffect} from './clashSpectacleCanvas';
import {painted,paintedParticle} from './paintedDuelCanvas';
import {opponentLight} from '../engine/clashActing';
import {drawChargeStreak} from './chargeEnergyCanvas';
import {paintMagicLight} from './projectileLightsCanvas';
const clamp=n=>Math.max(0,Math.min(1,n));
export function harlequinChargeAge(s){
 const age=s.boss.ultimate?.age||0,q=s.powerClash;
 // A counterattack freezes the boss clock. Continue each existing journey
 // smoothly and gather its last embers before both casters release together.
 return q?.state==='windup'?age+Math.max(0,HARLEQUIN_ULTIMATE.charge-age)*clamp(q.age/SUPER_WINDUP):age;
}
export function harlequinChargeParticle(s,i,age=harlequinChargeAge(s)){
 const tip=ultimateHand(s.boss),v=cameraView(s),order=(i*17)%48,angle=i*2.399;
 const start=.03+order/47*.42,arrival=HARLEQUIN_ULTIMATE.charge-.2-order/47*.5;
 const phase=clamp((age-start)/(arrival-start)),t=phase*phase;
 const from={x:s.camera.x+v.width*(.5+Math.cos(angle)*.49),y:s.camera.y+v.height*(.47+Math.sin(angle)*.46)};
 return{x:from.x+(tip.x-from.x)*t,y:from.y+(tip.y-from.y)*t+Math.sin(phase*Math.PI)*Math.sin(angle)*80,phase,tip,from};
}
export function harlequinChargeTrail(s,i,age=harlequinChargeAge(s),reduced=false){
 const points=[];
 for(let j=reduced?4:8;j>=0;j--){const at=age-j*.012;if(at>=0)points.push(harlequinChargeParticle(s,i,at));}
 return points;
}
export function drawChargeStreams(c,s,art,reduced){
 const u=s.boss.ultimate;if(u?.state!=='charge')return;
 const h=ultimateHand(s.boss),age=harlequinChargeAge(s),count=reduced?10:48;
 c.save();
 for(let i=0;i<count;i++){
  const p=harlequinChargeParticle(s,i,age),alpha=clamp(p.phase*10)*clamp((1-p.phase)*10)*clamp(age/.2),angle=Math.atan2(h.y-p.y,h.x-p.x);
  drawChargeStreak(c,harlequinChargeTrail(s,i,age,reduced),alpha,reduced,true);
  if(!reduced&&i%4===0)painted(c,art,'heads',8+Math.floor(age*24+i)%8,p.x,p.y,55-p.phase*20,48-p.phase*17,angle,alpha*.85,.71,.5);
  paintedParticle(c,art,i%7===0?4:3,age+i*.1,p.x,p.y,18+i%4*6,angle+age*3,alpha);
 }
 const progress=clamp(age/HARLEQUIN_ULTIMATE.charge),fade=clamp(age/.15),pulse=reduced?1:1+Math.sin(age*27)*.06;
 paintMagicLight(c,h.x,h.y,(42+progress*50)*pulse,'#ff522b',fade*(.3+progress*.35));
 paintMagicLight(c,h.x,h.y,20+progress*19,'#ffb460',fade*(.45+progress*.3));
 c.restore();
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
