import {test,expect} from '@playwright/test';
import {createAdventure,stepAdventure,retryAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {LEVELS} from '../src/components/arcade/adventure/world/adventureLevels';
import {surfaceY} from '../src/components/arcade/adventure/world/adventureTerrain';
import {damageSupply} from '../src/components/arcade/adventure/world/adventureSupplies';
import {takeLoot} from '../src/components/arcade/adventure/engine/adventureLoot';
import {stepCircusEntrance} from '../src/components/arcade/adventure/engine/adventureCircusEntrance';

for(let index=0;index<LEVELS.length;index++){
 test(`level ${index}: one grounded midpoint heart and retry ignores old checkpoints`,()=>{
  const s=createAdventure(index),start={...s.player},camera={...s.camera};
  const hearts=s.supplies.filter(q=>q.loot?.type==='heart');
  expect(hearts).toHaveLength(s.level.bossOnly?0:1);
  if(hearts.length){
   const q=hearts[0],middle=(start.x+s.level.exit[0])/2;
   expect(Math.abs(q.x-middle)).toBeLessThan(650);
   expect(s.platforms.some(p=>q.x>=p.x+32&&q.x<=p.x+p.w-32&&Math.abs(surfaceY(p,q.x)-q.y)<1)).toBe(true);
  }
  s.player.x=s.level.arena.entry;s.hearts=0;s.done=true;s.boss.hp=1;
  s.checkpointAt=[s.level.arena.entry,s.level.arena.y];s.checkpoint=true;
  s.stars[0]&&(s.stars[0].taken=true);s.starMoney=19;s.bankedStars=12;
  s.hostile.push({kind:'bomb'});s.player.candy={age:1};
  retryAdventure(s);
  expect(s.player.x).toBe(start.x);expect(s.player.y).toBe(start.y);
  expect(s.camera).toEqual(camera);expect(s.hearts).toBe(s.maxHearts);
  expect(s.boss.hp).toBe(s.boss.maxHp);expect(s.hostile).toEqual([]);
  expect(s.checkpointAt).toBeUndefined();expect(s.checkpoint).toBeUndefined();
  expect(s.player.candy).toBeUndefined();expect(s.starMoney).toBe(19);expect(s.bankedStars).toBe(12);
  if(s.stars.length)expect(s.stars[0].taken).toBe(true);
 });
}

test('crossing every former meadow flag does not heal or activate a checkpoint',()=>{
 const s=createAdventure();s.hearts=2;s.enemies=[];s.outposts=[];s.supplies=[];s.stars=[];s.hazards=[];
 for(const [x,y] of s.level.checkpoints){
  Object.assign(s.player,{x:x+5,y,ground:s.platforms.findIndex(p=>x>=p.x&&x<p.x+p.w),hurt:99});
  stepAdventure(s,{},1/120);
  expect(s.hearts).toBe(2);expect(s.checkpointAt).toBeUndefined();expect(s.notice).not.toBe('checkpoint');
 }
});

test('entering the circus does not save a respawn point; all tents return on defeat',()=>{
 const s=createAdventure(3),door=s.level.circusEntrance;
 Object.assign(s.player,{x:door.trigger,y:480,ground:0});
 for(let i=0;i<260;i++)stepCircusEntrance(s,1/120);
 expect(s.player.x).toBe(door.insideX);expect(s.checkpointAt).toBeUndefined();
 for(const t of s.campTents)t.state='cleared';
 retryAdventure(s);expect(s.player.x).toBe(s.level.spawn[0]);expect(s.campTents.every(t=>t.state==='closed')).toBe(true);
});

test('recovery needs crate destruction and pickup, restores one heart, renews once per attempt',()=>{
 const s=createAdventure(),box=s.supplies.find(q=>q.midpointHeart);s.hearts=1;
 damageSupply(s,box,3);expect(s.pickups).toHaveLength(0);expect(s.hearts).toBe(1);
 damageSupply(s,box,1);damageSupply(s,box,99);
 expect(s.pickups.filter(q=>q.type==='heart')).toHaveLength(1);expect(s.hearts).toBe(1);
 const drop=s.pickups[0];takeLoot(s,drop);expect(s.hearts).toBe(2);takeLoot(s,drop);expect(s.hearts).toBe(2);
 for(let i=0;i<3;i++){
  retryAdventure(s);expect(s.pickups.filter(q=>q.midpointHeart)).toHaveLength(0);
  const crates=s.supplies.filter(q=>q.midpointHeart);expect(crates).toHaveLength(1);expect(crates[0].hp).toBe(4);
  s.hearts=s.maxHearts;damageSupply(s,crates[0],4);takeLoot(s,s.pickups.at(-1));expect(s.hearts).toBe(s.maxHearts);
 }
});

test('retry resets civilian danger, breakable obstacles and boss transitions, keeps claimed rewards',()=>{
 for(const index of [7,8,9]){
  const s=createAdventure(index),initial=createAdventure(index);
  if(s.villagers?.length){s.villagers[0].state='candy';s.villagers[0].curseOwner='removed';s.village.furthest=19000;}
  const block=s.platforms.find(p=>p.hp);if(block)block.hp=0;
  s.boss.phase='attack';s.boss.transformed=true;s.superCinematic={age:3};
  retryAdventure(s);
  expect(s.boss.phase).toBe('sleep');expect(s.boss.transformed).toBeUndefined();expect(s.superCinematic).toBeUndefined();
  if(s.villagers?.length)expect(s.villagers).toEqual(initial.villagers);
  expect(s.platforms).toEqual(initial.platforms);
 }
});

test('Hexy can shoot open the midpoint crate and collect its heart by walking over it',()=>{
 const s=createAdventure(),box=s.supplies.find(q=>q.midpointHeart);
 for(const key of ['enemies','outposts','stars','hazards','cages'])s[key]=[];
 Object.assign(s.player,{x:box.x-150,y:box.y,ground:null,dir:1,hurt:99});s.hearts=2;
 for(let i=0;i<240&&box.hp>0;i++)stepAdventure(s,{attack:true},1/120);
 expect(box.hp).toBe(0);expect(s.hearts).toBe(2);
 for(let i=0;i<150&&!s.pickups.some(q=>q.midpointHeart&&q.taken);i++)stepAdventure(s,{right:true},1/120);
 expect(s.pickups.find(q=>q.midpointHeart).taken).toBe(true);expect(s.hearts).toBe(3);expect(s.checkpointAt).toBeUndefined();
});
