import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {openAdventureMenu} from './arcade-input.helpers';
import {createAdventure,stepAdventure,retryAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {harborAmbushStatus} from '../src/components/arcade/adventure/engine/adventureHarborAmbush';
import {makeEnemy} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {enemyBody} from '../src/components/arcade/adventure/actors/enemies/adventureEnemyGeometry';
import {zeppelinMuzzle,ZEPPELIN_WIDTH} from '../src/components/arcade/adventure/actors/enemies/adventureZeppelin';
const tick=(s,n,input={})=>{for(let i=0;i<n;i++)stepAdventure(s,input,1/120);};
function setup(){
 const s=createAdventure(2);for(const k of ['enemies','outposts','supplies','hazards','stars','cages'])s[k]=[];
 const room=s.level.harborAmbush;Object.assign(s.player,{x:room.trigger-10,y:room.y,ground:s.platforms.findIndex(p=>p.x===room.left),hurt:1000});
 s.camera={x:room.trigger-310,y:75,backdropY:75,zoom:1};return s;
}
function enter(s){s.player.x=s.level.harborAmbush.trigger;tick(s,1);}

test('the second bridge locks the camera and player until both staggered waves are defeated',()=>{
 const s=setup(),room=s.level.harborAmbush;tick(s,120);expect(s.harborAmbush.state).toBe('waiting');expect(s.enemies).toHaveLength(0);
 enter(s);expect(harborAmbushStatus(s)).toEqual({wave:1,total:2,remaining:3});expect(s.enemies).toHaveLength(0);
 tick(s,90);expect(s.enemies).toHaveLength(1);tick(s,420,{right:true,jump:true,dash:true});
 expect(s.player.x).toBe(room.right-24);expect(s.enemies.filter(e=>e.harborAmbush)).toHaveLength(3);
 const camera={...s.camera};tick(s,600,{left:true});expect(s.player.x).toBe(room.left+24);expect(s.camera.x).toBe(room.left);expect(Math.abs(s.camera.zoom-camera.zoom)).toBeLessThan(.001);
 expect(s.boss.phase).toBe('sleep');expect(s.arenaLocked).toBe(false);
 const defeated=[];
 for(let frame=0;frame<1800&&s.harborAmbush.state!=='cleared';frame++){
  for(const e of s.enemies.filter(e=>e.harborAmbush&&e.hp>0)){
   // Exercise the normal projectile collision/defeat path, including wrecks.
   const b=enemyBody(e);s.shots.push({x:b.x+b.w/2,y:b.y+b.h/2,vx:0,vy:0,r:12,life:1,age:0,kind:-1,damage:100,hits:[]});defeated.push(e);
  }
  tick(s,1);
 }
 expect(s.harborAmbush.state).toBe('cleared');expect(new Set(defeated).size).toBe(7);expect(defeated.every(e=>e.defeated)).toBe(true);
 expect(new Set(defeated.map(e=>e.type))).toEqual(new Set([8,9,7]));expect(harborAmbushStatus(s)).toBeNull();
 s.player.x=room.right-24;tick(s,200,{right:true});expect(s.player.x).toBeGreaterThan(room.right+200);expect(s.camera.x).toBeGreaterThan(room.left+100);
 s.player.x=room.trigger;tick(s,480);expect(s.enemies.some(e=>e.harborAmbush&&e.hp>0)).toBe(false);
});

test('ambush resets on retry, respects later checkpoints and pauses during a super',()=>{
 const s=setup();enter(s);tick(s,320);const before={...s.harborAmbush};
 stepAdventure(s,{super:true},1/120);expect(s.superCinematic).toBeTruthy();tick(s,20);expect(s.harborAmbush).toEqual(before);
 s.checkpointAt=[4530,500];retryAdventure(s);expect(s.harborAmbush.state).toBe('waiting');expect(s.enemies.some(e=>e.harborAmbush)).toBe(false);
 enter(s);tick(s,90);expect(s.enemies.filter(e=>e.harborAmbush)).toHaveLength(1);
 s.checkpointAt=[12880,490];retryAdventure(s);tick(s,10);expect(s.harborAmbush.state).toBe('cleared');expect(s.enemies.some(e=>e.harborAmbush)).toBe(false);
});

test('the ambush zeppelin turns, aims from the visible side, fires and never escapes',()=>{
 const s=setup();enter(s);s.harborAmbush.wave=1;s.harborAmbush.age=0;s.harborAmbush.next=0;tick(s,270);
 const e=s.enemies.find(e=>e.type===7);expect(e).toBeTruthy();let turns=0,leftShots=0,rightShots=0;
 for(let i=0;i<6000;i++){
  s.player.x=(s.level.harborAmbush.left+s.level.harborAmbush.right)/2;s.player.y=460;s.player.vy=0;
  const dir=e.dir,previous=new Set(s.hostile);tick(s,1);if(e.dir!==dir)turns++;
  const m=zeppelinMuzzle(e);expect((m.x-e.x)*e.dir).toBeCloseTo(ZEPPELIN_WIDTH*.39);
  for(const q of s.hostile.filter(q=>q.kind==='red-pellet'&&!previous.has(q))){if(q.vx<0)leftShots++;else rightShots++;expect(Math.sign(q.vx)).toBe(e.dir);}
 }
 expect(turns).toBeGreaterThan(7);expect(leftShots).toBeGreaterThan(2);expect(rightShots).toBeGreaterThan(2);expect(e.hp).toBeGreaterThan(0);expect(e.escaped).toBeUndefined();
});

test('a running diver faces its travel, then stops and faces Hexy to fire',()=>{
 const s=setup();s.player.x=2780;s.player.y=465;s.player.ground=2;const e=makeEnemy(3180,465,8);s.enemies=[e];let left=0,right=0,volleys=0;
 for(let i=0;i<4000;i++){
  const x=e.x;tick(s,1);const dx=e.x-x;
  if(e.phase==='patrol'&&Math.abs(dx)>.001){expect(e.dir).toBe(Math.sign(dx));if(dx<0)left++;else right++;}
  if(e.phase==='attack'){expect(e.x).toBe(x);expect(e.dir).toBe(Math.sign(s.player.x-e.x));volleys++;}
 }
 expect(left).toBeGreaterThan(100);expect(right).toBeGreaterThan(100);expect(volleys).toBeGreaterThan(100);
});

for(const width of [1440,390])test(`${width}: chapter cards use consistent art, status and keyboard focus`,async({page})=>{
 fs.mkdirSync('tests/artifacts/arcade/harbor-ambush',{recursive:true});await page.setViewportSize({width,height:width===390?844:900});
 await page.goto('/arcade');await openAdventureMenu(page);
 if(width===1440)await page.evaluate(()=>{const key='magic-drink-arcade-v1';localStorage.setItem(key,JSON.stringify({version:1,economy:2,adventureUnlocked:3,adventureCleared:[0,1]}));window.dispatchEvent(new StorageEvent('storage',{key}));});
 await page.getByRole('button',{name:/Elegir capítulo/}).click();
 const dialog=page.locator('[data-chapter-picker]'),cards=dialog.locator('[data-level-choice]');await expect(cards).toHaveCount(6);await expect(cards.first()).toBeFocused();
 await expect(dialog.getByRole('heading',{name:'¿A dónde vamos?'})).toBeVisible();
 const report=await cards.evaluateAll(nodes=>nodes.map(n=>({height:n.getBoundingClientRect().height,text:n.querySelector('small').textContent,font:getComputedStyle(n.querySelector('small')).fontFamily,background:getComputedStyle(n).backgroundImage,preview:getComputedStyle(n.querySelector('img').parentElement).backgroundColor})));
 expect(new Set(report.map(r=>r.height)).size).toBe(1);expect(report.every(r=>['Completado','Disponible','Práctica'].includes(r.text))).toBe(true);
 expect(report.every(r=>r.font.includes('BakeSoda')&&!r.background.includes('price-tag')&&r.preview!=='rgba(0, 0, 0, 0)')).toBe(true);
 if(width===1440)expect(report.map(r=>r.text)).toEqual(['Completado','Completado','Disponible','Disponible','Disponible','Práctica']);
 await dialog.screenshot({path:`tests/artifacts/arcade/harbor-ambush/chapters-${width}.jpg`});
 await page.keyboard.press('Shift+Tab');await expect(dialog.getByRole('button',{name:'Volver',exact:true})).toBeFocused();await page.keyboard.press('Tab');await expect(cards.first()).toBeFocused();
 await cards.nth(2).click();await expect(dialog).toHaveCount(0);await expect(page.locator(width===1440?'[data-start-adventure]':'[data-practice]')).toBeFocused();
 await page.getByRole('button',{name:/Elegir capítulo/}).click();await expect(cards.nth(2)).toBeFocused();
 const selected=await cards.nth(2).boundingBox(),bounds=await dialog.boundingBox();expect(selected.x).toBeGreaterThanOrEqual(bounds.x);expect(selected.x+selected.width).toBeLessThanOrEqual(bounds.x+bounds.width);
});
