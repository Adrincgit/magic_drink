import {drawNightmareWind,drawNightmarePressureLight} from './nightmarePressureAtmosphere';
import {NIGHTMARE_PERFORMANCE_VORTEX} from '../actors/bosses/nightmarePerformanceRegistration';
import {nightmareContact} from '../engine/nightmarePowerClash';
import {nightmareCrown,NIGHTMARE_ULTIMATE} from '../actors/bosses/nightmareUltimate';
import {episodeCel} from './episodeTwoCanvas';
import {paintMagicLight} from './projectileLightsCanvas';
import {drawHexyCharge,drawHexyChargeCore} from './adventureSuperCanvas';
import {drawNightmareMote,drawNightmareChargeTrail} from './nightmareMotesCanvas';
import {NIGHTMARE_CLASH} from '../engine/nightmarePowerClash';
import {drawDuelBeamTexture,duelBeamPhase} from './duelBeamFrames';
import {energyHead,energyGlow} from './paintedDuelCanvas';
import {nightmareFX,nightmareStormFrame} from './nightmarePaintedFX';
import {drawClashSparks} from './clashSpectacleCanvas';
const clamp=n=>Math.max(0,Math.min(1,n));
export function nightmareChargeParticle(s,i,age){
 const tip=s.powerClash?.crown||nightmareCrown(s),start=i%6*.035,arrival=2.85-i%7*.035,t=clamp((age-start)/(arrival-start)),phase=t*t;
 const angle=i*2.399,from={x:tip.x+Math.cos(angle)*950,y:tip.y+Math.sin(angle)*600};
 return{x:from.x+(tip.x-from.x)*phase,y:from.y+(tip.y-from.y)*phase+Math.sin(t*Math.PI)*45,phase:t};
}
function charge(c,s,art,age,reduced){
 const tip=s.powerClash?.crown||nightmareCrown(s),grow=clamp(age/NIGHTMARE_ULTIMATE.charge);
 for(let i=0;i<(reduced?14:64);i++){
  const p=nightmareChargeParticle(s,i,age),alpha=clamp(p.phase*9)*clamp((1-p.phase)*12),points=[];
  for(let j=reduced?3:8;j>=0;j--)points.push(nightmareChargeParticle(s,i,Math.max(0,age-j*.018)));
  drawNightmareChargeTrail(c,points,alpha,reduced);
  drawNightmareMote(c,art,i%3?1:0,age,p.x,p.y,26+i%3*9,i+age,alpha);
 }
 paintMagicLight(c,tip.x,tip.y,240+grow*450,'#bf8bff',.7);
 episodeCel(c,art['aerial-candy-vortex'],nightmareStormFrame(art,s.fxTime,reduced),tip.x,tip.y,200+grow*850,false,true,-Math.PI/2);
}
export function drawNightmareBackdrop(c,s){
 const u=s.boss.nightmareUltimate,q=s.powerClash;if(!u&&!q)return;
 const z=s.camera.zoom||1;c.save();c.fillStyle=q?.hexyBoost?'#2b173e33':'#160e2f55';c.fillRect(s.camera.x,s.camera.y,960/z,540/z);c.restore();if(q?.kind==='nightmare')drawNightmarePressureLight(c,s,nightmareContact(s));
}
export function drawNightmareVortex(c,art,frame,from,to,width,alpha=1){
 const img=art['aerial-candy-vortex'];if(!img)return;const side=img.width/4,socket=NIGHTMARE_PERFORMANCE_VORTEX[frame];if(!socket)return;const f=socket.front,t=socket.tail;
 const dx=f[0]-t[0],dy=f[1]-t[1],nativeLength=Math.hypot(dx,dy),length=Math.hypot(to.x-from.x,to.y-from.y);
 if(length<1)return;
 c.save();c.globalAlpha=alpha;c.translate(from.x,from.y);c.rotate(Math.atan2(to.y-from.y,to.x-from.x));c.scale(length/nativeLength,width/side);c.rotate(-Math.atan2(dy,dx));
 c.drawImage(img,frame%4*side,Math.floor(frame/4)*side,side,side,-t[0],-t[1],side,side);c.restore();
}
function starBeam(c,img,phase,a,b,width){
 const length=Math.hypot(b.x-a.x,b.y-a.y);c.save();c.translate(a.x,a.y);c.rotate(Math.atan2(b.y-a.y,b.x-a.x));
 drawDuelBeamTexture(c,img,phase,-4,-width/2,length+8,width,1);c.restore();
}
// The new drawings already taper to the palm. Paint the ENTIRE source cel:
// its curved contact rim and all outer filaments survive every camera zoom.
export function drawNightmareStormStream(c,art,frame,from,to,width,reduced=false){
 const dx=to.x-from.x,dy=to.y-from.y,length=Math.hypot(dx,dy);if(length<1)return;
 drawNightmareVortex(c,art,frame,from,to,width);
 paintMagicLight(c,from.x,from.y,48,'#b260ff',.65);
 drawNightmareMote(c,art,1,frame*.1,from.x,from.y,54,Math.atan2(dy,dx),.75);
}
export function drawNightmareWorld(c,s,art,reduced){
 const u=s.boss.nightmareUltimate,q=s.powerClash?.kind==='nightmare'?s.powerClash:null;if(!u&&!q)return;
 if(!q){if(u.state==='charge')charge(c,s,art,u.age,reduced);return;}
 if(q.state==='windup'){charge(c,s,art,Math.min(3.1,q.bossCharged+q.age),reduced);drawHexyCharge(c,s,art,reduced);return;}
 const h=nightmareContact(s);
 if(['flight','land'].includes(q.state)){
  const age=q.age+(q.state==='land'?1.45:0),alpha=clamp((1.1-age)/.4);
  if(alpha>0){
   const size=1250+age*1650;
   paintMagicLight(c,q.explosion.x,q.explosion.y,size*.45,q.won?'#ff9be9':'#b678ff',alpha*.55);
   nightmareFX(c,art,'clash-plasma',Math.min(7,Math.floor(age/.13)),q.explosion.x,q.explosion.y,size,size,false,alpha,age);
  }
  drawClashSparks(c,q,art,reduced);return;
 }
 if(q.state==='hexy-boost'){drawHexyCharge(c,s,art,reduced);drawHexyChargeCore(c,s,art,reduced);}
 const travel=q.state==='travel'?clamp(q.age/.55):1,contact={x:h.a.x+(h.x-h.a.x)*travel,y:h.a.y+(h.y-h.a.y)*travel},bossFront={x:h.b.x+(h.x-h.b.x)*travel,y:h.b.y+(h.y-h.b.y)*travel};
 paintMagicLight(c,h.a.x,h.a.y,85,'#ffe8b2',.85);
 const visual=q.visualTime??s.fxTime,phase=duelBeamPhase(visual,reduced),swell=1+(q.wave||0)*.08+(q.tapPulse>0?.035:0),width=(470+q.hexyAmplification*480)*swell,rally=q.finalSurgeAge!==undefined?Math.sin(Math.PI*clamp(q.finalSurgeAge/1.2)):0,bossWidth=(520+q.bossAmplification*630)*(1+rally*.12);
 c.save();c.globalCompositeOperation='screen';c.globalAlpha=.24;starBeam(c,art['super-beam'],phase,h.a,contact,width*1.55);c.restore();starBeam(c,art['super-beam'],phase,h.a,contact,width);
 drawNightmareStormStream(c,art,nightmareStormFrame(art,visual,reduced),h.b,bossFront,bossWidth,reduced);
 if(q.state==='boss-boost'&&q.age<NIGHTMARE_CLASH.bossCharge){
  const gathering=clamp(q.age/NIGHTMARE_CLASH.bossCharge);paintMagicLight(c,h.b.x,h.b.y,80+gathering*90,'#c16eff',.7);
  for(let i=0;i<(reduced?5:22);i++){
   const t=(q.age*.8+i*.618)%1,angle=i*2.399+q.age,radius=(1-t)*310;
   drawNightmareMote(c,art,i%3?1:0,s.fxTime,h.b.x+Math.cos(angle)*radius,h.b.y+Math.sin(angle)*radius,22+t*16,angle,Math.sin(t*Math.PI));
  }
 }
 if(q.state==='travel')energyHead(c,art,false,s.fxTime,contact.x,contact.y,Math.atan2(h.y-h.a.y,h.x-h.a.x),220,reduced);
 else{
  energyGlow(c,false,contact.x,contact.y,230+q.hexyAmplification*150,.85);
  const size=250+q.hexyAmplification*110+(q.wave||0)*30;
  nightmareFX(c,art,'clash-plasma',reduced?2:Math.floor(visual*24)%8,contact.x,contact.y,size,size,false,1,Math.atan2(h.b.y-h.a.y,h.b.x-h.a.x)+Math.PI/4);
 }
 if(q.state==='resolve')nightmareFX(c,art,'clash-plasma',Math.min(7,Math.floor(q.age*20)),h.x,h.y,500+q.age*850);
 drawNightmareWind(c,s,art,reduced,h);drawClashSparks(c,q,art,reduced);
}
