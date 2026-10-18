import {drawWindCloth} from './windClothCanvas';
import {bargeParts} from '../actors/bosses/bargeSystems';
import {bargeCell} from './bargeMachineryCanvas';
import {drawAquaticEnemy} from './riverActorsCanvas';
import {bargeRig} from '../actors/bosses/adventureBarge';
import {bossHitFilter} from '../actors/bosses/bossFeedback';
import {drawHullWater} from './harborWaterCanvas';
import {drawWaterDetail} from './paintedWaterCanvas';
import {drawBargePercussion} from './bargePercussionCanvas';
import {spoutPoint} from '../actors/bosses/bargeWaterAttacks';
function part(c,img,x,y,w,h,angle=0){c.save();c.translate(x,y);c.rotate(angle);c.drawImage(img,-w/2,-h/2,w,h);c.restore();}
export function drawAquaticFX(c,art,row,frame,x,y,w,h=w,angle=0){
 c.save();c.translate(x,y);c.rotate(angle);c.drawImage(art['harbor-aquatic'],frame*256,row*256,256,256,-w/2,-h/2,w,h);c.restore();
}
export function drawHarborFX(c,art,row,frame,x,y,w,h=w,flip=false,angle=0){
 const img=art['harbor-effects'];c.save();c.translate(x,y);c.rotate(angle);if(flip)c.scale(-1,1);c.drawImage(img,frame*256,row*256,256,256,-w/2,-h/2,w,h);c.restore();
}
export function drawBargeSplash(c,art,q,reduced=false){
 const frame=reduced?0:Math.min(3,Math.floor(q.age/.12)),h=q.size*.72;
 // Ground impacts register at the painted foam's base, not the cell centre.
 const base=[234,236,233,233][frame]/256;
 const y=q.surfaceY===undefined?q.y:q.surfaceY-h*(base-.5);
 drawHarborFX(c,art,2,frame,q.x,y,q.size,h);
}
export function drawCannonWater(c,art,x,y,length,height,angle,age,reduced=false,alpha=1){
 if(length<=0)return;
 // One continuous painted frame, cropped before the decorative source lip.
 // The right-hand water root stays inside the real cannon's mouth.
 const frame=reduced?0:Math.floor(age*16)%5,sourceWidth=Math.min(1450,Math.max(32,length*224/height));
 c.save();c.globalAlpha*=alpha;c.translate(x,y);c.rotate(angle);
 c.drawImage(art['harbor-jet'],1450-sourceWidth,frame*224,sourceWidth,224,-length,-height/2,length+5,height);c.restore();
}
function paintRegion(c,img,m,rect){
 const [x,y,w,h]=rect;c.drawImage(img,x,y,w,h,m.body.x+x*m.unit,m.body.y+y*m.unit,w*m.unit,h*m.unit);
}
const DRUM_REGION=[316,314,285,340],TANK_REGION=[753,322,174,317];
export function drawBarge(c,s,art,reduced=false){
 const b=s.boss;if(b.phase==='sleep')return;
 if(b.shattered){
  const m=bargeRig(s),u=Math.min(1,(b.defeat.age-1.55)/2.6);
  c.save();c.beginPath();c.rect(m.body.x-250,m.body.y-400,m.body.w+500,m.waterY-m.body.y+400);c.clip();
  c.translate(b.x,m.waterY);c.rotate(reduced?0:u*.2);c.translate(-b.x,-m.waterY+u*u*170);
  paintRegion(c,art['barge-phase-two'],m,[45,634,1470,300]);c.restore();
  drawBargeEscape(c,s,art,reduced);return;
 }
 const m=bargeRig(s),t=s.fxTime||s.time||0,parts=bargeParts(s),img=art['barge-pressure-barge'],damaged=art['barge-pressure-damage'];
 const preparing=b.phase==='warn',firing=b.release>0,frame=reduced?0:Math.floor(t*10)%4;
 drawHullWater(c,img,b.x,m.waterY,m.body.w,m.body.h,t,reduced,art);
 c.save();
 if(b.defeat){c.translate(b.x,m.waterY);c.rotate(reduced?0:Math.min(.06,b.defeat.age*.03));c.translate(-b.x,-m.waterY+Math.min(22,b.defeat.age*12));}
 c.filter=bossHitFilter(b,reduced);
 drawWindCloth(c,img,m.body.x,m.body.y,m.body.w,m.body.h,t,{flags:[[.11,.283,.069,.079],[.901,.326,.07,.078]],windArt:art,reduced});
 if(b.hullOpened||b.defeat?.age>=.55)paintRegion(c,art['barge-phase-two'],m,[210,652,1185,260]);
 for(const [name,rect]of [['drum',DRUM_REGION],['tank',TANK_REGION]]){
  c.save();if(!b.flash)c.filter=bossHitFilter(parts[name],reduced);
  if(parts[name].hp<=0)paintRegion(c,damaged,m,rect);
  else if(parts[name].flash>0)paintRegion(c,img,m,rect);
  c.restore();
 }
 c.restore();
 if(!b.defeat)drawBargePercussion(c,s,art,m,t,reduced);
 // Real level divers leave the stern cabin on a supported deck. The front
 // rail occludes their feet, as the basket rim does for the first boss.
 for(const e of s.enemies)if(e.bargeCrew&&['exit','deploy'].includes(e.phase)&&e.hp>0){
  c.save();if(e.phase==='exit'){c.beginPath();c.rect(m.stern.x-22,m.body.y,m.ledge.x-m.stern.x+110,m.waterY-m.body.y);c.clip();}
  drawAquaticEnemy(c,e,art,reduced);c.restore();
 }
 c.save();c.filter=bossHitFilter(b,reduced);paintRegion(c,img,m,[1127,552,386,82]);c.restore();
 drawBargeEscape(c,s,art,reduced);
 if(preparing&&['mortar','broadside','tidal'].includes(b.move)){
  const pulse=reduced?.5:.5+.3*Math.sin(t*20);drawWaterDetail(c,art,3,frame,m.muzzle.x-10,m.muzzle.y,38,30,0,pulse);
 }
 if(firing&&['mortar','broadside','tidal'].includes(b.move)){
  const u=1-b.release/.25;
  for(let i=0;i<4;i++)drawWaterDetail(c,art,3,(frame+i)%4,m.muzzle.x-20-u*(45+i*12),m.muzzle.y+(i-1.5)*9,65+u*70,50+u*55,0,(1-u)*.75);
 }
 if(preparing&&b.move==='drumroll'&&parts.drum.hp>0||firing&&b.move==='drumroll'){
  const pulse=firing?1-b.release/.25:((t*2)%1);c.save();c.globalAlpha=firing?.8:.2;
  bargeCell(c,art['barge-sonic'],Math.min(3,Math.floor(pulse*4)),m.drum.x-16-pulse*30,m.drum.y,70+pulse*90,90+pulse*75);c.restore();
 }
 if(preparing&&b.move==='jet'&&parts.tank.hp>0){
  // Painted bubbles are confined to the real glass chamber.
  c.save();c.beginPath();c.ellipse(m.tank.x,m.tank.y,m.tank.w*.29,m.tank.h*.39,0,0,Math.PI*2);c.clip();
  for(let i=0;i<5;i++){const u=reduced?i/5:(t*1.6+i/5)%1;drawWaterDetail(c,art,0,(i+frame)%4,m.tank.x+Math.sin(i*2)*12,m.tank.y+m.tank.h*.35-u*m.tank.h*.7,12,18,0,.8);}
  c.restore();drawWaterDetail(c,art,3,frame,m.jetMuzzle.x-8,m.jetMuzzle.y,34,25,0,.5);
 }
 if(preparing&&b.move==='tidal')drawWaterDetail(c,art,3,frame,m.muzzle.x-12,m.muzzle.y,60,42,0,.8);
 drawHarborFX(c,art,2,frame,m.wheel.x,m.waterY,108,50);
 for(const [j,vent]of m.vents.entries())for(let i=0;i<(preparing?4:2);i++){
  const u=reduced?(i+.5)/4:(t*.85+i*.27+j*.1)%1;
  drawWaterDetail(c,art,3,Math.min(3,Math.floor(u*4)),vent.x+Math.sin(u*4+j)*8,vent.y-u*70,23+u*50,25+u*52,0,(1-u)*(preparing?.65:.4));
 }
}
function drawBargeEscape(c,s,art,reduced){
 const q=s.boss.defeat;if(!q)return;const m=bargeRig(s);
 for(let i=0;i<2;i++){
  const age=q.age-.15-i*.48;if(age<0)continue;
  const walk=Math.min(1,age/.6),jump=Math.max(0,Math.min(1,(age-.6)/.85));
  const x=m.stern.x+(m.ledge.x-m.stern.x)*walk+jump*48;
  const y=jump?m.ledge.y+(m.waterY-m.ledge.y)*jump-Math.sin(jump*Math.PI)*75:m.stern.y+(m.ledge.y-m.stern.y)*walk;
  if(jump<1)drawAquaticEnemy(c,{type:8,hp:1,x,y,dir:1,phase:walk<1?'exit':'deploy',phaseAge:age-.6,gait:age*1.2,clock:s.time},art,reduced);
  else if(age<2)drawWaterDetail(c,art,1,Math.floor(s.time*8)%4,x,m.waterY,72,24,0,.7);
 }
}
export function drawBargeProjectile(c,q,art,reduced=false){
 const frame=reduced?1:Math.floor(q.age*12)%4,size=q.drawSize||65;
 if(q.kind==='barge-sonic'||q.kind==='barge-hoop'){c.save();c.globalAlpha*=.82*Math.min(1,q.life/.3);c.translate(q.x,q.y);if(q.vx>0)c.scale(-1,1);bargeCell(c,art['barge-sonic'],Math.min(3,Math.floor(q.age*7)),0,0,size,size*.9);c.restore();}
 else if(q.kind==='barge-wave'||q.kind==='barge-surf'){
  const h=size*.85,base=[246,250,250,248][frame]/256;
  c.save();c.translate(q.x,q.floor+9);if(q.vx>0)c.scale(-1,1);
  drawAquaticFX(c,art,3,frame,0,-h*(base-.5),size,h);c.restore();
 }
 else if(q.kind==='barge-balloon'||q.kind==='barge-shell'){
  drawAquaticFX(c,art,0,frame,q.x,q.y,size,size,reduced?0:Math.sin(q.age*5)*.12);
 }else if(q.kind==='water-bolt'){
  const angle=Math.atan2(q.vy,q.vx)-Math.PI;
  if(!reduced)for(let i=3;i>0;i--){c.save();c.globalAlpha=.23*(1-i/5);drawAquaticFX(c,art,1,(frame+i)%4,q.x-q.vx*i*.028,q.y-q.vy*i*.028+Math.sin(q.age*15+i)*3,size*(.42-i*.06),size*(.42-i*.06),angle);c.restore();}
  drawAquaticFX(c,art,1,frame,q.x,q.y,size,size,angle);
 }else if(q.kind==='barge-jet'){
  const length=q.length||0,angle=q.angle??-.06,fade=Math.min(1,q.life/.25);
  drawCannonWater(c,art,q.x,q.y,length,88,angle,q.age,reduced,fade);
  const tip={x:q.x-length*Math.cos(angle),y:q.y-length*Math.sin(angle)};
  drawWaterDetail(c,art,3,frame,tip.x+10,tip.y+12,85,64,0,.4*fade);
 }else if(q.kind==='barge-spout'){
  const front=Math.min(q.age,q.flight),tail=q.tailTime||0,segments=10,fade=Math.min(1,q.life/.1),height=q.large?88:72;
  const points=Array.from({length:segments+1},(_,i)=>spoutPoint(q,tail+(front-tail)*i/segments)),lengths=points.slice(1).map((p,i)=>Math.hypot(p.x-points[i].x,p.y-points[i].y)),total=lengths.reduce((a,b)=>a+b,0),sourceWidth=Math.min(1450,Math.max(32,total*224/height)),cel=reduced?0:Math.floor(q.age*16)%5;
  // Painted strips follow one ballistic centre line. The first tangent is
  // horizontal at the real cannon; the front reaches the floor before a wave.
  let travelled=0;
  for(let i=0;i<segments&&total>0;i++){
   const a=points[i],b=points[i+1],length=lengths[i],sw=sourceWidth*length/total,sx=1450-sourceWidth*(travelled+length)/total;
   c.save();c.globalAlpha*=fade;c.translate(a.x,a.y);c.rotate(Math.atan2(a.y-b.y,a.x-b.x));
   c.drawImage(art['harbor-jet'],sx,cel*224,Math.max(1,sw),224,-length-2,-height/2,length+5,height);c.restore();travelled+=length;
  }
  const tip=spoutPoint(q,front);drawWaterDetail(c,art,1,frame,tip.x,tip.y,55,q.large?65:45,0,fade*.65);
 }else{
  c.save();if(q.kind==='diver-hoop')c.filter='hue-rotate(130deg)';drawHarborFX(c,art,1,frame,q.x,q.y,size,size,false,Math.atan2(q.vy,q.vx)*.08);c.restore();
 }
}

export function drawBargeImpact(c,art,q,reduced=false){
 const row=q.bargeBeat?0:1,frame=reduced?1:Math.min(3,Math.floor(q.age/(q.lifeSpan||q.age+q.life)*4)),size=q.size;
 c.save();c.globalAlpha*=Math.min(1,q.life/.12);
 c.drawImage(art['barge-impact'],frame*256,row*256,256,256,q.x-size/2,q.y-size/2,size,size);c.restore();
}
