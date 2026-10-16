import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {createAdventure,stepAdventure,adventureCarry} from '../src/components/arcade/adventure/engine/adventureModel';
import {cycleShotMode,equipDrink,activeWeapon} from '../src/components/arcade/adventure/engine/adventureAmmo';
import {configureDrinkShot} from '../src/components/arcade/adventure/engine/adventureCreativeDrinks';
import {makeEnemy,ENEMY_HEALTH_MULTIPLIER} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {enemyGeometry} from '../src/components/arcade/adventure/actors/enemies/adventureEnemyGeometry';
import {fortSystems} from '../src/components/arcade/adventure/actors/bosses/adventureEmberFort';
import {fortVents,fortVentRig} from '../src/components/arcade/adventure/actors/bosses/fortVents';
import {enemyDrawing} from '../src/components/arcade/adventure/render/adventureSprites';
import {windFrame} from '../src/components/arcade/adventure/render/windClothCanvas';
import {endRibbonDance} from '../src/components/arcade/adventure/engine/adventureRibbonState';
import {openAdventureMenu} from './arcade-input.helpers';
const dir='tests/artifacts/arcade/painted-machinery/';
const tick=(s,n,input={})=>{for(let i=0;i<n;i++)stepAdventure(s,input,1/120);};
function quiet(index=0){const s=createAdventure(index);for(const key of ['enemies','outposts','supplies','stars','cages','hazards'])s[key]=[];s.noticeTime=0;s.player.hurt=999;return s;}
test('single drink alternates to unlimited basic shots and a basic special without consuming its stored ammo',()=>{
 const s=quiet();equipDrink(s,9,29,2,84);expect(cycleShotMode(s)).toBe(true);expect(activeWeapon(s)).toBe(-1);tick(s,70,{attack:true});
 expect(s.ammo).toBe(29);expect(s.weapon).toBe(9);expect(s.voltBeam).toBeNull();expect(s.shots.some(q=>q.kind===-1)).toBe(true);
 tick(s,30);const magic=s.magic;tick(s,1,{special:true});expect(s.events).toContain('basicStrong');expect(s.magic).toBeCloseTo(magic-17.25);expect(s.ammo).toBe(29);
 tick(s,90);expect(cycleShotMode(s)).toBe(true);expect(activeWeapon(s)).toBe(9);expect(s.drinkTier).toBe(2);expect(s.ammoCapacity).toBe(84);
});
test('two drinks cycle through the basic shot, keeping both flavors, capacities and remaining ammo',()=>{
 const s=quiet();s.modCategorySlots={drinks:2};equipDrink(s,5,31,2,168);s.spareDrink={kind:10,ammo:19,tier:1,capacity:48};
 expect(cycleShotMode(s)).toBe(true);expect(activeWeapon(s)).toBe(10);s.swapWait=0;expect(cycleShotMode(s)).toBe(true);expect(activeWeapon(s)).toBe(-1);
 expect(s.ammo).toBe(19);expect(s.spareDrink.ammo).toBe(31);const next=createAdventure(1,false,adventureCarry(s));expect(next.basicFire).toBe(true);expect(next.ammo).toBe(19);
 s.swapWait=0;expect(cycleShotMode(s)).toBe(true);expect(activeWeapon(s)).toBe(5);expect(s.ammo).toBe(31);expect(s.drinkTier).toBe(2);expect(s.spareDrink.ammo).toBe(19);
});
test('temporary Ribbon uses its own attacks and restores the previously selected basic mode',()=>{
 const s=quiet();equipDrink(s,5,30);cycleShotMode(s);expect(activeWeapon(s)).toBe(-1);equipDrink(s,12);expect(activeWeapon(s)).toBe(12);expect(cycleShotMode(s)).toBe(false);
 endRibbonDance(s);expect(activeWeapon(s)).toBe(-1);expect(s.weapon).toBe(5);expect(s.ammo).toBe(30);
});
for(const kind of [3,4,5,6,7,10])test(`downward weapon ${kind} crosses a bridge and damages the crew boat below`,()=>{
 const s=quiet(2),deck=s.platforms.find(q=>q.bridge&&q.w>400),x=deck.x+deck.w*.4;s.player.x=x;s.player.y=deck.y;s.player.ground=s.platforms.indexOf(deck);
 const e=makeEnemy(x,deck.y,9);s.enemies=[e];tick(s,1);
 const q=configureDrinkShot({kind,x,y:deck.y-58,vx:0,vy:kind===7?1120:620,r:12,age:0,life:2,damage:3,hits:[],hitTimes:new Map(),scale:1,heavy:kind===3||kind===4,aimX:0,aimY:1});s.shots=[q];
 tick(s,90);expect(e.hp).toBeLessThan(e.maxHp);expect(q.bounces||0).toBe(0);
});
test('crew boats grow exactly fifteen percent and survive more basic hits',()=>{
 const e=makeEnemy(100,600,9),g=enemyGeometry(e);expect(g.size).toBeCloseTo(160*.8*1.15);expect(g.w).toBeCloseTo(132*.8*1.15);expect(e.maxHp).toBeGreaterThan(8*ENEMY_HEALTH_MULTIPLIER);
});
test('both integrated fortress mouths face the playable side and share their painted mounting',()=>{
 const s=quiet(5);s.boss.coreOpened=true;s.boss.assemblyAge=3;const p=fortSystems(s);p.wall.hp=p.gate.hp=0;
 for(const v of fortVents(s)){v.deploy=1;v.angle=-.2;const m=fortVentRig(s,v);expect(v.dir).toBe(-1);expect(Math.cos(m.angle)).toBeLessThan(0);expect(m.mouth.x).toBeLessThan(m.x);}
 const mouths=fortVents(s).map(v=>fortVentRig(s,v).mouth);expect(mouths[1].y-mouths[0].y).toBeGreaterThan(100);
});
test('the agile blue harlequin uses eight alternating run poses',()=>{
 const e=makeEnemy(100,480,1);e.phase='patrol';const frames=[];for(let i=0;i<8;i++){e.gait=i/8;const q=enemyDrawing(e);expect(q.key).toBe('acrobat-run-fluid');frames.push(q.frame);}expect(new Set(frames).size).toBe(8);
});
test('authored wind sprites remain visible throughout negative camp coordinates',()=>{
 for(const x of [-5000,-3370,-900,0,1000])for(const t of [0,.1,1,5,20])expect([0,1,2,3]).toContain(windFrame(t,x));
});
test('the blue harlequin keeps airborne art through preparation, flight and landing',()=>{
 const e=makeEnemy(100,480,4),frames=[];
 for(const state of [{acrobatCrouch:.1},{acrobatCrouch:0,acrobatAir:true,acrobatAge:0,vy:-435},{acrobatAge:.2,vy:-250},{acrobatAge:.45,vy:0},{acrobatAge:.62,vy:200,y:390},{acrobatAge:.8,y:440},{acrobatAir:false,landing:.16},{landing:.05}]){Object.assign(e,state);const q=enemyDrawing(e);expect(q.key).toBe('acrobat-air-painted');frames.push(q.frame);}expect(new Set(frames).size).toBe(8);
});
test('keyboard, controller R3 and HUD button alternate basic shots without spending the carried drink',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{window.modePad={id:'Xbox shot mode review',index:0,connected:true,mapping:'standard',axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};Object.defineProperty(navigator,'getGamepads',{value:()=>[window.modePad]});});
 await page.route('**/src/components/arcade/adventure/engine/adventureModel.js*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('s.spareDrink=validSpare(carry.spareDrink);','s.spareDrink=validSpare(carry.spareDrink);if(!carry.trial)window.shotModeScene=s;')});});
 await page.goto('/arcade');await openAdventureMenu(page);await page.locator('[data-practice]').click();await expect(page.locator('[data-hexy-adventure]')).toHaveAttribute('data-phase','playing');
 await page.evaluate(async()=>{const {equipDrink}=await import('/src/components/arcade/adventure/engine/adventureAmmo.js');const s=window.shotModeScene;equipDrink(s,5,30);s.player.drinkCast=0;s.player.hurt=999;s.enemies=[];s.supplies=[];s.outposts=[];});
 const canvas=page.locator('[data-adventure-canvas]');await page.keyboard.press('KeyQ');await expect(canvas).toHaveAttribute('data-shot-mode','basic');await expect(page.locator('[data-basic-shot]')).toBeVisible();
 await page.keyboard.down('KeyZ');await page.waitForTimeout(900);await page.keyboard.up('KeyZ');expect(await page.evaluate(()=>window.shotModeScene.ammo)).toBe(30);
 await page.keyboard.press('KeyQ');await expect(canvas).toHaveAttribute('data-shot-mode','drink');await page.waitForTimeout(350);
 await page.evaluate(()=>{window.modePad.buttons[11]={pressed:true,value:1};});await expect(canvas).toHaveAttribute('data-shot-mode','basic');await page.evaluate(()=>{window.modePad.buttons[11]={pressed:false,value:0};});
 await page.waitForTimeout(350);await page.locator('[data-swap-drink]').click();await expect(canvas).toHaveAttribute('data-shot-mode','drink');expect(await page.evaluate(()=>window.shotModeScene.ammo)).toBe(30);
 fs.mkdirSync(dir,{recursive:true});await page.screenshot({path:dir+'shot-mode-ui.png'});expect(errors).toEqual([]);
});

test('record painted deployment, forward fire, stamping, dust, crews, cloth and agile running',async({page})=>{
 test.setTimeout(210000);fs.mkdirSync(dir,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
 await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/';
  const w=window.machineReview=Object.assign({},...await Promise.all(['engine/adventureModel.js','actors/bosses/adventureEmberFort.js','actors/bosses/fortVents.js','actors/enemies/adventureEnemies.js','engine/adventureAmmo.js','actors/bosses/harlequinUltimate.js','render/adventureCanvas.js','render/adventureCamera.js','world/adventureTerrain.js'].map(p=>import(root+p))));
  w.art=await w.loadAdventureArt();w.c=document.createElement('canvas');w.c.id='machine-review';w.c.style='position:fixed;inset:0;z-index:99999;width:1440px;height:810px';document.body.append(w.c);
  w.scene=(index,move)=>{const s=w.s=w.createAdventure(index),a=s.level.arena;for(const key of ['enemies','outposts','supplies','stars','cages','hazards'])s[key]=[];s.arenaLocked=true;s.noticeTime=0;
   Object.assign(s.player,{x:index===2?a.left+480:31300,y:a.y,hurt:999,ground:s.platforms.indexOf(w.groundAt(s.platforms,index===2?a.left+480:31300))});
   Object.assign(s.boss,{x:index===2?a.right-400:s.boss.x,engaged:true,phase:'warn',move,timer:1.1,targetX:s.player.x,vulnerable:true});
   for(let i=0;i<700;i++)w.followAdventureCamera(s,1/120);return s;
  };
  w.paint=()=>w.renderAdventure(w.c,w.s,w.art);
  w.advance=n=>{for(let i=0;i<n;i++)w.stepAdventure(w.s,{},1/120);w.paint();};
  w.record=async seconds=>{const chunks=[],stream=w.c.captureStream(30),rec=new MediaRecorder(stream,{mimeType:'video/webm'});const result=new Promise(resolve=>{rec.ondataavailable=e=>chunks.push(e.data);rec.onstop=()=>{const r=new FileReader();r.onload=()=>resolve(String(r.result).split(',')[1]);r.readAsDataURL(new Blob(chunks,{type:'video/webm'}));};});rec.start();
   let last,start,acc=0;await new Promise(resolve=>{const frame=now=>{start??=now;last??=now;acc+=Math.min(.05,(now-last)/1000);last=now;while(acc>=1/120){w.stepAdventure(w.s,w.keys||{},1/120);acc-=1/120;}w.paint();if(now-start<seconds*1000)requestAnimationFrame(frame);else resolve();};requestAnimationFrame(frame);});rec.stop();const data=await result;stream.getTracks().forEach(t=>t.stop());return data;};
 });
 const shot=async name=>{await page.evaluate(()=>window.machineReview.paint());await page.locator('#machine-review').screenshot({path:dir+name+'.png'});};

 for(const name of ['fort-deploy','fort-forward-fire','fort-ground-stamp','fort-dust-collapse','barge-integrated-drum','barge-integrated-pump','camp-sprite-wind','blue-harlequin-run','river-crew-size'].filter(name=>!process.env.HEXY_PAINTED_REVIEW||process.env.HEXY_PAINTED_REVIEW.split(',').includes(name))){
  await page.evaluate(name=>{const w=window.machineReview;w.keys={};w.scene(name.startsWith('barge')||name.startsWith('river')?2:name.startsWith('camp')||name.startsWith('blue')?3:5,name.includes('pump')?'jet':name.startsWith('barge')?'drumroll':'salvo');
   if(name.startsWith('fort')&&!name.includes('collapse')){const s=w.s,p=w.fortSystems(s);p.wall.hp=p.gate.hp=0;s.boss.coreOpened=true;s.boss.assemblyAge=3;for(const v of w.fortVents(s))v.deploy=1;
    if(name==='fort-deploy'){s.boss.coreOpened=false;s.boss.phase='recover';s.boss.timer=0;}
    if(name==='fort-forward-fire'){s.boss.move='vent';s.boss.timer=1.3;}
    if(name==='fort-ground-stamp'){p.upper.hp=p.lower.hp=0;for(const v of w.fortVents(s))v.hp=0;Object.assign(s.boss,{phase:'recover',timer:0,turn:0});}
   }
   if(name==='fort-dust-collapse')w.s.boss.hp=0;
   if(name.startsWith('camp')||name.startsWith('blue')){const s=w.s=w.createAdventure(3);s.enemies=[];s.supplies=[];s.outposts=[];s.stars=[];s.noticeTime=0;s.campTents.forEach(q=>q.crew=[]);Object.assign(s.player,{x:-3370,y:w.groundY(s.platforms,-3370),hurt:999,ground:s.platforms.indexOf(w.groundAt(s.platforms,-3370))});if(name.startsWith('blue')){const e=w.makeEnemy(-3100,w.groundY(s.platforms,-3100),1);e.timer=100;s.enemies=[e];}for(let i=0;i<800;i++)w.followAdventureCamera(s,1/120);}
   if(name.startsWith('river')){const s=w.s=w.createAdventure(2),deck=s.platforms.find(q=>q.bridge&&q.w>400),x=deck.x+deck.w*.4;s.enemies=[w.makeEnemy(x,deck.y,9),w.makeEnemy(x+310,deck.y,9,1)];s.outposts=[];s.supplies=[];s.stars=[];s.noticeTime=0;Object.assign(s.player,{x:x-160,y:deck.y,hurt:999,ground:s.platforms.indexOf(deck)});for(let i=0;i<800;i++)w.followAdventureCamera(s,1/120);}
  },name);
  await shot(name+'-before');const data=await page.evaluate(seconds=>window.machineReview.record(seconds),name==='fort-dust-collapse'?4.25:3.8);fs.writeFileSync(dir+name+'.webm',Buffer.from(data,'base64'));await shot(name+'-after');
 }
 expect(errors).toEqual([]);
});
