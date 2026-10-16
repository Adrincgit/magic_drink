import {test,expect} from '@playwright/test';
import {createAdventure,stepAdventure,retryAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {makeEnemy,enemyShot,updateEnemies} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {beginCandyCapture,stepCandyCapture,releaseWitchVictims,witchId,villageNight} from '../src/components/arcade/adventure/engine/villageRescue';
import {stepVillageEnemy,stepVillagers,villageEnemyDrawing,villageWitchMuzzle} from '../src/components/arcade/adventure/engine/adventureVillage';
import {groundY} from '../src/components/arcade/adventure/world/adventureTerrain';
const tick=(s,t,input={})=>{for(let i=0;i<t*120;i++)stepAdventure(s,input,1/120);};
function empty(){const s=createAdventure(7);s.enemies=[];s.villagers=[];s.hostile=[];return s;}
function cast(s){enemyShot(s,s.player.x+100,s.player.y-38,Math.PI,610,'candy-ray',{r:9,life:1.5,owner:'test',village:true});tick(s,.2);}
test('a real candy ray removes exactly one heart and locks actions until fresh input breaks it',()=>{
 const s=empty(),hp=s.hearts;cast(s);expect(s.hearts).toBe(hp-1);expect(s.player.candy).toBeTruthy();const x=s.player.x,ammo=s.ammo;
 tick(s,1,{right:true,attack:true,jump:true});expect(s.player.x).toBeCloseTo(x);expect(s.ammo).toBe(ammo);expect(s.player.candy.effort).toBe(1);
 for(let i=0;i<21;i++){tick(s,.04,{left:i%2===0,right:i%2!==0});}
 expect(s.player.candy).toBeUndefined();expect(s.hearts).toBe(hp-1);
});
test('captured Hexy remains vulnerable after the ordinary hit grace',()=>{
 const s=empty();cast(s);tick(s,1.6);expect(s.player.candy).toBeTruthy();const hp=s.hearts;
 enemyShot(s,s.player.x+22,s.player.y-25,Math.PI,150,'ball',{r:15,life:1});tick(s,.2);expect(s.hearts).toBe(hp-1);expect(s.player.candy).toBeTruthy();
});
test('the last heart leaves Hexy candy through game over; retry clears the curse',()=>{
 const s=empty();s.hearts=1;cast(s);expect(s.playerDefeat.state).toBe('candy');tick(s,2.2,{attack:true,left:true});
 expect(s.done).toBe(true);expect(s.won).toBe(false);expect(s.player.candy.terminal).toBe(true);
 retryAdventure(s);expect(s.player.candy).toBeUndefined();expect(s.playerDefeat).toBeUndefined();expect(s.hearts).toBe(s.maxHearts);
});
test('a shield protects against capture and a swept beam cannot tunnel through Hexy',()=>{
 const s=empty();s.shield=1;cast(s);expect(s.player.candy).toBeUndefined();expect(s.hearts).toBe(s.maxHearts);expect(s.shield).toBe(0);
 const fast=empty();enemyShot(fast,fast.player.x+40,fast.player.y-35,Math.PI,12000,'candy-ray',{r:9,life:1,village:true});stepAdventure(fast,{},1/60);expect(fast.player.candy).toBeTruthy();
});
test('only the responsible witch releases a victim during an interrupted absorption',()=>{
 const s=createAdventure(7),e=Object.assign(makeEnemy(600,480,26,20),{active:true,hp:3,timer:0}),other=makeEnemy(900,480,26,21),n=s.villagers[0];s.enemies=[e,other];s.villagers=[n];
 Object.assign(n,{x:700,y:480,state:'candy',curseOwner:witchId(e),age:0});stepVillageEnemy(s,e,.01,enemyShot);expect(e.phase).toBe('absorb');
 for(let i=0;i<120;i++)stepVillageEnemy(s,e,1/120,enemyShot);expect(n.state).toBe('absorbing');expect(e.hp).toBe(3);
 releaseWitchVictims(s,other);expect(n.state).toBe('absorbing');releaseWitchVictims(s,e);expect(n.state).toBe('rescue');expect(n.x).toBe(700);
 stepVillagers(s,.7);expect(n.state).toBe('flee');const x=n.x;stepVillagers(s,.2);expect(n.x).toBeLessThan(x);
});
test('damage interrupts absorption without losing the hostage',()=>{
 const s=createAdventure(7),e=Object.assign(makeEnemy(600,480,26),{active:true,hp:3,timer:0}),n=s.villagers[0];s.villagers=[n];
 Object.assign(n,{x:700,y:480,state:'candy',curseOwner:witchId(e)});stepVillageEnemy(s,e,.01,enemyShot);stepVillageEnemy(s,e,1,enemyShot);expect(n.state).toBe('absorbing');e.flash=.2;stepVillageEnemy(s,e,.01,enemyShot);
 expect(n.state).toBe('candy');expect(n.x).toBe(700);expect(e.hp).toBe(3);expect(e.phase).toBe('recover');
});
test('a real lethal hit frees that witch victims through the shared combat path',()=>{
 const s=createAdventure(7),e=Object.assign(makeEnemy(230,480,26,3),{hp:.5,active:false,timer:99}),n=s.villagers[0];s.enemies=[e];s.villagers=[n];Object.assign(n,{x:400,state:'candy',curseOwner:witchId(e)});s.player.hurt=99;
 tick(s,1,{attack:true});expect(e.defeated).toBe(true);expect(['rescue','flee']).toContain(n.state);
});
test('flying witches cast down and broken brooms fall onto actual terrain',()=>{
 const s=empty(),e=Object.assign(makeEnemy(500,480,26,2),{flying:true,flightHeight:170,active:true,timer:0});s.enemies=[e];stepVillageEnemy(s,e,.01,enemyShot);stepVillageEnemy(s,e,1.11,enemyShot);
 expect(villageEnemyDrawing(e).key).toBe('village-witch-air-v7');expect(villageEnemyDrawing(e).frame).toBe(9);const tip=villageWitchMuzzle(e);expect(s.hostile[0].x).toBe(tip.x);expect(s.hostile[0].y).toBe(tip.y);expect(e.y).toBeLessThan(e.baseY-130);expect(s.hostile[0].vy).toBeGreaterThan(0);e.hp=0;e.defeated=true;releaseWitchVictims(s,e);const y=e.y;
 for(let i=0;i<120;i++)updateEnemies(s,1/120,()=>({x:0,y:0,w:1,h:1}),()=>{});
 expect(e.witchFall.landed).toBe(true);expect(e.y).toBe(groundY(s.level.route,e.x));expect(e.y).toBeGreaterThan(y);
});
test('crowd escalates toward town, a neighbor helps a fallen person, and carriages flee',()=>{
 const s=createAdventure(7);expect(s.villagers.length).toBeGreaterThan(90);expect(s.level.villageStart).toBe(7300);expect(s.level.width).toBe(23240);expect(s.carriages).toHaveLength(1);
 const [a,b]=s.villagers.filter(q=>q.group===1).slice(1,3);s.villagers=[a,b];s.player.x=a.x-150;Object.assign(a,{state:'fallen',age:0,x:2100,y:480});Object.assign(b,{state:'flee',x:2150,trip:false});
 stepVillagers(s,.01);expect(a.helped).toBe(true);expect(b.state).toBe('help');stepVillagers(s,.9);expect(a.state).toBe('flee');expect(b.state).toBe('flee');
 s.player.x=s.carriages[0].wakeX;const x=s.carriages[0].x;stepVillagers(s,.5);expect(s.carriages[0].x).toBeLessThan(x-100);
});
test('night arrives just beyond half way and cannot flicker back when reversing',()=>{
 const s=empty();expect(villageNight(s)).toBe(0);s.player.x=s.level.width*.53;stepVillagers(s,.01);expect(villageNight(s)).toBe(1);s.player.x=800;stepVillagers(s,.01);expect(villageNight(s)).toBe(1);
 tick(s,1);expect(s.camera.y).toBeCloseTo(40,1);
});
test('ordinary defeat still falls and checkpoint retries do not orphan candy hostages',()=>{
 const s=empty();s.hearts=1;enemyShot(s,s.player.x+25,s.player.y-30,Math.PI,160,'ball',{r:15,life:1});tick(s,.1);expect(s.playerDefeat.state).toBe('fall');expect(s.player.candy).toBeUndefined();tick(s,4);expect(s.done).toBe(true);
 const q=createAdventure(7),witch=q.enemies.find(e=>e.type===26),npc=q.villagers[0];Object.assign(npc,{state:'absorbed',curseOwner:witchId(witch),candyHomeX:witch.x-80});q.checkpointAt=q.level.checkpoints[3];retryAdventure(q);expect(npc.curseOwner).toBeTruthy();const restored=q.villagers.find(n=>n.id===npc.id);expect(restored.state).toBe('rescue');expect(restored.curseOwner).toBeUndefined();
});
