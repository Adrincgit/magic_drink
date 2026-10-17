import {enemyGeometry} from '../actors/enemies/adventureEnemyGeometry';
import {paintMagicLight} from './projectileLightsCanvas';
import {electricPoseSprite} from './electricPoseSprite';
export const electricPulse=(e,reduced=false)=>e.hp>0&&!e.charred&&e.elementHit?.element==='electric'&&(reduced||Math.floor(e.elementHit.age*14)%2===0);
const jitter=(e,reduced)=>reduced?0:Math.sin(e.elementHit.age*82)*2.2;
export function electricBodyFilter(c,e,reduced){
 if(e.charred){c.filter='grayscale(1) brightness(.24)';return;}
 if(e.elementHit?.element!=='electric')return;
 const age=e.elementHit.age;
 c.translate(jitter(e,reduced),0);
 c.filter=reduced?'brightness(1.15)':Math.floor(age*14)%2===0?'brightness(1.65) saturate(.6)':'brightness(1.05)';
}
export function drawElectricAura(c,e,drawing,art,reduced,x,y,size){
 if(!electricPulse(e,reduced))return;
 const phase=reduced?1:Math.floor(e.elementHit.age/.07)%4;
 const pose=electricPoseSprite(art[drawing.key],drawing.frame,art['feedback-electric-fill'],phase);if(!pose)return;
 const {h}=enemyGeometry(e);c.save();c.filter='none';c.globalAlpha=1;
 paintMagicLight(c,x,y-h*.55,h*.8,'#55dcff',reduced?.18:.34);
 c.translate(x+jitter(e,reduced),y);if(e.dir>0)c.scale(-1,1);
 c.drawImage(pose.canvas,-size*(.5+pose.pad),-size*(250/256+pose.pad),size*pose.scale,size*pose.scale);c.restore();
}
export function drawElectricReaction(c,e,art,reduced){
 const {w,h}=enemyGeometry(e),age=e.deathAge||0;
 if(e.charred){
  c.save();c.fillStyle='#554f64';c.globalAlpha=.26*Math.min(1,e.deadTime);
  for(let i=0;i<5;i++){const t=(age*.6+i*.19)%1;c.beginPath();c.ellipse(e.x+Math.sin(i*3+t*4)*w*.25,e.y-h*.65-t*65,4+t*11,6+t*13,0,0,Math.PI*2);c.fill();}c.restore();return;
 }
}
