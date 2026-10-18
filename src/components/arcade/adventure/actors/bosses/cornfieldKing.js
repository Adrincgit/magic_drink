import {worldSound} from '../../engine/adventureWorldAudio';
import {faceTarget} from '../enemies/enemyFacing';
import {CORN_CARTOON_CELL,CORN_CARTOON_WALK_SIZE,CORN_CARTOON_MUZZLES} from '../cornfieldCartoonRegistration';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const enter=(b,phase,duration)=>Object.assign(b,{phase,timer:duration,phaseAge:0,phaseDuration:duration});
const rest=(b,duration=1.1)=>{b.vulnerable=true;enter(b,'recover',duration);};
export function cornKingBody(s){
 const b=s.boss,w=b.stage===2?126:96,h=b.stage===2?218:208;
 return{x:b.x-w/2,y:b.y-h,w,h};
}
export function cornKingDrawing(s,reduced=false){
 const b=s.boss,t=b.phaseAge||0,second=b.stage===2&&!['transform'].includes(b.phase);
 if(b.phase==='patrol'&&b.moving)return{key:second?'corn-harvest-walk':'corn-king-walk',frame:reduced?0:Math.floor((b.gait||0)*12)%12,size:CORN_CARTOON_WALK_SIZE[second?'harvest-walk':'king-walk'],offsetX:second?-15:-35};
 let frame=reduced||!b.moving?0:Math.floor((b.gait||0)*4)%4;
 if(b.phase==='dying')frame=t<.35?12:t<.8?13:t<1.65?14:15;
 else if(b.phase==='transform')frame=8+Math.min(3,Math.floor(t/.45));
 else if(b.phase==='rebuild')frame=t<1.1?4:t<2.1?8:9;
 else if(b.phase==='windup')frame=second?(b.move==='leap'?9:b.move==='harvest'?8:t<b.phaseDuration*.55?4:5):(b.move==='rush'?5:t<b.phaseDuration*.55?4:5);
 else if(b.phase==='attack')frame=second?(b.move==='leap'?(t<.78?10:11):b.move==='harvest'?9:t<.28?6:7):(t<.18?6:7);
 else if(b.phase==='recover')frame=second?7:5;
 else if(b.phase==='intro')frame=t<.5?8:t<1?4:5;
 else if(b.flash>0)frame=12;
 return{key:second?'corn-harvest':'corn-king',frame,size:(second?452:410)*4/3};
}
export function cornKingMuzzle(s){
 const b=s.boss,d=cornKingDrawing(s),second=d.key.startsWith('corn-harvest');
 const points=CORN_CARTOON_MUZZLES[second?'harvest':'king'],point=points[d.frame]||points[second?9:6];
 return{x:b.x+(point[0]/CORN_CARTOON_CELL-.5)*d.size*(b.dir>0?-1:1),y:b.y+(point[1]/CORN_CARTOON_CELL-.975)*d.size};
}
function burst(s,x,y,size=110){s.cornBursts.push({x,y,age:0,life:.85,seed:Math.floor(x),size});}
function cast(s,shoot,offsets,speed=255){
 const b=s.boss,m=cornKingMuzzle(s),a=Math.atan2(b.aim.y-m.y,b.aim.x-m.x);
 for(const offset of offsets)shoot(s,m.x,m.y,a+offset,speed,'act-two-straw',{actTwo:true,corn:true,r:11,element:'magic',life:3.6,floor:s.level.arena.y});
 b.muzzleTime=.15;
}
function warnRoots(s,b){
 const a=s.level.arena;
 // Fixed positions captured before the windup. The wide gaps remain safe
 // even if the player stays on the ground; the roots never track the player.
 s.cornHazards=[-240,0,240].map(dx=>({x:clamp(b.targetX+dx,a.left+105,a.right-105),y:a.y,w:85,age:0,delay:1.15,life:2.05}));
}
export function stepCornKing(s,dt,{makeEnemy,shoot,say}){
 const b=s.boss,p=s.player,a=s.level.arena;
 b.clock+=dt;b.flash=Math.max(0,b.flash-dt);b.muzzleTime=Math.max(0,(b.muzzleTime||0)-dt);
 if(b.hp<=0){
  if(!b.defeat){b.hp=0;b.defeat={ready:false};b.vulnerable=false;enter(b,'dying',2.7);s.hostile=[];s.cornHazards=[];s.strawPiles=[];
   for(const e of s.enemies)if(e.summoned){e.hp=0;e.deadTime=.6;}burst(s,b.x,a.y,210);worldSound(s,'rubbleBreak',b.x,b.y);}
  b.phaseAge+=dt;b.timer-=dt;b.y+=(a.y-b.y)*Math.min(1,dt*7);
  if(b.timer<=0&&!b.defeat.ready){b.defeat.ready=true;b.phase='defeated';s.arenaLocked=false;s.score+=60;s.hearts=Math.min(s.maxHearts,s.hearts+2);s.events.push('bossDown');}return;
 }
 if(b.phase==='sleep'){
  if(p.x<a.entry||Math.abs(p.y-a.y)>120)return;
  b.engaged=true;b.stage=1;b.dir=-1;enter(b,'intro',1.8);s.arenaLocked=true;s.hostile=[];s.enemies=[];
  for(const q of s.actTwoAmbushes)q.fired=true;
  s.events.push('boss');say?.(s,'boss');burst(s,b.x,a.y,160);return;
 }
 b.phaseAge=(b.phaseAge||0)+dt;b.timer-=dt;b.moving=false;
 if(b.nextStage&&!['intro','transform'].includes(b.phase)){
  b.stage=2;delete b.nextStage;b.vulnerable=false;b.y=a.y;enter(b,'transform',1.8);s.hostile=[];s.cornHazards=[];
  s.enemies=s.enemies.filter(e=>!e.summoned);s.player.hurt=Math.max(s.player.hurt,2.2);
  s.strawPiles=[-330,0,330].map(dx=>({x:clamp(b.x+dx,a.left+100,a.right-100),y:a.y,h:65,hp:8,maxHp:8}));
  s.events.push('towerTransform');burst(s,b.x,a.y,220);return;
 }
 if(b.phase==='intro'){if(b.timer<=0)rest(b,.9);return;}
 if(b.phase==='transform'){if(b.timer<=0){enter(b,'rebuild',3.2);b.rebuilt=false;}return;}
 if(b.phase==='rebuild'){
  if(b.timer<=0){let heal=0;for(const q of s.strawPiles)if(q.hp>0){heal+=8;q.hp=0;}b.hp=Math.min(b.maxHp*.65,b.hp+heal);s.strawPiles=[];b.rebuilt=true;b.turn=0;burst(s,b.x,a.y,180);worldSound(s,'pumpkinBirth',b.x,b.y);rest(b,1.3);}return;
 }
 if(b.phase==='recover'){b.y+=(a.y-b.y)*Math.min(1,dt*8);if(b.timer<=0){b.y=a.y;enter(b,'patrol',.65);}return;}
 if(b.phase==='patrol'){
  b.dir=faceTarget(b,p.x);const before=b.x;
  if(Math.abs(p.x-b.x)>340)b.x=clamp(b.x+b.dir*(b.stage===2?90:68)*dt,a.left+150,a.right-160);
  b.gait=(b.gait||0)+Math.abs(b.x-before)/145;b.moving=Math.abs(b.x-before)>.001;b.y=a.y;
  if(b.timer>0)return;
  const moves=b.stage===1?['fan','rush','rain','fan']:['roots','leap','harvest','summon','rush'];
  b.move=moves[b.turn++%moves.length];b.attackDir=b.dir;b.originX=b.x;b.originY=b.y;b.volley=0;
  b.aim={x:p.x,y:p.y-38};b.targetX=clamp(p.x,a.left+130,a.right-130);
  b.rushTo=clamp(b.x+b.dir*Math.min(560,Math.abs(p.x-b.x)+150),a.left+150,a.right-150);
  enter(b,'windup',b.move==='roots'?1.15:b.move==='rush'||b.move==='leap'?1.1:.9);b.vulnerable=true;
  if(b.move==='roots')warnRoots(s,b);
  if(b.move==='rain')s.cornHazards=[-200,0,200].map(dx=>({x:clamp(b.targetX+dx,a.left+100,a.right-100),y:a.y,w:95,age:0,delay:.9,life:3.6,rain:true}));
  worldSound(s,'woodHit',b.x,b.y);return;
 }
 if(b.phase==='windup'){
  if(b.timer>0)return;
  enter(b,'attack',b.move==='rush'?.72:b.move==='leap'?1.05:b.move==='harvest'?1.6:1.1);b.vulnerable=b.move!=='rush';
  if(b.move==='summon'){
   const alive=s.enemies.filter(e=>e.summoned&&e.hp>0).length;
   for(let i=0;i<Math.min(2,3-alive);i++){
    const x=clamp(b.x+(i?-1:1)*300,a.left+120,a.right-120),e=makeEnemy(x,a.y,29,90+s.enemies.length);
    Object.assign(e,{summoned:true,cornImp:true,cornRole:i?'runner':'thrower',cornEmerge:true,emerging:.8,timer:1.5});s.enemies.push(e);burst(s,x,a.y);
   }
  }
 }
 if(b.phase!=='attack')return;
 if(b.move==='fan'){
  if(b.volley<2&&b.phaseAge>=b.volley*.48){b.volley++;cast(s,shoot,[-.18,.06,.28]);}
 }else if(b.move==='harvest'){
  // Alternating high/low fans leave space between each wave to dodge.
  if(b.volley<3&&b.phaseAge>=b.volley*.48){const high=b.volley++%2;cast(s,shoot,high?[-.4,-.15,.1]:[-.1,.15,.4],280);}
 }else if(b.move==='rain'){
  while(b.volley<3&&b.phaseAge>=b.volley*.27){const i=b.volley++,x=clamp(b.targetX+(i-1)*200,a.left+100,a.right-100);shoot(s,x,a.y-420,Math.PI/2,230,'act-two-straw',{actTwo:true,corn:true,r:11,floor:a.y,element:'magic',life:2.5});}
 }else if(b.move==='rush'){
  const t=clamp(b.phaseAge/.72,0,1);b.x=b.originX+(b.rushTo-b.originX)*t;b.y=a.y-Math.sin(t*Math.PI)*25;b.gait=(b.gait||0)+dt*2;b.moving=true;
  if(Math.floor(b.phaseAge*15)>b.volley){b.volley++;burst(s,b.x,a.y,60);}
  if(Math.abs(p.x-b.x)<70&&Math.abs(p.y-b.y)<95)s.damage({x:b.x,element:'physical'});
 }else if(b.move==='leap'){
  const t=clamp(b.phaseAge/.82,0,1);b.x=b.originX+(b.targetX-b.originX)*t;b.y=a.y-Math.sin(t*Math.PI)*220;
  if(t>=1&&!b.volley){b.volley=1;burst(s,b.x,a.y,210);s.shake=Math.max(s.shake,.2);worldSound(s,'rubbleBreak',b.x,b.y);
   for(const dir of [-1,1])shoot(s,b.x+dir*55,a.y-22,dir>0?0:Math.PI,230,'act-two-straw',{actTwo:true,corn:true,r:12,floor:a.y,element:'physical',life:2});
  }
  if(t>.9&&Math.abs(p.x-b.x)<90&&p.y>a.y-80)s.damage({x:b.x,element:'physical'});
 }else if(b.move==='roots'&&!b.volley){b.volley=1;burst(s,b.x,a.y,120);worldSound(s,'woodBreak',b.x,b.y);}
 if(b.timer<=0){b.y=a.y;rest(b,b.move==='leap'?1.5:b.move==='rush'?1.3:1.05);}
}
export function stepCornHazards(s,dt){
 for(const q of s.cornHazards){q.age+=dt;
  if(!q.rain&&q.age>=q.delay&&q.age<q.life-.3&&Math.abs(s.player.x-q.x)<q.w/2&&s.player.y>q.y-90)s.damage({x:q.x,element:'physical'});
 }s.cornHazards=s.cornHazards.filter(q=>q.age<q.life);
}
