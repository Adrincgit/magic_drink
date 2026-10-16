import {test,expect} from '@playwright/test';
import {createTrial} from '../src/components/arcade/adventure/engine/adventureTrial';
import {stepAdventure,retryAdventure,createAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {equipDrink,DRINK_SHOTS,swapDrink} from '../src/components/arcade/adventure/engine/adventureAmmo';
import {MODS} from '../src/components/arcade/adventure/engine/adventureMods';
import {makeEnemy} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {POPCORN,POPCORN_RANGE,POPCORN_STRONG_RANGE,POPCORN_DAMAGE,POPCORN_COST,firePopcorn} from '../src/components/arcade/adventure/engine/adventurePopcorn';
import {spellFor} from '../src/components/arcade/adventure/engine/adventureMagic';
import {drinkLootPool,takeLoot} from '../src/components/arcade/adventure/engine/adventureLoot';
import {refractShot} from '../src/components/arcade/adventure/engine/adventureCreativeDrinks';
import {sanitizeSave} from '../src/components/arcade/shared/arcadeStore';
const tick=(s,n,input={})=>{for(let i=0;i<n;i++)stepAdventure(s,input,1/120);};
const scene=()=>{const s=createTrial(MODS.find(m=>m.id==='starter-13'));s.enemies=[];s.hostile=[];s.player.hurt=999;return s;};
const dummy=(x,y=480)=>Object.assign(makeEnemy(x,y,5),{hp:100,maxHp:100,timer:99});
test('Popcorn is a collectible, saved shop starter and guaranteed village loot without changing existing IDs',()=>{
 const s=scene();expect(s.weapon).toBe(13);expect(s.ammo).toBe(48);expect(DRINK_SHOTS).toHaveLength(14);
 expect(drinkLootPool(createAdventure(1))).toContain(13);expect(spellFor(13).cost).toBe(45);
 const save=sanitizeSave({version:1,campaign:4,economy:2,stars:500,adventureUnlocked:7,modsOwned:['starter-13'],modsEquipped:['starter-13']});expect(save.modsEquipped).toContain('starter-13');
 expect(createAdventure(7).supplies.filter(q=>q.loot?.kind===13)).toHaveLength(2);
 takeLoot(s,{type:'drink',kind:13});expect(s.drinkTier).toBe(2);expect(s.ammo).toBe(48);
});
test('normal fires seven kernels for one ammo without magic and respects the recovery interval',()=>{
 const s=scene(),ammo=s.ammo;tick(s,1,{attack:true});expect(s.shots).toHaveLength(7);expect(s.ammo).toBe(ammo-1);expect(s.magic).toBe(100);
 expect(s.shots.every(q=>q.damage===POPCORN_DAMAGE&&!q.heavy)).toBe(true);
 tick(s,65,{attack:true});expect(s.ammo).toBe(ammo-1);tick(s,40,{attack:true});expect(s.ammo).toBe(ammo-2);
});
test('strong only doubles travel, costs exactly 45 magic and one ammo, including the last charge',()=>{
 const s=scene();equipDrink(s,13,1);tick(s,1,{special:true,attack:true});expect(s.weapon).toBe(-1);expect(s.magic).toBe(55);expect(s.shots).toHaveLength(7);
 expect(s.shots.every(q=>q.popcornRange===POPCORN_STRONG_RANGE&&q.damage===POPCORN_DAMAGE&&!q.heavy)).toBe(true);
 const normal=scene();tick(normal,1,{attack:true});expect(normal.shots.every(q=>q.popcornRange===POPCORN_RANGE)).toBe(true);
 expect(s.shots.map(q=>[q.vx,q.vy,q.r])).toEqual(normal.shots.map(q=>[q.vx,q.vy,q.r]));
 const poor=scene(),ammo=poor.ammo;poor.magic=44;tick(poor,1,{special:true});expect(poor.shots).toHaveLength(0);expect(poor.ammo).toBe(ammo);
});
test('alternating normal and strong cannot skip the shared recovery or double-bill a press',()=>{
 const s=scene();tick(s,1,{attack:true});tick(s,20);const ammo=s.ammo;tick(s,1,{special:true});expect(s.magic).toBe(100);expect(s.ammo).toBe(ammo);
 tick(s,80);tick(s,1,{special:true,attack:true});expect(s.ammo).toBe(ammo-1);expect(s.magic).toBe(55);
 tick(s,30,{special:true});expect(s.ammo).toBe(ammo-1);
});
test('close targets receive equal normal and strong damage, and only strong reaches distant targets',()=>{
 const damage=(strong,x)=>{const s=scene(),e=dummy(x);s.enemies=[e];tick(s,1,strong?{special:true}:{attack:true});tick(s,90);return 100-e.hp;};
 const close=damage(false,325);expect(close).toBeGreaterThanOrEqual(19);expect(damage(true,325)).toBeCloseTo(close);
 expect(damage(false,620)).toBe(0);expect(damage(true,620)).toBeGreaterThan(0);expect(damage(true,820)).toBe(0);
});
test('kernels stop at the first body and both directions have a bounded reach',()=>{
 const s=scene(),front=dummy(325),back=dummy(390);s.enemies=[front,back];tick(s,1,{attack:true});tick(s,70);expect(front.hp).toBeLessThan(100);expect(back.hp).toBe(100);
 const left=scene();left.player.x=700;left.player.dir=-1;left.player.aimX=-1;left.enemies=[dummy(550)];tick(left,1,{attack:true,left:true});tick(left,70);expect(left.enemies[0].hp).toBeLessThan(100);
 for(const strong of [false,true]){const empty=scene();tick(empty,1,strong?{special:true}:{attack:true});tick(empty,90);expect(empty.shots).toHaveLength(0);}
});
test('prisms preserve the remaining distance budget; retries clear every blast',()=>{
 const s=scene(),q=firePopcorn(s,{x:200,y:400},{x:1,y:0})[3];s.shots=[];
 Object.assign(q,{previousX:330,previousY:400,x:350,y:400,popcornTravel:150});s.drinkFields=[{kind:7,life:5,x:340,y:400,scale:1,prismId:1}];refractShot(s,q);
 expect(s.shots).toHaveLength(3);expect(s.shots.every(p=>p.popcornTravel===150&&p.life<=90/1200)).toBe(true);tick(s,90);expect(s.shots).toHaveLength(0);
 retryAdventure(s);expect(s.effects.some(q=>q.popcornBlast)).toBe(false);
});
test('switching pockets preserves Popcorn ammo and does not grant fresh charges',()=>{
 const s=scene();s.spareDrink={kind:0,ammo:20,capacity:54,tier:1};tick(s,1,{attack:true});tick(s,110);
 const ammo=s.ammo;expect(swapDrink(s)).toBe(true);expect(s.weapon).toBe(0);tick(s,40);expect(swapDrink(s)).toBe(true);expect(s.weapon).toBe(13);expect(s.ammo).toBe(ammo);
});
