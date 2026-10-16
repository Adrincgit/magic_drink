import {test,expect} from '@playwright/test';
import {createAdventure,stepAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {makeEnemy,enemyShot} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {stepVillageEnemy,villageEnemyDrawing,villageWitchMuzzle,villageClownMuzzle,resolveVillageProjectile} from '../src/components/arcade/adventure/engine/adventureVillage';
import {villageVillagerProfile,villageVillagerRunFrame} from '../src/components/arcade/adventure/actors/villageVillagers';
import {releaseWitchVictims,witchId} from '../src/components/arcade/adventure/engine/villageRescue';
import {beginPopcornDefeat,stepPopcornDefeat} from '../src/components/arcade/adventure/engine/adventurePopcornDefeat';
import {groundY} from '../src/components/arcade/adventure/world/adventureTerrain';
const quiet=()=>{const s=createAdventure(7);s.enemies=[];s.villagers=[];s.villageRubble=[];s.villageObstacles=[];s.platforms=s.platforms.filter(q=>!q.villageObstacle);s.player.hurt=999;return s;};
const tick=(s,time)=>{for(let i=0;i<time*120;i++)stepAdventure(s,{},1/120);};
test('all eight villagers hold distinct sequential gait phases while translating fast',()=>{
 for(let style=0;style<8;style++){
  const s=quiet(),p=villageVillagerProfile(style),n={...s.level.villagers.find(q=>q.style===style),x:8000,y:452,state:'flee',age:0,gait:0,runAge:0,warned:true,tripped:true,trip:false};s.villagers=[n];s.player.x=7900;
  const phases=Array.from({length:8},(_,i)=>villageVillagerRunFrame({...n,runAge:(i+.1)*p.runDuration/8}));expect(phases).toEqual(Array.from({length:8},(_,i)=>p.runBase+i));expect(p.runDuration/8).toBeGreaterThanOrEqual(.085);
  const start=n.x;tick(s,.5);expect(start-n.x).toBeGreaterThan(80);expect(n.runAge).toBeCloseTo(.5,1);
 }
});
test('both witch orientations and clown launch from their registered release drawing',()=>{
 for(const type of [25,26])for(const flying of type===26?[false,true]:[false])for(const dir of [-1,1]){
  const s=quiet(),e=Object.assign(makeEnemy(8000,452,type,0),{active:true,flying,dir,timer:99,phase:'windup',phaseAge:0,candyAim:{x:8000+dir*250,y:430}});s.player.x=8000+dir*250;stepVillageEnemy(s,e,1.11,enemyShot);
  const m=type===25?villageClownMuzzle(e):villageWitchMuzzle(e);expect(s.hostile[0].x).toBeCloseTo(m.x);expect(s.hostile[0].y).toBeCloseTo(m.y);
  const d=villageEnemyDrawing(e);expect(d.key).toBe(type===25?'village-pumpkin-clean-v7':flying?'village-witch-air-v7':'village-witch-ground-v7');expect(d.frame).toBe(type===25?12:flying?9:8);
 }
});
test('real damage selects four recoil drawings, then returns to the same witch sheet',()=>{
 for(const flying of [false,true]){
  const s=quiet(),e=Object.assign(makeEnemy(8000,452,26,0),{active:true,flying,timer:99});s.player.x=7900;stepVillageEnemy(s,e,.01,enemyShot);e.hp--;e.flash=.2;stepVillageEnemy(s,e,.01,enemyShot);
  const frames=[];for(let i=0;i<4;i++){frames.push(villageEnemyDrawing(e).frame);stepVillageEnemy(s,e,.09,enemyShot);}expect(frames).toEqual([12,13,14,15]);expect(villageEnemyDrawing(e).key).toBe(flying?'village-witch-air-v7':'village-witch-ground-v7');
 }
});
test('flying witches sweep both directions and alternate fast rays with ground curses',()=>{
 const s=quiet(),x=8000,e=Object.assign(makeEnemy(x,groundY(s.level.route,x),26,0),{active:true,flying:true,flightHeight:170,timer:0});s.player.x=x;s.enemies=[e];let min=x,max=x,rays=0,drops=0,last=0;
 for(let i=0;i<120*14;i++){stepAdventure(s,{},1/120);min=Math.min(min,e.x);max=Math.max(max,e.x);for(const q of s.hostile)if(!q.counted){q.counted=true;if(q.kind==='candy-ray')rays++;if(q.kind==='witch-drop')drops++;}last=e.flightDir;}
 expect(max-min).toBeGreaterThan(550);expect(rays).toBeGreaterThanOrEqual(4);expect(drops).toBeGreaterThanOrEqual(2);expect([-1,1]).toContain(last);
});
test('falling witch magic ends at terrain, leaves a timed transforming pool and clears with its owner',()=>{
 const s=quiet(),x=8000,y=groundY(s.level.route,x),e=makeEnemy(x+100,y,26,1),q={kind:'witch-drop',village:true,life:1,r:12,previousX:x,previousY:y-50,x,y:y+20,owner:witchId(e)};
 expect(resolveVillageProjectile(s,q,{x:0,y:0,w:1,h:1})).toBe(true);const pool=s.hostile.at(-1);expect(pool.kind).toBe('witch-puddle');expect(pool.y).toBe(y-8);const npc={...s.level.villagers[0],x,y,state:'flee'};s.villagers=[npc];resolveVillageProjectile(s,pool,{x:x-10,y:y-80,w:20,h:80});expect(npc.state).toBe('turning');expect(pool.villagePlayerHit).toBe(true);expect(pool.life).toBeGreaterThan(3);
 resolveVillageProjectile(s,pool,{x:x+300,y:y-80,w:20,h:80});expect(pool.villagePlayerHit).toBe(false);releaseWitchVictims(s,e);expect(pool.life).toBe(0);expect(npc.state).toBe('rescue');
});
test('charged Popcorn launches clothed pumpkin pieces and zombies without releasing a ghost',()=>{
 for(const type of [18,21,25]){
  const s=quiet(),e=Object.assign(makeEnemy(8000,452,type,0),{hp:0,releasesSoul:true});s.enemies=[e];expect(beginPopcornDefeat(s,e,{popcorn:true,popcornStrong:true,vx:1})).toBe(true);expect(e.popcornDefeat.style).toBe('launch');expect(e.soulReleased).toBe(true);
  if(type===25){expect(e.popcornDefeat.parts).toHaveLength(4);expect(e.popcornDefeat.parts.every(p=>p.key==='village-pumpkin-finish-v7')).toBe(true);}
  for(let i=0;i<220;i++)stepPopcornDefeat(s,e,1/120,makeEnemy);expect(e.popcornDefeat.landed).toBe(true);expect(s.enemies.some(e=>e.type===19)).toBe(false);
 }
});
