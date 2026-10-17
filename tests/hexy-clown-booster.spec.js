import {test,expect} from '@playwright/test';
import {createAdventure,stepAdventure,playerBody} from '../src/components/arcade/adventure/engine/adventureModel';
import {makeEnemy,updateEnemies} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {enemyDrawing} from '../src/components/arcade/adventure/render/adventureSprites';
import {groundY,surfaceY} from '../src/components/arcade/adventure/world/adventureTerrain';
import {LEVELS} from '../src/components/arcade/adventure/world/adventureLevels';

function scene(direction=1,platforms=[{x:0,y:480,w:2000,kind:'earth'}]){
 const s=createAdventure(0);s.platforms=platforms.map(q=>({...q,baseY:q.y}));
 s.level={...s.level,groundRoute:true};s.enemies=[];s.hostile=[];s.events=[];s.damage=()=>{};
 const c=makeEnemy(1000,groundY(s.platforms,1000),5),e=makeEnemy(c.x-direction*125,groundY(s.platforms,c.x-direction*125),0);
 Object.assign(e,{dir:direction,timer:10,hp:2.3});s.enemies=[c,e];s.player.x=c.x+direction*330;s.player.y=groundY(s.platforms,s.player.x);s.player.hurt=999;
 return{s,c,e};
}
const tick=(s,n,dt=1/120)=>{for(let i=0;i<n;i++)updateEnemies(s,dt,playerBody,()=>{});};

test('an empty booster waits for a walking clown instead of spawning one',()=>{
 const {s,c}=scene();s.enemies=[c];c.timer=0;tick(s,1200);
 expect(s.enemies).toEqual([c]);expect(s.hostile).toEqual([]);expect(s.events).not.toContain('cannon');expect(enemyDrawing(c).frame).toBe(2);
});

for(const direction of [-1,1])for(const slope of [-.12,0,.12])test(`same clown lands and walks on slope ${slope} towards ${direction}`,()=>{
 const {s,c,e}=scene(direction,[{x:0,y:480-1000*slope,yEnd:480+1000*slope,w:2000,kind:'earth'}]);
 const initial=e.x,hp=e.hp,seen=new Set();let launchX,landX;
 for(let i=0;i<600;i++){
  tick(s,1);if(e.boosterEntry)seen.add('enter');if(e.boosterHidden){seen.add('loaded');expect(enemyDrawing(c).frame).toBeLessThan(2);}
  if(e.type===6){seen.add('flight');launchX??=e.x;expect(Math.sign(e.launchVx)).toBe(direction);expect(enemyDrawing(c).frame).toBe(2);expect(e.y).toBeLessThanOrEqual(groundY(s.platforms,e.x)+.1);}
  if(e.landing>0){seen.add('land');landX??=e.x;expect(e.y).toBeCloseTo(groundY(s.platforms,e.x),4);}
 }
 expect([...seen]).toEqual(['enter','loaded','flight','land']);expect(s.enemies).toEqual([c,e]);expect(e.hp).toBe(hp);expect(s.hostile.filter(q=>q.kind==='clown')).toHaveLength(0);
 expect((landX-launchX)*direction).toBeGreaterThan(160);expect((e.x-landX)*direction).toBeGreaterThan(15);expect((landX-initial)*direction).toBeGreaterThan(230);expect(e.home).toBeCloseTo(landX);expect(e.y).toBeCloseTo(groundY(s.platforms,e.x),4);expect(s.events.filter(k=>(typeof k==='string'?k:k.kind)==='cannon')).toHaveLength(1);
});

test('a larger simulation step still catches the landing on sloped soil',()=>{
 const {s,e}=scene(1,[{x:0,y:540,yEnd:400,w:2000,kind:'earth'}]);tick(s,150,1/30);
 expect(e.type).toBe(0);expect(e.y).toBeCloseTo(groundY(s.platforms,e.x),4);expect(s.enemies).toHaveLength(2);
});

test('the loaded booster faces Hexy if she crosses it before launch',()=>{
 const {s,c,e}=scene();e.x=c.x-50;tick(s,65);expect(e.boosterHidden).toBe(true);
 s.player.x=c.x-330;tick(s,35);expect(e.type).toBe(6);expect(e.launchVx).toBeLessThan(0);expect(c.dir).toBe(-1);expect(s.enemies).toEqual([c,e]);
});

test('a launcher chooses real ground across a gap and respects a raised landing',()=>{
 const {s,e,c}=scene(1,[{x:0,y:480,w:1120,kind:'earth'},{x:1240,y:445,w:600,kind:'stone'}]);
 tick(s,500);expect(e.type).toBe(0);expect(e.home).toBeGreaterThan(1240);expect(e.baseY).toBe(445);expect(s.hostile.filter(q=>q.kind==='clown')).toHaveLength(0);expect(enemyDrawing(c).frame).toBe(2);
});

test('loading excludes restrained clowns and leaves blue acrobats alone',()=>{
 for(const condition of [{type:1},{trap:5},{ribbonBound:5},{ribbonStagger:5},{jellyLift:5}]){
  const {s,e,c}=scene();e.x=c.x-50;Object.assign(e,condition);tick(s,1);
  expect(c.boosterPassenger).toBeUndefined();expect(s.events).not.toContain('cannon');
 }
});

test('a destroyed launcher frees its passenger and a killed passenger cannot launch',()=>{
 for(const target of ['cannon','clown']){
  const {s,c,e}=scene();e.x=c.x-50;tick(s,65);expect(e.boosterHidden).toBe(true);
  (target==='cannon'?c:e).hp=0;tick(s,1);
  expect(e.boosterHidden).toBe(false);expect(e.boosterEntry).toBeUndefined();expect(c.boosterPassenger).toBeNull();expect(e.type).toBe(0);expect(s.events).not.toContain('cannon');
 }
});

test('an airborne boosted clown keeps ordinary enemy damage and defeat',()=>{
 const {s,e}=scene();s.boss.phase='sleep';s.outposts=[];s.supplies=[];s.hazards=[];s.stars=[];s.cages=[];
 tick(s,280);expect(e.type).toBe(6);const hp=e.hp;
 s.shots=[{x:e.x,y:e.y-40,vx:0,vy:0,r:8,damage:1,kind:-1,life:1,age:0,hits:[]}];stepAdventure(s,{},1/120);expect(e.hp).toBe(hp-1);expect(e.flash).toBeGreaterThan(0);
 s.shots=[{x:e.x,y:e.y-40,vx:0,vy:0,r:8,damage:10,kind:-1,life:1,age:0,hits:[]}];stepAdventure(s,{},1/120);expect(e.hp).toBe(0);expect(e.defeated).toBe(true);
});

test('authored launchers have an actual nearby walking patrol',()=>{
 let count=0;
 for(const level of LEVELS)for(const [x,y,t] of level.enemies)if(t===5){
  count++;expect(level.enemies.some(([px,py,type])=>type===0&&Math.abs(px-x)<=160&&Math.abs(py-y)<24)).toBe(true);
 }
 expect(count).toBeGreaterThan(3);
});

test('balloon crew still land with their existing airborne behavior',()=>{
 const {s}=scene();const e=makeEnemy(600,480,6);Object.assign(e,{y:320,vy:-100,balloonCrew:true});s.enemies=[e];tick(s,110);
 expect(e.type).toBe(0);expect(e.y).toBe(480);expect(e.hp).toBe(e.maxHp);expect(s.events).not.toContain('cannon');
});
