import {test,expect} from '@playwright/test';
import {createAdventure,stepAdventure,retryAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {updateBoss,enemyShot} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {balloonCrewDrawing} from '../src/components/arcade/adventure/actors/bosses/adventureBalloonCrew';
import {prepareBombardment,stepBombardment} from '../src/components/arcade/adventure/actors/bosses/adventureBombardment';
const helpers={say:()=>{},particles:()=>{},body:()=>({x:0,y:0,w:0,h:0})};
const clean=()=>{const s=createAdventure();for(const key of ['enemies','outposts','pickups','supplies','hazards','stars'])s[key]=[];return s;};

test('both minibosses keep their increased health in gentle mode and retry',()=>{
 for(const gentle of [false,true]){const s=createAdventure(0,gentle);expect(s.boss.hp).toBeCloseTo((gentle?92:140)*1.15*1.44*1.15);s.boss.hp=1;retryAdventure(s);expect(s.boss.hp).toBe(s.boss.maxHp);expect(createAdventure(1,gentle).boss.hp).toBeCloseTo((gentle?110:164)*1.44*1.15);}
 const s=clean();s.player.x=s.level.arena.entry;s.damage=()=>{};Object.assign(s.boss,{phase:'recover',timer:10,hp:s.boss.maxHp/2+.1});updateBoss(s,.01,helpers);expect(s.boss.transformed).toBeFalsy();s.boss.hp=s.boss.maxHp/2;updateBoss(s,.01,helpers);expect(s.boss.transformed).toBe(true);
});

test('held, thrown and pass bombs gain ten percent while circus balls keep their size',()=>{
 const s=clean(),b=s.boss,a=s.level.arena;s.player.x=a.left+200;s.damage=()=>{};
 Object.assign(b,{phase:'attack',move:'bombs',timer:2,shotClock:.001,attackClock:0,crewDir:-1});
 for(const q of balloonCrewDrawing(s))expect(q.held.size).toBeCloseTo(61.6);
 updateBoss(s,1/120,helpers);for(const q of s.hostile){expect(q.drawSize).toBeCloseTo(61.6);expect(q.r).toBeCloseTo(20.9);}
 s.hostile=[];b.move='bombing-run';b.phase='warn';s.camera.x=a.left;prepareBombardment(s);for(let i=0;i<220;i++)stepBombardment(s,1/120,enemyShot);
 expect(s.hostile.length).toBeGreaterThan(3);for(const q of s.hostile){expect(q.drawSize).toBeCloseTo(52.8);expect(q.r).toBeCloseTo(17.6);expect(q.gap).toBe(b.bombRun.gap);}
 b.move='balls';b.phase='warn';b.release=0;b.timer=.4;expect(balloonCrewDrawing(s).every(q=>q.held.size===56)).toBe(true);
});

test('ordinary bomb impacts emit two larger flames which still damage the player',()=>{
 const s=clean();s.player.x=570;s.player.y=480;s.player.ground=null;s.player.hurt=0;
 s.hostile=[{x:650,y:480,floor:480,kind:'bomb',vx:0,vy:0,r:19,life:2,age:0}];stepAdventure(s,{},1/120);
 const fire=s.hostile.filter(q=>q.kind==='wave');expect(fire).toHaveLength(2);for(const q of fire){expect(q.drawSize).toBeCloseTo(94.6*1.15);expect(q.r).toBeCloseTo(25.3*1.15);}
 const hp=s.hearts;for(let i=0;i<80;i++)stepAdventure(s,{},1/120);expect(s.hearts).toBeLessThan(hp);
});

test('both aerial passes emit fire and keep the escape corridor usable at different frame rates',()=>{
 for(const fps of [60,120,240]){
  const s=clean(),a=s.level.arena;s.camera.x=a.left;s.player.x=a.left+450;s.player.y=a.y;s.arenaLocked=true;
  Object.assign(s.boss,{phase:'warn',move:'bombing-run',transformed:true,hp:50,engaged:true});prepareBombardment(s);s.player.x=s.boss.bombRun.gap;const hp=s.hearts,passes=new Set(),directions=new Set();
  for(let i=0;i<fps*6;i++){stepAdventure(s,{},1/fps);for(const q of s.hostile)if(q.carpetFire){passes.add(s.boss.bombRun.pass);directions.add(Math.sign(q.vx));expect(q.life).toBeLessThanOrEqual(.48);}}
  expect([...passes].sort()).toEqual([0,1]);expect(directions.size).toBe(2);expect(s.hearts).toBe(hp);
 }
});
