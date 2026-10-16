import {ribbonActive,ribbonJumpSpin} from '../engine/adventureRibbonState';

// Painted petals stay in world space after Hexy moves past them.
export function drawRibbonPetals(c,s,art,reduced=false){
 const img=art['ribbon-dance'];if(!img)return;
 for(const [i,q]of(s.ribbonPetals||[]).entries()){
  if(reduced&&i%3)continue;
  c.save();c.translate(q.x,q.y);c.rotate(q.angle);c.globalAlpha=Math.min(.85,q.life*2);
  c.drawImage(img,q.frame*320,320,320,320,-q.size/2,-q.size/2,q.size,q.size);c.restore();
 }
}
// Separate upper and lower passes put the actor inside the painted spiral.
export function drawRibbonOrbit(c,s,art,front,reduced=false){
 const p=s.player,img=art['ribbon-dance'];if(!img||!ribbonActive(s)||!p.guarding&&!(p.dash>0)&&!ribbonJumpSpin(s))return;
 const frame=reduced?0:Math.floor((p.dash>0?(p.dashDuration-p.dash)*24:ribbonJumpSpin(s)?(.48-p.ribbonFlip)*16:p.guardAge*12))%4,size=p.dash>0?132:138,y=p.y-size/2+4;
 c.save();c.beginPath();c.rect(p.x-size/2,front?y:y-size/2,size,size/2);c.clip();c.globalAlpha=.9;
 c.drawImage(img,frame*320,0,320,320,p.x-size/2,y-size/2,size,size);c.restore();
}
export function drawRibbonReturn(c,q,art){
 const img=art['ribbon-dance'];if(!img)return;
 c.save();c.translate(q.x,q.y);c.rotate(Math.atan2(q.vy,q.vx));
 c.drawImage(img,Math.floor(q.age*14)%4*320,320,320,320,-23,-17,46,34);c.restore();
}
