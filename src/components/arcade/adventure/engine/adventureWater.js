import {aquaFloor,aquaImpact,aquaExtinction} from './adventureAquaEffects';
import {impactKind} from './adventureHitReactions';
import {emberBreathHitbox} from './adventureEmberFire';
import {emberBlastHitbox} from './adventureEmberBlast';
import {harlequinFireHitbox} from '../actors/bosses/harlequinFire';

export const WATER_DRINK=5;
export const wetGround=(s,x,y)=>s.emberEnvironment?.wetGround?.some(q=>q.life>0&&Math.abs(q.x-x)<q.r&&Math.abs(q.y-y)<90);
export function waterSplash(s,x,y,size=75,steam=false){
 aquaImpact(s,x,y,size,steam);
}
const touches=(q,b,r)=>{
 const x=q.previousX??q.x,y=q.previousY??q.y;
 return Math.min(x,q.x)-r<b.x+b.w&&Math.max(x,q.x)+r>b.x&&Math.min(y,q.y)-r<b.y+b.h&&Math.max(y,q.y)+r>b.y;
};
export function quenchWithWater(s,q){
 if(q.kind!==WATER_DRINK||q.life<=0)return false;
 q.waterHits??=new Set();const power=(q.waterPower??(q.heavy?4:1))*(q.scale>1.15?1.5:1),r=q.splashRadius||q.r||16;
 let touched=false;
 const soak=(target,required)=>{
  if(q.waterHits.has(target))return false;
  q.waterHits.add(target);
  const spent=q.waterBudget?.get(target)||0,dose=q.waterBudget?Math.min(power,q.waterLimit-spent):power;
  if(dose<=0)return false;
  q.waterBudget?.set(target,spent+dose);target.water=(target.water||0)+dose;
  target.fireVisualStrength??=target.fireStrength??1;target.fireStrength=Math.max(.15,1-target.water/required);
  waterSplash(s,q.x,q.y,q.waterFxSize||(q.heavy?125:65),true);touched=true;return target.water>=required-.0001;
 };
 for(const fire of s.hostile){
  if(fire.life<=0||fire.quenched||impactKind(fire)!=='fire'||fire.kind==='ember-blast'&&!emberBlastHitbox(fire))continue;
  const box=emberBreathHitbox(fire)||emberBlastHitbox(fire)||harlequinFireHitbox(fire)||{x:fire.x-(fire.r||20),y:fire.y-(fire.r||20),w:(fire.r||20)*2,h:(fire.r||20)*2};
  if(!touches(q,box,r))continue;
  const grounded=fire.kind==='harlequin-groundfire'||fire.kind==='harlequin-pyre';
  const required=grounded?4:fire.kind.includes('breath')?5:Math.max(1,Math.ceil((fire.drawSize||fire.r*2||45)/45));
  if(soak(fire,required)){
   if(grounded)aquaExtinction(s,fire.x,fire.floor??fire.y,fire.source==='forest'?210:122,fire.kind==='harlequin-pyre'?420:fire.source==='forest'?140:82,fire.fireVisualStrength);
   fire.quenched=true;fire.life=0;
   if(fire.kind==='ember-blast')for(const fx of s.effects)if(fx.fireBurst&&Math.hypot(fx.x-fire.x,fx.y-fire.y)<8){fx.age=Math.max(fx.age,.7);fx.life=Math.min(fx.life,.18);}
   if(grounded&&s.emberEnvironment)(s.emberEnvironment.wetGround??=[]).push({x:fire.x,y:fire.floor??fire.y,r:95,life:7});
  }
 }
 for(const bush of s.emberEnvironment?.bushes||[]){
  if(bush.state!=='burning'||!touches(q,{x:bush.x-62,y:bush.y-70,w:124,h:76},r))continue;
  if(soak(bush,3)){
   aquaExtinction(s,bush.x,bush.y,160,150,bush.fireVisualStrength);
   bush.state='charred';bush.age=0;bush.wetTime=7;
   (s.emberEnvironment.wetGround??=[]).push({x:bush.x,y:bush.y,r:100,life:7});
   for(const fire of s.hostile)if(fire.source==='forest'&&Math.abs(fire.x-bush.x)<90){fire.life=0;fire.quenched=true;}
  }
 }
 for(const pit of s.emberEnvironment?.pits||[]){
  if(pit.quenched||!touches(q,{x:pit.x,y:pit.y-50,w:pit.w,h:55},r))continue;
  if(soak(pit,8)){
   pit.quenched=true;
   const strength=pit.fireVisualStrength??1;
   for(let i=0;i<3;i++)aquaExtinction(s,pit.x+35+i*(pit.w-70)/2,pit.y,62*strength,82*strength);
  }
 }
 if(touched&&!q.heavy)q.life=0;
 return touched;
}
export function stepWaterShot(s,q,dt){
 if(q.kind!==WATER_DRINK||q.life<=0)return;
 if(q.aquaProbe){quenchWithWater(s,q);return;}
 if(!q.heavy)q.vy+=115*dt;
 quenchWithWater(s,q);
 const floor=aquaFloor(s,q.x);
 if(q.life>0&&q.y+q.r>=floor&&q.vy>=0){
  q.y=floor-5;q.splashRadius=q.heavy?130:65;quenchWithWater(s,q);waterSplash(s,q.x,floor,q.heavy?145:85);q.life=0;
 }
}
