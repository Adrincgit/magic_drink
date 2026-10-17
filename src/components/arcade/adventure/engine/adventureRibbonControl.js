import {surfaceY} from '../world/adventureTerrain';
import {ribbonLevel} from './adventureRibbonState';
import {canControlEnemy} from '../actors/enemies/adventureEnemyTraits';

export const ribbonSmall=e=>[0,1,3,4,10,11,14].includes(e.type)&&canControlEnemy(e,'bind',true)&&!e.trap;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
// Follow only connected floor. Neither a tug nor an automatic dance step can
// carry an actor through a wall or across a gap to an unrelated platform.
export function ribbonFloor(s,x,y){
 return s.platforms.filter(q=>x>=q.x&&x<=q.x+q.w).map(q=>({q,y:surfaceY(q,x)})).filter(q=>Math.abs(q.y-y)<18).sort((a,b)=>Math.abs(a.y-y)-Math.abs(b.y-y))[0];
}
export function ribbonSlide(s,e,dx,margin=12){
 const count=Math.max(1,Math.ceil(Math.abs(dx)/3)),step=dx/count;let moved=0;
 for(let i=0;i<count;i++){
  const next=e.x+step,floor=ribbonFloor(s,next,e.baseY??e.y),edge=ribbonFloor(s,next+Math.sign(step)*margin,e.baseY??e.y);
  if(!floor||!edge||s.platforms.some(q=>next+margin>q.x&&next-margin<q.x+q.w&&surfaceY(q,next)<(e.baseY??e.y)-20&&surfaceY(q,next)+(q.h||24)>(e.baseY??e.y)-45))break;
  e.x=next;moved+=step;if(e.baseY!==undefined){const delta=floor.y-e.baseY;e.baseY=floor.y;e.y+=delta;}
 }
 return moved;
}
export function ribbonControl(s,e,kind){
 if(!ribbonSmall(e)||e.hp<=0&&!['slam','airbind'].includes(kind))return;
 const level=ribbonLevel(s),dir=Math.sign(e.x-s.player.x)||s.player.dir;
 if(kind==='bind'){
  if(e.ribbonControl?.kind==='bind'||(e.ribbonResolve||0)>0||s.enemies.filter(q=>q!==e&&q.ribbonControl?.kind==='bind').length>=3)return;
  e.ribbonBound=1.2+level*.15;e.ribbonControl={kind,age:0,duration:e.ribbonBound};
 }else if(kind==='launch'){
  e.ribbonControl=null;e.ribbonBound=0;e.ribbonLift=true;e.ribbonAirLinks=0;e.jellyLift=1.8;e.vy=-490;e.y-=2;
 }else if(kind==='airbind'){
  e.ribbonBound=.8;e.jellyLift=0;e.ribbonLift=true;e.y=Math.min(e.y,e.baseY-28);e.vy=0;e.ribbonControl={kind,age:0,duration:.17,level};
 }else if(kind==='slam'){
  e.ribbonBound=0;e.jellyLift=0;e.ribbonLift=true;e.y=Math.min(e.y,e.baseY-22);e.vy=Math.max(420,e.vy||0);e.ribbonControl={kind,age:0,duration:.65,level};
 }else{
  const pull=kind==='pull',distance=pull?Math.max(0,Math.abs(e.x-s.player.x)-82):75+level*12;
  e.ribbonBound=0;e.ribbonControl={kind,age:0,duration:.24,remaining:Math.min(distance,pull?85+level*12:120),dir:pull?-dir:dir};
 }
 e.ribbonStagger=0;e.action=0;e.recovery=Math.max(e.recovery||0,.26);e.timer=Math.max(e.timer||0,.5);
}
function groundImpact(s,e,level){
 s.events.push('ribbonGroundImpact');s.hitStop=Math.max(s.hitStop,.065);
 s.effects.push({drinkFx:12,ribbonSlam:true,x:e.x,y:e.y,size:150+level*12,age:0,life:.4,duration:.4});
 for(const other of s.enemies)if(other!==e&&other.hp>0&&ribbonSmall(other)&&Math.abs(other.y-e.y)<55&&Math.abs(other.x-e.x)<120+level*12){
  // The impact pushes, without multiplying damage or triggering another slam.
  ribbonControl(s,other,'push');other.ribbonControl.dir=Math.sign(other.x-e.x)||s.player.dir;
 }
}
export function stepRibbonControl(s,e,dt){
 e.ribbonLanding=Math.max(0,(e.ribbonLanding||0)-dt);
 e.ribbonResolve=Math.max(0,(e.ribbonResolve||0)-dt);
 const f=e.ribbonControl;if(!f)return false;
 if(e.hp<=0&&!['slam','airbind'].includes(f.kind)){e.ribbonControl=null;e.ribbonBound=0;return false;}
 f.age+=dt;e.flash=Math.max(0,e.flash-dt);e.action=0;
 if(f.kind==='airbind'){
  e.deadTime=Math.max(e.deadTime||0,.3);e.vy=0;
  if(f.age>=f.duration){e.vy=620;e.ribbonControl={kind:'slam',age:0,duration:1.2,level:f.level,bound:true,reel:f.reel,dir:f.dir,remaining:f.remaining};}
 }else if(f.kind==='slam'){
  if(f.reel&&f.remaining>0){const distance=Math.min(f.remaining,250*dt);ribbonSlide(s,e,f.dir*distance);f.remaining-=distance;}
  e.vy+=1250*dt;e.y+=e.vy*dt;e.deadTime=Math.max(e.deadTime,.25);
  if(e.y>=e.baseY){e.y=e.baseY;e.vy=0;e.ribbonLift=false;e.ribbonBound=0;e.ribbonControl=null;e.landing=.18;e.ribbonLanding=.38;groundImpact(s,e,f.level);if(f.reel&&f.remaining>0)e.ribbonControl={kind:'pull',age:0,duration:.22,remaining:f.remaining,dir:f.dir};}
  else if(f.age>f.duration){e.ribbonControl=null;e.ribbonLift=false;}
 }else if(f.kind==='bind'){
  e.ribbonBound=Math.max(0,f.duration-f.age);
  if(e.y<e.baseY){e.vy+=850*dt;e.y=Math.min(e.baseY,e.y+e.vy*dt);}else e.vy=0;
  e.jellyLift=0;e.ribbonLift=e.y<e.baseY;
  if(!e.ribbonBound){e.ribbonControl=null;e.ribbonResolve=.75;e.ribbonLift=false;e.home=e.x;}
 }else{
  const distance=Math.min(f.remaining,(f.remaining+20)*12*dt);
  ribbonSlide(s,e,f.dir*distance);f.remaining-=distance;
  if(e.y<e.baseY){e.vy+=850*dt;e.y=Math.min(e.baseY,e.y+e.vy*dt);}
  if(f.age>=f.duration){e.ribbonControl=null;e.home=e.x;}
 }
 return true;
}

export function stepRibbonDance(s,dt){
 const p=s.player;
 if(!p.ribbonSwing||!p.ribbonStep||p.dash>0||p.hitReact>0||p.guarding||p.drinkCast>0)return;
 const age=1-p.ribbonSwing/p.ribbonDuration;
 if(!p.ribbonSpinning&&(age<.2||age>.65))return;
 const level=ribbonLevel(s),axis=p.ribbonAxis||p.dir,dir=p.ribbonFinisher==='pull'?-p.dir:axis;
 const distance=Math.min(p.ribbonStep,(p.ribbonSpinning?90:[120,165,215,240][level-1])*dt);
 if(p.ground!==null){const moved=ribbonSlide(s,p,dir*distance,20);p.ribbonStep-=distance;p.ribbonTravel=(p.ribbonTravel||0)+Math.abs(moved);}
 else if(level>=2){
  // Air steering changes horizontal motion only: no extra jump or hover.
  p.vx=dir*clamp(Math.max(Math.abs(p.vx),level===2?95:145),0,300);p.ribbonStep-=distance;
 }
}
