import {test,expect} from '@playwright/test';
import {createAdventure,stepAdventure,retryAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {makeEnemy,enemyShot} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {stepVillageEnemy,prepareVillage} from '../src/components/arcade/adventure/engine/adventureVillage';
import {beginCandyCapture,stepCandyCapture,stepWitchAbsorption,releaseWitchVictims,witchId} from '../src/components/arcade/adventure/engine/villageRescue';
import {spawnSoulPumpkin,pumpkinId,SOUL_PUMPKIN_LIMIT,beginPumpkinDefeat,stepFallingPumpkin} from '../src/components/arcade/adventure/engine/villagePumpkins';
import {stepVillageCandyTimeout} from '../src/components/arcade/adventure/engine/villageCandyTimeout';
import {groundY} from '../src/components/arcade/adventure/world/adventureTerrain';

function setup(count=4,type=26){
 const s=createAdventure(7),x=9000,y=groundY(s.level.route,x);
 Object.assign(s.player,{x:x-330,y,ground:null,hurt:999});s.camera.x=x-550;
 s.hostile=[];s.villageObstacles=[];s.villageRubble=[];s.carriages=[];s.platforms=s.platforms.filter(q=>!q.villageObstacle);
 const e=Object.assign(makeEnemy(x,y,type,71),{active:true,timer:0,phase:'patrol',phaseAge:0,hp:4,harvestStage:1,observedHp:4});
 s.enemies=[e];s.villagers=Array.from({length:count},(_,i)=>({...s.level.villagers[i%s.level.villagers.length],id:'group-'+i,state:'candy',x:x-460+i*90,y,age:0,curseAge:0,active:false,warning:false,defender:false}));
 return{s,e};
}
function ritual(s,e,seconds){for(let i=0;i<Math.ceil(seconds*120);i++){e.phaseAge+=1/120;stepWitchAbsorption(s,e,1/120);}}
const shells=s=>s.enemies.filter(e=>e.type===27&&!e.orbitEscort&&e.hp>0);
const tick=(s,t,input={})=>{for(let i=0;i<Math.ceil(t*120);i++)stepAdventure(s,input,1/120);};

for(const type of [26,28])test(`witch ${type} pulls every nearby candy together and releases exactly one distinct shell per person`,()=>{
 const {s,e}=setup(6,type),starts=s.villagers.map(q=>q.x);s.villagers.push({...s.villagers[0],id:'distant',x:e.x+700});
 ritual(s,e,.02);expect(s.villagers.slice(0,6).every(q=>q.state==='absorbing')).toBe(true);expect(s.villagers[6].state).toBe('candy');
 ritual(s,e,1.3);expect(s.villagers.slice(0,6).every((q,i)=>q.x!==starts[i]&&q.y<s.player.y)).toBe(true);
 ritual(s,e,3);expect(shells(s)).toHaveLength(6);expect(new Set(shells(s).map(q=>q.carriedId)).size).toBe(6);
 expect(new Set(shells(s).map(q=>q.launchX)).size).toBe(6);expect(e.hp).toBe(Math.min(e.maxHp,22));
 for(const q of s.villagers.slice(0,6))expect(shells(s).find(p=>p.curseId===q.containerId)?.carriedId).toBe(q.id);
});

test('Hexy joins an existing group without restarting it; escape leaves the civilian pull running',()=>{
 const {s,e}=setup(3);ritual(s,e,1.2);const age=e.phaseAge,starts=s.villagers.map(q=>q.absorbStartedAt);
 beginCandyCapture(s,{kind:'candy-ray'});s.player.candy.age=1.1;stepCandyCapture(s,{},.1);
 expect(e.phaseAge).toBe(age);expect(s.player.candy.absorber).toBe(witchId(e));expect(s.villagers.map(q=>q.absorbStartedAt)).toEqual(starts);
 for(let i=0;i<21;i++)stepCandyCapture(s,{left:i%2===0,right:i%2===1},.02);
 expect(s.player.candy).toBeUndefined();expect(e.phase).toBe('absorb');ritual(s,e,2.4);expect(shells(s)).toHaveLength(3);
});

test('a group started by candy Hexy creates NPC shells plus her pumpkin and preserves defeat/retry',()=>{
 const {s,e}=setup(3);beginCandyCapture(s,{kind:'candy-ray'});s.player.candy.age=1.1;
 tick(s,1.3);expect(e.phase).toBe('absorb-player');expect(s.villagers.every(q=>q.state==='absorbing')).toBe(true);expect(s.player.candy.absorbProgress).toBeGreaterThan(0);
 tick(s,3.6);expect(shells(s)).toHaveLength(4);expect(shells(s).filter(q=>q.playerSoul)).toHaveLength(1);expect(s.playerDefeat.state).toBe('pumpkin');
 const x=s.player.x;tick(s,1.85);expect(s.player.x).not.toBe(x);expect(s.done).toBe(true);expect(s.won).toBe(false);
 retryAdventure(s);expect(s.player.candy).toBeUndefined();expect(s.enemies.some(e=>e.playerSoul)).toBe(false);
});

test('two witches cannot claim or multiply the same nearby candies; newly transformed candy joins the ongoing spell',()=>{
 const {s,e}=setup(4),other=Object.assign(makeEnemy(e.x+100,e.y,26,72),{active:true,timer:0,phase:'patrol',phaseAge:0});s.enemies.push(other);
 stepVillageEnemy(s,e,.01,enemyShot);stepVillageEnemy(s,other,.01,enemyShot);expect(s.villagers.every(q=>q.curseOwner===witchId(e))).toBe(true);
 ritual(s,e,1);const late={...s.villagers[0],id:'late',state:'candy',x:e.x-250,y:s.player.y,absorbHealed:false};s.villagers.push(late);
 ritual(s,e,.1);expect(late.state).toBe('absorbing');expect(late.absorbStartedAt).toBeGreaterThan(1);ritual(s,e,4);
 expect(shells(s)).toHaveLength(5);expect(new Set(shells(s).map(q=>q.carriedId)).size).toBe(5);
});

test('damage keeps the entire pull running; only defeating the witch rescues her retained victims',()=>{
 const {s,e}=setup(5),starts=s.villagers.map(q=>q.x);ritual(s,e,1.3);e.flash=.2;stepVillageEnemy(s,e,.01,enemyShot);
 expect(s.villagers.every(q=>q.state==='absorbing')).toBe(true);expect(s.villagers.map(q=>q.x)).not.toEqual(starts);expect(e.phase).toBe('absorb');expect(shells(s)).toHaveLength(0);
 ritual(s,e,1);e.hp=0;releaseWitchVictims(s,e);
 expect(s.villagers.every(q=>q.state==='rescue')).toBe(true);expect(s.village.rescued).toBe(5);
});

test('post-consumption damage respects the launch timing and a trap cannot cancel a running ritual',()=>{
 const {s,e}=setup(4);ritual(s,e,2.3);expect(s.villagers.every(q=>q.state==='absorbed')).toBe(true);e.flash=.2;stepVillageEnemy(s,e,.01,enemyShot);
 expect(shells(s)).toHaveLength(0);ritual(s,e,1.2);expect(shells(s)).toHaveLength(4);
 const b=setup(4);ritual(b.s,b.e,1.2);b.e.trap=2;for(let i=0;i<300;i++)stepVillageEnemy(b.s,b.e,1/120,enemyShot);expect(b.s.villagers.every(q=>q.state==='carried')).toBe(true);expect(shells(b.s)).toHaveLength(4);
});

for(const type of [26,28])test(`real damage does not detach Hexy or her group from witch ${type}; a lethal hit does`,()=>{
 const {s,e}=setup(3,type);beginCandyCapture(s,{kind:'candy-ray'});s.player.candy.age=1.1;tick(s,1.2);
 const shoot=damage=>s.shots.push({kind:0,x:e.x,y:e.y-60,vx:0,vy:0,r:16,life:.2,age:0,damage,hits:[]});
 const hp=e.hp,progress=s.player.candy.absorbProgress;shoot(1);tick(s,.04);expect(e.hp).toBeLessThan(hp);expect(e.hp).toBeGreaterThan(0);expect(s.player.candy.absorber).toBe(witchId(e));expect(s.player.candy.absorbProgress).toBeGreaterThanOrEqual(progress);expect(s.villagers.every(q=>q.state==='absorbing')).toBe(true);
 shoot(1000);tick(s,.15);expect(e.hp).toBe(0);expect(s.player.candy.absorber).toBeUndefined();expect(s.player.candy.tether).toBeUndefined();expect(s.villagers.every(q=>q.state==='rescue')).toBe(true);
});

test('capacity queues excess victims without losing them, then consumes exactly the next one when a slot opens',()=>{
 const {s,e}=setup(3);
 for(let i=0;i<SOUL_PUMPKIN_LIMIT-1;i++)spawnSoulPumpkin(s,e,{id:'existing-'+i});
 ritual(s,e,4);expect(shells(s)).toHaveLength(SOUL_PUMPKIN_LIMIT);expect(s.villagers.filter(q=>q.state==='carried')).toHaveLength(1);
 const first=shells(s)[0];first.hp=0;ritual(s,e,.4);expect(shells(s)).toHaveLength(SOUL_PUMPKIN_LIMIT);expect(s.villagers.filter(q=>q.state==='carried')).toHaveLength(2);
 const pending=s.villagers.find(q=>q.state!=='carried');pending.curseAge=29.95;stepVillageCandyTimeout(s,pending,.1);expect(pending.state).toBe('rescue');
 ritual(s,e,.2);expect(shells(s)).toHaveLength(SOUL_PUMPKIN_LIMIT);expect(e.phase).toBe('recover');
});

test('one captive timing out does not cancel the others or Hexy, and every broken shell returns its own person',()=>{
 const {s,e}=setup(3);ritual(s,e,1);beginCandyCapture(s,{kind:'candy-ray'});s.player.candy.age=1.1;stepCandyCapture(s,{},.01);
 const freed=s.villagers[0];freed.curseAge=29.9;stepVillageCandyTimeout(s,freed,.2);expect(freed.state).toBe('rescue');expect(e.phase).toBe('absorb');
 expect(s.player.candy.absorber).toBe(witchId(e));ritual(s,e,2.6);expect(shells(s)).toHaveLength(2);
 for(const shell of shells(s)){shell.hp=0;beginPumpkinDefeat(s,shell);for(let i=0;i<360;i++)stepFallingPumpkin(s,shell,1/120);expect(s.villagers.find(q=>q.id===shell.carriedId).state).toBe('rescue');}
 expect(s.village.rescued).toBe(3);
});

test('retry drops stale batch trajectories even when the reconstructed witch still exists',()=>{
 const s=createAdventure(7),e=s.enemies.find(e=>e.type===26),q=s.villagers[0];
 Object.assign(e,{active:true,phase:'patrol',timer:0});s.villagers=[q];Object.assign(q,{state:'candy',x:e.x-100,y:e.y,age:0});ritual(s,e,2.3);expect(q.state).toBe('absorbed');
 prepareVillage(s);const retained=s.villagers.find(n=>n.id===q.id);expect(retained.state).toBe('candy');expect(retained.absorbFrom).toBeUndefined();expect(Number.isFinite(retained.x)).toBe(true);
});
