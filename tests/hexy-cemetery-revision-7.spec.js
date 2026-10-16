import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {createAdventure,stepAdventure,playerBody,retryAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {makeEnemy,updateEnemies} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {nightmareDrawing} from '../src/components/arcade/adventure/actors/enemies/adventureNightmares';
import {enemyBody} from '../src/components/arcade/adventure/actors/enemies/adventureEnemyGeometry';
import {beginNightmareDefeat,NIGHTMARE_REMAINS_TIME} from '../src/components/arcade/adventure/engine/adventureNightmareMotion';
import {stepGraveyard,damageGrave,CRYPT_PROCESSION,CRYPT_OPEN_TIME} from '../src/components/arcade/adventure/engine/adventureGraveyard';
import {damageSupply} from '../src/components/arcade/adventure/world/adventureSupplies';
import {takeLoot} from '../src/components/arcade/adventure/engine/adventureLoot';
import {groundY,surfaceY} from '../src/components/arcade/adventure/world/adventureTerrain';
const scene=(x=7200)=>{const s=createAdventure(6);for(const k of ['enemies','graves','stars','cages','pickups','supplies'])s[k]=[];s.damage=()=>{};Object.assign(s.player,{x,y:groundY(s.level.route,x),ground:s.platforms.findIndex(q=>q.kind==='earth'&&x>=q.x&&x<q.x+q.w),hurt:999});return s;};
const tick=(s,seconds)=>{for(let i=0;i<Math.round(seconds*120);i++){s.time+=1/120;updateEnemies(s,1/120,playerBody,()=>{});}};
const kill=(s,e)=>{Object.assign(e,{hp:0,defeated:true,trap:0});beginNightmareDefeat(s,e);};

test('1: closed crypt bursts open before fog and a bounded mixed procession walks from inside the threshold',()=>{
 const s=scene(9380),q=createAdventure(6).graves.find(q=>q.kind==='crypt');s.graves=[q];
 tick(s,4.1);expect(q.phase).toBe('warning');expect(s.enemies).toHaveLength(0);tick(s,.15);expect(q.phase).toBe('opening');expect(CRYPT_OPEN_TIME).toBeLessThan(.5);
 tick(s,.45);expect(q.phase).toBe('mist');expect(s.enemies).toHaveLength(0);tick(s,.8);const e=s.enemies[0];expect(e.phase).toBe('manifest');expect(e.x).toBeGreaterThan(q.x-120);expect(e.y).toBeLessThan(q.y-20);expect(e.cryptScale).toBeLessThan(.7);expect(enemyBody(e).w).toBe(0);
 tick(s,1.6);expect(e.x).toBeLessThan(q.x-195);expect(e.cryptScale).toBeGreaterThan(.94);tick(s,9);expect(q.spawned).toBe(8);expect(s.enemies.filter(e=>e.graveId===q.index).map(e=>e.type)).toEqual(CRYPT_PROCESSION);
 damageGrave(s,q,1000);const count=q.spawned;tick(s,15);expect(q.spawned).toBe(count);
});

test('2 and 10: a one-shot hand plays four defeat cels and leaves its clothed sleeve on the floor for 28 seconds',()=>{
 const s=scene(),e=makeEnemy(7400,525,24);s.enemies=[e];e.active=true;
 s.shots.push({x:e.x,y:e.y-12,vx:0,vy:0,r:10,life:1,age:0,kind:-1,damage:2,hits:[]});stepAdventure(s,{},1/120);expect(e.hp).toBe(0);
 const frames=new Set();for(let i=0;i<78;i++){frames.add(nightmareDrawing(e).frame);tick(s,1/120);}expect([...frames]).toEqual([8,9,10,11]);expect(s.looseBones).toHaveLength(1);const b=s.looseBones[0];expect(b.key).toBe('nightmare-clothed-limbs-v7');expect(b.life).toBeCloseTo(NIGHTMARE_REMAINS_TIME,0);
 tick(s,20);expect(s.looseBones).toContain(b);expect(b.settled).toBe(true);tick(s,10);expect(s.looseBones).not.toContain(b);
});

test('4: skeleton throws a three-bone volley with three complete anticipations before a longer pause',()=>{
 const s=scene(),e=makeEnemy(7460,525,22);Object.assign(e,{active:true,timer:0});s.enemies=[e];const shotTimes=[];let old=0;
 for(let i=0;i<960;i++){tick(s,1/120);if(s.hostile.length>old){shotTimes.push(i/120);old=s.hostile.length;}if(shotTimes.length===4)break;}
 expect(shotTimes).toHaveLength(4);expect(shotTimes[1]-shotTimes[0]).toBeGreaterThan(1);expect(shotTimes[2]-shotTimes[1]).toBeLessThan(1.4);expect(shotTimes[3]-shotTimes[2]).toBeGreaterThan(2.8);expect(s.hostile.every(q=>q.kind==='bone')).toBe(true);
});

test('4: a crumbled skeleton releases skull, two arms and two legs; each moves and dies to one actual basic shot',()=>{
 const s=scene(),e=makeEnemy(7500,525,22);s.enemies=[e];kill(s,e);tick(s,.7);const parts=s.enemies.filter(e=>e.fragmentKind);expect(parts.map(e=>e.fragmentKind)).toEqual(['skull','arm','arm','leg','leg']);const starts=parts.map(e=>e.x);tick(s,.6);expect(parts.every((e,i)=>Math.abs(e.x-starts[i])>10)).toBe(true);
 for(const part of parts){s.enemies=[part];part.trap=10;const b=enemyBody(part);s.shots=[{x:b.x+b.w/2,y:b.y+b.h/2,vx:0,vy:0,r:10,life:1,age:0,kind:-1,damage:2,hits:[]}];stepAdventure(s,{},1/120);expect(part.hp).toBe(0);}
});

test('4: skeletal fragments settle after a bounded lifetime and never spawn during a boss purge',()=>{
 const s=scene(),e=makeEnemy(7520,525,22);s.enemies=[e];kill(s,e);tick(s,18);expect(s.enemies).toHaveLength(0);expect(s.looseBones.length).toBeGreaterThanOrEqual(5);
 const t=scene(),q=makeEnemy(7500,525,22);t.enemies=[q];t.nightmarePurged=true;kill(t,q);tick(t,5);expect(t.enemies).toHaveLength(0);expect(t.looseBones).toHaveLength(0);
});

test('6: zombie health is x3 normal, ghosts remain two hits; five crates include two guaranteed level-2 drinks; claimed crates stay claimed on retry',()=>{
 const s=createAdventure(6);expect(makeEnemy(0,0,18).hp).toBeCloseTo(makeEnemy(0,0,0).hp*3);expect(makeEnemy(0,0,19).hp).toBe(4);expect(s.supplies).toHaveLength(5);const crates=s.supplies.filter(q=>q.loot?.boosted);expect(crates).toHaveLength(2);
 for(const q of crates){damageSupply(s,q,4);const drop=s.pickups.at(-1);expect(drop.boosted).toBe(true);takeLoot(s,drop);expect(s.drinkTier).toBe(2);}
 retryAdventure(s);expect(s.supplies.filter(q=>q.loot?.boosted&&q.hp>0)).toHaveLength(0);expect(createAdventure(6).supplies.filter(q=>q.loot?.boosted)).toHaveLength(2);expect(s.enemies.filter(e=>e.type===18).length).toBeGreaterThanOrEqual(10);
});

test('7 and 9: arm and leg loss use eight reaction cels, then release clothed parts exactly once and prevent jumping',()=>{
 for(const variant of [0,3,4]){
  const s=scene(),e=makeEnemy(7440,525,18);Object.assign(e,{active:true,nightmareVariant:variant,armMissing:false,hp:variant===4?4:8,lunger:true});s.enemies=[e];const frames=new Set();
  for(let i=0;i<140;i++){tick(s,1/120);const d=nightmareDrawing(e);if(d.key==='nightmare-zombie-reactions-v8')frames.add(d.frame);expect(e.phase).not.toBe('lunge');}
  expect(frames.size).toBe(8);const detached=s.looseBones.filter(b=>b.key==='nightmare-clothed-limbs-v7');expect(detached.length+s.enemies.filter(q=>q.type===24).length).toBe(1);expect(s.looseBones.every(b=>b.key==='nightmare-clothed-limbs-v7')).toBe(true);if(variant===4)expect(e.type).toBe(21);
 }
});

test('8: a zombie beneath a high branch reaches upward without alternating direction, then follows a departing Hexy',()=>{
 for(const props of [{},{armMissing:true},{type:21,legLost:true}]){
  const s=scene(),b=s.platforms.find(q=>q.kind==='nightmare-branch'&&q.tree===3&&q.side===1),x=b.x+b.w/2;Object.assign(s.player,{x,y:surfaceY(b,x),ground:s.platforms.indexOf(b)});const e=makeEnemy(x+3,groundY(s.level.route,x),18);Object.assign(e,{active:true,nightmareVariant:0,dir:-1,...props});s.enemies=[e];const dirs=new Set();
  for(let i=0;i<600;i++){s.player.x=x+Math.sin(i)*8;tick(s,1/120);dirs.add(e.dir);expect(e.y).toBeCloseTo(groundY(s.level.route,e.x));}expect(e.phase).toBe('reachUp');expect(dirs.size).toBe(1);expect(e.x).toBeCloseTo(x+3);
  s.player.x=x+180;tick(s,.5);expect(e.dir).toBe(1);expect(e.x).toBeGreaterThan(x+10);
 }
});
