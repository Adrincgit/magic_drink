import {guardBlocks} from '../../engine/adventureDefense';
import {groundY} from '../../world/adventureTerrain';
import {enemyBody,enemyMuzzle} from './adventureEnemyGeometry';
import {balloonSockets,BALLOON_SIZE} from '../../render/adventureCamera';
import {prepareBombardment,stepBombardment} from '../bosses/adventureBombardment';
import {BOMB_SCALE,HELD_BOMB_SIZE} from '../bosses/adventureBombs';
import {ORGAN_MOVES,organMouths,organTargets,organCollision,updateOrganFortress} from '../bosses/adventureOrganFortress';
import {ZEPPELIN_TYPE,ZEPPELIN_HEALTH,updateZeppelin,stepZeppelinDefeat} from './adventureZeppelin';
import {updateBalloonHatch} from '../bosses/balloonHatch';
import {BARGE_MOVES,bargeTargets,bargeCollision,updateBarge,resolveBargeContact} from '../bosses/adventureBarge';
import {DIVER_TYPE,updateDiver,stepDiverDefeat} from './adventureDiver';
import {HARLEQUIN_MOVES,harlequinBody,updateHarlequin} from '../bosses/adventureHarlequin';
const TAU=Math.PI*2;
export const ENEMY_HEALTH_MULTIPLIER=1.15;
export function makeEnemy(x,y,type=0,seed=0){const hp=Math.round((type===ZEPPELIN_TYPE?ZEPPELIN_HEALTH:type===5?9:type===1||type===4?9:type===2?5:4)*ENEMY_HEALTH_MULTIPLIER*100)/100;return {x,y,home:x,baseY:y,type,dir:type===ZEPPELIN_TYPE?1:seed%2?1:-1,hp,maxHp:hp,clock:seed*.37,timer:1+seed*.23,phase:'patrol',action:0,deadTime:0,trap:0,flash:0,vy:0};}
export function enemyShot(s,x,y,angle,speed,kind='ball',extra={}){s.hostile.push({x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,r:kind==='bomb'?15:kind==='ring'?17:10,life:5,age:0,kind,...extra});}
export function updateEnemies(s,dt,hit,defeat){
 const p=s.player;
 for(const e of s.enemies){
  if(e.hp<=0){if(e.type===ZEPPELIN_TYPE&&e.defeated)stepZeppelinDefeat(s,e,dt);else if(e.type===DIVER_TYPE&&e.defeated)stepDiverDefeat(s,e,dt);else e.deadTime=Math.max(0,e.deadTime-dt);continue;}
  const previousX=e.x;e.previousY=e.y;const step=dt*(e.snare>0?.28:1);e.snare=Math.max(0,(e.snare||0)-dt);
  e.clock+=step;e.timer-=step;e.flash=Math.max(0,e.flash-dt);const wasAttacking=e.action>0;e.action=Math.max(0,e.action-step);e.recovery=Math.max(0,(e.recovery||0)-step);if(wasAttacking&&!e.action&&e.type!==3)e.recovery=.45;
  if(e.emerging>0&&!(e.trap>0)){e.emerging=Math.max(0,e.emerging-step);e.x+=e.dir*55*step;e.gait=(e.gait||0)+Math.abs(e.x-previousX)/95;e.phase='emerge';continue;}
  const trapped=e.trap>0;if(trapped){e.trap=Math.max(0,e.trap-dt);e.trapX??=e.x;e.trapY??=e.y;e.x=e.trapX;e.y=e.trapY;}else{e.trapX=null;e.trapY=null;}
  if(e.landing>0){e.landing=Math.max(0,e.landing-dt);continue;}
  const floor=s.level.groundRoute?null:s.platforms.find(q=>e.x>=q.x&&e.x<=q.x+q.w&&Math.abs(q.baseY-e.baseY)<8);
  if(s.level.groundRoute&&e.type!==2&&e.type!==ZEPPELIN_TYPE)e.baseY=groundY(s.platforms,e.x,e.baseY);
  const near=Math.abs(e.x-p.x)<650;
  if(e.type===ZEPPELIN_TYPE)updateZeppelin(s,e,step,enemyShot);
  else if(e.type===DIVER_TYPE)updateDiver(s,e,step,enemyShot);
  else if(e.type===2){ // Balloon clown: drifting flight, then a visible breath before the streamer.
   if(!trapped){e.x=e.home+Math.sin(e.clock*.75)*75;e.y=e.baseY+Math.sin(e.clock*1.7)*22;}
   if(e.timer<.65)e.phase='windup';
   e.dir=Math.sign(p.x-e.x)||-1;
   if(e.timer<=0&&near){const m=enemyMuzzle(e),a=Math.atan2(p.y-25-m.y,p.x-m.x);enemyShot(s,m.x,m.y,a,175,'streamer');e.timer=s.gentle?3.4:2.6;e.phase='float';e.action=.35;}
  }else if(e.type===5){
   e.dir=Math.sign(p.x-e.x)||-1;e.phase=e.timer<.8?'windup':'rest';
   if(e.timer<=0&&near){const m=enemyMuzzle(e);enemyShot(s,m.x,m.y,e.dir>0?-.35:Math.PI+.35,320,'clown',{gravity:310,r:22});e.timer=s.gentle?3.8:2.8;e.action=.4;s.events.push('cannon');}
  }else if(e.type===3){
   e.phase=e.timer<.55?'windup':'patrol';
   if(e.phase==='windup'||e.volleyAge!==undefined)e.dir=Math.sign(p.x-e.x)||e.dir;
   if(e.timer<=0&&near&&e.volleyAge===undefined){e.volleyAge=0;e.volleyCount=0;e.timer=s.gentle?4:3.3;}
   if(e.volleyAge!==undefined){
    e.volleyAge+=step;e.phase='attack';
    while(e.volleyCount<3&&e.volleyAge>=e.volleyCount*.35){
     const m=enemyMuzzle(e),color=e.volleyCount++;e.ballColor=color;e.action=.16;
     enemyShot(s,m.x,m.y,Math.atan2(-155,p.x-m.x),255+color*10,'juggle',{color,gravity:300,bounce:1,floor:e.baseY,r:11});
    }
    if(e.volleyAge>.98){delete e.volleyAge;e.recovery=.35;e.phase='recover';}
   }else if(!trapped&&!e.recovery&&e.phase==='patrol'){
    e.x+=e.dir*36*step;if(Math.abs(e.x-e.home)>120)e.dir=e.x>e.home?-1:1;
    if(floor)e.x=Math.max(floor.x+24,Math.min(floor.x+floor.w-24,e.x));
    e.baseY=s.level.groundRoute?groundY(s.platforms,e.x,e.baseY):e.baseY;e.y=e.baseY;
   }
  }else if(e.type===6){ // Clowns dropped by the balloon land before pursuing Hexy.
   if(!trapped){e.vy+=800*step;e.x+=(e.launchVx||0)*step;e.y+=e.vy*step;if(e.y>=e.baseY){e.y=e.baseY;e.vy=0;e.type=0;e.phase='patrol';e.landing=e.balloonCrew?.25:0;e.timer=Math.max(e.timer,.85);e.gait=0;}}
  }else{
   e.phase=e.timer<.55?'windup':'patrol';
   if(near&&e.phase==='windup'&&(e.type===1||e.type===4))e.dir=Math.sign(p.x-e.x)||e.dir;
   if(!trapped&&e.phase==='patrol'&&e.action<=0&&e.recovery<=0)e.x+=e.dir*(e.type===4?100:e.type===1?66:40)*step;
   if(floor){if(e.x<floor.x+24){e.x=floor.x+24;e.dir=1;}if(e.x>floor.x+floor.w-24){e.x=floor.x+floor.w-24;e.dir=-1;}}
   if(s.level.groundRoute){e.x=Math.max(24,Math.min(s.level.width-24,e.x));if(Math.abs(e.x-e.home)>160)e.dir=e.x>e.home?-1:1;e.baseY=groundY(s.platforms,e.x,e.baseY);}
   if(!trapped)e.y=e.baseY-(e.type===4?Math.max(0,Math.sin(e.clock*2.7))*112:e.type===1?Math.max(0,Math.sin(e.clock*2.1))*42:0);
   if(e.timer<=0){
    const m=enemyMuzzle(e);
    if(near&&e.type===0&&Math.abs(p.x-e.x)<260)enemyShot(s,m.x,m.y,e.dir===1?0:Math.PI,200,'streamer',{life:.8});
    else if(near&&(e.type===1||e.type===4)){
     const angle=Math.atan2(p.y-28-m.y,p.x-m.x),speed=e.type===4?195:175;
     enemyShot(s,m.x,m.y,angle,speed,'ring',{arc:e.type===4?-1:1,launchAngle:angle,speed,r:14*1.15,life:3.2});
    }
    if(near)e.action=.32;e.timer=(s.gentle?3.4:2.5)+e.type*.18;
   }
  }
  if(e.recovery>0)e.phase='recover';
  e.gait=(e.gait||0)+Math.abs(e.x-previousX)/95;
  const a=hit(p),b=enemyBody(e);
  if(a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y&&p.dash<=0){
   if(p.vy>130&&p.y-p.vy*dt<b.y+9&&e.type!==5){defeat(s,e);p.vy=-390;p.ground=null;}
   else if(guardBlocks(s,{x:e.x,y:e.y-30,r:23,life:1})){if(!trapped)e.x=p.x+p.dir*67;e.timer=Math.max(e.timer,.7);}
   else s.damage();
  }
 }
 s.enemies=s.enemies.filter(e=>e.hp>0||e.deadTime>0);
}
export const BOSS_MOVES=[['streamers','balls','bombs','drop'],ORGAN_MOVES,BARGE_MOVES,HARLEQUIN_MOVES,['spiral','rain','silence']];
export const towerSockets=organMouths;
export function bossTargets(s){return s.index===2?bargeTargets(s):s.index===1?organTargets(s):[bossHitbox(s)];}
export function updateBoss(s,dt,helpers){
 const {say,particles}=helpers,b=s.boss,p=s.player,a=s.level.arena,center=(a.left+a.right)/2;
 b.flash=Math.max(0,b.flash-dt);
 if(b.hp<=0){b.phase='defeated';b.deadTime=(b.deadTime||0)+dt;s.arenaLocked=false;return;}
 if(b.phase==='sleep'){
  if(p.x<a.entry+(s.index<=2?140:0))return;
  b.engaged=true;
  s.arenaLocked=true;s.hostile=[];s.enemies=s.enemies.filter(e=>e.x<a.left);s.hearts=Math.min(s.maxHearts,s.hearts+(s.gentle?2:1));b.phase='intro';b.timer=2.2;say(s,'boss');s.events.push('boss');
  if(s.index<=3)beginBossArrival(s);
 }
 if(s.index<=3&&stepBossArrival(s,dt)){if(s.index===2)resolveBargeContact(s,helpers.body,false);return;}
 if(s.index===3)return updateHarlequin(s,dt,helpers,enemyShot);
 b.clock+=dt;b.timer-=dt;b.release=Math.max(0,(b.release||0)-dt);if(b.phase!=='attack'){b.dir=Math.sign(p.x-b.x)||-1;b.crewDir=b.dir;}
 b.stage=s.index<=2?(b.hp<=b.maxHp*.5?2:1):b.hp/b.maxHp<.32?3:b.hp/b.maxHp<.64?2:1;
 if(b.stage>(b.lastStage||1)){
  b.lastStage=b.stage;
  if(s.rescued===3){s.buff=Math.max(s.buff,5);if(s.gentle)s.hearts=Math.min(s.maxHearts,s.hearts+1);say(s,'chorusSupport');s.events.push('rescue');particles(s,p.x,p.y-30,'#b7f1de',12);}
 }
 if(s.index===1)return updateOrganFortress(s,dt,helpers,enemyShot);
 if(s.index===2)return updateBarge(s,dt,helpers,enemyShot);
 if(s.index===0){
  updateBalloonHatch(s,dt);
  if(b.hp<=b.maxHp*.5&&!b.transformed&&!['intro','sleep'].includes(b.phase)){
   b.transformed=true;b.phase='transform';b.timer=1.6;b.vulnerable=false;b.turn=0;s.hostile=[];s.shake=.24;s.events.push('towerTransform','balloonLeak');
  }
  if(stepBombardment(s,dt,enemyShot))return;
  if(b.move!=='swoop'||b.phase!=='attack'){
   // Stay near Hexy's camera while leaving enough room to pan either way.
   const anchor=Math.max(a.left+390,Math.min(a.right-240,p.x+360));
   const target=anchor+Math.sin(b.clock*.65)*(b.transformed?95:70);
   b.x+=(target-b.x)*Math.min(1,dt*1.5);b.y+=(a.y-(b.transformed?40:65)+Math.sin(b.clock*1.2)*22-b.y)*Math.min(1,dt*3);
  }
  if(b.phase==='transform'){b.vulnerable=false;if(b.timer<=0){b.phase='recover';b.timer=1.1;b.vulnerable=true;}return;}
 }
 else if(s.index===4){b.x=a.left+550+Math.sin(b.clock*.6)*210;b.y=a.y-110+Math.sin(b.clock)*55;}
 if(b.phase==='intro'){b.vulnerable=false;if(b.timer<=0){b.phase='recover';b.timer=.7;}return;}
 if(b.phase==='warn'){
  b.vulnerable=true;
  if(b.timer<=0){b.phase='attack';b.timer=2.2;b.attackClock=0;b.shotClock=s.index===0?.16:0;b.originX=b.x;b.originY=b.y;b.targetX=p.x;b.crewDir=Math.sign(p.x-b.x)||-1;
   if(['charge','slam'].includes(b.move))b.timer=b.move==='slam'?1.65:1.15;
   if(b.move==='swoop'){b.timer=2.25;b.targetX=Math.max(a.left+200,Math.min(a.right-200,p.x));}
  }
 }else if(b.phase==='attack'){
  b.vulnerable=b.timer<.45;b.attackClock+=dt;b.shotClock-=dt;
  if(b.move==='swoop'){
   const progress=Math.min(1,b.attackClock/1.6),ease=progress*progress*(3-2*progress);
   b.x=b.originX+(b.targetX-b.originX)*ease;b.y=a.y-38-Math.sin(progress*Math.PI)*62;
   if(b.attackClock>1.4&&b.shotClock<=0){for(const port of balloonSockets(s))enemyShot(s,port.x,port.y,Math.atan2(p.y-28-port.y,p.x-port.x),180,'ball',{gravity:190,bounce:1,floor:a.y,r:24,drawSize:56});b.release=.24;b.shotClock=2;}
  }else if(b.move==='charge'&&s.index===1){
   if(b.shotClock<=0){const sockets=towerSockets(s);for(const port of sockets.slice(0,b.transformed?3:2))enemyShot(s,port.x,port.y,Math.atan2(p.y-25-port.y,p.x-port.x),255,'clown',{gravity:190,floor:a.y,r:22});b.shotClock=.7;s.events.push('cannon');}
  }
  else if(b.move==='charge'){b.x+=b.dir*470*dt;b.x=Math.max(center-395,Math.min(center+395,b.x));if(b.shotClock<=0){enemyShot(s,b.x,b.y-22,b.dir>0?0:Math.PI,150,'ring');b.shotClock=.65;}}
  else if(b.move==='slam'){
   const t=Math.min(1,b.attackClock/1.3);b.x=b.originX+(b.targetX-b.originX)*Math.min(1,t*1.4);b.y=a.y-Math.sin(t*Math.PI)*210;
   if(t===1&&!b.slammed){b.slammed=true;for(const dir of [-1,1]){enemyShot(s,b.x,a.y-16,dir===1?0:Math.PI,240,'wave',{r:17});if(b.stage>1)enemyShot(s,b.x,a.y-16,dir===1?0:Math.PI,135,'wave',{r:13});}s.events.push('impact');particles(s,b.x,a.y,'#ffc076',22);}
  }else if(b.shotClock<=0){
   const aimed=Math.atan2(p.y-25-(b.y-40),p.x-b.x),easy=(s.gentle?1.25:1)*(s.index===0&&b.transformed?.8:1);
   switch(b.move){
    case 'streamers':for(const port of balloonSockets(s))enemyShot(s,port.x,port.y,Math.atan2(p.y-28-port.y,p.x-port.x),185,'streamer');b.release=.24;b.shotClock=.8*easy;break;
    case 'balls':for(const [i,port] of balloonSockets(s).entries())enemyShot(s,port.x,port.y,Math.atan2(p.y-45-port.y,p.x-port.x)-.5+i*.15,205+i*18,'ball',{gravity:150,bounce:1,floor:a.y,r:24,drawSize:56});b.release=.24;b.shotClock=.9*easy;break;
    case 'bombs':for(const [i,port] of balloonSockets(s).entries())enemyShot(s,port.x,port.y,Math.atan2(130,p.x-port.x),110+i*20,'bomb',{gravity:200,floor:a.y,drawSize:HELD_BOMB_SIZE,r:19*BOMB_SCALE});b.release=.24;b.shotClock=1.1*easy;break;
    case 'drop':case 'clowns':{if(s.enemies.filter(e=>e.hp>0&&e.x>=a.left).length<8){const port=s.index===0?balloonSockets(s)[1]:{x:b.x+(b.turn%2?80:-80),y:b.y-40},e=makeEnemy(port.x,a.y,6,b.turn);e.balloonCrew=s.index===0;e.y=port.y;e.vy=-210;e.launchVx=(p.x<port.x?-1:1)*95;e.dir=p.x<port.x?-1:1;e.clock=0;s.enemies.push(e);}b.release=.24;b.shotClock=.85*easy;break;}
    case 'cannons':{const ports=towerSockets(s),port=ports[Math.floor(b.attackClock/.6)%ports.length];enemyShot(s,port.x,port.y,Math.PI+.25,290,'clown',{gravity:280,floor:a.y,r:22});b.shotClock=(b.transformed?.45:.7)*easy;s.events.push('cannon');break;}
    case 'crossfire':for(const port of towerSockets(s).slice(0,b.transformed?3:2))enemyShot(s,port.x,port.y,Math.atan2(p.y-30-port.y,p.x-port.x),235,'streamer');b.shotClock=.8*easy;break;
    case 'juggle':for(let i=-(b.stage>1?2:1);i<=(b.stage>1?2:1);i++)enemyShot(s,b.x,b.y-55,-Math.PI/2+i*.43,260,'ball',{gravity:350,bounce:1,floor:a.y});b.shotClock=.9*easy;break;
    case 'rings':enemyShot(s,b.x,b.y-45,aimed,195,'ring',{r:20,bounce:b.stage>1?1:0,floor:a.y});b.shotClock=.5*easy;break;
    case 'mirrors':for(const x of [a.left+140,a.right-140])enemyShot(s,x,a.y-120,Math.atan2(p.y-25-a.y+120,p.x-x),185,'ring');b.shotClock=.85*easy;break;
    case 'spiral':for(let i=0;i<5+b.stage;i++)enemyShot(s,b.x,b.y-30,i*TAU/(5+b.stage)+b.attackClock,135+b.stage*10,'note');b.shotClock=.6*easy;break;
    case 'rain':for(let i=0;i<3;i++)enemyShot(s,p.x-140+i*140,a.y-380,Math.PI/2,180,'note');b.shotClock=.8*easy;break;
    case 'silence':for(let i=-2;i<=2;i++)enemyShot(s,b.x,b.y-35,aimed+i*.17,205,'streamer');b.shotClock=.65*easy;break;
   }
  }
  if(b.timer<=0){b.phase='recover';b.timer=(s.gentle?2.6:1.8)-(b.stage-1)*.12;b.vulnerable=true;b.slammed=false;}
 }else if(b.timer<=0){const moves=s.index===0&&b.transformed?['bombing-run','swoop','balls','drop','bombs','streamers']:BOSS_MOVES[s.index];b.phase='warn';b.timer=(s.gentle?1.3:1.05)-(b.stage-1)*.1;b.move=moves[b.turn++%moves.length];b.targetX=p.x;b.vulnerable=true;if(b.move==='bombing-run')prepareBombardment(s);s.events.push('warning');}
 const target=bossHitbox(s),player=helpers.body(p);
 if(player.x<target.x+target.w&&player.x+player.w>target.x&&player.y<target.y+target.h&&player.y+player.h>target.y)s.damage();
}
export function bossHitbox(s){const b=s.boss;return s.index===3?harlequinBody(s):s.index===2?bargeCollision(s):s.index===1?organCollision(s):s.index===0?{x:b.x-BALLOON_SIZE*.39,y:b.y-BALLOON_SIZE*.85,w:BALLOON_SIZE*.78,h:BALLOON_SIZE*.85}: {x:b.x-43,y:b.y-108,w:86,h:108};}
import {beginBossArrival,stepBossArrival} from '../bosses/adventureArrival';
