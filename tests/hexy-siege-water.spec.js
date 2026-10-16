import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {createAdventure,stepAdventure,retryAdventure,adventureCarry} from '../src/components/arcade/adventure/engine/adventureModel';
import {quenchWithWater,wetGround} from '../src/components/arcade/adventure/engine/adventureWater';
import {igniteEmberBushes,igniteEmberGround} from '../src/components/arcade/adventure/engine/adventureEmberFire';
import {rollLoot,takeLoot} from '../src/components/arcade/adventure/engine/adventureLoot';
import {clearPowerProjectiles} from '../src/components/arcade/adventure/engine/adventureDefense';
import {damageSupply} from '../src/components/arcade/adventure/world/adventureSupplies';
import {fortSystems,fortTargets,fortPartHit} from '../src/components/arcade/adventure/actors/bosses/adventureEmberFort';
import {groundY,groundAt} from '../src/components/arcade/adventure/world/adventureTerrain';
import {nextAdventureChapter} from '../src/components/arcade/shared/adventureProgression';
import {stepCircusEntrance,outsideCircus} from '../src/components/arcade/adventure/engine/adventureCircusEntrance';
import {shopForLevel} from '../src/components/arcade/adventure/engine/adventureShop';
const tick=(s,n,input={})=>{for(let i=0;i<n;i++)stepAdventure(s,input,1/120);};
const water=(x,y,heavy=false)=>({kind:5,x,y,r:heavy?42:16,heavy,scale:1,life:1});
function place(s,x){s.player.x=x;s.player.y=groundY(s.platforms,x);s.player.ground=s.platforms.indexOf(groundAt(s.platforms,x));s.camera.x=x-300;}
function battle(){const s=createAdventure(5);place(s,s.level.arena.entry+180);Object.assign(s.boss,{engaged:true,phase:'recover',timer:99,vulnerable:true});s.arenaLocked=true;s.enemies=[];return s;}
function strike(s,part,damage=999){while(s.hitStop>0)tick(s,1);const t=fortTargets(s).find(t=>t.part===part);expect(t).toBeTruthy();s.shots.push({x:t.x+t.w/2,y:t.y+t.h/2,vx:0,vy:0,r:7,kind:-1,damage,age:0,life:1,hits:[]});tick(s,1);}

test('water quenches progressively, larger fire takes more, and one wave cannot count the same fire twice',()=>{
 const s=createAdventure(5);s.hostile=[{kind:'ember-torch',element:'fire',x:1500,y:400,r:12,drawSize:40,life:2},{kind:'ember-mortar',element:'fire',x:1700,y:400,r:26,drawSize:100,life:2}];
 const [small,large]=s.hostile;quenchWithWater(s,water(1500,400));expect(small.quenched).toBe(true);
 quenchWithWater(s,water(1700,400));expect(large.life).toBeGreaterThan(0);expect(large.fireStrength).toBeLessThan(1);
 quenchWithWater(s,water(1700,400));expect(large.life).toBeGreaterThan(0);quenchWithWater(s,water(1700,400));expect(large.quenched).toBe(true);
 const pit=s.emberEnvironment.pits[0],wave=water(pit.x+pit.w/2,pit.y-20,true);quenchWithWater(s,wave);quenchWithWater(s,wave);expect(pit.water).toBe(4);expect(pit.quenched).toBeUndefined();
 quenchWithWater(s,water(wave.x,wave.y,true));expect(pit.quenched).toBe(true);expect(s.level.emberPits[0].quenched).toBeUndefined();
});

test('water puts out burning brush and keeps the soaked ground from immediately reigniting',()=>{
 const s=createAdventure(5),bush=s.emberEnvironment.bushes[0];igniteEmberBushes(s,bush.x,bush.y,30);expect(bush.state).toBe('burning');
 for(let i=0;i<3;i++)quenchWithWater(s,water(bush.x,bush.y-30));expect(bush.state).toBe('charred');expect(wetGround(s,bush.x,bush.y)).toBe(true);
 igniteEmberGround(s,bush.x);expect(s.hostile.filter(q=>q.life>0&&Math.abs(q.x-bush.x)<80)).toHaveLength(0);
 const bullet={kind:'note',element:'sound',x:bush.x,y:bush.y-30,r:12,life:3};s.hostile=[bullet];const wave=water(bullet.x,bullet.y,true);clearPowerProjectiles(s,[wave]);quenchWithWater(s,wave);expect(bullet.life).toBe(0);
});

test('forest drops exclude Dragon Grape while an explicitly equipped shop flavor survives',()=>{
 const s=createAdventure(5);s.lootSeed=123;s.weapon=0;for(let i=0;i<1500;i++){const item=rollLoot(s,0);if(item.type==='drink')expect(item.kind).not.toBe(0);}
 expect(s.outposts.every(q=>q.drink!==0)).toBe(true);expect(s.supplies.every(q=>q.kind!==0)).toBe(true);
 const shop=createAdventure(5,false,{mods:['starter-0']});expect(shop.weapon).toBe(0);
 const aqua=createAdventure(5,false,{mods:['starter-5']});expect(aqua.weapon).toBe(5);expect(aqua.ammo).toBeGreaterThan(84);tick(aqua,1,{attack:true});expect(aqua.shots[0].kind).toBe(5);
 const carry=createAdventure(3,false,adventureCarry(aqua));expect(carry.weapon).toBe(5);expect(carry.ammo).toBe(aqua.ammo);
});

test('every hollow has a damage-free jump with real nearby enemies, including after scenic trees have fallen',()=>{
 for(const pit of createAdventure(5).level.emberPits){
  const s=createAdventure(5);place(s,pit.x-65);for(const t of s.emberEnvironment.trees){t.phase='fallen';t.age=5;}
  const hp=s.hearts;for(let i=0;i<360&&s.player.x<pit.x+pit.w+90;i++)stepAdventure(s,{right:true,jump:i<46||i>=49&&i<120},1/120);
  expect(s.player.x).toBeGreaterThan(pit.x+pit.w+40);tick(s,90);expect(s.hearts).toBe(hp);expect(s.player.ground).not.toBeNull();expect(s.platforms.some(q=>q.emberFallen)).toBe(false);
 }
});

test('outer wall and core door block both progress and premature core damage; cannons remain optional',()=>{
 const s=battle(),p=fortSystems(s);expect(fortTargets(s).some(t=>t.part==='core')).toBe(false);expect(fortPartHit(s,'core',999)).toBe(0);expect(fortPartHit(s,'gate',999)).toBe(0);
 place(s,s.boss.x);tick(s,1);expect(s.player.x).toBeLessThan(s.boss.x-600);
 strike(s,'wall');tick(s,20);expect(p.wall.hp).toBe(0);expect(fortTargets(s).some(t=>t.part==='gate')).toBe(true);
 place(s,s.boss.x+100);tick(s,1);expect(s.player.x).toBeLessThan(s.boss.x);expect(fortPartHit(s,'core',999)).toBe(0);
 strike(s,'gate');tick(s,310);expect(s.boss.coreOpened).toBe(true);expect(p.upper.hp).toBe(p.upper.maxHp);expect(p.lower.hp).toBe(p.lower.maxHp);
 s.boss.vulnerable=true;strike(s,'core');tick(s,100);expect(s.boss.defeat.ready).toBe(false);expect(s.clear).toBeUndefined();
 tick(s,460);expect(s.boss.defeat.ready).toBe(true);expect(s.clear).toBeTruthy();expect(s.level.fortDoor).toBeUndefined();
 tick(s,2000);expect(s.won).toBe(true);expect(nextAdventureChapter(s.index)).toBe(3);
});

test('camp patrols remain by their tents and leave the healing approach clear',()=>{
 for(const x of [-4750,-4080,-3370,-2680,-2130,-1450]){
  const s=createAdventure(3);place(s,x);s.player.hurt=999;
  tick(s,900);for(const e of s.enemies){expect(Math.abs(e.x-e.home)).toBeLessThan(170);expect(e.x).toBeLessThan(-1000);}
 }
});

test('the short camp previews a full heal and side entry preserves the existing Harlequin arena and retry checkpoint',()=>{
 const s=createAdventure(3);expect(outsideCircus(s)).toBe(true);expect(s.level.circusCamp).toBe(true);expect(s.campTents.length).toBeGreaterThan(3);expect(s.campTents.every(q=>q.crew.every(type=>type<10||type===14))).toBe(true);expect(shopForLevel(s.level)).toBeNull();
 expect(s.cages).toHaveLength(0);expect(s.stars.filter(q=>q.value===10)).toHaveLength(5);expect(s.stars.every(q=>q.x<0)).toBe(true);
 const box=s.supplies.find(q=>q.preview==='fullheal');expect(box.x).toBeLessThan(s.level.circusEntrance.trigger);damageSupply(s,box,99);const heart=s.pickups.find(q=>q.type==='fullheal');expect(heart).toBeTruthy();s.hearts=1;takeLoot(s,heart);expect(s.hearts).toBe(s.maxHearts);
 place(s,s.level.circusEntrance.trigger+3);for(let i=0;i<250;i++)stepCircusEntrance(s,1/120);expect(outsideCircus(s)).toBe(false);expect(s.player.x).toBe(660);expect(s.boss.phase).toBe('sleep');expect(s.checkpointAt).toEqual([660,480]);
 s.boss.hp=1;retryAdventure(s);expect(s.player.x).toBe(660);expect(s.boss.hp).toBe(s.boss.maxHp);tick(s,450,{right:true});expect(s.boss.engaged).toBe(true);expect(s.boss.hp).toBe(720);
});

test('render the water shot, safe crossing, siege phases and side entrance with actual artwork',async({page})=>{
 test.setTimeout(120000);const dir='tests/artifacts/siege';fs.mkdirSync(dir,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
 await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/';const w=window.siege=Object.assign({},...await Promise.all(['engine/adventureModel.js','engine/adventureEmberFire.js','actors/bosses/adventureEmberFort.js','render/adventureCanvas.js','render/adventureCamera.js','world/adventureTerrain.js'].map(p=>import(root+p))));
  w.art=await w.loadAdventureArt();w.c=document.createElement('canvas');w.c.id='siege-review';w.c.style='position:fixed;inset:0;z-index:99999;width:1440px;height:810px';document.body.append(w.c);
  w.scene=(index,x)=>{const s=w.s=w.createAdventure(index);Object.assign(s.player,{x,y:w.groundY(s.platforms,x),ground:s.platforms.indexOf(w.groundAt(s.platforms,x))});s.noticeTime=0;s.time=12;s.fxTime=12;if(index===5&&x>30000){s.arenaLocked=true;Object.assign(s.boss,{engaged:true,phase:'recover',timer:50,vulnerable:true});}for(let i=0;i<800;i++)w.followAdventureCamera(s,1/120);};
  w.paint=()=>w.renderAdventure(w.c,w.s,w.art);
 });
 const shot=async name=>{await page.evaluate(()=>window.siege.paint());await page.locator('#siege-review').screenshot({path:dir+'/'+name+'.jpg'});};
 await page.evaluate(()=>{const w=window.siege;w.scene(5,850);w.s.weapon=5;for(let i=0;i<24;i++)w.stepAdventure(w.s,{attack:true},1/120);});await shot('01-water');
 await page.evaluate(()=>{const w=window.siege;w.scene(5,27435);for(const q of w.s.emberEnvironment.trees){q.phase='fallen';q.age=5;}});await shot('02-crossing');
 await page.evaluate(()=>window.siege.scene(5,30700));await shot('03-wall');
 await page.evaluate(()=>{const w=window.siege;w.fortSystems(w.s).wall.hp=0;w.s.boss.wallBreakAge=2;w.s.player.x=31780;for(let i=0;i<500;i++)w.followAdventureCamera(w.s,1/120);});await shot('04-gate');
 await page.evaluate(()=>{const w=window.siege;w.fortSystems(w.s).gate.hp=0;w.s.boss.coreOpened=true;});await shot('05-core');
 for(let i=0;i<4;i++){await page.evaluate(i=>{const s=window.siege.s;s.boss.hp=0;s.boss.defeat={age:i*1.05+.1,ready:i===3};},i);await shot('06-collapse-'+i);}
 for(const [name,x]of [['07-camp',-5150],['08-camp-mid',-3000],['09-heart',-600],['10-door',-260]]){await page.evaluate(x=>window.siege.scene(3,x),x);await shot(name);}
 await page.evaluate(()=>{const w=window.siege;w.scene(3,-232);for(let i=0;i<255;i++)w.stepAdventure(w.s,{},1/120);});await shot('11-inside');expect(errors).toEqual([]);
});
