import {nightmareContact} from '../engine/nightmarePowerClash';
import {drawNightmarePressurePanels,nightmareCornerLayout} from './nightmarePressurePanels';
import {drawNightmarePressureMeter} from './nightmarePressureMeter';
import {drawNightmareClashSpeech} from './nightmareClashSpeech';
import {drawNightmareGleeCutin} from './nightmareCornerPanels';
export const nightmarePortraitLayout=nightmareCornerLayout;
import encorePortraits from './hexyEncorePortraits';
const clamp=n=>Math.max(0,Math.min(1,n));
function portrait(c,img,x,y,h,flip=false,alpha=1,crop=null){
 if(!img||h<=0)return;const [sx,sy,sw,sh]=crop||[0,0,img.width,img.height],w=h*sw/sh;
 c.save();c.globalAlpha=alpha;c.translate(x+(flip?w:0),y);if(flip)c.scale(-1,1);c.drawImage(img,sx,sy,sw,sh,0,0,w,h);c.restore();
}
function hexyHero(c,s,art,x,y,h,flip,alpha,boost=false){
 const shot=s.superCinematic;if(!shot?.airborne){portrait(c,art[boost?'episode-hexy-double':'hexy-encore-portrait'],x,y,h,flip,alpha);return;}
 const pose=encorePortraits[Math.abs(shot.aim?.x||0)<.1?'air-up':'air-diagonal-up'];portrait(c,art[pose.key],x,y,h,flip,alpha,pose.crop);
}
let blurBuffer;
export function drawNightmareScreen(c,s,art,en,reduced){
 const b=s.boss,u=b.nightmareUltimate,q=s.powerClash?.kind==='nightmare'?s.powerClash:null;
 if(s.level.badDreams&&b.stage===3&&b.phase==='transform'){
  const alpha=clamp(b.phaseAge/.2)*clamp((2-b.phaseAge)/.35);c.save();c.globalAlpha=alpha*.4;c.fillStyle='#100b23';c.fillRect(0,0,960,540);c.restore();
  portrait(c,art['nightmare-madness-portrait'],310,5,535,false,alpha);return;
 }
 if(!u&&!q)return;const flip=s.player.dir<0;
 if(!q||q.state==='windup'){
  if(!q&&u.state!=='charge')return;
  const age=q?q.bossCharged+q.age:u.age,alpha=clamp(age/.15)*clamp((1.25-age)/.35);
  portrait(c,art['aerial-boss-air-actions'],flip?10:640,20,445,flip,alpha,[0,512,512,512]);
  if(q)hexyHero(c,s,art,flip?615:10,20,490,flip,clamp(q.age/.16)*clamp((q.windup-q.age)/.25));
  return;
 }
 if(['travel','contest','boss-boost','hexy-boost','breakthrough','resolve'].includes(q.state)){
  drawNightmarePressurePanels(c,s,art,reduced);drawNightmareGleeCutin(c,s,art,reduced);drawNightmarePressureMeter(c,s,art,reduced);
  drawNightmareClashSpeech(c,s,en,reduced,art);
 }
 if(!reduced&&q.boostFlash>0){
  const z=s.camera.zoom||1,h=nightmareContact(s),x=(h.x-s.camera.x)*z,y=(h.y-s.camera.y)*z;
  blurBuffer??=new OffscreenCanvas(960,540);blurBuffer.getContext('2d').drawImage(c.canvas,0,0,960,540);
  c.save();for(let i=1;i<=6;i++){const scale=1+i*.025*q.boostFlash/.24;c.globalAlpha=.055;c.drawImage(blurBuffer,x*(1-scale),y*(1-scale),960*scale,540*scale);}c.restore();
 }
}
