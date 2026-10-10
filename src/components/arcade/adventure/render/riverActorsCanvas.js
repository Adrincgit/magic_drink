import {enemyDrawing} from './adventureSprites';
import {enemyGeometry} from '../actors/enemies/adventureEnemyGeometry';
import {drawHarborFX} from './bargeCanvas';
export function drawAquaticEnemy(c,e,art,reduced=false){
 if(e.type===8&&['hidden','submerged'].includes(e.phase)){
  if(e.phase==='submerged')drawHarborFX(c,art,2,reduced?0:Math.floor(e.clock*8)%4,e.x,e.waterY,32,12);return;
 }
 const pose=enemyDrawing(e,reduced),img=art[pose.key],cell=img.width/(pose.columns||4),size=enemyGeometry(e).size;
 c.save();
 if(e.type===9&&e.hp<=0){c.beginPath();c.rect(e.x-size,e.waterY-size*1.5,size*2,size*1.5+12);c.clip();c.globalAlpha=Math.min(1,e.deadTime/.45);}
 if(e.type===8&&e.phase==='swim'){c.beginPath();c.rect(e.x-size,e.waterY-size*2,size*2,size*2);c.clip();}
 if(e.flash>0&&(reduced||Math.floor(e.flash*25)%2===0))c.filter='brightness(2)';
 c.translate(e.x,pose.surface?e.waterY:e.y);if(e.dir>0)c.scale(-1,1);
 c.drawImage(img,(pose.frame%(pose.columns||4))*cell,Math.floor(pose.frame/(pose.columns||4))*cell,cell,cell,-size/2,-size*250/256,size,size);c.restore();
 if(e.type===8&&['swim','surfaceFire','emerge','dive'].includes(e.phase))drawHarborFX(c,art,2,reduced?0:Math.floor(e.clock*10)%4,e.x,e.waterY,65,20);
 if(e.trap&&(e.type===9||e.phase==='swim')){
  const frame=reduced?0:Math.floor(e.clock*7)%4,bw=size*1.18,centerY=e.y-size*(e.type===9?.5:.4);
  c.save();c.globalAlpha=.65;c.drawImage(art['trap-bubble'],frame*256,0,256,256,e.x-bw/2,centerY-bw/2,bw,bw);c.restore();
 }
}
