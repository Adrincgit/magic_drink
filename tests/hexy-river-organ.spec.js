import {test,expect} from '@playwright/test';
import {openAdventureMenu} from './arcade-input.helpers';
import {createAdventure,stepAdventure,retryAdventure,playerBody} from '../src/components/arcade/adventure/engine/adventureModel';
import {groundY,surfaceY} from '../src/components/arcade/adventure/world/adventureTerrain';
import {canEnterShop,shopForLevel} from '../src/components/arcade/adventure/engine/adventureShop';
import {updateBoss,bossTargets} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {organMouths,organPipes,ORGAN_MOVES} from '../src/components/arcade/adventure/actors/bosses/adventureOrganFortress';
import {bossDrawing} from '../src/components/arcade/adventure/render/adventureSprites';
const helpers={say:()=>{},particles:()=>{},body:playerBody};
const quiet=()=>{const s=createAdventure(1);for(const k of ['enemies','outposts','supplies','pickups','hazards','stars'])s[k]=[];return s;};
const tick=(s,keys={},frames=1)=>{for(let n=0;n<frames;n++)stepAdventure(s,keys,1/120);};

test('the woodland route is continuous and can be walked down to both bridges without jumping',()=>{
 const s=quiet();let end=0,y=480;const crossed=new Set();
 for(const q of s.platforms){expect(q.x).toBe(end);expect(q.y).toBe(y);expect((q.yEnd-q.y)/q.w).toBeGreaterThanOrEqual(0);expect((q.yEnd-q.y)/q.w).toBeLessThan(.13);end=q.x+q.w;y=surfaceY(q,end);}
 expect(end).toBe(s.level.width);expect(y).toBe(650);expect(s.platforms.filter(q=>q.bridge)).toHaveLength(2);
 for(let n=0;n<9000&&s.player.x<10360;n++){tick(s,{right:true});if(s.platforms[s.player.ground]?.bridge)crossed.add(s.player.ground);expect(s.player.y).toBeCloseTo(groundY(s.platforms,s.player.x),3);}
 expect(s.player.x).toBeGreaterThan(10350);expect(crossed.size).toBe(2);expect(s.hearts).toBe(5);expect(s.boss.phase).toBe('sleep');
});

test('Miso is at the safe opening and both riverside checkpoints survive a full retry',()=>{
 const s=quiet(),shop=shopForLevel(s.level);expect(shop).toEqual({x:370,y:480});s.player.x=370;s.player.ground=0;expect(canEnterShop(s)).toBe(true);
 expect(s.level.scenery.some(q=>q.kind==='wagon')).toBe(false);
 expect(s.level.enemies.every(([x])=>x>900)).toBe(true);expect(s.level.checkpoints).toHaveLength(2);
 for(const cp of s.level.checkpoints){Object.assign(s.player,{x:cp[0],y:cp[1],ground:s.platforms.findIndex(q=>cp[0]>=q.x&&cp[0]<=q.x+q.w)});tick(s);expect(s.checkpointAt).toEqual(cp);s.hearts=0;s.done=true;retryAdventure(s);expect(s.player.x).toBe(cp[0]);expect(s.player.y).toBeLessThanOrEqual(cp[1]);expect(s.player.y).toBeGreaterThan(cp[1]-60);}
 expect(createAdventure(2).level.world.key).toBe('harbor');expect(s.level.world.key).toBe('riverwoods');
});

test('organ attacks start at the drawn horns, animate mechanical attacks and reach ground-level Hexy',()=>{
 for(const move of ORGAN_MOVES.filter(move=>move!=='organ-charge')){const s=quiet(),b=s.boss,a=s.level.arena;s.damage=()=>{};Object.assign(s.player,{x:a.left+350,y:a.y});Object.assign(b,{phase:'attack',move,timer:2,shotClock:0,attackClock:0,volley:0});updateBoss(s,1/120,helpers);
  expect(s.hostile.length).toBeGreaterThan(0);expect(bossDrawing(s)).toEqual({key:'organ-machine',frame:2});
  for(const q of s.hostile)expect((q.rain?organPipes(s):organMouths(s)).some(p=>p.x===q.x&&p.y===q.y)).toBe(true);
  if(move==='organ-chords'){const q=s.hostile[0];expect(q.vy).toBeLessThan(0);expect(q.rain).toBe('rise');expect(q.targetX).toBeGreaterThan(a.left);}
  expect(bossDrawing(s).key).toBe('organ-machine');
 }
});

test('half health opens the organ, accelerates volleys, adds a finale and retains recovery windows',()=>{
 const s=quiet(),b=s.boss,a=s.level.arena;s.damage=()=>{};Object.assign(s.player,{x:a.left+250,y:a.y});Object.assign(b,{phase:'recover',timer:1,hp:b.maxHp/2+.1});updateBoss(s,1/120,helpers);expect(b.transformed).toBeFalsy();
 b.hp=b.maxHp/2;updateBoss(s,1/120,helpers);expect(b.phase).toBe('transform');expect(b.vulnerable).toBe(false);expect(bossDrawing(s).frame).toBe(3);
 const moves=new Set();let recovered=false;for(let n=0;n<4000;n++){updateBoss(s,1/120,helpers);moves.add(b.move);recovered||=b.phase==='recover'&&b.vulnerable;}
 expect([...moves]).toEqual(expect.arrayContaining([...ORGAN_MOVES,'organ-finale']));expect(recovered).toBe(true);expect(b.stage).toBe(2);
 const interval=transformed=>{Object.assign(b,{transformed,hp:transformed?60:164,phase:'attack',move:'organ-fanfare',timer:2,shotClock:0,attackClock:0,volley:0});updateBoss(s,1/120,helpers);return b.shotClock;};expect(interval(true)).toBeLessThan(interval(false));
});

test('the fortress takes damage in its elevated body and shatters before the victory sequence',()=>{
 const s=quiet(),b=s.boss,a=s.level.arena;Object.assign(s.player,{x:a.left+350,y:a.y});Object.assign(b,{phase:'recover',timer:4,vulnerable:true,engaged:true});s.arenaLocked=true;
 const target=bossTargets(s)[0];expect(target.y+target.h).toBeLessThan(a.y-100);
 s.shots=[{x:b.x,y:a.y-160,vx:0,vy:0,r:10,life:1,age:0,kind:-1,damage:2,hits:[]}];tick(s);expect(b.hp).toBe(b.maxHp-2);
 b.hp=1;b.transformed=true;s.hitStop=0;s.shots=[{x:b.x,y:a.y-160,vx:0,vy:0,r:10,life:1,age:0,kind:-1,damage:2,hits:[]}];tick(s,{},360);expect(b.hp).toBe(0);expect(s.arenaLocked).toBe(false);expect(b.shattered).toBe(true);expect(b.defeat.ready).toBe(true);expect(b.phase).toBe('defeated');expect(bossDrawing(s)).toEqual({key:'organ-machine',frame:15});
});

test('chapter two can enter and leave the shop inside the desktop game frame',async({page})=>{
 await page.goto('/arcade');await openAdventureMenu(page);await page.getByRole('button',{name:/Elegir capítulo/}).click();await page.locator('[data-level-choice="1"]').click();await page.locator('[data-practice]').click();
 const root=page.locator('[data-hexy-adventure]'),canvas=page.locator('[data-adventure-canvas]');await expect(root).toHaveAttribute('data-phase','playing');
 await canvas.focus();await page.keyboard.down('ArrowRight');await page.waitForFunction(()=>Number(document.querySelector('[data-adventure-canvas]').dataset.playerX)>325);await page.keyboard.up('ArrowRight');await expect(canvas).toHaveAttribute('data-near-shop','true');await page.keyboard.press('KeyE');await expect(root).toHaveAttribute('data-phase','shop',{timeout:15000});
 const shop=page.locator('[data-adventure-shop]');await expect(shop).toBeVisible();const screen=await canvas.boundingBox(),box=await shop.boundingBox();expect(box.width).toBeLessThanOrEqual(screen.width+2);expect(box.height).toBeLessThanOrEqual(screen.height+2);
 await page.getByRole('button',{name:'Salir de la tienda',exact:true}).click();await expect(root).toHaveAttribute('data-phase','playing',{timeout:10000});expect(Number(await canvas.getAttribute('data-player-x'))).toBeGreaterThan(370);
});
