import {worldSound} from './adventureWorldAudio';
import {groundY} from '../world/adventureTerrain';
import {enemyBody} from '../actors/enemies/adventureEnemyGeometry';
import {villageVillagerProfile} from '../actors/villageVillagers';
const stoneTarget=(s,q)=>s.enemies.filter(e=>e.hp>0&&Math.abs(e.x-q.x)>55&&Math.abs(e.x-q.x)<580).sort((a,b)=>Math.abs(a.x-q.x)-Math.abs(b.x-q.x))[0];

export function prepareVillageResistance(s){
 const old=new Map((s.villageRubble||[]).map(q=>[q.id,q]));
 s.villageRubble=s.level.rubble.map(q=>({...q,...old.get(q.id)}));s.villageStones=[];
}
function freeRubble(s,r){
 if(r.freed)return;r.freed=true;r.hp=0;r.age=0;worldSound(s,'rubbleBreak',r.x,r.y);
 const q=s.villagers.find(n=>n.id===r.villager);
 if(q&&['trapped','hiding'].includes(q.state)){q.state='recover';q.age=0;q.tripped=true;q.warned=true;q.rubbleId=null;q.hidingCover=null;s.village.rescued=(s.village.rescued||0)+1;s.events.push('rescue');s.notice='villageRubbleFree';s.noticeTime=3;}
}
export function stepVillageResistance(s,dt,defeat){
 if(!s.level.villageTrail)return;
 for(const r of s.villageRubble){
  r.age=(r.age||0)+dt;
  if(r.freed)continue;
  // These rescues require breaking the debris with an actual attack.
  r.hit=Math.max(0,(r.hit||0)-dt);
 }
 for(const q of s.villagers){
  if(q.state==='flee'&&q.defender&&!q.defended&&Math.abs(s.player.x-q.x)<650&&stoneTarget(s,q)){q.state='defend';q.age=0;q.stonesThrown=0;q.throwAge=0;q.throwReleased=false;}
  if(q.state!=='defend')continue;
  q.age+=dt;q.throwAge=(q.throwAge||0)+dt;q.y=groundY(s.level.route,q.x);
  if(!q.throwAim){const target=stoneTarget(s,q);if(!target){q.state='flee';q.age=0;continue;}const b=enemyBody(target);q.defendDir=Math.sign(target.x-q.x)||1;q.throwAim={x:target.x,y:b.y+b.h*.5};}
  q.throwFrame=[0,.13,.23,.34,.43,.57,.70,.86].filter(t=>q.throwAge>=t).length-1;
  if(q.throwAge>=.86){q.x-=75*dt;q.y=groundY(s.level.route,q.x);}
  if(q.throwAge>=.43&&!q.throwReleased){
   const p=villageVillagerProfile(q.style),tip=p.throwTip||[242,82],x=q.x+q.defendDir*(tip[0]-128)*p.size/256,y=q.y+(tip[1]-250)*p.size/256,t=Math.min(.95,Math.max(.38,Math.abs(q.throwAim.x-x)/470));
   s.villageStones.push({x,y,vx:(q.throwAim.x-x)/t,vy:(q.throwAim.y-y)/t-420*t/2,life:1.8,age:0,from:q.id});q.stonesThrown++;q.throwReleased=true;worldSound(s,'stoneThrow',x,y);
  }
  if(q.throwAge>=1.05){q.throwAge=0;q.throwReleased=false;delete q.throwAim;if(q.stonesThrown>=3||!stoneTarget(s,q)){q.state='flee';q.defended=q.stonesThrown>=3;q.age=0;}}
 }
 for(const r of s.villageStones){
  r.life-=dt;r.age+=dt;r.vy+=420*dt;r.x+=r.vx*dt;r.y+=r.vy*dt;
  for(const e of s.enemies){if(e.hp<=0)continue;const b=enemyBody(e,9);if(r.x>=b.x&&r.x<=b.x+b.w&&r.y>=b.y&&r.y<=b.y+b.h){r.life=0;e.hp-=.65;e.flash=.16;worldSound(s,'rubbleHit',r.x,r.y);if(e.hp<=0)defeat(s,e);break;}}
  if(r.y>groundY(s.level.route,r.x))r.life=0;
 }
 s.villageStones=s.villageStones.filter(q=>q.life>0);
}
export function hitVillageRubble(s,shot,radius){
 if(!s.level.villageTrail||shot.chainTarget||shot.life<=0)return;
 for(const r of s.villageRubble){
  if(r.freed||(shot.rubbleHits||[]).includes(r.id)||Math.abs(shot.x-r.x)>65+radius||shot.y<r.y-(r.shelter?86:60)-radius||shot.y>r.y+radius)continue;
  (shot.rubbleHits??=[]).push(r.id);r.hp-=shot.damage||1;r.hit=.2;
  if(r.hp<=0)freeRubble(s,r);else worldSound(s,'rubbleHit',r.x,r.y);
  if(!shot.piercing&&!shot.heavy&&![0,1].includes(shot.kind))shot.life=0;
 }
}
