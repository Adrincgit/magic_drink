export const BARGE_MOVES=['drumroll','mortar','jet','boarding','tidal'];
export const BARGE_HEALTH={normal:320,gentle:220};
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
import {bargeRig,bargeWaterline} from './bargeRig';
import {bargePartBroken,stepBargeSystems} from './bargeSystems';
import {spoutFront,waterSegmentBody,waveBody,releaseTidalWave} from './bargeWaterAttacks';
export {bargeRig} from './bargeRig';
export function bargeCollision(s){const m=bargeRig(s);return{x:s.boss.x-295,y:m.body.y+145,w:604,h:m.waterY-m.body.y-145};}
export function resolveBargeContact(s,bodyOf,damage=true){
 const p=s.player,body=bargeCollision(s),player=bodyOf(p);
 if(player.x<body.x+body.w&&player.x+player.w>body.x&&player.y<body.y+body.h&&player.y+player.h>body.y){
  // The hull is solid scenery. Only clearly launched attacks can hurt Hexy.
  p.x=body.x-(player.x+player.w-p.x)-1;p.vx=Math.min(0,p.vx);
 }
}
// Only the solid lower hull blocks shots. The contact box includes empty
// space ahead of the drum and must not intercept shots aimed at that drum.
export function bargeArmor(s){const m=bargeRig(s);return{x:s.boss.x-300,y:s.level.arena.y-20,w:625,h:m.waterY-s.level.arena.y+20};}
export function bargeTargets(s){const m=bargeRig(s),targets=[{part:bargePartBroken(s,'tank')?'core':'tank',x:m.tank.x-m.tank.w*.45,y:m.tank.y-m.tank.h*.45,w:m.tank.w*.9,h:bargePartBroken(s,'tank')?Math.max(m.tank.h*.9,s.level.arena.y-26-(m.tank.y-m.tank.h*.45)):m.tank.h*.9}];if(!bargePartBroken(s,'drum'))targets.unshift({part:'drum',x:m.drum.x-m.drum.w*.47,y:m.drum.y-m.drum.h*.47,w:m.drum.w*.94,h:m.drum.h*.94});return targets;}
export function bargeDrawing(s){const b=s.boss;return{key:'barge-body',frame:b.hp<=0?5:b.phase==='transform'?4:b.phase==='attack'?3:b.phase==='warn'?2:b.transformed?1:0};}
function splash(s,x,y,size=110,onDeck=false){s.effects.push({x,y,row:1,bargeSplash:true,surfaceY:onDeck?y:undefined,size,age:0,life:.5});s.events.push('bargeSplash');}
export function bargeFragments(s,art,rect,columns,rows,power=1){
 const debris=s.organDebris??=[];
 for(let r=0;r<rows;r++)for(let c=0;c<columns;c++){
  const i=r*columns+c;debris.push({art,crop:[c/columns,r/rows,1/columns,1/rows],x:rect.x+(c+.5)*rect.w/columns,y:rect.y+(r+.5)*rect.h/rows,w:rect.w/columns,h:rect.h/rows,
   vx:((c+.5-columns/2)*100+Math.sin(i*3)*70)*power,vy:-160-(i%3)*65,rotation:0,spin:(i%2?1:-1)*(1.2+i%3),life:3.2+i%3*.15,age:0,floor:bargeWaterline(s),water:true,jagged:columns*rows>1});
 }
}
export function updateBarge(s,dt,helpers,shoot){
 const b=s.boss,a=s.level.arena,p=s.player,home=a.right-400;b.dir=-1;stepBargeSystems(s,dt);
 b.wheelAngle=(b.wheelAngle||0)+dt*2.6;
 if(b.hp<=b.maxHp*.5&&!b.transformed){b.transformed=true;b.stage=2;b.phase='transform';b.timer=2.1;b.vulnerable=false;b.turn=0;b.transformAge=0;s.hostile=[];s.events.push('bargeBreak','organSteam');s.shake=.22;}
 if(b.phase==='transform'){
  b.transformAge=(b.transformAge||0)+dt;
  if(b.transformAge>=.55&&!b.hullOpened){
   b.hullOpened=true;const m=bargeRig(s);
   for(const x of [390,700,1010]){const rect={x:m.body.x+x*m.unit,y:m.body.y+700*m.unit,w:190*m.unit,h:140*m.unit};bargeFragments(s,'barge-pressure-barge',rect,1,1,.65);s.organDebris.at(-1).crop=[x/1536,700/1024,190/1536,140/1024];}
   s.effects.push({x:b.x-40,y:m.body.y+740*m.unit,bargeBurst:true,size:210,age:0,life:.65});s.events.push('bargePressureBurst');s.shake=.24;
  }
  resolveBargeContact(s,helpers.body,false);
  b.vulnerable=false;
  if(b.timer<1.25&&!b.phaseVented){b.phaseVented=true;s.events.push('bargeRev');splash(s,b.x,bargeWaterline(s),150);}
  if(b.timer<=0){b.phase='recover';b.timer=1.3;b.vulnerable=true;}return;
 }
 b.vulnerable=true;
 if((b.move==='drumroll'&&bargePartBroken(s,'drum')||b.move==='jet'&&bargePartBroken(s,'tank'))&&['warn','attack'].includes(b.phase)){b.phase='recover';b.timer=.9;}
 b.x+=(home-b.x)*Math.min(1,dt*.75);
 if(b.phase==='warn'&&b.timer<=0){if(b.move==='jet')b.jetAngle=bargeRig(s).nozzle.angle;b.phase='attack';b.attackClock=0;b.shotClock=.09;b.volley=0;b.targetX=clamp(p.x-70,a.left+140,b.x-360);b.timer=b.move==='drumroll'?3.4:b.move==='mortar'?4.0:b.move==='boarding'?2.8:['jet','tidal'].includes(b.move)?2.35:2.7;}
 else if(b.phase==='attack'){
  b.attackClock=(b.attackClock||0)+dt;b.shotClock=(b.shotClock||0)-dt;
  const m=bargeRig(s),fast=b.transformed?1.15:1,easy=s.gentle?.85:1;
  if(b.shotClock<=0){
   const n=b.volley++;b.release=.25;
   if(b.move==='drumroll'){
    const targetY=n%3===2?a.y-156:a.y-35;
    shoot(s,m.drum.x-67,m.drum.y,Math.atan2(targetY-m.drum.y,Math.min(p.x,m.drum.x-240)-m.drum.x),285*fast*easy,'barge-sonic',{r:20,drawSize:100,life:7,barge:true});
    b.shotClock=(b.transformed?.49:.64)*(s.gentle?1.2:1);b.beatInterval=b.shotClock;b.drumKick=.22;s.shake=Math.max(s.shake,.055);
    s.effects.push({x:m.drum.x-40,y:m.drum.y,bargeBeat:true,size:148,age:0,life:.28});s.events.push('bargeBeat');
   }else if(b.move==='boarding'){
    if(s.enemies.filter(e=>e.bargeCrew&&e.hp>0).length<(s.gentle?2:3)){
     const e=helpers.makeEnemy(m.stern.x,m.stern.y,8,n);
     Object.assign(e,{bargeCrew:true,aquatic:true,phase:'exit',phaseAge:0,baseY:a.y,waterY:m.waterY,channelWaterY:a.y+134,home:m.stern.x,dir:1,vy:0,launchX:m.stern.x,launchY:m.stern.y,swimAge:0,deckAge:0,waterOnly:n%2===1});s.enemies.push(e);
    }
    b.shotClock=1.1;
   }else if(b.move==='broadside'){
    const port=m.muzzle,target=clamp(b.targetX+(n%2?100:-100),a.left+100,b.x-390),flight=1.3;
    shoot(s,port.x,port.y,0,0,'barge-balloon',{vx:(target-port.x)/flight,vy:(a.y-22-port.y-180*flight*flight)/flight,gravity:360,floor:a.y,r:22,drawSize:70,life:5,barge:true,water:true});b.shotClock=.7;s.events.push('bargeCannon');
   }else if(b.move==='mortar'){
    const flight=1.35,gravity=360,targetX=clamp(b.targetX+(n%3-1)*150,a.left+100,b.x-360);
    shoot(s,m.muzzle.x,m.muzzle.y,0,0,'barge-balloon',{vx:(targetX-m.muzzle.x)/flight,vy:(a.y-22-m.muzzle.y-.5*gravity*flight*flight)/flight,gravity,floor:a.y,r:24,drawSize:76,life:5,barge:true,water:true});
    b.shotClock=(b.transformed?.68:.93)*(s.gentle?1.2:1);s.events.push('bargeCannon');
   }else if(b.move==='jet'){
    shoot(s,m.jetMuzzle.x,m.jetMuzzle.y,Math.PI+m.nozzle.angle,0,'barge-jet',{r:26,life:1.75,barge:true,water:true,length:0,angle:m.nozzle.angle});
    b.shotClock=3;s.events.push('bargeJet');
   }else{
    const large=n===1,flight=large?.6:.48;
    shoot(s,m.muzzle.x,m.muzzle.y,Math.PI,0,'barge-spout',{vx:large?-380:-340,vy:0,gravity:2*(a.y-m.muzzle.y)/(flight*flight),flight,floor:a.y,r:large?17:13,life:flight+.25,barge:true,water:true,large});
    b.shotClock=s.gentle?1.5:1.2;s.events.push('bargeSpout');
   }
  }
  if(b.timer<=0){b.phase='recover';b.timer=s.gentle?1.65:1.15;b.driveSpeed=0;}
 }else if(b.timer<=0){const moves=(b.transformed?['tidal','drumroll','broadside','boarding','jet']:BARGE_MOVES).filter(move=>move!=='drumroll'||!bargePartBroken(s,'drum')).filter(move=>move!=='jet'||!bargePartBroken(s,'tank'));b.move=moves[b.turn++%moves.length];b.phase='warn';b.timer=b.move==='boarding'?1.5:b.move==='jet'?1.6:b.move==='tidal'?1.45:b.move==='broadside'?1.4:1.15;b.targetX=p.x;if(b.move==='jet')b.tankFill=0;s.events.push(b.move==='jet'?'bargePump':'bargeReady');}
 resolveBargeContact(s,helpers.body);
}

export function stepBargeProjectile(s,q,dt,additions){
 if(!q.barge)return false;
 if(q.kind==='barge-jet'){
  if(s.boss.hp<=0||s.boss.phase!=='attack'||s.boss.move!=='jet'){q.life=0;return true;}
  const m=bargeRig(s);q.x=m.jetMuzzle.x;q.y=m.jetMuzzle.y;q.angle=m.nozzle.angle;
  const deck=Math.sin(q.angle)<-.005?(q.y-s.level.arena.y)/Math.sin(q.angle):Infinity;
  q.length=Math.max(0,Math.min(s.gentle?820:1050,q.age*1200,deck));
  if(q.length>=deck-1&&(q.impactClock=(q.impactClock||0)-dt)<=0){q.impactClock=.12;s.effects.push({x:q.x-q.length*Math.cos(q.angle),y:s.level.arena.y,surfaceY:s.level.arena.y,bargeSplash:true,size:85,age:0,life:.36});}
  waterTrail(s,q,dt);return true;
 }
 if(q.kind==='barge-spout'){
  const m=bargeRig(s);q.x=m.muzzle.x;q.y=m.muzzle.y;q.gravity=2*(q.floor-q.y)/(q.flight*q.flight);
  if(q.age>=q.flight)releaseTidalWave(s,q,additions);
  const at=spoutFront(q);if(q.age<q.flight&&Math.floor(q.age*24)!==(q.dropFrame||0)){q.dropFrame=Math.floor(q.age*24);s.effects.push({x:at.x,y:at.y,waterDrop:true,size:13,vx:q.vx*.1,vy:30,floor:q.floor+110,age:0,life:.8,duration:.8});}
  return true;
 }
 if(q.kind==='barge-sonic'){q.drawSize=92+Math.min(34,q.age*30);q.r=23;const n=Math.floor(q.age/.2);if(n!==(q.rippleCount||0)){q.rippleCount=n;s.effects.push({x:q.x,y:bargeWaterline(s),waterDetail:1,size:35,age:0,life:.32,duration:.32});}}
 q.vy+=(q.gravity||0)*dt;q.x+=q.vx*dt;q.y+=q.vy*dt;
 if(q.kind==='barge-wave'||q.kind==='barge-surf'){q.y=q.floor-q.r-2;waterTrail(s,q,dt);}
 if((q.kind==='barge-balloon'||q.kind==='barge-shell')&&q.y>=q.floor-q.r&&q.vy>0){
  q.life=0;splash(s,q.x,q.floor,180,true);
  s.effects.push({x:q.x,y:q.floor,waterDetail:2,size:70,age:0,life:1.1,duration:1.1});
  for(const dir of [-1,1])additions.push({x:q.x,y:q.floor-20,vx:dir*205,vy:0,r:17,drawSize:70,age:0,life:1.25,kind:'barge-wave',barge:true,floor:q.floor});
 }
 if(q.x<s.level.arena.left-90||q.x>s.level.arena.right+90)q.life=0;
 return true;
}
export function bargeWaterHitbox(q,player){
 if(q.kind==='barge-jet'||q.kind==='barge-spout')return waterSegmentBody(q,player);
 if(q.kind==='barge-surf'||q.kind==='barge-wave')return waveBody(q);
 return null;
}

function waterTrail(s,q,dt){
 q.wetClock=(q.wetClock||0)-dt;if(q.wetClock>0||s.effects.length>220)return;
 q.wetClock=q.kind==='barge-jet'?.065:.085;const n=q.wetCount=(q.wetCount||0)+1,jet=q.kind==='barge-jet';
 const distance=jet?q.length*((n*.618)%1):0,x=q.x-distance*Math.cos(q.angle||0),y=jet?q.y-distance*Math.sin(q.angle||0):q.floor-13;
 const floor=(jet?s.level.arena.y:q.floor)+110;
 s.effects.push({x,y,waterDrop:true,size:14+(n%3)*3,vx:jet?-45:-(q.vx||-200)*.12,vy:-45-n%4*16,floor,age:0,life:1.7,duration:1.7});
 if(!jet)s.effects.push({x:q.x,y:q.floor+2,waterDetail:2,size:q.kind==='barge-surf'?45:27,age:0,life:.85,duration:.85});
 else if(n%3===0)s.effects.push({x,y:y+12,waterDetail:3,size:38,vx:-18,vy:18,waterDrift:true,age:0,life:.45,duration:.45});
}
