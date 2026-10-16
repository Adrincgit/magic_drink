import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {createAdventure,stepAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {makeEnemy,enemyShot} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {fortSystems,fortRig,fortTargets} from '../src/components/arcade/adventure/actors/bosses/adventureEmberFort';
import {groundY,groundAt} from '../src/components/arcade/adventure/world/adventureTerrain';
import {emberBurnAt} from '../src/components/arcade/adventure/world/adventureEmberTrail';
import {igniteEmberGround} from '../src/components/arcade/adventure/engine/adventureEmberFire';
import {forestPlaneRoot} from '../src/components/arcade/adventure/render/emberAtmosphereCanvas';
const tick=(s,n,input={})=>{for(let i=0;i<n;i++)stepAdventure(s,input,1/120);};
function scene(x){const s=createAdventure(5);for(const k of ['enemies','stars','supplies','outposts','cages'])s[k]=[];Object.assign(s.player,{x,y:groundY(s.platforms,x),ground:s.platforms.indexOf(groundAt(s.platforms,x))});s.noticeTime=0;return s;}
function battle(){const s=scene(31000);Object.assign(s.boss,{engaged:true,phase:'recover',timer:.1,vulnerable:true});s.arenaLocked=true;s.player.hurt=999;return s;}

test('the complete hillside route is traversable and the burn transition is gradual',()=>{
 const s=scene(100);for(const t of s.emberEnvironment.trees)t.phase='spent';
 const heights=[];let activePit=null,jumpAge=0;
 for(let i=0;i<16000&&s.player.x<29500;i++){
  const pit=s.level.emberPits.find(q=>q.x>s.player.x-330&&q.x<s.player.x+65);
  if(pit&&pit!==activePit){activePit=pit;jumpAge=0;}
  const jump=!!pit&&(jumpAge<46||jumpAge>=49&&jumpAge<120);if(pit)jumpAge++;
  stepAdventure(s,{right:true,jump},1/120);if(i%120===0)heights.push(s.player.y);
 }
 expect(s.player.x).toBeGreaterThan(29450);expect(s.done).toBe(false);expect(s.hearts).toBeGreaterThan(0);
 expect(Math.max(...heights)-Math.min(...heights)).toBeGreaterThan(1100);
 for(let x=0;x<30000;x+=100){expect(emberBurnAt(x+100)).toBeGreaterThanOrEqual(emberBurnAt(x));expect(emberBurnAt(x+100)-emberBurnAt(x)).toBeLessThan(.011);}
 expect(emberBurnAt(5000)).toBe(0);expect(emberBurnAt(21500)).toBeLessThan(1);expect(emberBurnAt(28000)).toBe(1);
});
test('fire breather inhales, blows a sustained stream from its mouth, ignites brush and recovers',()=>{
 const s=scene(10800),e=makeEnemy(11020,groundY(s.platforms,11020),10);e.timer=0;e.dir=-1;s.enemies=[e];s.player.hurt=999;
 s.emberEnvironment.bushes=[{x:10840,y:e.y,state:'green',age:0}];
 tick(s,1);expect(e.phase).toBe('windup');tick(s,110);expect(s.hostile.some(q=>q.kind==='ember-breath')).toBe(false);
 tick(s,50);const jet=s.hostile.find(q=>q.kind==='ember-breath');expect(jet).toBeTruthy();expect(jet.owner).toBe(e);expect(jet.x).toBeCloseTo(e.x-23,4);expect(jet.range).toBeGreaterThan(100);
 tick(s,55);expect(s.emberEnvironment.bushes[0].state).toBe('burning');expect(s.hostile.some(q=>q.kind==='harlequin-groundfire'&&q.source==='forest')).toBe(true);
 tick(s,140);expect(e.phase).toBe('recover');expect(s.hostile.some(q=>q.kind==='ember-torch'||q.kind==='ember-shot')).toBe(false);
 e.hp=0;tick(s,15);expect(s.hostile.some(q=>q.kind==='ember-breath')).toBe(false);expect(s.hostile.some(q=>q.source==='forest')).toBe(true);
 tick(s,1000);expect(s.emberEnvironment.bushes[0].state).toBe('charred');
});
test('forest flames use the local slope height, burn on contact and expire',()=>{
 const s=scene(5800),hp=s.hearts;igniteEmberGround(s,5800,1.5);const q=s.hostile[0];
 expect(q.floor).toBeCloseTo(groundY(s.platforms,5800),5);expect(q.floor).not.toBe(s.level.arena.y);
 tick(s,30);expect(s.hearts).toBe(hp-1);expect(s.player.hitType).toBe('fire');tick(s,200);expect(s.hostile.some(q=>q.source==='forest')).toBe(false);
});
test('fort guns turn and fire large ballistic shots; reinforcements walk out of the main gate',()=>{
 const s=battle();let ball;for(let i=0;i<300&&!ball;i++){tick(s,1);ball=s.hostile.find(q=>q.kind==='ember-mortar');}expect(ball).toBeTruthy();expect(ball.r).toBeGreaterThanOrEqual(26);expect(ball.gravity).toBeGreaterThan(400);expect(ball.vy).toBeLessThan(0);
 const vy=ball.vy;tick(s,30);expect(ball.vy).toBeGreaterThan(vy);expect(Math.abs(s.boss.gunAngles.lower)).toBeGreaterThan(.1);
 Object.assign(s.boss,{phase:'recover',timer:0,turn:2});tick(s,1);expect(s.boss.move).toBe('reinforce');expect(s.boss.hatchOpen).toBeGreaterThan(4);
 tick(s,165);const e=s.enemies.find(e=>e.fortCrew);expect(e).toBeTruthy();expect(e.phase).toBe('emerge');expect(e.x).toBeLessThan(fortRig(s).hatch.x);expect(e.x).toBeGreaterThan(fortRig(s).hatch.x-90);
});
test('breaching both barriers opens the stationary core and starts the furnace phase',()=>{
 const s=battle(),parts=fortSystems(s);parts.upper.hp=parts.lower.hp=0;s.boss.hp=140;
 tick(s,1);expect(s.boss.phase).not.toBe('transform');expect(fortTargets(s)[0].part).toBe('wall');
 parts.wall.hp=0;parts.gate.hp=0;
 tick(s,1);expect(s.boss.phase).toBe('transform');expect(fortTargets(s).filter(q=>!q.part.startsWith('window-')).map(q=>q.part)).toEqual(['core']);tick(s,300);expect(s.boss.fortStage).toBe(2);expect(fortTargets(s).find(q=>q.part==='core').part).toBe('core');expect(fortRig(s).core.y).toBe(s.level.arena.y-130);
 tick(s,360);expect(s.hostile.some(q=>q.kind==='fort-breath')).toBe(true);
});
test('roots share the floor projection on hills and during zoom, reversing camera restores positions',()=>{
 const s=scene(17200);s.camera={x:16900,y:s.player.y-420,zoom:.72};
 for(const depth of [.34,.63]){const root=forestPlaneRoot(s,17500,depth);s.camera.x+=200;const next=forestPlaneRoot(s,17500,depth);expect(next.x).toBeLessThan(root.x);s.camera.x-=200;expect(forestPlaneRoot(s,17500,depth)).toEqual(root);expect(Number.isFinite(root.y)).toBe(true);}
});

test('review the whole route, animated fire breath, hatch and furnace in the browser',async({page})=>{
 test.setTimeout(90000);const folder='tests/artifacts/arcade/wildfire/';fs.mkdirSync(folder,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/arcade');
 await page.evaluate(async()=>{
  const [model,render,terrain,camera,enemies,fort]=await Promise.all([import('/src/components/arcade/adventure/engine/adventureModel.js'),import('/src/components/arcade/adventure/render/adventureCanvas.js'),import('/src/components/arcade/adventure/world/adventureTerrain.js'),import('/src/components/arcade/adventure/render/adventureCamera.js'),import('/src/components/arcade/adventure/actors/enemies/adventureEnemies.js'),import('/src/components/arcade/adventure/actors/bosses/adventureEmberFort.js')]);
  const art=await render.loadAdventureArt(),c=document.createElement('canvas');c.id='wildfire-review';c.style='position:fixed;inset:0;z-index:99999;width:1440px;height:810px';document.body.append(c);
  const w={...model,...render,...terrain,...camera,...enemies,...fort,art,c};
  w.fresh=x=>{const s=model.createAdventure(5);for(const k of ['enemies','stars','supplies','outposts','cages'])s[k]=[];Object.assign(s.player,{x,y:terrain.groundY(s.platforms,x),ground:s.platforms.indexOf(terrain.groundAt(s.platforms,x)),hurt:999});s.noticeTime=0;s.time=s.fxTime=8;for(let i=0;i<500;i++)camera.followAdventureCamera(s,1/120);w.s=s;return s;};w.paint=()=>render.renderAdventure(c,w.s,art);window.wildfire=w;
 });
 const shot=async name=>page.locator('#wildfire-review').screenshot({path:folder+name+'.jpg'});
 for(const [name,x]of [['healthy',1200],['uphill',5400],['ridge',12100],['descent',18000],['inferno',23000],['deep-forest',27400]]){await page.evaluate(x=>{const w=window.wildfire;w.fresh(x);w.paint();},x);await shot(name);}
 await page.evaluate(()=>{const w=window.wildfire,s=w.fresh(10800),e=w.makeEnemy(11020,w.groundY(s.platforms,11020),10);e.timer=0;s.enemies=[e];s.emberEnvironment.bushes=[{x:10840,y:e.y,state:'green',age:0}];});
 for(const [name,frames]of [['inhale',75],['breath-start',100],['breath-full',80],['recover',125]]){await page.evaluate(n=>{const w=window.wildfire;for(let i=0;i<n;i++)w.stepAdventure(w.s,{},1/120);w.paint();},frames);await shot(name);}
 await page.evaluate(()=>{const w=window.wildfire,s=w.fresh(31200);Object.assign(s.boss,{engaged:true,phase:'warn',move:'salvo',timer:1.2,targetX:31200});s.arenaLocked=true;for(let i=0;i<500;i++)w.followAdventureCamera(s,1/120);w.paint();});await shot('fort-aim');
 for(const [name,frames]of [['fort-flight',180],['fort-impact',150]]){await page.evaluate(n=>{const w=window.wildfire;for(let i=0;i<n;i++)w.stepAdventure(w.s,{},1/120);w.paint();},frames);await shot(name);}
 await page.evaluate(()=>{const w=window.wildfire;Object.assign(w.s.boss,{phase:'recover',timer:0,turn:2});for(let i=0;i<180;i++)w.stepAdventure(w.s,{},1/120);w.paint();});await shot('hatch-emerge');
 await page.evaluate(()=>{const w=window.wildfire,p=w.fortSystems(w.s);p.upper.hp=p.lower.hp=0;w.s.boss.hp=140;for(let i=0;i<130;i++)w.stepAdventure(w.s,{},1/120);w.paint();});await shot('fort-opening');
 for(const [name,frames]of [['fort-heart',200],['fort-furnace',240]]){await page.evaluate(n=>{const w=window.wildfire;for(let i=0;i<n;i++)w.stepAdventure(w.s,{},1/120);w.paint();},frames);await shot(name);}
 const timing=await page.evaluate(()=>{const w=window.wildfire;w.fresh(23000);const t=performance.now();for(let i=0;i<60;i++){w.s.fxTime+=1/60;w.renderAdventure(w.c,w.s,w.art);}return(performance.now()-t)/60;});console.log('Wildfire render average ms:',timing);
 expect(errors).toEqual([]);
});
