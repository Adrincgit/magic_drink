import {test,expect} from '@playwright/test';
import {createAdventure,stepAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {beginNightmareUltimate,nightmareHand,NIGHTMARE_ULTIMATE} from '../src/components/arcade/adventure/actors/bosses/nightmareUltimate';
import {adventureBounds} from '../src/components/arcade/adventure/render/adventureCamera';
import {hexyPose,hexyMuzzle} from '../src/components/arcade/adventure/actors/hexy/hexyAnimation';
import {nightmareEffort,nightmareResistance} from '../src/components/arcade/adventure/engine/nightmareActing';
import {NIGHTMARE_AERIAL_SOCKETS,NIGHTMARE_HEXY_ATLAS,NIGHTMARE_PORTRAIT_CROPS,NIGHTMARE_VORTEX_SOCKETS} from '../src/components/arcade/adventure/actors/bosses/nightmareAerialRegistration';
const tick=(s,time,input={})=>{for(let i=0;i<Math.round(time*120);i++)stepAdventure(s,input,1/120);};
function ready(side=1,air=false){
 const s=createAdventure(10),a=s.level.arena;s.enemies=[];s.supplies=[];s.arenaLocked=true;Object.assign(s.player,{x:side>0?2850:5650,y:a.y,ground:1,hurt:999});Object.assign(s.boss,{x:side>0?5000:3000,y:a.y,stage:3,hp:260,phase:'recover',timer:100,engaged:true,encoreAid:true});
 beginNightmareUltimate(s);return s;
}
function duel(side=1,air=false){const s=ready(side);tick(s,1.9);if(air){s.player.y-=110;s.player.ground=null;}stepAdventure(s,{super:true},1/120);return s;}
function until(s,predicate,input=()=>({}),seconds=20){for(let i=0;i<seconds*120&&!predicate(s);i++)stepAdventure(s,input(s,i),1/120);expect(predicate(s)).toBe(true);}

test('the final arena exceeds the fire ring and permits a long retreat over an uninterrupted floor',()=>{
 const s=ready(),fire=createAdventure(3),a=s.level.arena;expect(a.right-a.left).toBeGreaterThan((fire.level.arena.right-fire.level.arena.left)*1.5);
 const bounds=adventureBounds(s);expect(bounds.left).toBeLessThan(a.left-1800);expect(bounds.right).toBeGreaterThan(a.right);
 delete s.boss.nightmareUltimate;s.boss.phase='recover';s.boss.timer=100;s.boss.nightmareCooldown=999;
 tick(s,8,{left:true});expect(s.player.x).toBeLessThan(a.left-1000);expect(s.player.y).toBe(a.y);expect(s.platforms.every(p=>p.y===a.y&&p.yEnd===a.y)).toBe(true);
});
test('the extreme jump is continuous and reveals an airborne charge more than 1400 units above the floor',()=>{
 const s=ready(),ys=[];for(let i=0;i<180;i++){ys.push(s.boss.y);stepAdventure(s,{},1/120);}
 expect(s.boss.nightmareUltimate.state).toBe('charge');expect(NIGHTMARE_ULTIMATE.elevation).toBeGreaterThan(240*6);
 expect(s.level.arena.y-s.boss.y).toBeGreaterThan(1400);expect(Math.max(...ys.slice(1).map((y,i)=>Math.abs(y-ys[i])))).toBeLessThan(35);
 tick(s,1.7);const z=s.camera.zoom,head=(s.boss.y-240-s.camera.y)*z;expect(head).toBeGreaterThan(0);expect((s.player.y-s.camera.y)*z).toBeCloseTo(470);
});
test('both orientations and an air response register the beam to the actual star and open palm',()=>{
 for(const [side,air]of [[1,false],[-1,false],[-1,true]]){
  const s=duel(side,air);expect(s.superCinematic.aim.y).toBeLessThan(-.4);expect(Math.sign(s.superCinematic.aim.x)).toBe(side);
  if(!air)expect(hexyPose(s).sheet).toBe('super-charge');
  until(s,s=>s.powerClash?.state==='contest');const pose=hexyPose(s);expect(pose.sheet).toBe('nightmare-pressure-'+(air?'air':'ground'));
  // The tucked airborne legs put the chest-height wand closer to the foot
  // anchor than the former overhead grip. It still points forward and up.
  const h=hexyMuzzle(s),hand=nightmareHand(s);expect((h.x-s.player.x)*side).toBeGreaterThan(0);expect(h.y).toBeLessThan(s.player.y-40);expect(hand.y).toBeLessThan(s.level.arena.y-1400);
 }
});
test('the boss enlarges once, adds ten seconds, and then allows a fresh second ultimate near defeat',()=>{
 const s=duel(),magic=s.magic,cooldown=s.superCooldown;
 until(s,s=>s.powerClash?.boostReady,(s,i)=>({attack:i%12<6}));const q=s.powerClash;
 expect(q.limit-q.contestAge).toBeLessThanOrEqual(20);expect(q.limit-q.contestAge).toBeGreaterThan(18);expect(q.bossAmplification).toBe(1);expect(nightmareResistance({...q,surgeAge:2},false)).toBeGreaterThan(nightmareResistance({...q,bossBoost:false},false));
 until(s,s=>s.powerClash?.pressure<.1);expect(s.powerClash).toBeTruthy();expect(q.windFlow).toBe(-1);expect(nightmareEffort({...q,portraitPressure:.09},true)).toBe(2);
 stepAdventure(s,{super:true},1/120);expect(q.state).toBe('hexy-boost');until(s,s=>s.powerClash?.state==='contest');expect(q.hexyAmplification).toBe(1);expect(q.windFlow).toBe(1);expect(q.pressure).toBe(.5);
 expect(s.magic).toBe(magic);expect(s.superCooldown).toBe(cooldown);expect(nightmareEffort(q)).toBe(4);
});
test('when she is winning the camera closes in on the advancing collision while the caster leaves the frame',()=>{
 const s=duel();until(s,s=>s.powerClash?.boostReady,(s,i)=>({attack:i%12<6}));until(s,s=>s.powerClash?.pressure<.1);tick(s,.4);
 const z=s.camera.zoom,q=s.powerClash;expect((s.boss.y-s.camera.y)*z).toBeLessThan(0);expect(Math.abs((q.focus.y-s.camera.y)*z-262)).toBeLessThan(100);expect(Math.abs((q.focus.x-s.camera.x)*z-480)).toBeLessThan(180);expect(z).toBeGreaterThan(.3);
});
test('her winning descent and Hexy candy aftermath complete without teleporting the caster',()=>{
 const s=duel();until(s,s=>s.powerClash?.state==='land');const y=s.boss.y;tick(s,.9);expect(s.boss.y).toBeGreaterThan(y+100);expect(s.boss.y).toBeLessThan(480);tick(s,1.6);
 expect(s.powerClash).toBeNull();expect(s.boss.y).toBe(480);expect(s.boss.hp).toBe(260);expect(s.hearts).toBe(0);expect(s.episodeTwo.captionAge).toBe(0);
});
test('new effort art has individual star, palm, face and storm registrations',()=>{
 expect(NIGHTMARE_HEXY_ATLAS['aerial-hexy-ground-effort']).toHaveLength(12);expect(NIGHTMARE_HEXY_ATLAS['aerial-hexy-air-effort']).toHaveLength(12);expect(NIGHTMARE_AERIAL_SOCKETS['aerial-boss-air-actions']).toHaveLength(16);
 for(const frames of Object.values(NIGHTMARE_PORTRAIT_CROPS)){expect(frames).toHaveLength(4);expect(frames.every(f=>f[2]>300&&f[3]>400)).toBe(true);}
 expect(NIGHTMARE_VORTEX_SOCKETS).toHaveLength(8);for(const q of NIGHTMARE_VORTEX_SOCKETS){expect(q.front[0]).toBeLessThan(q.tail[0]);expect(Number.isFinite(q.front[1])).toBe(true);}
});

test('the unopposed aerial storm is lethal on direct contact and a moving target can escape its core',()=>{
 const hit=ready();hit.player.hurt=0;tick(hit,6.8);expect(hit.hearts).toBe(0);
 const dodge=ready();dodge.player.hurt=0;tick(dodge,1.6);tick(dodge,5.2,{left:true});expect(dodge.hearts).toBe(5);
});
test('both charges absorb all their energy before either side releases',()=>{
 const s=duel();until(s,s=>s.powerClash?.state==='travel');expect(s.powerClash.bossCharged+s.powerClash.windup).toBeGreaterThanOrEqual(NIGHTMARE_ULTIMATE.charge);
 expect(s.player.charge).toBe(0);expect(s.superCinematic.origin.y).toBeLessThan(s.player.y-50);
});
