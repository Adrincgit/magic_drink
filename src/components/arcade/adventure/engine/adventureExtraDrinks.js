import {voltBurst} from './adventureVolt';
import {surfaceY} from '../world/adventureTerrain';
import {hexyMuzzle} from '../actors/hexy/hexyAnimation';
import {drinkMastery} from './adventureDrinkMastery';
import {canControlEnemy} from '../actors/enemies/adventureEnemyTraits';
import {worldSound} from './adventureWorldAudio';
export const VOLT=9,HONEY=10,ORBIT=11;
const small=e=>canControlEnemy(e,'slow');
const floorBelow=(s,x,y)=>s.platforms.filter(p=>x>=p.x&&x<=p.x+p.w&&surfaceY(p,x)>=y-12).sort((a,b)=>surfaceY(a,x)-surfaceY(b,x))[0];
const burst=(s,kind,x,y,size=65)=>s.effects.push({drinkFx:kind,x,y,size,age:0,life:.36,duration:.36});
const probe=(s,kind,x,y,r,damage,extra={})=>s.shots.push({kind,x,y,r,damage,vx:0,vy:0,age:0,life:.024,heavy:true,hidden:true,sustained:true,hits:[],scale:1,...extra});
export function configureExtraShot(q){
 if(q.kind===VOLT){const n=Math.hypot(q.vx,q.vy)||1;q.vx=q.vx/n*870;q.vy=q.vy/n*870;q.r=8*q.scale;q.damage=3.2;q.life=.32;}
 if(q.kind===HONEY){q.vx*=.65;q.vy=q.vy===0?-240:q.vy*.7;q.r=13*q.scale;q.damage=2.8;q.life=2.2;}
 if(q.kind===ORBIT){q.orbitVX=q.vx;q.orbitVY=q.vy;q.r=13*q.scale;q.damage=3.4;q.life=1.35;}
 return q;
}
function honeyPatch(s,x,y,scale){
 const platform=floorBelow(s,x,y);if(!platform)return;
 const floor=surfaceY(platform,x);if(floor-y>50)return;
 const patches=s.drinkFields.filter(f=>f.kind===HONEY&&f.puddle&&f.life>0);
 const near=patches.find(f=>Math.abs(f.x-x)<36&&Math.abs(f.y-floor)<20);
 if(near){near.life=Math.max(near.life,2.3);return;}
 if(patches.length>=6)patches[0].life=0;
 s.drinkFields.push({kind:HONEY,puddle:true,x,y:floor,platform,age:0,life:2.3,scale});
}
export function beginExtraSpecial(s,kind,scale,placement){
 const p=s.player,m=hexyMuzzle(s);
 if(kind===VOLT){
  voltBurst(s,scale);
 }else if(kind===HONEY){
  const level=drinkMastery(s,HONEY);s.drinkFields.push({kind,x:placement?.x??m.x+p.dir*135,y:placement?.y??m.y-145,age:0,life:level>=2?3.3:2.65,scale,at:0,level,drops:[6,8,10][level-1],interval:level===3?.27:.34,hiveSize:level===3?1.12:1});
 }else if(kind===ORBIT){
  const level=drinkMastery(s,ORBIT),count=level===3?4:3;
  s.drinkFields.push({kind,x:p.x,y:p.y-56*scale,age:0,life:level>=2?5:4.2,scale,orbSize:level===3?.88:1,orbDamage:12/count,orbs:Array.from({length:count},(_,i)=>({alive:true,angle:i*Math.PI*2/count,hits:[]}))});
 }
}
export function orbitPosition(f,orb){const a=orb.angle+f.age*3.2;return{x:f.x+Math.cos(a)*74*f.scale,y:f.y+Math.sin(a)*34*f.scale};}
export function releaseOrbit(s){
 if(s.weapon!==ORBIT||drinkMastery(s,ORBIT)<2)return false;
 const f=s.drinkFields.find(f=>f.kind===ORBIT&&f.life>0);if(!f)return false;
 const alive=f.orbs.filter(o=>o.alive),angle=Math.atan2(s.player.aimY,s.player.aimX);
 for(const [i,orb]of alive.entries()){
  const p=orbitPosition(f,orb),a=angle+(i-(alive.length-1)/2)*.15;
  s.shots.push({kind:ORBIT,...p,vx:Math.cos(a)*570,vy:Math.sin(a)*570,r:13*f.scale,damage:f.orbDamage||4,life:1.2,age:0,scale:f.scale*(f.orbSize||1),hits:[],orbitLaunched:true,orbitVolley:true});orb.alive=false;
 }
 f.life=0;s.events.push('orbitShot');s.player.cast=.24;s.player.specialWait=.25;return true;
}
export function stepExtraField(s,f,dt){
 if(f.kind===HONEY){
  if(f.puddle){
   f.x+=f.platform.dx||0;f.y=surfaceY(f.platform,f.x);
   for(const e of s.enemies)if(e.hp>0&&!e.fleeing&&small(e)&&Math.abs(e.x-f.x)<45*f.scale&&Math.abs(e.y-f.y)<20){e.snare=Math.max(e.snare||0,.3);e.honeyed=Math.max(e.honeyed||0,.3);}
  }else while(f.at<(f.drops||6)&&f.age>=.18+f.at*(f.interval||.34)){
   const lane=[-1,0,1,1,0,-1][f.at++%6],size=f.level===3?.88:1;
   s.shots.push({kind:HONEY,x:f.x+lane*34*f.scale*(f.hiveSize||1),y:f.y+22,vx:lane*42,vy:90,r:13*f.scale*size,damage:f.level===3?2.4:3,life:2.3,age:0,scale:f.scale*size,hits:[],honeyRain:true,powerClear:true});s.events.push('honeyDrop');
  }
 }else if(f.kind===ORBIT){
  f.x=s.player.x;f.y=s.player.y-56*f.scale;
  for(const orb of f.orbs)if(orb.alive){
   const point=orbitPosition(f,orb);
   const bullet=s.hostile.find(h=>h.life>0&&!h.quenched&&!/breath|groundfire|pyre|blast|jet|wave|surf/.test(h.kind)&&Math.hypot(h.vx||0,h.vy||0)>15&&Math.hypot(h.x-point.x,h.y-point.y)<18*f.scale*(f.orbSize||1)+(h.r||10));
   if(bullet){bullet.life=0;orb.alive=false;burst(s,ORBIT,point.x,point.y);s.events.push('orbitBlock');continue;}
   probe(s,ORBIT,point.x,point.y,17*f.scale*(f.orbSize||1),f.orbDamage||4,{scale:f.scale,orbitOrb:orb,hits:orb.hits});
  }
  if(f.orbs.every(o=>!o.alive))f.life=0;
 }
}
export function stepExtraShot(s,q,dt){
 if(q.orbitOrb&&!q.orbitOrb.alive){q.life=0;return;}
 if(q.hidden||q.heavy||q.life<=0)return;
 if(q.kind===HONEY){
  q.vy+=620*dt;
  for(const p of s.platforms){if(p.bridge)continue;const top=surfaceY(p,q.x);if(q.x>=p.x&&q.x<=p.x+p.w&&q.vy>0&&q.previousY+q.r<=top+10&&q.y+q.r>=top){q.life=0;honeyPatch(s,q.x,top,q.scale);worldSound(s,'impactHoney',q.x,top);break;}}
 }else if(q.kind===ORBIT&&!q.orbitLaunched){
  if(q.age<.46&&!q.prismSplit){
   const p=q.orbitAnchor||s.player,dir=Math.sign(q.orbitVX??q.vx)||1,a=-q.age/.46*Math.PI*1.7;
   q.x=p.x+Math.cos(a)*dir*56;q.y=p.y-52+Math.sin(a)*28;q.vx=q.vy=0;
  }else{q.orbitLaunched=true;q.vx=q.orbitVX??510;q.vy=q.orbitVY??0;}
 }
}
// Contact effects share normal damage and defeat bookkeeping.
export function extraDrinkHit(s,q,target,enemy=false){
 if(q.orbitOrb){q.orbitOrb.alive=false;q.life=0;}
 if(q.kind===HONEY&&!q.hidden&&enemy){if(small(target)){target.snare=Math.max(target.snare||0,1.1);target.honeyed=Math.max(target.honeyed||0,1.1);}honeyPatch(s,target.x,target.y,q.scale);}
}
