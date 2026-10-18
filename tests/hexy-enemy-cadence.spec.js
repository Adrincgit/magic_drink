import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {createAdventure,playerBody} from '../src/components/arcade/adventure/engine/adventureModel';
import {makeEnemy,updateEnemies,enemyShot} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {enemyDrawing} from '../src/components/arcade/adventure/render/adventureSprites';
import {advanceEnemyStride,travelFrame} from '../src/components/arcade/adventure/actors/enemies/actorCadence';
import {harlequinDrawing,updateHarlequin,HARLEQUIN_SPRINT_STRIDE,harlequinHand} from '../src/components/arcade/adventure/actors/bosses/adventureHarlequin';
import {harlequinRushSpeed} from '../src/components/arcade/adventure/actors/bosses/harlequinFire';
import {villageWitchMuzzle,villageClownMuzzle} from '../src/components/arcade/adventure/engine/adventureVillage';
import {bargeHammerLift} from '../src/components/arcade/adventure/render/bargePercussionCanvas';
function flat(type,index=0){
 const s=createAdventure(index),x=2300,y=480;
 s.level={...s.level,route:[{x:0,y,w:10000,baseY:y,kind:'earth'}]};s.platforms=s.level.route;s.graves=[];s.damage=()=>{};
 Object.assign(s.player,{x:x+500,y,ground:0});const e=makeEnemy(x,y,type);Object.assign(e,{timer:99,active:true,walkStride:72,dir:1,acrobatWait:99});s.enemies=[e];return{s,e};
}
const tick=(s,n)=>{for(let i=0;i<n;i++)updateEnemies(s,1/120,playerBody,()=>{});};

test('each gait is one complete atlas cycle; stopped and slowed actors retain their feet',()=>{
 for(const type of [0,1,3,4,8,10,11,14,18,20,21,22,24,25,26,28]){
  const e={type,gait:0};advanceEnemyStride(e,64,.5,64);const start=e.gait;expect(start).toBeGreaterThan(0);advanceEnemyStride(e,0,1,64);expect(e.gait).toBe(start);expect(e.moving).toBe(false);
  const normal={type,gait:0},slow={type,gait:0};advanceEnemyStride(normal,10,.1,64);advanceEnemyStride(slow,2.8,.1,64);expect(slow.gait).toBeLessThan(normal.gait);
 }
});

test('the 12/8/6/4-cel actors use one complete stride without half-cycle wrapping',()=>{
 for(const [type,drawings]of [[0,8],[1,8],[3,8],[4,8],[8,6],[10,8],[11,8],[14,4],[20,12],[25,12],[26,12],[28,12]]){
  const e=makeEnemy(0,480,type);Object.assign(e,{moving:true,phase:'patrol',timer:99,action:0});
  const seen=new Set();for(let i=0;i<drawings;i++){e.gait=(i+.1)/drawings;seen.add(enemyDrawing(e).frame);}
  expect(seen.size,`type ${type}`).toBe(drawings);expect(travelFrame(1,drawings)).toBe(0);
 }
});

test('a trapped basic enemy keeps its location and resumes its distance-based stride',()=>{
 for(const type of [0,1,3,10,11,14]){const {s,e}=flat(type);tick(s,12);e.trap=.5;const x=e.x,gait=e.gait;tick(s,40);expect(e.x,`type ${type}`).toBeCloseTo(x,6);expect(e.gait).toBeCloseTo(gait,6);tick(s,35);expect(e.x).not.toBe(x);}
});

test('village pumpkins and ground witches advance their gait once and freeze it while casting',()=>{
 for(const type of [25,26]){
  const {s,e}=flat(type,7);e.flying=false;const x=e.x;tick(s,60);
  expect(e.gait).toBeCloseTo(Math.abs(e.x-x)/90,6);expect(e.gait).toBeGreaterThan(0);
  e.phase='windup';e.phaseAge=0;e.timer=1;const gait=e.gait;tick(s,20);expect(e.gait).toBe(gait);
 }
});

test('blockade reinforcements have travelling legs during their scripted arrival',()=>{
 const {s,e}=flat(25,7);e.blockadeEntry={age:0,from:e.x,to:e.x-200};e.dir=-1;const x=e.x;tick(s,60);expect(e.gait).toBeCloseTo(Math.abs(e.x-x)/90,6);expect(enemyDrawing(e).key).toBe('village-pumpkin-walk-v1');
});

test('the tall cemetery enemy walks on twelve whole drawings and returns to planted idle',()=>{
 const {s,e}=flat(20,6),frames=new Set();for(let i=0;i<330;i++){tick(s,1);const d=enemyDrawing(e);expect(d.key).toBe('nightmare-tall-walk-v1');frames.add(d.frame);expect(e.y).toBe(480);}
 expect(frames.size).toBe(12);s.player.x=e.x+100;e.timer=99;tick(s,1);expect(e.moving).toBe(false);expect(enemyDrawing(e)).toEqual({key:'nightmare-tall',frame:0});
 for(const kind of ['tall','pumpkin','witch','harvester']){const cells=JSON.parse(fs.readFileSync('context/arcade/enemy-cadence/'+kind+'-walk-registration.json'));expect(cells).toHaveLength(12);expect(new Set(cells.map(q=>q.scale)).size).toBe(1);expect(new Set(cells.map(q=>q.faceX)).size).toBe(1);expect(cells.every(q=>q.top+q.h===250&&q.left>0&&q.left+q.w<256)).toBe(true);}
});

test('diver and boat recoil start on the release drawing independent of their idle clock',()=>{
 for(const clock of [0,.037,.123,8.9]){
  const diver={type:8,hp:1,phase:'attack',action:.22,clock,volleyAge:.28};expect(enemyDrawing(diver).frame).toBe(14);diver.action=.06;expect(enemyDrawing(diver).frame).toBe(16);
  const boat={type:9,hp:1,phase:'attack',action:.3,clock};expect(enemyDrawing(boat).frame).toBe(2);boat.action=.1;expect(enemyDrawing(boat).frame).toBe(3);
 }
});

for(const stage of [1,2,3])for(const dir of [-1,1])test(`arlequin phase ${stage}, direction ${dir}: twelve readable rush cels, original travel and fire trail`,()=>{
 const s=createAdventure(3),b=s.boss,a=s.level.arena;s.damage=()=>{};const speed=harlequinRushSpeed(stage),from=dir>0?a.left+190:a.right-190,to=dir>0?a.right-190:a.left+190,duration=Math.abs(to-from)/speed;
 Object.assign(b,{x:from,y:a.y,stage,hp:b.maxHp*(stage===1?1:stage===2?.6:.25),phase:'attack',move:'dash',dir,originX:from,endX:to,duration,timer:duration,attackClock:0,sprintDistance:0,fireDistance:0,shotClock:99});
 const frames=new Set();let last=-1,changes=0,elapsed=0;for(let i=0;i<120;i++){updateHarlequin(s,1/120,{body:playerBody},enemyShot);elapsed+=1/120;const d=harlequinDrawing(s);if(b.phase!=='attack')break;frames.add(d.frame);if(last>=0&&last!==d.frame)changes++;last=d.frame;}
 expect(frames.size).toBe(12);expect(speed/HARLEQUIN_SPRINT_STRIDE*12).toBeCloseTo([18,21,24][stage-1],6);expect(changes).toBeLessThanOrEqual(24);expect(Math.abs(b.x-from)).toBeCloseTo(speed*elapsed,3);expect(s.hostile.some(q=>q.kind==='harlequin-groundfire'&&q.source==='rush'&&q.stage===stage)).toBe(true);expect(harlequinDrawing(s,true).frame).toBe(0);
});

for(const move of ['fan','ribbon'])test(`arlequin ${move}: release pose, muzzle and recovery follow the actual volley`,()=>{
 const s=createAdventure(3),b=s.boss;s.damage=()=>{};Object.assign(b,{stage:1,phase:'warn',move,timer:.001,warnDuration:1,turn:0});s.player.x=b.x-300;let count=0;
 for(let i=0;i<350;i++){const before=s.hostile.length;updateHarlequin(s,1/120,{body:playerBody},enemyShot);if(s.hostile.length>before){count++;const d=harlequinDrawing(s),h=harlequinHand(b,move==='ribbon');expect(d.frame).toBe((move==='fan'?16:24)+4);for(const q of s.hostile.slice(before)){expect(q.x).toBeCloseTo(h.x,5);expect(q.y).toBeCloseTo(h.y,5);}}if(b.phase==='recover'){expect(harlequinDrawing(s).key).toContain('motion-fluid');break;}}
 expect(count).toBeGreaterThan(1);
});

test('village attack release still uses its measured wand and lantern origin',()=>{
 for(const type of [25,26])for(const flying of type===26?[false,true]:[false]){
  const {s,e}=flat(type,7);Object.assign(e,{flying,phase:'windup',phaseAge:1.2,timer:0,castMode:'ray',candyAim:{x:s.player.x,y:450},witchObservedHp:e.hp});tick(s,1);const origin=type===25?villageClownMuzzle(e):villageWitchMuzzle(e);
  expect(s.hostile.length).toBeGreaterThan(0);for(const shot of s.hostile){expect(shot.x).toBeCloseTo(origin.x,5);expect(shot.y).toBeCloseTo(origin.y,5);}expect(enemyDrawing(e).frame).toBe(type===25?12:flying?9:8);
 }
});

test('ordinary combat types through 2-2 select finite atlas cells in every available action',()=>{
 for(const type of [...Array(15).keys(),18,19,20,21,22,23,24,25,26,27,28])for(const phase of ['patrol','windup','attack','recover']){
  const e=makeEnemy(0,480,type);Object.assign(e,{gait:.4,phase,phaseAge:.2,phaseDuration:1,active:true,moving:true,clock:2,fireAge:.2,timer:.3,action:phase==='attack'?.15:0});const d=enemyDrawing(e);expect(d.key,`type ${type}, ${phase}`).toBeTruthy();expect(Number.isInteger(d.frame)).toBe(true);expect(d.frame).toBeGreaterThanOrEqual(0);
 }
});

test('the autonomous painted beater releases with the actual sonic pulse',()=>{
 for(const clock of [0,.013,.17,50.4]){const b={move:'drumroll',phase:'attack',release:.25,clock};expect(bargeHammerLift(b)).toBe(0);b.release=0;b.shotClock=.1;b.beatInterval=.64;expect(bargeHammerLift(b)).toBeGreaterThan(.8);}
});
