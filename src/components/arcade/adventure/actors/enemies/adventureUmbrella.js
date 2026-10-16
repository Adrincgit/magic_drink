import {surfaceY} from '../../world/adventureTerrain';
import {enemyAimTarget} from '../../engine/adventureTacticalMods';
export const UMBRELLA_TYPE=14;
export const umbrellaOpen=e=>e.type===UMBRELLA_TYPE&&e.hp>0&&!e.trap&&(!e.umbrellaPhase||e.umbrellaPhase==='guard'||e.umbrellaPhase==='open'&&e.umbrellaAge>.18);
export function umbrellaShield(e){return{x:e.x+(e.dir<0?-64:34),y:e.y-89,w:30,h:69};}
export function umbrellaBlocks(e,q){
 if(!umbrellaOpen(e))return false;
 const origin=q.voltOrigin||q.ribbonOrigin||{x:q.previousX??q.x,y:q.previousY??q.y};
 if(origin.y<e.y-94||Math.abs(q.vy)>Math.abs(q.vx)*1.2&&q.vy>0)return false;
 return (origin.x-e.x)*e.dir>8&&q.y>e.y-95&&q.y<e.y-9;
}
export function stepUmbrella(s,e,dt,shoot){
 e.umbrellaHit=Math.max(0,(e.umbrellaHit||0)-dt);
 if(e.trap>0)return;
 const target=enemyAimTarget(s,e),near=Math.abs(e.x-target.x)<510;
 e.umbrellaPhase??='guard';e.umbrellaAge=(e.umbrellaAge||0)+dt;
 const enter=phase=>{e.umbrellaPhase=phase;e.umbrellaAge=0;};
 if(e.umbrellaPhase==='guard'){
  e.phase='patrol';
  const next=e.x+e.dir*34*dt,floor=s.platforms.find(p=>next>=p.x+22&&next<=p.x+p.w-22&&Math.abs(surfaceY(p,next)-e.baseY)<25);
  if(floor&&Math.abs(next-e.home)<160&&!s.level.emberPits?.some(p=>next>p.x-26&&next<p.x+p.w+26)){e.x=next;e.y=e.baseY=surfaceY(floor,next);}else e.dir*=-1;
  if(e.umbrellaAge>(s.gentle?2:1.6)&&near){e.dir=Math.sign(target.x-e.x)||e.dir;enter('close');s.events.push('umbrellaClose');}
 }else if(e.umbrellaPhase==='close'){
  e.phase='windup';if(e.umbrellaAge>=.65){enter('attack');const x=e.x+e.dir*68,y=e.y-45;shoot(s,x,y,e.dir>0?0:Math.PI,230,'ring',{r:12,life:1.5});s.events.push('cast');}
 }else if(e.umbrellaPhase==='attack'){
  e.phase='attack';if(e.umbrellaAge>=.24)enter('recover');
 }else if(e.umbrellaPhase==='recover'){
  e.phase='recover';if(e.umbrellaAge>=.75)enter('open');
 }else{e.phase='rest';if(e.umbrellaAge>=.35)enter('guard');}
}
export function umbrellaFrame(e,reduced){
 if(e.hp<=0)return 12+Math.min(3,Math.floor((e.deathAge||0)/.25));
 if(e.umbrellaHit>0)return 10;
 if(e.umbrellaPhase==='close')return e.umbrellaAge<.24?4:5;
 if(e.umbrellaPhase==='attack')return 6;
 if(e.umbrellaPhase==='recover')return 7;
 if(e.umbrellaPhase==='open')return 8;
 return reduced?9:Math.floor((e.gait||0)*4)%4;
}
