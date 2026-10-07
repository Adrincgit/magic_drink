import {test,expect} from '@playwright/test';
import {createAdventure,stepAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {groundY,groundAt,sceneryPlacement} from '../src/components/arcade/adventure/world/adventureTerrain';
import {buddyPosition} from '../src/components/arcade/adventure/engine/adventureDefense';
const clean=()=>{const s=createAdventure();s.enemies=[];s.outposts=[];s.hazards=[];s.pickups=[];s.supplies=[];s.boss.hp=0;s.level={...s.level,arena:{...s.level.arena,entry:Infinity}};return s;};
const tick=(s,input,n=1)=>{for(let i=0;i<n;i++)stepAdventure(s,input,1/120);};

test('walking and rolling remain planted across uphill and downhill joins in both directions',()=>{
 const s=clean(),heights=new Set();
 for(let i=0;i<5200;i++){
  tick(s,{right:true});if(s.player.x>10900)break;
  expect(s.player.ground).not.toBeNull();expect(s.player.y).toBeCloseTo(groundY(s.platforms,s.player.x),5);expect(s.player.jumps).toBe(0);heights.add(Math.round(s.player.y));
 }
 expect(Math.min(...heights)).toBe(390);expect(Math.max(...heights)).toBe(480);
 for(let i=0;i<4800;i++){tick(s,{left:true,dash:i%180===0});expect(s.player.ground).not.toBeNull();expect(s.player.y).toBeCloseTo(groundY(s.platforms,s.player.x),5);}
 expect(s.hearts).toBe(5);
});

test('jumping from slopes still permits a somersault and lands on the correct local surface',()=>{
 for(const x of [1100,2050,5000,5900,7000,9700]){
  const s=clean(),p=s.player;p.x=x;p.y=groundY(s.platforms,x);p.ground=s.platforms.indexOf(groundAt(s.platforms,x));
  tick(s,{right:true,jump:true},15);expect(p.ground).toBeNull();expect(p.jumps).toBe(1);
  tick(s,{right:true},1);tick(s,{right:true,jump:true},1);expect(p.jumps).toBe(2);expect(p.spin).toBeGreaterThan(0);
  tick(s,{right:true},160);expect(p.ground).not.toBeNull();expect(p.y).toBeCloseTo(groundY(s.platforms,p.x),5);
 }
});

test('near tree roots share terrain displacement while the opening remains an open field',()=>{
 const s=clean(),trees=s.level.scenery.filter(p=>p.kind==='trees');expect(Math.min(...trees.map(p=>p.x))).toBeGreaterThanOrEqual(1500);
 for(const prop of s.level.scenery){
  expect(prop.depth).toBe(1);expect(prop.y-groundY(s.platforms,prop.x)).toBeGreaterThanOrEqual(20);
  const before=sceneryPlacement(prop,{x:830,y:30}),after=sceneryPlacement(prop,{x:1010,y:-20});
  expect(after.x-before.x).toBe(-180);expect(after.y-before.y).toBe(50);
 }
 expect(s.level.forestEdge.start).toBeGreaterThan(s.level.width*.65);expect(s.level.forestEdge.speed).toBeGreaterThan(s.level.world.farSpeed);expect(s.level.forestEdge.speed).toBeLessThan(1);
});

test('ground enemies and companions follow local slopes instead of floating at the old height',()=>{
 const s=createAdventure();s.hazards=[];s.player.hurt=100;s.player.x=1150;s.player.y=groundY(s.platforms,1150);s.player.ground=s.platforms.indexOf(groundAt(s.platforms,1150));s.rescued=3;
 tick(s,{},120);
 for(const e of s.enemies.filter(e=>[0,3,5].includes(e.type)))expect(e.y).toBeCloseTo(groundY(s.platforms,e.x),4);
 for(let i=0;i<3;i++){const buddy=buddyPosition(s,i);expect(buddy.y).toBeCloseTo(groundY(s.platforms,buddy.x),5);}
});
