import {test,expect} from '@playwright/test';
import {createAdventure,stepAdventure,retryAdventure,adventureCarry} from '../src/components/arcade/adventure/engine/adventureModel';
import {collectDrink,equipDrink,spendDrink,swapDrink,refillDrink} from '../src/components/arcade/adventure/engine/adventureAmmo';
import {updateMods,MODS,modPrice} from '../src/components/arcade/adventure/engine/adventureMods';
import {leaveDecoy,stepTacticalMods,enemyAimTarget,decoyBlocks,reflectPellet} from '../src/components/arcade/adventure/engine/adventureTacticalMods';
import {updateGuard,guardBlocks,GUARD_HIT_COST} from '../src/components/arcade/adventure/engine/adventureDefense';
import {beginShopTransition} from '../src/components/arcade/adventure/engine/adventureShop';
import {makeEnemy,updateEnemies} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {readAdventureGamepad} from '../src/components/arcade/adventure/input/adventureGamepad';
const mods=['double-pocket','confetti-step','reply-bell'];
function scene(){const s=createAdventure(0,false,{mods,modSlots:3});s.enemies=[];s.outposts=[];s.supplies=[];s.cages=[];s.stars=[];s.noticeTime=0;s.player.x=300;return s;}
const ticks=(s,n,input={})=>{for(let i=0;i<n;i++)stepAdventure(s,input,1/120);};
const bullet=(s,kind='ball',extra={})=>({kind,x:s.player.x+40,y:s.player.y-43,vx:-240,vy:0,r:10,age:0,life:2,...extra});

test('two cans preserve ammo, tiers and enlarged starter capacity through repeated swaps',()=>{
 const s=scene();equipDrink(s,5,130,2,168);collectDrink(s,9);expect(s.spareDrink).toEqual({kind:5,ammo:130,capacity:168,tier:2});spendDrink(s,7);
 for(let i=0;i<20;i++){s.swapWait=0;expect(swapDrink(s)).toBe(true);}
 expect(s.weapon).toBe(9);expect(s.ammo).toBe(35);expect(s.spareDrink.ammo).toBe(130);
 s.swapWait=0;swapDrink(s);expect(s.drinkTier).toBe(2);expect(s.ammoCapacity).toBe(168);expect(s.ammo).toBe(130);
});
test('third flavor replaces only the active slot; a stored duplicate upgrades and brings that can forward',()=>{
 const s=scene();collectDrink(s,5);spendDrink(s,10);collectDrink(s,9);spendDrink(s,5);collectDrink(s,10);
 expect(s.weapon).toBe(10);expect(s.spareDrink.kind).toBe(5);expect(s.spareDrink.ammo).toBe(74);
 collectDrink(s,5);expect(s.weapon).toBe(5);expect(s.drinkTier).toBe(2);expect(s.ammo).toBe(84);expect(s.spareDrink.kind).toBe(10);
 updateMods(s,[],{},s.modCategorySlots);collectDrink(s,11);expect(swapDrink(s)).toBe(true);expect(s.weapon).toBe(10);
 const single=createAdventure(0,false,{});collectDrink(single,5);collectDrink(single,11);expect(swapDrink(single)).toBe(false);expect(single.weapon).toBe(11);
});
test('exhaustion leaves a manual swap; refills and Original do not manufacture spare ammo',()=>{
 const s=scene();collectDrink(s,5);spendDrink(s,10);collectDrink(s,9);spendDrink(s,42);expect(s.weapon).toBe(-1);expect(swapDrink(s)).toBe(true);expect(s.ammo).toBe(74);expect(s.spareDrink).toBeNull();
 collectDrink(s,10);spendDrink(s,20);refillDrink(s);expect(s.spareDrink.ammo).toBe(74);
 s.overdrive=3;spendDrink(s,5);expect(s.ammo).toBe(48);expect(s.spareDrink.ammo).toBe(74);
});
test('swap input is edge triggered and cannot cancel protected actions or reset shot cadence',()=>{
 const s=scene();collectDrink(s,5);collectDrink(s,9);s.shotWait=.7;ticks(s,1,{swap:true});expect(s.weapon).toBe(5);expect(s.shotWait).toBeGreaterThan(.6);ticks(s,70,{swap:true});expect(s.weapon).toBe(5);
 for(const key of ['drinkCast','hitReact','dash','specialCast','superCast','guarding']){s.swapWait=0;s.player[key]=1;expect(swapDrink(s)).toBe(false);s.player[key]=0;}
});
test('both cans survive retry and chapter carry; temporary decoy and parry cannot survive a retry or shop entry',()=>{
 const s=scene();collectDrink(s,5);spendDrink(s,7);collectDrink(s,9);spendDrink(s,3);leaveDecoy(s);s.player.parryWindow=.2;
 const carry=adventureCarry(s);const next=createAdventure(1,false,carry);expect(next.spareDrink.ammo).toBe(77);expect(next.ammo).toBe(39);
 retryAdventure(s);expect(s.spareDrink.ammo).toBe(77);expect(s.ammo).toBe(39);expect(s.confettiDecoy).toBeNull();expect(s.player.parryWindow).toBe(0);
 leaveDecoy(s);s.player.parryWindow=.2;beginShopTransition(s);expect(s.confettiDecoy).toBeNull();expect(s.player.parryWindow).toBe(0);
});
test('a decoy changes actual clown attack direction without moving the player or fooling machines',()=>{
 const s=scene();leaveDecoy(s);s.player.x=550;const clown=makeEnemy(430,s.player.y,1);clown.timer=.01;s.enemies=[clown];
 expect(enemyAimTarget(s,clown)).toBe(s.confettiDecoy);expect(enemyAimTarget(s,makeEnemy(430,s.player.y,12))).toBe(s.player);
 updateEnemies(s,.02,()=>({x:550,y:0,w:1,h:1}),()=>{});expect(clown.dir).toBe(-1);expect(s.hostile[0].vx).toBeLessThan(0);expect(s.player.x).toBe(550);
});
test('paper falls onto real platforms, follows moving ground, expires and respects recharge',()=>{
 const s=scene();s.player.ground=null;s.player.y-=75;leaveDecoy(s);expect(leaveDecoy(s)).toBe(false);
 for(let i=0;i<70;i++)stepTacticalMods(s,1/120);const d=s.confettiDecoy;expect(d.platform).toBeTruthy();expect(d.y).toBe(s.platforms[0].y);
 const x=d.x;d.platform.dx=2;stepTacticalMods(s,.01);expect(d.x).toBe(x+2);d.platform.dx=0;stepTacticalMods(s,2);expect(s.confettiDecoy).toBeNull();expect(leaveDecoy(s)).toBe(false);
 stepTacticalMods(s,3);expect(leaveDecoy(s)).toBe(true);
});
test('one incoming bullet tears the paper; area fire is not swallowed',()=>{
 const s=scene();leaveDecoy(s);const d=s.confettiDecoy,fire=bullet(s,'harlequin-groundfire',{x:d.x,y:d.y-20});expect(decoyBlocks(s,fire)).toBe(false);expect(fire.life).toBe(2);
 const q=bullet(s,'ball',{x:d.x,y:d.y-36});expect(decoyBlocks(s,q)).toBe(true);expect(q.life).toBe(0);expect(s.confettiDecoy).toBeNull();expect(s.effects.some(f=>f.confetti)).toBe(true);
});
test('precise shield returns one bolt, costs magic, and the returned shot damages its attacker without ammo use',()=>{
 const s=scene();equipDrink(s,5,10);const e=makeEnemy(440,s.player.y,5);e.timer=99;s.enemies=[e];s.hostile=[bullet(s)];const hp=e.hp,hearts=s.hearts;
 ticks(s,1,{guard:true});expect(s.hostile).toHaveLength(0);expect(s.shots.some(q=>q.reflected&&q.vx>0)).toBe(true);expect(s.magic).toBeLessThan(100-GUARD_HIT_COST);expect(s.ammo).toBe(10);
 ticks(s,45);expect(e.hp).toBeCloseTo(hp-3.5);expect(s.hearts).toBe(hearts);
});
test('holding, repeated taps and a second bullet do not renew the parry window',()=>{
 const s=scene();updateGuard(s,{guard:true},.01);const a=bullet(s),b=bullet(s);guardBlocks(s,a);guardBlocks(s,b);expect(s.shots.filter(q=>q.reflected)).toHaveLength(1);
 updateGuard(s,{},.01);updateGuard(s,{guard:true},.01);guardBlocks(s,bullet(s));expect(s.shots.filter(q=>q.reflected)).toHaveLength(1);
 updateGuard(s,{guard:true},.8);guardBlocks(s,bullet(s));expect(s.shots.filter(q=>q.reflected)).toHaveLength(1);
 updateGuard(s,{},.01);updateGuard(s,{guard:true},.01);guardBlocks(s,bullet(s));expect(s.shots.filter(q=>q.reflected)).toHaveLength(2);
});
test('late, rear, contact and area attacks are not reflected; basic guard still works without the mod',()=>{
 const s=scene();updateGuard(s,{guard:true},.01);
 for(const kind of ['ember-blast','ember-breath','fort-breath','harlequin-groundfire','harlequin-pyre','barge-jet','clown']){const q=bullet(s,kind);expect(reflectPellet(s,q)).toBe(false);expect(q.life).toBe(2);}
 expect(guardBlocks(s,bullet(s,'ball',{x:s.player.x-90,vx:240}))).toBe(false);expect(reflectPellet(s,{life:1,x:1,y:1,r:23})).toBe(false);
 updateGuard(s,{guard:true},.3);expect(guardBlocks(s,bullet(s))).toBe(true);expect(s.shots).toHaveLength(0);
 updateMods(s,[],{},3);updateGuard(s,{},1);updateGuard(s,{guard:true},.01);expect(guardBlocks(s,bullet(s))).toBe(true);expect(s.shots).toHaveLength(0);
});
test('new charms have bounded upgrades and right-stick press swaps without firing or interacting',()=>{
 const pocket=MODS.find(m=>m.id==='double-pocket');expect(modPrice(pocket,1)).toBeNull();
 const pad={connected:true,mapping:'standard',axes:[0,0],buttons:Array.from({length:17},(_,i)=>({pressed:i===11,value:i===11?1:0}))};const keys=readAdventureGamepad(pad);expect(keys.swap).toBe(true);expect(keys.attack).toBe(false);expect(keys.interact).toBe(false);
});
