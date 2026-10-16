import {test,expect} from '@playwright/test';
import {createAdventure,stepAdventure,retryAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {createTrial} from '../src/components/arcade/adventure/engine/adventureTrial';
import {MODS} from '../src/components/arcade/adventure/engine/adventureMods';
import {makeEnemy} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
const tick=(s,time,input={})=>{for(let i=0;i<time*120;i++)stepAdventure(s,input,1/120);};
function fight(seed=0,type=18){
 const s=createTrial(MODS.find(m=>m.id==='starter-13')),e=makeEnemy(325,480,type,seed);s.level.route=s.platforms;e.nightmareVariant=0;e.active=false;e.releasesSoul=false;e.hp=2;e.maxHp=2;s.enemies=[e];s.player.hurt=999;s.looseBones=[];s.villageFire=[];return{s,e};
}
for(const [seed,style]of ['vapor','scatter','launch'].entries())test(`a real lethal Popcorn hit triggers ${style} once and cleans up without hostile fragments`,()=>{
 const {s,e}=fight(seed);tick(s,.01,{attack:true});tick(s,.15);
 expect(e.hp).toBeLessThanOrEqual(0);expect(e.popcornDefeat.style).toBe(style);expect(s.score).toBe(4);expect(s.combo).toBe(1);
 if(style!=='vapor'){expect(e.popcornDefeat.parts).toHaveLength(4);expect(e.popcornDefeat.parts.every(p=>p.frame>=12)).toBe(true);}
 tick(s,2.3);expect(s.enemies).toHaveLength(0);expect(s.looseBones).toHaveLength(0);expect(s.score).toBe(4);
});
test('launch travels away from the shot and lands on the floor with a single dust impact',()=>{
 const {s,e}=fight(2);tick(s,.01,{attack:true});tick(s,.15);const start=e.x;tick(s,.35);expect(e.x).toBeGreaterThan(start+75);expect(e.y).toBeLessThan(480);
 tick(s,.6);expect(e.popcornDefeat.landed).toBe(true);expect(e.y).toBe(480);expect(e.popcornDefeat.landedFx).toBe(true);expect(e.popcornDefeat.parts.every(p=>p.landed)).toBe(true);
});
test('the cannon does not duplicate an already missing arm or release an extra live hand',()=>{
 const {s,e}=fight(1);e.armMissing=true;e.pendingLimb='arm';e.limbHitAge=0;tick(s,.01,{attack:true});tick(s,.15);
 expect(e.popcornDefeat.parts).toHaveLength(3);expect(e.pendingLimb).toBe(null);expect(s.enemies.every(q=>q.type!==24)).toBe(true);
});
test('pumpkin clowns, witches and skeletons can evaporate; ordinary hits retain their own defeat',()=>{
 for(const type of [25,26,22]){const {s,e}=fight(2,type);tick(s,.01,{attack:true});tick(s,1.4);expect(e.popcornDefeat.style).toBe('vapor');expect(s.enemies.some(q=>q.type===24)).toBe(false);}
 const {s,e}=fight();s.basicFire=true;tick(s,.01,{attack:true});tick(s,.4);expect(e.defeated).toBe(true);expect(e.popcornDefeat).toBeUndefined();
});
test('retry clears cannon defeats and the denser street preserves length, plazas and rewards',()=>{
 const s=createAdventure(7);expect(s.level.houses.length).toBeGreaterThanOrEqual(45);expect(new Set(s.level.houses.map(q=>q.frame)).size).toBe(8);
 expect(s.level.width).toBe(createAdventure(6).level.width+1800);expect(s.level.plazas).toHaveLength(3);expect(s.level.checkpoints).toHaveLength(5);expect(s.level.supplies).toHaveLength(7);expect(s.level.stars).toHaveLength(61);
 s.enemies[0].popcornDefeat={age:1};s.enemies[0].hp=0;retryAdventure(s);expect(s.enemies.some(e=>e.popcornDefeat)).toBe(false);
});
