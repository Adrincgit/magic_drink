import {ZEPPELIN_WIDTH,ZEPPELIN_HEIGHT,ZEPPELIN_CELL_ASPECT,ZEPPELIN_DUST_DURATION,zeppelinMuzzle,zeppelinFrame} from '../actors/enemies/adventureZeppelin';
import {AIR_ENEMY_SCALE} from '../actors/enemies/adventureEnemyGeometry';

export function drawZeppelin(c,e,art,reduced=false){
 const w=ZEPPELIN_WIDTH,h=ZEPPELIN_HEIGHT,left=e.x-w/2,top=e.y-h;
 if(e.landed){
  const progress=Math.min(1,(e.dustAge||0)/ZEPPELIN_DUST_DURATION),frame=reduced?0:Math.min(3,Math.floor(progress*4)),size=w*1.65*(1+progress*.18);
  c.save();c.globalAlpha*=Math.pow(1-progress,.75);
  c.drawImage(art['zeppelin-dust'],frame*256,0,256,256,e.x-size/2,e.y-size*.85,size,size);c.restore();return;
 }
 const frame=zeppelinFrame(e,reduced),fieldWidth=w*466/429.25,cellHeight=fieldWidth*ZEPPELIN_CELL_ASPECT;
 c.drawImage(art['zeppelin-actions'],frame%4*512,Math.floor(frame/4)*384,512,384,e.x-fieldWidth/2,e.y-cellHeight*.848,fieldWidth,cellHeight);
 if(e.hp<=0)return;
 const scale=w/1512,scaleY=h/805,pivot={x:left+31*scale,y:top+258*scaleY};
 c.save();c.translate(pivot.x,pivot.y);c.rotate(reduced?0:e.clock*29);
 c.drawImage(art['zeppelin-propeller'],-31*scale,-151*scaleY,80*scale,298*scaleY);c.restore();
 if(e.captive?.carried&&!e.captive.lost){
  c.save();c.strokeStyle='#8c582c';c.lineWidth=2*AIR_ENEMY_SCALE;
  for(const x of [-16,16]){c.beginPath();c.moveTo(e.x+x*AIR_ENEMY_SCALE,e.y-8*AIR_ENEMY_SCALE);c.lineTo(e.x+x*AIR_ENEMY_SCALE,e.y+12*AIR_ENEMY_SCALE);c.stroke();}
  c.drawImage(art['rescue-cage'],0,0,256,256,e.x-35*AIR_ENEMY_SCALE,e.y-5*AIR_ENEMY_SCALE,70*AIR_ENEMY_SCALE,70*AIR_ENEMY_SCALE);c.restore();
 }
 if(e.hp>0&&(e.phase==='windup'||e.action>0)){
  const q=zeppelinMuzzle(e),r=e.action>0?16:10,g=c.createRadialGradient(q.x,q.y,1,q.x,q.y,r);
  g.addColorStop(0,'#fff0c7cc');g.addColorStop(.35,'#ff655977');g.addColorStop(1,'#f92c4100');
  c.save();c.fillStyle=g;c.fillRect(q.x-r,q.y-r,r*2,r*2);c.restore();
 }
}

export function drawRedPellet(c,q){
 const r=(q.drawSize||18)/2,g=c.createRadialGradient(q.x-r*.3,q.y-r*.35,1,q.x,q.y,r);
 g.addColorStop(0,'#fff0c3');g.addColorStop(.26,'#ff6554');g.addColorStop(.7,'#ed293b');g.addColorStop(1,'#941736');
 c.save();c.fillStyle=g;c.beginPath();c.arc(q.x,q.y,r,0,Math.PI*2);c.fill();c.lineWidth=1.1;c.strokeStyle='#641d3a';c.stroke();c.restore();
}
