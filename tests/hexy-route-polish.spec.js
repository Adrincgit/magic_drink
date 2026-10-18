import {test,expect} from '@playwright/test';
import {createAdventure,stepAdventure,retryAdventure,adventureCarry} from '../src/components/arcade/adventure/engine/adventureModel';
import {hexyPose,hexyMuzzle} from '../src/components/arcade/adventure/actors/hexy/hexyAnimation';
import {beginCompletion} from '../src/components/arcade/adventure/engine/adventureCompletion';
import {beginPlayerDefeat} from '../src/components/arcade/adventure/engine/playerDefeat';
import {beginSuper} from '../src/components/arcade/adventure/engine/adventureSuper';
import {SUPER_WINDUP} from '../src/components/arcade/adventure/engine/adventureSuperTiming';
import {projectileWaterContact} from '../src/components/arcade/adventure/engine/adventureWaterContact';
import {firePopcorn} from '../src/components/arcade/adventure/engine/adventurePopcorn';
import {stepActorSurfaceFeedback,stepSurfaceFeedback,surfaceMaterial} from '../src/components/arcade/adventure/engine/adventureSurfaceFeedback';
import {stepBargeProjectile,bargeRig} from '../src/components/arcade/adventure/actors/bosses/adventureBarge';
import {spoutPoint} from '../src/components/arcade/adventure/actors/bosses/bargeWaterAttacks';
import {surfaceY} from '../src/components/arcade/adventure/world/adventureTerrain';

const tick=(s,input={},n=1)=>{for(let i=0;i<n;i++)stepAdventure(s,input,1/120);};
const quiet=(index=0)=>{const s=createAdventure(index);for(const k of ['enemies','outposts','hazards','stars','pickups','supplies','graves','campTents'])s[k]=[];return s;};

test('a moving quick tap, strong tap and popcorn kick retain running legs',()=>{
 const s=quiet(),p=s.player;Object.assign(p,{vx:255,ground:0,cast:.2,firing:false,land:.1});
 expect(hexyPose(s).sheet).toBe('run-fire');p.cast=0;expect(hexyPose(s).sheet).toBe('run');
 Object.assign(p,{specialCast:.35,specialAimX:1,specialAimY:0});expect(hexyPose(s).sheet).toBe('run-fire');
 Object.assign(p,{specialAimY:-Math.SQRT1_2});expect(hexyPose(s).sheet).toBe('run-diagonal-up');
 Object.assign(p,{specialCast:0,popcornRecoilUntil:1,popcornRecoilStart:0,popcornRecoilAir:false});expect(hexyPose(s).sheet).toBe('run');
});

test('defeat keeps depleted resources until retry; victory and the next attempt restore resources',()=>{
 for(const won of [false,true]){
  const s=quiet(),p=s.player;s.hearts=1;s.magic=3;s.superCooldown=79;s.exhaustion=7;s.rescued=2;s.buddies=[{x:40,y:40}];s.buddyCast=[.4,.5,0];
  if(won){Object.assign(s.boss,{hp:0,engaged:true,defeat:{ready:true}});beginCompletion(s);expect(s.clear).toBeTruthy();}
  else{s.hearts=0;beginPlayerDefeat(s);}
  expect([s.hearts,s.magic,s.superCooldown,s.exhaustion,s.rescued]).toEqual(won?[5,100,0,0,0]:[0,3,79,7,2]);expect(s.resultRescued).toBe(2);
  if(won){expect(s.buddies).toEqual([]);const next=createAdventure(1,false,adventureCarry(s));expect([next.hearts,next.magic,next.superCooldown,next.rescued]).toEqual([5,100,0,0]);}
  retryAdventure(s);expect(s.cages.every(c=>!c.open&&!c.rescued)).toBe(true);expect(s.playerDefeat).toBeUndefined();expect(s.clear).toBeUndefined();expect(s.rescued).toBe(0);expect(s.resultRescued).toBeUndefined();
  expect([s.hearts,s.magic,s.superCooldown,s.exhaustion]).toEqual([5,100,0,0]);expect(s.buddies).toEqual([]);
 }
 const s=createAdventure(1);s.cages.forEach(c=>{c.rescued=true;c.open=true;});s.rescued=3;retryAdventure(s);expect(s.enemies.some(e=>e.captive)).toBe(true);expect(s.cages.every(c=>!c.rescued)).toBe(true);
});

test('supply crates have floor support and clearance from spikes, tents and other crates across 1-1 to 2-2',()=>{
 for(const index of [0,1,2,5,3,6,7]){
  const s=createAdventure(index);
  for(const q of s.supplies){
   expect(s.platforms.some(p=>q.x>=p.x+60&&q.x<=p.x+p.w-60&&Math.abs(q.y-surfaceY(p,q.x))<2)).toBe(true);
   expect(s.hazards.some(h=>q.x>h.x-85&&q.x<h.x+h.w+85&&Math.abs(q.y-h.y)<120)).toBe(false);
   expect(s.outposts.some(t=>Math.abs(q.x-t.x)<210&&Math.abs(q.y-t.y)<190)).toBe(false);
   expect((s.level.nightmareProps||[]).some(t=>Math.abs(q.x-t.x)<t.size*.5+70&&Math.abs(q.y-t.y)<100)).toBe(false);
   expect((s.level.graves||[]).some(t=>Math.abs(q.x-t.x)<(t.kind==='crypt'?250:135)&&Math.abs(q.y-t.y)<140)).toBe(false);
   expect(s.supplies.some(other=>other!==q&&Math.abs(other.x-q.x)<125&&Math.abs(other.y-q.y)<100)).toBe(false);
  }
  if(!s.level.bossOnly)expect(s.supplies.filter(q=>q.midpointHeart)).toHaveLength(1);
 }
});

test('fast shots cross the water surface once at their interpolated impact and produce a splash',()=>{
 const s=createAdventure(2),river=s.level.rivers[0],surface=river.shotSurfaceY,x=river.x+100;
 for(const kind of [-1,0,3,5,6,'water-bolt']){
  const q={kind,x:x+80,y:surface+70,previousX:x,previousY:surface-100,r:8,life:1};
  expect(projectileWaterContact(s,q)).toBe(true);expect(q.life).toBe(0);expect(q.y).toBe(surface);expect(q.x).toBeGreaterThan(x);expect(q.x).toBeLessThan(x+80);
  const count=s.effects.length;expect(projectileWaterContact(s,q)).toBe(false);expect(s.effects).toHaveLength(count);
 }
 const underwater={x,y:surface+30,previousY:surface+50,life:1};expect(projectileWaterContact(s,underwater)).toBe(false);
});

for(const air of [false,true])for(const [x,y] of [[0,-1],[1,-1],[1,0],[1,1],[0,1],[-1,1],[-1,-1]])test(`ultimate matches aim and registered pose ${x},${y}, airborne=${air}`,()=>{
 const s=quiet(),p=s.player;Object.assign(p,{x:900,y:air?300:480,ground:air?null:0});
 const input={super:true,left:x<0,right:x>0,up:y<0,down:y>0};expect(beginSuper(s,input)).toBe(true);
 const q=s.superCinematic;expect(q.aim.y).toBeCloseTo(y*(x?Math.SQRT1_2:1));if(x)expect(q.aim.x).toBeCloseTo(x*(y?Math.SQRT1_2:1));
 tick(s,input,Math.ceil((SUPER_WINDUP+.06)*120));const pose=hexyPose(s),m=hexyMuzzle(s);if(y)expect(pose.sheet).toMatch(/^super-(diagonal-)?(up|down)-v2$/);expect(q.origin).toEqual(m);
 const aim=q.aim;
 // Only an enemy actually in the aimed beam should be damaged.
 const target={x:m.x+aim.x*350,y:m.y+aim.y*350+32,type:0,hp:100,maxHp:100,timer:99,flash:0};
 s.enemies=[target];const hp=target.hp;tick(s,input,32);expect(target.hp).toBeLessThan(hp);
});

test('airborne popcorn recoil is opposite the aim; upward shots do not lift Hexy',()=>{
 for(const y of [-1,-Math.SQRT1_2,0,Math.SQRT1_2,1]){
  const s=quiet(),p=s.player;Object.assign(p,{ground:null,vy:100});firePopcorn(s,{x:500,y:200},{x:Math.sqrt(1-y*y),y},1,true);
  if(y<0)expect(p.vy).toBeGreaterThan(100);else if(y>0)expect(p.vy).toBeLessThan(0);else expect(p.vy).toBe(100);
  if(y<=0)expect(p.popcornClearUntil||0).toBe(0);
 }
 const s=quiet(),p=s.player;s.weapon=s.ammoWeapon=13;s.ammo=s.ammoCapacity=10;
 Object.assign(p,{ground:null,x:1100,y:200,vy:95,jumps:1,gliding:true});s.lastInput.jump=true;
 tick(s,{up:true,right:true,jump:true,special:true});expect(p.vy).toBeGreaterThan(200);expect(p.gliding).toBe(false);expect(p.popcornKick.speed).toBeLessThan(0);
});

test('dust follows real contact on forest and cemetery soil, including grounded enemies; ordinary jump has no stars',()=>{
 for(const index of [5,6]){
  const s=quiet(index),p=s.player,platform=s.platforms.find(q=>q.kind==='earth'&&q.w>300);Object.assign(p,{x:platform.x+100,y:surfaceY(platform,platform.x+100),ground:s.platforms.indexOf(platform),vx:255,footTravel:70});
  expect(surfaceMaterial(s)).toBe('soil');stepSurfaceFeedback(s,1/120,{x:p.x-12,grounded:true,vy:0});expect(s.surfaceDust.at(-1).material).toBe('soil');
  stepSurfaceFeedback(s,1/120,{x:p.x,grounded:false,vy:600});expect(s.surfaceDust.some(q=>q.landing)).toBe(true);
  const e={type:0,hp:5,x:p.x,y:p.y,dir:1,surfaceContact:{x:p.x-6,y:p.y},footTravel:47};s.enemies=[e];stepActorSurfaceFeedback(s,1/120);expect(e.footTravel).toBeLessThan(10);
 }
 const s=quiet();tick(s,{jump:true});expect(s.particles).toHaveLength(0);expect(s.surfaceDust.length).toBeGreaterThan(0);
});

test('the boat never blocks the bridge and a stopped emitter leaves a travelling water tail',()=>{
 const s=quiet(2),a=s.level.arena;Object.assign(s.boss,{phase:'attack',move:'jet',jetAngle:-.18,timer:99,shotClock:99,engaged:true});Object.assign(s.player,{x:s.boss.x-80,y:a.y,vx:255,hurt:99});
 tick(s,{right:true},95);expect(s.player.x).toBeGreaterThan(s.boss.x+90);
 const m=bargeRig(s),q={barge:true,kind:'barge-jet',x:m.jetMuzzle.x,y:m.jetMuzzle.y,angle:-.18,age:.3,life:2,r:26,emission:.68};stepBargeProjectile(s,q,1/120,[]);const initial=q.x;
 q.age=.82;s.boss.phase='recover';stepBargeProjectile(s,q,1/120,[]);expect(q.life).toBeGreaterThan(0);expect(q.x).toBeLessThan(initial);expect(q.length).toBeGreaterThan(0);
 const spout={barge:true,kind:'barge-spout',x:m.muzzle.x,y:m.muzzle.y,vx:-340,gravity:500,flight:.48,floor:a.y,age:.34,life:1,r:13};stepBargeProjectile(s,spout,1/120,[]);expect(spout.tailTime).toBeGreaterThan(0);expect(spoutPoint(spout,spout.tailTime).x).toBeLessThan(spout.x);
});
