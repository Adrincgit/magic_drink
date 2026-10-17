import {test,expect} from '@playwright/test';
import {createAdventure,stepAdventure,retryAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {stepVillageCrowd} from '../src/components/arcade/adventure/engine/villageCrowd';
import {hitVillageObstacles} from '../src/components/arcade/adventure/engine/villageObstacles';
import {beginCandyCapture,stepCandyCapture} from '../src/components/arcade/adventure/engine/villageRescue';
import {pumpkinDrawing} from '../src/components/arcade/adventure/engine/villagePumpkins';
import {makeEnemy} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {groundY,groundAt} from '../src/components/arcade/adventure/world/adventureTerrain';
import {equipDrink} from '../src/components/arcade/adventure/engine/adventureAmmo';
const tick=(s,time,input={})=>{for(let i=0;i<time*120;i++)stepAdventure(s,input,1/120);};
function encounter(){
 const s=createAdventure(7),r=s.villageObstacles.find(q=>q.blockade);s.enemies=[];s.villagers=s.villagers.filter(q=>q.blockadeGroup);s.villageObstacles=[r];s.platforms=s.platforms.filter(q=>!q.villageObstacle||q.villageObstacle===r.id);s.villageRubble=[];s.carriages=[];
 const x=r.x-230;Object.assign(s.player,{x,y:groundY(s.level.route,x),ground:s.platforms.indexOf(groundAt(s.platforms,x)),dir:1,hurt:999});s.camera={x:x-300,y:40,backdropY:40,zoom:1};return{s,r};
}

test('fourteen civilians queue at the tall collapse, attempt to climb, slip and stay on its blocked side',()=>{
 const {s,r}=encounter();expect(s.villagers).toHaveLength(14);expect(new Set(s.villagers.map(n=>n.style)).size).toBe(8);expect(r.hp).toBe(96);expect(r.h).toBeGreaterThan(200);
 let lift=0;const poses=new Set();for(let i=0;i<300;i++){stepAdventure(s,{},1/120);for(const n of s.villagers){lift=Math.max(lift,n.climbLift||0);if(n.blocked)poses.add(n.blockedFrame);}}
 expect(s.villagers.filter(q=>q.blocked).length).toBeGreaterThanOrEqual(12);expect(s.villagers.every(q=>q.x>r.x+r.w/2)).toBe(true);expect(lift).toBeGreaterThan(25);expect(poses.size).toBeGreaterThanOrEqual(6);
});

test('the blockade camera opens smoothly around the same ground baseline and recovers after destruction',()=>{
 const {s,r}=encounter(),floor=groundY(s.level.route,s.player.x),baseline=floor-s.camera.y;tick(s,2.5);expect(s.camera.zoom).toBeLessThan(.79);expect((floor-s.camera.y)*s.camera.zoom).toBeCloseTo(baseline,2);expect(s.camera.backdropY).toBe(40);
 const px=(s.player.x-s.camera.x)*s.camera.zoom;expect(px).toBeGreaterThan(25);expect(px).toBeLessThan(600);hitVillageObstacles(s,{x:r.x,y:r.y-60,kind:-1,damage:100,life:1},0);tick(s,3);expect(s.camera.zoom).toBe(1);expect(s.camera.y).toBeCloseTo(40,2);
});

test('real basic shots wear down the resistant collapse and the crowd escapes through the broken opening',()=>{
 const {s,r}=encounter();s.villageBlockade.started=true;s.villageBlockade.waves=3;tick(s,2,{attack:true});expect(r.hp).toBeLessThan(96);expect(r.hp).toBeGreaterThan(50);expect(r.broken).toBeFalsy();tick(s,13,{attack:true});expect(r.broken).toBe(true);expect(s.villagers.some(q=>q.x<r.x-r.w/2)).toBe(true);
 retryAdventure(s);expect(s.villageObstacles.find(q=>q.blockade).broken).toBeFalsy();expect(s.villageBlockade.waves).toBe(0);
});

test('delaying brings bounded attackers and real candy absorption creates additional enemies; early rescue prevents waves',()=>{
 const slow=encounter();tick(slow.s,20);expect(slow.s.enemies.filter(q=>q.blockadeEnemy)).toHaveLength(8);expect(slow.s.enemies.filter(q=>q.type===26)).toHaveLength(2);expect(slow.s.enemies.some(q=>q.carriedId)).toBe(true);expect(slow.s.villagers.some(q=>['candy','absorbing','carried'].includes(q.state))).toBe(true);
 const fast=encounter();hitVillageObstacles(fast.s,{x:fast.r.x,y:fast.r.y-50,damage:100,kind:-1,life:1},0);tick(fast.s,20);expect(fast.s.enemies.filter(q=>q.blockadeEnemy)).toHaveLength(0);expect(fast.s.villagers.every(q=>q.state==='flee')).toBe(true);
});

test('a civilian breaks the candy curse at thirty seconds, including absorption and a pumpkin container',()=>{
 for(const state of ['candy','absorbing','absorbed','carried']){
  const s=createAdventure(7),n=s.villagers[0];Object.assign(n,{state,age:0,curseAge:0,x:800,y:480,candyHomeX:800,curseOwner:'timer-pumpkin'});s.villagers=[n];s.carriages=[];s.enemies=[];s.villageObstacles=[];
  const e=Object.assign(makeEnemy(920,480,27),{curseId:'timer-pumpkin',carriedId:n.id});if(state==='carried')s.enemies=[e];
  for(let i=0;i<3599;i++)stepVillageCrowd(s,1/120);expect(n.state).toBe(state);for(let i=0;i<3;i++)stepVillageCrowd(s,1/120);expect(n.state).toBe('rescue');expect(s.village.rescued).toBe(1);expect(n.curseOwner).toBeUndefined();
  if(state==='carried'){expect(e.carriedId).toBeNull();e.pumpkinFall={age:1,landed:true,landAge:.5};expect(pumpkinDrawing(e).key).toBe('village-orbit-pumpkin-v9');}stepVillageCrowd(s,.1);expect(s.village.rescued).toBe(1);
 }
});

test('living candy Hexy recovers after thirty seconds without input, while terminal candy cannot revive',()=>{
 const s=createAdventure(7);s.enemies=[];beginCandyCapture(s,{kind:'candy-ray'});for(let i=0;i<3599;i++)stepCandyCapture(s,{},1/120);expect(s.player.candy).toBeTruthy();for(let i=0;i<3;i++)stepCandyCapture(s,{},1/120);expect(s.player.candy).toBeUndefined();
 beginCandyCapture(s,{kind:'candy-ray'});s.player.candy.terminal=true;stepCandyCapture(s,{},31);expect(s.player.candy.terminal).toBe(true);
});

test('warnings only happen in the approach, facing Hexy on the left, and end if she passes',()=>{
 const s=createAdventure(7);expect(s.level.villagers.filter(q=>q.warning).every(q=>q.x<s.level.entrance.x&&[0,2].includes(q.style))).toBe(true);
 const n={...s.villagers.find(q=>q.warning),x:700,y:480,state:'flee',runAge:0,age:0};s.villagers=[n];s.carriages=[];s.villageObstacles=[];s.player.x=500;stepVillageCrowd(s,.01);expect(n.state).toBe('warning');expect(n.warningDir).toBe(-1);
 s.player.x=710;stepVillageCrowd(s,.01);expect(n.state).toBe('flee');Object.assign(n,{x:9000,state:'flee',warned:false,warning:true});s.player.x=8800;stepVillageCrowd(s,.01);expect(n.state).toBe('flee');
});

test('continuous water can damage the same solid collapse through the real shot loop',()=>{
 const {s,r}=encounter();s.villageBlockade.waves=3;equipDrink(s,5);tick(s,2,{attack:true});expect(r.hp).toBeLessThan(96);
});
