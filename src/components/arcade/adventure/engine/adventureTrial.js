import {createAdventure,stepAdventure} from './adventureModel';
import {equipDrink,DRINK_SHOTS,grantStartingDrink,currentDrink} from './adventureAmmo';
import {makeEnemy,enemyShot} from '../actors/enemies/adventureEnemies';
import {takeLoot} from './adventureLoot';
import {beginRibbonDance,withRibbonLoadout} from './adventureRibbonState';

// A disposable simulation. Never reads or writes a wallet, run ticket or save.
export function createTrial(mod,level=1){
 const s=createAdventure(0,false,{trial:true,mods:[mod.id],modLevels:{[mod.id]:level},modCategorySlots:{drinks:3,boots:3,hat:3,skills:5},starterClaimed:true});
 s.level={...s.level,id:-1,themeStart:false,width:1900,arena:{entry:1700,left:1700,right:1900,y:480},boss:[1850,480],exit:[1880,480],shop:null,scenery:[],checkpoint:[1600,480]};
 s.platforms=[{x:0,y:480,baseX:0,baseY:480,w:1900,h:180,kind:'earth',dx:0,dy:0}];
 s.level.platforms=s.platforms;
 s.player.x=190;s.player.y=480;s.player.ground=0;s.camera={x:0,y:0,backdropY:0,zoom:1};s.boss.x=1850;s.boss.home=1850;
 s.enemies=[420,550,685].map((x,i)=>trialClown(x,i));
 s.stars=[];s.supplies=[];s.outposts=[];s.cages=[];s.hazards=[];s.pickups=[];s.noticeTime=0;s.rescued=0;
 s.trial={mod:mod.id,level,damage:0,defeats:0,spawnWait:0,serial:3,primary:mod.drink??-1,companion:mod.drink===7?0:-1,tentX:855};
 if(mod.drink!==undefined){s.starterClaimed=false;grantStartingDrink(s);}
 if(mod.drink===12||mod.id==='ribbon-duration'){s.player.x=220;beginRibbonDance(s);s.trial.primary=12;}
 if(mod.drink===10)for(const [i,e]of s.enemies.entries()){e.x=e.home=500+i*90;e.dir=-1;}
 if(mod.id==='double-pocket'){equipDrink(s,7);s.spareDrink={kind:0,ammo:54,capacity:54,tier:1};}
 if(mod.drink===7)s.spareDrink={kind:0,ammo:54,capacity:54,tier:1};
 if(mod.id==='reserve-sleeve')equipDrink(s,0);
 if(mod.id==='full-bubble')takeLoot(s,{type:'shield'});
 if(mod.id==='lasting-magic')takeLoot(s,{type:'original'});
 return s;
}
function trialClown(x,seed){const e=makeEnemy(x,480,0,seed);e.hp=e.maxHp=18;e.timer=99;e.practice=true;e.practiceLeft=330+seed%3*65;e.practiceRight=580+seed%3*65;return e;}
export function changeTrialDrink(s,kind){
 if(s.trial?.primary===12&&!s.ribbonDance){equipDrink(s,kind);s.trial.companion=kind;return;}
 if(s.ribbonDance){if(kind===12){beginRibbonDance(s);return;}withRibbonLoadout(s,()=>equipDrink(s,kind));s.trial.companion=kind;return;}
 s.voltBeam=null;s.placement=null;s.aquaJet=null;s.player.aquaChannel=false;
 if(s.trial?.primary>=0&&kind<0){s.trial.companion=-1;if(s.weapon!==s.trial.primary){const q=s.spareDrink;if(q?.kind===s.trial.primary)equipDrink(s,q.kind,q.ammo,q.tier,q.capacity);else equipDrink(s,s.trial.primary);}s.spareDrink=null;return;}
 if(s.trial?.primary>=0&&kind>=0&&kind!==s.trial.primary){
  s.trial.companion=kind;const capacity=DRINK_SHOTS[kind];
  if(s.weapon===s.trial.primary)s.spareDrink={kind,ammo:capacity,capacity,tier:1};
  else{if(s.spareDrink?.kind!==s.trial.primary){const primary=s.trial.primary;s.spareDrink={kind:primary,ammo:DRINK_SHOTS[primary]*2,capacity:DRINK_SHOTS[primary]*2,tier:1};}equipDrink(s,kind);}
 }else{if(s.weapon>=0&&s.weapon!==kind)s.spareDrink=currentDrink(s);equipDrink(s,kind);}
}
export function trialProjectile(s){if(s.trial.mod==='sky-guard')enemyShot(s,s.player.x,s.player.y-250,Math.PI/2,195,'streamer');else enemyShot(s,s.player.x+300,s.player.y-32,Math.PI,195,'streamer');}
export function trialDemoInput(s){
 const t=s.time,id=s.trial.mod,kind=Number(id.slice(8)),pulse=(start,duration=.06)=>t>=start&&t<start+duration;
 if(id==='spring-boots'){
  if(t<.04){s.player.x=s.enemies[0]?.x||420;s.player.y=285;s.player.ground=null;s.player.vy=160;}
  const next=s.enemies.filter(e=>e.hp>0&&!e.emerging).sort((a,b)=>Math.abs(a.x-s.player.x)-Math.abs(b.x-s.player.x))[0];return{left:next&&next.x<s.player.x-6,right:next&&next.x>s.player.x+6};
 }
 if(id==='comet-dive')return{jump:pulse(.25,.55),down:t>.82&&t<1.3,right:s.trial.level>=2&&t>.82&&t<1.3,dash:pulse(.85)};
 if(id==='double-dash')return{jump:pulse(.25,.6),right:t>.5&&t<1.7,dash:pulse(.55)||pulse(1.02)};
 if(id==='swift-step')return{right:t>.3&&t<1.3,left:t>1.6&&t<2.6};
 if(id==='enchanted-coaster')return{jump:pulse(.25,.4)||pulse(1.6,.3),coaster:pulse(1.05),right:t>1.7&&t<2.1};
 if(id==='reply-bell'||id==='gentle-guard'||id==='full-bubble'||id==='sky-guard'){
  if(!s.trial.fired&&t>.4){s.trial.fired=true;trialProjectile(s);}return{guard:id!=='full-bubble'&&t>(id==='sky-guard'?.95:1.66)&&t<3,up:id==='sky-guard'};
 }
 if(id==='confetti-step')return{dash:pulse(.5),left:t>1&&t<1.3};
 if(id==='encore-pocket')return{super:pulse(.5)};
 if(id==='grand-flourish')return{special:pulse(.5)};
 if(id==='double-pocket')return{attack:t>.4,swap:pulse(2.5)};
 if(kind===6||kind===10)return{special:t>.35&&t<1.05,right:t>.5&&t<.9||kind===6&&t>1.7&&t<2.3,attack:t>1.5,jump:kind===6&&pulse(2.8,.6)};
 if(kind===7){
  const ready=s.trial.level===3?2.35:1.7;return{special:pulse(.4)||(s.trial.level>=2&&pulse(1.1))||(s.trial.level===3&&pulse(1.8)),swap:pulse(ready),attack:t>ready+.3};
 }
 if(kind===8)return{special:pulse(.3)||pulse(5.6),attack:t>.85&&t<2.6,right:t>1&&t<1.5,left:t>2.2&&t<2.55};
 if(kind===9)return{attack:t>.3&&t<2.7,special:pulse(3.3)};
 if(kind===12||id==='ribbon-duration'){
  const demo=s.trial.ribbonDemo||'sky-dance';
  if(demo==='pull'||demo==='burst')return{[demo==='pull'?'attack':'special']:t>1&&t<1.7};
  if(demo==='airbind')return{attack:pulse(1),special:pulse(1.28)||pulse(2.25),jump:t>1.78&&t<2.3,right:t>1.8&&t<2};
  const seq={light:[[1,'x']],launch:[[1,'x'],[1.3,'y']],bind:[[1,'x'],[1.45,'x'],[1.9,'y']],
   'sky-dance':[[1,'x'],[1.3,'y'],[1.92,'x'],[2.35,'y']],
   'wand-toss':[[1,'y'],[1.65,'x'],[2.1,'y'],[2.8,'x']],
   'reel-slam':[[1,'x'],[1.45,'x'],[1.9,'y'],[3.1,'y']],
   sweep:[[1,'y'],[1.7,'y'],[2.4,'x'],[2.85,'x']]};
  const taps=seq[demo]||seq['sky-dance'];
  return{attack:taps.some(([at,k])=>k==='x'&&pulse(at)),special:taps.some(([at,k])=>k==='y'&&pulse(at))};
 }
 if(kind===11&&s.trial.level>=2)return{attack:t>.3&&t<2.1,special:pulse(2.5)||pulse(3.5)};
 return{attack:t>.3&&t<2.8,special:pulse(3.3)};
}
export function stepTrial(s,input,dt){
 const before=s.enemies.reduce((n,e)=>n+Math.max(0,e.hp),0);
 for(const e of s.enemies)e.timer=99;
 stepAdventure(s,input,dt);
 s.trial.damage+=Math.max(0,before-s.enemies.reduce((n,e)=>n+Math.max(0,e.hp),0));
 for(const e of s.enemies)if(e.hp<=0&&!e.practiceCounted){e.practiceCounted=true;s.trial.defeats++;}
 s.trial.spawnWait=Math.max(0,s.trial.spawnWait-dt);
 if(s.enemies.filter(e=>e.hp>0).length<3&&!s.trial.spawnWait){const e=trialClown(s.trial.tentX,s.trial.serial++);e.dir=-1;e.emerging=.7;e.practiceEntering=true;s.enemies.push(e);s.trial.spawnWait=1.4;s.trial.tentOpen=1.1;}
 s.trial.tentOpen=Math.max(0,(s.trial.tentOpen||0)-dt);
 if(s.weapon<0&&!s.trial.refillAt)s.trial.refillAt=s.time+1.2;
 if(s.weapon>=0)s.trial.refillAt=0;
 if(s.trial.refillAt&&s.time>=s.trial.refillAt){if(s.trial.primary!==12&&s.lastDrink>=0)equipDrink(s,s.lastDrink);s.trial.refillAt=0;}
 s.hearts=s.maxHearts;
 s.camera={x:Math.max(0,Math.min(940,s.player.x-300)),y:0,backdropY:0,zoom:1};
 s.player.x=Math.max(35,Math.min(1450,s.player.x));
}
