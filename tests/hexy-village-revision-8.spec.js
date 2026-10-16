import {test,expect} from '@playwright/test';
import {createAdventure,stepAdventure,retryAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {makeEnemy,enemyShot} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {beginCandyCapture,witchId} from '../src/components/arcade/adventure/engine/villageRescue';
import {hitVillageRubble,stepVillageResistance} from '../src/components/arcade/adventure/engine/villageResistance';
import {hitVillageObstacles,villageObstaclePlatform} from '../src/components/arcade/adventure/engine/villageObstacles';
import {resolveVillageProjectile} from '../src/components/arcade/adventure/engine/adventureVillage';
import {groundY,groundAt,surfaceY} from '../src/components/arcade/adventure/world/adventureTerrain';
const tick=(s,time,input={})=>{for(let i=0;i<time*120;i++)stepAdventure(s,input,1/120);};
function quiet(){const s=createAdventure(7);s.enemies=[];s.villagers=[];s.hostile=[];s.villageRubble=[];s.player.hurt=999;for(const r of s.villageObstacles)r.ambush=false;return s;}
function place(s,x){Object.assign(s.player,{x,y:groundY(s.level.route,x),ground:s.platforms.indexOf(groundAt(s.platforms,x)),vx:0,vy:0});s.camera.x=x-300;}

test('trapped villagers require shooting debris; proximity does not rescue them',()=>{
 const s=createAdventure(7),r=s.villageRubble[0],n=s.villagers.find(q=>q.id===r.villager);s.enemies=[];s.villagers=[n];s.villageObstacles=[];s.platforms=s.platforms.filter(q=>!q.villageObstacle);Object.assign(n,{state:'trapped',x:r.x,y:r.y});place(s,r.x-40);
 for(let i=0;i<240;i++)stepVillageResistance(s,1/120,()=>{});expect(r.freed).toBeFalsy();expect(n.state).toBe('trapped');
 place(s,r.x-145);tick(s,2.5,{attack:true});expect(r.freed).toBe(true);expect(['recover','flee']).toContain(n.state);const rescued=s.village.rescued;hitVillageRubble(s,{life:1,kind:0,x:r.x,y:r.y-25,damage:99},1);expect(s.village.rescued).toBe(rescued);
});
test('an ordinary nearby witch prioritizes captured Hexy from a positive recovery timer',()=>{
 for(const flying of [false,true]){
  const s=quiet();place(s,9000);const e=Object.assign(makeEnemy(9300,groundY(s.level.route,9300),26,4),{active:true,flying,flightHeight:175,phase:'recover',timer:4});s.enemies=[e];beginCandyCapture(s,{kind:'witch-puddle',owner:witchId(e)});const x=s.player.x;tick(s,3.2);
  expect(e.phase).toBe('absorb-player');expect(s.player.candy.absorber).toBe(witchId(e));expect(s.player.x).toBeGreaterThan(x+20);expect(s.player.y).toBeLessThan(groundY(s.level.route,s.player.x)-20);
 }
});
test('a crate blocks walking, supports a full jump and can be broken beneath Hexy',()=>{
 const s=quiet(),r=s.villageObstacles.find(q=>q.kind==='crates'),platform=villageObstaclePlatform(s,r);place(s,r.x-r.w/2-65);tick(s,.8,{right:true});expect(s.player.x).toBeLessThanOrEqual(r.x-r.w/2-13);
 let landed=false;for(let i=0;i<70;i++){stepAdventure(s,{right:true,jump:true},1/120);if(s.platforms[s.player.ground]===platform){landed=true;break;}}expect(landed).toBe(true);expect(s.player.y).toBe(surfaceY(platform,s.player.x));
 hitVillageObstacles(s,{x:r.x,y:r.y-30,life:1,damage:99,kind:0},0);expect(r.broken).toBe(true);expect(platform.gone).toBe(true);expect(s.player.ground).toBe(null);tick(s,.65);expect(s.player.y).toBeCloseTo(groundY(s.level.route,s.player.x),0);
});
test('small cargo steps make the tall overturned carriage reachable with the base jump',()=>{
 const s=quiet(),r=s.villageObstacles.find(q=>q.kind==='wagon'),step=s.villageObstacles.find(q=>q.id===r.id+':step:-1'),platform=villageObstaclePlatform(s,r),base=villageObstaclePlatform(s,step);
 Object.assign(s.player,{x:step.x,y:surfaceY(base,step.x),ground:s.platforms.indexOf(base),vx:0,vy:0});let landed=false;
 for(let i=0;i<110;i++){stepAdventure(s,{right:true,jump:i<50},1/120);if(s.platforms[s.player.ground]===platform){landed=true;break;}}expect(landed).toBe(true);expect(s.player.y).toBe(surfaceY(platform,s.player.x));
});
test('opening a civilian pocket releases its runners; incoming magic can reach them before rescue',()=>{
 const s=quiet(),r=s.villageObstacles.find(q=>q.x===10160),defs=s.level.villagers.filter(q=>q.obstaclePocket===0);s.villagers=defs.map(q=>({...q,state:'flee',runAge:0,gait:0,age:0,warned:true,tripped:true}));place(s,9950);tick(s,1.5);
 expect(s.villagers.every(q=>q.blocked)).toBe(true);expect(s.villagers.every(q=>q.x>r.x+r.w/2)).toBe(true);
 const n=s.villagers[0],shot={kind:'candy-ray',village:true,life:1,r:9,owner:'threat',previousX:n.x+30,previousY:n.y-40,x:n.x-30,y:n.y-40};resolveVillageProjectile(s,shot,{x:0,y:0,w:1,h:1});expect(s.villagers.some(q=>q.state==='turning')).toBe(true);
 const runner=s.villagers.find(q=>q.state==='flee'),old=runner.x;hitVillageObstacles(s,{x:r.x,y:r.y-40,life:1,damage:99,kind:0},0);tick(s,1);expect(runner.x).toBeLessThan(old-150);expect(runner.blocked).toBe(false);
});
test('blocked streets create bounded pumpkin reinforcements and destruction persists on retry',()=>{
 const s=quiet(),r=s.villageObstacles.find(q=>q.kind==='wagon');r.ambush=true;place(s,r.x-250);tick(s,.1);expect(s.enemies.filter(q=>q.villageAmbush===r.id)).toHaveLength(2);expect(s.enemies.some(q=>q.type===25)).toBe(true);tick(s,5.3);expect(r.waves).toBe(2);
 hitVillageObstacles(s,{x:r.x,y:r.y-50,life:1,damage:99,kind:0},0);expect(s.villageDebris.length).toBeGreaterThan(0);const count=s.villageDebris.length;hitVillageObstacles(s,{x:r.x,y:r.y-50,life:1,damage:99,kind:0},0);expect(s.villageDebris).toHaveLength(count);retryAdventure(s);expect(s.villageObstacles.find(q=>q.id===r.id).broken).toBe(true);expect(s.platforms.find(q=>q.villageObstacle===r.id).gone).toBe(true);
});
test('only one evacuation carriage belongs to the opening, with wrecks and extra pumpkin zombies later',()=>{
 const s=createAdventure(7);expect(s.carriages).toHaveLength(1);expect(s.carriages[0].wakeX).toBe(0);expect(s.carriages[0].x).toBeLessThan(1500);expect(s.level.obstacles.filter(q=>q.kind==='wagon')).toHaveLength(3);expect(s.enemies.filter(q=>q.type===25).length).toBeGreaterThanOrEqual(14);expect(s.level.width).toBe(23240);
});
