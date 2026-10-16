import {test,expect} from '@playwright/test';
import {createTrial,stepTrial,changeTrialDrink,trialDemoInput} from '../src/components/arcade/adventure/engine/adventureTrial';
import {MODS} from '../src/components/arcade/adventure/engine/adventureMods';
import {beginCreativeSpecial,refractShot,configureDrinkShot,stepCreativeShot} from '../src/components/arcade/adventure/engine/adventureCreativeDrinks';
import {makeEnemy} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {enemyBody} from '../src/components/arcade/adventure/actors/enemies/adventureEnemyGeometry';
import {canTrapEnemy} from '../src/components/arcade/adventure/engine/adventureBubbles';
import {stepAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {LEVELS} from '../src/components/arcade/adventure/world/adventureLevels';
const scene=(id,level=1)=>{const s=createTrial(MODS.find(m=>m.id===id),level);for(const e of s.enemies){e.hp=e.maxHp=60;e.practice=false;e.recovery=99;}return s;};
const tick=(s,n,input={})=>{for(let i=0;i<n;i++)stepTrial(s,input,1/120);};
test('Volt charges every tap, requires sustained contact and ramps damage while chaining only three targets',()=>{
 const s=scene('starter-9'),ammo=s.ammo,hp=s.enemies[0].hp;
 for(let i=0;i<5;i++){tick(s,8,{attack:true});tick(s,8);}expect(s.ammo).toBe(ammo-5);expect(s.enemies[0].hp).toBe(hp);
 tick(s,80,{attack:true});const first=hp-s.enemies[0].hp;expect(first).toBeGreaterThan(0);const other=s.enemies.map(e=>60-e.hp);expect(other[1]).toBeCloseTo(first*.75);expect(other[2]).toBeCloseTo(first*.75*.75);
 tick(s,80,{attack:true});expect(hp-s.enemies[0].hp-first).toBeGreaterThan(first);expect(s.shots.filter(q=>q.kind===9).every(q=>q.hidden)).toBe(true);tick(s,1);expect(s.voltBeam).toBeNull();
});
test('Volt strong is instantaneous, longer range, single damage application and costs seven ammo',()=>{
 const s=scene('starter-9');s.enemies=[650,895,1135,1375,1615].map(x=>{const e=makeEnemy(x,480,5);e.hp=60;return e;});const ammo=s.ammo;
 tick(s,1,{attack:true});tick(s,50,{attack:true});expect(s.enemies.every(e=>e.hp===60)).toBe(true);
 tick(s,1);tick(s,1,{special:true});expect(s.enemies[0].hp).toBe(53);expect(s.enemies[4].hp).toBeCloseTo(60-7*.75**4);const health=s.enemies.map(e=>e.hp);expect(s.ammo).toBe(ammo-9);tick(s,60);expect(s.enemies.map(e=>e.hp)).toEqual(health);
});
test('strong Volt interrupts a held beam and cannot bill an extra normal shot on that frame',()=>{
 const s=scene('starter-9'),ammo=s.ammo;tick(s,1,{attack:true,special:true});expect(s.ammo).toBe(ammo-7);expect(s.voltBeam).toBeNull();
});
test('Jelly and Honey preview placement before casting, allow aiming, and cancel without paying',()=>{
 for(const id of ['starter-6','starter-10']){const s=scene(id),ammo=s.ammo,x=s.player.x;tick(s,30,{special:true,right:true,up:true});expect(s.drinkFields).toHaveLength(0);expect(s.ammo).toBe(ammo);expect(s.placement.x).toBeGreaterThan(x+120);const target={...s.placement};tick(s,1);const f=s.drinkFields[0];expect(f.x).toBe(target.x);expect(f.y).toBe(target.y);expect(s.ammo).toBe(ammo-5);
  tick(s,70);tick(s,10,{special:true});tick(s,1,{guard:true});expect(s.placement).toBeNull();expect(s.ammo).toBe(ammo-5);
 }
 const s=scene('starter-6');tick(s,1,{special:true});tick(s,5);expect(s.drinkFields).toHaveLength(0);tick(s,22);expect(s.drinkFields).toHaveLength(1);
});
test('Jelly boosts descending cherries from base level',()=>{
 for(const level of [1,2]){const s=scene('starter-6',level);beginCreativeSpecial(s,6,1);const f=s.drinkFields[0];f.age=.2;const q=configureDrinkShot({kind:6,x:f.x,y:f.y-20,vx:100,vy:200,scale:1,age:0,hits:[]});q.previousY=f.y-50;q.previousX=f.x;stepCreativeShot(s,q,1/120);expect(q.vy).toBe(-520);}
});
test('Prism upgrade keeps two prisms and bounds recursive splitting to two visits',()=>{
 const base=scene('starter-7');beginCreativeSpecial(base,7,1);beginCreativeSpecial(base,7,1);expect(base.drinkFields).toHaveLength(1);
 const s=scene('starter-7',2);beginCreativeSpecial(s,7,1);beginCreativeSpecial(s,7,1);const [a,b]=s.drinkFields;expect(s.drinkFields).toHaveLength(2);expect(b.x-a.x).toBe(110);changeTrialDrink(s,0);
 const q={kind:0,x:a.x+5,y:a.y,previousX:a.x-5,previousY:a.y,vx:510,vy:0,r:10,damage:3,life:1,hits:[]};refractShot(s,q);expect(s.shots).toHaveLength(3);
 const center=s.shots[1];Object.assign(center,{x:b.x+5,y:b.y,previousX:b.x-5,previousY:b.y});refractShot(s,center);expect(s.shots).toHaveLength(6);const grandchildren=s.shots.slice(3);expect(grandchildren[0].damage).toBeCloseTo(3*.55*.55);for(const child of grandchildren){child.x=a.x;child.y=a.y;refractShot(s,child);}expect(s.shots).toHaveLength(6);
});
test('spring boots chain stomps, reset air jumps and never make machinery or spikes safe',()=>{
 for(const [type,spiked,safe]of [[0,false,true],[12,false,false],[5,false,false],[0,true,false]]){const s=scene('spring-boots'),e=makeEnemy(420,480,type);e.spiked=spiked;s.enemies=[e];const top=enemyBody(e).y;Object.assign(s.player,{x:e.x,y:top-2,vy:250,ground:null,jumps:2});delete s.trial;for(let i=0;i<3;i++)stepAdventure(s,{},1/120);if(safe){expect(e.hp).toBe(0);expect(s.player.vy).toBeLessThan(-600);expect(s.player.jumps).toBe(0);}else{expect(e.hp).toBeGreaterThan(0);expect(s.hearts).toBeLessThan(5);}}
});
test('Bubble traps only with strong magic and trial mutations never leak into campaign level data',()=>{
 const e=makeEnemy(0,480,0),machine=makeEnemy(0,480,12);expect(canTrapEnemy({heavy:false},e)).toBe(false);expect(canTrapEnemy({heavy:true},e)).toBe(true);expect(canTrapEnemy({heavy:true},machine)).toBe(false);
 const snapshot=JSON.stringify(LEVELS[0]);const s=scene('starter-7',2);tick(s,300,{attack:true,right:true});s.level.scenery.push({kind:'fake'});s.platforms[0].y=12;expect(JSON.stringify(LEVELS[0])).toBe(snapshot);
});
test('boots demo actually chains stomps while retaining all hearts',()=>{
 const s=createTrial(MODS.find(m=>m.id==='spring-boots'));for(let i=0;i<360;i++)stepTrial(s,trialDemoInput(s),1/120);expect(s.trial.defeats).toBeGreaterThanOrEqual(2);expect(s.hearts).toBe(5);
});
