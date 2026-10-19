// Refraction samples only the painted room, before any character is drawn.
// The Harlequin's cels themselves are never stretched or mesh-deformed.
import {nightmareIllusionCopies} from '../actors/bosses/nightmareStaffCombo';
import {coherentNightmareDrawing} from '../actors/bosses/nightmareDrawing';
let roomSample;
export function nightmareMirage(s){
 const b=s.boss,g=b.game;
 if(!s.level.badDreams||!['wind-blink','staff-counter','staff-chain'].includes(g?.kind))return null;
 const warning=b.phase==='game-windup',attack=b.phase==='game-attack';
 const staff=g.kind.startsWith('staff-'),fade=staff?.48:.85;
 if(!warning&&!attack||attack&&b.phaseAge>fade)return null;
 const strength=warning?Math.max(0,Math.min(1,(b.phaseAge-(staff?.1:.35))/(staff?.3:.45))):Math.max(0,1-b.phaseAge/fade);
 return{strength,from:b.originX,to:b.targetX,y:s.level.arena.y,age:b.phaseAge,warning};
}
export function drawNightmareRefraction(c,s,reduced=false){
 const q=nightmareMirage(s);if(!q||!q.strength||reduced)return;
 roomSample??=document.createElement('canvas');
 const width=c.canvas.width,height=c.canvas.height;
 if(roomSample.width!==width||roomSample.height!==height){roomSample.width=width;roomSample.height=height;}
 const sample=roomSample.getContext('2d');sample.clearRect(0,0,width,height);sample.drawImage(c.canvas,0,0);
 const z=s.camera.zoom||1;
 for(const worldX of [q.from,q.to]){
  const x=(worldX-s.camera.x)*z,y=(q.y-60-s.camera.y)*z,r=95*z;
  if(x+r<0||x-r>960||y+r<0||y-r>540)continue;
  c.save();c.beginPath();c.ellipse(x,y,r*.72,r*1.2,0,0,Math.PI*2);c.clip();
  for(let row=Math.max(0,Math.floor(y-r*1.2));row<Math.min(540,y+r*1.2);row+=4){
   const offset=Math.sin(row*.12-s.fxTime*22)*8*z*q.strength;
   c.drawImage(roomSample,0,row*height/540,width,Math.min(4,540-row)*height/540,offset,row,960,Math.min(4,540-row));
  }
  c.restore();
 }
}
export function drawNightmareAfterimages(c,s,art,drawing,paintCel,reduced=false){
 for(const p of nightmareIllusionCopies(s)){
  const d=p.key?coherentNightmareDrawing({key:p.key,frame:reduced?0:p.frame,size:0}):drawing;
  c.save();c.globalAlpha=p.alpha;c.filter=`hue-rotate(${p.hue}deg) saturate(1.65)`;
  paintCel(c,art[d.key],d.frame,p.x+(d.offsetX||0)*(p.dir>0?-1:1),p.y,d.size,p.dir>0);c.restore();
 }
 const q=nightmareMirage(s);if(!q||!q.strength||reduced)return;
 const b=s.boss,age=q.age;
 // Harmless optical copies share the caster's actual current drawing. They
 // have no entities, hitboxes, projectile emitters or independent timers.
 for(const [x,alpha]of [[q.from,.32],[q.to,.42]]){
  c.save();c.globalAlpha=alpha*q.strength;c.filter='hue-rotate(28deg) saturate(1.5)';
  const flicker=Math.sin(age*19)*3;
  paintCel(c,art[drawing.key],drawing.frame,x+(drawing.offsetX||0)*(b.dir>0?-1:1)+flicker,q.y,drawing.size,b.dir>0);
  c.restore();
 }
}
