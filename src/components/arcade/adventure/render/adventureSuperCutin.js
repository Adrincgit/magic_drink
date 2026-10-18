import {SUPER_WINDUP} from '../engine/adventureMagic';
import {superChargeAge} from '../engine/adventureSuperTiming';
import {drawDuelCharge} from './duelCutinCanvas';
import portraits from './hexyEncorePortraits';

const clamp=n=>Math.max(0,Math.min(1,n));
export function superCutinPortrait(s){
 const q=s.superCinematic,aim=q?.aim;
 // Keep the accepted full illustration for the classic grounded Encore.
 if(!q?.airborne&&!aim?.y)return{classic:true};
 const direction=aim?.y<0?(aim.x===0?'up':'diagonal-up'):aim?.y>0?(aim.x===0?'down':'diagonal-down'):'horizontal';
 return{...portraits[(q.airborne?'air-':'ground-')+direction],flip:(aim?.x||q.dir)<0};
}
export function superCutinState(s,reduced=false){
 const elapsed=s.superCinematic?.age;
 if(elapsed===undefined||elapsed<0||elapsed>=SUPER_WINDUP)return null;
 const age=superChargeAge(elapsed),exitAt=superChargeAge(SUPER_WINDUP)-.24,enter=clamp(age/.2),exit=clamp((age-exitAt)/.24);
 return{
  x:reduced?0:-370*Math.pow(1-enter,3),
  alpha:(reduced?clamp(age/.16):1)*(1-exit),
  phase:age<.2?'enter':age<exitAt?'hold':'exit',
 };
}

export function superCutinPortraitRect(pose){
 const [, ,sw,sh]=pose.crop,scale=Math.min(426/sh,342/sw),w=sw*scale,h=sh*scale;
 return{x:24+(342-w)/2,y:76+(426-h)/2,w,h};
}

function ribbon(c,y,width,height){
 c.save();c.translate(-18,y);c.rotate(-.1);
 c.beginPath();c.moveTo(0,0);c.lineTo(width,0);c.lineTo(width-18,height/2);c.lineTo(width,height);c.lineTo(0,height);c.closePath();
 const paint=c.createLinearGradient(0,0,width,height);paint.addColorStop(0,'#25204e');paint.addColorStop(.65,'#663365');paint.addColorStop(1,'#352049');
 c.fillStyle=paint;c.fill();c.strokeStyle='#ffe8a1';c.lineWidth=2;c.stroke();
 c.strokeStyle='#f39dc7';c.lineWidth=1;c.beginPath();c.moveTo(0,6);c.lineTo(width-24,6);c.stroke();c.restore();
}

// A screen-space illustration, independent of world zoom and Hexy's facing.
// Confined to the left side. It fades there instead of crossing the battlefield.
export function drawSuperCutin(c,s,art,reduced=false,en=false){
 if(s.powerClash)return drawDuelCharge(c,s,art,false,reduced);
 const q=superCutinState(s,reduced),pose=superCutinPortrait(s),classic=pose.classic||!art[pose.key];
 const portrait=art[classic?'hexy-encore-portrait':pose.key];
 if(!q||!portrait)return false;
 c.save();c.translate(q.x,0);c.globalAlpha=q.alpha;
 ribbon(c,141,360,34);ribbon(c,497,376,38);
 // Full image, with uniform scale: neither the raised wand nor shoes are cut.
 const height=426;
 if(classic)c.drawImage(portrait,24,76,height*portrait.width/portrait.height,height);
 else{
  const [sx,sy,sw,sh]=pose.crop,{x,y,w,h}=superCutinPortraitRect(pose);
  c.save();if(pose.flip){c.translate(x+w,y);c.scale(-1,1);}else c.translate(x,y);
  c.drawImage(portrait,sx,sy,sw,sh,0,0,w,h);c.restore();
 }
 c.textAlign='left';c.lineJoin='round';c.strokeStyle='#291735';c.lineWidth=4;c.fillStyle='#fff0b6';
 c.save();c.translate(12,163);c.rotate(-.1);c.font='400 18px BakeSoda, sans-serif';c.strokeText('HEXY',0,0);c.fillText('HEXY',0,0);c.restore();
 c.save();c.translate(9,525);c.rotate(-.1);c.font='400 24px BakeSoda, sans-serif';const title=en?'STARLIGHT ENCORE!':'¡ENCORE ESTELAR!';c.strokeText(title,0,0,327);c.fillText(title,0,0,327);c.restore();
 c.restore();return true;
}
