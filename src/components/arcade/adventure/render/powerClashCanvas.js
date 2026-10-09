import {painted,energyHead,energyGlow,paintedParticle,paintedMeter} from './paintedDuelCanvas';
import {cameraView} from './adventureCamera';
import {clashContact,CLASH_DURATION,CLASH_TRAVEL} from '../engine/adventurePowerClash';
import {ultimateHand,ultimateBeamGeometry,HARLEQUIN_ULTIMATE} from '../actors/bosses/harlequinUltimate';
import {clashEffect,drawClashSparks} from './clashSpectacleCanvas';
import {drawDuelCharge} from './duelCutinCanvas';
import {drawChargeStreams,drawClashAtmosphere} from './clashAtmosphereCanvas';
const clamp=n=>Math.max(0,Math.min(1,n));
function fx(c,art,row,frame,x,y,size,alpha=1){
 c.save();c.globalAlpha=alpha;c.drawImage(art['harlequin-ultimate-effects'],frame*256,row*256,256,256,x-size/2,y-size/2,size,size);c.restore();
}
function beam(c,img,a,b,frame,height,portion=1){
 if(portion<=0)return;
 const length=Math.hypot(b.x-a.x,b.y-a.y);c.save();c.translate(a.x,a.y);c.rotate(Math.atan2(b.y-a.y,b.x-a.x));
 if(portion<1){
  // Invisible crop of the painted body, tucked UNDER the star/fireball.
  // Never leave the rectangular source edge exposed below its moving head.
  const shoulder=Math.max(0,length-Math.min(125,length*.65));
  c.beginPath();c.moveTo(-5,-height/2);c.lineTo(shoulder,-height/2);
  c.bezierCurveTo(length-48,-height/2,length-20,-height*.13,length-8,0);
  c.bezierCurveTo(length-20,height*.13,length-48,height/2,shoulder,height/2);
  c.lineTo(-5,height/2);c.closePath();c.clip();
 }
 // Blend adjacent painted frames at render cadence: motion never holds for 1/12s.
 const base=Math.floor(frame)%4,mix=frame-Math.floor(frame),alpha=c.globalAlpha;
 c.drawImage(img,0,base*256,1024*portion,256,-5,-height/2,length+10,height);
 if(mix){c.globalAlpha=alpha*mix;c.drawImage(img,0,((base+1)%4)*256,1024*portion,256,-5,-height/2,length+10,height);}c.restore();
}
function beamFilaments(c,art,a,b,age,boss,reduced){
 const distance=Math.hypot(b.x-a.x,b.y-a.y),angle=Math.atan2(b.y-a.y,b.x-a.x);
 c.save();c.translate(a.x,a.y);c.rotate(angle);
 for(let i=0;i<(reduced?3:9);i++){
  const t=(age*1.8+i/9)%1,dy=Math.sin(age*15+i*2)*Math.sin(t*Math.PI)*34;
  paintedParticle(c,art,boss?(i%4===0?4:3):i%3,age+i*.17,t*distance,dy,18+i%3*6,age*(i%2?1:-1),Math.sin(t*Math.PI)*.8);
 }c.restore();
}
export function drawPowerBackdrop(c,s,reduced){
 const q=s.boss.ultimate,clash=s.powerClash;if(!q&&!clash)return;
 const view=cameraView(s),fade=clash?1:q.state==='charge'?clamp(q.age/.3):q.state==='recover'?1-clamp(q.age/.4):.8;
 c.save();c.fillStyle=`rgba(17,9,37,${fade*.52})`;c.fillRect(s.camera.x-10,s.camera.y-10,view.width+20,view.height+20);c.restore();
 if(clash&&clash.state!=='windup'){
  const pink='#ee5eaf65',red='#e3371c75',g=c.createLinearGradient(s.camera.x,0,s.camera.x+view.width,0),left=s.player.x<s.boss.x;
  const split=Math.max(.12,Math.min(.88,(clashContact(s).x-s.camera.x)/view.width));
  g.addColorStop(0,left?pink:red);g.addColorStop(Math.max(0,split-.08),left?'#fbc57834':'#ff792c45');g.addColorStop(Math.min(1,split+.08),left?'#ff792c45':'#fbc57834');g.addColorStop(1,left?red:pink);
  c.save();c.fillStyle=g;c.fillRect(s.camera.x,s.camera.y,view.width,view.height);c.restore();
 }
}
export function drawPowerWorld(c,s,art,reduced){
 const u=s.boss.ultimate,q=s.powerClash;if(!u&&!q)return;
 const age=q?.age??u.age,frame=reduced?1:Math.floor(age*12)%4,beamFrame=reduced?1:(age*18)%4;
 drawChargeStreams(c,s,art,reduced);
 if(q&&['travel','contest','resolve'].includes(q.state)){
  const h=clashContact(s),swell=reduced?1:1+Math.sin(age*21)*.06+(q.wave||0)*.09;
  const travel=q.state==='travel'?clamp(age/CLASH_TRAVEL):1;
  const head=a=>({x:a.x+(h.x-a.x)*travel,y:a.y+(h.y-a.y)*travel});
  energyGlow(c,false,h.a.x,h.a.y,105,.65);energyGlow(c,true,h.b.x,h.b.y,105,.65);
  if(q.state!=='travel')energyGlow(c,false,h.x,h.y,210*swell,.95);
  c.save();c.globalCompositeOperation='screen';c.globalAlpha=.2;
  beam(c,art['super-beam'],h.a,head(h.a),beamFrame,465*swell,travel);beam(c,art['harlequin-ultimate-beam'],h.b,head(h.b),beamFrame,245*swell,travel);c.restore();
  beam(c,art['super-beam'],h.a,head(h.a),beamFrame,330*swell,travel);beam(c,art['harlequin-ultimate-beam'],h.b,head(h.b),beamFrame,180*swell,travel);
  beamFilaments(c,art,h.a,head(h.a),age,false,reduced);beamFilaments(c,art,h.b,head(h.b),age,true,reduced);
  if(q.state==='travel'){
   for(const [start,boss]of [[h.a,false],[h.b,true]]){
    const tip=head(start);energyHead(c,art,boss,age,tip.x,tip.y,Math.atan2(h.y-start.y,h.x-start.x),boss?180:195,reduced);
   }return;
  }
  // Painted contact + expanding shock rings, with short local colour pulses.
  c.save();c.translate(h.x,h.y);c.rotate(Math.atan2(h.b.y-h.a.y,h.b.x-h.a.x));
  clashEffect(c,art,0,frame,0,0,(q.state==='resolve'?320+q.age*440:320+(q.tapPulse>0?28:0))*swell);c.restore();
  if(!reduced)for(let i=0;i<2;i++){
   const t=(age*1.5+i*.5)%1,size=140+t*230;
   painted(c,art,'heads',16+i*8+Math.floor(t*8),h.x,h.y,size,size*.875,age*.5+i*Math.PI,(1-t)*.65);
  }
 }else if(q&&['flight','land'].includes(q.state)){
  if(q.blastAge<1.05)clashEffect(c,art,1,Math.min(3,Math.floor(q.blastAge/.23)),q.explosion.x,q.explosion.y,420+Math.min(.8,q.blastAge)*390,clamp((1.05-q.blastAge)/.3));
 }else if(u?.state==='charge'){
  const hand=ultimateHand(s.boss),grow=clamp(u.age/HARLEQUIN_ULTIMATE.charge);
  fx(c,art,2,frame,hand.x,hand.y,58+grow*110);
 }else if(u?.state==='fire'){
  const h=ultimateBeamGeometry(s);if(h){
   energyGlow(c,true,h.a.x,h.a.y,120,.85);
   c.save();c.globalCompositeOperation='screen';c.globalAlpha=.3;beam(c,art['harlequin-ultimate-beam'],h.a,h.b,beamFrame,220,h.progress);c.restore();
   beam(c,art['harlequin-ultimate-beam'],h.a,h.b,beamFrame,140,h.progress);
   beamFilaments(c,art,h.a,h.b,age,true,reduced);
   energyHead(c,art,true,age,h.b.x,h.b.y,Math.atan2(h.b.y-h.a.y,h.b.x-h.a.x),185,reduced);
  }
 }
 drawClashAtmosphere(c,s,art,reduced);
 if(q)drawClashSparks(c,q,art,reduced);
}
export function drawHarlequinCutin(c,s,art,reduced){drawDuelCharge(c,s,art,true,reduced);}
export function drawClashMeter(c,s,art,en,reduced){
 const q=s.powerClash;if(!q||!['contest','resolve'].includes(q.state))return;
 paintedMeter(c,art,328,83,304,49,q.pressure,s.player.x<s.boss.x,reduced?0:s.fxTime);
 if(q.state==='contest'){c.save();c.font='bold 11px sans-serif';c.textAlign='center';c.fillStyle='#ffe9c0';c.fillText(Math.max(0,CLASH_DURATION-q.contestAge).toFixed(1)+' s',480,141);c.restore();}
}
