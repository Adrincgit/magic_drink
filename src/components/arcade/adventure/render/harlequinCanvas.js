import {drawGroundHeat,drawGroundFire} from './harlequinFireCanvas';
import {drawHarlequinEntrance} from './harlequinEntranceCanvas';
import {drawHarlequinHeat} from './infernoStageCanvas';
import {drawInfernoBackdrop} from './infernoBackdropCanvas';
import {harlequinDrawing} from '../actors/bosses/adventureHarlequin';
import {bossHitFilter} from '../actors/bosses/bossFeedback';
import {HARLEQUIN_SIZE} from '../actors/bosses/harlequinMetrics';
import {painted,energyHead,energyGlow,paintedParticle,paintedMeter} from './paintedDuelCanvas';
import {PYRE_HEIGHT,pyreFrame} from '../actors/bosses/harlequinFire';
import {grandRingFloorPlacement,drawGrandRingFloor} from './grandRingFloor';
import {drawBurningCloth} from './harlequinChaosCanvas';
export function grandRingBackdropPlacement(s,img){
 if(s.ringPerspective)return grandRingFloorPlacement(s,img);
 const h=580,w=Math.max(h*img.width/img.height,960+s.level.width*.12);
 return{x:-s.camera.x*.12,y:-35-((s.camera.backdropY??40)-40)*.08,w,h};
}
export function grandRingBackdropLayers(s){
 const stage=Math.max(1,Math.min(3,s.boss.stage||1)),blend=s.boss.backdropBlend??1;
 return{from:s.boss.backdropFrom??stage,to:stage,blend};
}
export function drawGrandRingBackdrop(c,s,art,reduced=false){
 const img=art.world3,q=grandRingBackdropPlacement(s,img);c.drawImage(img,q.x,q.y,q.w,q.h);
 const layers=grandRingBackdropLayers(s),image=stage=>stage===3?art['grand-ring-inferno']:stage===2?art['grand-ring-burning']:null;
 c.save();const from=image(layers.from),to=image(layers.to);
 if(from)c.drawImage(from,q.x,q.y,q.w,q.h);
 if(to&&to!==from){c.globalAlpha=layers.blend;c.drawImage(to,q.x,q.y,q.w,q.h);}c.restore();
 if(s.ringPerspective)drawGrandRingFloor(c,s,art,q,layers);
 drawInfernoBackdrop(c,s,art,q,reduced);
}
export function drawGrandRingStage(c,s,art,reduced){
 if(s.ringPerspective)return; // The room painting already lights its own floor.
 const a=s.level.arena;
 // Dim pools from fixed theatre lamps. They never indicate an attack lane.
 c.save();c.globalCompositeOperation='screen';
 for(const x of [a.left+240,(a.left+a.right)/2,a.right-240]){
  const g=c.createLinearGradient(x,a.y-460,x,a.y);g.addColorStop(0,'#ffce8114');g.addColorStop(1,'#ffdc8e00');c.fillStyle=g;
  c.beginPath();c.moveTo(x-8,a.y-460);c.lineTo(x+8,a.y-460);c.lineTo(x+150,a.y);c.lineTo(x-150,a.y);c.closePath();c.fill();
 }
 c.restore();
}
function pose(c,s,art,x,y,alpha=1){
 const b=s.boss,q=harlequinDrawing(s),img=art[q.key],size=HARLEQUIN_SIZE*(q.scale||1);
 c.save();c.globalAlpha=alpha;c.translate(x,y);if(b.dir>0)c.scale(-1,1);
 if(b.exhausted>0)c.scale(1,1-Math.sin(b.clock*3.5)*.008);
 c.drawImage(img,(q.frame%4)*512,Math.floor(q.frame/4)*512,512,512,-size/2,-size*490/512,size,size);c.restore();
}
export function drawHarlequin(c,s,art,reduced=false){
 const b=s.boss;if(b.phase==='sleep'||b.shattered)return;
 drawHarlequinEntrance(c,s,art,reduced);
 drawHarlequinHeat(c,s,art,reduced);
 if(!reduced&&b.phase==='attack'&&b.move==='dash')for(let i=3;i>0;i--)pose(c,s,art,b.x-b.dir*i*26,b.y,.045*(4-i));
 c.save();const hit=bossHitFilter(b,reduced),burn=b.scorched?`brightness(${1-b.scorched}) saturate(.88)`:'';
 c.filter=[hit==='none'?'':hit,burn].filter(Boolean).join(' ')||'none';pose(c,s,art,b.x,b.y);c.restore();
}
export function drawHarlequinFX(c,art,row,frame,x,y,w,h=w,flip=false,angle=0){
 c.save();c.translate(x,y);c.rotate(angle);if(flip)c.scale(-1,1);
 c.drawImage(art['harlequin-effects'],frame*256,row*256,256,256,-w/2,-h/2,w,h);c.restore();
}
export function drawHarlequinProjectile(c,q,art,reduced=false){
 if(q.kind==='harlequin-cloth'){drawBurningCloth(c,q,art,reduced);return;}
 const frame=reduced?2:Math.floor(q.age*24)%8;
 if(q.kind==='harlequin-pyre'){
  const t=q.age-q.delay;
  if(t<0){drawGroundHeat(c,art,q.x,q.floor,q.age/q.delay,q.age,reduced);return;}
  const f=pyreFrame(t,reduced);if(f<0)return;
  // Natural heat on the wood precedes the physical eruption.
  // Extinction is drawn at full size: gaps, wisps and embers replace the core.
  const height=PYRE_HEIGHT*416/365,width=height*256/416,fade=t>.955?Math.max(0,(1.04-t)/.085):1;
  c.save();c.globalCompositeOperation='screen';
  painted(c,art,'pyres',f,q.x,q.floor,width*1.2,height,0,.2*fade,.5,380/416);c.restore();
  painted(c,art,'pyres',f,q.x,q.floor,width,height,0,fade,.5,380/416);return;
 }
 if(q.kind==='harlequin-groundfire'){drawGroundFire(c,art,q,reduced);return;}
 if(q.kind!=='harlequin-ember')energyGlow(c,true,q.x,q.y,q.kind==='harlequin-ribbon'?105:75,.65);
 const angle=Math.atan2(q.vy,q.vx);
 for(let i=0;i<(q.trail?.length||0);i++){
  if(reduced&&i%3)continue;const p=q.trail[i],t=Math.min(1,(q.age-p.age)/.36);
  painted(c,art,'fire',16+((frame+i)%8),p.x,p.y-t*18,62*(1-t)+24,34*(1-t)+12,p.angle,(1-t)*.38,.8,.5);
  if(i%2===0)paintedParticle(c,art,3,q.age+i*.11,p.x-Math.cos(p.angle)*t*18,p.y-t*35,12+10*(1-t),p.angle+t*3,(1-t)*.85);
 }
 if(q.kind==='harlequin-ember')energyHead(c,art,true,q.age,q.x,q.y,angle,90,reduced);
 else if(q.kind==='harlequin-ribbon')painted(c,art,'fire',8+frame,q.x,q.y-5,145,72,Math.sign(q.vx)<0?Math.PI:0,1,.84,.5);
 else painted(c,art,'fire',frame,q.x,q.y,110,55,angle,1,.74,.5);
}
export function drawHarlequinMeter(c,s,art,en){
 const b=s.boss;if(b.phase==='sleep'||b.phase==='intro'||b.hp<=0)return;
 paintedMeter(c,art,298,7,364,49,Math.max(0,b.hp/b.maxHp),true,s.fxTime,true);
 c.save();
 c.textAlign='center';c.font='bold 11px sans-serif';c.fillStyle='#f9ddb1';c.fillText((en?'PHASE ':'FASE ')+b.stage+' / 3',480,62);c.restore();
}
