import {witchVessel} from '../actors/villageWitchAnchors';
import {witchId} from '../engine/villageRescue';
import {paintMagicLight} from './projectileLightsCanvas';
function cell(c,img,f,x,y,w,h=w,center=false,flip=false){if(!img)return;const n=img.width/4;c.save();c.translate(x,y);if(flip)c.scale(-1,1);c.drawImage(img,f%4*n,Math.floor(f/4)*n,n,n,-w/2,center?-h/2:-h*250/256,w,h);c.restore();}
export function drawVillageObstacles(c,s,art){
 for(const r of s.villageObstacles||[]){
  if(r.x+r.size/2<s.camera.x-80||r.x-r.size/2>s.camera.x+960/(s.camera.zoom||1)+240)continue;
  const damaged=r.hp<(r.maxHp||r.hp)*.55,frame=r.frame+(r.broken?(r.breakAge<.16?2:3):damaged?1:0);
  c.save();if(r.hit>0)c.filter='brightness(1.65)';cell(c,art[r.blockade?'village-collapse-v10':'village-obstacles-v8'],r.blockade?(r.broken?r.breakAge<.22?4:5:Math.min(3,Math.floor((1-r.hp/r.maxHp)*4))):frame,r.x,r.y,r.size);c.restore();
 }
}
export function drawVillageDestruction(c,s,art){
 for(const q of s.villageDebris||[]){c.save();c.globalAlpha=Math.min(1,q.life/.4);c.translate(q.x,q.y);c.rotate(q.rotation);cell(c,art[q.key||'village-obstacles-v8'],q.frame,0,0,q.size,q.size,true);c.restore();}
}
export function drawVillageAbsorption(c,s,art,reduced){
 for(const e of s.enemies){
  if(![26,28].includes(e.type)||e.hp<=0)continue;
  const capturing=['absorb','absorb-player'].includes(e.phase),launch=e.releasePulse>0;if(!capturing&&!launch)continue;
  const v=witchVessel(e),owner=witchId(e),victims=s.villagers.filter(q=>q.curseOwner===owner&&['absorbing','absorbed'].includes(q.state)),hexy=s.player.candy?.absorber===owner&&!s.player.candy.pumpkin?s.player:null;
  const sources=victims.filter(q=>q.state==='absorbing');if(hexy)sources.push(hexy);
  const frame=reduced?1:Math.floor(s.time*14)%4;
  for(const [index,source] of sources.entries()){
   const start={x:source.x,y:source.y-(source===hexy?27:12)},dx=v.x-start.x,dy=v.y-start.y,d=Math.hypot(dx,dy),angle=Math.atan2(dy,dx);
   if(d>14&&art['village-absorb-fx-v8']){c.save();c.translate(start.x,start.y);c.rotate(angle);c.globalCompositeOperation='screen';c.globalAlpha=Math.max(.35,.8/Math.sqrt(sources.length));const img=art['village-absorb-fx-v8'],n=img.width/4;c.drawImage(img,frame*n,0,n,n,0,-28,d,56);c.restore();}
   for(let i=0;i<(reduced?2:5);i++){const t=(s.time*1.5+i/5+index*.17)%1,x=start.x+dx*t,y=start.y+dy*t+Math.sin(t*Math.PI*3+s.time*8+index)*8*(1-t);cell(c,art['village-absorb-fx-v8'],8+frame,x,y,13,13,true);}
   paintMagicLight(c,start.x,start.y,54,'#a968ff',.6);
  }
  if(capturing){
   paintMagicLight(c,v.x,v.y,78,'#ba57ff',.65);c.save();c.globalCompositeOperation='screen';cell(c,art['village-absorb-fx-v8'],4+frame,v.x,v.y,v.size*1.45,v.size*1.45,true);c.restore();
   const charge=Math.max(0,...victims.map(q=>Math.min(1,Math.max(0,((q.absorbProgress||0)-.55)/.45))),hexy?Math.max(0,Math.min(1,(hexy.candy.absorbProgress-.5)*2)):0);
   if(charge>0){paintMagicLight(c,v.x,v.y,100,'#ffb13b',charge*.9);c.save();c.globalCompositeOperation='screen';c.globalAlpha=charge;cell(c,art['village-absorb-fx-v8'],8+frame,v.x,v.y-5,v.size*1.85,v.size*1.85,true);c.restore();}
  }
  if(launch){const point=e.releasePoint||v;paintMagicLight(c,point.x,point.y,120,'#ffb444',e.releasePulse*1.5);cell(c,art['village-absorb-fx-v8'],12+Math.min(3,Math.floor((.55-e.releasePulse)/.55*4)),point.x+e.dir*18,point.y-20,110,110,true,e.dir<0);}
 }
}
