import {stepOriginalTrail} from './adventureOriginal';
import {BOMB_SCALE,bombFlames,limitBombFire} from '../actors/bosses/adventureBombs';
import {LEVELS,DRINKS} from '../world/adventureLevels';
import {makeEnemy,updateEnemies,updateBoss,bossTargets} from '../actors/enemies/adventureEnemies';
import {enemyBody} from '../actors/enemies/adventureEnemyGeometry';
import {updateGuard,guardBlocks,clearPowerProjectiles,buddyPosition} from './adventureDefense';
import {hexyMuzzle} from '../actors/hexy/hexyAnimation';
import {surfaceY,groundAt,groundY} from '../world/adventureTerrain';
import {followAdventureCamera,adventureBounds} from '../render/adventureCamera';
import {beginCompletion,stepCompletion} from './adventureCompletion';
import {DRINK_SHOTS,STRONG_SHOTS,syncDrink,spendDrink,drinkScale,grantStartingDrink} from './adventureAmmo';
import {validMods,equippedMods,modFireRate,modShotScale,validModLevels,shieldGrace} from './adventureMods';
import {takeLoot,ORIGINAL_FIRE_RATE,ORIGINAL_SPEED} from './adventureLoot';
import {trapEnemy,burstBubble,burstTrappedEnemy} from './adventureBubbles';
import {createOutposts,updateOutposts,damageOutpost,outpostBody} from '../actors/enemies/adventureOutposts';
import {stepBalloonDefeat} from '../actors/bosses/adventureBalloon';
import {stepOrganDefeat} from '../actors/bosses/organDestruction';
import {stepWorldEffects} from './adventureEffects';
import {beginSuper,stepSuper} from './adventureSuper';
import {spellFor,specialShots,updateSpecialShot,canSpecialHit,rememberSpecialHit,specialImpact} from './adventureMagic';
import {SUPER_RECHARGE,collectAdventureStar,tickRewards} from './adventureRewards';
import {createSupplies,updateSupplies,damageSupply,supplyBody} from '../world/adventureSupplies';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
import {createCollectibles} from './adventureCollectibles';
import {stepOrganRain,stepOrganWave,organCollision,organShotScale} from '../actors/bosses/adventureOrganFortress';
import {bindCarriedBunnies,stepFreedBunnies} from './adventureRescues';
import {bossHitFeedback} from '../actors/bosses/bossFeedback';
import {ZEPPELIN_TYPE,beginZeppelinDefeat} from '../actors/enemies/adventureZeppelin';

export const playerBody=p=>({x:p.x-15,y:p.y-(p.dash>0&&!p.dashAir?39:p.crouch?31:59),w:30,h:p.dash>0&&!p.dashAir?38:p.crouch?30:58});
export function createAdventure(index=0,gentle=false,carry={}){
 const level=LEVELS[index],platforms=level.platforms.map(p=>({...p,baseX:p.x,baseY:p.y,dx:0,dy:0})),maxHearts=gentle?7:5;
 const stars=createCollectibles(index,carry.collectedStars);
 const maxHp=Math.round(((gentle?92:140)+index*(gentle?18:24))*(index===0?1.15:1)*(index<2?1.44*1.15:1)*100)/100;
 const weapon=carry.ammo===0?-1:carry.weapon??-1;
 const mods=equippedMods(carry.mods,validMods(carry.mods),carry.modSlots??1);
 const s={level,index,gentle,mods,modSlots:carry.modSlots??1,pendingStars:[],modLevels:validModLevels(carry.modLevels,mods),starterClaimed:!!carry.starterClaimed,superReserve:carry.superReserve??(mods.includes('encore-pocket')?1:0),reserveCooldown:carry.reserveCooldown||0,platforms,enemies:level.enemies.map(([x,y,t],i)=>makeEnemy(x,y,t,i)),stars,outposts:createOutposts(level),
 cages:level.cages.map(([x,y,carrier],i)=>({x,y,hp:2,open:false,rescued:false,reward:i,...(carrier===undefined?{}:{carrier,carried:true})})),pickups:[],supplies:createSupplies(level),
 hazards:level.hazards.map(([x,y,w])=>({x,y,w,h:22})),
 player:{x:85,y:platforms[0].y,vx:0,vy:0,dir:1,ground:0,coyote:.1,jumps:0,jumpBuffer:0,hurt:0,hitReact:0,cast:0,land:0,dash:0,dashDuration:.34,dashDir:1,dashWait:0,crouch:false,aimX:1,aimY:0,aimAge:0,stride:0,jumpAge:0,charge:0,specialCast:0,specialWait:0,pendingSpecial:null,spin:0,superCast:0,gliding:false},
 boss:{x:level.boss[0],y:level.boss[1],home:level.boss[0],floor:level.boss[1],hp:maxHp,maxHp,clock:0,phase:'sleep',timer:1,flash:0,dir:-1,turn:0,stage:1,move:'',vulnerable:false},
 arenaLocked:false,time:0,ticks:0,fxTime:0,hitStop:0,shake:0,camera:{x:0,y:level.groundRoute?40:0,backdropY:level.groundRoute?40:0,zoom:1},hearts:clamp(carry.hearts??maxHearts,1,maxHearts),maxHearts,
 magic:clamp(carry.magic??100,0,100),exhaustion:carry.exhaustion||0,superCooldown:clamp(carry.superCooldown||0,0,SUPER_RECHARGE),starPulse:0,buddyCast:[0,0,0],buddyNext:0,shieldHit:0,shieldBreak:0,checkpointAt:null,
 weapon,ammoWeapon:weapon,ammoCapacity:weapon>=0?Math.min(DRINK_SHOTS[weapon]*3,carry.ammoCapacity||DRINK_SHOTS[weapon]):0,ammo:weapon>=0?Math.min(carry.ammoCapacity||DRINK_SHOTS[weapon],carry.ammo??DRINK_SHOTS[weapon]):0,drinkTier:weapon>=0&&carry.drinkTier===2?2:1,overdrive:carry.overdrive||0,overdriveDuration:carry.overdriveDuration||8,lootSeed:(Math.random()*4294967296)>>>0,power:weapon>=0,doubleJump:true,shield:clamp(carry.shield||0,0,3),buff:0,buddyWait:2,
 shotWait:0,shots:[],hostile:[],particles:[],effects:[],score:0,starMoney:0,rescued:0,checkpoint:false,done:false,won:false,combo:0,comboTime:0,events:[],lastInput:{},notice:'start',noticeTime:5};
 bindCarriedBunnies(s);grantStartingDrink(s);return s;
}
export function adventureCarry(s){return {mods:s.mods,modSlots:s.modSlots,overdriveDuration:s.overdriveDuration,modLevels:s.modLevels,starterClaimed:s.starterClaimed,ammoCapacity:s.ammoCapacity,superReserve:s.superReserve,reserveCooldown:s.reserveCooldown,hearts:s.hearts,weapon:s.weapon,ammo:s.ammo,drinkTier:s.drinkTier,overdrive:s.overdrive,shield:s.shield,doubleJump:s.doubleJump,magic:s.magic,superCooldown:s.superCooldown,exhaustion:s.exhaustion};}
// Retry the encounter, keeping collected rewards and the same bank receipt.
// Pickups, opened crates and cages stay claimed, so dying cannot mint money.
export function retryAdventure(s){
 const fresh=createAdventure(s.index,s.gentle,adventureCarry(s)),at=s.checkpointAt||[85,s.platforms[0].y];
 Object.assign(s.player,fresh.player,{x:at[0],y:at[1]-2,hurt:2,ground:null});
 s.enemies=fresh.enemies.filter(e=>e.x>=at[0]-120);s.boss=fresh.boss;
 for(const e of s.enemies)e.captive=null;bindCarriedBunnies(s);
 Object.assign(s,{hearts:s.maxHearts,magic:100,done:false,won:false,arenaLocked:false,shots:[],hostile:[],effects:[],particles:[],organDust:[],lastInput:{},events:[],hitStop:0,shake:0,combo:0,notice:'checkpoint',noticeTime:2});
 delete s.clear;delete s.superCinematic;
 s.camera={x:Math.max(0,Math.min(s.level.width-960,at[0]-300)),y:at[1]-440,zoom:1};
 return s;
}
function particles(s,x,y,color,n=8){for(let i=0;i<n;i++)s.particles.push({x,y,vx:Math.cos(i*2.4)*90,vy:-70-Math.sin(i)*65,life:.55,color});}
function say(s,n){s.notice=n;s.noticeTime=4;}
function hurt(s,fall=false){
 const p=s.player;if(s.done||s.superCinematic||(!fall&&(p.hurt>0||s.overdrive>0)))return;
 if(!fall&&s.shield>0){s.shield--;s.shieldHit=.3;if(!s.shield)s.shieldBreak=.4;p.hurt=shieldGrace(s);s.events.push('shield');particles(s,p.x,p.y-30,'#b4ecff',15);return;}
 s.hearts--;p.hurt=s.gentle?2.1:1.5;p.hitReact=.32;p.charge=0;p.pendingSpecial=null;p.specialCast=0;p.superCast=0;p.spin=0;p.vx=-p.dir*160;p.vy=-220;p.ground=null;s.combo=0;s.events.push('hit');particles(s,p.x,p.y-30,'#ffa6bf');
 p.guarding=false;p.dash=0;p.dashAir=false;
 if(fall){const at=s.arenaLocked?[s.level.arena.left+75,s.level.arena.y]:s.checkpointAt||(s.checkpoint?s.level.checkpoint:[85,s.level.platforms[0].y]);p.x=at[0];p.y=at[1]-10;p.vy=0;p.vx=0;p.dash=0;s.hostile=[];}
 if(s.hearts<=0){s.done=true;s.won=false;s.events.push('death');}
}
function burst(s,x,y,row=0,size=52){s.effects.push({x,y,row,size,age:0,life:.32});}
function defeat(s,e){if(e.defeated)return;e.defeated=true;e.hp=0;e.flash=0;e.deadTime=.55;if(e.type===ZEPPELIN_TYPE)beginZeppelinDefeat(s,e);s.combo++;s.comboTime=3;s.score+=3+Math.min(5,s.combo);particles(s,e.x,e.y-30,'#ffdda0',12);burst(s,e.x,e.y-30,e.trap?2:1,72);s.events.push('pop');burstTrappedEnemy(s,e,defeat);}
function finishBoss(s){const b=s.boss;if(b.hp>0||b.phase==='defeated')return;b.hp=0;b.phase='defeated';s.arenaLocked=false;s.hearts=Math.min(s.maxHearts,s.hearts+2);s.score+=60;s.events.push('bossDown');say(s,'bossDown');particles(s,b.x,b.y-50,'#ffcce8',38);s.hostile=[];s.enemies=s.enemies.filter(e=>e.x<s.level.arena.left);}
function fire(s,buddy=false,index=0){
 const p=s.player,kind=buddy?-1:s.weapon,angle=Math.atan2(p.aimY,p.aimX),angles=kind===4?[-.23,0,.23]:kind===2?[-.08,.08]:[0];
 if(!buddy){s.shotWait=(kind===1?.36:kind===3?.34:.25)*(s.buff>0?.72:1)/(s.overdrive>0?ORIGINAL_FIRE_RATE:1)/modFireRate(s);p.cast=.24;s.events.push('cast');}
 const muzzle=hexyMuzzle(s),pet=buddyPosition(s,index),x=buddy?pet.x+p.dir*12:muzzle.x,y=buddy?pet.y-20:muzzle.y;
 const scale=buddy?1:drinkScale(s)*modShotScale(s);
 for(const offset of angles){const a=angle+offset,speed=kind===3?290:kind===1?540:510;s.shots.push({x,y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,r:(kind===3?24:kind===1?19:10)*scale,scale,life:kind===1?2.6:kind===3?2.1:1.5,age:0,kind,damage:buddy?1:kind===0||kind===1?3:2,hits:[]});}
 if(!buddy)spendDrink(s);
}
function releaseSpecial(s){
 const p=s.player,q=p.pendingSpecial;if(!q)return;
 const muzzle=hexyMuzzle(s);
 const scale=drinkScale(s)*modShotScale(s,true);s.shots.push(...specialShots(q.kind,muzzle,q).map(shot=>({...shot,r:shot.r*scale,scale})));
 s.magic=Math.max(0,s.magic-spellFor(q.kind).cost);p.pendingSpecial=null;s.events.push(q.kind<0?'basicStrong':q.kind===0?'heavyCast':spellFor(q.kind).key+'Cast');
 spendDrink(s,STRONG_SHOTS);
}
function rescue(s,c){
 c.rescued=true;s.rescued++;s.score+=10;s.events.push('rescue');particles(s,c.x,c.y-30,'#ffc2db',18);
 if(c.reward===0){if(s.hearts===s.maxHearts){s.magic=Math.min(100,s.magic+20);say(s,'rescueMagic');}else{s.hearts=Math.min(s.maxHearts,s.hearts+2);say(s,'rescueHeart');}}
 else if(c.reward===1){s.magic=Math.min(100,s.magic+30);say(s,'rescueMagic');}
 else{s.buff=16;s.buddyWait=.5;say(s,'rescueMagic');}
}
export function stepAdventure(s,input,dt){
 if(s.done)return;s.events=[];s.ticks++;s.fxTime+=dt;s.shake=Math.max(0,s.shake-dt);
 if(s.player.drinkCast>0)input={};
 syncDrink(s);s.ammoEmpty=Math.max(0,(s.ammoEmpty||0)-dt);
 if(stepBalloonDefeat(s,dt)){s.lastInput={...input};return;}
 if(stepOrganDefeat(s,dt)){s.lastInput={...input};return;}
 beginCompletion(s);if(s.clear){stepCompletion(s,dt);s.lastInput={...input};return;}
 if(s.superCinematic||beginSuper(s,input)){
  stepSuper(s,dt,{defeat,particles,burst,say});s.lastInput={...input};return;
 }
 if(s.hitStop>0){s.hitStop=Math.max(0,s.hitStop-dt);return;}
 tickRewards(s,dt);updateSupplies(s,dt);
 if(!(s.player.drinkCast>0))s.overdrive=Math.max(0,(s.overdrive||0)-dt);
 s.player.drinkCast=Math.max(0,(s.player.drinkCast||0)-dt);
 s.time+=dt;s.noticeTime=Math.max(0,s.noticeTime-dt);s.comboTime=Math.max(0,s.comboTime-dt);s.buff=Math.max(0,s.buff-dt);if(!s.comboTime)s.combo=0;
 s.damage=()=>hurt(s);const p=s.player,oldY=p.y,oldX=p.x,wasGround=p.ground!==null;
 const onTrail=wasGround&&s.platforms[p.ground]?.kind==='earth';
 for(const q of s.platforms){const ox=q.x,oy=q.y;if(q.kind==='moving')q[q.axis]=(q.axis==='x'?q.baseX:q.baseY)+Math.sin(s.time*q.speed)*q.range;q.dx=q.x-ox;q.dy=q.y-oy;}
 if(p.ground!==null){const q=s.platforms[p.ground];p.x+=q.dx;p.y+=q.dy;}
 for(const key of ['hurt','hitReact','cast','land','dash','dashWait','specialCast','specialWait','spin','superCast'])p[key]=Math.max(0,p[key]-dt);s.shotWait=Math.max(0,s.shotWait-dt);
 p.coyote=wasGround?.11:Math.max(0,p.coyote-dt);p.jumpBuffer=Math.max(0,p.jumpBuffer-dt);
 const axis=(input.right?1:0)-(input.left?1:0);if(axis&&p.dash<=0&&!p.pendingSpecial)p.dir=axis;
 p.holding=!!input.hold&&wasGround;
 p.crouch=!!input.down&&wasGround&&!p.holding&&p.dash<=0;
 const vertical=input.up?-1:input.down&&(!wasGround||p.holding)?1:0;
 const aimAxis=vertical>0&&p.holding?(axis||p.dir):axis;
 const oldAim=p.aimY;p.aimX=vertical?(aimAxis?aimAxis/Math.SQRT2:0):p.dir;p.aimY=vertical?(aimAxis?vertical/Math.SQRT2:vertical):0;p.aimAge=oldAim===p.aimY?p.aimAge+dt:0;
 if(input.jump&&!s.lastInput.jump)p.jumpBuffer=.13;
 if(p.jumpBuffer&&p.dash<=0&&(p.coyote>0||(s.doubleJump&&p.jumps<2))){p.vy=-600;p.ground=null;p.crouch=false;p.coyote=0;p.jumpBuffer=0;p.jumps++;p.jumpAge=0;p.spin=p.jumps===2?.5:0;s.events.push(p.jumps===2?'doubleJump':'jump');particles(s,p.x,p.y,'#fce8bc',5);}
 if(!input.jump&&s.lastInput.jump&&p.vy< -260)p.vy=-260;
 if(input.dash&&!s.lastInput.dash&&!p.dashWait){p.dash=p.dashDuration;p.dashAir=!wasGround;p.dashDir=p.dir;p.dashWait=s.weapon===4?.67:1.05;p.crouch=false;p.charge=0;p.pendingSpecial=null;p.specialCast=0;p.superCast=0;p.spin=0;p.guarding=false;s.events.push('dash');}
 updateGuard(s,input,dt);
 s.exhaustion=Math.max(0,(s.exhaustion||0)-dt);
 p.firing=!!input.attack&&!p.guarding&&!p.charge&&!p.specialCast&&!p.superCast&&p.dash<=0&&p.hitReact<=0;
 const spec=spellFor(s.weapon);
 if(input.special&&!s.lastInput.special){
  if(s.exhaustion>0)say(s,'exhausted');
  else if(s.weapon>=0&&s.ammo<STRONG_SHOTS&&!(s.overdrive>0))say(s,'lowAmmo');
  else if(s.magic<spec.cost)say(s,s.weapon<0?'basicLow':'lowMagic');
  else if(!p.guarding&&!p.dash&&!p.hitReact&&!p.specialCast&&!p.specialWait&&!p.charge&&!p.superCast){
   p.specialCast=.36;p.specialWait=.55;p.specialAimY=p.aimY;p.specialAimX=p.aimX;p.spin=0;
   p.pendingSpecial={x:p.aimX,y:p.aimY,kind:s.weapon};releaseSpecial(s);
  }
 }
 if(!p.charge&&!p.specialCast&&!p.superCast&&!p.guarding&&!p.magicDelay)s.magic=Math.min(100,s.magic+(s.exhaustion>0?3:12)*dt);
 if(input.attack&&s.shotWait===0&&!p.guarding&&!p.charge&&!p.specialCast&&!p.superCast&&p.dash<=0&&p.hitReact<=0){p.spin=0;fire(s);}
 if(p.dash>0){p.vx=p.dashDir*440*(s.overdrive>0?ORIGINAL_SPEED:1);p.vy=p.dashAir||wasGround?0:p.vy+500*dt;}else{const desired=(p.holding?0:axis)*(p.crouch?95:p.charge||p.superCast||p.guarding?90:255)*(s.overdrive>0?ORIGINAL_SPEED:1);p.vx=p.holding?0:p.vx+clamp(desired-p.vx,-1700*dt,1700*dt);p.vy+=1550*dt;}
 const wasGliding=p.gliding;
 p.gliding=!!input.jump&&p.ground===null&&p.vy>40&&!p.aimY&&!p.dash&&!p.spin&&!p.specialCast&&!p.superCast&&!p.guarding&&!p.hitReact;
 if(p.gliding&&!wasGliding)s.events.push('glide');
 if(p.gliding)p.vy=Math.min(p.vy,95);
 // One full run is two steps. The registered boot travels ~38 world pixels
 // over three of twelve drawings; pace the cycle to cover that same distance.
 p.stride+=Math.abs(p.vx)*dt/(p.crouch?88:151.2);if(p.ground===null)p.jumpAge+=dt;
 const bounds=adventureBounds(s);
 p.x=clamp(p.x+p.vx*dt,bounds.left,bounds.right);p.y+=p.vy*dt;p.ground=null;
 if(p.vy>=0){
  // Follow a continuous slope while walking/rolling, including downhill.
  const trail=onTrail?groundAt(s.platforms,p.x):null;
  if(trail){p.y=surfaceY(trail,p.x);p.vy=0;p.ground=s.platforms.indexOf(trail);p.jumps=0;p.spin=0;p.gliding=false;}
  else for(let i=0;i<s.platforms.length;i++){
   const q=s.platforms[i],y=surfaceY(q,p.x),previous=surfaceY(q,oldX)-q.dy;
   if(p.x+13>q.x&&p.x-13<q.x+q.w&&oldY<=previous+7&&p.y>=y){p.y=y;p.vy=0;p.ground=i;p.jumps=0;p.spin=0;p.gliding=false;if(!wasGround){p.land=.16;if(p.dashAir)p.dash=0;s.events.push('land');}break;}
  }
 }
 stepOriginalTrail(s,dt);
 if(p.y>850)hurt(s,true);if(s.done)return;
 if(p.pendingSip&&p.ground!==null){p.pendingSip=false;p.drinkCast=.7;}
 for(const q of s.pickups)if(!q.taken&&!(q.collectWait>0)&&Math.hypot(p.x-q.x,p.y-28-q.y)<38){const type=takeLoot(s,q);say(s,type==='drink'?(s.drinkTier===2?'powerUp':'power'):'loot'+type);particles(s,p.x,p.y-35,DRINKS[q.kind]?.color||'#ffe4a3',15);}
 for(const cp of s.level.checkpoints||[s.level.checkpoint])if(p.x>=cp[0]&&p.ground!==null&&(!s.checkpointAt||cp[0]>s.checkpointAt[0])){s.checkpoint=true;s.checkpointAt=cp;s.hearts=Math.min(s.maxHearts,s.hearts+1);say(s,'checkpoint');s.events.push('coin');}
 for(const h of s.hazards)if(overlap(playerBody(p),h))hurt(s);
 for(const star of s.stars)if(!star.taken&&!star.hidden&&Math.hypot(p.x-star.x,p.y-35-star.y)<39){collectAdventureStar(s,star);particles(s,star.x,star.y,'#ffe49e',3);}
 stepFreedBunnies(s,dt);
 for(const c of s.cages)if(c.open&&!c.rescued&&!c.carried&&!c.lost&&Math.hypot(p.x-c.x,p.y-c.y)<62)rescue(s,c);
 updateOutposts(s,dt);updateEnemies(s,dt,playerBody,defeat);updateBoss(s,dt,{say,particles,body:playerBody});
 if(s.rescued>0){s.buddyWait-=dt;if(s.buddyWait<=0){s.buddyCast[s.buddyNext%s.rescued]=.6;s.buddyNext++;s.buddyWait=(s.buff>0?.8:1.7)/s.rescued;}}
 for(let i=0;i<3;i++){const previous=s.buddyCast[i];s.buddyCast[i]=Math.max(0,previous-dt);if(previous>.4&&s.buddyCast[i]<=.4)fire(s,true,i);}
 const b=s.boss;
 for(const shot of s.shots){
  shot.life-=dt;shot.age+=dt;
  if(shot.heavy)updateSpecialShot(s,shot,dt);
  else{
   if(shot.kind===1&&shot.age>.72){if(!shot.returning){shot.returning=true;shot.hits=[];}shot.vx+=(Math.sign(p.x-shot.x)*620-shot.vx)*dt*10;shot.vy+=(clamp(p.y-30-shot.y,-300,300)-shot.vy)*dt*8;if(Math.hypot(shot.x-p.x,shot.y-p.y+30)<30)shot.life=0;}
   if(shot.kind===2)shot.vy+=Math.sin(shot.age*18)*dt*190;
  }
  const previousY=shot.y;shot.previousX=shot.x;shot.previousY=shot.y;shot.x+=shot.vx*dt;shot.y+=shot.vy*dt;
  if(shot.heavy&&shot.kind===3&&shot.vy>0){
   const floor=s.platforms.find(q=>shot.x>=q.x&&shot.x<=q.x+q.w&&previousY<=surfaceY(q,shot.x)&&shot.y+shot.r>=surfaceY(q,shot.x));
   if(floor){shot.y=surfaceY(floor,shot.x)-shot.r;shot.vy=-Math.max(42,Math.abs(shot.vy)*.5);}
  }
  if(shot.heavy||shot.kind===3)clearPowerProjectiles(s,[shot]);
  if(shot.heavy&&shot.kind===4&&shot.vy>0){
   const floor=s.platforms.find(q=>shot.x>=q.x&&shot.x<=q.x+q.w&&previousY+shot.r<=surfaceY(q,shot.x)&&shot.y+shot.r>=surfaceY(q,shot.x));
   if(floor){shot.y=surfaceY(floor,shot.x)-shot.r;shot.life=0;specialImpact(s,shot,44);}
  }
  if(shot.kind===1)for(const star of s.stars)if(!star.taken&&!star.hidden&&Math.hypot(shot.x-star.x,shot.y-star.y)<(shot.heavy?48:28))collectAdventureStar(s,star);
  if(shot.life<=0){if(shot.kind===3)burstBubble(s,shot,defeat);continue;}
  const radius=shot.heavy||shot.kind===1||shot.kind===3||shot.scale>1?shot.r:0;
  for(const q of s.supplies)if(q.hp>0&&canSpecialHit(shot,q)&&overlap(supplyBody(q),{x:shot.x-radius-.5,y:shot.y-radius-.5,w:radius*2+1,h:radius*2+1})){
   rememberSpecialHit(shot,q);damageSupply(s,q,shot.damage);if(!shot.heavy&&shot.kind!==0&&shot.kind!==1)shot.life=0;
  }
  if(shot.life<=0){if(shot.kind===3)burstBubble(s,shot,defeat);continue;}
  for(const q of s.outposts)if(q.hp>0&&canSpecialHit(shot,q)&&overlap(outpostBody(q),{x:shot.x-radius-.5,y:shot.y-radius-.5,w:radius*2+1,h:radius*2+1})){
   rememberSpecialHit(shot,q);damageOutpost(s,q,shot.damage);if(!shot.heavy&&shot.kind!==0&&shot.kind!==1)shot.life=0;
  }
  if(shot.life<=0){if(shot.kind===3)burstBubble(s,shot,defeat);continue;}
  for(const c of s.cages)if(!c.open&&!c.carried&&!c.lost&&canSpecialHit(shot,c)&&Math.abs(shot.x-c.x)<38+radius&&shot.y>c.y-62-radius&&shot.y<c.y+4+radius){rememberSpecialHit(shot,c);c.hp-=shot.heavy?2:1;if(c.hp<=0){c.open=true;particles(s,c.x,c.y-30,'#ffe4a3');}if(!shot.heavy&&shot.kind!==0)shot.life=0;}
  if(shot.life<=0){if(shot.kind===3)burstBubble(s,shot,defeat);continue;}
  for(const e of s.enemies)if(e.hp>0&&canSpecialHit(shot,e)&&overlap(enemyBody(e,6),{x:shot.x-radius-.5,y:shot.y-radius-.5,w:radius*2+1,h:radius*2+1})){
   rememberSpecialHit(shot,e);
   if(shot.kind===3){trapEnemy(e,shot.heavy?5:4);e.hp-=shot.damage;e.flash=.22;if(e.hp<=0)defeat(s,e);}
   else{e.hp-=shot.damage;e.flash=.15;if(shot.heavy&&shot.kind===2)e.snare=.65;if(e.hp<=0)defeat(s,e);}
   if(shot.heavy&&shot.kind!==3)specialImpact(s,shot,(shot.kind===4?62:95)*(shot.scale||1));
   if(shot.kind===3)burstBubble(s,shot,defeat);
   if(shot.heavy?[3,4].includes(shot.kind):shot.kind!==0&&shot.kind!==1)shot.life=0;
   if(shot.life<=0)break;
  }
  const target=bossTargets(s).find(t=>shot.x+radius>t.x&&shot.x-radius<t.x+t.w&&shot.y+radius>t.y&&shot.y-radius<t.y+t.h);
  const shell=s.index===1&&overlap(organCollision(s),{x:shot.x-radius,y:shot.y-radius,w:radius*2,h:radius*2});
  if((target||shell)&&shot.life>0&&b.hp>0&&b.phase!=='sleep'&&canSpecialHit(shot,b)){
   if(shot.heavy?[0,3,4].includes(shot.kind):shot.kind!==1)shot.life=0;rememberSpecialHit(shot,b);
   if(b.vulnerable&&target){
    const damage=shot.kind===3&&!shot.heavy?4:shot.damage;b.trailHp=Math.max(b.trailHp||b.hp,b.hp);b.hp-=damage;bossHitFeedback(s,shot.heavy);b.recoil=Math.sign(shot.vx)||p.dir;
    const sustained=shot.heavy&&[2,4].includes(shot.kind);s.hitStop=Math.max(s.hitStop,shot.heavy&&!sustained?.07:.035);s.shake=shot.heavy&&!sustained?.22:.12;
    if(shot.heavy)specialImpact(s,shot,sustained?88:140);else burst(s,shot.x,shot.y,0,76);
    particles(s,shot.x,shot.y,s.level.color,shot.heavy?14:7);
   }else{shot.armorBlocked=true;s.effects.push({x:shot.x,y:shot.y,armor:true,size:52,age:0,life:.32});s.events.push('bossBlock');}
   finishBoss(s);
  }
  if(shot.kind===3&&shot.life<=0)burstBubble(s,shot,defeat);
 }
 finishBoss(s);
 clearPowerProjectiles(s);
 const additions=[];
 for(const shot of s.hostile){
  if(shot.life<=0)continue;
  shot.life-=dt;shot.age+=dt;
  if(shot.organ&&shot.growthTime)shot.r=shot.fullRadius*organShotScale(shot);
  if(shot.kind==='ring'&&shot.arc!==undefined){const angle=shot.launchAngle+shot.arc*Math.sin(shot.age*3.7)*.68;shot.vx=Math.cos(angle)*shot.speed;shot.vy=Math.sin(angle)*shot.speed;}
  if(shot.kind==='sound-wave')stepOrganWave(shot,dt);else if(shot.rain)stepOrganRain(shot,s,dt);else{shot.vy+=(shot.gravity||0)*dt;shot.x+=shot.vx*dt;shot.y+=shot.vy*dt;}
  if(shot.organ&&(shot.x<s.level.arena.left-60||shot.x>s.level.arena.right+60)){shot.life=0;continue;}
  limitBombFire(shot);if(shot.life<=0)continue;
  if(shot.rain&&shot.rain!=='fall')continue;
  if(shot.rain&&shot.y>shot.floor){shot.life=0;burst(s,shot.x,shot.floor-8,1,38);continue;}
  if(shot.organ&&shot.kind==='note'&&!shot.rain&&shot.y>shot.floor){shot.life=0;burst(s,shot.x,shot.floor-8,1,38);continue;}
  if(guardBlocks(s,shot))continue;
  if(shot.kind==='clown'&&shot.floor!==undefined&&shot.y>=shot.floor-8&&shot.vy>0){shot.life=0;if(s.enemies.filter(e=>e.hp>0&&e.x>=s.level.arena.left).length<8){const e=makeEnemy(shot.x,shot.floor,6,s.boss.turn);e.y=shot.floor-12;s.enemies.push(e);}burst(s,shot.x,shot.floor-10,1,44);}
  else if(shot.kind==='bomb'&&shot.y>shot.floor-12){shot.life=0;if(shot.carpet&&Math.hypot(p.x-shot.x,p.y-20-shot.floor+12)<52*BOMB_SCALE)hurt(s);const fire=bombFlames(shot);fire.forEach(limitBombFire);additions.push(...fire.filter(q=>q.life>0));particles(s,shot.x,shot.y,'#ffb674',10);burst(s,shot.x,shot.y,1,(shot.carpet?110:145)*BOMB_SCALE);s.events.push('impact');}
  else if(shot.bounce&&shot.y>shot.floor-12){shot.y=shot.floor-12;shot.vy=-190;shot.bounce--;}
  if(shot.life>0&&overlap(playerBody(p),{x:shot.x-shot.r,y:shot.y-shot.r,w:shot.r*2,h:shot.r*2})){hurt(s);shot.life=0;}
 }
 s.shots=s.shots.filter(q=>q.life>0);s.hostile=[...s.hostile.filter(q=>q.life>0),...additions].slice(-140);
 stepWorldEffects(s,dt);
 if(s.done)return;
 if(p.x>s.level.exit[0]-45&&b.hp>0&&s.noticeTime<1)say(s,'locked');
 if(b.trailHp>b.hp&&b.flash<.08)b.trailHp+=(b.hp-b.trailHp)*Math.min(1,dt*5);
 followAdventureCamera(s,dt);s.lastInput={...input};
}
