import {test,expect} from '@playwright/test';
import {createTrial,stepTrial,changeTrialDrink,trialDemoInput} from '../src/components/arcade/adventure/engine/adventureTrial';
import {MODS,categorySlots,equippedMods,updateMods} from '../src/components/arcade/adventure/engine/adventureMods';
import {createAdventure,stepAdventure,adventureCarry} from '../src/components/arcade/adventure/engine/adventureModel';
import {beginCreativeSpecial} from '../src/components/arcade/adventure/engine/adventureCreativeDrinks';
import {equipDrink,swapDrink,grantStartingDrink,collectDrink} from '../src/components/arcade/adventure/engine/adventureAmmo';
import {guardBlocks} from '../src/components/arcade/adventure/engine/adventureDefense';
import {makeEnemy} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {sanitizeSave} from '../src/components/arcade/shared/arcadeStore';
import {readAdventureGamepad} from '../src/components/arcade/adventure/input/adventureGamepad';
import {hexyPose} from '../src/components/arcade/adventure/actors/hexy/hexyAnimation';
import {beginExtraSpecial} from '../src/components/arcade/adventure/engine/adventureExtraDrinks';
const trial=(id,level=1)=>createTrial(MODS.find(m=>m.id===id),level);
const tick=(s,n,input={})=>{for(let i=0;i<n;i++)stepAdventure(s,input,1/120);};
const practice=(s,n,input={})=>{for(let i=0;i<n;i++)stepTrial(s,input,1/120);};
test('families retain old purchases, preserve equipped charms and remove the global five-slot limit',()=>{
 const raw={version:1,campaign:2,economy:2,stars:500,modSlots:5,modsOwned:['quick-cast','bright-spark','grand-flourish','full-bubble','double-pocket'],modsEquipped:['quick-cast','bright-spark','grand-flourish','full-bubble','double-pocket']};
 const s=sanitizeSave(raw);expect(s.stars).toBe(500);expect(s.modsOwned).toContain('reserve-sleeve');expect(s.modCategorySlots.drinks).toBeGreaterThanOrEqual(2);expect(s.modsEquipped).toEqual(['quick-cast','bright-spark','grand-flourish','full-bubble','reserve-sleeve']);expect(sanitizeSave(s)).toEqual(s);
 const ids=['starter-7','starter-0','reserve-sleeve','spring-boots','comet-dive','double-dash','sky-guard','reply-bell','quick-cast','encore-pocket'];
 expect(equippedMods(ids,ids,{drinks:3,boots:3,hat:3,skills:5})).toHaveLength(10);
 expect(equippedMods(['starter-0','starter-1','starter-2'],['starter-0','starter-1','starter-2'],{drinks:3})).toHaveLength(2);
 expect(categorySlots({})).toEqual({drinks:1,boots:1,hat:1,skills:1});
 expect(categorySlots(null,5,['starter-0','starter-1','reserve-sleeve']).drinks).toBe(3);
});
test('two starting drinks have independent reserves, swap with R3, survive carry and cannot refill by refitting',()=>{
 const s=createAdventure(0,false,{mods:['starter-7','starter-0','reserve-sleeve'],modCategorySlots:{drinks:3},modLevels:{'starter-7':3,'reserve-sleeve':1}});
 expect(s.weapon).toBe(7);expect(s.spareDrink.kind).toBe(0);s.ammo-=11;const left=s.ammo;expect(swapDrink(s)).toBe(true);expect(s.weapon).toBe(0);expect(s.spareDrink.ammo).toBe(left);s.swapWait=0;expect(swapDrink(s)).toBe(true);expect(s.ammo).toBe(left);
 grantStartingDrink(s);expect(s.ammo).toBe(left);const next=createAdventure(1,false,adventureCarry(s));expect(next.ammo).toBe(left);expect(next.spareDrink).toEqual(s.spareDrink);
 const buttons=Array.from({length:16},()=>({pressed:false,value:0}));buttons[11]={pressed:true,value:1};expect(readAdventureGamepad({connected:true,mapping:'standard',buttons,axes:[0,0]}).swap).toBe(true);
 const before=s.ammo;updateMods(s,['reserve-sleeve'],{'reserve-sleeve':3},{drinks:3});expect(s.ammo).toBe(before);expect(s.ammoCapacity).toBe(Math.floor(112*1.35));expect(s.spareDrink.capacity).toBe(Math.floor(108*1.35));
 for(let i=0;i<4;i++){updateMods(s,[],{'reserve-sleeve':3},{drinks:3});expect(s.ammoCapacity).toBe(112);expect(s.spareDrink.capacity).toBe(108);updateMods(s,['reserve-sleeve'],{'reserve-sleeve':3},{drinks:3});expect(s.ammoCapacity).toBe(Math.floor(112*1.35));}expect(s.ammo).toBeLessThanOrEqual(before);collectDrink(s,1);expect(s.ammo).toBe(Math.floor(42*1.35));
});
test('practice clowns patrol, respawn from the tent, and contacts cannot hurt or interrupt Hexy',()=>{
 const s=trial('starter-9'),x=s.enemies[0].x;practice(s,120);expect(s.enemies[0].x).not.toBe(x);s.player.x=s.enemies[0].x;practice(s,8);expect(s.hearts).toBe(s.maxHearts);expect(s.player.hitReact).toBe(0);
 for(const e of s.enemies){e.hp=0;e.deadTime=.1;}practice(s,370);expect(s.enemies.filter(e=>e.hp>0)).toHaveLength(3);expect(s.enemies.every(e=>e.practice)).toBe(true);expect(s.enemies.some(e=>e.practiceEntering)).toBe(true);expect(s.trial.defeats).toBe(3);
});
test('Prism stays in the practice pocket while the selected companion changes and Q swaps both ways',()=>{
 const s=trial('starter-7',3);beginCreativeSpecial(s,7,1);changeTrialDrink(s,5);expect(s.weapon).toBe(7);expect(s.spareDrink.kind).toBe(5);expect(swapDrink(s)).toBe(true);expect(s.weapon).toBe(5);changeTrialDrink(s,8);expect(s.weapon).toBe(8);expect(s.spareDrink.kind).toBe(7);s.swapWait=0;expect(swapDrink(s)).toBe(true);expect(s.weapon).toBe(7);expect(s.drinkFields).toHaveLength(1);
});
test('level three places three spaced prisms along horizontal, diagonal and overhead aim',()=>{
 for(const [ax,ay]of [[1,0],[Math.SQRT1_2,-Math.SQRT1_2],[0,-1]]){const s=trial('starter-7',3);Object.assign(s.player,{aimX:ax,aimY:ay});for(let i=0;i<3;i++)beginCreativeSpecial(s,7,1);const f=s.drinkFields;expect(f).toHaveLength(3);for(let i=1;i<3;i++){expect(Math.hypot(f[i].x-f[i-1].x,f[i].y-f[i-1].y)).toBeCloseTo(110);if(ay<0)expect(f[i].y).toBeLessThan(f[i-1].y);}beginCreativeSpecial(s,7,1);expect(s.drinkFields).toHaveLength(3);}
 const s=trial('starter-7',3);for(let i=0;i<380;i++)stepTrial(s,trialDemoInput(s),1/120);expect(s.drinkFields.filter(f=>f.kind===7)).toHaveLength(3);expect(s.weapon).toBe(0);expect(s.spareDrink.kind).toBe(7);
});
test('Echo levels add delayed followers with a bounded total copy-damage budget',()=>{
 for(const n of [1,2,3]){const s=trial('starter-8',n);beginCreativeSpecial(s,8,1);expect(s.drinkFields).toHaveLength(n);expect(s.drinkFields.reduce((sum,f)=>sum+f.copyDamage,0)).toBeLessThanOrEqual(.75);tick(s,5,{attack:true});const before=s.drinkFields.map(f=>f.x),ammo=s.ammo;tick(s,60,{right:true});expect(s.drinkFields.every((f,i)=>f.x>before[i])).toBe(true);expect(s.ammo).toBe(ammo);expect(s.shots.some(q=>q.echoCopy)).toBe(true);}
});
test('Honey increases control time then coverage without a large damage leap; Ribbon gains swing speed and poses',()=>{
 const values=[];for(const n of [1,2,3]){const s=trial('starter-10',n);beginCreativeSpecial(s,10,1);values.push({...s.drinkFields[0]});}expect(values.map(f=>f.drops)).toEqual([6,8,10]);expect(values[1].life).toBeGreaterThan(values[0].life);expect(values[2].life).toBe(values[1].life);expect(values[2].hiveSize).toBe(1.12);
 const swings=[];for(const n of [1,3]){const s=trial('ribbon-duration',n);s.enemies=[];tick(s,86);tick(s,1,{attack:true});expect(hexyPose(s).sheet).toBe('ribbon-action');swings.push(s.shotWait);const frames=new Set();for(let i=0;i<50;i++){tick(s,1);const pose=hexyPose(s);if(pose.sheet==='ribbon-action')frames.add(pose.frame);}expect(frames.size).toBe(4);}expect(swings[1]).toBeLessThan(swings[0]);
});
test('Comet dive supports diagonal upgrade, double dash is limited to two per flight and resets on landing',()=>{
 for(const n of [1,2]){const s=trial('comet-dive',n);s.enemies=[];Object.assign(s.player,{y:150,ground:null});tick(s,1,{down:true,right:true,dash:true});expect(s.player.vy).toBeGreaterThan(300);if(n===1)expect(s.player.vx).toBe(0);else expect(s.player.vx).toBeGreaterThan(300);}
 const s=trial('double-dash');s.enemies=[];Object.assign(s.player,{y:-700,ground:null});tick(s,1,{dash:true});tick(s,51);tick(s,1,{dash:true});expect(s.player.airDashes).toBe(2);s.player.dash=s.player.dashWait=0;tick(s,1);tick(s,1,{dash:true});expect(s.player.dash).toBe(0);Object.assign(s.player,{ground:0,y:480});tick(s,1);expect(s.player.airDashes).toBe(0);
});
test('overhead guard blocks from above while leaving the front exposed, and costs the same magic',()=>{
 const s=trial('sky-guard');s.enemies=[];tick(s,1,{guard:true,up:true});const magic=s.magic;expect(s.player.guardY).toBe(-1);expect(guardBlocks(s,{x:s.player.x,y:s.player.y-98,r:8,life:1})).toBe(true);expect(guardBlocks(s,{x:s.player.x+60,y:s.player.y-40,r:8,life:1})).toBe(false);expect(s.magic).toBeLessThan(magic);
});

test('Jelly and Orbit upgrades extend utility while Volt keeps its anti-tap cost',()=>{
 const jelly=trial('starter-6',3);beginCreativeSpecial(jelly,6,1);expect(jelly.drinkFields[0]).toMatchObject({charges:3,life:6,boostShots:true,cherryLift:650});
 for(const n of [1,2,3]){const s=trial('starter-11',n);beginExtraSpecial(s,11,1);const f=s.drinkFields[0];expect(f.orbs.length*f.orbDamage).toBe(12);expect(f.orbs).toHaveLength(n===3?4:3);expect(f.life).toBe(n===1?4.2:5);}
 const s=trial('starter-9',3);s.enemies=[makeEnemy(420,480,0),makeEnemy(600,480,0)];for(const e of s.enemies){e.hp=60;e.recovery=99;}const ammo=s.ammo;for(let i=0;i<5;i++){tick(s,8,{attack:true});tick(s,8);}expect(s.ammo).toBe(ammo-5);expect(s.enemies.every(e=>e.hp===60)).toBe(true);tick(s,40,{attack:true});expect(s.enemies.every(e=>e.hp<60)).toBe(true);
});
