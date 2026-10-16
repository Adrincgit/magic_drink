import {test,expect} from '@playwright/test';
import {createAdventure,stepAdventure,retryAdventure,playerBody} from '../src/components/arcade/adventure/engine/adventureModel';
import {stepVillageEnemy,resolveVillageProjectile} from '../src/components/arcade/adventure/engine/adventureVillage';
import {makeEnemy,updateEnemies} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {enemyGeometry} from '../src/components/arcade/adventure/actors/enemies/adventureEnemyGeometry';
import {spawnWitchOrbit,villageEnemyOrder} from '../src/components/arcade/adventure/engine/villageOrbit';
import {releaseWitchVictims,witchId} from '../src/components/arcade/adventure/engine/villageRescue';
import {groundY,groundAt} from '../src/components/arcade/adventure/world/adventureTerrain';
const tick=(s,time,input={})=>{for(let i=0;i<time*120;i++)stepAdventure(s,input,1/120);};
function quiet(){const s=createAdventure(7);s.enemies=[];s.villagers=[];s.villageRubble=[];s.villageObstacles=[];s.platforms=s.platforms.filter(q=>!q.villageObstacle);s.carriages=[];s.player.hurt=999;return s;}
function place(s,x){Object.assign(s.player,{x,y:groundY(s.level.route,x),ground:s.platforms.indexOf(groundAt(s.platforms,x))});}

test('selected witches arrive with exactly three independent, revolving targets and never regrow a destroyed escort',()=>{
 const s=createAdventure(7),special=s.enemies.filter(e=>e.conjurer);expect(special).toHaveLength(2);expect(special.every(e=>e.flying)).toBe(true);
 const e=special[0];s.enemies=[e];s.villagers=[];s.villageObstacles=[];s.platforms=s.platforms.filter(q=>!q.villageObstacle);place(s,e.x-300);tick(s,.04);
 const orbs=s.enemies.filter(q=>q.orbitParent===witchId(e));expect(orbs).toHaveLength(3);expect(new Set(orbs.map(q=>q.curseId)).size).toBe(3);expect(orbs.every(q=>q.hp===3&&enemyGeometry(q).size<100)).toBe(true);
 const first=orbs.map(q=>q.x-e.x);tick(s,.9);expect(orbs.some((q,i)=>Math.abs(q.x-e.x-first[i])>30)).toBe(true);
 const ordered=villageEnemyOrder([e,...orbs]);for(const q of orbs)expect(ordered.indexOf(q)<ordered.indexOf(e)).toBe(q.orbitDepth<0);
 const victim=orbs.find(q=>Math.abs(q.x-e.x)>80);s.shots.push({x:victim.x-20,y:victim.y-25,vx:500,vy:0,r:8,damage:5,life:.5,kind:-1,age:0,hits:[]});tick(s,.04);expect(victim.pumpkinFall).toBeTruthy();tick(s,2);expect(s.enemies.filter(q=>q.orbitParent&&q.hp>0)).toHaveLength(2);expect(e.escortSpawned).toBe(true);
});

test('the witch and all three orbiters fire independently while the ring keeps moving',()=>{
 const s=quiet(),x=12000,e=Object.assign(makeEnemy(x,groundY(s.level.route,x),26,2),{active:true,flying:true,conjurer:true,flightHeight:180,timer:0});s.enemies=[e];place(s,x-300);spawnWitchOrbit(s,e);const launches=[];
 for(let i=0;i<1200;i++)for(const q of [...s.enemies]){q.clock+=1/120;q.timer-=1/120;stepVillageEnemy(s,q,1/120,(_s,_x,_y,_a,speed,kind,extra)=>launches.push({owner:extra.owner,kind,speed}));}
 expect(launches.some(q=>q.kind==='candy-ray'&&q.owner===witchId(e))).toBe(true);
 for(const orb of s.enemies.filter(q=>q.orbitParent))expect(launches.filter(q=>q.owner===orb.curseId).length).toBeGreaterThanOrEqual(2);
});

test('killing the witch collapses her ring, clears its spells and releases cursed civilians on landing once',()=>{
 const s=quiet(),e=Object.assign(makeEnemy(9000,452,26,2),{active:true,conjurer:true,flying:true});s.enemies=[e];spawnWitchOrbit(s,e);const orbs=s.enemies.filter(q=>q.orbitParent),n={...s.level.villagers[0],x:8800,y:452,state:'candy',curseOwner:orbs[0].curseId};s.villagers=[n];s.hostile=orbs.map(q=>({kind:'soul-flame',owner:q.curseId,life:2}));
 e.hp=0;releaseWitchVictims(s,e);expect(orbs.every(q=>q.hp===0&&q.pumpkinFall)).toBe(true);expect(s.hostile.every(q=>q.life===0)).toBe(true);expect(n.state).toBe('candy');
 for(let i=0;i<220;i++)updateEnemies(s,1/120,playerBody,()=>{});expect(n.state).toBe('rescue');expect(s.village.rescued).toBe(1);
});

test('pumpkin attackers alternate player and civilian shots even when twenty civilians are in range',()=>{
 for(const type of [25,27]){
  const s=quiet(),x=9000,e=Object.assign(makeEnemy(x,452,type,2),{active:true,timer:0,phaseAge:0});place(s,x-200);s.enemies=[e];s.villagers=Array.from({length:20},(_,i)=>({...s.level.villagers[0],id:'target:'+i,x:x+200+i,y:452,state:'trapped'}));const sides=[];
  for(let i=0;i<1800;i++){e.clock+=1/120;e.timer-=1/120;stepVillageEnemy(s,e,1/120,(_s,_x,_y,a)=>{if(type===27||!sides.length||sides.at(-1).time!==i)sides.push({side:Math.sign(Math.cos(a)),time:i});});}
  const first=sides.slice(0,4).map(q=>q.side);expect(first).toHaveLength(4);expect(first.filter(q=>q<0)).toHaveLength(2);expect(first.filter(q=>q>0)).toHaveLength(2);
 }
});

test('rapid pumpkin zombies have shorter windup and faster fire without shifting the mouth release',()=>{
 const speeds=[],times=[];
 for(const rapid of [false,true]){
  const s=quiet(),e=Object.assign(makeEnemy(9000,452,25,2),{active:true,timer:0,phaseAge:0,rapidLantern:rapid});place(s,8700);let age=0;
  while(speeds.length<Number(rapid)*3+3&&age<2){age+=1/120;stepVillageEnemy(s,e,1/120,(_s,x,y,a,speed)=>{speeds.push(speed);expect(x).toBeCloseTo(e.x+e.dir*44.08);expect(y).toBeCloseTo(e.y-75.88);});}times.push(age);
 }
 expect(times[1]).toBeLessThan(times[0]-.1);expect(speeds.slice(0,3)).toEqual([245,245,245]);expect(speeds.slice(3)).toEqual([325,325,325]);
});

test('four crouched shelters need real shots to release their occupants and preserve rescue on retry',()=>{
 const s=createAdventure(7),r=s.villageRubble.find(q=>q.shelter),n=s.villagers.find(q=>q.id===r.villager);expect(s.villageRubble.filter(q=>q.shelter)).toHaveLength(4);
 s.enemies=[];s.villagers=[n];s.villageRubble=[r];s.villageObstacles=[];s.platforms=s.platforms.filter(q=>!q.villageObstacle);place(s,r.x-145);s.player.dir=1;s.player.hurt=999;
 tick(s,.8);expect(n.state).toBe('hiding');expect(r.freed).toBeFalsy();tick(s,2.6,{attack:true});expect(r.freed).toBe(true);expect(n.state).toBe('flee');expect(n.x).toBeLessThan(r.x-50);expect(n.hidingCover).toBeNull();expect(s.village.rescued).toBe(1);
 retryAdventure(s);expect(s.villageRubble.find(q=>q.id===r.id).freed).toBe(true);expect(s.villagers.find(q=>q.id===n.id).state).toBe('flee');
});

test('a low actual spell collision can still curse a crouched civilian',()=>{
 const s=createAdventure(7),r=s.villageRubble.find(q=>q.shelter),n=s.villagers.find(q=>q.id===r.villager);Object.assign(n,{state:'hiding',age:0});s.villagers=[n];
 const q={kind:'soul-flame',village:true,life:2,r:10,owner:'orbit:test',previousX:r.x+100,previousY:r.y-28,x:r.x-100,y:r.y-28};
 expect(resolveVillageProjectile(s,q,{x:0,y:0,w:1,h:1})).toBe(true);expect(n.state).toBe('turning');expect(n.curseOwner).toBe('orbit:test');
});
