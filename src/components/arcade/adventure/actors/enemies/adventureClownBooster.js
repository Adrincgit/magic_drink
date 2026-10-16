import {surfaceY} from '../../world/adventureTerrain';
import {enemyGeometry,enemyMuzzle} from './adventureEnemyGeometry';

const GRAVITY=800,ENTRY_TIME=.42,LOAD_TIME=.38;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const restrained=e=>e.trap>0||e.ribbonControl||e.ribbonBound>0||e.ribbonStagger>0||e.jellyLift>0||e.ribbonLift;
const floorsAt=(s,x)=>s.platforms.filter(q=>x>=q.x&&x<=q.x+q.w);

// A cannon borrows a real walking actor. It never creates a clown projectile.
export function tryClownBooster(s,c){
 if(c.boosterPassenger||c.boosterCooldown>0||Math.abs(s.player.x-c.x)>650||restrained(c))return;
 const e=s.enemies.find(e=>e.type===0&&e.hp>0&&!e.boosterEntry&&!e.boosterHidden&&!(e.boosterCooldown>0)&&!restrained(e)&&!(e.emerging>0)&&!(e.landing>0)&&e.phase==='patrol'&&!(e.action>0)&&!(e.recovery>0)&&Math.abs(e.y-c.y)<20&&Math.abs(e.x-c.x)<72&&e.dir*(c.x-e.x)>=-8);
 if(!e)return;
 const direction=Math.sign(s.player.x-c.x)||c.dir;
 c.dir=direction;c.boosterPassenger=e;c.boosterAge=0;c.phase='loading';
 e.dir=direction;e.boosterEntry={x:e.x,y:e.y};e.action=0;e.recovery=0;
}

function launchPlan(s,c,e){
 const m=enemyMuzzle(c),g=enemyGeometry(e),x=m.x+c.dir*30,y=m.y+g.h*.48;
 const desired=x+c.dir*clamp(Math.abs(s.player.x-x)-55,120,360);
 const choices=s.platforms.flatMap(q=>{
  const target=clamp(desired,q.x+28,q.x+q.w-28),floor=surfaceY(q,target),distance=(target-x)*c.dir;
  if(q.w<56||distance<70||distance>400||Math.abs(floor-c.baseY)>90)return [];
  const time=Math.max(.95,Math.abs(target-x)/360),vy=(floor-y)/time-GRAVITY*time/2;
  return vy< -180&&vy> -420?[{x:target,y:floor,time,vy,score:Math.abs(target-desired)}]:[];
 }).sort((a,b)=>a.score-b.score);
 return choices.length?{...choices[0],startX:x,startY:y}:null;
}

function releasePassenger(s,c){
 const e=c.boosterPassenger;if(!e)return;
 // Destruction or a control spell frees the passenger instead of hiding it.
 if(e.boosterHidden){e.x=c.x-c.dir*72;e.y=c.baseY;e.baseY=c.baseY;e.home=e.x;if(e.trap>0){e.trapX=e.x;e.trapY=e.y;}}
 delete e.boosterEntry;e.boosterHidden=false;e.boosterCooldown=2;e.phase='patrol';
 c.boosterPassenger=null;c.boosterAge=0;c.boosterCooldown=1;c.phase='rest';
}

export function stepClownBoosters(s,dt){
 for(const e of s.enemies)e.boosterCooldown=Math.max(0,(e.boosterCooldown||0)-dt);
 for(const c of s.enemies)if(c.type===5&&c.boosterPassenger){
  const e=c.boosterPassenger;
  if(c.hp<=0||e.hp<=0||!s.enemies.includes(e)||restrained(c)||restrained(e)){releasePassenger(s,c);continue;}
  c.boosterAge+=dt;
  const m=enemyMuzzle(c),u=Math.min(1,c.boosterAge/ENTRY_TIME);
  if(e.boosterEntry){const start=e.boosterEntry;e.x=start.x+(m.x-start.x)*u;e.y=start.y+(m.y+enemyGeometry(e).h*.48-start.y)*u-Math.sin(u*Math.PI)*35;}
  e.dir=c.dir;
  if(u>=1){
   delete e.boosterEntry;e.boosterHidden=true;c.phase='loaded';
   c.dir=Math.sign(s.player.x-c.x)||c.dir;e.dir=c.dir;
   const seat=enemyMuzzle(c);e.x=seat.x;e.y=seat.y+enemyGeometry(e).h*.48;
  }
  if(c.boosterAge<ENTRY_TIME+LOAD_TIME)continue;
  const plan=launchPlan(s,c,e);
  if(!plan){releasePassenger(s,c);continue;}
  e.boosterHidden=false;e.type=6;e.x=plan.startX;e.y=plan.startY;e.baseY=plan.y;
  e.vy=plan.vy;e.launchVx=(plan.x-e.x)/plan.time;e.boosterFlight={targetX:plan.x};
  e.clock=0;e.phase='jump';e.timer=2.5;e.gait=0;e.boosterCooldown=3;
  c.boosterPassenger=null;c.boosterAge=0;c.boosterCooldown=1.6;c.phase='rest';c.action=.18;
  s.events.push('cannon');s.effects.push({x:m.x,y:m.y,row:1,size:48,age:0,life:.24});
 }
}

// Test the feet against actual surfaces after horizontal travel, including
// sloped soil and raised platforms. The actor survives the landing unchanged.
export function stepBoostedClown(s,e,dt){
 for(let remaining=dt;remaining>1e-8;){
  const step=Math.min(remaining,1/120),oldX=e.x,oldY=e.y;
  remaining-=step;e.x+=e.launchVx*step;e.y+=e.vy*step+GRAVITY*step*step/2;e.vy+=GRAVITY*step;
  const target=e.boosterFlight.targetX;
  if((e.launchVx>0&&e.x>target)||(e.launchVx<0&&e.x<target))e.x=target;
  const floors=floorsAt(s,e.x).map(q=>({q,y:surfaceY(q,e.x)})).filter(f=>e.vy>0&&oldY<=surfaceY(f.q,oldX)+2&&e.y>=f.y).sort((a,b)=>a.y-b.y);
  if(!floors.length)continue;
  e.y=floors[0].y;e.baseY=e.y;e.home=e.x;e.vy=0;e.launchVx=0;e.type=0;
  e.dir=Math.sign(s.player.x-e.x)||e.dir;e.phase='patrol';e.landing=.25;e.timer=1.4;e.gait=0;
  delete e.boosterFlight;s.effects.push({x:e.x,y:e.y-5,row:1,size:36,age:0,life:.24});return;
 }
}
