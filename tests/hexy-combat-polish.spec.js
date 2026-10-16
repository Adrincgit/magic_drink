import {test,expect} from '@playwright/test';
import {createTrial} from '../src/components/arcade/adventure/engine/adventureTrial';
import {stepAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {MODS} from '../src/components/arcade/adventure/engine/adventureMods';
import {beginCreativeSpecial,configureDrinkShot,stepCreativeShot,stepDrinkFields} from '../src/components/arcade/adventure/engine/adventureCreativeDrinks';
import {equipDrink,swapDrink} from '../src/components/arcade/adventure/engine/adventureAmmo';
import {hexyPose,hexyMuzzle} from '../src/components/arcade/adventure/actors/hexy/hexyAnimation';
import {makeEnemy} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {reactToElement,stepElementHit,elementDrawing} from '../src/components/arcade/adventure/actors/enemies/adventureElementHits';
import {readAdventureGamepad} from '../src/components/arcade/adventure/input/adventureGamepad';
import {releaseOrbit} from '../src/components/arcade/adventure/engine/adventureExtraDrinks';
const scene=(id='starter-8',level=1)=>{const s=createTrial(MODS.find(m=>m.id===id),level);s.enemies=[];s.supplies=[];s.outposts=[];s.cages=[];return s;};
const tick=(s,n,input={})=>{for(let i=0;i<n;i++)stepAdventure(s,input,1/120);};
const xbox=(...pressed)=>readAdventureGamepad({connected:true,mapping:'standard',axes:[0,0],buttons:Array.from({length:17},(_,i)=>({pressed:pressed.includes(i),value:pressed.includes(i)?1:0}))});
test('Xbox Y toggles Echo, held Y does not repeat, and X creates simultaneous shots with no idle drain',()=>{
 const s=scene(),ammo=s.ammo;tick(s,1,xbox(3));expect(s.drinkFields).toHaveLength(1);expect(s.ammo).toBe(ammo-5);tick(s,75,xbox(3));expect(s.drinkFields).toHaveLength(1);expect(s.ammo).toBe(ammo-5);
 const x=s.drinkFields[0].x;tick(s,120,xbox(15));expect(s.drinkFields[0].x).toBeGreaterThan(x);expect(s.shots).toHaveLength(0);expect(s.ammo).toBe(ammo-5);
 tick(s,1,xbox(2));const main=s.shots.find(q=>!q.echoCopy),copy=s.shots.find(q=>q.echoCopy);expect(main).toBeTruthy();expect(copy).toBeTruthy();expect(copy.age).toBe(main.age);expect(copy.vx).toBe(main.vx);expect(copy.vy).toBe(main.vy);expect(copy.damage).toBeCloseTo(main.damage*.5);expect(s.ammo).toBe(ammo-7);
 tick(s,450);expect(s.drinkFields).toHaveLength(1);expect(s.shots).toHaveLength(0);expect(s.ammo).toBe(ammo-7);s.magic=0;tick(s,1,xbox(3));expect(s.drinkFields).toHaveLength(0);expect(s.ammo).toBe(ammo-7);
});

test('Echo in the second pocket spends only on player shots and never creates an unpaid copy',()=>{
 const s=scene();s.modCategorySlots={drinks:2};s.spareDrink={kind:0,ammo:20,capacity:54,tier:1};beginCreativeSpecial(s,8,1);s.ammo=2;expect(swapDrink(s)).toBe(true);tick(s,130);expect(s.ammo).toBe(20);expect(s.spareDrink.ammo).toBe(2);expect(s.shots).toHaveLength(0);
 tick(s,1,{attack:true});expect(s.ammo).toBe(19);expect(s.spareDrink.ammo).toBe(1);expect(s.shots.find(q=>q.echoCopy).kind).toBe(0);tick(s,40);tick(s,1,{attack:true});expect(s.ammo).toBe(18);expect(s.spareDrink).toBeNull();expect(s.drinkFields).toHaveLength(0);
 const empty=scene();equipDrink(empty,8,1);beginCreativeSpecial(empty,8,1);tick(empty,1,{attack:true});expect(empty.weapon).toBe(-1);expect(empty.drinkFields).toHaveLength(0);expect(empty.shots.filter(q=>q.echoCopy)).toHaveLength(0);expect(empty.shots).toHaveLength(1);
});

test('all Echo levels copy every actual volley on the same frame and respect fire cooldown',()=>{
 for(const n of [1,2,3]){const s=scene('starter-8',n);beginCreativeSpecial(s,8,1);const ammo=s.ammo;
  tick(s,1,{attack:true,up:true});const main=s.shots.find(q=>!q.echoCopy),copies=s.shots.filter(q=>q.echoCopy);expect(copies).toHaveLength(n);expect(copies.every(q=>q.age===main.age&&q.vy===main.vy&&q.vx===main.vx)).toBe(true);expect(s.ammo).toBe(ammo-1-n);
  tick(s,10,{attack:true});expect(s.shots).toHaveLength(n+1);expect(s.ammo).toBe(ammo-1-n);tick(s,50);expect(s.ammo).toBe(ammo-1-n);
  tick(s,1,{attack:true,left:true});const next=s.shots.filter(q=>q.age<.01);expect(next).toHaveLength(n+1);expect(next.every(q=>q.vx<0)).toBe(true);expect(s.ammo).toBe(ammo-2*(1+n));
 }
});

test('Echo charges once per spread volley, and blocked inputs do not fire or consume ammo',()=>{
 const s=scene('starter-4');s.spareDrink={kind:8,ammo:20,capacity:48,tier:1};beginCreativeSpecial(s,8,1);const ammo=s.ammo;tick(s,1,{attack:true});expect(s.shots.filter(q=>q.echoCopy)).toHaveLength(3);expect(s.shots.filter(q=>!q.echoCopy)).toHaveLength(3);expect(s.spareDrink.ammo).toBe(19);expect(s.ammo).toBe(ammo-1);
 for(const input of [{attack:true,guard:true},{attack:true,dash:true}]){const blocked=scene();beginCreativeSpecial(blocked,8,1);const reserve=blocked.ammo;tick(blocked,1,input);expect(blocked.shots).toHaveLength(0);expect(blocked.ammo).toBe(reserve);}
});

test('a copied Volt beam shares the held input, warm-up and ammo intervals, then stops on release',()=>{
 const s=scene('starter-9');s.spareDrink={kind:8,ammo:20,capacity:48,tier:1};beginCreativeSpecial(s,8,1);const e=makeEnemy(410,480,0);e.hp=100;e.recovery=99;s.enemies=[e];const ammo=s.ammo;
 tick(s,120);expect(s.voltBeam).toBeFalsy();expect(s.spareDrink.ammo).toBe(20);tick(s,1,{attack:true});expect(s.voltBeam.segments).toHaveLength(2);expect(s.ammo).toBe(ammo-1);expect(s.spareDrink.ammo).toBe(19);
 tick(s,20,{attack:true});expect(e.hp).toBe(100);tick(s,25,{attack:true});expect(e.hp).toBeLessThan(100);expect(s.ammo).toBe(ammo-2);expect(s.spareDrink.ammo).toBe(18);
 tick(s,1);expect(s.voltBeam).toBeNull();const hp=e.hp;tick(s,100);expect(s.ammo).toBe(ammo-2);expect(s.spareDrink.ammo).toBe(18);expect(e.hp).toBe(hp);
});

test('Jelly catches a horizontal swept cherry at level I; level III gains height without multiplying damage',()=>{
 const lift=[];for(const level of [1,2,3]){const s=scene('starter-6',level);beginCreativeSpecial(s,6,1);const f=s.drinkFields[0];f.age=.2;
  const q=configureDrinkShot({kind:6,x:f.x+50,y:f.y-46,vx:510,vy:0,scale:1,age:0,hits:[]});q.previousX=f.x-85;q.previousY=q.y;stepCreativeShot(s,q,1/120);expect(q.vy).toBeLessThan(-500);expect(q.damage).toBe(3);expect(q.jellyPads).toContain(f);lift.push(q.vy);
  q.vy=40;stepCreativeShot(s,q,1/120);expect(q.vy).toBeGreaterThan(0);
 }expect(lift).toEqual([-520,-520,-650]);
});
test('Jelly mastery permits one, two, two pads with distinct positions and replaces the oldest',()=>{
 for(const n of [1,2,3]){const s=scene('starter-6',n);for(let i=0;i<3;i++)beginCreativeSpecial(s,6,1);expect(s.drinkFields).toHaveLength(n===1?1:2);if(n>1)expect(Math.abs(s.drinkFields[0].x-s.drinkFields[1].x)).toBeGreaterThan(90);expect(s.drinkFields.every(f=>f.platform&&f.charges===3)).toBe(true);}
});
test('an ordinary horizontal Jelly shot reaches and rebounds from a freshly placed level I spring',()=>{
 const s=scene('starter-6');beginCreativeSpecial(s,6,1);tick(s,25);tick(s,1,{attack:true});const q=s.shots.find(q=>q.kind===6&&!q.hidden);let bounced=false;
 for(let i=0;i<90;i++){tick(s,1);if(q.jellyPads?.length){bounced=true;expect(q.vy).toBeLessThan(-500);break;}}
 expect(bounced).toBe(true);
});
test('Orbit level II converts only remaining shields into aimed shots; level III expands coverage within the same damage budget',()=>{
 for(const n of [1,2,3]){const s=scene('starter-11',n);beginCreativeSpecial(s,11,1);const f=s.drinkFields[0],ammo=s.ammo;f.orbs[0].alive=false;Object.assign(s.player,{aimX:0,aimY:-1});const count=f.orbs.filter(q=>q.alive).length;
  expect(releaseOrbit(s)).toBe(n>=2);if(n===1)continue;
  const volley=s.shots.filter(q=>q.orbitVolley);expect(volley).toHaveLength(count);expect(volley.every(q=>q.vy< -500)).toBe(true);expect(volley.reduce((a,q)=>a+q.damage,0)).toBeLessThanOrEqual(12);expect(s.ammo).toBe(ammo);expect(f.life).toBe(0);expect(releaseOrbit(s)).toBe(false);
 }
});
test('Ribbon launcher is a wand-attached four-pose rising sweep with a modest damage budget',()=>{
 const s=scene('ribbon-duration');tick(s,86);tick(s,1,{special:true});tick(s,1);expect(s.drinkFields).toHaveLength(0);const q=s.shots.find(q=>q.ribbonStrong);expect(q).toBeTruthy();const frames=new Set();
 for(let i=0;i<90;i++){if(q.life>0){expect(q.ribbonOrigin.x).toBeCloseTo(hexyMuzzle(s).x);frames.add(hexyPose(s).frame);}tick(s,1);}
 expect(frames.size).toBe(4);expect(q.damage).toBe(2.5);expect(q.life).toBeLessThanOrEqual(0);
});
test('basic clown elemental reactions play four distinct cels and do not replace machines or non-elemental hits',()=>{
 for(const [kind,row]of [[9,0],[0,1],[5,2],[10,3]]){const e=makeEnemy(500,480,0);reactToElement(e,{kind});const frames=[];for(let i=0;i<4;i++){frames.push(elementDrawing(e).frame);stepElementHit(e,.13);}expect(frames).toEqual([row*4,row*4+1,row*4+2,row*4+3]);stepElementHit(e,.01);expect(elementDrawing(e)).toBeNull();}
 for(const type of [1,5,6,7,9,12,14]){const e=makeEnemy(500,480,type);reactToElement(e,{kind:9});expect(elementDrawing(e)).toBeNull();}
 const e=makeEnemy(500,480,0);for(const kind of [-1,6,7,8,11,12]){reactToElement(e,{kind});expect(elementDrawing(e)).toBeNull();}
});
test('real elemental collisions select reaction sprites without changing the enemy hitbox or repeatedly restarting it',()=>{
 for(const kind of [0,5,9,10]){const s=scene(),e=makeEnemy(500,480,0);e.hp=99;e.recovery=99;s.enemies=[e];s.shots.push({kind,x:500,y:450,vx:0,vy:0,r:14,age:0,life:.02,damage:1,hits:[],hidden:true,heavy:true});tick(s,1);expect(e.elementHit).toBeTruthy();const reaction=e.elementHit;reactToElement(e,{kind});expect(e.elementHit).toBe(reaction);}
});
test('overhead guard and downward dash use dedicated poses, including hit bracing and a visible kick burst',()=>{
 const s=scene('sky-guard');tick(s,1,{guard:true,up:true});expect(hexyPose(s)).toEqual({sheet:'guard-up',frame:0});tick(s,20,{guard:true,up:true});expect(hexyPose(s).frame).toBeGreaterThan(0);s.player.guardHit=.2;expect(hexyPose(s).frame).toBe(3);
 const d=scene('comet-dive',2);Object.assign(d.player,{y:180,ground:null,vy:0});tick(d,1,{dash:true,down:true,right:true});expect(hexyPose(d).sheet).toBe('comet-kick');expect(d.effects.some(q=>q.diveKick)).toBe(true);expect(d.player.vy).toBeGreaterThan(0);expect(d.player.vx).toBeGreaterThan(0);
});
