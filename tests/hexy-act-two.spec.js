import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {createAdventure,stepAdventure,retryAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {damageActTwoBoss,stepActTwoBoss} from '../src/components/arcade/adventure/actors/bosses/adventureActTwoBosses';
import {makeEnemy,enemyShot,updateEnemies} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {playerBody} from '../src/components/arcade/adventure/engine/adventureModel';
import {hitActTwoObjects} from '../src/components/arcade/adventure/engine/actTwoRoute';
import {CHAPTER_ORDER,nextAdventureChapter,chapterRank} from '../src/components/arcade/shared/adventureProgression';
import {sanitizeSave} from '../src/components/arcade/shared/arcadeStore';
import {adventureMusic} from '../src/components/arcade/adventure/world/adventureWorlds';
import {openAdventureMenu} from './arcade-input.helpers';
const tick=(s,time,input={})=>{for(let i=0;i<time*120;i++)stepAdventure(s,input,1/120);};
const battle=id=>{const s=createAdventure(id);s.player.x=s.level.arena.entry+100;s.player.y=s.level.arena.y;s.player.hurt=999;s.enemies=[];tick(s,2);return s;};
test('new stable IDs extend act 2 and migrate every previous save order without losing receipts',()=>{
 expect(CHAPTER_ORDER).toEqual([0,1,2,5,3,6,7,8,9,10,4]);expect(nextAdventureChapter(7)).toBe(8);expect(nextAdventureChapter(9)).toBe(10);expect(nextAdventureChapter(10)).toBe(4);
 for(const [campaign,rank]of [[2,5],[3,6],[4,7]]){const s=sanitizeSave({version:1,campaign,economy:2,stars:123,adventureUnlocked:rank,adventureCleared:[6,7,4],run:{id:'retain',practice:false,chapter:4,earned:15,banked:3}});expect(s.campaign).toBe(5);expect(s.adventureUnlocked).toBe(chapterRank(4));expect(s.stars).toBe(123);expect(s.run.chapter).toBe(4);expect(s.run.banked).toBe(3);expect(sanitizeSave(s)).toEqual(s);}
 expect(sanitizeSave({version:1,campaign:4,adventureUnlocked:6}).adventureUnlocked).toBe(6);
});
test('all three chapters simulate finite state and use available music and independently authored art',()=>{
 for(const id of [8,9,10]){const s=createAdventure(id);s.player.hurt=999;tick(s,3,{right:true,attack:true});expect(s.player.x).toBeGreaterThan(300);expect(Number.isFinite(s.camera.y)).toBe(true);expect(s.level.chapter).toBe('2-'+(id-5));expect(fs.existsSync('public'+adventureMusic(id,'playing').src)).toBe(true);expect(fs.existsSync('public'+s.level.background)).toBe(true);}
});
test('wreckage blocks walking, supports jumping and can be broken by actual wand projectiles',()=>{
 const s=createAdventure(8);s.enemies=[];s.player.hurt=999;const q=s.platforms.find(q=>q.solid);s.player.x=q.x-100;s.player.y=480;
 tick(s,1,{right:true});expect(s.player.x).toBeCloseTo(q.x-14,0);expect(q.hp).toBe(q.maxHp);
 tick(s,.55,{right:true,jump:true});expect(s.player.x).toBeGreaterThan(q.x+35);expect(s.player.y).toBeLessThan(380);
 s.player.x=q.x-110;s.player.y=480;s.player.vy=0;tick(s,6,{attack:true});expect(q.gone).toBe(true);tick(s,1,{right:true});expect(s.player.x).toBeGreaterThan(q.x+25);
});
test('level retry restores broken collision surfaces and resets encounter state',()=>{
 const s=createAdventure(8),q=s.platforms.find(q=>q.solid);hitActTwoObjects(s,{x:q.x+q.w/2,y:q.y+40,damage:100,life:1,heavy:true},30);expect(q.gone).toBe(true);
 s.checkpointAt=s.level.checkpoints[1];retryAdventure(s);expect(s.platforms.filter(q=>q.solid).every(q=>!q.gone&&q.hp>0)).toBe(true);expect(s.player.x).toBe(s.level.spawn[0]);expect(s.boss.phase).toBe('sleep');expect(s.strawPiles).toEqual([]);
});
test('the mansion can be traversed through its upper galleries using real movement and jumps',()=>{
 const s=createAdventure(9);s.enemies=[];s.actTwoAmbushes=[];s.player.hurt=999;
 const targets=s.platforms.filter(q=>q.kind==='act-two'&&!q.solid).sort((a,b)=>a.x-b.x);
 for(const q of targets){
  const target=q.x+q.w*.5;let jumping=false,age=0,arrived=false;
  for(let frame=0;frame<1500;frame++){
   const p=s.player,dx=target-p.x,input={right:dx>8,left:dx< -8};
   if(!jumping&&p.ground!==null&&Math.abs(dx)<250){jumping=true;age=0;}
   if(jumping){age+=1/120;input.jump=!(age>.37&&age<.39);}
   stepAdventure(s,input,1/120);
   if(p.ground===s.platforms.indexOf(q)){arrived=true;break;}
   if(jumping&&age>2.5&&p.ground!==null)jumping=false;
  }
  expect(arrived,'unreachable gallery '+q.x+' / Hexy '+s.player.x+','+s.player.y).toBe(true);
 }
 for(let i=0;i<120*24&&s.player.x<s.level.arena.entry;i++)stepAdventure(s,{right:true,attack:true},1/120);
 expect(s.player.y).toBeCloseTo(s.level.arena.y,0);expect(s.player.x).toBeGreaterThan(s.level.arena.left);expect(s.castleInside).toBe(true);expect(s.checkpointAt).toBeUndefined();
});
test('scarecrow ambushes warn before spawning and each trigger fires once',()=>{
 const s=createAdventure(8),a=s.actTwoAmbushes[0];s.enemies=[];s.player.hurt=999;s.player.x=a.x-200;tick(s,.2);expect(s.enemies).toHaveLength(0);expect(a.warning).toBeGreaterThan(0);tick(s,1.4);expect(s.enemies.filter(e=>e.type===29)).toHaveLength(2);tick(s,3);expect(s.enemies).toHaveLength(2);
});
test('the Straw King reconstructs once, and destroying the piles prevents healing',()=>{
 for(const destroy of [true,false]){const s=battle(8),b=s.boss;b.vulnerable=true;damageActTwoBoss(s,10000);expect(b.hp).toBe(b.maxHp/2);tick(s,2.2);expect(b.stage).toBe(2);expect(b.phase).toBe('rebuild');expect(s.clear).toBeFalsy();if(destroy)for(const q of s.strawPiles)hitActTwoObjects(s,{x:q.x,y:q.y-30,life:1,damage:20,heavy:true},40);tick(s,3.5);expect(b.rebuilt).toBe(true);expect(b.hp).toBe(b.maxHp/2+(destroy?0:24));expect(b.phase).not.toBe('rebuild');}
});
test('the Count turns into bats, crosses the arena, then returns vulnerable within bounds',()=>{
 const s=battle(9),b=s.boss;Object.assign(b,{phase:'patrol',timer:0,turn:1});tick(s,.1);expect(b.move).toBe('swarm');const x=b.x;tick(s,1);expect(b.phase).toBe('swarm');tick(s,2);expect(b.phase).toBe('recover');expect(b.vulnerable).toBe(true);expect(Math.abs(b.x-x)).toBeGreaterThan(100);expect(b.x).toBeGreaterThan(s.level.arena.left);
});
test('harlequin phase boundaries survive huge attacks and keep all three phases without obstructing the open floor',()=>{
 const s=battle(10),b=s.boss;
 for(const stage of [2,3]){b.vulnerable=true;damageActTwoBoss(s,10000);expect(b.hp).toBeCloseTo(b.maxHp*(4-stage)/3,5);tick(s,.1);expect(b.phase).toBe('transform');expect(s.clear).toBeFalsy();tick(s,2.1);expect(b.stage).toBe(stage);expect(s.dreamPlatforms.filter(q=>!q.gone)).toHaveLength(0);expect(s.platforms.filter(q=>q.kind==='earth').every(q=>q.y===480)).toBe(true);}
 b.vulnerable=true;damageActTwoBoss(s,10000);tick(s,1);expect(s.clear).toBeFalsy();tick(s,2.1);expect(b.defeat.ready).toBe(true);expect(s.clear).toBeTruthy();tick(s,15);expect(s.won).toBe(true);
});
test('floor nightmares give over a second of warning and always leave a safe lane',()=>{
 const s=battle(10),b=s.boss;Object.assign(b,{phase:'patrol',timer:0,turn:2});s.player.hurt=0;tick(s,.1);expect(s.dreamHazards).toHaveLength(3);expect(s.dreamHazards.filter(q=>q.safe)).toHaveLength(1);const danger=s.dreamHazards.find(q=>!q.safe);s.player.x=danger.x+danger.w/2;const hp=s.hearts;tick(s,1);expect(s.hearts).toBe(hp);tick(s,.5);expect(s.hearts).toBe(hp-1);
});
test('strong player shots intercept new magic across all three chapters',()=>{
 for(const id of [8,9,10]){const s=createAdventure(id);s.enemies=[];s.supplies=[];s.player.hurt=999;s.player.x=300;enemyShot(s,440,440,Math.PI,30,'act-two-orb',{actTwo:true,r:12});s.shots.push({x:400,y:440,vx:300,vy:0,r:30,damage:4,kind:-1,heavy:true,powerClear:true,life:1,age:0,hits:[]});tick(s,.2);expect(s.hostile).toHaveLength(0);}
});
test('scarecrows, vampires, armor and bats commit their aim and launch damageable real attacks',()=>{
 for(const type of [29,30,31,32]){
  const s=createAdventure(8),e=makeEnemy(type===31?430:560,type===32?400:480,type);s.enemies=[e];s.damage=()=>{};s.player.x=300;e.timer=0;
  for(let i=0;i<30;i++)updateEnemies(s,1/120,playerBody,()=>{});
  expect(s.hostile.length).toBe(type===32?1:0);const aim=e.aim&&{...e.aim};s.player.x=280;
  for(let i=0;i<110;i++)updateEnemies(s,1/120,playerBody,()=>{});
  expect(s.hostile.length).toBeGreaterThan(0);expect(s.hostile.every(q=>q.life>0&&Number.isFinite(q.vx+q.vy))).toBe(true);if(aim)expect(e.aim).toEqual(aim);
 }
});
test('every new boss can be defeated with the real basic wand throughout its phase transitions',()=>{
 for(const id of [8,9,10]){
  const s=battle(id),b=s.boss;const stages=new Set();s.supplies=[];
  for(let i=0;i<120*180&&!s.clear;i++){
   s.player.hurt=999;const dx=b.x-s.player.x,aim=dx>0?1:-1;
   stepAdventure(s,{attack:true,right:dx>270||s.player.dir!==aim&&dx>0,left:dx< -270||s.player.dir!==aim&&dx<0,up:b.y<s.player.y-180},1/120);stages.add(b.stage);
  }
  expect(b.hp,'wand could not defeat '+id+' / '+b.phase+' / HP '+b.hp).toBe(0);expect(stages.size).toBe(id===10?3:2);expect(s.clear).toBeTruthy();
 }
});
test('each mini boss finishes after its defeat animation and progression can continue',()=>{
 for(const id of [8,9]){const s=battle(id),b=s.boss;b.stage=2;b.vulnerable=true;damageActTwoBoss(s,999);tick(s,.5);expect(s.clear).toBeFalsy();tick(s,3);expect(b.defeat.ready).toBe(true);expect(s.clear).toBeTruthy();tick(s,15);expect(s.done).toBe(true);expect(s.won).toBe(true);}
});
for(const id of [8,9,10])test('actual chapter picker starts '+(id-5)+' of act 2 with working art, audio and controls',async({page})=>{
 test.setTimeout(90000);const errors=[];page.on('pageerror',e=>errors.push(e.message));const missing=[];page.on('response',r=>{if(r.status()>=400&&r.url().includes('/arcade/'))missing.push(r.url());});
 await page.goto('/arcade');await openAdventureMenu(page);await page.getByRole('button',{name:/Elegir capítulo/}).click();await expect(page.locator(`[data-level-choice="${id}"]`)).toContainText('2-'+(id-5));await page.locator(`[data-level-choice="${id}"]`).click();await page.locator('[data-practice]').click();await page.locator('[data-chapter-intro]').click();
 const canvas=page.locator('[data-adventure-canvas]');await expect.poll(async()=>Number(await canvas.getAttribute('data-sim-frame'))).toBeGreaterThan(80);const x=Number(await canvas.getAttribute('data-player-x'));await page.keyboard.down('ArrowRight');await page.keyboard.down('KeyZ');await page.waitForTimeout(1200);await page.keyboard.up('ArrowRight');await page.keyboard.up('KeyZ');expect(Number(await canvas.getAttribute('data-player-x'))).toBeGreaterThan(x+70);
 fs.mkdirSync('tests/artifacts/arcade/act-two',{recursive:true});await canvas.screenshot({path:`tests/artifacts/arcade/act-two/start-${id}.png`});expect(errors).toEqual([]);expect(missing).toEqual([]);
});
