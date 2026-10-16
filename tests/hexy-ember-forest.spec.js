import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {createAdventure,stepAdventure,retryAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {LEVELS} from '../src/components/arcade/adventure/world/adventureLevels';
import {groundAt,groundY} from '../src/components/arcade/adventure/world/adventureTerrain';
import {hexyPose} from '../src/components/arcade/adventure/actors/hexy/hexyAnimation';
import {emberPlanePosition} from '../src/components/arcade/adventure/render/emberAtmosphereCanvas';
const tick=(s,n,input={})=>{for(let i=0;i<n;i++)stepAdventure(s,input,1/120);};
function scene(x=85){const s=createAdventure(5);for(const k of ['enemies','stars','supplies','outposts','cages'])s[k]=[];Object.assign(s.player,{x,y:groundY(s.platforms,x),ground:s.platforms.indexOf(groundAt(s.platforms,x))});s.noticeTime=0;return s;}

test('1-4 is the longest authored route, with safe checkpoints and a complete land journey',()=>{
 const l=LEVELS[5];expect(l.width).toBe(33200);expect(l.width).toBeGreaterThan(Math.max(...LEVELS.filter(q=>q!==l).map(q=>q.width))*1.3);
 expect(l.checkpoints).toHaveLength(7);expect(l.emberPits).toHaveLength(5);expect(l.fallingTrees).toHaveLength(6);expect(l.enemies.length).toBeGreaterThan(28);
 for(const [x,y]of l.checkpoints){expect(groundY(l.platforms,x)).toBe(y);expect(l.emberPits.some(p=>x>p.x-100&&x<p.x+p.w+100)).toBe(false);expect(l.fallingTrees.some(t=>Math.abs(x-t.x)<350)).toBe(false);}
 expect(l.fortDoor).toBeUndefined();expect(l.arena.right).toBeLessThan(l.exit[0]);expect(l.exit[0]).toBeLessThan(l.width);
});
test('all charcoal gaps can be crossed with the existing jumps without taking fire damage',()=>{
 for(const pit of LEVELS[5].emberPits){const s=scene(pit.x-65),hp=s.hearts;
  expect(groundAt(s.platforms,pit.x+pit.w/2)).toBeUndefined();
  for(let i=0;i<360&&s.player.x<pit.x+pit.w+80;i++)stepAdventure(s,{right:true,jump:i<46||i>=49&&i<120},1/120);
  expect(s.player.x).toBeGreaterThan(pit.x+pit.w+40);expect(s.hearts).toBe(hp);tick(s,100);expect(s.player.ground).not.toBeNull();
 }
});
test('falling into hot roots burns on contact and permits jumping back to safety',()=>{
 const pit=LEVELS[5].emberPits[0],s=scene(pit.x+pit.w/2);Object.assign(s.player,{y:pit.y,ground:s.platforms.findIndex(q=>q.kind==='ember-bed'&&q.x===pit.x)});
 tick(s,1);expect(s.hearts).toBe(4);expect(s.player.hitType).toBe('fire');expect(s.player.vy).toBeLessThan(0);
 tick(s,45);for(let i=0;i<240;i++)stepAdventure(s,{left:true,jump:i<42||i>=45&&i<95},1/120);
 expect(s.player.x).toBeLessThan(pit.x-30);expect(s.player.y).toBeLessThanOrEqual(groundY(s.platforms,s.player.x)+1);expect(s.hearts).toBeGreaterThan(0);
});
test('scenic falling trees animate without damaging or obstructing the route; retry resets them',()=>{
 const s=scene(LEVELS[5].fallingTrees[0].x+90),q=s.emberEnvironment.trees[0],hp=s.hearts;tick(s,1);expect(q.phase).toBe('warning');expect(s.events).toContain('treeCreak');
 tick(s,180);expect(q.phase).toBe('warning');expect(s.hearts).toBe(hp);tick(s,210);expect(q.phase).toBe('fallen');expect(s.hearts).toBe(hp);expect(s.platforms.some(p=>p.emberFallen)).toBe(false);
 retryAdventure(s);expect(s.platforms.some(p=>p.emberFallen)).toBe(false);expect(s.emberEnvironment.trees[0].phase).toBe('standing');
 const safe=scene(LEVELS[5].fallingTrees[0].x-120);tick(safe,410);expect(safe.emberEnvironment.trees[0].phase).toBe('fallen');expect(safe.hearts).toBe(safe.maxHearts);
});
test('heat acting is cosmetic, yields immediately to movement and casting, and fades outside the grove',()=>{
 const s=scene(6200),hp=s.hearts;tick(s,260);expect(s.player.heat).toBeGreaterThan(.7);expect(hexyPose(s).sheet).toBe('heat');expect(s.hearts).toBe(hp);
 tick(s,8,{right:true});expect(hexyPose(s).sheet).toBe('run');expect(s.player.heatIdle).toBe(0);
 tick(s,1,{attack:true});expect(hexyPose(s).sheet).not.toBe('heat');
 s.player.x=4500;s.player.y=groundY(s.platforms,4500);s.player.ground=s.platforms.indexOf(groundAt(s.platforms,4500));tick(s,500);expect(s.player.heat).toBeLessThan(.05);
});
test('depth layers have stable world anchors in both camera directions and flocks leave rather than following Hexy',()=>{
 const camera={x:4900,y:90,backdropY:90,zoom:1};
 for(const depth of [.18,.34,.45,.63,.78]){const a=emberPlanePosition(camera,5800,500,depth),b=emberPlanePosition({...camera,x:5100},5800,500,depth);expect(a.x-b.x).toBeCloseTo(200*depth,7);expect(emberPlanePosition({...camera,x:4900},5800,500,depth)).toEqual(a);}
 const s=scene(5250);tick(s,1);const flock=s.emberEnvironment.flocks.find(q=>q.x===5250);expect(flock.age).toBe(0);tick(s,3000);expect(flock.age).toBeGreaterThan(22);s.player.x=5200;tick(s,1);expect(flock.age).toBeGreaterThan(22);
});
test('forest depth, smoke, escaping birds, falling trees and heat poses render through motion',async({page})=>{
 test.setTimeout(90000);const folder='tests/artifacts/arcade/ember-forest/';fs.mkdirSync(folder,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/arcade');
 await page.evaluate(async()=>{
  const [model,canvas,terrain,camera]=await Promise.all([import('/src/components/arcade/adventure/engine/adventureModel.js'),import('/src/components/arcade/adventure/render/adventureCanvas.js'),import('/src/components/arcade/adventure/world/adventureTerrain.js'),import('/src/components/arcade/adventure/render/adventureCamera.js')]);
  const art=await canvas.loadAdventureArt(),c=document.createElement('canvas');c.id='forest-review';c.style='position:fixed;inset:0;z-index:99999;width:1440px;height:810px';document.body.append(c);
  const w={...model,...canvas,...terrain,...camera,art,c};w.fresh=x=>{const s=model.createAdventure(5);for(const k of ['enemies','stars','supplies','outposts','cages'])s[k]=[];Object.assign(s.player,{x,y:terrain.groundY(s.platforms,x),ground:s.platforms.indexOf(terrain.groundAt(s.platforms,x))});s.noticeTime=0;for(let i=0;i<500;i++)camera.followAdventureCamera(s,1/120);w.s=s;return s;};w.paint=()=>canvas.renderAdventure(c,w.s,art);window.forest=w;w.fresh(6200);
 });
 const shot=async n=>page.locator('#forest-review').screenshot({path:folder+n+'.jpg'});
 await page.evaluate(()=>{const w=window.forest;for(let i=0;i<300;i++)w.stepAdventure(w.s,{},1/120);w.paint();});await shot('heat-and-birds');
 for(let i=0;i<4;i++){await page.evaluate(i=>{const w=window.forest;w.s.player.heatIdle=.7+i*.55;w.paint();},i);await shot('heat-'+i);}
 await page.evaluate(()=>{const w=window.forest;w.fresh(w.s.level.emberPits[0].x-70);w.paint();});await shot('charcoal-gap');
 await page.evaluate(()=>{const w=window.forest;w.fresh(w.s.level.fallingTrees[0].x-120);w.stepAdventure(w.s,{},1/120);w.paint();});await shot('tree-warning');
 const frames=await page.evaluate(async()=>{const w=window.forest,frames=[];let n=0;await new Promise(resolve=>{const f=()=>{for(let j=0;j<4;j++)w.stepAdventure(w.s,{},1/120);w.paint();if([20,45,57,66,77,90].includes(n))frames.push({n,png:w.c.toDataURL('image/png').split(',')[1]});if(++n<100)requestAnimationFrame(f);else resolve();};requestAnimationFrame(f);});return frames;});for(const q of frames)fs.writeFileSync(folder+'tree-'+q.n+'.png',Buffer.from(q.png,'base64'));
 await page.evaluate(()=>{const w=window.forest;w.fresh(9850);for(const f of w.s.emberEnvironment.flocks)if(Math.abs(f.x-9700)<1)f.age=3;w.s.time=12;w.paint();});await shot('parallax-start');
 await page.evaluate(()=>{const w=window.forest;w.s.camera.x+=400;w.paint();});await shot('parallax-forward');
 await page.evaluate(()=>{const w=window.forest;w.s.camera.x-=400;w.paint();});await shot('parallax-return');
 expect(errors).toEqual([]);
});
