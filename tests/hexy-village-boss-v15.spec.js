import {test,expect} from '@playwright/test';
import {createAdventure,stepAdventure,retryAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {makeEnemy,enemyShot} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {enemyGeometry} from '../src/components/arcade/adventure/actors/enemies/adventureEnemyGeometry';
import {stepHarvester,harvesterMuzzle,harvesterDrawing,HARVESTER_SIZE} from '../src/components/arcade/adventure/engine/villageHarvester';
import {stepWitchAbsorption,beginCandyCapture,witchId} from '../src/components/arcade/adventure/engine/villageRescue';
import {spawnSoulPumpkin,SOUL_PUMPKIN_LIMIT} from '../src/components/arcade/adventure/engine/villagePumpkins';
import {stepVillageResistance} from '../src/components/arcade/adventure/engine/villageResistance';
import {stepVillageCrowd} from '../src/components/arcade/adventure/engine/villageCrowd';
import {groundY,groundAt} from '../src/components/arcade/adventure/world/adventureTerrain';
const tick=(s,t,input={})=>{for(let i=0;i<Math.ceil(t*120);i++)stepAdventure(s,input,1/120);};
function fight(){
 const s=createAdventure(7),e=s.enemies.find(e=>e.type===28);s.enemies=[e];s.villagers=[];s.carriages=[];s.hostile=[];s.villageObstacles=[];s.villageRubble=[];s.supplies=[];s.cages=[];s.outposts=[];s.platforms=s.platforms.filter(p=>!p.villageObstacle);
 const x=e.x-420;Object.assign(s.player,{x,y:groundY(s.level.route,x),vx:0,vy:0,hurt:999,ground:s.platforms.indexOf(groundAt(s.platforms,x))});s.camera={x:x-260,y:40,zoom:1,backdropY:40};return{s,e};
}
test('the boss is fifteen percent smaller, calls a visible riderless broom, mounts and takes off before firing',()=>{
 const {s,e}=fight();expect(HARVESTER_SIZE).toBe(290*.85);expect(enemyGeometry(e).size).toBe(HARVESTER_SIZE);tick(s,1.9);e.hp=e.maxHp*.49;tick(s,.02);expect(e.phase).toBe('broom-call');
 tick(s,.4);expect(e.broom.x).not.toBe(e.x);expect(e.flying).toBe(false);expect(s.hostile).toHaveLength(0);tick(s,.85);expect(e.phase).toBe('broom-mount');
 expect(harvesterDrawing(e).key).toBe('harvester-flight-v15');tick(s,1.2);expect(e.phase).toBe('broom-rise');expect(e.flying).toBe(true);tick(s,1.2);expect(e.y).toBeLessThan(e.baseY-180);expect(s.camera.zoom).toBeLessThan(.85);
});
test('aerial combat crosses the arena, alternates five-ray fans, magic rain and three repeated volleys, and releases from the drawn wand',()=>{
 const {s,e}=fight();Object.assign(e,{active:true,phase:'patrol',phaseAge:0,timer:0,harvestStage:2,flying:true,flightDir:-1,flightClock:0});
 const moves=new Set(),xs=[],origins=[];let rays=0,drops=0;
 for(let i=0;i<3600;i++){
  e.timer-=1/120;stepHarvester(s,e,1/120,(state,x,y,angle,speed,kind,extra)=>{const m=harvesterMuzzle(e);origins.push(Math.hypot(x-m.x,y-m.y));if(kind==='candy-ray')rays++;if(kind==='witch-drop')drops++;expect(harvesterDrawing(e).frame).toBe(10);expect(extra.owner).toBe(witchId(e));});
  if(e.phase==='attack')moves.add(e.harvestMove);xs.push(e.x);expect(Number.isFinite(e.x+e.y+e.phaseAge)).toBe(true);
 }
 expect([...moves].sort()).toEqual(['fan','rain','sweep']);expect(rays).toBeGreaterThan(35);expect(drops).toBeGreaterThanOrEqual(10);expect(Math.max(...xs)-Math.min(...xs)).toBeGreaterThan(900);expect(Math.max(...origins)).toBe(0);
 expect(Math.min(...xs)).toBeGreaterThanOrEqual(s.level.arena.left+160);expect(Math.max(...xs)).toBeLessThanOrEqual(s.level.arena.right-130);
});
test('a full pumpkin population does not lock the boss into absorption; a batch that loses capacity returns to combat with rescuable candy',()=>{
 const {s,e}=fight();Object.assign(e,{active:true,phase:'patrol',phaseAge:0,timer:0});
 for(let i=0;i<SOUL_PUMPKIN_LIMIT;i++)spawnSoulPumpkin(s,e,{id:'full-'+i});
 const npc={...s.level.villagers[0],id:'waiting',state:'candy',x:e.x-150,y:e.y,age:0,curseAge:0};s.villagers=[npc];
 expect(stepWitchAbsorption(s,e,.01)).toBe(false);expect(e.phase).toBe('patrol');
 s.enemies.pop();expect(stepWitchAbsorption(s,e,.01)).toBe(true);spawnSoulPumpkin(s,e,{id:'takes-last-slot'});
 for(let i=0;i<650;i++){e.phaseAge+=1/120;stepWitchAbsorption(s,e,1/120);}
 expect(npc.state).toBe('candy');expect(Number.isFinite(npc.x+npc.y)).toBe(true);expect(e.phase).toBe('recover');expect(npc.absorbRestUntil).toBeGreaterThan(0);
});
test('a completed boss absorption resumes attacks and can then enter the broom phase; a running spell withstands hits',()=>{
 const {s,e}=fight();Object.assign(e,{active:true,phase:'patrol',phaseAge:0,timer:0});s.villagers=[{...s.level.villagers[0],id:'meal',state:'candy',x:e.x-200,y:e.y,age:0,curseAge:0}];
 tick(s,1);expect(e.phase).toBe('absorb');e.flash=.3;tick(s,.2);expect(e.phase).toBe('absorb');tick(s,3);expect(s.villagers[0].state).toBe('carried');expect(e.phase).not.toBe('absorb');
 e.hp=e.maxHp*.49;tick(s,4);expect(e.flying).toBe(true);expect(e.phase).not.toBe('absorb');
});
test('a boss with retained legacy candy lacking a pull clock cannot produce NaN or remain frozen',()=>{
 const {s,e}=fight();Object.assign(e,{active:true,phase:'absorb',phaseAge:1,absorbIds:['old'],nextPumpkinAt:0,absorbDuration:3.05});const q={...s.level.villagers[0],id:'old',state:'absorbed',x:e.x-100,y:e.y,curseOwner:witchId(e),candyHomeX:e.x-100};s.villagers=[q];
 for(let i=0;i<500;i++){e.phaseAge+=1/120;stepWitchAbsorption(s,e,1/120);}expect(q.state).toBe('carried');expect(s.enemies.filter(q=>q.type===27)).toHaveLength(1);expect(e.phase).toBe('recover');
});
test('crossing half health during absorption schedules the broom even if the consumed candy heals her above half',()=>{
 const {s,e}=fight();Object.assign(e,{active:true,phase:'patrol',phaseAge:0,timer:0,hp:95});s.villagers=[{...s.level.villagers[0],id:'heal',state:'candy',x:e.x-180,y:e.y,age:0,curseAge:0}];
 tick(s,.9);expect(e.phase).toBe('absorb');e.hp=91;tick(s,.1);expect(e.broomPending).toBe(true);expect(e.phase).toBe('absorb');tick(s,2.5);expect(e.hp).toBeGreaterThan(e.maxHp*.5);expect(e.phase).toBe('broom-call');tick(s,3.5);expect(e.flying).toBe(true);
});
test('aerial defeat falls with the same boss identity, rescues captives and retry resets the entire flight',()=>{
 const {s,e}=fight();Object.assign(e,{active:true,flying:true,harvestStage:2,phase:'patrol',phaseAge:0,timer:0,flightClock:0,hp:.1,y:e.y-200});
 s.shots.push({kind:9,chainTarget:e,voltProbe:true,x:e.x,y:e.y-70,r:15,damage:1,age:0,life:.1,vx:0,vy:0,hidden:true,hits:[]});tick(s,.03);
 expect(e.hp).toBe(0);expect(e.witchFall).toBeTruthy();tick(s,3);expect(e.witchFall.landed).toBe(true);retryAdventure(s);const fresh=s.enemies.find(e=>e.type===28);expect(fresh.flying).toBe(false);expect(fresh.harvestStage).toBe(1);expect(fresh.broom).toBeUndefined();
});
test('stone releases on the actual hand frame, flies visibly and damages the enemy; a defender never mimes a throw without a target',()=>{
 const s=createAdventure(7),npc={...s.villagers.find(q=>q.defender),state:'flee',x:9000,y:480,age:0};s.villagers=[npc];s.villageRubble=[];s.player.x=8950;s.enemies=[];
 stepVillageResistance(s,.2,()=>{});expect(npc.state).toBe('flee');expect(s.villageStones).toHaveLength(0);
 const e=Object.assign(makeEnemy(9340,480,18),{active:true,timer:99});s.enemies=[e];const hp=e.hp;
 for(let i=0;i<50;i++)stepVillageResistance(s,1/120,()=>{});expect(s.villageStones).toHaveLength(0);stepVillageResistance(s,.02,()=>{});expect(npc.throwFrame).toBe(4);expect(s.villageStones).toHaveLength(1);expect(s.villageStones[0].from).toBe(npc.id);
 const x=s.villageStones[0].x;stepVillageResistance(s,.1,()=>{});expect(s.villageStones[0].x).toBeGreaterThan(x+20);for(let i=0;i<120;i++)stepVillageResistance(s,1/120,()=>{});expect(e.hp).toBeLessThan(hp);
});
test('the warning holds toward Hexy while the crowd keeps escaping, ends when passed and never triggers inside town; trip/help is retired',()=>{
 const s=createAdventure(7),q={...s.villagers.find(n=>n.warning),state:'flee',x:700,y:480,age:0,runAge:0};s.villagers=[q];s.carriages=[];s.villageObstacles=[];s.player.x=500;
 stepVillageCrowd(s,.01);expect(q.state).toBe('warning');for(let i=0;i<240;i++)stepVillageCrowd(s,1/120);expect(q.state).toBe('warning');expect(q.warningDir).toBe(-1);s.player.x=710;stepVillageCrowd(s,.01);expect(q.state).toBe('flee');
 expect(s.level.villagers.some(q=>q.trip)).toBe(false);for(const state of ['trip','fallen','help']){q.state=state;stepVillageCrowd(s,.01);expect(q.state).toBe('flee');}
 expect(s.level.villagers.filter(q=>q.warning).every(q=>q.style===0)).toBe(true);
});
