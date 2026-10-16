import {test,expect} from '@playwright/test';
import {createAdventure,stepAdventure,retryAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {equipDrink} from '../src/components/arcade/adventure/engine/adventureAmmo';
import {groundY,groundAt} from '../src/components/arcade/adventure/world/adventureTerrain';
import {configureDrinkShot,stepCreativeShot,beginCreativeSpecial,stepDrinkFields,refractShot} from '../src/components/arcade/adventure/engine/adventureCreativeDrinks';
import {makeEnemy} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {damageSupply} from '../src/components/arcade/adventure/world/adventureSupplies';
import {rollLoot,takeLoot} from '../src/components/arcade/adventure/engine/adventureLoot';
import {MODS,availableMod} from '../src/components/arcade/adventure/engine/adventureMods';
const tick=(s,n,input={})=>{for(let i=0;i<n;i++)stepAdventure(s,input,1/120);};
function scene(kind=5,x=850){const s=createAdventure(5);s.enemies=[];s.hostile=[];s.emberEnvironment.bushes=[];s.player.x=x;s.player.y=groundY(s.platforms,x);s.player.ground=s.platforms.indexOf(groundAt(s.platforms,x));equipDrink(s,kind);return s;}
test('Aqua is an attached steerable arc, consumes one cast, and stops on dodge or retry',()=>{
 const s=scene(),ammo=s.ammo;tick(s,1,{special:true});expect(s.ammo).toBe(ammo-5);expect(s.magic).toBeCloseTo(65.5,1);
 tick(s,50,{special:true,right:true,up:true});expect(s.aquaJet).toBeTruthy();expect(s.aquaJet.angle).toBeLessThan(-.8);expect(s.ammo).toBe(ammo-5);
 expect(s.aquaJet.points[0].x).toBeGreaterThan(s.player.x);expect(s.aquaJet.points[12].y).toBeLessThan(s.aquaJet.points[0].y);
 tick(s,60,{down:true});expect(s.aquaJet.angle).toBeGreaterThan(.2);expect(s.aquaJet.grounded).toBe(true);
 expect(s.shots.every(q=>!q.heavy||q.aquaProbe)).toBe(true);
 tick(s,1,{dash:true});expect(s.aquaJet).toBeNull();expect(s.player.aquaChannel).toBe(false);
 tick(s,130);tick(s,1,{special:true});retryAdventure(s);expect(s.aquaJet).toBeNull();
});
test('the hose applies water over time and caps each target at four doses per cast',()=>{
 const s=scene(),floor=s.player.y;
 s.hostile=[{kind:'harlequin-groundfire',source:'forest',harlequin:true,element:'fire',x:970,y:floor,floor,age:1,life:8,r:0,damaging:true}];
 const fire=s.hostile[0];tick(s,1,{special:true});expect(fire.water||0).toBe(0);tick(s,75,{down:true});
 expect(fire.water).toBeGreaterThan(0);expect(fire.water).toBeLessThanOrEqual(4);tick(s,140,{down:true});expect(fire.quenched).toBe(true);
});

test('jelly bounces on terrain and a planted spring launches Hexy and small clowns, never cannon wagons',()=>{
 const s=scene(6),q=configureDrinkShot({kind:6,x:950,y:s.player.y-22,vx:200,vy:200,scale:1,age:0,hits:[]});
 q.previousX=q.x;q.previousY=q.y;q.y+=14;stepCreativeShot(s,q,1/60);
 expect(q.bounces).toBe(1);expect(q.vy).toBeLessThan(0);
 beginCreativeSpecial(s,6,1);const f=s.drinkFields[0];s.player.x=f.x;
 const clown=makeEnemy(f.x,f.y,1),wagon=makeEnemy(f.x,f.y,12);s.enemies=[clown,wagon];
 stepDrinkFields(s,.2);expect(s.player.vy).toBe(-780);expect(clown.jellyLift).toBe(1.5);expect(wagon.jellyLift).toBeUndefined();expect(f.charges).toBe(1);
 s.enemies=[];tick(s,60);expect(s.player.y).toBeLessThan(f.y-100);
 retryAdventure(s);expect(s.drinkFields).toHaveLength(0);
});

test('prism reflects once and divides a crossing shot into exactly three weaker rays',()=>{
 const s=scene(7),q=configureDrinkShot({kind:7,x:950,y:s.player.y-10,vx:200,vy:200,scale:1,age:0,hits:[]});
 q.previousX=q.x;q.previousY=q.y;q.y+=8;stepCreativeShot(s,q,1/60);
 expect(q.bounces).toBe(1);expect(q.vy).toBeLessThan(0);
 q.previousY=s.player.y-10;q.y=s.player.y-2;q.vy=200;stepCreativeShot(s,q,1/60);expect(q.life).toBe(0);
 beginCreativeSpecial(s,7,1);const f=s.drinkFields[0],ray=configureDrinkShot({kind:7,x:f.x+25,y:f.y,vx:500,vy:0,scale:1,age:0,hits:[]});
 ray.previousX=f.x-25;ray.previousY=f.y;refractShot(s,ray);
 expect(ray.life).toBe(0);expect(s.shots).toHaveLength(3);expect(s.shots.map(q=>Math.sign(q.vy))).toEqual([-1,0,1]);
 for(const child of [...s.shots]){expect(child.damage).toBeCloseTo(1.6*.55);refractShot(s,child);}expect(s.shots).toHaveLength(3);
});

test('echo expands and weakens, and its companion follows Hexy and fires only with her using extra ammo',()=>{
 const s=scene(8);tick(s,100,{attack:true});expect(s.drinkHistory.length).toBeGreaterThan(1);
 const q=configureDrinkShot({kind:8,vx:500,vy:0,scale:1,age:0});q.age=.95;stepCreativeShot(s,q,.01);expect(q.r).toBeGreaterThan(28);expect(q.damage).toBeLessThan(1.6);expect(q.piercing).toBe(true);
 const ammo=s.ammo,history=s.drinkHistory.length;tick(s,1,{special:true});const f=s.drinkFields[0],x=f.x;
 tick(s,45,{right:true});expect(s.player.x).toBeGreaterThan(x);expect(f.x).toBeGreaterThan(x);expect(s.ammo).toBe(ammo-5);
 expect(s.shots.some(q=>q.echoCopy)).toBe(false);expect(s.drinkHistory.length).toBe(history);tick(s,50,{attack:true});expect(s.shots.some(q=>q.echoCopy)).toBe(true);
 tick(s,430);expect(s.drinkFields).toHaveLength(1);tick(s,1,{special:true});expect(s.drinkFields).toHaveLength(0);
});

test('new cans remain in crates until broken, equip correctly, and respect the forest loot restriction',()=>{
 for(const kind of [6,7,8]){
  const s=scene(kind),crate={x:1000,y:s.player.y,hp:4,maxHp:4,loot:{type:'drink',kind}};s.pickups=[];
  damageSupply(s,crate,2);expect(s.pickups).toHaveLength(0);damageSupply(s,crate,2);expect(s.pickups).toHaveLength(1);
  takeLoot(s,s.pickups[0]);expect(s.weapon).toBe(kind);expect(s.ammo).toBeGreaterThan(0);
  equipDrink(s,-1);s.lastDrink=kind;takeLoot(s,{type:'ammo'});expect(s.weapon).toBe(kind);
  const mod=MODS.find(q=>q.drink===kind);expect(availableMod(mod,{adventureUnlocked:5})).toBe(true);
 }
 const s=scene(5),seen=new Set();for(let i=0;i<2000;i++){const q=rollLoot(s);if(q.type==='drink')seen.add(q.kind);}
 expect(seen.has(0)).toBe(false);for(const kind of [6,7,8])expect(seen.has(kind)).toBe(true);
});
