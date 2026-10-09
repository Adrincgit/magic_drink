import {surfaceY} from '../world/adventureTerrain';
import {stepWorldEffects} from './adventureEffects';
import {followAdventureCamera} from '../render/adventureCamera';
import {impactSmoke} from './cinematicImpact';
import {updateSupplies} from '../world/adventureSupplies';
import {stepHarlequinUltimate} from '../actors/bosses/harlequinUltimate';

export function beginPlayerDefeat(s,pit=false){
 const p=s.player;
 s.playerDefeat={state:'fall',age:0,total:0,pit};s.won=false;s.hitStop=0;
 p.clashFlight={frame:0};p.hurt=0;p.hitReact=0;p.firing=false;p.gliding=false;p.crouch=false;
 p.vx=pit?0:-p.dir*145;p.vy=pit?Math.max(150,p.vy):-265;
 s.events.push('hexyDefeatLaunch');s.shake=.12;
}
export function stepPlayerDefeat(s,dt){
 const q=s.playerDefeat;if(!q)return false;
 const p=s.player,slow=dt*.42;q.age+=dt;q.total+=dt;s.time+=slow;
 updateSupplies(s,slow);
 // Existing projectiles/effects continue through the slow motion, without hits.
 for(const shot of s.hostile){shot.age+=slow;shot.vy+=(shot.gravity||0)*slow;shot.x+=(shot.vx||0)*slow;shot.y+=(shot.vy||0)*slow;shot.life-=slow;}
 if(s.boss.ultimate)stepHarlequinUltimate(s,slow);else s.boss.clock+=slow;
 s.hostile=s.hostile.filter(shot=>shot.life>0);stepWorldEffects(s,slow);
 if(q.state==='fall'){
  const old=p.y;p.vy+=1050*slow;p.x+=p.vx*slow;p.y+=p.vy*slow;
  p.clashFlight.frame=p.vy<0?0:p.vy<110?1:p.vy<260?2:3;
  let landed=-1;
  if(!q.pit&&p.vy>=0)for(let i=0;i<s.platforms.length;i++){
   const floor=s.platforms[i],y=surfaceY(floor,p.x);
   if(p.x>=floor.x&&p.x<=floor.x+floor.w&&old<=y+2&&p.y>=y){p.y=y;landed=i;break;}
  }
  if(landed>=0){
   q.state='land';q.age=0;p.vx=0;p.vy=0;p.ground=landed;p.clashFlight.frame=4;
   impactSmoke(s,p.x,p.y,.85);s.events.push('hexyDefeatLand');s.shake=.22;
  }else if(q.total>3.8||(q.pit&&q.age>1.2)){
   // A bottomless fall stays a fall: no teleport onto an invented floor.
   q.state='lost';q.age=0;
  }
 }else if(q.age>1.25){s.done=true;s.won=false;s.events.push('death');}
 if(!q.pit)followAdventureCamera(s,dt*.65);
 return true;
}
