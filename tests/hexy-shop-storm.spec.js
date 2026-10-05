import {test,expect} from '@playwright/test';
import {createAdventure,stepAdventure,adventureCarry} from '../src/components/arcade/adventureModel';
import {takeLoot,rollLoot} from '../src/components/arcade/adventureLoot';
import {equipDrink,DRINK_SHOTS} from '../src/components/arcade/adventureAmmo';
import {modShotScale,modFireRate,modPrice,MODS,updateMods} from '../src/components/arcade/adventureMods';
import {sanitizeSave} from '../src/components/arcade/arcadeStore';
import {beginShopTransition,stepShopTransition} from '../src/components/arcade/adventureShop';
import {hexyPose} from '../src/components/arcade/hexyAnimation';
import {prepareBombardment,stepBombardment} from '../src/components/arcade/adventureBombardment';
import {updateBoss,enemyShot} from '../src/components/arcade/adventureEnemies';
const tick=(s,n=1,input={})=>{for(let i=0;i<n;i++)stepAdventure(s,input,1/120);};
const clean=(carry={})=>{const s=createAdventure(0,false,carry);for(const key of ['enemies','cages','pickups','supplies','outposts','stars','hazards'])s[key]=[];return s;};

test('legacy ownership starts at level one; corrupt levels never escape the three tiers',()=>{
 const save=sanitizeSave({version:1,stars:220,modsOwned:['bright-spark','quick-cast','full-bubble'],modLevels:{'bright-spark':55,'quick-cast':-8,'full-bubble':'invalid','unknown':3}});
 expect(save.stars).toBe(220);expect(save.modLevels).toEqual({'bright-spark':3,'quick-cast':1,'full-bubble':1});
 expect(sanitizeSave({version:1,modsOwned:['bright-spark']}).modLevels).toEqual({'bright-spark':1});
 for(const mod of MODS){expect([0,1,2].map(l=>modPrice(mod,l))).toEqual([mod.price,Math.ceil(mod.price*1.5),mod.price*2]);expect(modPrice(mod,3)).toBeNull();}
});
test('all enlargement tiers affect normal and strong projectiles and persist between chapters',()=>{
 for(let level=1;level<=3;level++){
  const s=clean({mods:['bright-spark','grand-flourish','quick-cast'],modLevels:{'bright-spark':level,'grand-flourish':level,'quick-cast':level}});
  tick(s,1,{attack:true});expect(s.shots[0].scale).toBeCloseTo(1.2+level*.1);expect(modFireRate(s)).toBeCloseTo(1.1+level*.1);
  tick(s,1,{special:true});expect(s.shots.find(q=>q.heavy).scale).toBeCloseTo(1.2+level*.1);
  const next=createAdventure(1,false,adventureCarry(s));expect(modShotScale(next)).toBeCloseTo(1.2+level*.1);
 }
 const starter=clean({mods:['starter-3'],modLevels:{'starter-3':3}});expect(starter.ammoCapacity).toBe(DRINK_SHOTS[3]*3);
});
test('Original preserves even the last flavored shot for normal and strong casts, then consumption returns',()=>{
 const s=clean();equipDrink(s,1,1);takeLoot(s,{type:'original'});tick(s,90);expect(s.overdrive).toBeGreaterThan(7);
 tick(s,1,{special:true});expect(s.shots.some(q=>q.heavy&&q.kind===1)).toBe(true);expect(s.ammo).toBe(1);expect(s.magic).toBeLessThan(80);
 tick(s,80,{attack:true});expect(s.ammo).toBe(1);expect(s.weapon).toBe(1);
 s.overdrive=.01;s.player.specialCast=0;tick(s,3);s.shotWait=0;tick(s,1,{attack:true});expect(s.weapon).toBe(-1);expect(s.ammo).toBe(0);
});
test('Original grants 15 percent faster movement and a bounded world-space trail that fades away',()=>{
 const base=clean(),boost=clean();boost.overdrive=8;tick(base,120,{right:true});tick(boost,120,{right:true});
 expect(boost.player.vx/base.player.vx).toBeCloseTo(1.15);expect(boost.rainbowTrail.length).toBeGreaterThan(10);expect(boost.rainbowTrail.length).toBeLessThan(30);
 expect(boost.rainbowTrail[0].x).toBeLessThan(boost.player.x-80);boost.overdrive=0;tick(boost,90);expect(boost.rainbowTrail).toEqual([]);
});
test('shield drops include one, two and three; Gala always refills all three without rescue shields',()=>{
 const s=clean();for(const charges of [1,2,3]){s.shield=0;takeLoot(s,{type:'shield',charges});expect(s.shield).toBe(charges);}
 s.shield=2;takeLoot(s,{type:'shield',charges:2});expect(s.shield).toBe(3);
 const found=new Set();s.lootSeed=317;s.weapon=1;for(let i=0;i<2000;i++){const q=rollLoot(s);if(q.type==='shield')found.add(q.charges);}expect([...found].sort()).toEqual([1,2,3]);
 updateMods(s,['full-bubble']);for(const charges of [1,2,3]){s.shield=0;takeLoot(s,{type:'shield',charges});expect(s.shield).toBe(3);}
 for(let i=0;i<1000;i++){const q=rollLoot(s);if(q.type==='shield')expect(q.charges).toBe(3);}
});
test('entry turns away and fades to black; a dedicated exit steps forward and faces the path',()=>{
 const s=clean();s.player.x=305;beginShopTransition(s);s.shopTransition.ready=true;
 const first=s.player.x;stepShopTransition(s,.1);expect(s.player.x).toBeGreaterThan(first);expect(s.shopTransition.alpha).toBe(0);
 stepShopTransition(s,.65);expect(hexyPose(s).sheet).toBe('shop-enter');expect(s.shopTransition.alpha).toBe(0);
 expect(stepShopTransition(s,2)).toBe(true);expect(s.shopTransition.alpha).toBe(1);expect(s.player.x).toBe(370);
 beginShopTransition(s,true);expect(s.shopTransition.alpha).toBe(1);stepShopTransition(s,.25);expect(s.shopTransition.alpha).toBeGreaterThan(0);expect(hexyPose(s)).toEqual({sheet:'shop-exit',frame:0});expect(stepShopTransition(s,1)).toBe(false);expect(stepShopTransition(s,.5)).toBe(true);expect(s.shopTransition.alpha).toBe(0);expect(s.player.x).toBe(406);expect(hexyPose(s)).toEqual({sheet:'shop-exit',frame:7});
});
test('balloon enters its bombardment only after transformation, rises and alternates directions',()=>{
 const s=clean(),b=s.boss,a=s.level.arena;s.player.x=a.left+450;s.camera.x=a.left;b.phase='recover';b.timer=0;b.hp=b.maxHp;
 const helpers={say:()=>{},particles:()=>{},body:()=>({x:0,y:0,w:0,h:0})};s.damage=()=>{};updateBoss(s,.01,helpers);expect(b.move).not.toBe('bombing-run');
 b.hp=b.maxHp*.5;updateBoss(s,.01,helpers);expect(b.phase).toBe('transform');updateBoss(s,1.7,helpers);updateBoss(s,1.2,helpers);expect(b.move).toBe('bombing-run');
 const dirs=[];
 for(let pass=0;pass<2;pass++){
  if(pass){b.phase='warn';prepareBombardment(s);}dirs.push(b.bombRun.dir);const positions=[];s.hostile=[];
  for(let i=0;i<760;i++){stepBombardment(s,1/120,enemyShot);positions.push(b.y);}
  expect(Math.min(...positions)).toBeLessThan(a.y-230);expect(s.hostile.length).toBeGreaterThan(12);expect(s.hostile.length).toBeLessThan(22);
  expect(s.hostile.every(q=>q.carpet&&q.vx===0&&Math.abs(q.x-b.bombRun.gap)>=b.bombRun.gapWidth/2)).toBe(true);
  expect(Math.sign(s.hostile.at(-1).x-s.hostile[0].x)).toBe(b.bombRun.dir);expect(b.phase).toBe('recover');
 }
 expect(dirs).toEqual([-1,1]);
});
test('the bombing gap remains survivable through landing explosions without ground waves',()=>{
 const s=clean(),a=s.level.arena;s.player.x=a.left+450;s.player.y=a.y;s.camera.x=a.left;Object.assign(s.boss,{phase:'warn',move:'bombing-run',transformed:true,hp:50,engaged:true});s.arenaLocked=true;prepareBombardment(s);
 s.player.x=s.boss.bombRun.gap;const hearts=s.hearts;tick(s,740);expect(s.hearts).toBe(hearts);expect(s.hostile.some(q=>q.kind==='wave')).toBe(false);
});

test('upgrade transactions charge once per expected level across tabs and survive reload',async({page,context})=>{
 await page.goto('/arcade');const other=await context.newPage();await other.goto('/arcade');
 await page.evaluate(async()=>{const m=await import('/src/components/arcade/arcadeStore.js');localStorage.setItem(m.SAVE_KEY,JSON.stringify(m.sanitizeSave({version:1,stars:500,modsOwned:['bright-spark']})));});
 const calls=await Promise.all([page,other].map(p=>p.evaluate(async()=>{const m=await import('/src/components/arcade/arcadeStore.js');return m.upgradeAdventureMod('bright-spark',1);})));expect(calls.sort()).toEqual([false,true]);
 const result=await page.evaluate(async()=>{const m=await import('/src/components/arcade/arcadeStore.js');const next=await m.upgradeAdventureMod('bright-spark',2),max=await m.upgradeAdventureMod('bright-spark',3);return{next,max,save:JSON.parse(localStorage.getItem(m.SAVE_KEY))};});
 expect(result.next).toBe(true);expect(result.max).toBe(false);expect(result.save.stars).toBe(377);expect(result.save.modLevels['bright-spark']).toBe(3);await other.close();
});
