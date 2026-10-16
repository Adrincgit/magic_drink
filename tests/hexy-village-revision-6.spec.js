import {test,expect} from '@playwright/test';
import {createAdventure,stepAdventure,retryAdventure,playerBody} from '../src/components/arcade/adventure/engine/adventureModel';
import {makeEnemy,enemyShot} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {beginCandyCapture,stepCandyCapture,releaseWitchVictims,witchId,CANDY_ESCAPE_PRESSES} from '../src/components/arcade/adventure/engine/villageRescue';
import {stepVillageEnemy,stepVillagers,resolveVillageProjectile} from '../src/components/arcade/adventure/engine/adventureVillage';
import {clearPowerProjectiles} from '../src/components/arcade/adventure/engine/adventureDefense';
import {firePopcorn} from '../src/components/arcade/adventure/engine/adventurePopcorn';
import {voltBurst} from '../src/components/arcade/adventure/engine/adventureVolt';
import {hexyMuzzle} from '../src/components/arcade/adventure/actors/hexy/hexyAnimation';
import {groundY} from '../src/components/arcade/adventure/world/adventureTerrain';
const tick=(s,t,input={})=>{for(let i=0;i<t*120;i++)stepAdventure(s,input,1/120);};
const quiet=(index=7)=>{const s=createAdventure(index);s.enemies=[];s.hostile=[];s.villagers=[];s.villageRubble=[];s.villageObstacles=[];s.platforms=s.platforms.filter(q=>!q.villageObstacle);s.player.hurt=999;return s;};
const captive=()=>{const s=quiet(),x=7900;Object.assign(s.player,{x,y:groundY(s.level.route,x),ground:null});s.camera.x=x-300;const e=Object.assign(makeEnemy(x+350,groundY(s.level.route,x+350),26,30),{active:true,timer:-1});s.enemies=[e];beginCandyCapture(s,{kind:'candy-ray',owner:witchId(e)});s.player.candy.age=1.1;return{s,e};};

test('candy escape requires 21 fresh presses and holding a button cannot substitute for them',()=>{
 const s=quiet();beginCandyCapture(s,{kind:'lantern-soul'});for(let i=0;i<120;i++)stepCandyCapture(s,{attack:true},1/120);expect(s.player.candy.effort).toBe(1);
 stepCandyCapture(s,{},.01);s.player.candy.effort=0;
 for(let i=0;i<20;i++)stepCandyCapture(s,{left:i%2===0,right:i%2!==0},.05);
 expect(s.player.candy.effort).toBe(20);expect(CANDY_ESCAPE_PRESSES).toBe(21);stepCandyCapture(s,{left:true},.05);expect(s.player.candy).toBeUndefined();
});

test('a captured Hexy travels above the ground toward the witch and can escape during the pull',()=>{
 const {s,e}=captive(),start=s.player.x,hp=s.hearts;tick(s,2.5);
 expect(e.phase).toBe('absorb-player');expect(s.player.x).toBeGreaterThan(start+80);expect(s.player.y).toBeLessThan(groundY(s.level.route,s.player.x)-30);expect(s.player.candy.absorbProgress).toBeGreaterThan(.4);
 for(let i=0;i<21;i++)tick(s,.04,{left:i%2===0,right:i%2!==0});expect(s.player.candy).toBeUndefined();expect(e.phase).toBe('recover');expect(s.hearts).toBe(hp);expect(s.playerDefeat).toBeUndefined();
});

test('an uninterrupted absorption transforms Hexy into a pumpkin and ends the run even with hearts remaining',()=>{
 const {s}=captive();expect(s.hearts).toBeGreaterThan(1);tick(s,7.2);
 expect(s.player.candy.pumpkin).toBe(true);expect(s.player.candy.terminal).toBe(true);expect(s.playerDefeat.state).toBe('pumpkin');expect(s.done).toBe(true);expect(s.won).toBe(false);expect(s.hearts).toBe(0);
 retryAdventure(s);expect(s.player.candy).toBeUndefined();expect(s.playerDefeat).toBeUndefined();expect(s.hearts).toBe(s.maxHearts);
});

test('defeating the absorbing witch drops the tether without instantly teleporting Hexy',()=>{
 const {s,e}=captive();tick(s,2);const x=s.player.x;e.hp=0;releaseWitchVictims(s,e);expect(s.player.candy.tether).toBeUndefined();tick(s,.3);expect(s.player.x).toBeCloseTo(x);expect(s.player.candy).toBeTruthy();expect(s.playerDefeat).toBeUndefined();
});

test('pumpkin clown ghost fire makes candy that a nearby different witch can absorb',()=>{
 const s=quiet(),clown=Object.assign(makeEnemy(8500,452,25,41),{active:true,timer:0}),witch=Object.assign(makeEnemy(8300,452,26,42),{active:true,timer:0,hp:4}),q={...s.level.villagers[0],x:8200,y:452,state:'trapped',age:0};s.player.x=8000;s.enemies=[clown,witch];s.villagers=[q];
 stepVillageEnemy(s,clown,.01,enemyShot);stepVillageEnemy(s,clown,.81,enemyShot);expect(s.hostile).toHaveLength(3);expect(s.hostile.every(q=>q.kind==='lantern-soul'&&q.element==='magic')).toBe(true);
 const shot={...s.hostile[1],previousX:8250,previousY:405,x:8150,y:405};expect(resolveVillageProjectile(s,shot,{x:0,y:0,w:1,h:1})).toBe(true);expect(q.state).toBe('turning');stepVillagers(s,1.21);expect(q.state).toBe('candy');
 for(let i=0;i<400;i++)stepVillageEnemy(s,witch,1/120,enemyShot);expect(q.state).toBe('carried');expect(witch.hp).toBe(7);expect(s.enemies.filter(e=>e.type===27)).toHaveLength(1);
});

test('a fast witch ray ends at its first terrain impact instead of crossing below the street',()=>{
 const s=quiet(),x=8200,y=groundY(s.level.route,x),q={kind:'candy-ray',life:1,village:true,previousX:x-200,previousY:y-160,x:x+200,y:y+180};
 expect(resolveVillageProjectile(s,q,{x:0,y:0,w:1,h:1})).toBe(true);expect(q.life).toBe(0);expect(q.x).toBeLessThan(x+100);expect(q.y).toBe(groundY(s.level.route,q.x)-8);expect(s.villageFire.at(-1).kind).toBe('ray-impact');
});

test('strong projectiles clear hostile magic across chapters, including Popcorn and hidden water probes',()=>{
 for(const index of [0,1,2,3,5,6,7])for(const attack of [{kind:0,heavy:true},{kind:13,popcornStrong:true},{kind:5,heavy:true,hidden:true,aquaProbe:true},{kind:10,powerClear:true}]){
  const s=quiet(index),q={x:300,y:400,r:12,life:1,...attack};s.hostile=['ball','note','bone','candy-ray','soul-flame','lantern-soul'].map(kind=>({kind,x:300,y:400,r:10,life:1}));clearPowerProjectiles(s,[q]);expect(s.hostile.every(h=>h.life===0),String(index)).toBe(true);
 }
});

test('ordinary Popcorn leaves bullets intact; the strong cast intercepts them through the real update',()=>{
 for(const index of [0,6,7])for(const strong of [false,true]){
  const s=quiet(index),h={kind:'note',x:260,y:400,vx:0,vy:0,r:10,age:0,life:2};s.hostile=[h];firePopcorn(s,{x:200,y:400},{x:1,y:0},1,strong);tick(s,.1);
  expect(h.life<=0).toBe(strong);if(strong)expect(s.effects.some(q=>q.drinkFx===13)).toBe(true);
 }
});

test('fast hostile bullets are intercepted after moving, before they can cross the player',()=>{
 const s=quiet(0);s.player.hurt=0;const y=s.player.y-40,x=s.player.x;s.shots=[{kind:0,heavy:true,x:x+100,y,vx:0,vy:0,r:10,age:0,life:1,damage:1,hits:[]}];enemyShot(s,x+210,y,Math.PI,24000,'ball',{r:5,life:1});stepAdventure(s,{},1/120);expect(s.hostile).toHaveLength(0);expect(s.hearts).toBe(s.maxHearts);
});

test('the strong Volt beam clears a bullet midway along its visible path',()=>{
 const s=quiet(0),m=hexyMuzzle(s),h={kind:'ball',x:m.x+250,y:m.y,r:9,life:1};s.player.aimX=1;s.player.aimY=0;s.hostile=[h];voltBurst(s,1);expect(h.life).toBe(0);
});
