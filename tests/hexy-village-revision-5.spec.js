import {test,expect} from '@playwright/test';
import {createAdventure,stepAdventure,retryAdventure,playerBody} from '../src/components/arcade/adventure/engine/adventureModel';
import {makeEnemy,enemyShot,updateEnemies} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {enemyGeometry} from '../src/components/arcade/adventure/actors/enemies/adventureEnemyGeometry';
import {stepVillageEnemy,resolveVillageProjectile} from '../src/components/arcade/adventure/engine/adventureVillage';
import {witchId,releaseWitchVictims} from '../src/components/arcade/adventure/engine/villageRescue';
import {spawnSoulPumpkin,pumpkinId,beginPumpkinDefeat} from '../src/components/arcade/adventure/engine/villagePumpkins';
import {stepVillageResistance,hitVillageRubble} from '../src/components/arcade/adventure/engine/villageResistance';
import {groundY} from '../src/components/arcade/adventure/world/adventureTerrain';
const tick=(s,seconds,input={})=>{for(let i=0;i<seconds*120;i++)stepAdventure(s,input,1/120);};
const setup=()=>{const s=createAdventure(7);s.enemies=[];s.hostile=[];s.player.hurt=999;s.villageRubble=[];return s;};

test('witch is 10 percent larger and survives 15 percent more damage',()=>{
 const e=makeEnemy(500,480,26);expect(e.hp).toBe(11.5);expect(e.maxHp).toBe(11.5);expect(enemyGeometry(e).size).toBe(198);
});
test('absorption heals once and transfers the exact victim into one released pumpkin',()=>{
 const s=setup(),e=Object.assign(makeEnemy(600,480,26,4),{active:true,hp:4,timer:0}),q=s.villagers[0];s.enemies=[e];s.villagers=[q];Object.assign(q,{state:'candy',x:480,y:480,curseOwner:witchId(e),age:0});
 for(let i=0;i<380;i++)stepVillageEnemy(s,e,1/120,enemyShot);
 const pumpkins=s.enemies.filter(e=>e.type===27);expect(pumpkins).toHaveLength(1);expect(e.hp).toBe(7);expect(q.state).toBe('carried');expect(q.curseOwner).toBe(pumpkinId(pumpkins[0]));expect(pumpkins[0].carriedId).toBe(q.id);
 releaseWitchVictims(s,e);expect(q.state).toBe('carried');expect(pumpkins[0].hp).toBeGreaterThan(0);
});
test('taking damage before consumption does not cancel a witch ritual',()=>{
 const s=setup(),e=Object.assign(makeEnemy(600,480,26),{active:true,timer:0}),q=s.villagers[0];s.enemies=[e];s.villagers=[q];Object.assign(q,{state:'candy',x:480,y:480,curseOwner:witchId(e),age:0});
 stepVillageEnemy(s,e,.01,enemyShot);expect(e.phase).toBe('absorb');stepVillageEnemy(s,e,1,enemyShot);e.flash=.2;stepVillageEnemy(s,e,.01,enemyShot);
 expect(q.state).toBe('absorbing');expect(q.x).toBeGreaterThan(480);expect(e.phase).toBe('absorb');expect(s.enemies.filter(e=>e.type===27)).toHaveLength(0);expect(e.hp).toBe(11.5);
});

test('damage after consumption neither cancels nor prematurely releases the pumpkin',()=>{
 const s=setup(),e=Object.assign(makeEnemy(600,480,26),{active:true,timer:0,hp:4}),q=s.villagers[0];s.enemies=[e];s.villagers=[q];Object.assign(q,{state:'candy',x:480,y:480,curseOwner:witchId(e),age:0});
 for(let i=0;i<280;i++)stepVillageEnemy(s,e,1/120,enemyShot);
 expect(q.state).toBe('absorbed');expect(e.hp).toBe(7);e.flash=.2;stepVillageEnemy(s,e,.01,enemyShot);
 expect(q.state).toBe('absorbed');expect(s.enemies.filter(e=>e.type===27)).toHaveLength(0);
 for(let i=0;i<90;i++)stepVillageEnemy(s,e,1/120,enemyShot);
 expect(q.state).toBe('carried');expect(s.enemies.filter(e=>e.type===27)).toHaveLength(1);
 stepVillageEnemy(s,e,.01,enemyShot);expect(s.enemies.filter(e=>e.type===27)).toHaveLength(1);expect(e.hp).toBe(7);
});

test('a missed ghost flame bursts on the terrain instead of crossing beneath the street',()=>{
 const s=setup();s.villagers=[];const x=8000,y=groundY(s.level.route,x),shot={kind:'soul-flame',village:true,life:1,x,y,previousX:x-5,previousY:y-15};
 expect(resolveVillageProjectile(s,shot,{x:0,y:0,w:10,h:10})).toBe(true);expect(shot.life).toBe(0);expect(s.villageFire.at(-1).kind).toBe('soul-impact');
});
test('pumpkin fire transforms a civilian, with ownership independent of its former witch',()=>{
 const s=setup(),q=s.villagers[0],other=s.villagers[1],e=spawnSoulPumpkin(s,makeEnemy(500,480,26),q);s.villagers=[q,other];Object.assign(e,{active:true,phase:'patrol',phaseAge:0,timer:0});Object.assign(other,{x:300,y:480,state:'trapped'});
 stepVillageEnemy(s,e,.01,enemyShot);stepVillageEnemy(s,e,.66,enemyShot);expect(s.hostile[0].kind).toBe('soul-flame');expect(s.hostile[0].owner).toBe(pumpkinId(e));
 const shot={...s.hostile[0],previousX:350,previousY:430,x:250,y:430};expect(resolveVillageProjectile(s,shot,{x:0,y:0,w:1,h:1})).toBe(true);expect(other.state).toBe('turning');expect(other.curseOwner).toBe(pumpkinId(e));
});
test('pumpkin destruction falls first, releases all its captives once on landing, then they flee',()=>{
 const s=setup(),q=s.villagers[0],other=s.villagers[1],e=spawnSoulPumpkin(s,makeEnemy(500,480,26),q);s.villagers=[q,other];e.y=250;Object.assign(other,{state:'candy',curseOwner:pumpkinId(e),x:300,y:480});
 e.hp=0;e.defeated=true;beginPumpkinDefeat(s,e);updateEnemies(s,.1,playerBody,()=>{});expect(q.state).toBe('carried');expect(e.pumpkinFall.landed).toBe(false);
 for(let i=0;i<180;i++)updateEnemies(s,1/120,playerBody,()=>{});
 expect(e.pumpkinFall.landed).toBe(true);expect(e.y).toBe(groundY(s.level.route,e.x));expect(q.state).toBe('rescue');expect(other.state).toBe('rescue');expect(s.village.rescued).toBe(2);
 const x=q.x;tick(s,1);expect(q.state).toBe('flee');expect(q.x).toBeLessThan(x);expect(s.village.rescued).toBe(2);
});
test('actual player shots break a pumpkin through the shared defeat path and release its villager',()=>{
 const s=setup(),q=s.villagers[0],e=spawnSoulPumpkin(s,makeEnemy(260,480,26),q);s.villagers=[q];Object.assign(e,{x:240,home:240,y:445,phase:'patrol',phaseAge:0,flightHeight:35,timer:99});
 tick(s,3.5,{attack:true});expect(e.defeated).toBe(true);expect(e.pumpkinFall?.landed).toBe(true);expect(['rescue','flee','safe']).toContain(q.state);
});
test('ghost fire traps Hexy like the witch spell and obeys last-heart candy defeat',()=>{
 const s=setup();s.villagers=[];s.player.hurt=0;s.hearts=1;enemyShot(s,s.player.x+40,s.player.y-35,Math.PI,250,'soul-flame',{r:13,life:2,village:true,owner:'pumpkin:test'});tick(s,.3);
 expect(s.hearts).toBe(0);expect(s.player.candy).toBeTruthy();expect(s.playerDefeat.state).toBe('candy');
});
test('rubble rescues require damage and never award twice',()=>{
 for(const mode of ['shot']){
  const s=createAdventure(7),r=s.villageRubble[0],q=s.villagers.find(n=>n.id===r.villager);s.enemies=[];Object.assign(q,{state:'trapped',x:r.x,y:r.y});
  if(mode==='near'){s.player.x=r.x-40;s.player.y=r.y;for(let i=0;i<120;i++)stepVillageResistance(s,1/120,()=>{});}else hitVillageRubble(s,{x:r.x,y:r.y-30,damage:4,kind:0,life:1},1);
  expect(r.freed).toBe(true);expect(q.state).toBe('recover');expect(s.village.rescued).toBe(1);hitVillageRubble(s,{x:r.x,y:r.y-30,damage:4,life:1},1);expect(s.village.rescued).toBe(1);
 }
});
test('adult defenders throw damaging stones while retreating, then join the escape',()=>{
 const s=setup(),q=s.villagers.find(n=>n.defender);s.villagers=[q];Object.assign(q,{x:300,y:480,state:'flee',age:0});s.player.x=200;s.enemies=[Object.assign(makeEnemy(560,480,18),{timer:99})];const hp=s.enemies[0].hp;
 for(let i=0;i<430;i++)stepVillageResistance(s,1/120,()=>{});
 expect(q.stonesThrown).toBe(3);expect(s.enemies[0].hp).toBeLessThan(hp);expect(q.x).toBeLessThan(300);expect(q.state).toBe('flee');
});
test('checkpoint retry cannot leave a victim in a removed dynamic pumpkin',()=>{
 const s=createAdventure(7),q=s.villagers[0];spawnSoulPumpkin(s,makeEnemy(500,480,26),q);s.checkpointAt=s.level.checkpoints[2];retryAdventure(s);
 const n=s.villagers.find(n=>n.id===q.id);expect(n.state).toBe('rescue');expect(n.curseOwner).toBeUndefined();
});
