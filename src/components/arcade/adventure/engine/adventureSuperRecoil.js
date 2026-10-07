import {SUPER_WINDUP,SUPER_DURATION} from './adventureMagic';
import {surfaceY} from '../world/adventureTerrain';
import {adventureBounds} from '../render/adventureCamera';
import {bossHitbox} from '../actors/enemies/adventureEnemies';

const clamp=n=>Math.max(0,Math.min(1,n));
export function superRecoilDistance(age,airborne){
 const t=clamp((age-SUPER_WINDUP)/(SUPER_DURATION-SUPER_WINDUP-.2));
 return (airborne?40:28)*t*t*(3-2*t);
}

function supportAt(s,x,y,tolerance=2){
 return s.platforms.findIndex(platform=>x>=platform.x&&x<=platform.x+platform.w&&Math.abs(surfaceY(platform,x)-y)<tolerance);
}

// Only Hexy yields to the beam. Platforms, enemies and the camera remain
// frozen. Sweep in small steps so recoil cannot push her through a ledge.
export function stepSuperRecoil(s,previousAge){
 const q=s.superCinematic,p=s.player;
 if(q.recoilStopped)return;
 const distance=superRecoilDistance(q.age,q.airborne)-superRecoilDistance(previousAge,q.airborne);
 if(distance<=0)return;
 const bounds=adventureBounds(s),count=Math.ceil(distance),step=-q.dir*distance/count;
 const solidBoss=s.boss.hp>0&&!['sleep','intro','defeated'].includes(s.boss.phase)?bossHitbox(s):null;
 for(let i=0;i<count;i++){
  const x=p.x+step;let y=p.y,ground=p.ground;
  let blocked=x<bounds.left||x>bounds.right;
  if(!q.airborne){
   ground=supportAt(s,x,p.y);
   if(ground<0)blocked=true;
   else{
    y=surfaceY(s.platforms[ground],x);
    // Both feet need support; contiguous slopes remain traversable.
    blocked ||= supportAt(s,x-8,y,8)<0||supportAt(s,x+8,y,8)<0;
   }
  }else{
   blocked ||= s.platforms.some(t=>t.kind==='earth'&&x>=t.x&&x<=t.x+t.w&&surfaceY(t,x)<y-2);
  }
  if(solidBoss)blocked ||= x+15>solidBoss.x&&x-15<solidBoss.x+solidBoss.w&&y>solidBoss.y&&y-58<solidBoss.y+solidBoss.h;
  if(blocked){q.recoilStopped=true;break;}
  p.x=x;p.y=y;p.ground=ground;
 }
}
