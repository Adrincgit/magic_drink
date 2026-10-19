import {stepCurtainCouple,stepCurtainChandeliers,curtainCountessBody} from './curtainCouple';
import {stepNightmareHarlequin} from './nightmareHarlequin';
import {nightmareUltimateDrawing} from './nightmareUltimate';
import {EPISODE_TWO_MUZZLES} from './episodeTwoRegistration';
import {NIGHTMARE_MUZZLES} from './nightmareRegistration';
import {NIGHTMARE_BODY_MUZZLES} from './nightmareBodyRegistration';
import {coherentNightmareDrawing,nightmareGroundLoop,nightmareSpritePoint,nightmareStrideSpeed,NIGHTMARE_STATURE} from './nightmareDrawing';
import {startNightmareGame,stepNightmareGame} from './nightmareGames';
import {chooseNightmareGame} from './nightmareChoreography';
import {worldSound} from '../../engine/adventureWorldAudio';
import {faceTarget} from '../enemies/enemyFacing';
import {ACT_TWO_MUZZLES} from './actTwoAtlas';
import {stepCornKing,cornKingBody,cornKingDrawing,cornKingMuzzle,stepCornHazards} from './cornfieldKing';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const enter=(b,phase,duration)=>Object.assign(b,{phase,timer:duration,phaseAge:0,phaseDuration:duration});
export const actTwoBossBody=s=>s.level.cornfield?cornKingBody(s):s.level.badDreams?({x:s.boss.x-22,y:s.boss.y-NIGHTMARE_STATURE.targetHeight*.82,w:44,h:NIGHTMARE_STATURE.targetHeight*.82}):({x:s.boss.x-39,y:s.boss.y-170,w:78,h:170});
export function damageActTwoBoss(s,damage){
 const b=s.boss;if(!b.vulnerable||b.hp<=0)return;
 const count=s.level.badDreams?3:2,stage=b.stage||1,boundary=stage<count?b.maxHp*(count-stage)/count:0;
 const finalStand=s.level.badDreams&&stage===3&&!b.nightmareLastStandUsed;
 b.hp=Math.max(finalStand?1:boundary,b.hp-Math.max(0,damage));
 if(stage<count&&b.hp<=boundary){b.nextStage=stage+1;b.vulnerable=false;}
}
export function actTwoBossDrawing(s,reduced=false){
 if(s.level.cornfield)return cornKingDrawing(s,reduced);
 const b=s.boss;
 if(s.level.badDreams){const aerial=nightmareUltimateDrawing(s,reduced);if(aerial)return aerial;const loop=nightmareGroundLoop(s,reduced);if(loop)return loop;}
 const nightmareKey=b.stage===3?'nightmare-phase-three':b.stage===2?'nightmare-phase-two':'nightmare-phase-one';
 if(s.powerClash?.kind==='nightmare'&&s.powerClash.state==='resolve'&&s.powerClash.won)return coherentNightmareDrawing({key:nightmareKey,frame:s.powerClash.age<1?13:14,size:248});
 if(s.level.maskMansion&&b.phase==='patrol'){return{key:'episode-count-walk',frame:reduced?0:Math.floor((b.gait||0)*12)%12,size:246};}
 if(s.level.maskMansion){const frame=b.phase==='dying'||b.phase==='defeated'?7:b.flash>0?6:b.phase==='swarm'||b.phase==='transform'?5:b.phase==='windup'||b.phase==='attack'?4:b.phase==='recover'?6:Math.floor((b.gait||0)*4)%4;return{key:'act-two-count',frame,size:246};}
 if(s.level.badDreams&&b.phase==='patrol'&&b.walking!==false)return coherentNightmareDrawing({key:b.stage===3?'nightmare-phase-three-walk':b.stage===2?'nightmare-phase-two-walk':'nightmare-phase-one-walk',frame:reduced?0:Math.floor((b.gait||0)*12)%12,size:248});
 const base=s.level.cornfield?'straw':s.level.maskMansion?'count':'harlequin';
 let frame=b.phase==='dying'?b.phaseAge<.6?12:b.phaseAge<1.1?13:b.phaseAge<1.8?14:15:b.flash>0?12+Math.floor(b.flash*12)%2:s.level.badDreams?Math.floor(b.clock/(b.stage===3?.8:1.1))%4:Math.floor((b.gait||0)*4)%4;
 if((!b.flash||['attack','game-attack','game-windup'].includes(b.phase))&&b.hp>0){
  if(b.phase==='intro')frame=s.level.badDreams?9:0;
  else if(b.phase==='transform')frame=s.level.cornfield?8+Math.min(3,Math.floor(b.phaseAge/.55)):s.level.maskMansion?8+Math.min(3,Math.floor(b.phaseAge/.45)):10;
  else if(b.phase==='swarm')frame=10;
  else if(b.phase==='windup')frame=b.move==='rush'?7:b.move==='mirrors'||b.move==='raise'?6:4;
  else if(b.phase==='attack')frame=s.level.badDreams?(b.move==='rain'?11:5):6;
  else if(b.phase==='rebuild')frame=10;
  else if(b.phase==='recover')frame=s.level.badDreams?7:7;
  else if(b.phase==='nightmare-charge'||b.phase==='nightmare-fall')frame=s.powerClash?.state==='boss-boost'?10:6;
  else if(b.phase==='game-windup')frame=['moon-hop','double-pounce'].includes(b.move)?7:b.move==='nightmare-rain'?6:4;
  else if(b.phase==='game-attack')frame=['moon-hop','double-pounce'].includes(b.move)?b.y<s.level.arena.y-15?11:7:5;
 }
 const drawing={key:s.level.badDreams?nightmareKey:'act-two-'+base,frame:reduced&&b.phase==='patrol'?0:frame,size:s.level.cornfield?380:s.level.maskMansion?246:248};
 return s.level.badDreams?coherentNightmareDrawing(drawing):drawing;
}
export function actTwoBossMuzzle(s){
 if(s.level.cornfield)return cornKingMuzzle(s);
 const b=s.boss,d=actTwoBossDrawing(s),registered=(s.level.badDreams?NIGHTMARE_BODY_MUZZLES[d.key]?.[d.frame]:null)||NIGHTMARE_MUZZLES[d.key]?.[d.frame]||EPISODE_TWO_MUZZLES[s.level.maskMansion?'couple':'harlequin']?.[d.frame];
 if(s.level.badDreams&&registered)return nightmareSpritePoint(s,d,registered);
 if(registered){const [x,y]=registered;return{x:b.x+(x/512-.5)*d.size*(b.dir>0?-1:1),y:b.y+(y/512-.975)*d.size};}
 const [x,y]=ACT_TWO_MUZZLES[s.level.cornfield?'straw':s.level.maskMansion?'count':'harlequin'].point;
 return{x:b.x+(x/320-.5)*d.size*(b.dir>0?-1:1),y:b.y+(y/320-.975)*d.size};
}
function cast(s,shoot,kind,offsets,speed=240){
 const b=s.boss,m=actTwoBossMuzzle(s),aim=b.aim||{x:s.player.x,y:s.player.y-35},angle=Math.atan2(aim.y-m.y,aim.x-m.x);
 for(const angleOffset of offsets)shoot(s,m.x,m.y,angle+angleOffset,speed,kind,{actTwo:true,element:'magic',r:13,floor:s.level.arena.y,life:4});
 b.muzzleTime=.18;
}
function recover(b,time=.95){b.vulnerable=true;enter(b,'recover',time);}
function summon(s,makeEnemy,type,count){
 if(s.level.badDreams)return;
 const b=s.boss,a=s.level.arena,alive=s.enemies.filter(e=>e.hp>0&&e.summoned).length;
 for(let i=0;i<Math.min(count,4-alive);i++){const x=clamp(b.x+(i%2?-1:1)*(200+i*90),a.left+100,a.right-100),e=makeEnemy(x,type===32?a.y-190:a.y,type,s.enemies.length+60);Object.assign(e,{summoned:true,timer:1.5,home:x});s.enemies.push(e);}
}
function beginTransform(s){
 const b=s.boss;b.stage=b.nextStage;delete b.nextStage;b.vulnerable=false;enter(b,'transform',s.level.badDreams?2:1.8);s.hostile=[];s.dreamHazards=[];s.dreamMirrors=[];s.player.hurt=Math.max(s.player.hurt,2.2);s.events.push('towerTransform');
 if(s.level.cornfield)s.strawPiles=[-300,0,300].map(dx=>({x:clamp(b.x+dx,s.level.arena.left+100,s.level.arena.right-100),y:s.level.arena.y,h:65,hp:8,maxHp:8}));
 if(s.level.badDreams){delete b.game;b.turn=0;b.y=s.level.arena.y;s.dreamPlatforms??=[];if(s.episodeTwo){s.episodeTwo.caption=b.stage===3?['¡No vale! ¡Ahora jugamos con MIS reglas!','No fair! Now we play by MY rules!']:['¿Por qué rompes mis juguetes?','Why are you breaking my toys?'];s.episodeTwo.captionAge=3.8;}if(!s.level.openNightmare&&!s.dreamPlatforms.length)for(const x of [s.level.arena.left+330,s.level.arena.left+880,s.level.arena.left+1350]){const q={x,y:s.level.arena.y-120,w:150,h:24,kind:'act-two',art:10,baseX:x,baseY:s.level.arena.y-120,dx:0,dy:0,dream:true,gone:true};s.platforms.push(q);s.dreamPlatforms.push(q);}}
}
export function stepActTwoBoss(s,dt,helpers){
 if(s.level.castleCircus&&s.level.maskMansion)return stepCurtainCouple(s,dt,helpers,stepBaseActTwoBoss);
 if(s.level.badDreams)return stepNightmareHarlequin(s,dt,helpers,stepBaseActTwoBoss);
 return stepBaseActTwoBoss(s,dt,helpers);
}
export function actTwoBossTargets(s){const body=curtainCountessBody(s);return body?[actTwoBossBody(s),body]:[actTwoBossBody(s)];}
function stepBaseActTwoBoss(s,dt,{makeEnemy,shoot,say}){
 if(s.level.cornfield)return stepCornKing(s,dt,{makeEnemy,shoot,say});
 const b=s.boss,p=s.player,a=s.level.arena;b.flash=Math.max(0,b.flash-dt);b.clock+=dt;b.muzzleTime=Math.max(0,(b.muzzleTime||0)-dt);b.staffCooldown=Math.max(0,(b.staffCooldown||0)-dt);b.staffDefenseCooldown=Math.max(0,(b.staffDefenseCooldown||0)-dt);
 if(b.hp<=0){
  if(!b.defeat){b.hp=0;b.defeat={ready:false};b.vulnerable=false;enter(b,'dying',2.7);s.hostile=[];s.dreamHazards=[];s.dreamMirrors=[];s.strawPiles=[];for(const e of s.enemies)if(e.summoned){e.hp=0;e.deadTime=.6;e.deathAge=0;}worldSound(s,'rubbleBreak',b.x,b.y);}
  b.phaseAge+=dt;b.timer-=dt;b.y+=(a.y-b.y)*Math.min(1,dt*4);
  if(b.timer<=0&&!b.defeat.ready){b.defeat.ready=true;b.phase='defeated';s.arenaLocked=false;s.score+=60;s.hearts=Math.min(s.maxHearts,s.hearts+2);s.events.push('bossDown');if(s.level.badDreams){s.dreamRoofTorn=true;if(s.episodeTwo)Object.assign(s.episodeTwo,{released:true,caption:['¡Se acabó la función! Todos están a salvo.','The show is over! Everyone is safe.'],captionAge:7});}}
  return;
 }
 if(b.phase==='sleep'){
  if(p.x<a.entry||Math.abs(p.y-a.y)>120)return;
  b.engaged=true;b.stage=1;b.dir=-1;enter(b,'intro',1.8);s.arenaLocked=true;s.hostile=[];s.enemies=s.level.badDreams?[]:s.enemies.filter(e=>e.x<a.left);
  if(s.level.badDreams)for(const q of s.actTwoAmbushes)q.fired=true;
  s.events.push('boss');say?.(s,'boss');return;
 }
 b.phaseAge=(b.phaseAge||0)+dt;b.timer-=dt;
 if(b.nextStage&&!['intro','transform'].includes(b.phase)){beginTransform(s);return;}
 if(b.phase==='intro'){if(b.timer<=0)recover(b,1);return;}
 if(b.phase==='transform'){
  if(s.level.maskMansion)b.y=a.y-100*Math.sin(Math.min(1,b.phaseAge/1.8)*Math.PI);
  if(b.timer<=0){if(s.level.cornfield){enter(b,'rebuild',3.2);b.vulnerable=true;b.rebuilt=false;}else{if(s.level.badDreams)for(const q of s.dreamPlatforms)q.gone=false;recover(b,1.1);}}return;
 }
 if(b.phase==='game-windup'||b.phase==='game-attack'){stepNightmareGame(s,dt,{shoot,muzzle:actTwoBossMuzzle});return;}
 if(b.phase==='rebuild'){
  if(b.timer<=0){let heal=0;for(const q of s.strawPiles)if(q.hp>0){heal+=8;q.hp=0;}b.hp=Math.min(b.maxHp*.65,b.hp+heal);b.rebuilt=true;s.strawPiles=[];worldSound(s,'pumpkinBirth',b.x,b.y);recover(b,1.2);}return;
 }
 if(b.phase==='recover'){
  b.y+=(a.y-b.y)*Math.min(1,dt*5);
  if(b.timer<=0){enter(b,'patrol',.8);b.vulnerable=true;}return;
 }
 if(b.phase==='swarm'){
  b.vulnerable=false;b.x=clamp(b.swarmFrom+(b.swarmTo-b.swarmFrom)*Math.min(1,b.phaseAge/1.5),a.left+140,a.right-140);b.y=a.y-130-Math.sin(b.phaseAge*3)*45;
  if(b.timer<=0){b.x=b.swarmTo;b.y=a.y-60;recover(b,1.4);}return;
 }
 if(b.phase==='patrol'){
  if(s.level.badDreams&&!b.staffDefenseCooldown&&s.shots.some(q=>q.life>0&&!q.heavy&&!q.hidden&&Math.abs(q.x-b.x)<420&&Math.abs(q.y-b.y+45)<90)){b.dir=faceTarget(b,p.x);startNightmareGame(s,'staff-spin');return;}
  if(s.level.badDreams&&!b.staffCooldown&&b.timer<=0&&Math.abs(p.x-b.x)<185&&Math.abs(p.y-b.y)<85&&(b.turn||0)%3===0){const chain=b.stage>=2&&(b.staffTurns||0)%2===1;b.staffTurns=(b.staffTurns||0)+1;startNightmareGame(s,chain?'staff-chain':'staff-counter');return;}
  b.dir=faceTarget(b,p.x);const before=b.x;
  if(Math.abs(p.x-b.x)>310)b.x=clamp(b.x+b.dir*(s.level.badDreams?nightmareStrideSpeed(b.stage):s.level.cornfield?65:85)*dt,a.left+130,a.right-150);
  b.walking=Math.abs(b.x-before)>.001;b.gait=(b.gait||0)+Math.abs(b.x-before)/(s.level.badDreams?144:100);b.y=a.y;
  if(b.timer<=0){
   const moves=s.level.cornfield?['fan','rush',b.stage===2?'summon':'fan','rain']:s.level.maskMansion?['fan','swarm','rain','summon']:b.stage===1?['candy-fan','wind-push','wind-blink','lanes','moon-hop']:b.stage===2?['spiral-volley','wind-tug','prism-mirage','moon-hop','staff-chain','wind-blink','lanes']:['spiral-volley','staff-chain','wind-push','prism-mirage','double-pounce','nightmare-rain','wind-tug','wind-blink','wind-shear'];
   b.move=s.level.badDreams?chooseNightmareGame(s):moves[b.turn++%moves.length];b.attackDir=b.dir;b.aim={x:p.x,y:p.y-35};b.targetX=clamp(p.x,a.left+100,a.right-100);b.originX=b.x;b.originY=b.y;b.volley=0;
   if(s.level.badDreams&&startNightmareGame(s,b.move))return;
   enter(b,'windup',b.move==='lanes'?1.35:b.move==='rush'?1.1:.9);b.vulnerable=true;
   if(b.move==='lanes'){
    // Two marked lanes leave a wide guaranteed safe lane; no floor is removed.
    const widths=(a.right-a.left-220)/3,safe=Math.floor((clamp(p.x,a.left+110,a.right-111)-a.left-110)/widths);
    s.dreamHazards=Array.from({length:3},(_,i)=>({x:a.left+110+i*widths,w:widths-55,y:a.y,age:0,delay:1.35,life:3.15,safe:i===safe}));
   }
   worldSound(s,'witchRay',b.x,b.y);return;
  }
 }
 if(b.phase==='windup'){
  if(b.timer>0)return;
  enter(b,'attack',b.move==='rush'?.8:b.move==='lanes'?1.7:1.3);b.vulnerable=b.move!=='rush';
  if(s.level.badDreams&&['mirrors','summon'].includes(b.move)){
   startNightmareGame(s,'wind-blink');return;
  }else if(b.move==='mirrors'){
   s.dreamMirrors=[-1,1].map(dir=>({x:clamp(p.x+dir*350,a.left+95,a.right-95),y:a.y,h:135,hp:10,timer:1.15,dir:-dir,age:0}));worldSound(s,'pumpkinBirth',b.x,b.y);
  }else if(b.move==='swarm'){
   b.swarmFrom=b.x;b.swarmTo=clamp(b.x+b.dir*650,a.left+150,a.right-150);enter(b,'swarm',1.6);b.vulnerable=false;
   for(let i=0;i<5;i++)shoot(s,b.x,b.y-110,b.dir>0?0:Math.PI,140+i*20,'act-two-bat',{actTwo:true,r:14,life:2.4,element:'magic'});
  }else if(b.move==='summon')summon(s,makeEnemy,s.level.cornfield?29:s.level.badDreams&&b.stage===3?30:32,2);
 }
 if(b.phase==='attack'){
  if(b.move==='fan'){
   const due=b.stage>=2?2:1;if(b.volley<due&&b.phaseAge>=b.volley*.52){b.volley++;cast(s,shoot,s.level.cornfield?'act-two-straw':s.level.badDreams?'nightmare-gust':'act-two-orb',b.stage>=2?[-.29,0,.29]:[-.18,.18],b.stage>=3?300:245);}
  }else if(b.move==='rain'){
   const due=Math.min(5,1+Math.floor(b.phaseAge/.24));
   while(b.volley<due){const i=b.volley++,x=clamp(b.targetX+(i-2)*100,a.left+80,a.right-80);shoot(s,x,a.y-390,Math.PI/2,205,s.level.cornfield?'act-two-straw':s.level.badDreams?'nightmare-gust':'act-two-orb',{actTwo:true,r:12,floor:a.y,element:'magic',life:2.6});}
  }else if(b.move==='rush'){
   b.x=clamp(b.originX+b.attackDir*490*b.phaseAge,a.left+120,a.right-120);b.gait=(b.gait||0)+dt*3;b.y=a.y-Math.sin(Math.min(1,b.phaseAge/.8)*Math.PI)*70;
  }
  if(b.timer<=0)recover(b,b.stage===3?.72:1.1);
 }
 // The body is dangerous only after the visible rush anticipation.
 if(b.phase==='attack'&&b.move==='rush'&&Math.abs(p.x-b.x)<65&&Math.abs(p.y-b.y)<95)s.damage({x:b.x,element:'magic'});
}
export function stepActTwoHazards(s,dt,shoot){
 if(!s.level.actTwo)return;
 if(s.level.maskMansion)stepCurtainChandeliers(s,dt);
 if(s.level.cornfield)stepCornHazards(s,dt);
 for(const q of s.dreamHazards){q.age+=dt;if(!q.safe&&q.age>=q.delay&&q.age<q.life&&s.player.x>q.x&&s.player.x<q.x+q.w&&s.player.y>q.y-45)s.damage({x:q.x+q.w/2,element:'magic'});}
 s.dreamHazards=s.dreamHazards.filter(q=>q.age<q.life);
 for(const q of s.dreamMirrors)if(q.hp>0){q.age+=dt;q.timer-=dt;q.flash=Math.max(0,(q.flash||0)-dt);if(q.timer<=0){shoot(s,q.x,q.y-85,q.dir>0?0:Math.PI,230,'act-two-mask',{actTwo:true,r:12,life:3,element:'magic'});q.timer=1.5;}if(q.age>5.2)q.hp=0;}
}
