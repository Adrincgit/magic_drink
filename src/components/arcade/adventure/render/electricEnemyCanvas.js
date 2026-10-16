import {enemyGeometry} from '../actors/enemies/adventureEnemyGeometry';
import {paintMagicLight} from './projectileLightsCanvas';
export function electricBodyFilter(c,e,reduced){
 if(e.charred){c.filter='grayscale(1) brightness(.24)';return;}
 if(e.elementHit?.element!=='electric')return;
 const age=e.elementHit.age;
 c.translate(reduced?0:Math.sin(age*82)*2.2,0);
 c.filter=reduced?'brightness(1.25)':Math.floor(age*16)%2?'brightness(1.2)':'brightness(1.8) saturate(.4)';
}
export function drawElectricReaction(c,e,reduced){
 const {w,h}=enemyGeometry(e),age=e.deathAge||0;
 if(e.charred){
  c.save();c.fillStyle='#554f64';c.globalAlpha=.26*Math.min(1,e.deadTime);
  for(let i=0;i<5;i++){const t=(age*.6+i*.19)%1;c.beginPath();c.ellipse(e.x+Math.sin(i*3+t*4)*w*.25,e.y-h*.65-t*65,4+t*11,6+t*13,0,0,Math.PI*2);c.fill();}c.restore();return;
 }
 const hit=e.elementHit;if(hit?.element!=='electric')return;
 paintMagicLight(c,e.x,e.y-h*.55,h*.8,'#55dcff',.34);
 c.save();c.strokeStyle='#a5f6ff';c.lineWidth=1.7;c.shadowColor='#35bfff';c.shadowBlur=9;
 const phase=reduced?1:Math.floor(hit.age*18);
 for(let side=-1;side<=1;side+=2){c.beginPath();for(let i=0;i<7;i++){const x=e.x+side*(w*.34+Math.sin(i*5+phase)*9),y=e.y-h*.12-i*h*.13;i?c.lineTo(x,y):c.moveTo(x,y);}c.stroke();}c.restore();
}
