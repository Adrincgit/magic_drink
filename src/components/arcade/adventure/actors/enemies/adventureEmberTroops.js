import {enemyMuzzle} from './adventureEnemyGeometry';
import {enemyAimTarget} from '../../engine/adventureTacticalMods';
import {groundY} from '../../world/adventureTerrain';
import {emberFloor} from '../../engine/adventureEmberFire';
export const TORCH_CLOWN=11;
export const FIRE_WAGON=12;

export function updateEmberTroop(s,e,dt,shoot){
 if(e.trap>0)return;
 const aim=enemyAimTarget(s,e),machine=e.type===FIRE_WAGON,near=Math.abs(aim.x-e.x)<(machine?620:450)&&Math.abs(aim.y-e.y)<220;
 e.y=e.baseY;e.fireState??='patrol';e.fireAge=(e.fireAge||0)+dt;
 const enter=state=>{e.fireState=state;e.fireAge=0;};
 if(e.fireState==='patrol'){
  if(!machine){
   const next=e.x+e.dir*48*dt;
   if(Math.abs(next-e.home)>120||s.level.emberPits?.some(p=>next>p.x-40&&next<p.x+p.w+40))e.dir*=-1;else e.x=next;
   e.y=e.baseY=groundY(s.platforms,e.x,e.baseY);
  }
  if(near&&e.timer<=0){e.dir=Math.sign(aim.x-e.x)||e.dir;e.targetX=aim.x;e.fired=0;enter('windup');}
 }else if(e.fireState==='windup'&&e.fireAge>=(machine?1.3:.95))enter('attack');
 else if(e.fireState==='attack'){
  const releases=machine?[.12,.78]:[.2];
  if(e.fired<releases.length&&e.fireAge>=releases[e.fired]){
   const m=enemyMuzzle(e),flight=machine?1.5:1.05,gravity=machine?480:560;
   const target=e.x+e.dir*Math.max(110,Math.min(machine?540:430,Math.abs(e.targetX-e.x)))+(e.fired?e.dir*65:0);
   const vx=(target-m.x)/flight,vy=(emberFloor(s,target)-18-m.y-.5*gravity*flight*flight)/flight;
   shoot(s,m.x,m.y,Math.atan2(vy,vx),Math.hypot(vx,vy),machine?'ember-mortar':'ember-torch',{
    ember:true,element:'fire',gravity,r:machine?20:13,drawSize:machine?76:58,life:4,floor:emberFloor(s,target),spin:e.dir*7,
   });
   e.fired++;e.release=.2;s.events.push(machine?'cannon':'harlequinCast');
  }
  if(e.fireAge>(machine?1.12:.52))enter('recover');
 }else if(e.fireState==='recover'&&e.fireAge>(machine?.9:.65)){enter('patrol');e.timer=s.gentle?3.5:2.6;}
 e.release=Math.max(0,(e.release||0)-dt);e.phase=e.fireState;
}
export function emberTroopDrawing(e,reduced=false){
 if(e.type===11&&e.hp>0&&['patrol','emerge'].includes(e.phase))return{key:'ember-torchwalk',frame:reduced?0:Math.floor((e.gait||0)*8)%8};
 if(e.type===FIRE_WAGON)return{key:'fire-wagon',frame:e.hp<=0?(e.deadTime>.25?6:7):e.release>0?3:e.phase==='windup'?(reduced||e.fireAge>1?2:1+Math.floor(e.fireAge*6)%2):e.phase==='recover'?4:e.hp<e.maxHp/2?5:reduced?0:Math.floor(e.clock*4)%2};
 const age=e.fireAge||0;
 const frame=e.hp<=0?12+Math.min(3,Math.floor((e.deathAge||0)*4.5)):e.flash>0?12:
  e.phase==='windup'?Math.min(3,Math.floor(age/.95*4)):
  e.phase==='attack'?(age<.2?4:Math.min(7,5+Math.floor((age-.2)/.11))):
  e.phase==='recover'?8+Math.min(3,Math.floor(age/.65*4)):0;
 return{key:'ember-torch-attack',frame};
}
