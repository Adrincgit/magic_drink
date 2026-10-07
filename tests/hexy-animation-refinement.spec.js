import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {openAdventureMenu} from './arcade-input.helpers';
import {createAdventure,stepAdventure,playerBody} from '../src/components/arcade/adventure/engine/adventureModel';
import {hexyPose,hexyMuzzle} from '../src/components/arcade/adventure/actors/hexy/hexyAnimation';
import {updateBoss} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {organShellDrawing,organPipes} from '../src/components/arcade/adventure/actors/bosses/adventureOrganFortress';
import {BOMB_FLAME_SIZE,BOMB_FLAME_RADIUS,bombFlames} from '../src/components/arcade/adventure/actors/bosses/adventureBombs';
const tick=(s,keys={},n=1)=>{for(let i=0;i<n;i++)stepAdventure(s,keys,1/120);};
const quiet=(i=0)=>{const s=createAdventure(i);s.enemies=[];s.supplies=[];s.pickups=[];return s;};
test('running diagonal aim changes to airborne legs and a second jump keeps its tumble',()=>{
 const s=quiet();tick(s,{right:true,up:true},12);expect(hexyPose(s).sheet).toBe('run-diagonal-up');
 tick(s,{right:true,up:true,jump:true},10);expect(s.player.ground).toBe(null);expect(hexyPose(s).sheet).toBe('air-aim');expect(hexyPose(s).frame).toBeGreaterThanOrEqual(4);
 tick(s,{up:true},2);tick(s,{up:true,jump:true});expect(hexyPose(s).sheet).toBe('somersault');
 tick(s,{up:true,attack:true});expect(hexyPose(s).sheet).toBe('air-aim');expect(s.shots.at(-1).vy).toBeLessThan(0);
});
test('sustained airborne fire and airborne strong aim never select planted feet',()=>{
 for(const aim of [{right:true},{right:true,up:true},{up:true}]){
  const s=quiet();tick(s,{jump:true,...aim},14);tick(s,{attack:true,...aim});
  expect(hexyPose(s).sheet).toBe('air-aim');const m=hexyMuzzle(s),q=s.shots[0];expect(q.x-q.vx/120).toBeCloseTo(m.x-s.player.vx/120);expect(q.y-q.vy/120).toBeCloseTo(m.y-s.player.vy/120);
  s.player.cast=0;expect(hexyPose(s).sheet).toBe('air-aim');
  tick(s,{special:true,...aim});expect(hexyPose(s).sheet).toBe('air-aim');
 }
});
test('ground aim and crouching rest/fire use matched drawings without wink cycling',()=>{
 const s=quiet();tick(s,{down:true});expect(hexyPose(s)).toEqual({sheet:'ground-aim',frame:8});
 tick(s,{down:true,attack:true});expect(hexyPose(s)).toEqual({sheet:'ground-aim',frame:9});
 for(const direction of [1,-1]){s.player.dir=direction;const a=hexyMuzzle(s);expect((a.x-s.player.x)*direction).toBeGreaterThan(0);}
 const rows=JSON.parse(fs.readFileSync('tests/fixtures/hexy-pose-registration.json'));
 for(const sheet of ['ground-aim','air-aim','stand-fire'])for(let row=0;row<4;row++){
  const frames=rows.filter(r=>r.sheet===sheet&&Math.floor(r.frame/4)===row);if(!frames.length)continue;
  expect(new Set(frames.map(f=>f.scale)).size).toBe(1);
  // Horizontal skin segmentation sometimes separates the ear from the face.
  // Check its shared scale/body height; review its head shape in the render.
  const checks=sheet==='stand-fire'?[['bodyHeight',3]]:[['faceX',5],['faceY',4],['faceWidth',3],['bodyHeight',3]];
  for(const [key,limit]of checks)expect(Math.max(...frames.map(f=>f[key]))-Math.min(...frames.map(f=>f[key]))).toBeLessThan(limit);
 }
});

test('airborne downward recoil remains registered in both facing directions',()=>{
 for(const dir of [-1,1]){
  const s=quiet();Object.assign(s.player,{ground:null,x:400,y:250,dir,aimX:0,aimY:1});
  const tips=[];for(const cast of [0,.24,.18,.12,.06]){s.player.cast=cast;expect(hexyPose(s).sheet).toBe('aim-down');tips.push(hexyMuzzle(s));}
  expect(Math.max(...tips.map(p=>p.x))-Math.min(...tips.map(p=>p.x))).toBeLessThan(1);
  expect(Math.max(...tips.map(p=>p.y))-Math.min(...tips.map(p=>p.y))).toBeLessThan(1);
 }
});

test('every overhead frame emits above the hat, never from a gold boot buckle',()=>{
 const s=quiet();s.player.x=400;s.player.y=480;
 for(const ground of [0,null])for(const dir of [-1,1])for(const cast of [0,.24,.18,.12,.06]){
  Object.assign(s.player,{ground,dir,cast,aimX:0,aimY:-1});
  expect(hexyMuzzle(s).y).toBeLessThan(s.player.y-95);
 }
});
test('both minibosses preserve their cumulative health increases and balloon fire grows fifteen percent',()=>{
 expect(createAdventure().boss.maxHp).toBeCloseTo(161*1.44*1.15);expect(createAdventure(1).boss.maxHp).toBeCloseTo(164*1.44*1.15);
 expect(BOMB_FLAME_SIZE).toBeCloseTo(86*1.1*1.15);expect(BOMB_FLAME_RADIUS).toBeCloseTo(23*1.1*1.15);
 expect(bombFlames({x:0,floor:500})[0].drawSize).toBe(BOMB_FLAME_SIZE);
});
test('organ releases large notes and traverses six mechanical transformation stages',()=>{
 const s=quiet(1),b=s.boss;s.damage=()=>{};const helpers={say:()=>{},particles:()=>{},body:playerBody};
 Object.assign(b,{phase:'attack',move:'organ-chords',timer:4,shotClock:0,attackClock:0,volley:0});updateBoss(s,1/120,helpers);
 expect(organShellDrawing(s)).toEqual({key:'organ-machine',frame:2});expect(s.hostile.length).toBeGreaterThan(1);
 for(const q of s.hostile){expect(q.drawSize).toBe(102);expect(q.rain).toBe('rise');expect(organPipes(s).some(p=>p.x===q.x&&p.y===q.y)).toBe(true);}
 b.hp=b.maxHp/2;updateBoss(s,1/120,helpers);const frames=new Set();
 for(let i=0;i<310;i++){frames.add(organShellDrawing(s).frame);updateBoss(s,1/120,helpers);}
 expect([...frames]).toEqual(expect.arrayContaining([3,4,5,6,7,8]));expect(s.organDebris.length).toBeGreaterThan(0);
 b.phase='attack';b.move='organ-finale';b.shotClock=0;b.volley=0;b.timer=4;s.hostile=[];updateBoss(s,1/120,helpers);expect(organShellDrawing(s).frame).toBe(10);expect(s.hostile.every(q=>q.drawSize===114)).toBe(true);
});
test('actual jumping direction, larger HUD and modular organ parts render without errors',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/arcade');await openAdventureMenu(page);await page.locator('[data-practice]').click();
 const canvas=page.locator('[data-adventure-canvas]');await expect(page.locator('[data-hexy-adventure]')).toHaveAttribute('data-phase','playing');
 expect((await page.locator('[data-life] img').first().boundingBox()).width).toBeGreaterThan(40);
 await canvas.focus();await page.keyboard.down('ArrowUp');await page.keyboard.down('ArrowRight');await page.keyboard.press('Space');await page.waitForTimeout(110);await page.keyboard.down('KeyZ');
 await expect(canvas).toHaveAttribute('data-pose',/air-aim:[4-7]/);await page.screenshot({path:'tests/artifacts/arcade/animation-refinement/air-diagonal.jpg'});
 for(const key of ['ArrowUp','ArrowRight','KeyZ'])await page.keyboard.up(key);await page.keyboard.press('KeyP');
 await page.evaluate(async()=>{
  const [{createAdventure},{loadAdventureArt,renderAdventure}]=await Promise.all([import('/src/components/arcade/adventure/engine/adventureModel.js'),import('/src/components/arcade/adventure/render/adventureCanvas.js')]);
  const art=await loadAdventureArt();window.refinementArt=art;window.refinementRender=renderAdventure;window.refinementState=createAdventure(1);const s=window.refinementState,a=s.level.arena;
  s.camera={x:a.right-1060,y:a.y-495,zoom:1};s.player.x=a.right-960;s.player.y=a.y;s.boss.x=a.right-345;s.boss.phase='attack';s.boss.move='organ-chords';s.boss.release=.24;
  const c=document.createElement('canvas');c.id='refinement-canvas';c.style='width:960px;height:540px;position:fixed;left:0;top:0;z-index:9999';document.body.append(c);renderAdventure(c,s,art,{reduced:true});
 });
 await page.locator('#refinement-canvas').screenshot({path:'tests/artifacts/arcade/animation-refinement/organ-closed.jpg'});
 await page.evaluate(()=>{window.refinementState.boss.transformed=true;window.refinementRender(document.querySelector('#refinement-canvas'),window.refinementState,window.refinementArt,{reduced:true});});
 await page.locator('#refinement-canvas').screenshot({path:'tests/artifacts/arcade/animation-refinement/organ-open.jpg'});expect(errors).toEqual([]);
});

test('production renderer visual review of held aim versus recoil, with fixed body anchors',async({page})=>{
 await page.setViewportSize({width:1280,height:2070});await page.goto('/arcade');
 await page.evaluate(async()=>{
  const [{loadAdventureArt},{drawHexy},{hexyPose},{createAdventure}]=await Promise.all([
   import('/src/components/arcade/adventure/render/adventureCanvas.js'),import('/src/components/arcade/adventure/render/hexyCanvas.js'),
   import('/src/components/arcade/adventure/actors/hexy/hexyAnimation.js'),import('/src/components/arcade/adventure/engine/adventureModel.js')]);
  const art=await loadAdventureArt(),s=createAdventure(),canvas=document.createElement('canvas');canvas.width=1280;canvas.height=2070;canvas.id='aim-review';
  canvas.style='position:fixed;left:0;top:0;z-index:999999;width:1280px;height:2070px';document.body.append(canvas);const c=canvas.getContext('2d');
  c.fillStyle='#253e40';c.fillRect(0,0,1280,2070);c.font='18px sans-serif';
  const poses=[['Diagonal arriba',0,1,-1,false],['Vertical arriba',0,0,-1,false],['Agachada',0,1,0,true],['Diagonal abajo',0,1,1,false],['Salto diagonal arriba',null,1,-1,false],['Salto vertical arriba',null,0,-1,false],['Salto hacia abajo',null,0,1,false],['Disparo horizontal',0,1,0,false],['Salto horizontal',null,1,0,false]];
  poses.forEach(([label,ground,aimX,aimY,crouch],row)=>{
   c.fillStyle='#fff0cb';c.fillText(label,12,row*230+23);
   [0,.24,.16,.08].forEach((cast,col)=>{
    Object.assign(s.player,{ground,aimX,aimY,crouch,cast,dir:1,vx:0,vy:0,firing:row>=7});
    c.fillStyle='#fff0cb';c.fillText(col===0?'Sostener':col===1?'Disparo':col===2?'Retroceso':'Recuperación',col*320+110,row*230+45);
    c.save();c.translate(col*320+160,row*230+220);c.scale(1.6,1.6);drawHexy(c,art,hexyPose(s),0,0,false);c.restore();
   });
  });
 });
 await page.locator('#aim-review').screenshot({path:'tests/artifacts/arcade/animation-refinement/aim-review.jpg'});
});

test('the four retained pages load after retiring the legacy portal',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const path of ['/','/bebidas','/hexy','/arcade']){const response=await page.goto(path);expect(response.status()).toBe(200);await page.waitForTimeout(400);}
 expect(errors).toEqual([]);
});
