import {test,expect} from '@playwright/test';
import {createAdventure,stepAdventure,retryAdventure,adventureCarry} from '../src/components/arcade/adventure/engine/adventureModel';
import {equipDrink,DRINK_SHOTS} from '../src/components/arcade/adventure/engine/adventureAmmo';
import {groundY,groundAt} from '../src/components/arcade/adventure/world/adventureTerrain';
import {makeEnemy} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {beginCreativeSpecial,configureDrinkShot,stepCreativeShot,stepDrinkFields,rememberDrinkShot} from '../src/components/arcade/adventure/engine/adventureCreativeDrinks';
import {orbitPosition} from '../src/components/arcade/adventure/engine/adventureExtraDrinks';
import {rollLoot,takeLoot} from '../src/components/arcade/adventure/engine/adventureLoot';
import {damageSupply} from '../src/components/arcade/adventure/world/adventureSupplies';
import {MODS,availableMod} from '../src/components/arcade/adventure/engine/adventureMods';
const tick=(s,n,input={})=>{for(let i=0;i<n;i++)stepAdventure(s,input,1/120);};
function scene(kind){const s=createAdventure(5);s.enemies=[];s.hostile=[];s.pickups=[];s.supplies=[];s.cages=[];s.outposts=[];s.emberEnvironment.bushes=[];s.player.x=850;s.player.y=groundY(s.platforms,850);s.player.ground=s.platforms.indexOf(groundAt(s.platforms,850));equipDrink(s,kind);return s;}

test('Volt chains a held beam, loses damage per jump, and stops immediately on release',()=>{
 const s=scene(9);s.enemies=[970,1070,1170,1270].map(x=>{const e=makeEnemy(x,s.player.y,5);e.timer=99;e.hp=60;return e;});
 tick(s,100,{attack:true});const damage=s.enemies.map(e=>60-e.hp);expect(damage[0]).toBeGreaterThan(0);expect(damage[1]).toBeCloseTo(damage[0]*.75);expect(damage[2]).toBeCloseTo(damage[0]*.75*.75);expect(damage[3]).toBe(0);
 tick(s,1);const hp=s.enemies[0].hp;tick(s,50);expect(s.enemies[0].hp).toBe(hp);expect(s.voltBeam).toBeNull();
});

test('Honey falls and sticks to actual ground, slows small clowns but not machines, and caps puddles',()=>{
 const s=scene(10);tick(s,1,{attack:true});tick(s,145);const f=s.drinkFields.find(q=>q.puddle);expect(f).toBeTruthy();expect(f.y).toBe(groundY(s.platforms,f.x));
 const e=makeEnemy(f.x,f.y,0),machine=makeEnemy(f.x,f.y,12);s.enemies=[e,machine];stepDrinkFields(s,.05);expect(e.snare).toBeGreaterThan(0);expect(machine.snare||0).toBe(0);
 for(let i=0;i<10;i++){const x=1500+i*75,y=groundY(s.platforms,x);const q=configureDrinkShot({kind:10,x,y:y-5,vx:100,vy:100,scale:1,age:0,hits:[]});q.previousY=y-25;stepCreativeShot(s,q,.01);}
 expect(s.drinkFields.filter(q=>q.puddle&&q.life>0).length).toBeLessThanOrEqual(6);
});

test('Honey hive releases exactly six falling drops and costs only one strong cast',()=>{
 const s=scene(10),ammo=s.ammo;tick(s,1,{special:true});tick(s,24);const hive=s.drinkFields.find(q=>!q.puddle);tick(s,270);
 expect(hive.at).toBe(6);expect(s.ammo).toBe(ammo-5);expect(s.drinkFields.some(q=>q.puddle)).toBe(true);tick(s,500);expect(s.drinkFields).toHaveLength(0);
});

test('Orbit curves before release, follows Hexy, and three satellites block only three discrete projectiles',()=>{
 const s=scene(11);tick(s,1,{attack:true});const q=s.shots[0];tick(s,20,{right:true});expect(Math.abs(q.x-s.player.x)).toBeLessThan(58);expect(q.vx).toBe(0);
 tick(s,45);expect(q.orbitLaunched).toBe(true);expect(q.vx).toBeGreaterThan(400);
 beginCreativeSpecial(s,11,1);const f=s.drinkFields[0];s.player.x+=80;stepDrinkFields(s,.1);expect(f.x).toBe(s.player.x);
 for(let i=0;i<30;i++){f.age=i*.05;for(const orb of f.orbs)expect(orbitPosition(f,orb).y+17).toBeLessThan(s.player.y);}
 for(let i=0;i<3;i++){const orb=f.orbs.find(o=>o.alive),p=orbitPosition(f,orb);const bullet={x:p.x,y:p.y,vx:120,vy:0,r:10,life:2,kind:'ball'};s.hostile=[bullet];stepDrinkFields(s,0);expect(bullet.life).toBe(0);}
 expect(f.orbs.every(o=>!o.alive)).toBe(true);expect(s.drinkFields).toHaveLength(0);
});

test('Orbit does not extinguish ground fire and its moons can damage each target only once',()=>{
 const s=scene(11);beginCreativeSpecial(s,11,1);const f=s.drinkFields[0],orb=f.orbs[0],p=orbitPosition(f,orb);
 const fire={kind:'harlequin-groundfire',x:p.x,y:p.y,r:35,life:8,vx:0,vy:0};s.hostile=[fire];stepDrinkFields(s,0);expect(fire.life).toBe(8);expect(orb.alive).toBe(true);
 s.hostile=[];const e=makeEnemy(p.x,p.y+32,5);e.timer=99;s.enemies=[e];const hp=e.hp;tick(s,1);expect(e.hp).toBeCloseTo(hp-4);expect(orb.alive).toBe(false);
 tick(s,5);expect(e.hp).toBeCloseTo(hp-4);retryAdventure(s);expect(s.drinkFields).toHaveLength(0);
});

test('all new cans release from crates, survive chapter carry and have valid shop and loot entries',()=>{
 for(const kind of [9,10,11]){
  const s=scene(kind),q={x:1000,y:s.player.y,hp:4,maxHp:4,loot:{type:'drink',kind}};
  damageSupply(s,q,3);expect(s.pickups).toHaveLength(0);damageSupply(s,q,3);takeLoot(s,s.pickups[0]);expect(s.ammo).toBe(DRINK_SHOTS[kind]);
  const next=createAdventure(3,false,adventureCarry(s));expect(next.weapon).toBe(kind);expect(next.ammo).toBe(s.ammo);
  expect(availableMod(MODS.find(m=>m.drink===kind),{adventureUnlocked:3})).toBe(true);
 }
 const s=scene(9),kinds=new Set();for(let i=0;i<3000;i++){const q=rollLoot(s);if(q.type==='drink')kinds.add(q.kind);}for(const kind of [9,10,11])expect(kinds.has(kind)).toBe(true);expect(kinds.has(0)).toBe(false);
});

test('Echo copies an actual Orbit shot synchronously around the companion position',()=>{
 const s=scene(11);s.spareDrink={kind:8,ammo:20,capacity:48,tier:1};beginCreativeSpecial(s,8,1);
 tick(s,45);expect(s.shots).toHaveLength(0);expect(s.spareDrink.ammo).toBe(20);tick(s,1,{attack:true});
 const main=s.shots.find(q=>!q.echoCopy),copy=s.shots.find(q=>q.echoCopy),anchor={...copy.orbitAnchor};expect(copy.kind).toBe(11);expect(copy.age).toBe(main.age);expect(Math.abs(copy.x-anchor.x)).toBeLessThan(60);expect(s.spareDrink.ammo).toBe(19);
 s.player.x+=100;tick(s,20);expect(copy.orbitAnchor).toEqual(anchor);expect(Math.abs(copy.x-anchor.x)).toBeLessThan(60);expect(copy.damage).toBeCloseTo(main.damage*.5);
});
