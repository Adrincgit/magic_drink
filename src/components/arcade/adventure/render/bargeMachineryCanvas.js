import {bargeParts} from '../actors/bosses/bargeSystems';
import {bossHitFilter} from '../actors/bosses/bossFeedback';
import {drawWaterDetail} from './paintedWaterCanvas';
export function bargeCell(c,img,frame,x,y,w,h=w){c.drawImage(img,frame*256,0,256,256,x-w/2,y-h/2,w,h);}
export function drawBargeCrew(c,art,frame,x,y,size=132){
 c.drawImage(art['barge-crew'],frame%4*256,Math.floor(frame/4)*256,256,256,x-size/2,y-size*250/256,size,size);
}
export function drawBargeMachinery(c,s,art,m,t,reduced){
 const b=s.boss,parts=bargeParts(s),tank=m.tank,broken=parts.tank.hp<=0,leaking=parts.tank.hp<parts.tank.maxHp*.6;
 const pumping=b.phase==='warn'&&b.move==='jet'&&!broken,flow=pumping||b.phase==='attack'&&b.move==='jet';
 // Painted hose mouth is at source y=200/256; register its centre on the river.
 const hoseTop=tank.y+12,hoseHeight=(m.waterY-hoseTop)/(.29-.5+200/256),hoseX=tank.x+tank.w*.4;
 bargeCell(c,art['barge-hose'],flow&&!reduced?Math.floor(t*8)%2:0,hoseX+35,hoseTop+hoseHeight*.29,110,hoseHeight);
 if(pumping){
  drawWaterDetail(c,art,1,Math.floor(t*9)%4,hoseX+62,m.waterY,64,25,0,.75);
  for(let i=0;i<5;i++){const u=reduced?(i+.5)/5:(t*1.2+i/5)%1;drawWaterDetail(c,art,0,i%4,hoseX+62-u*18,m.waterY-u*32,11,18,0,Math.sin(u*Math.PI)*.8);}
 }
 c.save();c.filter=bossHitFilter(parts.tank,reduced);
 bargeCell(c,art['barge-tank'],broken?3:leaking?2:0,tank.x,tank.y,tank.w,tank.h);
 if(!broken&&!leaking&&(b.visibleFill||0)>.001){
  // The registered glass bounds mask the painted water; a small curved
  // meniscus moves with the pump instead of exposing a rectangular wipe.
  const h=tank.h*.5,base=tank.y+tank.h*.25,left=tank.x-tank.w*.21,right=tank.x+tank.w*.21,y=base-h*b.visibleFill,wave=reduced?0:Math.sin(t*4.5)*2.1;
  c.save();c.beginPath();c.ellipse(tank.x,tank.y,tank.w*.235,tank.h*.30,0,0,Math.PI*2);c.clip();
  c.beginPath();c.moveTo(left-8,y);c.bezierCurveTo(left+tank.w*.14,y+wave,right-tank.w*.14,y-wave,right+8,y);c.lineTo(right+8,base+12);c.lineTo(left-8,base+12);c.closePath();c.clip();c.globalAlpha*=.8;
  bargeCell(c,art['barge-tank'],1,tank.x,tank.y,tank.w,tank.h);c.restore();
 }
 c.restore();
 // A second painted elbow connects the reservoir outlet to the water gun.
 c.save();c.translate(tank.x-tank.w*.3,tank.y+tank.h*.26);c.rotate(Math.PI/2);
 bargeCell(c,art['barge-hose'],flow&&!reduced?Math.floor(t*8)%2:0,27,25,72,92);c.restore();
 if(b.pressureStun>0)for(let i=0;i<3;i++){
  const u=reduced?i/3:(t+i*.3)%1;drawWaterDetail(c,art,3,i,tank.x+(i-1)*22,tank.y-tank.h*.35-u*55,45+u*35,45+u*35,0,(1-u)*.65);
 }
}
