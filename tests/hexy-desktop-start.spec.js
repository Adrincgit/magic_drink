import {test,expect} from '@playwright/test';
import {openAdventureMenu} from './arcade-input.helpers';
import {createAdventure,stepAdventure,retryAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {LEVELS} from '../src/components/arcade/adventure/world/adventureLevels';
import {sanitizeSave} from '../src/components/arcade/shared/arcadeStore';
import {prepareBombardment,stepBombardment} from '../src/components/arcade/adventure/actors/bosses/adventureBombardment';
import {updateBoss,enemyShot} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {bossDrawing} from '../src/components/arcade/adventure/render/adventureSprites';
import {balloonSockets} from '../src/components/arcade/adventure/render/adventureCamera';
import {balloonCrewDrawing} from '../src/components/arcade/adventure/actors/bosses/adventureBalloonCrew';

test('two authored flags, three spaced supply chests and no opening obstruction',()=>{
 const s=createAdventure(0),cp=s.level.checkpoints;
 expect(cp).toHaveLength(2);expect(cp[1][0]).toBeLessThan(s.level.arena.entry);
 expect(s.level.arena.left-cp[1][0]).toBe(260);
 expect(s.supplies.map(q=>q.x)).toEqual([1440,5920,s.level.arena.left-540]);
 for(const q of s.supplies)expect(cp.every(c=>Math.abs(c[0]-q.x)>200)).toBe(true);
});
test('death retry returns to the flag, resets the boss and preserves claimed rewards and recharge',()=>{
 const s=createAdventure(0);s.checkpointAt=s.level.checkpoints[1];s.checkpoint=true;s.player.x=s.level.arena.entry+10;s.player.y=1200;s.player.ground=null;s.hearts=1;
 s.stars[0].taken=true;s.supplies[0].hp=0;s.cages[0].rescued=true;s.rescued=1;s.starMoney=17;s.bankedStars=12;s.superCooldown=29;
 stepAdventure(s,{},1/120);expect(s.done).toBe(false);expect(s.playerDefeat).toBeTruthy();for(let i=0;i<650&&!s.done;i++)stepAdventure(s,{},1/120);expect(s.done).toBe(true);s.boss.hp=5;
 retryAdventure(s);expect(s.done).toBe(false);expect(s.player.x).toBe(s.checkpointAt[0]);expect(s.hearts).toBe(5);expect(s.boss.hp).toBe(s.boss.maxHp);expect(s.boss.phase).toBe('sleep');
 expect(s.starMoney).toBe(17);expect(s.bankedStars).toBe(12);expect(s.stars[0].taken).toBe(true);expect(s.supplies[0].hp).toBe(0);expect(s.rescued).toBe(1);expect(s.superCooldown).toBeGreaterThan(28);
 for(let i=0;i<120;i++)stepAdventure(s,{},1/120);expect(s.done).toBe(false);expect(s.player.x).toBeGreaterThan(10000);
});
test('legacy bunnies receive fifty each exactly once and preserve purchases',()=>{
 const old={version:1,stars:7,coins:0,found:['shore','shore','festival','bad'],modsOwned:['bright-spark']};
 const migrated=sanitizeSave(old);expect(migrated.stars).toBe(107);expect(migrated.modsOwned).toEqual(['bright-spark']);expect(sanitizeSave(migrated).stars).toBe(107);
});
test('bombardment makes two fast opposite passes with a narrower safe lane',()=>{
 const s=createAdventure(0),a=s.level.arena,b=s.boss;s.camera.x=a.left;s.player.x=a.left+450;Object.assign(b,{move:'bombing-run',phase:'warn'});prepareBombardment(s);
 expect(b.bombRun.gapWidth).toBe(124);const start=b.bombRun.dir,shots=[];
 for(let i=0;i<650;i++)stepBombardment(s,1/120,(state,x,y,angle,speed,kind,extra)=>shots.push({x,pass:b.bombRun.pass,...extra}));
 expect(b.phase).toBe('recover');expect(b.bombRun.dir).toBe(-start);
 for(const pass of [0,1]){const part=shots.filter(q=>q.pass===pass);expect(part.length).toBeGreaterThan(8);expect(Math.sign(part.at(-1).x-part[0].x)).toBe(pass?-start:start);expect(part.every(q=>Math.abs(q.x-b.bombRun.gap)>=62)).toBe(true);}
});
test('ball release uses the held socket and same artwork size; drop leaves an empty basket slot',()=>{
 const s=createAdventure(0),b=s.boss,a=s.level.arena;s.player.x=a.left+200;s.damage=()=>{};Object.assign(b,{phase:'attack',move:'balls',timer:1,shotClock:0,attackClock:0,dir:-1});
 updateBoss(s,1/120,{say:()=>{},particles:()=>{},body:()=>({x:0,y:0,w:0,h:0})});
 expect(s.hostile).toHaveLength(3);balloonSockets(s).forEach((port,i)=>{expect(s.hostile[i].x).toBe(port.x);expect(s.hostile[i].y).toBe(port.y);expect(s.hostile[i].drawSize).toBe(56);});expect(bossDrawing(s)).toEqual({key:'balloon-shell',frame:1});
 b.move='drop';b.shotClock=0;s.enemies=[];updateBoss(s,1/120,{say:()=>{},particles:()=>{},body:()=>({x:0,y:0,w:0,h:0})});expect(balloonCrewDrawing(s)).toHaveLength(2);expect(s.enemies[0].type).toBe(6);expect(s.enemies[0].vy).toBeLessThan(0);
});
test('normal bomb fire waves grow while bombardment keeps its safe lane open',()=>{
 const s=createAdventure(0);s.enemies=[];s.player.x=100;s.hostile=[{kind:'bomb',x:600,y:480,floor:480,vx:0,vy:0,age:0,life:2,r:15}];stepAdventure(s,{},1/120);
 const flames=s.hostile.filter(q=>q.kind==='wave');expect(flames).toHaveLength(2);for(const q of flames)expect(q.drawSize).toBeCloseTo(94.6*1.15);
});
test('browser flow: skippable brand, title, in-game tutorial/options, chapter card, free play and pause',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize({width:1440,height:900});await page.goto('/arcade');
 await expect(page.locator('[data-presentation]')).toBeVisible();await page.keyboard.press('Enter');await expect(page.locator('[data-presentation]')).toHaveCount(0);
 const title=page.locator('[data-title-screen]');await expect(title).toHaveAttribute('data-entrance','entering');await expect(page.locator('[data-title-menu]')).toHaveCount(0);
 await page.keyboard.press('Enter');await expect(title).toHaveAttribute('data-entrance','settled');await expect(page.locator('[data-title-menu]')).toHaveCount(0);
 await page.screenshot({path:'tests/artifacts/arcade/desktop-start/title-desktop.jpg'});
 await page.keyboard.press('Enter');await expect(page.locator('[data-title-menu]')).toBeVisible();await page.getByRole('button',{name:'Cómo jugar'}).click();await expect(page.locator('[data-tutorial]')).toContainText('bloquear');await page.keyboard.press('Escape');
 await page.locator('[data-open-settings]').click();await expect(page.locator('[data-adventure-settings]')).toBeVisible();await page.getByRole('button',{name:'Cerrar ajustes'}).click();
 const box=await page.locator('[data-game-frame]').boundingBox();expect(box.width).toBe(1440);expect(box.height).toBe(810);
 await page.screenshot({path:'tests/artifacts/arcade/desktop-start/menu-desktop.jpg'});
 await page.locator('[data-start-adventure]').click();await expect(page.locator('[data-chapter-intro]')).toContainText('1-1');await page.screenshot({path:'tests/artifacts/arcade/desktop-start/chapter-desktop.jpg'});
 await expect(page.locator('[data-hexy-adventure]')).toHaveAttribute('data-phase','playing');await page.keyboard.press('Escape');await expect(page.locator('[data-hexy-adventure]')).toHaveAttribute('data-phase','paused');
 await page.locator('[data-open-settings]').click();await page.getByRole('button',{name:'Cómo jugar'}).click();await expect(page.locator('[data-tutorial]')).toBeVisible();await page.screenshot({path:'tests/artifacts/arcade/desktop-start/tutorial-desktop.jpg'});await page.keyboard.press('Escape');
 expect(await page.evaluate(()=>document.documentElement.scrollHeight)).toBe(900);expect(errors).toEqual([]);
});
test('natural title entrance settles without starting play and reduced motion skips it',async({page})=>{
 await page.goto('/arcade');await page.locator('[data-presentation]').click();
 const title=page.locator('[data-title-screen]');await expect(title).toHaveAttribute('data-entrance','entering');await expect(title).toHaveAttribute('data-entrance','settled');await expect(page.locator('[data-title-menu]')).toHaveCount(0);
 await page.emulateMedia({reducedMotion:'reduce'});await page.reload();await page.locator('[data-presentation]').click();await expect(title).toHaveAttribute('data-entrance','settled');
 const bounds=await page.locator('[data-game-frame]').boundingBox();expect(bounds.width/bounds.height).toBeCloseTo(16/9,2);
 await page.keyboard.press('Enter');await page.keyboard.press('Escape');await expect(page.locator('[data-title-start]')).toBeVisible();
});

test('controller face buttons skip the entrance; Menu opens the menu without starting gameplay',async({page})=>{
 await page.addInitScript(()=>{window.titlePad={id:'Xbox title test',index:0,connected:true,mapping:'standard',axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};Object.defineProperty(navigator,'getGamepads',{value:()=>[window.titlePad]});});
 await page.goto('/arcade');await expect(page.locator('[data-presentation]')).toBeVisible();await expect(page.locator('[data-gamepad-state]')).toHaveAttribute('data-gamepad-state','connected');
 const tap=async i=>{await page.evaluate(i=>Object.assign(window.titlePad.buttons[i],{pressed:true,value:1}),i);await page.waitForTimeout(100);await page.evaluate(i=>Object.assign(window.titlePad.buttons[i],{pressed:false,value:0}),i);await page.waitForTimeout(100);};
 await tap(2);await expect(page.locator('[data-presentation]')).toHaveCount(0);await expect(page.locator('[data-title-screen]')).toHaveAttribute('data-entrance','entering');
 await tap(3);await expect(page.locator('[data-title-screen]')).toHaveAttribute('data-entrance','settled');await expect(page.locator('[data-title-menu]')).toHaveCount(0);
 await tap(9);await expect(page.locator('[data-title-menu]')).toBeVisible();await expect(page.locator('[data-hexy-adventure]')).toHaveAttribute('data-phase','ready');
 await tap(1);await expect(page.locator('[data-title-start]')).toBeVisible();
});

test('wallet grants 50 once per bunny; free start, settlement and recovery cannot create entry money',async({page})=>{
 await page.goto('/arcade');const result=await page.evaluate(async()=>{
  const m=await import('/src/components/arcade/shared/arcadeStore.js');localStorage.setItem(m.SAVE_KEY,JSON.stringify(m.sanitizeSave({version:1,economy:2,coins:0,stars:0})));
  const found=await Promise.all([m.collectBunny('shore'),m.collectBunny('shore')]);const run=await m.beginRun(false,0);await m.bankAdventureStars(run.id,0,3);await m.bankAdventureStars(run.id,0,3);await m.finishRun(run.id,{stars:3,won:false,level:0});const next=await m.beginRun(false);await m.recoverRun();await m.recoverRun();return{found,run,next,save:JSON.parse(localStorage.getItem(m.SAVE_KEY))};
 });expect(result.found.sort()).toEqual([false,true]);expect(result.run).toBeTruthy();expect(result.next).toBeTruthy();expect(result.save.stars).toBe(53);expect(result.save.coins).toBe(0);
});
test('actual loss screen continues the same session at the last flag',async({page})=>{
 await page.route('**/src/components/arcade/adventure/engine/adventureModel.js*',async route=>{const response=await route.fetch();let code=await response.text();code=code.replace('function stepAdventure(s,input,dt){',`function stepAdventure(s,input,dt){if(s.ticks===20&&!s.testLost){s.testLost=true;s.checkpointAt=s.level.checkpoints[1];s.checkpoint=true;s.hearts=1;s.player.y=1800;s.player.ground=null;}`);await route.fulfill({response,body:code});});
 await page.goto('/arcade');await openAdventureMenu(page);await page.locator('[data-start-adventure]').click();await expect(page.locator('[data-retry-checkpoint]')).toBeVisible();
 const before=await page.evaluate(()=>JSON.parse(localStorage.getItem('magic-drink-arcade-v1')).run.id);await page.locator('[data-retry-checkpoint]').click();await expect(page.locator('[data-hexy-adventure]')).toHaveAttribute('data-phase','playing');expect(Number(await page.locator('[data-adventure-canvas]').getAttribute('data-player-x'))).toBeGreaterThan(10000);expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('magic-drink-arcade-v1')).run.id)).toBe(before);
});
