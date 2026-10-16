import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {createAdventure,stepAdventure,retryAdventure,playerBody} from '../src/components/arcade/adventure/engine/adventureModel';
import {makeEnemy,updateEnemies,enemyShot} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {stepVillagers,stepVillageEnemy,resolveVillageProjectile,villageSegmentHit} from '../src/components/arcade/adventure/engine/adventureVillage';
import {CHAPTER_ORDER,nextAdventureChapter} from '../src/components/arcade/shared/adventureProgression';
import {sanitizeSave} from '../src/components/arcade/shared/arcadeStore';
import {openAdventureMenu} from './arcade-input.helpers';
import {villageVillagerProfile,villageVillagerBody} from '../src/components/arcade/adventure/actors/villageVillagers';
import {VILLAGE_PLANES,villagePlanePosition} from '../src/components/arcade/adventure/render/villageCanvas';
import {groundY} from '../src/components/arcade/adventure/world/adventureTerrain';
const folder='tests/artifacts/arcade/village-5-2/';
const tick=(s,seconds,input={})=>{for(let i=0;i<seconds*120;i++)stepAdventure(s,input,1/120);};
test('2-2 follows the cemetery and old saves retain their unlocked final chapter',()=>{
 expect(CHAPTER_ORDER).toEqual([0,1,2,5,3,6,7,8,9,10,4]);expect(nextAdventureChapter(6)).toBe(7);expect(nextAdventureChapter(7)).toBe(8);
 const old=sanitizeSave({version:1,campaign:3,economy:2,stars:87,adventureUnlocked:6,adventureCleared:[6,4],run:{id:'village-migration',practice:false,chapter:4,earned:12,banked:3}});
 expect(old.campaign).toBe(5);expect(old.adventureUnlocked).toBe(10);expect(old.stars).toBe(87);expect(old.run.chapter).toBe(4);expect(old.adventureCleared).toEqual([6,4]);
 expect(sanitizeSave(old).adventureUnlocked).toBe(10);
 const s=createAdventure(7);expect(s.level.chapter).toBe('2-2');expect(s.level.spookyIdle).toBe(true);expect(s.enemies.filter(e=>e.type===19).every(e=>e.ghostForm==='sheet')).toBe(true);
});
test('the street simulates, civilians flee and zombies retain their clothed remains',()=>{
 const s=createAdventure(7);s.player.hurt=999;const start=s.villagers[0].x;tick(s,2,{right:true});
 expect(s.villagers[0].x).toBeLessThan(start);expect(s.player.x).toBeGreaterThan(300);expect(Number.isFinite(s.camera.y)).toBe(true);
 const z=s.enemies.find(e=>e.type===18);z.nightmareVariant=0;z.armMissing=false;z.hp=4;z.active=true;
 tick(s,1);expect(z.armLost).toBe(true);expect(s.enemies.some(e=>e.type===24)||s.looseBones.length>0).toBe(true);
 expect(s.boss.phase).toBe('sleep');expect(s.clear).toBeFalsy();
});
test('witches telegraph, commit their aim and can be interrupted before casting',()=>{
 const s=createAdventure(7),e=makeEnemy(520,480,26);s.villagers=[];s.player.x=180;e.active=true;e.timer=0;
 stepVillageEnemy(s,e,.01,enemyShot);expect(e.phase).toBe('windup');const aim={...e.candyAim};s.player.x=400;
 stepVillageEnemy(s,e,.6,enemyShot);expect(e.candyAim).toEqual(aim);expect(s.hostile).toHaveLength(0);
 e.flash=.2;stepVillageEnemy(s,e,.01,enemyShot);expect(e.phase).toBe('recover');expect(s.hostile).toHaveLength(0);
 e.flash=0;e.phase='patrol';e.timer=0;stepVillageEnemy(s,e,.01,enemyShot);stepVillageEnemy(s,e,1.11,enemyShot);expect(s.hostile[0].kind).toBe('candy-ray');
});
test('only a real ray collision transforms a villager, once; Hexy can stand in its path',()=>{
 const s=createAdventure(7),n=s.villagers[0];Object.assign(n,{state:'flee',x:250,y:480});s.villagers=[n];
 const ray=(y=430)=>({village:true,kind:'candy-ray',life:1,r:9,previousX:400,previousY:y,x:200,y});
 expect(resolveVillageProjectile(s,ray(300),{x:0,y:0,w:1,h:1})).toBe(false);expect(n.state).toBe('flee');
 expect(resolveVillageProjectile(s,ray(),{x:330,y:390,w:30,h:90})).toBe(false);expect(n.state).toBe('flee');
 expect(resolveVillageProjectile(s,ray(),{x:0,y:0,w:1,h:1})).toBe(true);expect(n.state).toBe('turning');
 for(let i=0;i<150;i++)stepVillagers(s,1/120);expect(n.state).toBe('candy');expect(s.village.turned).toBe(1);
 resolveVillageProjectile(s,ray(),{x:0,y:0,w:1,h:1});expect(s.village.turned).toBe(1);
 expect(villageSegmentHit(0,0,100,0,{x:40,y:-10,w:10,h:20})).toBe(.4);
});
test('pumpkin heads cast a short haunted flame fan and have ordinary damageable bodies',()=>{
 const s=createAdventure(7),e=makeEnemy(540,480,25);e.active=true;e.timer=0;s.enemies=[e];s.player.x=180;s.damage=()=>{};
 updateEnemies(s,.01,playerBody,()=>{});expect(e.phase).toBe('windup');updateEnemies(s,.81,playerBody,()=>{});
 expect(s.hostile.filter(q=>q.kind==='lantern-soul')).toHaveLength(3);expect(s.hostile.every(q=>q.life<=2&&q.element==='magic')).toBe(true);
});
test('actual basic shots defeat both new enemies and interrupt a witch windup',()=>{
 for(const type of [25,26]){
  const s=createAdventure(7);s.player.hurt=999;s.villagers=[];s.enemies=[Object.assign(makeEnemy(380,480,type),{active:true,phase:'windup',phaseAge:0,timer:1})];
  const e=s.enemies[0];tick(s,4,{attack:true});expect(e.defeated).toBe(true);expect(e.hp).toBe(0);expect(s.boss.hp).toBe(1);
 }
});
test('checkpoint retries preserve resolved townspeople and completion opens after clearing the square',()=>{
 const s=createAdventure(7);s.villagers[0].state='candy';s.villagers[1].state='safe';s.checkpointAt=s.level.checkpoints[1];retryAdventure(s);
 expect(s.villagers[0].state).toBe('candy');expect(s.villagers[1].state).toBe('safe');expect(s.village.turned).toBe(1);expect(s.player.x).toBe(s.level.checkpoints[1][0]);
 s.player.x=s.level.arena.entry;s.player.y=480;s.player.hurt=999;tick(s,.1);expect(s.clear).toBeFalsy();
 s.enemies=[];tick(s,10);expect(s.won).toBe(true);expect(s.done).toBe(true);
});
test('the extended route matches the cemetery, preserves receipts and opens into three plazas',()=>{
 const s=createAdventure(7),previous=createAdventure(6);
 expect(s.level.width).toBe(previous.level.width+1800);expect(s.level.width).toBe(23240);
 expect(s.level.exit[0]).toBeGreaterThan(21000);expect(s.level.plazas).toHaveLength(3);
 expect(s.level.houses.every(q=>q.x>=s.level.villageStart-30)).toBe(true);
 for(let x=0;x<s.level.width;x+=90)expect(Number.isFinite(groundY(s.level.route,x,NaN))).toBe(true);
 expect(s.level.starIds.slice(0,49)).toContain('7:star:350:436');
 expect(s.level.starIds.slice(0,49)).toContain('7:star:2030:408');
 const collected=createAdventure(7,false,{collectedStars:['7:star:2030:408']});
 expect(collected.stars.find(q=>q.id==='7:star:2030:408').taken).toBe(true);
 expect(new Set(s.level.starIds).size).toBe(s.level.stars.length);
 expect(s.stars.find(q=>q.id==='7:star:2030:408').x).toBe(9045);
});
test('eight distinct villagers include children fleeing left with adults in the opening',()=>{
 const s=createAdventure(7);s.enemies=[];
 expect(new Set(s.villagers.map(q=>q.style)).size).toBe(8);
 const group=s.villagers.filter(q=>q.group===0),before=group.map(q=>q.x);
 expect(group.some(q=>villageVillagerProfile(q.style).child)).toBe(true);expect(group.some(q=>!villageVillagerProfile(q.style).child)).toBe(true);
 tick(s,1);group.forEach((q,i)=>{expect(['flee','warning']).toContain(q.state);expect(q.x).toBeLessThan(before[i]);expect(q.dir).toBe(-1);});
 const distant=s.villagers.find(q=>q.group===5);Object.assign(distant,{state:'flee',x:1000});stepVillagers(s,1);expect(distant.state).toBe('flee');
 distant.x=-179;stepVillagers(s,1);expect(distant.state).toBe('safe');
});
test('child-sized beam collision and committed witch aim follow the smaller body',()=>{
 const s=createAdventure(7),child=s.villagers.find(q=>q.style===2);Object.assign(child,{x:250,y:480,state:'flee'});s.villagers=[child];
 expect(villageVillagerBody(child).h).toBeLessThan(villageVillagerBody({...child,style:0}).h);
 const ray=y=>({village:true,kind:'candy-ray',life:1,r:2,previousX:300,previousY:y,x:200,y});
 expect(resolveVillageProjectile(s,ray(397),{x:0,y:0,w:1,h:1})).toBe(false);
 const e=makeEnemy(500,480,26);e.active=true;e.timer=0;stepVillageEnemy(s,e,.01,enemyShot);expect(e.candyAim.y).toBeGreaterThan(440);
 expect(resolveVillageProjectile(s,ray(447),{x:0,y:0,w:1,h:1})).toBe(true);
});
test('parallax planes keep their vertical roots across slopes and move throughout the full route',()=>{
 for(const p of VILLAGE_PLANES){
  const a=villagePlanePosition({x:9000,y:4},12000,p),b=villagePlanePosition({x:19000,y:78},12000,p),back=villagePlanePosition({x:9000,y:78},12000,p);
  expect(a.y).toBe(b.y);expect(a).toEqual(back);expect(a.x-b.x).toBeCloseTo(10000*p.depth);
 }
});
test('painted fire hurts on contact, can be jumped, and leaves a fire impact on the floor',()=>{
 const make=jump=>{const s=createAdventure(7);s.enemies=[];s.villagers=[];s.player.x=900;s.player.hurt=0;enemyShot(s,1050,445,Math.PI,245,'lantern-ember',{r:10,life:1.5,village:true,element:'fire'});tick(s,.75,jump?{jump:true}:{});return s;};
 const hit=make(false),jumped=make(true);expect(hit.hearts).toBe(hit.maxHearts-1);expect(jumped.hearts).toBe(jumped.maxHearts);
 const s=createAdventure(7),shot={kind:'lantern-ember',village:true,life:1,x:900,y:500};expect(resolveVillageProjectile(s,shot,playerBody(s.player))).toBe(true);expect(shot.life).toBe(0);expect(s.villageFire[0].kind).toBe('impact');expect(s.particles).toHaveLength(0);
});
test('the real chapter selector starts the village and keeps simulating',async({page})=>{
 test.setTimeout(90000);fs.mkdirSync(folder,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/arcade');await openAdventureMenu(page);const root=page.locator('[data-hexy-adventure]');await expect(root).toHaveAttribute('data-phase','ready',{timeout:30000});
 await page.getByRole('button',{name:/Elegir capítulo/}).click();await expect(page.locator('[data-level-choice="7"]')).toContainText('2-2');await page.locator('[data-level-choice="7"]').click();await page.locator('[data-practice]').click();await page.locator('[data-chapter-intro]').click();await expect(root).toHaveAttribute('data-phase','playing');
 await expect.poll(async()=>Number(await root.locator('canvas').first().getAttribute('data-sim-frame'))).toBeGreaterThan(180);
 await root.screenshot({path:folder+'real-start.png'});await page.keyboard.down('ArrowRight');await page.keyboard.down('z');await page.waitForTimeout(2800);await page.keyboard.up('ArrowRight');await page.keyboard.up('z');await expect(root).toHaveAttribute('data-phase','playing');await root.screenshot({path:folder+'real-play.png'});expect(errors).toEqual([]);
});
