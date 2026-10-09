import {energyHead,paintedParticle} from './paintedDuelCanvas';
import {SUPER_WINDUP,SUPER_DURATION} from '../engine/adventureMagic';
import {cameraView} from './adventureCamera';
import {hexyMuzzle} from '../actors/hexy/hexyAnimation';

const clamp=n=>Math.max(0,Math.min(1,n));
export function hexyChargeParticle(s,i,age){
 const h=hexyMuzzle(s),view=cameraView(s),phase=(age*(1.25+i%5*.12)+i*.618)%1,t=phase*phase,angle=i*2.399;
 const from={x:s.camera.x+view.width*(.5+Math.cos(angle)*.48),y:s.camera.y+view.height*(.46+Math.sin(angle)*.43)};
 return{x:from.x+(h.x-from.x)*t,y:from.y+(h.y-from.y)*t+Math.sin(phase*Math.PI)*Math.cos(angle)*55,phase,tip:h,from};
}
export function drawHexyCharge(c,s,art,reduced=false){
 const q=s.superCinematic;if(!q||q.age>=SUPER_WINDUP)return;
 const age=q.age,h=hexyMuzzle(s);c.save();
 for(let i=0;i<(reduced?10:48);i++){
  const p=hexyChargeParticle(s,i,age),alpha=clamp(p.phase*10)*clamp((1-p.phase)*10)*clamp(age/.15);
  paintedParticle(c,art,i%3,age+i*.13,p.x,p.y,13+i%4*6,age*4+i,alpha);
 }
 c.globalCompositeOperation='screen';const radius=28+clamp(age/SUPER_WINDUP)*35,g=c.createRadialGradient(h.x,h.y,1,h.x,h.y,radius);
 g.addColorStop(0,'#fff8c7df');g.addColorStop(.25,'#ffe29390');g.addColorStop(.65,'#fc78d240');g.addColorStop(1,'#ed68d100');c.fillStyle=g;c.fillRect(h.x-radius,h.y-radius,radius*2,radius*2);
 for(let i=0;i<(reduced?2:5);i++){const angle=i*Math.PI*.4+age*7,r=10+Math.sin(age*8+i)*5;paintedParticle(c,art,i%3,age,h.x+Math.cos(angle)*r,h.y+Math.sin(angle)*r,12+age*9,angle,.8);}
 c.restore();
}
export function superCameraOffset(s,reduced=false){
 if(reduced)return{x:0,y:0};
 const u=s.boss?.ultimate;
 if(u?.state==='charge'){
  const age=u.age+(s.powerClash?.age||0),force=1+Math.min(1,age/2.8)*3;
  return{x:Math.sin(s.fxTime*67)*force,y:Math.sin(s.fxTime*49)*force*.5};
 }
 const q=s.superCinematic,age=q?q.age-SUPER_WINDUP:-1;
 if(reduced||age<0||q.age>=SUPER_DURATION)return{x:0,y:0};
 if(s.powerClash&&s.powerClash.state!=='windup'){
  const clash=s.powerClash,force=clash.state==='travel'?4:clash.state==='contest'?Math.min(8,7*Math.exp(-clash.age*10)+clash.tapPulse*24+3.5+(clash.wave||0)*2.4):clash.state==='resolve'?7:clash.state==='flight'?8*Math.exp(-clash.age*4):clash.state==='land'?5*Math.exp(-clash.age*9):0;
  return{x:Math.sin(s.fxTime*71)*force,y:Math.sin(s.fxTime*57)*force*.55};
 }
 const fade=clamp((SUPER_DURATION-q.age)/.35),kick=Math.exp(-age*15);
 // One directional launch kick, then a small vibration that releases gently.
 const hum=(1-kick)*1.25*fade;
 return{x:-q.dir*kick*4+Math.sin(age*81)*hum,y:Math.sin(age*63)*hum*.55};
}
// The world has already been painted. Shade it before drawing Hexy, so her
// silhouette and the hand-painted spell remain the brightest parts of the act.
export function superBackdrop(c,s,art,reduced){
 const q=s.superCinematic;if(!q)return;
 const fade=clamp(q.age/.18)*clamp((SUPER_DURATION-q.age)/.3),p=s.player;
 const view=cameraView(s);
 c.save();c.fillStyle=`rgba(19,7,45,${.67*fade})`;c.fillRect(s.camera.x-8,s.camera.y-8,view.width+16,view.height+16);
 const g=c.createRadialGradient(p.x,p.y-48,5,p.x,p.y-48,210);g.addColorStop(0,'#eec4ff60');g.addColorStop(.45,'#aa49c529');g.addColorStop(1,'#662ea500');c.fillStyle=g;c.fillRect(p.x-210,p.y-258,420,420);
 drawHexyCharge(c,s,art,reduced);
 c.restore();
}

export function superBeam(c,s,art,reduced){
 const q=s.superCinematic;if(!q||q.age<SUPER_WINDUP)return;
 const age=q.age-SUPER_WINDUP,fade=clamp((SUPER_DURATION-q.age)/.3),grow=clamp(age/.12),frame=reduced?1:Math.floor(age*12)%4;
 c.save();c.translate(q.origin.x,q.origin.y);c.scale(q.dir,1);c.globalAlpha=fade;
 // A broad four-pose corona expands behind the painted beam. Keep every
 // layer attached to the measured wand tip rather than shaking her wrist.
 const swell=reduced?1:[.94,1.08,1.02,1.14][frame];
 c.save();c.globalAlpha=fade*.22;c.globalCompositeOperation='screen';
 c.drawImage(art['super-beam'],0,frame*256,1024,256,-22,-150*swell,1080*grow,300*swell);c.restore();
 // Four broad painted frames flow for two seconds instead of flying away.
 c.shadowColor='#f6c3ff';c.shadowBlur=reduced?8:20;
 c.drawImage(art['super-beam'],0,frame*256,1024,256,-22,-128,1080*grow,256);
 c.shadowBlur=0;
 if(grow<1)energyHead(c,art,false,age,1080*grow-22,0,0,195,reduced);
 const pulse=reduced?1:1+Math.max(0,1-(age%.24)/.1)*.18,coreSize=75*pulse;
 const core=c.createRadialGradient(0,0,2,0,0,coreSize);core.addColorStop(0,'#fff8d9');core.addColorStop(.2,'#fff0aaba');core.addColorStop(1,'#f486fa00');c.fillStyle=core;c.fillRect(-coreSize,-coreSize,coreSize*2,coreSize*2);
 for(let i=0;i<11;i++){
  const x=reduced?i*90:((age*530+i*97)%1050),y=Math.sin(i*4+(reduced?0:age*8))*75;
  paintedParticle(c,art,i%3,age,x,y,18+i%3*8,age+i);
 }
 // Expanding star petals mark the first beat and later beam pulses.
 const beat=reduced?.2:age%.24,radius=20+beat*145;
 c.save();c.globalAlpha=fade*(reduced?.35:Math.max(0,1-beat/.24)*.65);
 for(let i=0;i<8;i++){const a=i*Math.PI/4;paintedParticle(c,art,i%3,age,Math.cos(a)*radius,Math.sin(a)*radius,16+beat*22,a);}c.restore();
 if(!reduced&&age<.16){const view=cameraView(s);c.globalAlpha=Math.pow(1-age/.16,2)*.32;c.fillStyle='#fff1d5';const left=q.dir>0?s.camera.x-q.origin.x:q.origin.x-s.camera.x-view.width;c.fillRect(left,s.camera.y-q.origin.y,view.width,view.height);}
 c.restore();
}

export function superCaption(c,s,en,cutin=false){
 const q=s.superCinematic;if(!q||cutin)return;
 const fade=clamp(q.age/.15)*clamp((SUPER_DURATION-q.age)/.25);
 c.save();c.globalAlpha=fade;c.textAlign='center';c.lineJoin='round';
 const y=c.canvas.clientWidth<600?270:114;c.font='400 36px BakeSoda, sans-serif';c.lineWidth=7;c.strokeStyle='#2a153e';c.fillStyle='#fff0aa';
 const title=en?'STARLIGHT ENCORE!':'¡ENCORE ESTELAR!';c.strokeText(title,480,y);c.fillText(title,480,y);
 c.font='bold 11px sans-serif';c.fillStyle='#f3c5ed';c.fillText(en?'INVINCIBLE · LET THE STARS SING':'INVENCIBLE · QUE CANTEN LAS ESTRELLAS',480,y+22);
 // Smooth bars frame the performance; they do not cover the in-game HUD.
 c.fillStyle='#170c2f99';c.fillRect(0,508,960,32);c.fillStyle='#e9c777';c.fillRect(0,508,960*clamp(q.age/SUPER_DURATION),2);
 c.restore();
}
