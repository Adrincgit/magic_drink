import {test,expect} from '@playwright/test';
import {createAdventure,stepAdventure,playerBody} from '../src/components/arcade/adventure/engine/adventureModel';
import {bargeCollision,bargeFragments,bargeRig} from '../src/components/arcade/adventure/actors/bosses/adventureBarge';
import {stepWorldEffects} from '../src/components/arcade/adventure/engine/adventureEffects';
import {harborMooring} from '../src/components/arcade/adventure/render/adventureHarborCanvas';
import {riverBridgePiers} from '../src/components/arcade/adventure/render/adventureRiverCanvas';

test('running and dashing into the arriving barge cannot cross its hull or cause an intro hit',()=>{
 const s=createAdventure(2),a=s.level.arena;
 for(const key of ['enemies','outposts','supplies','hazards','stars','cages'])s[key]=[];
 Object.assign(s.player,{x:a.entry+150,y:a.y,ground:s.platforms.findIndex(q=>q.x===a.left)});
 for(let i=0;i<565;i++){
  stepAdventure(s,{right:true,dash:i%90<45},1/120);
  const p=playerBody(s.player),b=bargeCollision(s);
  expect(p.x+p.w).toBeLessThanOrEqual(b.x);
  expect(s.hearts).toBe(s.maxHearts);
 }
 expect(s.boss.phase).toBe('intro');
});

test('the transforming hull remains solid without dealing presentation damage',()=>{
 const s=createAdventure(2),a=s.level.arena;
 for(const key of ['enemies','outposts','supplies','hazards','stars','cages'])s[key]=[];
 Object.assign(s.boss,{engaged:true,hp:150,phase:'recover',timer:10});s.arenaLocked=true;
 Object.assign(s.player,{x:s.boss.x-295,y:a.y,ground:s.platforms.findIndex(q=>q.x===a.left)});
 for(let i=0;i<240;i++){
  stepAdventure(s,{right:true,dash:i%90<45},1/120);
  const p=playerBody(s.player);expect(p.x+p.w).toBeLessThanOrEqual(bargeCollision(s).x);
  expect(s.hearts).toBe(s.maxHearts);
 }
 expect(s.boss.phase).toBe('transform');
});

test('barge fragments splash once and sink; organ debris still bounces on its own floor',()=>{
 const s=createAdventure(2),floor=s.level.arena.y;
 bargeFragments(s,'barge-wheel',{x:0,y:floor-70,w:60,h:60},1,1);
 const wreck=s.organDebris[0];wreck.vy=160;let splashes=0,touched=false;
 for(let i=0;i<300;i++){
  s.events=[];stepWorldEffects(s,1/120);splashes+=s.events.filter(q=>q==='bargeSplash').length;
  if(wreck.submerged){touched=true;expect(wreck.vy).toBeGreaterThan(0);expect(wreck.bounced).toBeFalsy();}
 }
 expect(touched).toBe(true);expect(splashes).toBe(1);expect(s.organDebris).toHaveLength(0);
 const wheel={art:'organ-wheel',x:0,y:floor,w:40,h:40,vx:100,vy:50,rotation:0,spin:1,life:3,age:0,floor};
 s.organDebris=[wheel];stepWorldEffects(s,1/120);expect(wheel.bounced).toBe(true);expect(wheel.vy).toBeLessThan(0);
});

test('cannon recoils backwards and tilts towards the visible launch direction',()=>{
 const s=createAdventure(2);Object.assign(s.boss,{phase:'warn',move:'mortar',release:0});
 const ready=bargeRig(s);s.boss.release=.25;const fired=bargeRig(s);
 expect(fired.muzzle.x).toBeGreaterThan(ready.muzzle.x);
 expect(ready.muzzle.y).toBeLessThan(ready.cannon.y);
 s.boss.move='tidal';const low=bargeRig(s);expect(low.muzzle.y).toBeGreaterThan(low.cannon.y);
});

test('moored boats attach to real painted piers independently of camera movement',()=>{
 const s=createAdventure(2),img={width:2172,height:724};
 for(const q of s.level.harborProps.filter(q=>q.kind==='harbor-boat')){
  const tie=harborMooring(s,q,img),bridge=s.platforms.find(p=>p.bridge&&q.x>=p.x&&q.x<p.x+p.w);
  expect(riverBridgePiers(bridge,img).some(p=>p.x===tie.x)).toBe(true);
  Object.assign(s.camera,{x:q.x+300,y:-300,backdropY:100,zoom:.52});s.time+=10;
  expect(harborMooring(s,q,img)).toEqual(tie);
 }
});
