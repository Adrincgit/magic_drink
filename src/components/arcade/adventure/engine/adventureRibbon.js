import {hexyMuzzle} from '../actors/hexy/hexyAnimation';
import {surfaceY} from '../world/adventureTerrain';
import {ribbonLevel} from './adventureRibbonState';
import {ribbonContact} from '../actors/hexy/ribbonChoreography';
import {ribbonControl,ribbonSmall} from './adventureRibbonControl';
import {ribbonSequence} from './adventureRibbonCombos';
export const ribbonRate=s=>[1,1.28,1.48,1.58][ribbonLevel(s)-1];
export const RIBBON=12;
export const RIBBON_CHARGE=.5;
// Registered to the centre of the painted whip. Non-monotonic coordinates
// retain the overhead loops: the collision follows the same full sweep.
const curves=[
 [[.15,.65],[.23,.65],[.32,.53],[.46,.50],[.57,.48],[.67,.36],[.77,.25],[.87,.23]],
 [[.15,.65],[.24,.65],[.34,.53],[.44,.34],[.57,.18],[.73,.12],[.86,.16],[.89,.32],[.86,.46]],
 [[.15,.65],[.25,.65],[.38,.51],[.38,.31],[.50,.20],[.70,.22],[.84,.34],[.84,.46],[.72,.58],[.59,.65]],
 [[.15,.65],[.25,.65],[.35,.55],[.46,.55],[.56,.52],[.58,.37],[.67,.27],[.80,.29],[.91,.42],[.91,.52]],
 [[.15,.65],[.27,.60],[.43,.55],[.60,.53],[.76,.49],[.91,.42]],
 [[.15,.65],[.24,.65],[.35,.53],[.47,.57],[.58,.56],[.69,.41],[.80,.40],[.90,.48],[.92,.61]],
 [[.15,.65],[.28,.65],[.36,.48],[.39,.27],[.55,.21],[.65,.29],[.66,.41],[.58,.56]],
 [[.15,.65],[.30,.59],[.43,.52],[.59,.54],[.72,.44],[.86,.36],[.91,.35]],
];
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const slamCurves=[
 [[.14,.55],[.26,.50],[.40,.30],[.56,.17],[.72,.20],[.86,.39],[.83,.51]],
 [[.14,.55],[.27,.45],[.43,.48],[.59,.59],[.74,.73],[.86,.83]],
 [[.14,.55],[.30,.45],[.43,.43],[.54,.53],[.67,.73],[.86,.81]],
 [[.14,.55],[.30,.49],[.48,.57],[.64,.55],[.80,.44]],
];
export function ribbonInput(s,input,dt){
 const p=s.player;p.ribbonChain=Math.max(0,(p.ribbonChain||0)-dt);p.ribbonBuffer=Math.max(0,(p.ribbonBuffer||0)-dt);
 p.ribbonSpecialBuffer=Math.max(0,(p.ribbonSpecialBuffer||0)-dt);
 p.ribbonHolding=false;p.ribbonAxis=(input.right?1:0)-(input.left?1:0);p.ribbonDown=!!input.down;p.ribbonUp=!!input.up;
 p.ribbonFinishWindow=Math.max(0,(p.ribbonFinishWindow||0)-dt);
 if(s.weapon!==RIBBON){p.ribbonBuffer=0;p.ribbonChain=0;p.ribbonCharge=null;p.ribbonSpecialBuffer=0;return;}
 const blocked=input.guard||p.dash>0||p.hitReact>0||p.drinkCast>0||p.pendingSip||p.charge||p.superCast;
 if(blocked){
  p.ribbonSequence='';p.ribbonCompleted='';p.ribbonSequenceUntil=0;
  p.ribbonBuffer=0;p.ribbonSpecialBuffer=0;p.ribbonCharge=null;p.ribbonChargeRelease=null;p.ribbonChain=0;p.ribbonSwing=0;p.ribbonSpinning=false;p.ribbonCanChain=false;
  if(p.ribbonStrong)p.specialCast=0;return;
 }
 const light=input.attack&&!s.lastInput.attack,heavy=input.special&&!s.lastInput.special;
 // A press is one light attack. Holding it prepares a separate release move;
 // neither keyboard repeat nor a held gamepad button can create another swing.
 if(light){p.ribbonBuffer=.24;p.ribbonCharge={button:'attack',age:0};}
 if(heavy){p.ribbonCharge={button:'special',age:0};p.ribbonBuffer=0;}
 if(p.ribbonCharge){
  const charge=p.ribbonCharge;
  if(input[charge.button]&&!(charge.button==='special'&&p.ribbonQueuedRelease))charge.age=Math.min(.85,charge.age+dt);
  else{
   if(charge.age>=RIBBON_CHARGE){p.ribbonChargeRelease=charge.button==='attack'?'pull':'burst';p.ribbonSpecialBuffer=.3;p.ribbonBuffer=0;p.ribbonSequence='';p.ribbonCompleted='';}
   else if(charge.button==='special'){p.ribbonChargeRelease=null;p.ribbonSpecialBuffer=.24;}
   p.ribbonCharge=null;
  }
 }
 p.ribbonQueuedRelease=false;
 if(!p.ribbonSpecialBuffer)p.ribbonChargeRelease=null;
 const strong=p.ribbonSpecialBuffer>0;
 // A deliberate second Y can cancel the recovery, never the anticipation.
 if(p.ribbonStrong&&strong&&p.ribbonCanChain){p.specialCast=0;p.specialWait=0;p.ribbonCanChain=false;}
 if(p.ribbonCanChain&&light){
  p.specialCast=0;p.specialWait=0;p.ribbonCanChain=false;s.shotWait=0;
  for(const q of s.shots)if(q.ribbonStrong)q.life=0;
 }
 if(!p.ribbonSwing)p.ribbonStrong=false;
}
export function beginRibbonSwing(s){
 const chain=ribbonSequence(s,'x');if(chain){beginRibbonSlam(s,1,chain);return true;}
 const p=s.player;p.ribbonCount=p.ribbonChain>0?Math.min(2,(p.ribbonCount||0)+1):1;p.ribbonCombo=p.ribbonChain>0?1-(p.ribbonCombo||0):0;p.ribbonStrong=false;p.ribbonSpinning=false;
 p.ribbonFinisher=null;p.ribbonStep=[10,25,40,46][ribbonLevel(s)-1];p.ribbonCanChain=false;p.ribbonMasterMove=null;
 p.ribbonAcrobat=ribbonLevel(s)>=2&&p.ribbonCombo===1;
 const wasAir=p.ground===null;
 p.ribbonAirCount=wasAir?(p.ribbonChain>0?(p.ribbonAirCount||0)+1:1):0;p.ribbonHop=false;
 if(p.ribbonAcrobat&&!wasAir){p.ribbonHop=true;p.ground=null;p.vy=-185;p.y-=2;p.jumps=Math.max(1,p.jumps);p.ribbonFlip=.32;}
 p.ribbonDuration=(p.ribbonCombo?.38:.34)/ribbonRate(s);p.ribbonSwing=p.ribbonDuration;p.ribbonChain=p.ribbonDuration+.48;p.ribbonBuffer=0;
 p.ribbonMove=p.ribbonCount===1?'light':'double';p.ribbonMoveUntil=s.time+1.1;
 // Never let firing-rate buffs overlap two attached whips or cut their recovery cels.
 s.shotWait=Math.max(s.shotWait,p.ribbonDuration+.025);p.ribbonAir=p.ground===null;
}
export function configureRibbonShot(q){
 if(q.kind!==RIBBON)return q;
 const n=Math.hypot(q.vx,q.vy)||1;
 return Object.assign(q,{ribbon:true,ribbonAimX:q.vx/n,ribbonAimY:q.vy/n,vx:0,vy:0,life:.4,r:9,damage:1.25,piercing:true});
}
export function stepRibbonShot(s,q,dt=1/120){
 if(!q.ribbon||q.life<=0)return;
 const p=s.player;
 if(!q.echoCopy&&(p.hitReact>0||p.dash>0||p.guarding||p.drinkCast>0||p.superCast>0||p.ribbonSwing===0)){q.life=0;return;}
 if(q.echoOwner?.life<=0){q.life=0;return;}
 let spinning=false;
 if(q.ribbonStrong&&!q.spinDone&&(q.spinPending||q.ribbonSpun||p.ribbonHolding&&q.age>.17)){
  if(!q.spinTime)q.ribbonSpun=true;
  const limit=p.ribbonHolding?.88:.44;
  if((q.spinTime||0)<limit){
   spinning=true;q.spinTime=(q.spinTime||0)+dt;q.life+=dt;p.ribbonSwing+=dt;p.specialCast+=dt;p.specialWait+=dt;
   p.ribbonSpinning=true;p.ribbonSpinAge=q.spinTime;
  }else{q.spinDone=true;p.ribbonSpinning=false;q.cracked=false;q.impactFeedback=false;}
 }
 const origin=q.echoCopy?(q.echoOwner?.muzzle||q.ribbonOrigin||{x:q.x,y:q.y}):hexyMuzzle(s);
 q.x=origin.x;q.y=origin.y;q.ribbonOrigin={...origin};
 const t=clamp((q.age-dt-(q.spinTime||0))/(q.ribbonDuration||.4),0,.999),dir=q.ribbonAimX<0?-1:1,scale=q.scale||1;
 let frame=t<.23?0:t<.36?3:t<.68?4:5,angle=Math.atan2(q.ribbonAimY,q.ribbonAimX),w=230*scale,h=w*.58,u=.15,v=.65,flip=dir*(q.ribbonCombo?-1:1),curve=curves[frame],key='ribbon-whip';
 if(spinning){
  p.ribbonSpinCel=.055/ribbonRate(s);
  const phase=Math.floor(q.spinTime/p.ribbonSpinCel)%8,side=[1,1,-1,-1,-1,-1,1,1][phase]*dir;
  frame=4;flip=side;angle=side<0?Math.PI:0;w=(q.ribbonBurst?285:235)*scale;h=75*scale;curve=curves[frame];
 }else if(q.ribbonStrong){
  frame=t<.45?0:t<.57?1:t<.76?2:3;key='ribbon-slam';u=.14;v=.55;flip=dir;
  const aimed=Math.abs(q.ribbonAimY)>.1,enemy=q.ribbonTarget;
  const target=enemy?{x:enemy.x+dir*24,y:enemy.y-26}:aimed?{x:origin.x+q.ribbonAimX*270*scale,y:origin.y+q.ribbonAimY*270*scale}:{x:p.x+dir*280*scale,y:p.y-(p.ground===null?22:2)};
  const dx=target.x-origin.x,dy=target.y-origin.y;
  w=Math.min(410*scale,Math.hypot(dx,dy)/Math.hypot(.72,.28*.7));h=w*.7;angle=Math.atan2(dy,dx)-dir*Math.atan2(.28*h,.72*w);curve=slamCurves[frame];
 }
 q.ribbonPaint={key,frame,angle,w,h,u,v,flip,cut:1};q.points=[origin];
 const active=spinning||ribbonContact(t,q.ribbonStrong);let blocked=false;
 for(let k=1;k<curve.length&&!blocked;k++){
  const lo=curve[k-1],hi=curve[k],steps=Math.ceil(Math.hypot((hi[0]-lo[0])*w,(hi[1]-lo[1])*h)/9);
  for(let i=1;i<=steps;i++){
   const cu=lo[0]+(hi[0]-lo[0])*i/steps,cv=lo[1]+(hi[1]-lo[1])*i/steps,x=(cu-u)*w,y=(cv-v)*h*flip;
   const point={x:origin.x+Math.cos(angle)*x-Math.sin(angle)*y,y:origin.y+Math.sin(angle)*x+Math.cos(angle)*y};
   if(s.platforms.some(p=>point.x>p.x&&point.x<p.x+p.w&&point.y>surfaceY(p,point.x)+2&&point.y<surfaceY(p,point.x)+(p.h||180))){q.ribbonPaint.cut=cu;blocked=true;break;}
   q.points.push(point);
   if(active)s.shots.push({kind:RIBBON,ribbonProbe:true,ribbonSource:q,ribbonStrong:q.ribbonStrong,ribbonSpin:spinning,ribbonFinisher:q.ribbonFinisher,ribbonOrigin:origin,x:point.x,y:point.y,vx:0,vy:0,r:(q.ribbonStrong?12:8)*scale,heavy:true,hidden:true,sustained:true,life:.0084,age:0,damage:spinning?1:q.damage,hits:spinning?(q.spinHits??=[]):q.hits,scale:q.scale});
  }
 }
 if(active&&!q.cracked){q.cracked=true;if(!q.echoCopy)s.events.push(spinning?'ribbonSpin':q.ribbonStrong?'ribbonSlam':'ribbonSnap');
  if(q.ribbonStrong&&!spinning){
   const tip=q.points.at(-1);s.effects.push({drinkFx:12,x:tip.x,y:tip.y,size:65*scale,age:0,life:.25,duration:.25});
   if(q.ribbonFinisher==='bind')for(const e of q.ribbonContacts||[])if(e.hp>0&&ribbonSmall(e)&&Math.hypot(e.x-p.x,e.y-p.y)<280&&!s.platforms.some(f=>f.x<Math.max(e.x,p.x)&&f.x+f.w>Math.min(e.x,p.x)&&surfaceY(f,e.x)<Math.min(e.y,p.y)-32))ribbonControl(s,e,'bind');
  }
 }
 if(q.ribbonStrong&&!spinning&&t>.57&&!q.echoCopy){p.ribbonCanChain=true;p.ribbonFinishWindow=.65;p.ribbonLastFinisher=q.ribbonFinisher;}
 if(active&&q.ribbonStrong){
  let cleared=false;
  for(const bullet of s.hostile)if(bullet.life>0&&!/groundfire|pyre|breath|beam|blast|jet|wave|surf/.test(bullet.kind)&&Math.hypot(bullet.vx||0,bullet.vy||0)>15&&q.points.some(a=>Math.hypot(a.x-bullet.x,a.y-bullet.y)<12*scale+(bullet.r||8))){
   bullet.life=0;cleared=true;s.effects.push({drinkFx:12,ribbonSlam:true,x:bullet.x,y:bullet.y,size:65,age:0,life:.28,duration:.28});
  }
  if(cleared)s.events.push('ribbonParry');
 }
}
export function ribbonHit(s,shot,e){
 if(!shot.ribbonProbe)return;
 const parent=shot.ribbonSource;
 if(parent&&!parent.impactFeedback){parent.impactFeedback=true;s.hitStop=Math.max(s.hitStop,shot.ribbonStrong&&!shot.ribbonSpin?.055:.025);s.events.push(shot.ribbonStrong&&!shot.ribbonSpin?'ribbonSmashHit':'ribbonHit');}
 if(!ribbonSmall(e))return;
 if(shot.ribbonStrong&&!shot.ribbonSpin&&shot.ribbonFinisher==='airbind'&&parent){
  parent.boundTargets??=[];
  if(!parent.boundTargets.includes(e)&&parent.boundTargets.length>=(ribbonLevel(s)>=3&&parent.ribbonChainCount>=2?3:1))return;
  if(!parent.boundTargets.includes(e))parent.boundTargets.push(e);
 }
 if(shot.ribbonSpin&&parent){parent.ribbonContacts??=[];if(!parent.ribbonContacts.includes(e))parent.ribbonContacts.push(e);}
 e.action=0;e.recovery=Math.max(e.recovery||0,.22);e.timer=Math.max(e.timer,.45);
 if(parent?.ribbonBurst&&shot.ribbonSpin)ribbonControl(s,e,'push');
 else if(shot.ribbonStrong&&!shot.ribbonSpin){ribbonControl(s,e,shot.ribbonFinisher||'launch');if(parent?.ribbonReel&&e.ribbonControl){e.ribbonControl.reel=true;e.ribbonControl.dir=-Math.sign(e.x-s.player.x);e.ribbonControl.remaining=Math.min(90,Math.max(0,Math.abs(e.x-s.player.x)-65));}}
 else if(e.hp>0){
  e.ribbonStagger=.09;
  const p=s.player,limit=ribbonLevel(s)-1;
  if(!shot.ribbonSpin&&p.ground===null&&e.ribbonLift&&limit>0&&(e.ribbonAirLinks||0)<limit){e.ribbonAirLinks=(e.ribbonAirLinks||0)+1;e.vy=-255;e.jellyLift=1;p.vy=Math.min(p.vy,-100);}
 }
 if(shot.ribbonFinisher==='launch'&&!shot.ribbonSpin&&e.ribbonLift){s.player.ribbonCanChain=true;s.player.ribbonFinishWindow=.7;s.player.ribbonLastFinisher='launch';}
}
export function beginRibbonSlam(s,scale,combo=null){
 const p=s.player,duration=.7/ribbonRate(s),air=p.ground===null&&!p.ribbonHop,chainCount=p.ribbonChain>0?(air?p.ribbonAirCount||0:p.ribbonCount):0,charged=p.ribbonChargeRelease;
 combo??=charged?null:ribbonSequence(s,'y');
 const finisher=combo==='sky-dance'?(air?'airbind':'slam'):combo==='reel-slam'?'airbind':combo==='wand-toss'||combo==='sweep'?'push':charged==='pull'?'pull':charged==='burst'?'push':air?'airbind':p.ribbonDown?'slam':p.ribbonUp?'launch':chainCount===1?'launch':chainCount>=2?'bind':p.ribbonAxis?'push':p.ribbonFinishWindow>0&&p.ribbonLastFinisher==='launch'?'slam':p.ribbonFinishWindow>0&&p.ribbonLastFinisher==='bind'?'pull':'launch';
 const spinPending=finisher==='bind'||charged==='burst'||combo==='sweep';
 p.ribbonSpecialBuffer=0;p.ribbonChargeRelease=null;p.ribbonMove=combo||charged||finisher;p.ribbonMoveUntil=s.time+1.5;
 p.ribbonMasterMove=ribbonLevel(s)>=4&&(combo==='wand-toss'||combo==='reel-slam')?combo:charged?'charge':null;
 // Starting the finisher replaces the basic attack; its collision cannot linger.
 for(const q of s.shots)if(q.ribbon&&!q.echoCopy||q.ribbonProbe)q.life=0;
 p.ribbonDuration=duration;p.ribbonSwing=duration;p.ribbonStrong=true;p.ribbonSpinning=false;p.ribbonChain=0;p.ribbonBuffer=0;p.specialCast=duration;p.specialWait=duration+.08;
 p.ribbonFinisher=finisher;p.ribbonAcrobat=false;p.ribbonCanChain=false;p.ribbonStep=[16,34,52,58][ribbonLevel(s)-1];
 if(finisher==='launch')p.ribbonJumpLink=1.15;
 const origin=hexyMuzzle(s),q=configureRibbonShot({kind:RIBBON,...origin,vx:p.aimX||0,vy:p.aimY||0,age:0,hits:[],scale});
 if(!p.aimX&&!p.aimY)q.ribbonAimX=p.dir;
 const target=s.enemies.filter(e=>e.hp>0&&ribbonSmall(e)&&(e.x-p.x)*p.dir>-25&&Math.abs(e.x-p.x)<285&&Math.abs(e.y-p.y)<230).sort((a,b)=>(finisher==='slam'?Number(!!b.ribbonLift)-Number(!!a.ribbonLift):0)||Math.abs(a.x-p.x)-Math.abs(b.x-p.x))[0];
 Object.assign(q,{ribbonStrong:true,spinPending,ribbonBurst:charged==='burst'||combo==='sweep',ribbonReel:combo==='reel-slam'&&ribbonLevel(s)>=4,ribbonFinisher:finisher,ribbonChainCount:chainCount,ribbonTarget:target,ribbonDuration:duration,life:duration,damage:{launch:2.5,pull:1.5,push:2.5,bind:1,slam:5,airbind:3}[finisher]});s.shots.push(q);
}
