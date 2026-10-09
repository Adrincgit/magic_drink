import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import sharp from 'sharp';
import {followAdventureCamera} from '../src/components/arcade/adventure/render/adventureCamera';
import {openAdventureMenu} from './arcade-input.helpers';
import {createAdventure,stepAdventure,retryAdventure,playerBody} from '../src/components/arcade/adventure/engine/adventureModel';
import {groundY} from '../src/components/arcade/adventure/world/adventureTerrain';
import {bargeRig,bargeTargets} from '../src/components/arcade/adventure/actors/bosses/adventureBarge';
import {updateBoss,updateEnemies,makeEnemy} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
const artifacts='tests/artifacts/arcade/harbor-barge/';
function quiet(){const s=createAdventure(2);for(const key of ['enemies','outposts','supplies','hazards','stars','cages'])s[key]=[];return s;}
function battle(move='drumroll',stage=1){const s=quiet(),a=s.level.arena;Object.assign(s.player,{x:a.left+400,y:a.y,ground:s.platforms.findIndex(q=>q.x===a.left)});Object.assign(s.boss,{phase:'warn',timer:1.05,move,engaged:true,vulnerable:true,transformed:stage===2,armorBroken:stage===2,hp:stage===2?140:320});s.arenaLocked=true;s.damage=()=>{};return s;}
const helpers={say:()=>{},particles:()=>{},body:playerBody};
const tick=(s,n,input={})=>{for(let i=0;i<n;i++)stepAdventure(s,input,1/120);};

test('waterfront is continuous, has three rescues and a deliberate four-enemy cast',()=>{
 const s=quiet(),level=s.level;expect(level.harborRoute).toBe(true);expect(level.cages).toHaveLength(3);expect(new Set(level.enemies.map(e=>e[2]))).toEqual(new Set([0,3,7,8]));
 const earth=s.platforms.filter(q=>q.kind==='earth');let end=0;for(const q of earth){expect(q.x).toBe(end);end=q.x+q.w;}expect(end).toBe(level.width);expect(earth.filter(q=>q.bridge).map(q=>q.w)).toEqual([1250,2020,1900,1530]);
 for(let i=0;i<7000&&s.player.x<level.arena.entry;i++){stepAdventure(s,{right:true},1/120);expect(s.player.ground).not.toBeNull();expect(s.hearts).toBe(s.maxHearts);}
 expect(s.player.x).toBeGreaterThan(level.arena.entry);expect(s.boss.phase).toBe('sleep');expect(s.checkpointAt[0]).toBe(12880);
});

test('barge arrives over time and can be hit during each attack; lower hull is armor',()=>{
 const arrival=quiet();Object.assign(arrival.player,{x:arrival.level.arena.entry+150,y:520,ground:13});tick(arrival,1);expect(arrival.boss.phase).toBe('intro');const x=arrival.boss.x;tick(arrival,240);expect(arrival.boss.phase).toBe('intro');expect(arrival.boss.x).toBeLessThan(x);tick(arrival,390);expect(arrival.boss.engaged).toBe(true);expect(arrival.boss.phase).not.toBe('intro');
 for(const move of ['drumroll','mortar','tidal']){
  const s=battle(move);s.boss.timer=0;updateBoss(s,1/120,helpers);expect(s.boss.phase).toBe('attack');expect(s.boss.vulnerable).toBe(true);
  // Fly a real shot from outside the hull toward the visible drum.
  const m=bargeRig(s);s.shots.push({x:s.boss.x-470,y:m.drum.y,vx:510,vy:0,r:10,life:1.5,age:0,kind:-1,damage:2,hits:[]});tick(s,80);expect(s.boss.hp).toBe(318);
 }
 const s=battle();s.boss.timer=10;s.shots.push({x:s.boss.x-450,y:s.boss.y-27,vx:510,vy:0,r:10,life:1.5,age:0,kind:-1,damage:2,hits:[]});tick(s,80);expect(s.boss.hp).toBe(320);expect(s.boss.flash).toBe(0);
});

test('drumroll and tidal attacks hit standing Hexy; mortar breaks into short waves',()=>{
 for(const move of ['drumroll','tidal']){const s=battle(move);s.boss.timer=.01;tick(s,550);expect(s.hearts).toBeLessThan(s.maxHearts);}
 const s=battle('mortar');s.boss.timer=.01;let shells=false,waves=false;for(let i=0;i<400;i++){stepAdventure(s,{},1/120);shells ||= s.hostile.some(q=>q.kind==='barge-shell');waves ||=s.hostile.some(q=>q.kind==='barge-wave');}expect(shells&&waves).toBe(true);
});

test('second phase breaks the drum armor, surges across the wharf and destroys into pieces',()=>{
 const s=battle();s.boss.hp=150;tick(s,1);expect(s.boss.phase).toBe('transform');tick(s,130);expect(s.boss.armorBroken).toBe(true);expect(s.organDebris.length).toBeGreaterThan(0);tick(s,150);expect(s.boss.vulnerable).toBe(true);
 Object.assign(s.boss,{phase:'warn',move:'surge',timer:1.65});const x=s.boss.x;tick(s,120);expect(s.boss.x).toBeCloseTo(x);expect(s.boss.wheelAngle).toBeGreaterThan(20);tick(s,330);expect(s.boss.x).toBeLessThan(x-600);
 s.boss.hp=0;s.boss.phase='defeated';tick(s,80);expect(s.boss.shattered).toBe(true);expect(s.organDebris.length).toBeGreaterThan(12);expect(s.clear).toBeFalsy();tick(s,350);expect(s.clear).toBeTruthy();
 retryAdventure(s);expect(s.boss.hp).toBe(320);expect(s.organDebris).toEqual([]);expect(s.boss.shattered).toBeUndefined();
});

test('diver raises its hoop before throwing from its hand',()=>{
 const s=quiet(),e=makeEnemy(3180,465,8);s.enemies=[e];s.player.x=2950;s.player.y=465;e.timer=.6;s.damage=()=>{};updateEnemies(s,.01,playerBody,()=>{});expect(e.phase).toBe('windup');
 for(let i=0;i<75;i++)updateEnemies(s,1/120,playerBody,()=>{});const q=s.hostile.find(q=>q.kind==='diver-hoop');expect(q).toBeTruthy();expect(q.x).toBeLessThan(e.x);expect(Math.hypot(q.vx,q.vy)).toBe(285);expect(e.action).toBeGreaterThan(0);
});

test('optional dock routes can be climbed and all three bunny cages can be rescued',()=>{
 const s=quiet();s.cages=createAdventure(2).cages;
 for(const group of [s.platforms.filter(q=>q.kind==='dock'&&q.x<7000),s.platforms.filter(q=>q.kind==='dock'&&q.x>9000)]){
  const first=group[0];Object.assign(s.player,{x:first.x-100,y:groundY(s.platforms,first.x),ground:s.platforms.findIndex(q=>q.kind==='earth'&&first.x>=q.x&&first.x<q.x+q.w),vx:0,vy:0});
  for(const dock of group){
   s.lastInput={};s.player.jumps=0;let landed=false;
   for(let i=0;i<360;i++){stepAdventure(s,{right:s.player.x<dock.x+70,jump:i<100&&i!==27},1/120);if(s.player.ground!==null&&s.platforms[s.player.ground]===dock){landed=true;break;}}
   expect(landed,'dock '+dock.x).toBe(true);
  }
 }
 for(const cage of s.cages){Object.assign(s.player,{x:cage.x-105,y:cage.y,ground:s.platforms.findIndex(q=>cage.x>=q.x&&cage.x<q.x+q.w&&q.y===cage.y),vx:0,vy:0,dir:1});if(s.player.ground<0)s.player.ground=s.platforms.findIndex(q=>q.kind==='earth'&&cage.x>=q.x&&cage.x<q.x+q.w);
  tick(s,80,{attack:true});expect(cage.open).toBe(true);tick(s,38,{right:true});expect(cage.rescued).toBe(true);
 }expect(s.rescued).toBe(3);
});

test('arena camera contains the retreat corner and boss, and water never gains a camera offset',()=>{
 const s=battle();s.player.x=s.level.arena.left+24;for(let i=0;i<800;i++)followAdventureCamera(s,1/120);
 const width=960/s.camera.zoom;expect(s.player.x-s.camera.x).toBeGreaterThan(15);expect(s.boss.x+335-s.camera.x).toBeLessThan(width);expect(s.camera.x+width).toBeLessThanOrEqual(s.level.width);
 const backdrop=s.camera.backdropY;Object.assign(s.boss,{x:s.level.arena.left+620,transformed:true,move:'surge',phase:'attack'});for(let i=0;i<300;i++)followAdventureCamera(s,1/120);expect(s.camera.backdropY).toBeCloseTo(backdrop,1);expect(s.camera.zoom).toBeGreaterThan(.75);
});

test('diver defeat falls into a splash; dash remains vulnerable to water hoops',()=>{
 const s=quiet(),e=makeEnemy(3180,465,8);s.enemies=[e];Object.assign(s.player,{x:2950,y:465,ground:3});s.shots=[{x:e.x-80,y:e.y-50,vx:510,vy:0,r:10,life:1.5,age:0,kind:-1,damage:20,hits:[]}];tick(s,22);expect(e.defeated).toBe(true);expect(e.deadTime).toBeGreaterThan(.5);tick(s,130);expect(e.splashed).toBe(true);expect(s.enemies).toHaveLength(0);
 s.hostile=[{x:s.player.x+12,y:s.player.y-20,vx:-285,vy:0,r:14,drawSize:44,life:3,age:0,kind:'diver-hoop'}];s.player.hurt=0;const hp=s.hearts;tick(s,1,{dash:true});expect(s.hearts).toBe(hp-1);
});

test('a lethal airborne ultimate finishes with barge destruction and the victory exit',()=>{
 const s=battle();Object.assign(s.boss,{hp:48,transformed:true,armorBroken:true,timer:10});Object.assign(s.player,{x:s.boss.x-500,y:430,ground:null,vy:0,dir:1});tick(s,1,{super:true});expect(s.superCinematic).toBeTruthy();tick(s,385);expect(s.boss.hp).toBe(0);tick(s,500);expect(s.boss.defeat.ready).toBe(true);expect(s.clear).toBeTruthy();tick(s,1200);expect(s.won).toBe(true);
});

test('native body variants keep alpha and the same rig canvas',async()=>{
 for(const name of ['body','damaged']){const {data,info}=await sharp('public/arcade/sprites/bosses/barge/'+name+'.webp').ensureAlpha().raw().toBuffer({resolveWithObject:true});expect([info.width,info.height]).toEqual([1536,1024]);for(const [x,y]of [[0,0],[1500,0],[0,1000],[1500,1000],[500,100]])expect(data[(y*info.width+x)*4+3]).toBe(0);}
});

test('1-3 starts through the actual chapter menu on a narrow screen',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/arcade');await openAdventureMenu(page);await page.getByRole('button',{name:/Elegir cap/}).click();await page.locator('[data-level-choice="2"]').click();await page.locator('[data-practice]').click();await expect(page.locator('[data-hexy-adventure]')).toHaveAttribute('data-phase','playing');await expect(page.locator('audio').first()).toHaveAttribute('data-music-track','canopy');
 const canvas=page.locator('[data-adventure-canvas]');await expect(canvas).toBeVisible();await canvas.screenshot({path:artifacts+'mobile-start.jpg'});await page.keyboard.down('ArrowRight');const x=Number(await canvas.getAttribute('data-player-x'));await expect.poll(async()=>Number(await canvas.getAttribute('data-player-x'))).toBeGreaterThan(x+30);await page.keyboard.up('ArrowRight');
});

test('live waterfront, raised docks, diver and barge render without browser errors',async({page})=>{
 fs.mkdirSync(artifacts,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/arcade');
 await page.evaluate(async()=>{
  const [{createAdventure,stepAdventure},{loadAdventureArt,renderAdventure},{groundY},{followAdventureCamera}]=await Promise.all([import('/src/components/arcade/adventure/engine/adventureModel.js'),import('/src/components/arcade/adventure/render/adventureCanvas.js'),import('/src/components/arcade/adventure/world/adventureTerrain.js'),import('/src/components/arcade/adventure/render/adventureCamera.js')]);
  const art=await loadAdventureArt(),c=document.createElement('canvas');c.id='harbor-review';c.style='position:fixed;inset:0;z-index:99999;width:1440px;height:810px';document.body.append(c);
  const scene=(x,boss=false,move='drumroll',phase='warn',reduced=false)=>{const s=createAdventure(2);s.time=3;s.noticeTime=0;Object.assign(s.player,{x,y:groundY(s.platforms,x),ground:s.platforms.findIndex(q=>q.kind==='earth'&&x>=q.x&&x<q.x+q.w)});s.camera={x:Math.max(0,x-300),y:s.player.y-410,backdropY:s.player.y-410,zoom:1};
   if(boss){s.enemies=[];s.outposts=[];s.arenaLocked=true;Object.assign(s.boss,{phase,move,timer:10,engaged:true,vulnerable:true,wheelAngle:1.2,release:phase==='attack'?.2:0,clock:3});for(let i=0;i<240;i++)followAdventureCamera(s,1/120);}
   renderAdventure(c,s,art,{reduced});window.harborReview.s=s;return s;};
  window.harborReview={scene,art,c,renderAdventure,stepAdventure};scene(700);
 });
 for(const [name,x,boss,move,phase]of [['shore',700,false],['pier-diver',3060,false],['raised-docks',5660,false],['second-crossing',8250,false],['boss-ready',13670,true,'drumroll','warn'],['boss-strike',13670,true,'drumroll','attack']]){await page.evaluate(args=>window.harborReview.scene(...args),[x,boss,move,phase]);await page.locator('#harbor-review').screenshot({path:artifacts+name+'.jpg'});}
 await page.evaluate(()=>{const w=window.harborReview;w.s.boss.armorBroken=true;w.s.boss.transformed=true;w.s.boss.phase='attack';w.s.boss.move='tidal';w.s.boss.timer=2;w.s.boss.shotClock=0;for(let i=0;i<65;i++)w.stepAdventure(w.s,{},1/120);w.renderAdventure(w.c,w.s,w.art);});await page.locator('#harbor-review').screenshot({path:artifacts+'boss-phase-two.jpg'});
 for(const [name,move,frames]of [['boss-mortar','mortar',90],['boss-surge','surge',120]]){
  await page.evaluate(({move,frames})=>{const w=window.harborReview,s=w.scene(13360,true,move,'warn');s.boss.transformed=true;s.boss.armorBroken=true;s.boss.hp=140;s.boss.timer=.01;for(let i=0;i<frames;i++)w.stepAdventure(s,{},1/120);w.renderAdventure(w.c,s,w.art);},{move,frames});await page.locator('#harbor-review').screenshot({path:artifacts+name+'.jpg'});
 }
 await page.evaluate(()=>{const w=window.harborReview;w.s.boss.hp=0;w.s.boss.phase='defeated';for(let i=0;i<80;i++)w.stepAdventure(w.s,{},1/120);w.renderAdventure(w.c,w.s,w.art);});await page.locator('#harbor-review').screenshot({path:artifacts+'boss-destruction.jpg'});
 await page.evaluate(()=>window.harborReview.scene(13670,true,'drumroll','warn',true));await page.locator('#harbor-review').screenshot({path:artifacts+'reduced-motion.jpg'});
 expect(errors).toEqual([]);
});
