import {paintMagicLight} from './projectileLightsCanvas';
import {witchVessel} from '../actors/villageWitchAnchors';
import {HARVESTER_AIR_SIZE} from '../actors/harvesterRegistration';
import {harvesterMuzzle} from '../engine/villageHarvester';
export function drawHarvesterBroom(c,s,art,reduced){
 const img=art['harvester-flight-v15'];if(!img)return;
 for(const e of s.enemies)if(e.type===28&&e.hp>0&&e.broom){const cell=img.width/4,frame=16+(reduced?0:Math.floor(s.time*6)%4),size=HARVESTER_AIR_SIZE;
  c.save();c.translate(e.broom.x,e.broom.y);if(e.dir>0)c.scale(-1,1);c.drawImage(img,frame%4*cell,Math.floor(frame/4)*cell,cell,cell,-size/2,-size*250/256,size,size);c.restore();
 }
}
export function drawHarvesterLight(c,s,e,reduced){
 if(e.hp<=0)return;
 const v=witchVessel(e),charging=e.phase==='windup',pulse=reduced?1:.88+Math.sin(s.time*7)*.12;
 paintMagicLight(c,v.x,v.y,charging?120:80,e.harvestStage===2?'#56efff':'#ffb34e',(charging?.6:.25)*pulse);
 paintMagicLight(c,v.x,e.y,110,'#49cfff',charging?.22:.08,true);
 if(charging){const m=harvesterMuzzle(e);paintMagicLight(c,m.x,m.y,70,'#ad65ff',.35*pulse);}
}
