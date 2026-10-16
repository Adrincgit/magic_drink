import {test,expect} from '@playwright/test';
import {createAdventure,stepAdventure,retryAdventure,adventureCarry} from '../src/components/arcade/adventure/engine/adventureModel';
import {equipDrink,DRINK_SHOTS} from '../src/components/arcade/adventure/engine/adventureAmmo';
import {configureDrinkShot,beginCreativeSpecial,stepDrinkFields,rememberDrinkShot,stepCreativeShot,refractShot} from '../src/components/arcade/adventure/engine/adventureCreativeDrinks';
import {deployCoaster,stepCoaster,landOnCoaster} from '../src/components/arcade/adventure/engine/adventureCoaster';
import {makeEnemy,updateEnemies} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {umbrellaFrame,umbrellaBlocks,stepUmbrella} from '../src/components/arcade/adventure/actors/enemies/adventureUmbrella';
import {damageSupply} from '../src/components/arcade/adventure/world/adventureSupplies';
import {takeLoot,drinkLootPool} from '../src/components/arcade/adventure/engine/adventureLoot';
import {beginShopTransition} from '../src/components/arcade/adventure/engine/adventureShop';
import {MODS,modPrice} from '../src/components/arcade/adventure/engine/adventureMods';
import {readAdventureGamepad} from '../src/components/arcade/adventure/input/adventureGamepad';
import {hexyPose} from '../src/components/arcade/adventure/actors/hexy/hexyAnimation';
const tick=(s,n,input={})=>{for(let i=0;i<n;i++)stepAdventure(s,input,1/120);};
function scene(){const s=createAdventure(0,false,{mods:['enchanted-coaster'],modSlots:1});s.enemies=[];s.outposts=[];s.supplies=[];s.cages=[];s.stars=[];s.hazards=[];s.player.x=300;s.player.y=s.platforms[0].y;return s;}
function enemy(s,x,type=5){const e=makeEnemy(x,s.player.y,type);e.timer=99;return e;}

test('Ribbon sweeps from the wand and deals only one hit per target across all samples and frames',()=>{
 const s=scene();equipDrink(s,12);tick(s,86);const e=enemy(s,445);s.enemies=[e];const hp=e.hp,ammo=s.ammo;
 tick(s,1,{attack:true});const q=s.shots.find(q=>q.ribbon);expect(q).toBeTruthy();tick(s,20);expect(q.points.length).toBeGreaterThan(4);expect(e.hp).toBeCloseTo(hp-1.25);expect(s.ammo).toBe(ammo);
 tick(s,35);expect(e.hp).toBeCloseTo(hp-1.25);expect(s.shots.some(q=>q.ribbon)).toBe(false);
});
test('Ribbon follows Hexy, respects wand aim and cancels on a roll; Prism does not detach the whip',()=>{
 const s=scene();equipDrink(s,12);tick(s,86);tick(s,1,{attack:true,up:true});const q=s.shots.find(q=>q.ribbon);tick(s,13,{right:true});expect(q.points.at(-1).y).toBeLessThan(q.points[0].y);
 beginCreativeSpecial(s,7,1);const f=s.drinkFields[0];q.x=f.x;q.y=f.y;refractShot(s,q);expect(s.shots.some(q=>q.prismSplit)).toBe(false);
 tick(s,1,{dash:true});expect(q.life).toBeLessThanOrEqual(0);
});
test('Echo copies a Ribbon swing synchronously from its own wand and ammo reserve',()=>{
 const s=scene();equipDrink(s,12);tick(s,86);s.spareDrink={kind:8,ammo:20,capacity:48,tier:1};beginCreativeSpecial(s,8,1);const echo=s.drinkFields[0];s.player.x+=100;stepDrinkFields(s,.35);
 expect(s.shots).toHaveLength(0);tick(s,1,{attack:true});const copy=s.shots.find(q=>q.echoCopy),main=s.shots.find(q=>q.ribbon&&!q.echoCopy);expect(copy.ribbon).toBe(true);expect(copy.kind).toBe(12);expect(copy.age).toBe(main.age);expect(copy.x).toBe(echo.muzzle.x);expect(copy.damage).toBeCloseTo(1.25*.5);expect(s.spareDrink.ammo).toBe(19);expect(s.ammo).toBe(DRINK_SHOTS[12]);
 tick(s,10,{right:true});expect(copy.ribbonOrigin.x).toBeCloseTo(echo.muzzle.x);expect(copy.ribbonOrigin.y).toBeCloseTo(echo.muzzle.y);expect(s.spareDrink.ammo).toBe(19);
});
test('Ribbon launcher hits machinery once without moving or trapping it',()=>{
 const s=scene();equipDrink(s,12);tick(s,86);const enemies=[enemy(s,470,5),enemy(s,510,12)];s.enemies=enemies;const hp=enemies.map(e=>e.hp),xs=enemies.map(e=>e.x);tick(s,1,{special:true});expect(s.drinkFields).toHaveLength(0);tick(s,85);
 for(const [i,e]of enemies.entries()){expect(e.hp).toBeCloseTo(hp[i]-2.5);expect(e.x).toBe(xs[i]);expect(e.trap).toBe(0);}
});
test('coaster deploys only airborne, catches falling feet and allows a jump without granting another platform',()=>{
 const s=scene();expect(deployCoaster(s)).toBe(false);tick(s,1,{jump:true});tick(s,25);tick(s,1,{coaster:true});expect(s.coaster).toBeTruthy();expect(s.coasterUsed).toBe(true);
 tick(s,30);expect(s.player.coasterGround).toBe(true);expect(s.player.ground).toBeNull();expect(hexyPose(s).sheet).not.toBe('jump');const y=s.player.y;
 tick(s,1,{jump:true});expect(s.player.vy).toBeLessThan(0);expect(s.player.y).toBeLessThan(y);expect(deployCoaster(s)).toBe(false);tick(s,260);expect(s.player.ground).not.toBeNull();expect(s.coasterUsed).toBe(false);
});
test('coaster is one-way, cannot reset while held, expires, and drops Hexy when walking off',()=>{
 const s=scene();Object.assign(s.player,{ground:null,y:300,vy:-100});expect(deployCoaster(s)).toBe(true);s.player.y=330;landOnCoaster(s,320);expect(s.player.coasterGround).toBe(false);
 s.player.y=s.coaster.y;s.player.vy=0;landOnCoaster(s,s.player.y);expect(s.player.coasterGround).toBe(true);s.player.x+=90;landOnCoaster(s,s.player.y);expect(s.player.coasterGround).toBe(false);
 stepCoaster(s,1.7);expect(s.coaster).toBeNull();expect(s.coasterUsed).toBe(true);expect(deployCoaster(s)).toBe(false);
});
test('temporary coaster state is cleared by retry and shop entry; L3 maps to its own action',()=>{
 const s=scene();s.player.ground=null;deployCoaster(s);retryAdventure(s);expect(s.coaster).toBeNull();expect(s.coasterUsed).toBe(false);deployCoaster(s);beginShopTransition(s);expect(s.coaster).toBeNull();expect(s.player.coasterGround).toBe(false);
 const pad={connected:true,mapping:'standard',axes:[0,0],buttons:Array.from({length:17},(_,i)=>({pressed:i===10,value:i===10?1:0}))};const input=readAdventureGamepad(pad);expect(input.coaster).toBe(true);expect(input.swap).toBe(false);expect(input.jump).toBe(false);
 expect(modPrice(MODS.find(m=>m.id==='enchanted-coaster'),1)).toBeNull();
});
test('umbrella blocks frontal magic and bubbles, while rear, overhead and closed attacks damage it',()=>{
 for(const kind of [-1,3,12]){
  const s=scene(),e=enemy(s,480,14);e.umbrellaAge=.1;s.enemies=[e];const hp=e.hp;
  s.shots=[{kind,x:423,y:e.y-50,vx:kind===12?0:250,vy:0,previousX:400,ribbonOrigin:kind===12?{x:300,y:e.y-40}:undefined,r:10,age:0,life:1,damage:3,hits:[]}];tick(s,1);expect(e.hp).toBe(hp);expect(e.trap).toBe(0);expect(e.umbrellaHit).toBeGreaterThan(0);
 }
 for(const variant of ['rear','overhead','closed']){
  const s=scene(),e=enemy(s,480,14);s.enemies=[e];if(variant==='closed')e.umbrellaPhase='recover';const hp=e.hp;
  s.shots=[{kind:-1,x:e.x+(variant==='rear'?20:-15),y:e.y-(variant==='overhead'?93:40),vx:variant==='rear'?-250:variant==='closed'?250:0,vy:variant==='overhead'?250:0,r:10,age:0,life:1,damage:2,hits:[]}];tick(s,1);expect(e.hp).toBeCloseTo(hp-2);
 }
});
test('umbrella closes for a visible tell, locks its facing while attacking and recovers with shield closed',()=>{
 const s=scene(),e=enemy(s,500,14);s.player.x=300;e.umbrellaAge=1.59;const shots=[];const shoot=(...q)=>shots.push(q);stepUmbrella(s,e,.02,shoot);expect(e.umbrellaPhase).toBe('close');expect(umbrellaFrame(e)).toBe(4);
 s.player.x=600;stepUmbrella(s,e,.3,shoot);expect(e.dir).toBe(-1);expect(umbrellaFrame(e)).toBe(5);expect(shots).toHaveLength(0);stepUmbrella(s,e,.36,shoot);expect(shots).toHaveLength(1);expect(umbrellaFrame(e)).toBe(6);
 stepUmbrella(s,e,.25,shoot);expect(umbrellaFrame(e)).toBe(7);expect(umbrellaBlocks(e,{x:e.x-20,y:e.y-40,vx:250,vy:0})).toBe(false);
 const frames=[0,.26,.51,.8].map(deathAge=>umbrellaFrame({...e,hp:0,deathAge}));expect(frames).toEqual([12,13,14,15]);
});
test('Ribbon stays inside its crate, equips from loot, expires before carry and is available in the shop',()=>{
 const s=scene(),crate={x:500,y:s.player.y,hp:4,maxHp:4,loot:{type:'drink',kind:12}};damageSupply(s,crate,2);expect(s.pickups).toHaveLength(0);damageSupply(s,crate,2);takeLoot(s,s.pickups[0]);expect(s.weapon).toBe(12);expect(s.ammo).toBe(DRINK_SHOTS[12]);const next=createAdventure(3,false,adventureCarry(s));expect(next.weapon).toBe(-1);expect(drinkLootPool(next)).toContain(12);expect(MODS.find(m=>m.id==='ribbon-duration').unlock).toBe(2);
});
