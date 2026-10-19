import {painted} from './paintedDuelCanvas';
import {paintMagicLight} from './projectileLightsCanvas';
import {nightmareWindStrength} from '../engine/nightmarePressureActing';
import {nightmareFX} from './nightmarePaintedFX';
const clamp=n=>Math.max(0,Math.min(1,n));
export function nightmareWindParticle(s,i,age=s.powerClash?.windPhase??s.fxTime){
 const q=s.powerClash,z=s.camera.zoom||1,width=960/z,height=540/z,flow=(q?.windFlow??-1)*s.player.dir;
 const rate=.24+(i%5)*.06,t=((age*rate*s.player.dir+i*.6180339)%1+1)%1;
 return{x:s.camera.x+t*(width+240)-120,y:s.camera.y+height*(.18+(i%11)/11*.78)+Math.sin(age*2+i)*25,phase:t,flow};
}
export function drawNightmarePressureLight(c,s,h){
 const q=s.powerClash;if(!q||['windup','flight','land'].includes(q.state))return;
 const z=s.camera.zoom||1,width=960/z,height=540/z,left=s.player.x<s.boss.x,split=clamp((h.x-s.camera.x)/width),strength=nightmareWindStrength(q);
 c.save();c.globalCompositeOperation='screen';c.globalAlpha=.5;
 const g=c.createLinearGradient(s.camera.x,0,s.camera.x+width,0);
 g.addColorStop(0,left?'#ee65b65c':'#8265e789');g.addColorStop(Math.max(0,split-.1),left?'#ff96df38':'#986fff62');g.addColorStop(Math.min(1,split+.1),left?'#986fff62':'#ff96df38');g.addColorStop(1,left?'#8265e789':'#ee65b65c');
 c.fillStyle=g;c.fillRect(s.camera.x,s.camera.y,width,height);c.restore();
 paintMagicLight(c,h.a.x,h.a.y,340+q.hexyAmplification*260,'#ff91dd',.28+q.hexyAmplification*.12);
 paintMagicLight(c,h.x,h.y,450+q.bossAmplification*250,'#b097ff',.22*strength);
 paintMagicLight(c,s.player.x,s.level.arena.y,300,'#fa7ccc',.2);
}
export function drawNightmareWind(c,s,art,reduced=false,h){
 const q=s.powerClash;if(!q||['windup','flight','land'].includes(q.state))return;
 const force=nightmareWindStrength(q),age=s.fxTime,floor=s.level.arena.y;
 // Authored air cels cross several depths; no vector ribbons, music-like
 // parallel strokes, floating moons or confetti around the contact.
 for(let i=0;i<(reduced?2:12);i++){
  const p=nightmareWindParticle(s,i),alpha=Math.sin(p.phase*Math.PI)*(.14+i%3*.045)*force;
  nightmareFX(c,art,'fast-wind',reduced?3:Math.floor(age*22+i)%8,p.x,p.y,180+i%4*65,42+i%3*24,p.flow>0,alpha*.8);
 }
 const planted=s.player.ground!==null&&Math.abs(s.player.y-floor)<6;
 if(planted)for(let i=0;i<(reduced?1:5);i++){
  const t=(age*1.15+i/5)%1,drift=Math.max(0,t-.3)*220,dir=q.windFlow*s.player.dir;
  c.save();c.translate(s.player.x+dir*(28+drift),floor);c.scale(dir,1);
  painted(c,art,'dust',Math.min(7,Math.floor(t*8)),0,0,195+force*35,240+force*35,0,clamp(t/.1)*clamp((1-t)/.22)*.5,.08,.89);c.restore();
 }
}
