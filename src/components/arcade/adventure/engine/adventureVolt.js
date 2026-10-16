import {graveBody} from './adventureGraveyard';
import {hexyMuzzle} from '../actors/hexy/hexyAnimation';
import {enemyBody} from '../actors/enemies/adventureEnemyGeometry';
import {umbrellaBlocks,umbrellaShield,umbrellaOpen} from '../actors/enemies/adventureUmbrella';
import {bossTargets} from '../actors/enemies/adventureEnemies';
import {supplyBody} from '../world/adventureSupplies';
import {outpostBody} from '../actors/enemies/adventureOutposts';
import {surfaceY} from '../world/adventureTerrain';
import {spendDrink,drinkScale} from './adventureAmmo';
import {modShotScale} from './adventureMods';
import {drinkMastery} from './adventureDrinkMastery';
import {takeEchoVolley} from './adventureEcho';
import {clearPowerProjectiles} from './adventureDefense';
function rayBox(o,d,b,range){
 let near=0,far=range;
 for(const [start,delta,lo,hi]of [[o.x,d.x,b.x-5,b.x+b.w+5],[o.y,d.y,b.y-5,b.y+b.h+5]]){
  if(Math.abs(delta)<.0001){if(start<lo||start>hi)return null;continue;}
  const a=(lo-start)/delta,c=(hi-start)/delta;near=Math.max(near,Math.min(a,c));far=Math.min(far,Math.max(a,c));if(near>far)return null;
 }
 return near;
}
function wallDistance(s,o,d,length){
 for(let t=8;t<=length;t+=8){const x=o.x+d.x*t,y=o.y+d.y*t;
  if(s.platforms.some(p=>!p.bridge&&x>p.x&&x<p.x+p.w&&y>surfaceY(p,x)+2&&y<surfaceY(p,x)+(p.h||120)))return t;
 }
 return length;
}
function beamPath(s,o,d,strong){
 const mastery=drinkMastery(s,9),jump=mastery===3?(strong?340:200):(strong?290:165);
 const reach=wallDistance(s,o,d,strong?850:315),candidates=s.enemies.filter(e=>e.hp>0&&!e.fleeing&&!e.emerging).map(e=>({target:e,enemy:true,box:umbrellaOpen(e)?{...enemyBody(e),x:Math.min(enemyBody(e).x,umbrellaShield(e).x),w:99}:enemyBody(e)}));
 candidates.push(...(s.graves||[]).filter(q=>q.hp>0).map(q=>({target:q,box:graveBody(q)})));
 candidates.push(...s.supplies.filter(q=>q.hp>0).map(q=>({target:q,box:supplyBody(q)})),...s.outposts.filter(q=>q.hp>0).map(q=>({target:q,box:outpostBody(q)})),...s.cages.filter(q=>!q.open&&!q.carried&&!q.lost).map(q=>({target:q,box:{x:q.x-30,y:q.y-62,w:60,h:62}})));
 if(s.boss.hp>0&&!['sleep','defeated','dying'].includes(s.boss.phase))candidates.push(...bossTargets(s).map(box=>({target:s.boss,box})));
 const first=candidates.map(q=>({...q,t:rayBox(o,d,q.box,reach)})).filter(q=>q.t!==null).sort((a,b)=>a.t-b.t)[0];
 const to=first?{x:o.x+d.x*(first.t+6),y:o.y+d.y*(first.t+6)}:{x:o.x+d.x*reach,y:o.y+d.y*reach};
 const segments=[{from:o,to}],hits=first?[{...first,point:to,from:o,damageScale:1}]:[];
 if(!first?.enemy||umbrellaBlocks(first.target,{x:to.x,y:to.y,voltOrigin:o,vx:d.x,vy:d.y}))return{segments,hits};
 // Continue from the visible impact, not an unrelated point at the centre
 // of the first clown; that offset left a gap between connected branches.
 let from=to,chainCenter={x:first.target.x,y:first.target.y-38};const seen=new Set([first.target]);
 for(let i=1;i<(strong?5:3);i++){
  const next=s.enemies.filter(e=>e.hp>0&&!e.fleeing&&!e.emerging&&!seen.has(e)).map(e=>({e,d:Math.hypot(e.x-chainCenter.x,e.y-38-chainCenter.y),paintDistance:Math.hypot(e.x-from.x,e.y-38-from.y)})).filter(q=>q.d<jump).sort((a,b)=>a.d-b.d).find(q=>wallDistance(s,from,{x:(q.e.x-from.x)/(q.paintDistance||1),y:(q.e.y-38-from.y)/(q.paintDistance||1)},q.paintDistance)>=q.paintDistance);
  if(!next)break;seen.add(next.e);const point={x:next.e.x,y:next.e.y-38};segments.push({from,to:point});hits.push({target:next.e,enemy:true,point,from,damageScale:Math.pow(.75,i)});
  if(umbrellaBlocks(next.e,{x:point.x,y:point.y,voltOrigin:from,vx:point.x-from.x,vy:point.y-from.y}))break;
  from=point;chainCenter=point;
 }
 return{segments,hits};
}
function pulse(s,path,damage,scale){
 for(const hit of path.hits)s.shots.push({kind:9,voltProbe:true,chainCopy:true,chainTarget:hit.enemy?hit.target:null,voltOrigin:hit.from,x:hit.point.x,y:hit.point.y,vx:0,vy:0,r:12,damage:damage*hit.damageScale,scale,heavy:true,hidden:true,sustained:true,life:.03,age:0,hits:[]});
}
export function voltBurst(s,scale){
 const p=s.player,from=hexyMuzzle(s),path=beamPath(s,from,{x:p.aimX,y:p.aimY},true);pulse(s,path,7,scale);
 for(const q of path.segments){s.effects.push({drinkArc:true,voltBurst:true,x:q.from.x,y:q.from.y,toX:q.to.x,toY:q.to.y,age:0,life:.36,duration:.36});clearPowerProjectiles(s,[{kind:9,previousX:q.from.x,previousY:q.from.y,x:q.to.x,y:q.to.y,r:13,life:1,powerClear:true}]);}
}
export function stepVoltChannel(s,input,dt){
 const p=s.player,active=!s.basicFire&&s.weapon===9&&input.attack&&p.firing&&!p.specialCast&&!s.placement&&!s.superCinematic&&!(p.drinkCast>0);
 if(!active){s.voltBeam=null;return;}
 let q=s.voltBeam;
 if(!q){if(!s.ammo&&!(s.overdrive>0))return;q=s.voltBeam={age:0,bill:.22,pulse:drinkMastery(s,9)>=2?.28:.34,segments:[]};spendDrink(s);q.echoes=takeEchoVolley(s);s.events.push('voltShot');}
 q.age+=dt;q.bill-=dt;q.pulse-=dt;
 if(q.bill<=0){spendDrink(s);q.echoes=takeEchoVolley(s);q.bill+=.22;}
 const from=hexyMuzzle(s),dir={x:p.aimX,y:p.aimY},path=beamPath(s,from,dir,false);
 const copies=(q.echoes||[]).filter(f=>f.life>0&&s.drinkFields.includes(f)).map(f=>({f,path:beamPath(s,f.muzzle,dir,false)}));
 q.segments=path.segments.concat(copies.flatMap(q=>q.path.segments));q.strength=Math.min(1,q.age/1.1);p.cast=.16;
 if(q.pulse<=0){
  q.pulse+=.12;const damage=.3+.65*Math.min(1,Math.max(0,q.age-(drinkMastery(s,9)>=2?.28:.34))/.85);pulse(s,path,damage,drinkScale(s)*modShotScale(s));s.events.push('voltPulse');
  for(const {f,path:copy}of copies)pulse(s,copy,damage*f.copyDamage,f.scale);
 }
}
