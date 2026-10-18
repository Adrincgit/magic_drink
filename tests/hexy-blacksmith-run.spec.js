import {test,expect} from '@playwright/test';
import sharp from 'sharp';
import {createAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {stepVillageCrowd} from '../src/components/arcade/adventure/engine/villageCrowd';
import {groundY} from '../src/components/arcade/adventure/world/adventureTerrain';
import {villageVillagerProfile,villageVillagerRunFrame} from '../src/components/arcade/adventure/actors/villageVillagers';

function scene(speed){
 const s=createAdventure(7),x=3500;s.villageObstacles=[];s.carriages=[];s.camera.x=x-240;
 const n={...s.level.villagers.find(q=>q.style===6),x,y:groundY(s.level.route,x),speed,state:'flee',gait:0,runAge:0,age:0,warned:true,tripped:true,safeX:-1000};s.villagers=[n];return{s,n};
}

for(const hz of [30,60,120])test(`blacksmith visits all twelve drawings with the same footfalls and travel at ${hz} Hz`,()=>{
 const p=villageVillagerProfile(6),speed=p.stride,hops=new Set(),{s,n}=scene(speed),footfalls=[];
 expect(p.runFrames).toBe(12);expect(p.runByDistance).toBe(true);
 for(let frame=0;frame<hz*2;frame++){
  stepVillageCrowd(s,1/hz);hops.add(villageVillagerRunFrame(n));
  for(const d of s.villageDust.filter(d=>d.age===0))footfalls.push(Math.floor(n.gait*12)%12);
 }
 expect([...hops].sort((a,b)=>a-b)).toEqual(Array.from({length:12},(_,i)=>i));
 expect(3500-n.x).toBeCloseTo(p.stride*2,5);expect(footfalls).toEqual([1,7,1,7]);
});

test('the same distance gives the same leg phase at different speeds, and stopped feet freeze',()=>{
 const p=villageVillagerProfile(6),poses=[];
 // Sample inside a drawing's interval, away from a floating-point boundary.
 for(const [speed,steps]of [[p.stride/2,144],[p.stride,72],[p.stride*2,36]]){
  const {s,n}=scene(speed);for(let i=0;i<steps;i++)stepVillageCrowd(s,1/120);poses.push(villageVillagerRunFrame(n));
  const gait=n.gait,frame=villageVillagerRunFrame(n);n.speed=0;
  for(let i=0;i<120;i++)stepVillageCrowd(s,1/120);
  expect(n.gait).toBe(gait);expect(villageVillagerRunFrame(n)).toBe(frame);expect(s.villageDust).toHaveLength(0);
 }
 expect(poses).toEqual([7,7,7]);expect(villageVillagerRunFrame({style:6,gait:.8},true)).toBe(0);
});

test('the run atlas has twelve complete transparent cels with safe outer gutters',async()=>{
 const path='public/arcade/sprites/enemies/village-blacksmith-run-v9.webp',meta=await sharp(path).metadata();expect([meta.width,meta.height,meta.hasAlpha]).toEqual([1024,768,true]);
 const {data,info}=await sharp(path).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 for(let f=0;f<12;f++){
  let pixels=0;for(let y=0;y<256;y++)for(let x=0;x<256;x++){
   const a=data[((Math.floor(f/4)*256+y)*info.width+f%4*256+x)*4+3];
   if(x<2||x>253||y<2||y>253)expect(a).toBe(0);if(a>120)pixels++;
  }
  expect(pixels).toBeGreaterThan(14000);
 }
});
