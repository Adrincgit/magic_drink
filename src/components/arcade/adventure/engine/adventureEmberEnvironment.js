import {groundY} from '../world/adventureTerrain';
import {resetEmberWildlife,stepEmberWildlife} from './adventureEmberWildlife';
const clamp=n=>Math.max(0,Math.min(1,n));
// Earth is solid at the sides of a charcoal hollow, not a one-way platform.
// Permit crossing its lip only after the player's feet have cleared the rim.
export function resolveEmberPitWalls(s,oldX){
 if(!s.level.emberTrail)return;
 const p=s.player;
 for(const pit of s.level.emberPits){
  if(oldX<pit.x-13||oldX>pit.x+pit.w+13)continue;
  const left=pit.x+13,right=pit.x+pit.w-13;
  if(p.x<left&&p.y>groundY(s.level.route,pit.x)+6){p.x=left;p.vx=Math.max(0,p.vx);}
  if(p.x>right&&p.y>groundY(s.level.route,pit.x+pit.w)+6){p.x=right;p.vx=Math.min(0,p.vx);}
 }
}
export function resetEmberEnvironment(s,at=0){
 if(!s.level.emberTrail)return;
 s.emberEnvironment={wetGround:[],pits:s.level.emberPits.map(q=>({...q})),bushes:s.level.bushes.map(q=>({...q,state:'green',age:0})),trees:s.level.fallingTrees.map(q=>({...q,phase:q.x+q.h<at?'spent':'standing',age:0,angle:0})),flocks:s.level.birdFlocks.map(q=>({...q,age:q.x<at-600?99:-1}))};
 s.platforms=s.platforms.filter(q=>!q.emberFallen);
 s.player.heat=0;s.player.heatIdle=0;
 s.emberEnvironment.wildlife=resetEmberWildlife(at);
}
const FALL_FRAMES=[4,3,5,6,7,8,9,10],FALL_ANGLES=[.16,.28,.42,.61,.94,1.2,1.4,1.51];
export function emberTreeFrame(q){
 if(q.phase==='warning')return q.age<q.warning*.5?0:q.age<q.warning*.8?1:2;
 if(q.phase==='falling')return FALL_FRAMES[Math.min(7,Math.floor(q.age/1.05*8))];
 if(q.phase==='fallen')return Math.min(15,11+Math.floor(q.age/.12));
 return 0;
}
export function emberTreeAngle(q){
 if(q.phase==='warning')return q.dir*(emberTreeFrame(q)===2?.12:.02);
 if(q.phase==='falling'){
  const progress=clamp(q.age/1.05)*7,i=Math.floor(progress),f=progress-i;
  return q.dir*(FALL_ANGLES[i]+((FALL_ANGLES[i+1]??FALL_ANGLES[i])-FALL_ANGLES[i])*f);
 }
 return q.phase==='fallen'?(q.landedAngle??q.dir*(Math.PI/2-.06)):0;
}
export function emberTrunk(q){const a=emberTreeAngle(q);return{x:q.x,y:q.y-10,tipX:q.x+Math.sin(a)*q.h*.81,tipY:q.y-10-Math.cos(a)*q.h*.81};}
function nearTrunk(p,q){
 const t=emberTrunk(q),dx=t.tipX-t.x,dy=t.tipY-t.y;
 return [12,34,p.crouch?25:52].some(offset=>{const u=clamp(((p.x-t.x)*dx+(p.y-offset-t.y)*dy)/(dx*dx+dy*dy));return Math.hypot(p.x-t.x-u*dx,p.y-offset-t.y-u*dy)<25;});
}
export function stepEmberEnvironment(s,dt){
 if(!s.level.emberTrail)return;
 if(!s.emberEnvironment)resetEmberEnvironment(s);
 const p=s.player,env=s.emberEnvironment;
 env.wetGround=env.wetGround.filter(q=>(q.life-=dt)>0);
 for(const q of env.bushes)q.wetTime=Math.max(0,(q.wetTime||0)-dt);
 if(s.fortInside){p.heat=Math.max(0,p.heat-dt);p.heatIdle=0;return;}
 stepEmberWildlife(s,dt);
 let heat=0;
 for(const q of s.level.heatZones){const edge=Math.min((p.x-q.x)/180,(q.x+q.w-p.x)/180);heat=Math.max(heat,clamp(edge)*q.strength*clamp(1-Math.max(0,groundY(s.level.route,p.x)-p.y-50)/220));}
 for(const q of env.bushes)if(q.state==='burning'){q.age+=dt;if(q.age>=7){q.state='charred';q.age=0;}}
 p.heat+=(heat-p.heat)*(1-Math.exp(-dt*(heat>p.heat?1.8:.8)));
 p.heatIdle=p.heat>.4&&p.ground!==null&&Math.abs(p.vx)<20&&!p.firing&&!p.cast&&!p.guarding&&!p.hitReact&&!p.dash?(p.heatIdle||0)+dt:0;
 for(const q of env.flocks){if(q.age<0&&Math.abs(p.x-q.x)<650)q.age=0;else if(q.age>=0)q.age+=dt;}
 for(const pit of env.pits){
  if(pit.quenched)continue;
  if(p.x+12>pit.x+8&&p.x-12<pit.x+pit.w-8&&p.y>=pit.y-20&&p.y<pit.y+45){
   const hearts=s.hearts;s.damage?.({element:'fire',x:pit.x+pit.w/2});
   if(s.hearts<hearts&&!s.playerDefeat){p.vy=-370;p.ground=null;p.jumps=0;}
  }
 }
 for(const q of env.trees){
  if(q.phase==='spent')continue;
  if(q.phase==='standing'&&Math.abs(p.x-q.x)<q.trigger){q.phase='warning';q.age=0;s.events.push('treeCreak');}
  else if(q.phase!=='standing')q.age+=dt;
  if(q.phase==='warning'&&q.age>=q.warning){q.phase='falling';q.age=0;s.events.push('treeFall');}
  if(q.phase==='falling'){
   if(!q.scenic&&nearTrunk(p,q))s.damage?.({element:'physical',heavyImpact:true,x:q.x});
   if(q.age>=1.05){
    q.phase='fallen';q.age=0;if(!q.scenic)s.shake=.16;s.events.push('treeLand');
    const x=q.dir>0?q.x:q.x-q.h*.8;
    const w=q.h*.8,y=groundY(s.level.route,x)-18,yEnd=groundY(s.level.route,x+w)-18;
    q.landedAngle=Math.atan2(q.dir*w,-(groundY(s.level.route,q.x+q.dir*w)-q.y));
    if(!q.scenic)s.platforms.push({x,y,yEnd,w,h:18,kind:'ember-log',emberFallen:true,dx:0,dy:0});
   }
  }
  q.angle=emberTreeAngle(q);
  if(!q.scenic&&q.phase==='fallen'&&q.burning&&nearTrunk(p,q))s.damage?.({element:'fire',x:q.x});
 }
}
