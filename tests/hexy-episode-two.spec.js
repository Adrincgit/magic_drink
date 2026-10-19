import {test,expect} from '@playwright/test';
import {createAdventure,stepAdventure,retryAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {damageActTwoBoss} from '../src/components/arcade/adventure/actors/bosses/adventureActTwoBosses';
import {bossTargets} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {NIGHTMARE_CLASH,nightmareContact} from '../src/components/arcade/adventure/engine/nightmarePowerClash';
import {nightmareChargeParticle} from '../src/components/arcade/adventure/render/nightmareClashCanvas';
import {clashImpactTiming} from '../src/components/arcade/adventure/render/clashImpactCanvas';
import {MANGA_IMPACT_DURATION} from '../src/components/arcade/adventure/engine/adventureSuperTiming';
import {beginNightmareUltimate} from '../src/components/arcade/adventure/actors/bosses/nightmareUltimate';
import {clearPowerProjectiles} from '../src/components/arcade/adventure/engine/adventureDefense';
const tick=(s,t,input={})=>{for(let i=0;i<Math.round(t*120);i++)stepAdventure(s,input,1/120);};
function battle(id){const s=createAdventure(id);s.enemies=[];s.supplies=[];s.player.x=s.level.arena.entry+100;s.player.y=s.level.arena.y;s.player.hurt=999;tick(s,2.1);return s;}
function answering(){
 const s=battle(10),b=s.boss;b.stage=3;b.hp=b.maxHp/3;b.encoreAid=true;beginNightmareUltimate(s);tick(s,1.95);
 b.phase='nightmare-charge';b.vulnerable=false;s.superCooldown=0;s.magic=100;s.lastInput={};stepAdventure(s,{super:true},1/120);return s;
}
test('the castle lower route reaches the ballroom through a real black doorway transition',()=>{
 const s=createAdventure(9);s.enemies=[];s.actTwoAmbushes=[];s.player.hurt=999;let black=false,inside=false;
 for(let i=0;i<120*100&&s.player.x<s.level.arena.entry;i++){
  stepAdventure(s,{right:true,attack:true,jump:i%150<70},1/120);black||=(s.castleTransition?.alpha||0)>.95;inside||=s.castleInside;
  expect(Number.isFinite(s.player.x+s.player.y+s.camera.y)).toBe(true);
 }
 expect(s.level.width).toBeGreaterThan(14000);expect(black).toBe(true);expect(inside).toBe(true);expect(s.player.x).toBeGreaterThanOrEqual(s.level.arena.entry);expect(s.checkpointAt).toBeUndefined();
});
test('the door preserves spent health, energy, currency and defeated enemies',()=>{
 const s=createAdventure(9);s.enemies=[];s.supplies=[];s.player.x=s.level.castleDoor-1;s.hearts=2;s.magic=27;s.starMoney=123;
 tick(s,.2,{right:true});expect(s.castleTransition?.alpha).toBeGreaterThan(0);const magicAtDoor=s.magic;tick(s,.6);expect(s.magic).toBe(magicAtDoor);tick(s,.7);
 expect(s.castleInside).toBe(true);expect(s.hearts).toBe(2);expect(s.magic).toBeLessThan(40);expect(s.starMoney).toBe(123);expect(s.enemies).toEqual([]);
 retryAdventure(s);expect(s.castleInside).toBe(false);expect(s.castleTransition).toBeNull();expect(s.episodeTwo.seen.size).toBe(0);
});
test('the open final hall is traversable and starts the boss on the continuous painted floor',()=>{
 const s=createAdventure(10);s.player.hurt=999;tick(s,11,{right:true});expect(s.player.x).toBeGreaterThan(s.level.arena.entry);expect(s.boss.engaged).toBe(true);expect(s.level.arena.y).toBe(480);expect(s.player.y).toBeCloseTo(480,0);
});
test('fleeing clowns and villagers travel with fixed headings and never enter hostile targets',()=>{
 for(const id of [6,7,8,9]){const s=createAdventure(id),q=s.episodeTwo,n=q.npcs[0];s.player.x=n.home-300;s.player.hurt=999;s.enemies=[];const x=n.x;tick(s,.8);expect(n.x).toBeLessThan(x-50);expect(n.dir).toBe(-1);expect(n.gait).toBeGreaterThan(0);expect(s.enemies.includes(n)).toBe(false);}
});
test('the Countess joins the second phase and her chandelier warns before falling',()=>{
 const s=battle(9),b=s.boss;expect(b.countess.phase).toBe('watch');b.vulnerable=true;damageActTwoBoss(s,9999);expect(b.hp).toBe(b.maxHp/2);tick(s,2.1);expect(b.stage).toBe(2);
 Object.assign(b,{phase:'recover',timer:5});b.countess.timer=0;tick(s,.1);expect(s.curtainChandeliers).toHaveLength(1);const q=s.curtainChandeliers[0],y=q.y;expect(q.delay).toBeGreaterThan(1);tick(s,.8);expect(q.y).toBe(y);tick(s,.6);expect(q.y).toBeGreaterThan(y);expect(q.falling).toBe(true);
 b.countess.phase='recover';expect(bossTargets(s)).toHaveLength(2);b.countess.phase='warn';expect(bossTargets(s)).toHaveLength(1);
});
test('the final phase supplies one Encore opportunity and leaps high and casts an aerial candy storm without a response',()=>{
 const s=battle(10),b=s.boss;b.stage=3;b.hp=b.maxHp*.1;s.magic=0;s.superCooldown=60;b.phase='recover';b.timer=8;
 tick(s,.1);expect(s.magic).toBeGreaterThanOrEqual(80);expect(s.superCooldown).toBe(0);tick(s,4.8);expect(b.nightmareUltimate?.state).toBe('charge');expect(b.y).toBeLessThan(-900);tick(s,3);expect(s.hostile.some(q=>q.kind==='nightmare-storm')).toBe(true);
});
test('answering the nightmare aims Encore diagonally into the overhead crown',()=>{
 const s=answering(),q=s.powerClash;expect(q.kind).toBe('nightmare');expect(s.superCinematic.aim.y).toBeLessThan(-.4);expect(s.superCinematic.aim.x).toBeGreaterThan(.4);
 const h=nightmareContact(s);expect(h.y).toBeLessThan(s.player.y-100);expect(h.b.y).toBeLessThan(h.y);expect(s.mods).toEqual([]);
});
test('one boss reversal and one fresh ultimate amplify the clash without charging a reserve',()=>{
 const s=answering(),magic=s.magic,cooldown=s.superCooldown,states=new Set();let boostStarted=0;
 for(let i=0;i<120*35&&s.powerClash;i++){
  const q=s.powerClash,input={attack:i%12<6,super:!!q.boostReady&&!q.hexyBoost};const before=q.state;stepAdventure(s,input,1/120);states.add(s.powerClash?.state);
  if(before!=='hexy-boost'&&s.powerClash?.state==='hexy-boost')boostStarted++;
  if(q.bossBoost)expect(Math.max(0,q.limit-q.contestAge)).toBeLessThanOrEqual(NIGHTMARE_CLASH.maxRemaining);
 }
 expect(states.has('boss-boost')).toBe(true);expect(states.has('hexy-boost')).toBe(true);expect(boostStarted).toBe(1);expect(s.powerClash).toBeNull();expect(s.magic).toBe(magic);expect(s.superCooldown).toBe(cooldown);expect(s.superReserve).toBe(0);expect(s.boss.hp).toBe(0);expect(s.dreamRoofTorn).toBe(true);
 tick(s,4);expect(s.boss.defeat.ready).toBe(true);expect(s.clear).toBeTruthy();
});
test('holding the initial ultimate cannot accidentally spend the double Encore',()=>{
 const s=answering();let sawReady=false;
 for(let i=0;i<120*12&&s.powerClash;i++){
  stepAdventure(s,{super:true,attack:i%12<6},1/120);if(s.powerClash?.boostReady)sawReady=true;
  expect(s.powerClash?.hexyBoost||false).toBe(false);
 }
 expect(sawReady).toBe(true);
});
test('losing at the Hexy endpoint is lethal, leaves a living boss and permits retry',()=>{
 const s=answering();s.player.hurt=0;for(let i=0;i<120*24&&s.powerClash;i++)stepAdventure(s,{},1/120);
 expect(s.powerClash).toBeNull();expect(s.hearts).toBe(0);expect(s.boss.hp).toBeGreaterThan(0);expect(s.boss.nightmareUltimate).toBeUndefined();expect(s.clear).toBeFalsy();
 retryAdventure(s);expect(s.boss.phase).toBe('sleep');expect(s.boss.encoreAid).toBeUndefined();expect(s.powerClash).toBeUndefined();
});
test('the crown absorbs every light journey before release and manga is only one shared impact beat',()=>{
 const s=answering();for(let i=0;i<40;i++)expect(nightmareChargeParticle(s,i,2.95).phase).toBe(1);
 const q=s.powerClash;q.state='contest';q.impactAge=0;expect(clashImpactTiming(q).manga).toBeGreaterThan(0);q.impactAge=MANGA_IMPACT_DURATION+.001;expect(clashImpactTiming(q).manga).toBe(0);q.age=0;q.state='boss-boost';expect(clashImpactTiming(q).manga).toBe(0);
});
test('ordinary strong bullets cannot erase the grand ultimate and the revealed night survives backtracking',()=>{
 const s=createAdventure(8);s.player.hurt=999;s.player.x=6900;s.enemies=[];tick(s,2);expect(s.episodeTwo.sunsetReveal).toBe(1);s.player.x=3000;tick(s,.2);expect(s.episodeTwo.sunsetReveal).toBe(1);
 const wheel={kind:'nightmare-storm',life:2,x:400,y:440,r:100};s.hostile=[wheel];clearPowerProjectiles(s,[{x:400,y:440,r:30,heavy:true,life:1}]);expect(wheel.life).toBe(2);
});
