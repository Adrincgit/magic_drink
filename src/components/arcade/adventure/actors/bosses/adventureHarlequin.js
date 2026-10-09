import {harlequinArrivalFrame} from './harlequinEntrance';
import {beginHarlequinUltimate} from './harlequinUltimate';
import {HARLEQUIN_SCALE} from './harlequinMetrics';
import {dropHarlequinSupply} from '../../world/adventureSupplies';
import {clashPortraitFrames,castingWindFrame} from '../../engine/clashActing';
import {castHarlequinFire,stepHarlequinFire,leaveHarlequinFire,fireImpact,harlequinRushSpeed} from './harlequinFire';
import {stepBurningCloth} from './harlequinChaos';
import {impactSmoke} from '../../engine/cinematicImpact';
import {fluidSockets} from './harlequinFluidSockets';
export const HARLEQUIN_HEALTH={normal:720,gentle:480};
export const HARLEQUIN_MOVES=['fan','ribbon','dash','vault','curtain','embers','pyre'];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const smooth=t=>t*t*(3-2*t);
export function harlequinFrame(b){
 if(b.hp<=0)return 7;
 if(b.phase==='intro')return b.arrival?.age<2.8?5:b.arrival?.age<3.5?3:0;
 if(b.phase==='transform')return 6;
 if(b.phase==='warn')return ['dash','vault','ribbon'].includes(b.move)?3:b.move==='curtain'?6:1;
 if(b.phase==='attack')return b.move==='dash'?4:b.move==='vault'?5:b.move==='curtain'?6:b.move==='ribbon'?3:b.release>0?2:1;
 return 0;
}
export function harlequinDrawing(s){
 const b=s.boss,q=b.ultimate;
 if(b.defeat)return{key:'harlequin-fire-actions',frame:b.defeat.frame};
 if(b.clashFlight)return{key:'harlequin-fire-actions',frame:12+b.clashFlight.frame};
 if(b.phase==='intro')return{key:'harlequin-arrival',frame:harlequinArrivalFrame(b.arrival?.age||0)};
 if(b.move==='dash'&&b.phase==='attack')return{key:b.stage===3?'harlequin-sprint-final':b.stage===2?'harlequin-sprint-mid':'harlequin-sprint',frame:Math.floor((b.sprintDistance||0)/23)%12};
 if(b.exhausted>0&&b.hp>0)return{key:'harlequin-fire-actions',frame:19};
 const fluid=b.stage===3?'harlequin-motion-fluid-final':b.stage===2?'harlequin-motion-fluid-mid':'harlequin-motion-fluid';
 if(q?.state==='leap')return{key:fluid,frame:8+Math.min(7,Math.floor(q.age/.85*8)),scale:1.5};
 if(q&&q.state!=='recover'&&b.hp>0){
  if(q.state==='fire')return{key:'harlequin-super-cast',frame:(s.powerClash?clashPortraitFrames(s.powerClash).boss:0)*3+castingWindFrame(s.fxTime)};
  return{key:'harlequin-fire-actions',frame:Math.floor((s.powerClash?.age??q.age)*12)%4};
 }
 if(b.hp<=0)return{key:'harlequin-fire-actions',frame:12};
 if((b.move==='dash'&&b.phase==='warn')||(b.move==='pyre'&&['warn','attack'].includes(b.phase))){
  const key=b.stage===3?'harlequin-inferno-final':b.stage===2?'harlequin-inferno-mid':'harlequin-inferno';
  const ready=clamp(1-b.timer/(b.warnDuration||1),0,1);
  if(b.move==='dash')return{key,frame:Math.min(11,Math.floor(ready*12))};
  const frame=b.phase==='warn'?Math.min(4,Math.floor(ready*5)):b.attackClock<.32?5+Math.min(3,Math.floor(b.attackClock/.08)):b.attackClock<.65?9+Math.min(2,Math.floor((b.attackClock-.32)/.11)):[9,10,11,10][Math.floor(b.clock*14)%4];
  return{key,frame:12+frame};
 }
 if(['dash','vault','fan','ribbon'].includes(b.move)&&['warn','attack'].includes(b.phase)){
  const offset={dash:0,vault:8,fan:16,ribbon:24}[b.move];let frame=0;
  if(b.phase==='warn')frame=b.move==='dash'?1:b.move==='vault'?0:Math.min(3,Math.floor((1-b.timer/(b.warnDuration||1))*4));
  else if(b.move==='dash')frame=Math.floor(b.attackClock*18)%8;
  else if(b.move==='vault'){const t=b.attackClock/b.duration;frame=b.release>0?4:t<.16?1:t<.32?2:t<.58?3:t<.75?5:t<.9?6:7;}
  else frame=b.release>0?Math.min(7,4+Math.floor((.3-b.release)*16)):b.volley===0?3:Math.max(0,3-Math.floor(b.shotClock/.085));
  return{key:fluid,frame:offset+frame,scale:1.5};
 }
 if(['embers','pyre'].includes(b.move)&&['warn','attack'].includes(b.phase)){
  const offset=b.move==='embers'?4:8;
  const frame=b.phase==='warn'?(b.timer<b.warnDuration*.5?1:0):b.release>0?(b.release>.1?2:3):b.attackClock<.38||b.shotClock<.28?1:b.move==='pyre'||b.timer<.45?3:0;
  return{key:b.stage===2?'harlequin-fire-actions-mid':'harlequin-fire-actions',frame:offset+frame};
 }
 const key=b.stage===3?'harlequin-motion-final':b.stage===2?'harlequin-motion-mid':'harlequin-motion';
 let frame=Math.floor(b.clock*6)%4;
 if(b.phase==='intro')frame=(b.arrival?.age||0)<2.8?16:(b.arrival?.age||0)<3.5?19:frame;
 else if(b.phase==='transform')frame=20+Math.floor(b.clock*7)%4;
 else if(b.phase==='warn'){
  const ready=b.timer<(b.warnDuration||1)*.5;
  frame=b.move==='fan'?4+Number(ready):b.move==='ribbon'?8+Number(ready):b.move==='curtain'?20+Number(ready):b.move==='vault'?16:12;
 }else if(b.phase==='attack'){
  const release=b.release>0?(b.release>.12?2:3):b.shotClock<.2?1:0;
  if(b.move==='fan')frame=4+release;
  else if(b.move==='ribbon')frame=8+release;
  else if(b.move==='dash')frame=12+Math.floor(b.attackClock*12)%4;
  else if(b.move==='vault'){const t=b.attackClock/b.duration;frame=t<.26?16:b.release>0?17:t<.68?18:19;}
  else frame=b.attackClock<.4?20:b.timer<.5?23:b.release>0?22:21;
 }
 return{key,frame};
}
export function harlequinBody(s){
 const b=s.boss,k=HARLEQUIN_SCALE,low=b.hp<=0||(['warn','attack'].includes(b.phase)&&b.move==='dash');
 return{x:b.x-(low?57:42)*k,y:b.y-(low?100:202)*k,w:(low?114:84)*k,h:(low?98:200)*k};
}
export function harlequinHand(b,low=false){
 const k=HARLEQUIN_SCALE;
 const socket=fluidSockets[(b.stage||1)-1]?.[low?'ribbon':b.move];
 if(socket)return{x:b.x-b.dir*socket.x*k,y:b.y+socket.y*k};
 if(low)return{x:b.x+b.dir*94*k,y:b.y-94*k};
 if(b.move==='curtain')return{x:b.x,y:b.y-244*k};
 if(b.move==='vault')return{x:b.x+b.dir*103*k,y:b.y-187*k};
 return{x:b.x+b.dir*90*k,y:b.y-163*k};
}
export function harlequinPuff(s,x,y,size=110){s.effects.push({x,y,harlequin:true,size:size*1.25,age:0,life:.55});if(size>=100)impactSmoke(s,x,y+12,size/150);}
function card(s,shoot,x,y,angle,speed,extra={}){shoot(s,x,y,angle,speed,'harlequin-card',{harlequin:true,r:13,drawSize:66,life:9,...extra});}
function ribbon(s,shoot,x,y,dir,stage){shoot(s,x,y,dir>0?0:Math.PI,300+(stage-1)*32,'harlequin-ribbon',{harlequin:true,r:17,drawSize:122,life:9,floor:s.level.arena.y,startY:y});}
function recover(b,s){b.phase='recover';b.timer=(s.gentle?1.2:.88)-(b.stage-1)*.18;b.y=s.level.arena.y;b.driveSpeed=0;}
export function updateHarlequin(s,dt,helpers,shoot){
 const b=s.boss,p=s.player,a=s.level.arena;
 if(b.backdropBlend!==undefined)b.backdropBlend=Math.min(1,b.backdropBlend+dt/1.4);
 b.exhausted=Math.max(0,(b.exhausted||0)-dt);
 if(b.ultimate){b.vulnerable=!s.powerClash;return;}
 b.ultimateCooldown=Math.max(0,(b.ultimateCooldown??8)-dt);
 b.clock+=dt;b.timer-=dt;b.release=Math.max(0,(b.release||0)-dt);
 const desired=b.hp<=b.maxHp*.34?3:b.hp<=b.maxHp*.67?2:1;
 if(desired>b.stage&&b.phase!=='transform'){
  b.nextStage=b.stage+1;b.phase='transform';b.timer=1.8;b.vulnerable=false;b.transitionBurst=false;
  b.transitionY=b.y;s.hostile=[];s.events.push('harlequinPhase');s.shake=.2;
 }
 if(b.phase==='transform'){
  b.y+=(a.y-b.y)*Math.min(1,dt*6);b.vulnerable=false;
  if(b.timer<.9&&!b.transitionBurst){b.transitionBurst=true;b.backdropFrom=b.stage;b.backdropBlend=0;b.stage=b.nextStage;b.turn=0;dropHarlequinSupply(s,b.stage);fireImpact(s,b.x,b.y-70,1.85);impactSmoke(s,b.x,b.y,1.1);s.shake=.32;}
  if(b.timer<=0){b.y=a.y;recover(b,s);b.vulnerable=true;}
  return;
 }
 b.vulnerable=true;
 if(b.phase!=='attack')b.dir=Math.sign(p.x-b.x)||-1;
 if(b.phase==='warn'&&b.timer<=0){
  b.phase='attack';b.attackClock=0;b.sprintDistance=0;b.fireDistance=0;b.shotClock=b.move==='pyre'?.13:b.move==='embers'?.38:.24;b.volley=0;b.originX=b.x;b.originY=b.y;b.targetX=clamp(p.x,a.left+80,a.right-80);
  if(['dash','vault'].includes(b.move)){const margin=b.move==='dash'?190:a.throwMargin||155;b.endX=b.dir<0?a.left+margin:a.right-margin;b.travel=Math.abs(b.endX-b.x);}
  b.timer=b.move==='dash'?Math.max(.15,b.travel/harlequinRushSpeed(b.stage,s.gentle)):b.move==='vault'?1.95-(b.stage-1)*.15:b.move==='curtain'?3.1:2.15;
  b.duration=b.timer;s.events.push(b.move==='dash'?'harlequinRush':b.move==='vault'?'harlequinLeap':'harlequinCast');
 }else if(b.phase==='attack'){
  b.attackClock+=dt;b.shotClock-=dt;
  const t=clamp(b.attackClock/b.duration,0,1),fast=s.gentle?.82:1;
  if(b.move==='dash'){
   const old=b.x;b.x=b.originX+(b.endX-b.originX)*t;b.driveSpeed=(b.x-old)/dt;
   b.sprintDistance+=Math.abs(b.x-old);leaveHarlequinFire(s,b,shoot,old);
  }else if(b.move==='vault'){
   b.x=b.originX+(b.endX-b.originX)*smooth(t);b.y=a.y-Math.sin(t*Math.PI)*225;
   if(t>.26&&t<.76&&b.shotClock<=0){
    const h=harlequinHand(b),angle=Math.atan2(p.y-30-h.y,p.x-h.x);
    for(let n=0;n<b.stage;n++)card(s,shoot,h.x,h.y,angle+(n-(b.stage-1)/2)*.2,300*fast);
    b.release=.18;b.shotClock=.6-b.stage*.08;s.events.push('harlequinCast');
   }
  }else if(b.move==='curtain'){
   const enter=clamp(b.attackClock/.7,0,1),lift=Math.min(1,b.attackClock/.55,Math.max(0,b.timer)/.5);b.x=b.originX+((a.left+a.right)/2-b.originX)*smooth(enter);b.y=a.y-Math.sin(lift*Math.PI/2)*125;
   if(b.attackClock>.7&&b.timer>.5&&b.shotClock<=0){
    const h=harlequinHand(b),count=b.stage===3?7:5;
    // A wide downward fan has open lanes; nothing tracks Hexy after release.
    for(let n=0;n<count;n++)card(s,shoot,h.x,h.y,.3+n*(Math.PI-.6)/(count-1)+(b.volley%2?.08:-.08),(265+b.stage*15)*fast,{gravity:100});
    b.volley++;b.release=.22;b.shotClock=b.stage===3?.56:.76;s.events.push('harlequinCast');
   }
  }else if(['embers','pyre'].includes(b.move)){
   if(b.shotClock<=0)castHarlequinFire(s,b,shoot);
  }else if(b.shotClock<=0){
   if(b.move==='fan'){
    b.dir=Math.sign(p.x-b.x)||b.dir;
    const h=harlequinHand(b),angle=Math.atan2(p.y-32-h.y,p.x-h.x),count=b.stage===3?5:3;
    for(let n=0;n<count;n++)card(s,shoot,h.x,h.y,angle+(n-(count-1)/2)*.17,(335+(b.stage-1)*48)*fast);
    b.shotClock=(.70-(b.stage-1)*.13)*(s.gentle?1.2:1);b.release=.3;
   }else{
    const h=harlequinHand(b,true);ribbon(s,shoot,h.x,h.y,b.dir,b.stage);b.shotClock=(.85-(b.stage-1)*.12)*(s.gentle?1.2:1);b.release=.3;
   }
   b.volley++;s.events.push(b.move==='ribbon'?'harlequinSilk':'harlequinCast');
  }
  if(b.timer<=0){
   if(b.move==='vault'){fireImpact(s,b.x,a.y,.9,true);s.shake=.15;s.events.push('harlequinLand');if(b.stage>=2)for(const dir of [-1,1])ribbon(s,shoot,b.x+dir*36,a.y-18,dir,b.stage);}
   recover(b,s);
  }
 }else if(b.timer<=0){
  if(b.stage===3&&b.turn>=3&&b.ultimateCooldown<=0){beginHarlequinUltimate(s);return;}
  const moves=b.stage===1?['fan','dash','ribbon','vault']:b.stage===2?['embers','vault','pyre','ribbon','dash','curtain','fan']:['pyre','dash','embers','curtain','vault','fan','ribbon'];
  b.move=b.x<a.left||b.x>a.right?'vault':moves[b.turn++%moves.length];b.phase='warn';b.timer=(b.move==='dash'?1.2:b.move==='vault'?.95:1.05)-(b.stage-1)*.1+(s.gentle?.2:0);
  b.warnDuration=b.timer;
  s.events.push('harlequinReady');
 }
 const body=harlequinBody(s),player=helpers.body(p);
 if(player.x<body.x+body.w&&player.x+player.w>body.x&&player.y<body.y+body.h&&player.y+player.h>body.y)s.damage();
}
export function stepHarlequinProjectile(s,q,dt,additions=[]){
 if(!q.harlequin)return false;
 if(q.kind==='harlequin-cloth')return stepBurningCloth(s,q,dt);
 if(stepHarlequinFire(s,q,additions))return true;
 if(q.age>=(q.trailNext||0)){
  (q.trail??=[]).push({x:q.x,y:q.y,age:q.age,angle:Math.atan2(q.vy,q.vx)});
  q.trailNext=q.age+.035;if(q.trail.length>9)q.trail.shift();
 }
 q.vy+=(q.gravity||0)*dt;q.x+=q.vx*dt;q.y+=q.vy*dt;
 if(q.kind==='harlequin-ribbon')q.y=(q.startY??q.floor-q.r-1)+(q.floor-q.r-1-(q.startY??q.floor-q.r-1))*clamp(q.age/.24,0,1);
 if(q.x<s.level.arena.left-70||q.x>s.level.arena.right+70||q.y>s.level.arena.y+40)q.life=0;
 return true;
}
