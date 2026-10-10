import {bargeParts} from '../actors/bosses/bargeSystems';
import {bargeCell,drawBargeCrew,drawBargeMachinery} from './bargeMachineryCanvas';
import {bargeRig} from '../actors/bosses/adventureBarge';
import {bossHitFilter} from '../actors/bosses/bossFeedback';
import {drawHullWater} from './harborWaterCanvas';
import {drawWaterDetail} from './paintedWaterCanvas';
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
export function drawBarge(c,s,art,reduced=false){
 const b=s.boss;if(b.phase==='sleep')return;if(b.shattered){drawBargeEscape(c,s,art,reduced);return;}
 const m=bargeRig(s),t=reduced?0:Math.floor((s.time||0)*12)/12,preparing=b.phase==='warn',strike=b.release>0,parts=bargeParts(s),k=m.scale;
 drawHullWater(c,art['barge-body'],b.x,m.waterY,m.body.w,m.body.h,t,reduced,art);
 c.save();c.beginPath();c.rect(m.body.x-80,m.body.y-180,m.body.w+160,m.waterY-m.body.y+182);c.clip();
 if(b.defeat){const tilt=reduced?0:Math.min(.09,b.defeat.age*.04);c.translate(b.x,m.waterY);c.rotate(tilt);c.translate(-b.x,-m.waterY+Math.min(28,b.defeat.age*14));}

 const hull=m.body;c.drawImage(art['barge-body'],hull.x,hull.y,hull.w,hull.h);
 if(b.transformed){const damaged=art['barge-damaged'];c.drawImage(damaged,0,damaged.height*.65,damaged.width,damaged.height*.35,hull.x,hull.y+hull.h*.65,hull.w,hull.h*.35);}
 part(c,art['barge-wheel'],m.wheel.x,m.wheel.y,m.wheel.r*2,m.wheel.r*2,reduced?0:b.wheelAngle||t*2.6);
 const ratio=parts.drum.hp/parts.drum.maxHp,drumFrame=ratio<=0?3:ratio<.35?2:ratio<.7?1:0;
 const beat=strike&&b.move==='drumroll'&&ratio>0;
 c.save();c.filter=bossHitFilter(parts.drum,reduced);
 bargeCell(c,art['barge-drum-states'],drumFrame,m.drum.x,m.drum.y,m.drum.r*2+(beat?5:0),m.drum.r*2-(beat?5:0));
 c.restore();drawBargeMachinery(c,s,art,m,t,reduced);
 const loop=reduced?0:Math.floor(t*6)%4;
 const drummerFrame=ratio<=0?8+loop:b.move==='drumroll'?(preparing?4:beat?(b.release>.12?6:7):(b.shotClock<.15?5:loop)):loop;
 if(!b.defeat||b.defeat.age<.7){const size=228*k;c.drawImage(art['barge-drummer'],drummerFrame%4*384,Math.floor(drummerFrame/4)*384,384,384,m.drummer.x-size*.68,m.drummer.y-size*368/384,size,size);}
 const gunner=parts.tank.hp<=0?12+loop:b.move==='jet'?(preparing?4+loop:b.phase==='attack'?8+loop:loop):loop;
 if(!b.defeat||b.defeat.age<1){const size=160*k;c.drawImage(art['barge-gunner'],gunner%4*256,Math.floor(gunner/4)*256,256,256,m.nozzle.x+64*k-size*.61,m.nozzle.y+10*k-size*250/256,size,size);}
 for(const [i,port]of m.ports.entries()){
  const firing=b.portFlash?.index===i&&b.portFlash.age>0;
  part(c,art['barge-cannon'],port.x+(firing?5:0),port.y,100*k,60*k,preparing&&b.move==='broadside'?.15:0);
  if(preparing&&b.move==='broadside')drawWaterDetail(c,art,3,loop,port.x-45,port.y,38,36,0,.55);
 }
 part(c,art['barge-cannon'],m.cannon.x,m.cannon.y,132*k,79*k,m.cannon.angle);
 bargeCell(c,art['barge-nozzle'],strike&&b.move==='jet'?1:0,m.nozzle.x,m.nozzle.y,120*k,96*k);
 c.restore();
 if(strike&&b.move==='tidal'){
  const x=m.muzzle.x,y=m.muzzle.y,tip=m.wave;drawCannonWater(c,art,x,y,Math.hypot(x-tip.x,y-tip.y),66,Math.atan2(y-tip.y,x-tip.x),t,reduced);
 }
 drawBargeEscape(c,s,art,reduced);
 const frame=reduced?1:Math.floor(t*8)%4,force=false;
 drawHarborFX(c,art,2,frame,m.wheel.x,m.waterY,force?170:108,force?100:50);
 if(force)drawHarborFX(c,art,0,frame,b.x-310,m.waterY-18,145,90);
 for(const [j,vent]of m.vents.entries())for(let i=0;i<(b.transformed?4:2);i++){
  const age=reduced?(i+.5)/4:(t*.85+i*.27+j*.1)%1,r=7+age*14;
  drawWaterDetail(c,art,3,Math.min(3,Math.floor(age*4)),vent.x+Math.sin(age*4+j)*8,vent.y-age*72,r*3,r*3,0,(1-age)*.4);
 }
}
function drawBargeEscape(c,s,art,reduced){
 const b=s.boss,q=b.defeat;if(!q)return;const m=bargeRig(s);
 for(let i=0;i<2;i++){
  const age=q.age-(i?1:.7);if(age<0)continue;const start=i?{x:m.nozzle.x+64,y:m.nozzle.y+10}:m.drummer,u=Math.min(1,age/.95);
  const x=start.x-u*(130+i*40)-Math.max(0,age-.95)*24,y=start.y+(m.waterY-start.y)*u-(reduced?0:Math.sin(u*Math.PI)*110);
  c.save();c.globalAlpha=Math.min(1,Math.max(0,(4.5-q.age)/.45));drawBargeCrew(c,art,u<1?14:15,x,y,105);
  if(u===1)drawWaterDetail(c,art,1,reduced?0:Math.floor(s.time*8)%4,x,m.waterY,72,24,0,.7);c.restore();
 }
}
export function drawBargeProjectile(c,q,art,reduced=false){
 const frame=reduced?1:Math.floor(q.age*12)%4,size=q.drawSize||65;
 if(q.kind==='barge-sonic'||q.kind==='barge-hoop'){c.save();c.globalAlpha*=.82*Math.min(1,q.life/.3);c.translate(q.x,q.y);if(q.vx>0)c.scale(-1,1);bargeCell(c,art['barge-sonic'],Math.min(3,Math.floor(q.age*7)),0,0,size,size*.9);c.restore();}
 else if(q.kind==='barge-wave')drawHarborFX(c,art,0,frame,q.x,q.y-9,size,size*.85,q.vx>0);
 else if(q.kind==='barge-surf')drawAquaticFX(c,art,3,frame,q.x,q.floor-size*.41,size,size*.9);
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
 }else{
  c.save();if(q.kind==='diver-hoop')c.filter='hue-rotate(130deg)';drawHarborFX(c,art,1,frame,q.x,q.y,size,size,false,Math.atan2(q.vy,q.vx)*.08);c.restore();
 }
}
