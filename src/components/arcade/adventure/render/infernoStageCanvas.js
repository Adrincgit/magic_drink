import {adventureBounds} from './adventureCamera';
import {painted,paintedParticle} from './paintedDuelCanvas';
import {drawPaintedHeatAura} from './harlequinChaosCanvas';
export function infernoSceneSprite(c,art,frame,x,y,w,h,flip=false,alpha=1){
 const img=art['inferno-scene'];if(!img)return;
 c.save();c.globalAlpha*=alpha;c.translate(x,y);if(flip)c.scale(-1,1);
 c.drawImage(img,frame%4*384,Math.floor(frame/4)*384,384,384,-w/2,-h*350/384,w,h);c.restore();
}
export function arenaBarrierPositions(s){
 if(!s.arenaLocked||s.boss.defeat?.ready)return [];
 const bounds=adventureBounds(s);
 return[{x:bounds.left-15-45,flip:false,edge:bounds.left-15},{x:bounds.right+15+45,flip:true,edge:bounds.right+15}];
}
export function drawInfernoBarriers(c,s,art,reduced=false){
 const frame=4+(reduced?2:Math.floor(s.fxTime*24)%8),floor=s.level.arena.y;
 for(const wall of arenaBarrierPositions(s)){
  // Tall living fire marks the actual blocked edge, including above double jumps.
  c.save();c.globalCompositeOperation='screen';painted(c,art,'pyres',frame,wall.x,floor,150,760,0,.22,.5,380/416);c.restore();
  painted(c,art,'pyres',frame,wall.x,floor,115,720,0,.92,.5,380/416);
  // A broad burning foot anchors the tall barrier on the contact plane.
  const base=8+(reduced?2:Math.floor(s.fxTime*24)%8),inward=wall.flip?-1:1;
  painted(c,art,'fire-show',base,wall.x,floor,190,118,0,1,.5,205/256);
  painted(c,art,'fire-show',8+(base+3)%8,wall.x+inward*40,floor,115,87,0,.85,.5,205/256);
  for(let i=0;i<(reduced?4:15);i++){const t=(s.fxTime*.5+i*.618)%1;paintedParticle(c,art,3,s.fxTime+i,wall.x+Math.sin(i+t*5)*38,floor-t*670,10+i%3*5,s.fxTime+i,Math.sin(t*Math.PI)*.85);}
 }
}
export function drawHarlequinHeat(c,s,art,reduced=false){
 const b=s.boss;if(b.stage<2||b.hp<=0||b.shattered)return;
 const strength=b.stage===3?1:.72,age=s.fxTime;
 c.save();c.filter='none';c.globalCompositeOperation='screen';
 const g=c.createRadialGradient(b.x,b.y-83,8,b.x,b.y-83,135);
 g.addColorStop(0,`rgba(255,160,42,${strength*.16})`);g.addColorStop(.55,`rgba(240,53,14,${strength*.08})`);g.addColorStop(1,'#df3e1300');c.fillStyle=g;c.fillRect(b.x-135,b.y-218,270,270);
 drawPaintedHeatAura(c,s,art,reduced);
 for(let i=0;i<(reduced?5:24);i++){const t=(age*(.7+i%4*.11)+i*.618)%1;paintedParticle(c,art,3,age+i,b.x+(Math.sin(i*2.4+t*3)*53)*(1-t*.25)-(b.heatWind||0)*t*t*120,b.y-t*230,10+i%3*5,age+i,Math.sin(t*Math.PI)*strength*.85);}
 c.restore();
}
