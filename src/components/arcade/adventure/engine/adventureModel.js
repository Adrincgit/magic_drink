import {prepareActTwo,resolveActTwoWalls,stepActTwoRoute,hitActTwoObjects} from './actTwoRoute';
import {damageActTwoBoss,stepActTwoHazards} from '../actors/bosses/adventureActTwoBosses';
import {beginPopcornDefeat} from './adventurePopcornDefeat';
import {creatureDeathSound} from './adventureWorldAudio';
import {drinkImpactFeedback} from './adventureImpactFeedback';
import {canControlEnemy} from '../actors/enemies/adventureEnemyTraits';
import {beginPumpkinDefeat,isCandySpell} from './villagePumpkins';
import {stepVillageResistance,hitVillageRubble} from './villageResistance';
import {resolveVillageWalls,hitVillageObstacles} from './villageObstacles';
import {beginCandyCapture,stepCandyCapture,releaseWitchVictims} from './villageRescue';
import {prepareVillage,stepVillagers,resolveVillageProjectile,isVillageEnemy,villageFireImpact} from './adventureVillage';
import {POPCORN,POPCORN_RECOVERY,firePopcorn,stepPopcornShot,popcornImpact,stepPopcornRecoil} from './adventurePopcorn';
import {damageBellkeeper} from '../actors/bosses/adventureBellkeeper';
import {startPlacement,stepPlacement,placedDrink} from './adventurePlacement';
import {startDash} from './adventureMobility';
import {ribbonRate,ribbonInput,beginRibbonSwing,ribbonHit} from './adventureRibbon';
import {stepRibbonDance} from './adventureRibbonControl';
import {ribbonActive,ribbonLevel,stepRibbonState,stepRibbonDash,ribbonReflect,endRibbonDance} from './adventureRibbonState';
import {stepVoltChannel} from './adventureVolt';
import {repeatEchoVolley} from './adventureEcho';
import {clearCoaster,deployCoaster,stepCoaster,landOnCoaster} from './adventureCoaster';
import {umbrellaBlocks,umbrellaShield} from '../actors/enemies/adventureUmbrella';
import {beginEmberBalloonDefeat} from '../actors/enemies/adventureEmberBalloon';
import {stepWaterShot} from './adventureWater';
import {extraDrinkHit,releaseOrbit} from './adventureExtraDrinks';
import {beginElectricDefeat,reactToElement} from '../actors/enemies/adventureElementHits';
import {FORT_HEALTH,fortPartHit,stepFortDefeat} from '../actors/bosses/adventureEmberFort';
import {resetEmberEnvironment,stepEmberEnvironment,resolveEmberPitWalls} from './adventureEmberEnvironment';
import {bargePartHit,jamBargePressure} from '../actors/bosses/bargeSystems';
import {beginHitReaction,stepHitReaction,impactKind} from './adventureHitReactions';
import {stepOriginalTrail} from './adventureOriginal';
import {resetHarborAmbush,stepHarborAmbush} from './adventureHarborAmbush';
import {beginPlayerDefeat,stepPlayerDefeat} from './playerDefeat';
import {EXPLOSION_SCALE} from './explosionScale';
import {BOMB_SCALE,bombFlames,limitBombFire} from '../actors/bosses/adventureBombs';
import {LEVELS,DRINKS} from '../world/adventureLevels';
import {beginHarvesterDefeat} from './villageHarvester';
import {makeEnemy,updateEnemies,updateBoss,bossTargets,enemyShot} from '../actors/enemies/adventureEnemies';
import {enemyBody} from '../actors/enemies/adventureEnemyGeometry';
import {updateGuard,guardBlocks,clearPowerProjectiles,buddyPosition,stepBuddies} from './adventureDefense';
import {hexyMuzzle} from '../actors/hexy/hexyAnimation';
import {surfaceY,groundAt,groundY} from '../world/adventureTerrain';
import {followAdventureCamera,adventureBounds} from '../render/adventureCamera';
import {beginCompletion,stepCompletion} from './adventureCompletion';
import {stepCircusEntrance} from './adventureCircusEntrance';
import {beginPowerClash,stepPowerClash} from './adventurePowerClash';
import {stepHarlequinUltimate,harlequinUltimateScale,checkUltimateHit} from '../actors/bosses/harlequinUltimate';
import {DRINK_SHOTS,strongShots,syncDrink,spendDrink,drinkScale,grantStartingDrink,swapDrink,validSpare,cycleShotMode,activeWeapon} from './adventureAmmo';
import {stepTacticalMods,decoyBlocks} from './adventureTacticalMods';
import {validMods,equippedMods,modFireRate,modShotScale,validModLevels,shieldGrace,categorySlots,movementRate} from './adventureMods';
import {takeLoot,ORIGINAL_FIRE_RATE,ORIGINAL_SPEED} from './adventureLoot';
import {trapEnemy,canTrapEnemy,burstBubble,burstTrappedEnemy} from './adventureBubbles';
import {createOutposts,updateOutposts,damageOutpost,outpostBody} from '../actors/enemies/adventureOutposts';
import {stepBalloonDefeat} from '../actors/bosses/adventureBalloon';
import {stepOrganDefeat} from '../actors/bosses/organDestruction';
import {stepBargeDefeat} from '../actors/bosses/bargeDestruction';
import {HARLEQUIN_HEALTH,stepHarlequinProjectile} from '../actors/bosses/adventureHarlequin';
import {harlequinFireHitbox,fireImpact,isHarlequinFireHazard} from '../actors/bosses/harlequinFire';
import {emberBlastHitbox,burstEmberProjectile} from './adventureEmberBlast';
import {stepEmberFire,landEmberFire,emberBreathHitbox,igniteEmberFromAttack} from './adventureEmberFire';
import {stepHarlequinChaos} from '../actors/bosses/harlequinChaos';
import {stepHarlequinDefeat} from '../actors/bosses/harlequinDefeat';
import {stepHarlequinScorch} from './cinematicImpact';
import {BARGE_HEALTH,bargeArmor,stepBargeProjectile,bargeWaterHitbox} from '../actors/bosses/adventureBarge';
import {stepWorldEffects} from './adventureEffects';
import {stepSurfaceFeedback,sampleFireTrail} from './adventureSurfaceFeedback';
import {beginSuper,stepSuper} from './adventureSuper';
import {spellFor,specialShots,updateSpecialShot,canSpecialHit,rememberSpecialHit,specialImpact} from './adventureMagic';
import {SUPER_RECHARGE,collectAdventureStar,tickRewards} from './adventureRewards';
import {createSupplies,updateSupplies,damageSupply,supplyBody} from '../world/adventureSupplies';
import {createCampTents,stepCampTents} from './adventureCamp';
import {graveBody,damageGrave,stepSpookyIdle} from './adventureGraveyard';
import {resolveCryptWalls} from './adventureCrypts';
import {stepNightmareBranches,beginNightmareDefeat} from './adventureNightmareMotion';
import {prepareNightmares,stepNightmareGate,isNightmare} from '../actors/enemies/adventureNightmares';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
import {createCollectibles} from './adventureCollectibles';
import {stepOrganRain,stepOrganWave,organCollision,organShotScale} from '../actors/bosses/adventureOrganFortress';
import {bindCarriedBunnies,stepFreedBunnies} from './adventureRescues';
import {bossHitFeedback} from '../actors/bosses/bossFeedback';
import {ZEPPELIN_TYPE,beginZeppelinDefeat} from '../actors/enemies/adventureZeppelin';
import {DIVER_TYPE,beginDiverDefeat,waterSplash} from '../actors/enemies/adventureDiver';
import {beginAquaJet,aimAquaJet,stepAquaJet} from './adventureAquaJet';
import {configureDrinkShot,rememberDrinkShot,beginCreativeSpecial,stepDrinkFields,stepCreativeShot,refractShot,dismissEcho} from './adventureCreativeDrinks';
import {RIVER_BOAT_TYPE,beginRiverBoatDefeat} from '../actors/enemies/adventureRiverBoat';

export const playerBody=p=>({x:p.x-15,y:p.y-(p.dash>0&&!p.dashAir?39:p.crouch?31:59),w:30,h:p.dash>0&&!p.dashAir?38:p.crouch?30:58});
export function createAdventure(index=0,gentle=false,carry={}){
 const level=LEVELS[index],platforms=level.platforms.map(p=>({...p,baseX:p.x,baseY:p.y,dx:0,dy:0})),maxHearts=gentle?7:5;
 const spawn=level.circusEntrance&&carry.arrivalFromHarbor?[level.circusEntrance.arrivalX,level.circusEntrance.floor]:level.spawn||[85,platforms[0].y];
 const stars=createCollectibles(index,carry.collectedStars);
 const maxHp=level.actTwo?level.bossHealth*(gentle?.8:1):level.nightmareTrail?level.bossHealth*(gentle?.8:1):index===5?(gentle?220:FORT_HEALTH):index===3?HARLEQUIN_HEALTH[gentle?'gentle':'normal']:index===2?BARGE_HEALTH[gentle?'gentle':'normal']:Math.round(((gentle?92:140)+index*(gentle?18:24))*(index===0?1.15:1)*(index<2?1.44*1.15:1)*100)/100;
 const weapon=carry.ammo===0||carry.weapon===12?-1:carry.weapon??-1;
 const families=categorySlots(carry.modCategorySlots,carry.modSlots??1,carry.mods),mods=equippedMods(carry.mods,validMods(carry.mods),families);
 const s={level,index,gentle,mods,modCategorySlots:families,modSlots:carry.modSlots??1,pendingStars:[],modLevels:validModLevels(carry.modLevels,validMods([...Object.keys(carry.modLevels||{}),...mods])),starterClaimed:!!carry.starterClaimed,superReserve:carry.superReserve??(mods.includes('encore-pocket')?1:0),reserveCooldown:carry.reserveCooldown||0,platforms,enemies:level.enemies.map(([x,y,t,heading],i)=>({...makeEnemy(x,y,t,i),...(heading===1||heading===-1?{dir:heading}:{})})),stars,outposts:createOutposts(level),
 cages:level.cages.map(([x,y,carrier],i)=>({x,y,hp:2,open:false,rescued:false,reward:i,...(carrier===undefined?{}:{carrier,carried:true})})),pickups:[],supplies:createSupplies(level),campTents:createCampTents(level),
 hazards:level.hazards.map(([x,y,w])=>({x,y,w,h:22})),
 player:{x:spawn[0],y:spawn[1],vx:0,vy:0,dir:1,ground:0,coyote:.1,jumps:0,jumpBuffer:0,hurt:0,hitReact:0,hitType:'physical',hitDuration:.32,knockdown:null,cast:0,land:0,dash:0,dashDuration:.34,dashDir:1,dashWait:0,crouch:false,aimX:1,aimY:0,aimAge:0,stride:0,jumpAge:0,charge:0,specialCast:0,specialWait:0,pendingSpecial:null,spin:0,superCast:0,gliding:false},
 boss:{combatClass:level.bossOnly||index===3?'boss':'miniboss',x:level.boss[0],y:level.boss[1],home:level.boss[0],floor:level.boss[1],hp:maxHp,maxHp,clock:0,phase:'sleep',timer:1,flash:0,dir:-1,turn:0,stage:1,move:'',vulnerable:false},
 arenaLocked:false,time:0,ticks:0,fxTime:0,popcornFlash:null,hitStop:0,shake:0,camera:{x:level.circusEntrance?Math.max(level.circusEntrance.left??-1400,spawn[0]-300):0,y:level.circusEntrance&&!level.circusCamp?-70:level.groundRoute?40:0,backdropY:level.groundRoute?40:0,zoom:level.circusEntrance&&!level.circusCamp?.8:1},hearts:clamp(carry.hearts??maxHearts,1,maxHearts),maxHearts,
 magic:clamp(carry.magic??100,0,100),exhaustion:carry.exhaustion||0,superCooldown:clamp(carry.superCooldown||0,0,SUPER_RECHARGE),starPulse:0,buddyCast:[0,0,0],buddyNext:0,shieldHit:0,shieldBreak:0,
 weapon,ammoWeapon:weapon,ammoCapacity:weapon>=0?Math.min(DRINK_SHOTS[weapon]*4.1,carry.ammoCapacity||DRINK_SHOTS[weapon]):0,ammo:weapon>=0?Math.min(carry.ammoCapacity||DRINK_SHOTS[weapon],carry.ammo??DRINK_SHOTS[weapon]):0,drinkTier:weapon>=0&&carry.drinkTier===2?2:1,overdrive:carry.overdrive||0,overdriveDuration:carry.overdriveDuration||8,lootSeed:(Math.random()*4294967296)>>>0,power:weapon>=0,doubleJump:true,shield:clamp(carry.shield||0,0,3),buff:0,buddyWait:2,
 shotWait:0,shots:[],hostile:[],particles:[],effects:[],surfaceDust:[],aquaJet:null,drinkFields:[],drinkHistory:[],score:0,starMoney:0,rescued:0,done:false,won:false,combo:0,comboTime:0,events:[],lastInput:{},notice:'start',noticeTime:5};
 s.coaster=null;s.coasterUsed=false;s.player.coasterGround=false;
 s.basicFire=!!carry.basicFire;s.basicCycle=carry.basicCycle||0;
 s.spareDrink=validSpare(carry.spareDrink);s.confettiDecoy=null;s.confettiWait=0;s.swapWait=0;
 Object.assign(s.player,{parryWindow:0,parryWait:0,parryFlash:0,parryUsed:false});
 prepareNightmares(s);prepareVillage(s);prepareActTwo(s);resetHarborAmbush(s);resetEmberEnvironment(s);bindCarriedBunnies(s);grantStartingDrink(s);return s;
}
export function adventureCarry(s){if(s.ribbonDance){const q=s.ribbonDance.stored;return adventureCarry({...s,ribbonDance:null,weapon:q?.kind??-1,ammo:q?.ammo||0,ammoCapacity:q?.capacity||0,drinkTier:q?.tier||1});}return {basicFire:!!s.basicFire,basicCycle:s.basicCycle||0,spareDrink:validSpare(s.spareDrink),arrivalFromHarbor:s.index===2&&s.won,mods:s.mods,modSlots:s.modSlots,modCategorySlots:s.modCategorySlots,overdriveDuration:s.overdriveDuration,modLevels:s.modLevels,starterClaimed:s.starterClaimed,ammoCapacity:s.ammoCapacity,superReserve:s.superReserve,reserveCooldown:s.reserveCooldown,hearts:s.hearts,weapon:s.weapon,ammo:s.ammo,drinkTier:s.drinkTier,overdrive:s.overdrive,shield:s.shield,doubleJump:s.doubleJump,magic:s.magic,superCooldown:s.superCooldown,exhaustion:s.exhaustion};}
// Restart the whole route while keeping reward receipts and claimed loot.
// The single recovery heart is renewed for each attempt, never duplicated.
export function retryAdventure(s){
 endRibbonDance(s);
 const fresh=createAdventure(s.index,s.gentle,{...adventureCarry(s),hearts:s.maxHearts,magic:100});
 for(const key of ['stars','pendingStars','score','starMoney','bankedStars','rescued'])if(s[key]!==undefined)fresh[key]=s[key];
 const claimed=new Map(s.supplies.filter(q=>!q.phaseAid&&!q.midpointHeart).map(q=>[q.id,q]));
 fresh.supplies=fresh.supplies.map(q=>q.midpointHeart?q:claimed.get(q.id)||q);
 fresh.pickups=s.pickups.filter(q=>!q.phaseAid&&!q.midpointHeart);
 fresh.cages=fresh.cages.map(q=>{
  const old=s.cages.find(c=>c.reward===q.reward);
  return old?.rescued?{...q,hp:0,open:true,rescued:true,carried:false}:q;
 });
 for(const e of fresh.enemies)e.captive=null;bindCarriedBunnies(fresh);
 fresh.player.hurt=2;
 // Drop every transient field (including stale checkpoints, curses and boss
 // transitions) without replacing the state object held by the React engine.
 for(const key of Object.keys(s))delete s[key];
 Object.assign(s,fresh);
 return s;
}
function particles(s,x,y,color,n=8){for(let i=0;i<n;i++)s.particles.push({x,y,vx:Math.cos(i*2.4)*90,vy:-70-Math.sin(i)*65,life:.55,color});}
function say(s,n){s.notice=n;s.noticeTime=4;}
function hurt(s,fall=false,amount=1,clashLoss=false,source={}){
 const p=s.player;if(s.done||s.playerDefeat||s.superCinematic||(!clashLoss&&!fall&&(p.hurt>0||s.overdrive>0||ribbonActive(s)&&p.dash>0)))return;
 if(!clashLoss&&!fall&&s.shield>0){s.shield--;s.shieldHit=.3;if(!s.shield)s.shieldBreak=.4;p.hurt=shieldGrace(s);s.events.push('shield');particles(s,p.x,p.y-30,'#b4ecff',15);return;}
 if(s.trial){s.trial.contacts=(s.trial.contacts||0)+1;return;}
 s.aquaJet=null;s.voltBeam=null;s.placement=null;p.aquaChannel=false;s.hearts=Math.max(0,s.hearts-amount);p.hurt=s.gentle?2.1:1.5;p.hitReact=.32;p.charge=0;p.pendingSpecial=null;p.specialCast=0;p.superCast=0;p.spin=0;s.combo=0;beginHitReaction(s,source);if(p.hitType==='physical')particles(s,p.x,p.y-30,'#ffa6bf');
 p.guarding=false;p.dash=0;p.dashAir=false;
 if(isCandySpell(source))endRibbonDance(s);
 beginCandyCapture(s,source);
 if(s.hearts<=0&&!clashLoss){s.events=s.events.filter(e=>e!=='hit');beginPlayerDefeat(s,fall);return;}
 if(fall){clearCoaster(s);s.coasterUsed=false;p.knockdown=null;const at=s.harborAmbush?.state==='active'?[s.level.harborAmbush.left+100,s.level.harborAmbush.y]:s.arenaLocked?[s.level.arena.left+75,s.level.arena.y]:s.level.spawn||[85,s.level.platforms[0].y];p.x=at[0];p.y=at[1]-10;p.vy=0;p.vx=0;p.dash=0;s.hostile=[];}
 if(s.hearts<=0){s.done=true;s.won=false;s.events.push('death');}
}
function burst(s,x,y,row=0,size=52){s.effects.push({x,y,row,size:size*EXPLOSION_SCALE,age:0,life:.32});}
function defeat(s,e,shot){if(e.defeated)return;e.defeated=true;creatureDeathSound(s,e);e.hp=0;e.flash=0;e.deadTime=[10,13].includes(e.type)?1.55:e.type===11?1.1:e.type===14?1:.55;e.deathAge=0;if(isVillageEnemy(e))e.deadTime=1.15;if(isNightmare(e))beginNightmareDefeat(s,e);if(e.type===10)s.events.push('emberDefeat');if(e.type===13)beginEmberBalloonDefeat(e);if(e.type===ZEPPELIN_TYPE)beginZeppelinDefeat(s,e);if(e.type===DIVER_TYPE)beginDiverDefeat(e);if(e.type===RIVER_BOAT_TYPE)beginRiverBoatDefeat(s,e);beginPopcornDefeat(s,e,shot);releaseWitchVictims(s,e);beginPumpkinDefeat(s,e);beginElectricDefeat(s,e,shot);beginHarvesterDefeat(s,e);s.combo++;s.comboTime=3;s.score+=3+Math.min(5,s.combo);if(e.type===DIVER_TYPE||e.type===RIVER_BOAT_TYPE)waterSplash(s,e.x,e.y-30,90);else{particles(s,e.x,e.y-30,'#ffdda0',12);burst(s,e.x,e.y-30,e.trap?2:1,72);if(!e.deathVoicePlayed)s.events.push('pop');}burstTrappedEnemy(s,e,defeat);}
function finishBoss(s){if(s.level.villageTrail||s.level.actTwo)return;const b=s.boss;if(b.hp>0||b.phase==='defeated')return;
 if(s.level.nightmareTrail){b.hp=0;b.phase='dying';s.hostile=[];return;}
 if(s.index===2||s.index===5){b.hp=0;b.phase='defeated';s.hostile=[];return;}
 if(s.index===3){b.hp=0;b.phase='dying';b.defeatPending=true;s.hostile=[];return;}
 b.hp=0;b.phase='defeated';s.arenaLocked=false;s.hearts=Math.min(s.maxHearts,s.hearts+2);s.score+=60;s.events.push('bossDown');say(s,'bossDown');particles(s,b.x,b.y-50,'#ffcce8',38);s.hostile=[];s.enemies=s.enemies.filter(e=>e.x<s.level.arena.left);}
export function buddyHasTarget(s,index=0){
 const p=s.player,pet=buddyPosition(s,index),x=pet.x+p.dir*12,y=pet.y-20;
 const dx=p.aimX,dy=p.aimY,visibleWidth=960/(s.camera.zoom||1);
 const boxes=s.enemies.filter(e=>e.hp>0&&!e.fleeing&&!e.defeated&&!e.emerging).map(e=>enemyBody(e));
 boxes.push(...(s.graves||[]).filter(q=>q.hp>0).map(graveBody));
 boxes.push(...s.outposts.filter(q=>q.hp>0).map(outpostBody));
 if(s.boss.hp>0&&s.boss.vulnerable&&!['sleep','intro','transform','dying','defeated'].includes(s.boss.phase))boxes.push(...bossTargets(s));
 return boxes.some(box=>{
  if(box.x+box.w<s.camera.x||box.x>s.camera.x+visibleWidth)return false;
  let near=0,far=520;
  for(const [origin,direction,low,high]of [[x,dx,box.x-10,box.x+box.w+10],[y,dy,box.y-10,box.y+box.h+10]]){
   if(Math.abs(direction)<.001){if(origin<low||origin>high)return false;continue;}
   const a=(low-origin)/direction,b=(high-origin)/direction;near=Math.max(near,Math.min(a,b));far=Math.min(far,Math.max(a,b));if(near>far)return false;
  }
  return far>=0;
 });
}
function fire(s,buddy=false,index=0){
 const p=s.player,kind=buddy?-1:activeWeapon(s),angle=Math.atan2(p.aimY,p.aimX),angles=kind===4?[-.23,0,.23]:kind===2?[-.08,.08]:[0];
 if(!buddy){s.shotWait=(kind===POPCORN?POPCORN_RECOVERY:kind===12?.48:[1,6,8,9,11].includes(kind)?.36:kind===10?.42:kind===3?.34:.25)*(s.buff>0?.72:1)/(s.overdrive>0?ORIGINAL_FIRE_RATE:1)/modFireRate(s);p.cast=.24;s.events.push(kind===5?'aquaShot':kind>=6?['jellyShot','prismShot','echoPulse','voltShot','honeyDrop','orbitShot','ribbonShot','popcornShot'][kind-6]:kind>=0?['grapeShot','bananaShot','kiwiShot','bubbleShot','sparkleShot'][kind]:'cast');}
 const muzzle=hexyMuzzle(s),pet=buddyPosition(s,index),x=buddy?pet.x+p.dir*12:muzzle.x,y=buddy?pet.y-20:muzzle.y;
 if(!buddy&&kind===12){s.shotWait=.34/ribbonRate(s)/modFireRate(s);if(beginRibbonSwing(s))return;}
 const scale=buddy?1:(kind<0?1:drinkScale(s))*modShotScale(s),fired=[];
 if(kind===POPCORN){const volley=firePopcorn(s,muzzle,{x:p.aimX,y:p.aimY},scale);spendDrink(s);repeatEchoVolley(s,volley);return;}
 for(const offset of angles){const a=angle+offset,speed=kind===3?290:kind===1?540:510;
  const shot=configureDrinkShot({x,y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,r:(kind===3?24:kind===1?19:kind===5?16:10)*scale,scale,life:kind===1?2.6:kind===3?2.1:1.5,age:0,kind,damage:buddy?1:kind===0||kind===1?3:2,hits:[]});
  if(shot.ribbon){shot.ribbonDuration=p.ribbonDuration;shot.life=shot.ribbonDuration;shot.ribbonCombo=p.ribbonCombo;if(p.ground===null&&!p.ribbonHop&&ribbonLevel(s)>=2)shot.damage=.3;}
  s.shots.push(shot);if(!buddy){rememberDrinkShot(s,shot);fired.push(shot);}
 }
 if(!buddy&&kind>=0){spendDrink(s);repeatEchoVolley(s,fired);}
}
function releaseSpecial(s,placement){
 const p=s.player,q=p.pendingSpecial;if(!q)return;
 const muzzle=hexyMuzzle(s);
 const scale=(q.kind<0?1:drinkScale(s))*modShotScale(s,true);
 if(q.kind===POPCORN){firePopcorn(s,muzzle,q,drinkScale(s)*modShotScale(s),true);s.shotWait=POPCORN_RECOVERY/modFireRate(s);p.specialWait=s.shotWait;p.magicDelay=Math.max(p.magicDelay||0,.6);}
 else if(q.kind===5)beginAquaJet(s,scale);
 else if(!beginCreativeSpecial(s,q.kind,scale,placement))s.shots.push(...specialShots(q.kind,muzzle,q).map(shot=>({...shot,r:shot.r*scale,scale})));
 s.magic=Math.max(0,s.magic-(s.ribbonDance&&q.kind===12?0:spellFor(q.kind).cost));p.pendingSpecial=null;s.events.push(q.kind<0?'basicStrong':q.kind===0?'heavyCast':spellFor(q.kind).key+'Cast');
 if(q.kind>=0)spendDrink(s,strongShots(q.kind));
}
function rescue(s,c){
 c.rescued=true;s.rescued++;s.score+=10;s.events.push('rescue');particles(s,c.x,c.y-30,'#ffc2db',18);
 if(c.reward===0){if(s.hearts===s.maxHearts){s.magic=Math.min(100,s.magic+20);say(s,'rescueMagic');}else{s.hearts=Math.min(s.maxHearts,s.hearts+2);say(s,'rescueHeart');}}
 else if(c.reward===1){s.magic=Math.min(100,s.magic+30);say(s,'rescueMagic');}
 else{s.buff=16;s.buddyWait=.5;say(s,'rescueMagic');}
}
export function stepAdventure(s,input,dt){
 if(s.ribbonDance&&(s.done||s.playerDefeat||s.clear))endRibbonDance(s);
 if(s.done)return;s.events=[];s.ticks++;s.fxTime+=dt;if(s.popcornFlash&&s.fxTime-s.popcornFlash.at>=s.popcornFlash.duration)s.popcornFlash=null;s.shake=Math.max(0,s.shake-dt);
 if(s.clear||s.playerDefeat||s.boss.defeat){s.aquaJet=null;s.voltBeam=null;s.placement=null;s.player.aquaChannel=false;s.drinkFields=[];s.drinkHistory=[];s.confettiDecoy=null;clearCoaster(s);}
 stepHarlequinScorch(s,dt);
 if(stepPlayerDefeat(s,dt)){s.lastInput={};return;}
 if(stepCandyCapture(s,input,dt))input={};
 if(s.playerDefeat){s.lastInput={};return;}
 if(s.player.drinkCast>0)input={};
 if(s.ribbonDance&&s.player.pendingSip)input={...input,attack:false,special:false,guard:false,dash:false};
 syncDrink(s);s.ammoEmpty=Math.max(0,(s.ammoEmpty||0)-dt);
 if(s.powerClash){stepPowerClash(s,input,dt,{hurt:()=>hurt(s,false,4,true),finishBoss});s.lastInput={...input};return;}
 if(stepBalloonDefeat(s,dt)){s.lastInput={...input};return;}
 if(stepOrganDefeat(s,dt)){s.lastInput={...input};return;}
 if(stepBargeDefeat(s,dt)){s.lastInput={...input};return;}
 if(stepHarlequinDefeat(s,dt)){s.lastInput={...input};return;}
 stepFortDefeat(s,dt);
 beginCompletion(s);if(s.clear){stepCompletion(s,dt);s.lastInput={...input};return;}
 if(!s.superCinematic&&stepCircusEntrance(s,dt)){s.lastInput={...input};return;}
 if(s.superCinematic||beginSuper(s,input)){
  s.confettiDecoy=null;clearCoaster(s);
  s.aquaJet=null;s.voltBeam=null;s.placement=null;s.player.aquaChannel=false;
  if(beginPowerClash(s)){stepPowerClash(s,input,dt,{hurt:()=>hurt(s,false,4,true),finishBoss});s.lastInput={...input};return;}
  stepSuper(s,dt,{defeat,particles,burst,say});s.lastInput={...input};return;
 }
 stepHarlequinUltimate(s,dt);dt*=harlequinUltimateScale(s);
 if(s.hitStop>0){
  if(ribbonActive(s))for(const key of ['attack','special','jump','dash'])if(input[key]&&!s.lastInput[key]){s.ribbonQueued??={};s.ribbonQueued[key]=true;}
  s.hitStop=Math.max(0,s.hitStop-dt);return;
 }
 if(s.ribbonQueued){s.player.ribbonQueuedRelease=!!s.ribbonQueued.special&&!input.special;input={...input,...s.ribbonQueued};s.ribbonQueued=null;}
 tickRewards(s,dt);updateSupplies(s,dt);
 stepRibbonState(s,dt);
 if(!(s.player.drinkCast>0))s.overdrive=Math.max(0,(s.overdrive||0)-dt);
 s.player.drinkCast=Math.max(0,(s.player.drinkCast||0)-dt);
 s.time+=dt;s.noticeTime=Math.max(0,s.noticeTime-dt);s.comboTime=Math.max(0,s.comboTime-dt);s.buff=Math.max(0,s.buff-dt);if(!s.comboTime)s.combo=0;
 stepHarborAmbush(s,dt);
 stepCampTents(s,dt);
 stepCoaster(s,dt);
 s.damage=(source={})=>hurt(s,false,1,false,source);const p=s.player,oldY=p.y,oldX=p.x,wasGround=p.ground!==null||p.coasterGround;
 const previousContact={x:oldX,grounded:wasGround,vy:p.vy};
 if(!input.jump||wasGround)p.hatCastUntil=0;
 stepNightmareBranches(s,dt);
 const onTrail=wasGround&&s.platforms[p.ground]?.kind==='earth'&&(!s.level.actTwo||s.level.groundRoute);
 const villageSupport=wasGround&&s.platforms[p.ground]?.villageObstacle?s.platforms[p.ground]:null;
 for(const q of s.platforms){const ox=q.x,oy=q.y;if(q.kind==='moving')q[q.axis]=(q.axis==='x'?q.baseX:q.baseY)+Math.sin(s.time*q.speed)*q.range;q.dx=q.x-ox;q.dy=q.y-oy;}
 if(p.ground!==null){const q=s.platforms[p.ground];p.x+=q.dx;p.y+=q.dy;}
 p.springBounce=Math.max(0,(p.springBounce||0)-dt);
 p.ribbonSwing=Math.max(0,(p.ribbonSwing||0)-dt);
 for(const key of ['hurt','hitReact','cast','land','dash','dashWait','specialCast','specialWait','spin','superCast'])p[key]=Math.max(0,p[key]-dt);s.shotWait=Math.max(0,s.shotWait-dt);
 if(p.hitReact>0||p.knockdown)input={};
 stepTacticalMods(s,dt);
 if(input.swap&&!s.lastInput.swap)cycleShotMode(s);
 if(input.coaster&&!s.lastInput.coaster)deployCoaster(s);
 p.coyote=wasGround?.11:Math.max(0,p.coyote-dt);p.jumpBuffer=Math.max(0,p.jumpBuffer-dt);
 const axis=s.placement?0:(input.right?1:0)-(input.left?1:0);if(axis&&p.dash<=0&&!p.pendingSpecial)p.dir=axis;
 p.holding=!!input.hold&&wasGround;
 p.crouch=!s.placement&&!!input.down&&wasGround&&!p.holding&&p.dash<=0;
 const vertical=s.placement?0:input.up?-1:input.down&&(!wasGround||p.holding)?1:0;
 const aimAxis=vertical>0&&p.holding?(axis||p.dir):axis;
 const oldAim=p.aimY;p.aimX=vertical?(aimAxis?aimAxis/Math.SQRT2:0):p.dir;p.aimY=vertical?(aimAxis?vertical/Math.SQRT2:vertical):0;p.aimAge=oldAim===p.aimY?p.aimAge+dt:0;
 if(input.jump&&!s.lastInput.jump)p.jumpBuffer=.13;
 if(p.jumpBuffer&&p.dash<=0&&(p.coyote>0||(s.doubleJump&&p.jumps<2))){p.vy=-600;p.ground=null;p.coasterGround=false;p.crouch=false;p.coyote=0;p.jumpBuffer=0;p.jumps++;p.jumpAge=0;p.spin=p.jumps===2?.5:0;if(ribbonActive(s)){p.ribbonFlip=.48;p.ribbonJumpHits=[];p.ribbonAirLinks=0;p.ribbonAirCount=0;p.ribbonHop=false;if(p.ribbonJumpLink>0)p.vy=-650;}s.events.push(p.jumps===2?'doubleJump':'jump');particles(s,p.x,p.y,'#fce8bc',5);}
 if(!input.jump&&s.lastInput.jump&&!p.springBounce&&!(p.popcornClearUntil>s.time)&&p.vy< -260)p.vy=-260;
 startDash(s,input,wasGround&&!p.coasterGround);
 ribbonInput(s,input,dt);
 updateGuard(s,input,dt);
 aimAquaJet(s,input,dt);
 s.exhaustion=Math.max(0,(s.exhaustion||0)-dt);
 p.firing=!s.placement&&!!input.attack&&!p.guarding&&!p.charge&&!p.specialCast&&!p.superCast&&p.dash<=0&&p.hitReact<=0;
 const kind=activeWeapon(s),spec=spellFor(kind);
 if((kind===12?p.ribbonSpecialBuffer>0:input.special&&!s.lastInput.special)&&!s.placement){
  if(!s.basicFire&&dismissEcho(s)){}
  else if(!p.guarding&&!p.dash&&!p.hitReact&&!p.specialCast&&!p.specialWait&&!s.basicFire&&releaseOrbit(s)){}
  else if(s.exhaustion>0)say(s,'exhausted');
  else if(kind>=0&&s.ammo<strongShots(kind)&&!(s.overdrive>0))say(s,'lowAmmo');
  else if(!s.ribbonDance&&s.magic<spec.cost)say(s,kind<0?'basicLow':kind===9?'lowVoltMagic':'lowMagic');
  else if(!p.guarding&&!p.dash&&!p.hitReact&&!p.specialCast&&!p.specialWait&&!p.charge&&!p.superCast&&(kind!==POPCORN||s.shotWait===0)){
   if(placedDrink(kind))startPlacement(s,kind);
   else{p.specialCast=.36;p.specialWait=.55;p.specialAimY=p.aimY;p.specialAimX=p.aimX;p.spin=0;
   p.pendingSpecial={x:p.aimX,y:p.aimY,kind:kind};releaseSpecial(s);}
  }
 }
 const placement=stepPlacement(s,input,dt);
 if(placement&&s.magic>=spec.cost&&(s.ammo>=strongShots(kind)||s.overdrive>0)){
  p.specialCast=.36;p.specialWait=.55;p.specialAimX=p.aimX;p.specialAimY=p.aimY;p.pendingSpecial={x:p.aimX,y:p.aimY,kind:kind};releaseSpecial(s,placement);
 }
 if(!p.charge&&!p.specialCast&&!p.superCast&&!p.guarding&&!p.magicDelay)s.magic=Math.min(100,s.magic+(s.exhaustion>0?3:12)*dt);
 if(kind!==9&&!s.placement&&(kind===12?p.ribbonBuffer>0:input.attack)&&s.shotWait===0&&!p.guarding&&!p.charge&&!p.specialCast&&!p.superCast&&p.dash<=0&&p.hitReact<=0){p.spin=0;fire(s);}
 if(p.hitReact>0||p.knockdown){p.vx*=Math.exp(-dt*(wasGround?7:1.5));p.vy+=1550*dt;}else if(p.dash>0){p.vx=p.dashDir*440*(s.overdrive>0?ORIGINAL_SPEED:1);p.vy=p.dashAir?(p.dashY||0)*440:wasGround?0:p.vy+500*dt;}else{const desired=(p.holding?0:axis)*(p.crouch?95:p.charge||p.superCast||p.guarding||p.aquaChannel?90:255)*(s.overdrive>0?ORIGINAL_SPEED:ribbonActive(s)?1.13+(ribbonLevel(s)-1)*.045:1)*movementRate(s);p.vx=p.holding?0:p.vx+clamp(desired-p.vx,-1700*dt,1700*dt);p.vy+=1550*dt;}
 const wasGliding=p.gliding;
 stepRibbonDance(s,dt);
 p.gliding=!!input.jump&&!p.coasterGround&&p.ground===null&&p.vy>40&&!p.dash&&!p.spin&&!p.superCast&&!p.charge&&!p.guarding&&!p.hitReact;
 if(p.gliding&&!wasGliding)s.events.push('glide');
 if(p.gliding)p.vy=Math.min(p.vy,95);
 // One full run is two steps. The registered boot travels ~38 world pixels
 // over three of twelve drawings; pace the cycle to cover that same distance.
 p.stride+=Math.abs(p.vx)*dt/(p.crouch?88:151.2);if(p.ground===null)p.jumpAge+=dt;
 const bounds=adventureBounds(s);
 p.x=clamp(p.x+p.vx*dt+stepPopcornRecoil(s,dt),bounds.left,bounds.right);p.y+=p.vy*dt;p.ground=null;
 resolveEmberPitWalls(s,oldX);
 resolveCryptWalls(s,oldX);
 resolveVillageWalls(s,oldX,oldY,villageSupport);resolveActTwoWalls(s,oldX,oldY);
 if(p.vy>=0){
  // Follow a continuous slope while walking/rolling, including downhill.
  const candidate=onTrail?groundAt(s.platforms,p.x):null;
  const trail=candidate&&(!s.level.nightmareTrail||Math.abs(surfaceY(candidate,p.x)-oldY)<24)?candidate:null;
  if(villageSupport&&!villageSupport.gone&&p.x+13>villageSupport.x&&p.x-13<villageSupport.x+villageSupport.w){p.y=surfaceY(villageSupport,p.x);p.vy=0;p.ground=s.platforms.indexOf(villageSupport);p.jumps=0;p.spin=0;p.gliding=false;}
  else if(trail){p.y=surfaceY(trail,p.x);p.vy=0;p.ground=s.platforms.indexOf(trail);p.jumps=0;p.spin=0;p.gliding=false;}
  else for(let i=0;i<s.platforms.length;i++){
   const q=s.platforms[i];if(q.gone||s.level.actTwo&&q.kind==='earth'&&s.platforms.some(o=>o.solid&&!o.gone&&p.x+13>o.x&&p.x-13<o.x+o.w&&oldY<=o.y+7&&p.y>=o.y)||s.level.villageTrail&&q.kind==='earth'&&s.platforms.some(o=>o.villageObstacle&&!o.gone&&p.x+13>o.x&&p.x-13<o.x+o.w&&oldY<=surfaceY(o,oldX)+7&&p.y>=surfaceY(o,p.x)))continue;const y=surfaceY(q,p.x),previous=surfaceY(q,oldX)-q.dy;
   if(p.x+13>q.x&&p.x-13<q.x+q.w&&oldY<=previous+7&&p.y>=y){p.y=y;p.vy=0;p.ground=i;p.jumps=0;p.spin=0;p.gliding=false;if(!wasGround){p.land=.16;if(p.dashAir)p.dash=0;s.events.push('land');}break;}
  }
 }
 landOnCoaster(s,oldY);
 stepSurfaceFeedback(s,dt,previousContact);
 if(p.candy?.tether){p.x=p.candy.tether.x;p.y=p.candy.tether.y;p.vx=0;p.vy=0;p.ground=null;}
 stepHitReaction(s,dt);stepOriginalTrail(s,dt);
 const fatalPit=s.hearts===1&&p.vy>0&&p.y>s.camera.y+540/(s.camera.zoom||1)-65&&!s.platforms.some(q=>!q.gone&&p.x>=q.x&&p.x<=q.x+q.w&&surfaceY(q,p.x)>p.y);
 if(p.y>(s.level.emberTrail?groundY(s.level.route,p.x)+380:850)||fatalPit)hurt(s,true);if(s.done||s.playerDefeat)return;
 if(p.pendingSip&&p.ground!==null){p.pendingSip=false;p.drinkCast=.7;}
 for(const q of s.pickups)if(!q.taken&&!(q.collectWait>0)&&Math.hypot(p.x-q.x,p.y-28-q.y)<38){const type=takeLoot(s,q);say(s,type==='drink'?(s.drinkTier===2?'powerUp':'power'):'loot'+type);particles(s,p.x,p.y-35,DRINKS[q.kind]?.color||'#ffe4a3',15);}
 for(const h of s.hazards)if(overlap(playerBody(p),h))hurt(s,false,1,false,h);
 stepEmberEnvironment(s,dt);
 if(s.playerDefeat)return;
 for(const star of s.stars)if(!star.taken&&!star.hidden&&Math.hypot(p.x-star.x,p.y-35-star.y)<39){collectAdventureStar(s,star);particles(s,star.x,star.y,'#ffe49e',3);}
 stepFreedBunnies(s,dt);
 for(const c of s.cages)if(c.open&&!c.rescued&&!c.carried&&!c.lost&&Math.hypot(p.x-c.x,p.y-c.y)<62)rescue(s,c);
 stepBuddies(s,dt);
 stepRibbonDash(s,oldX,oldY);
 stepActTwoRoute(s,dt,makeEnemy);stepActTwoHazards(s,dt,enemyShot);
 stepVillagers(s,dt);stepVillageResistance(s,dt,defeat);updateOutposts(s,dt);updateEnemies(s,dt,playerBody,defeat);updateBoss(s,dt,{say,particles,body:playerBody});stepNightmareGate(s);stepSpookyIdle(s,input,dt);
 stepHarlequinChaos(s,dt,enemyShot);
 checkUltimateHit(s,playerBody,()=>hurt(s,false,2,false,{element:'fire',heavyImpact:true,x:s.boss.x}));
 if(s.playerDefeat)return;
 if(s.rescued>0){s.buddyWait=Math.max(0,s.buddyWait-dt);const next=s.buddyNext%s.rescued;if(s.buddyWait<=0&&buddyHasTarget(s,next)){s.buddyCast[next]=.6;s.buddyNext++;s.buddyWait=(s.buff>0?.8:1.7)/s.rescued;}}
 for(let i=0;i<3;i++){const previous=s.buddyCast[i];s.buddyCast[i]=Math.max(0,previous-dt);if(previous>.4&&s.buddyCast[i]<=.4){if(buddyHasTarget(s,i))fire(s,true,i);else s.buddyCast[i]=0;}}
 const b=s.boss;
 stepAquaJet(s,dt);
 stepDrinkFields(s,dt);
 stepVoltChannel(s,input,dt);
 for(const shot of s.shots){
  shot.life-=dt;shot.age+=dt;
  if(shot.heavy)updateSpecialShot(s,shot,dt);
  else{
   if(shot.kind===1&&shot.age>.72){if(!shot.returning){shot.returning=true;shot.hits=[];}shot.vx+=(Math.sign(p.x-shot.x)*620-shot.vx)*dt*10;shot.vy+=(clamp(p.y-30-shot.y,-300,300)-shot.vy)*dt*8;if(Math.hypot(shot.x-p.x,shot.y-p.y+30)<30)shot.life=0;}
   if(shot.kind===2)shot.vy+=Math.sin(shot.age*18)*dt*190;
  }
  const previousY=shot.y;shot.previousX=shot.x;shot.previousY=shot.y;shot.x+=shot.vx*dt;shot.y+=shot.vy*dt;
  stepPopcornShot(s,shot);
  stepCreativeShot(s,shot,dt);if(shot.ribbon)continue;refractShot(s,shot);
  sampleFireTrail(shot,dt);
  stepWaterShot(s,shot,dt);
  igniteEmberFromAttack(s,shot,true);
  if(shot.heavy&&shot.kind===3&&shot.vy>0){
   const floor=s.platforms.find(q=>!q.gone&&!q.bridge&&shot.x>=q.x&&shot.x<=q.x+q.w&&previousY<=surfaceY(q,shot.x)&&shot.y+shot.r>=surfaceY(q,shot.x));
   if(floor){shot.y=surfaceY(floor,shot.x)-shot.r;shot.vy=-Math.max(42,Math.abs(shot.vy)*.5);}
  }
  clearPowerProjectiles(s,[shot]);
  if(shot.heavy&&shot.kind===4&&shot.vy>0){
   const floor=s.platforms.find(q=>!q.gone&&!q.bridge&&shot.x>=q.x&&shot.x<=q.x+q.w&&previousY+shot.r<=surfaceY(q,shot.x)&&shot.y+shot.r>=surfaceY(q,shot.x));
   if(floor){shot.y=surfaceY(floor,shot.x)-shot.r;shot.life=0;specialImpact(s,shot,44);}
  }
  if(shot.kind===1)for(const star of s.stars)if(!star.taken&&!star.hidden&&Math.hypot(shot.x-star.x,shot.y-star.y)<(shot.heavy?48:28))collectAdventureStar(s,star);
  if(shot.life<=0){if(shot.kind===3)burstBubble(s,shot,defeat);continue;}
  const radius=shot.heavy||shot.kind===1||shot.kind===3||shot.kind>=5||shot.scale>1?shot.r:0;
  hitVillageObstacles(s,shot,radius);hitVillageRubble(s,shot,radius);hitActTwoObjects(s,shot,radius);
  for(const q of s.supplies)if(shot.life>0&&!shot.chainTarget&&q.hp>0&&canSpecialHit(shot,q)&&overlap(supplyBody(q),{x:shot.x-radius-.5,y:shot.y-radius-.5,w:radius*2+1,h:radius*2+1})){
   rememberSpecialHit(shot,q);damageSupply(s,q,shot.damage);popcornImpact(s,shot,q);if(!shot.heavy&&!shot.piercing&&shot.kind!==0&&shot.kind!==1)shot.life=0;
  }
  if(shot.life<=0){if(shot.kind===3)burstBubble(s,shot,defeat);continue;}
  for(const q of s.graves||[])if(shot.life>0&&!shot.chainTarget&&q.hp>0&&canSpecialHit(shot,q)&&overlap(graveBody(q),{x:shot.x-radius,y:shot.y-radius,w:radius*2+1,h:radius*2+1})){
   rememberSpecialHit(shot,q);damageGrave(s,q,shot.damage);popcornImpact(s,shot,q);if(!shot.heavy&&!shot.piercing&&shot.kind!==0&&shot.kind!==1)shot.life=0;
  }
  for(const q of s.outposts)if(!shot.chainTarget&&q.hp>0&&canSpecialHit(shot,q)&&overlap(outpostBody(q),{x:shot.x-radius-.5,y:shot.y-radius-.5,w:radius*2+1,h:radius*2+1})){
   rememberSpecialHit(shot,q);damageOutpost(s,q,shot.damage);popcornImpact(s,shot,q);if(!shot.heavy&&!shot.piercing&&shot.kind!==0&&shot.kind!==1)shot.life=0;
  }
  if(shot.life<=0){if(shot.kind===3)burstBubble(s,shot,defeat);continue;}
  for(const c of s.cages)if(!shot.chainTarget&&!c.open&&!c.carried&&!c.lost&&canSpecialHit(shot,c)&&Math.abs(shot.x-c.x)<38+radius&&shot.y>c.y-62-radius&&shot.y<c.y+4+radius){rememberSpecialHit(shot,c);c.hp-=shot.heavy?2:1;if(c.hp<=0){c.open=true;particles(s,c.x,c.y-30,'#ffe4a3');}if(!shot.heavy&&!shot.piercing&&shot.kind!==0)shot.life=0;}
  if(shot.life<=0){if(shot.kind===3)burstBubble(s,shot,defeat);continue;}
  for(const e of s.enemies)if(shot.life>0&&e.hp>0&&!e.fleeing&&!e.nightmareHidden&&canSpecialHit(shot,e)&&(overlap(enemyBody(e,6),{x:shot.x-radius-.5,y:shot.y-radius-.5,w:radius*2+1,h:radius*2+1})||umbrellaBlocks(e,shot)&&overlap(umbrellaShield(e),{x:shot.x-radius,y:shot.y-radius,w:radius*2+1,h:radius*2+1}))){
   if(shot.chainTarget&&shot.chainTarget!==e)continue;
   if(umbrellaBlocks(e,shot)){rememberSpecialHit(shot,e);shot.life=0;e.umbrellaHit=.18;s.effects.push({x:shot.x,y:shot.y,armor:true,size:34,age:0,life:.24});s.events.push('umbrellaBlock');break;}
   rememberSpecialHit(shot,e);extraDrinkHit(s,shot,e,true);reactToElement(e,shot);drinkImpactFeedback(s,shot,e);
   if(shot.kind===3){if(canTrapEnemy(shot,e))trapEnemy(e,shot.heavy?5:4,s);else if(shot.heavy)shot.trapResisted=true;e.hp-=shot.damage;e.flash=.22;if(e.hp<=0)defeat(s,e);}
   else{e.hp-=shot.damage;e.flash=.15;if(shot.heavy&&shot.kind===2&&canControlEnemy(e,'slow'))e.snare=.65;if(shot.aquaProbe&&canControlEnemy(e,'push'))e.x+=shot.jetDir*4;if(e.hp<=0)defeat(s,e,shot);}
   ribbonHit(s,shot,e);
   if(shot.popcorn)popcornImpact(s,shot,e);
   else if(shot.heavy&&shot.kind!==3||shot.kind>=6)specialImpact(s,shot,(shot.kind>=6?50:shot.kind===4?62:95)*(shot.scale||1));
   if(shot.kind===3)burstBubble(s,shot,defeat);
   if(shot.heavy?[3,4].includes(shot.kind):!shot.piercing&&shot.kind!==0&&shot.kind!==1)shot.life=0;
   if(shot.life<=0)break;
  }
  const target=bossTargets(s).find(t=>shot.x+radius>t.x&&shot.x-radius<t.x+t.w&&shot.y+radius>t.y&&shot.y-radius<t.y+t.h);
  const shell=(s.index===1||s.index===2)&&overlap(s.index===2?bargeArmor(s):organCollision(s),{x:shot.x-radius,y:shot.y-radius,w:radius*2,h:radius*2});
  if((target||shell)&&!shot.chainTarget&&shot.life>0&&b.hp>0&&b.phase!=='sleep'&&canSpecialHit(shot,b)){
   if(shot.heavy?[0,3,4].includes(shot.kind):shot.kind!==1)shot.life=0;rememberSpecialHit(shot,b);
   if(b.vulnerable&&target){
    drinkImpactFeedback(s,shot,b);
    if(s.index===2)jamBargePressure(s,shot);
    let damage=(shot.kind===3&&!shot.heavy?4:shot.damage)*(s.index===2&&b.pressureStun>0?1.25:1);if(s.index===5)damage=fortPartHit(s,target.part,damage);b.trailHp=Math.max(b.trailHp||b.hp,b.hp);if(s.level.actTwo)damageActTwoBoss(s,damage);else if(s.level.nightmareTrail)damageBellkeeper(s,damage);else b.hp-=damage;if(s.index===2)bargePartHit(s,target.part,damage);bossHitFeedback(s,shot.heavy);b.recoil=Math.sign(shot.vx)||p.dir;
    const sustained=shot.sustained||shot.heavy&&[2,4].includes(shot.kind);s.hitStop=Math.max(s.hitStop,shot.sustained?0:shot.heavy&&!sustained?.07:.035);s.shake=shot.sustained?0:shot.heavy&&!sustained?.22:.12;
    if(shot.popcorn)popcornImpact(s,shot,b);else if(shot.heavy||shot.kind>=6)specialImpact(s,shot,shot.heavy?(sustained?88:140):55);else burst(s,shot.x,shot.y,0,76);
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
  shot.previousX=shot.x;shot.previousY=shot.y;
  if(shot.organ&&shot.growthTime)shot.r=shot.fullRadius*organShotScale(shot);
  if(shot.kind==='ring'&&shot.arc!==undefined){const angle=shot.launchAngle+shot.arc*Math.sin(shot.age*3.7)*.68;shot.vx=Math.cos(angle)*shot.speed;shot.vy=Math.sin(angle)*shot.speed;}
  if(stepEmberFire(s,shot,dt)||stepHarlequinProjectile(s,shot,dt,additions)||stepBargeProjectile(s,shot,dt,additions)){/* Dedicated encounter projectiles own their motion. */}else if(shot.kind==='sound-wave')stepOrganWave(shot,dt);else if(shot.rain)stepOrganRain(shot,s,dt);else{shot.vy+=(shot.gravity||0)*dt;shot.x+=shot.vx*dt;shot.y+=shot.vy*dt;}
  clearPowerProjectiles(s,s.shots,[shot]);if(shot.life<=0)continue;
  if(resolveVillageProjectile(s,shot,playerBody(p)))continue;
  if(s.level.actTwo&&(shot.actTwo||shot.village)&&shot.kind!=='witch-puddle'&&shot.y>=(shot.floor??groundY(s.level.route||s.platforms,shot.x))-5){shot.life=0;s.effects.push({x:shot.x,y:shot.y,row:2,size:58,age:0,life:.32});continue;}
  igniteEmberFromAttack(s,shot);
  if(landEmberFire(s,shot))continue;
  if(shot.organ&&(shot.x<s.level.arena.left-60||shot.x>s.level.arena.right+60)){shot.life=0;continue;}
  limitBombFire(shot);if(shot.life<=0)continue;
  if(shot.kind==='ember-blast'&&!emberBlastHitbox(shot))continue;
  if(isHarlequinFireHazard(shot)&&!shot.damaging)continue;
  if(shot.rain&&shot.rain!=='fall')continue;
  if(shot.rain&&shot.y>shot.floor){shot.life=0;burst(s,shot.x,shot.floor-8,1,38);continue;}
  if(shot.organ&&shot.kind==='note'&&!shot.rain&&shot.y>shot.floor){shot.life=0;burst(s,shot.x,shot.floor-8,1,38);continue;}
  if(decoyBlocks(s,shot))continue;
  if(ribbonReflect(s,shot))continue;
  if(!['ember-blast','ember-breath','fort-breath'].includes(shot.kind)&&!isHarlequinFireHazard(shot)&&guardBlocks(s,shot)){villageFireImpact(s,shot);continue;}
  if(shot.kind==='clown'&&shot.floor!==undefined&&shot.y>=shot.floor-8&&shot.vy>0){shot.life=0;if(s.enemies.filter(e=>e.hp>0&&e.x>=s.level.arena.left).length<8){const e=makeEnemy(shot.x,shot.floor,6,s.boss.turn);e.y=shot.floor-12;s.enemies.push(e);}burst(s,shot.x,shot.floor-10,1,44);}
  else if(shot.kind==='bomb'&&shot.y>shot.floor-12){shot.life=0;if(shot.carpet&&Math.hypot(p.x-shot.x,p.y-20-shot.floor+12)<52*BOMB_SCALE*EXPLOSION_SCALE)hurt(s,false,1,false,shot);const fire=bombFlames(shot);fire.forEach(limitBombFire);additions.push(...fire.filter(q=>q.life>0));particles(s,shot.x,shot.y,'#ffb674',10);burst(s,shot.x,shot.y,1,(shot.carpet?110:145)*BOMB_SCALE);s.events.push('impact');}
  else if(shot.bounce&&shot.y>shot.floor-12){shot.y=shot.floor-12;shot.vy=-190;shot.bounce--;}
  if(shot.life>0&&(shot.villagePlayerHit||overlap(playerBody(p),emberBlastHitbox(shot)||emberBreathHitbox(shot)||harlequinFireHitbox(shot)||bargeWaterHitbox(shot,p)||{x:shot.x-shot.r,y:shot.y-shot.r,w:shot.r*2,h:shot.r*2}))){
   if(['ember-breath','fort-breath'].includes(shot.kind)&&p.guarding&&p.dir===-shot.dir){
    if(shot.age<(shot.nextGuardAt||0))continue;
    if(guardBlocks(s,{...shot,x:p.x+p.dir*28,y:p.y-36,r:25})){shot.nextGuardAt=shot.age+.3;continue;}
   }
   const hearts=s.hearts;hurt(s,false,1,false,shot);
   if(shot.kind==='ember-blast'){if(s.hearts<hearts)shot.life=0;}
   else if(!isHarlequinFireHazard(shot)&&!['barge-jet','barge-spout','ember-breath','fort-breath','witch-puddle'].includes(shot.kind)){shot.life=0;villageFireImpact(s,shot);if(shot.ember)burstEmberProjectile(s,shot);else if(shot.harlequin)fireImpact(s,shot.x,shot.y,.65);}
   if(impactKind(shot)==='water'&&s.hearts<hearts)waterSplash(s,p.x,p.y-30,115);
  }
 }
 s.shots=s.shots.filter(q=>q.life>0);s.hostile=[...s.hostile.filter(q=>q.life>0),...additions].slice(-140);
 stepWorldEffects(s,dt);
 if(s.done)return;
 if(p.x>s.level.exit[0]-45&&b.hp>0&&s.noticeTime<1)say(s,s.level.villageTrail?'villageSquare':'locked');
 if(b.trailHp>b.hp&&b.flash<.08)b.trailHp+=(b.hp-b.trailHp)*Math.min(1,dt*5);
 followAdventureCamera(s,dt);s.lastInput={...input};
}
