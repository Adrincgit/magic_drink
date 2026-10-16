import {nightmareGuardianAlive} from '../actors/enemies/adventureNightmares';
import {SKELETON_CARTOON_PARTS as SKELETON_PARTS} from './nightmareSkeletonCartoonAtlas';
import {drawNightmareSkeleton as drawSkeleton} from './nightmareSkeletonCanvas';
import {groundY} from '../world/adventureTerrain';
import {graveArmFrame,cryptFrame} from '../engine/adventureGraveyard';
import {drawNightmareDepth,drawNightmareTrees,drawNightmareSideGate} from './nightmareDepthCanvas';
const prop=(c,img,frame,x,y,size,flip=false)=>{c.save();c.translate(x,y);if(flip)c.scale(-1,1);c.drawImage(img,frame%4*256,Math.floor(frame/4)*256,256,256,-size/2,-size*250/256,size,size);c.restore();};
export function drawNightmareBackdrop(c,s,art){
 drawNightmareDepth(c,s,art);
}
export function drawNightmareScenery(c,s,art){
 drawNightmareTrees(c,s,art);
 const img=art['nightmare-props'];for(const q of s.level.nightmareProps){if(Math.abs(q.x-s.player.x)>1250||[0,1].includes(q.frame))continue;prop(c,img,q.frame,q.x,q.y+17,q.size,q.flip);}
 drawNightmareSideGate(c,s,art);
 const gate=s.level.nightmareGate;prop(c,img,nightmareGuardianAlive(s)?8:9,gate.x,gate.y+7,gate.size);
}
export function drawNightmareGraves(c,s,art){
 for(const q of s.graves){
  if(Math.abs(q.x-s.player.x)>1200)continue;
  const arm=graveArmFrame(q),rising=q.kind==='headstone'?s.enemies.find(e=>e.graveId===q.index&&e.phase==='manifest'&&e.nightmareAge<.6):null;
  const frame=q.hp<=0?3:arm>=0||q.phase==='open'?2:q.phase==='warning'?1:0,size=200;
  c.save();if(q.flash>0&&Math.floor(q.flash*30)%2===0)c.filter='brightness(2)';
  if(q.kind==='crypt')drawNightmareCrypt(c,q,art);
  else{
   prop(c,art['nightmare-graves'],frame,q.x+(q.phase==='warning'?Math.sin(s.time*22)*1.4:0),q.y+10,size);
   if(arm>=0||rising){c.save();c.beginPath();c.rect(q.x-90,q.y-110,180,116);c.clip();prop(c,art['nightmare-grave-arm-v2'],arm>=0?arm:3,q.x+8,q.y-33+(rising?Math.max(0,rising.nightmareAge-.2)*135:0),76);c.restore();prop(c,art['nightmare-graves'],8,q.x,q.y+10,size);}
  }c.restore();
 }
 drawNightmareCryptMist(c,s,art);
}
export function drawNightmareGraveFront(c,s,e,art){
 if(e.phase!=='manifest')return;const q=s.graves.find(q=>q.index===e.graveId);if(!q)return;
 if(q.kind==='crypt'){
  // The side wall and near jamb cover actors still in the chamber. Once
  // they cross the threshold they pass in front of the left jamb and steps.
  c.save();c.beginPath();c.rect(q.x-65,q.y-365,290,385);
  if(e.nightmareAge<.5)c.rect(q.x-165,q.y-280,39,290);
  if(e.nightmareAge<.95)c.rect(q.x-175,q.y-29,150,48);
  c.clip();drawNightmareCrypt(c,q,art);c.restore();
 }
 else prop(c,art['nightmare-graves'],8,q.x,q.y+10,200);
}
export function drawNightmareCrypt(c,q,art){
 const frame=cryptFrame(q),size=440;
 c.drawImage(art['nightmare-crypt-opening-v7'],frame%2*512,Math.floor(frame/2)*512,512,512,q.x-size/2,q.y+10-size*500/512,size,size);
}
export function drawNightmareCryptMist(c,s,art,front=false){
 const img=art['nightmare-crypt-fog-v7'];
 const cloud=(frame,x,y,w,h)=>c.drawImage(img,frame%2*256,Math.floor(frame/2)*256,256,256,x,y,w,h);
 for(const q of s.graves){
  if(q.kind!=='crypt'||!(q.openAge>.05)||Math.abs(q.x-s.player.x)>1100)continue;
  const fade=q.hp<=0?Math.max(0,1-(q.collapseAge||0)/.7):1;if(!fade)continue;
  for(let i=0;i<5;i++){
   const age=(q.openAge-.05-i*.43)%3.1;if(age<0)continue;const u=age/3.1,x=q.x-93-age*63,y=q.y+6+age*5,w=160+age*78,h=w*.95+30;
   c.save();c.globalAlpha=Math.sin(Math.PI*u)*fade*(front?.39:.55);cloud(i%4,x-w*.5,y-h,w,h);c.restore();
  }
  // A short pressure burst starts at the dark opening, before any spawn.
  if(q.openAge<1.65){const u=Math.min(1,q.openAge/1.65),w=150+u*300,h=w*1.05;c.save();c.globalAlpha=Math.sin(Math.PI*u)*fade*(front?.82:.8);cloud(1,q.x-94-u*105-w/2,q.y+8-h,w,h);c.restore();}
 }
}
export function nightmareWindPose(s,i,reduced=false){
 const clock=reduced?0:s.fxTime,span=1700,t=(((s.camera.x+clock*165+i*610)%span)+span)%span/span;
 const x=s.camera.x+1300-t*span;
 return{x,y:groundY(s.level.route,x)+i%2*28,alpha:Math.sin(t*Math.PI)*.22,frame:Math.floor(clock*8+i*2)%8,size:310+i*45};
}
export function drawNightmareWind(c,s,art,reduced){
 if(!s.level.nightmareTrail)return;
 for(let i=0;i<3;i++){
  const q=nightmareWindPose(s,i,reduced);
  c.save();c.globalAlpha=q.alpha;prop(c,art['nightmare-wind'],q.frame,q.x,q.y,q.size,true);c.restore();
 }
 for(const b of s.looseBones||[]){c.save();c.globalAlpha=Math.min(1,b.life/2);if(b.key){c.translate(b.x,b.y);c.rotate(b.rotation||0);prop(c,art[b.key],b.frame,0,0,b.size);}else drawNightmareBone(c,art,b.frame,b.x,b.y,b.size||(b.frame===11?29:21),b.rotation);c.restore();}
}
export function drawNightmareBone(c,art,frame,x,y,size,rotation=0){
 const q=SKELETON_PARTS[[0,0,1,3,4,5,6,7,9,10,4,0][frame]??4],k=size/Math.max(q.w,q.h),w=q.w*k,h=q.h*k;
 c.save();c.translate(x,y);c.rotate(rotation);c.drawImage(art['nightmare-skeleton-cartoon-v3'],q.x,q.y,q.w,q.h,-w/2,-h/2,w,h);c.restore();
}
export function drawNightmareSkeleton(c,e,art,reduced){drawSkeleton(c,e,art,reduced,drawNightmareBone);}
