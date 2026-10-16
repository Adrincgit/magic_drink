import {groundY} from '../world/adventureTerrain';
import {enemyBody} from '../actors/enemies/adventureEnemyGeometry';
import {villageVillagerProfile} from '../actors/villageVillagers';

export function prepareVillageResistance(s){
 const old=new Map((s.villageRubble||[]).map(q=>[q.id,q]));
 s.villageRubble=s.level.rubble.map(q=>({...q,...old.get(q.id)}));s.villageStones=[];
}
function freeRubble(s,r){
 if(r.freed)return;r.freed=true;r.hp=0;r.age=0;
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
  if(q.state==='flee'&&q.defender&&!q.defended&&Math.abs(s.player.x-q.x)<550){q.state='defend';q.age=0;q.stonesThrown=0;}
  if(q.state!=='defend')continue;
  q.age+=dt;q.x-=32*dt;q.y=groundY(s.level.route,q.x);
  const target=s.enemies.filter(e=>e.hp>0&&e.x>q.x+40&&e.x<q.x+520).sort((a,b)=>a.x-b.x)[0];
  q.defendTarget=target?.x??q.x+300;
  if(target&&q.age>(q.stonesThrown||0)*1.05+.48&&q.stonesThrown<3){
   const p=villageVillagerProfile(q.style),tip=p.throwTip||[242,82],x=q.x+(tip[0]-128)*p.size/256,y=q.y+(tip[1]-250)*p.size/256,t=Math.min(.8,Math.max(.35,(target.x-x)/420)),body=enemyBody(target);
   s.villageStones.push({x,y,vx:(target.x-x)/t,vy:(body.y+body.h*.5-y)/t-420*t/2,life:1.6,age:0});q.stonesThrown++;s.events.push('jump');
  }
  if(q.age>3.25){q.state='flee';q.defended=true;q.age=0;}
 }
 for(const r of s.villageStones){
  r.life-=dt;r.age+=dt;r.vy+=420*dt;r.x+=r.vx*dt;r.y+=r.vy*dt;
  for(const e of s.enemies){if(e.hp<=0)continue;const b=enemyBody(e,7);if(r.x>=b.x&&r.x<=b.x+b.w&&r.y>=b.y&&r.y<=b.y+b.h){r.life=0;e.hp-=.65;e.flash=.16;if(e.hp<=0)defeat(s,e);break;}}
  if(r.y>groundY(s.level.route,r.x))r.life=0;
 }
 s.villageStones=s.villageStones.filter(q=>q.life>0);
}
export function hitVillageRubble(s,shot,radius){
 if(!s.level.villageTrail||shot.chainTarget||shot.life<=0)return;
 for(const r of s.villageRubble){
  if(r.freed||(shot.rubbleHits||[]).includes(r.id)||Math.abs(shot.x-r.x)>65+radius||shot.y<r.y-(r.shelter?86:60)-radius||shot.y>r.y+radius)continue;
  (shot.rubbleHits??=[]).push(r.id);r.hp-=shot.damage||1;r.hit=.2;
  if(r.hp<=0)freeRubble(s,r);
  if(!shot.piercing&&!shot.heavy&&![0,1].includes(shot.kind))shot.life=0;
 }
}
