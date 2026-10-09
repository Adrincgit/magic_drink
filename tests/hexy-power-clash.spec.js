import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import sharp from 'sharp';
import {createAdventure,stepAdventure,retryAdventure,playerBody} from '../src/components/arcade/adventure/engine/adventureModel';
import {beginHarlequinUltimate,HARLEQUIN_ULTIMATE,ultimateBeamGeometry,checkUltimateHit} from '../src/components/arcade/adventure/actors/bosses/harlequinUltimate';
import {harlequinDrawing} from '../src/components/arcade/adventure/actors/bosses/adventureHarlequin';
import {clashInputHint} from '../src/components/arcade/adventure/input/clashInput';
import {readAdventureGamepad} from '../src/components/arcade/adventure/input/adventureGamepad';
import {openAdventureMenu} from './arcade-input.helpers';
const folder='tests/artifacts/arcade/power-clash/';
function battle(){const s=createAdventure(3),a=s.level.arena;s.supplies=[];s.stars=[];s.shots=[];s.arenaLocked=true;Object.assign(s.player,{x:a.left+260,y:a.y,ground:2});Object.assign(s.boss,{phase:'recover',timer:100,engaged:true,vulnerable:true,stage:3,hp:240,turn:3,ultimateCooldown:0});return s;}
const tick=(s,n,input={})=>{for(let i=0;i<n;i++)stepAdventure(s,input,1/120);};
function charge(s){const ok=beginHarlequinUltimate(s);if(!ok)return false;for(let n=0;n<150&&s.boss.ultimate?.state==='leap';n++)tick(s,1);expect(s.boss.ultimate?.state).toBe('charge');return true;}
function collide(){const s=battle();charge(s);tick(s,80);tick(s,1,{super:true});tick(s,160);expect(s.powerClash?.state).toBe('contest');return s;}
function struggle(s,taps=true){let n=0;while(s.powerClash?.state==='contest'&&n<1900){tick(s,1,{attack:taps&&n%15===0});n++;}return s;}
function aftermath(s){let n=0;while(s.powerClash&&n++<850)tick(s,1);expect(s.powerClash).toBeUndefined();}

test('each phase has its own wear; charge and release use the new gameplay drawings',()=>{
 const s=battle();for(const [stage,key]of [[1,'motion'],[2,'motion-mid'],[3,'motion-final']]){s.boss.stage=stage;expect(harlequinDrawing(s).key).toBe('harlequin-'+key);}
 charge(s);const poses=new Set();for(let i=0;i<4;i++){s.boss.ultimate.age=i/12;poses.add(harlequinDrawing(s).frame);expect(harlequinDrawing(s).key).toBe('harlequin-fire-actions');}expect([...poses]).toEqual([0,1,2,3]);
 s.boss.ultimate.state='fire';const releases=new Set();for(let i=0;i<3;i++){s.fxTime=i/18;releases.add(harlequinDrawing(s).frame);expect(harlequinDrawing(s).key).toBe('harlequin-super-cast');}expect(releases.size).toBe(3);
});

test('ultimate is exclusive to phase three and its cooldown forces ordinary attacks between casts',()=>{
 for(const stage of [1,2]){const s=battle();s.boss.stage=stage;expect(beginHarlequinUltimate(s)).toBe(false);}
 const s=battle();s.boss.timer=0;tick(s,1);expect(s.boss.ultimate.state).toBe('leap');tick(s,860,{left:true});expect(s.boss.ultimate).toBeUndefined();expect(s.boss.ultimateCooldown).toBeGreaterThan(27);
 s.boss.timer=0;tick(s,1);expect(s.boss.phase).toBe('warn');expect(s.boss.move).not.toBe('ultimate');
});

test('charge slows movement without freezing input; release returns immediately to ordinary speed',()=>{
 const s=battle();charge(s);const start=s.player.x;tick(s,120,{right:true});const slow=s.player.x-start;
 expect(slow).toBeGreaterThan(65);expect(slow).toBeLessThan(100);expect(s.boss.ultimate.age).toBeCloseTo(1,3);expect(s.boss.phase).toBe('ultimate-charge');
 tick(s,217);expect(s.boss.ultimate.state).toBe('fire');const before=s.player.x;s.player.hurt=2;tick(s,50,{right:true});expect(s.player.x-before).toBeGreaterThan(80);
});

test('the cast threatens its locked target but jumping or moving behind the caster can evade it',()=>{
 const s=battle();charge(s);tick(s,380);expect(s.hearts).toBe(3);
 const jump=battle();charge(jump);tick(jump,205);tick(jump,110,{jump:true});tick(jump,65,{jump:true});expect(jump.hearts).toBe(5);
 const other=battle();charge(other);other.player.x=other.boss.x+140;tick(other,390);expect(other.hearts).toBe(5);
});

test('ultimate beam follows its painted segment and only inflicts a single hit',()=>{
 const s=battle();charge(s);s.boss.ultimate.state='fire';s.boss.ultimate.age=HARLEQUIN_ULTIMATE.travel+.01;const beam=ultimateBeamGeometry(s);expect(beam.a.x).toBe(s.boss.x-80*.72);let hits=0;
 checkUltimateHit(s,playerBody,()=>hits++);checkUltimateHit(s,playerBody,()=>hits++);expect(hits).toBe(1);
});

test('counter consumes one charge and creates a clash, and holding attack cannot win',()=>{
 const s=collide();expect(s.superCooldown).toBeGreaterThan(79);expect(s.magic).toBeLessThan(100);expect(s.boss.hp).toBe(240);
 for(let i=0;i<800&&s.powerClash?.state==='contest';i++)tick(s,1,{attack:true});expect(s.powerClash.taps).toBe(1);expect(s.powerClash.won).toBe(false);aftermath(s);expect(s.hearts).toBe(1);expect(s.superCinematic).toBeNull();
});

test('sustained rapid presses win a long clash, inflict three Encores and leave the boss exposed',()=>{
 const s=struggle(collide());expect(s.powerClash.won).toBe(true);expect(s.powerClash.contestAge).toBeGreaterThan(12);expect(s.powerClash.contestAge).toBeLessThan(15.02);expect(s.powerClash.taps).toBeGreaterThanOrEqual(95);aftermath(s);expect(s.boss.hp).toBe(48);
 expect(s.boss.vulnerable).toBe(true);expect(s.boss.phase).toBe('recover');expect(s.boss.timer).toBeGreaterThan(2.8);expect(s.superCooldown).toBeGreaterThan(78);expect(s.hearts).toBe(5);
});

test('a late counter during charge still clashes; unavailable magic or cooldown does not create it',()=>{
 const late=battle();charge(late);tick(late,330);tick(late,1,{super:true});expect(late.powerClash?.state).toBe('windup');
 for(const field of ['magic','superCooldown']){const s=battle();s[field]=field==='magic'?0:50;charge(s);tick(s,1,{super:true});expect(s.powerClash).toBeUndefined();expect(s.boss.ultimate.state).toBe('charge');}
});

test('ordinary damage can interrupt a lethal enemy charge without leaving its power effect behind',()=>{
 const s=battle();s.boss.hp=2;charge(s);s.shots.push({x:s.boss.x,y:s.boss.y-90,vx:0,vy:0,damage:2,age:0,life:1,kind:-1,hits:[]});tick(s,3);
 expect(s.boss.hp).toBe(0);expect(s.boss.defeat).toBeTruthy();expect(s.boss.ultimate).toBeUndefined();expect(s.powerClash).toBeUndefined();
});

test('airborne counter holds a coherent casting pose and retry removes the whole clash',()=>{
 const s=battle();charge(s);Object.assign(s.player,{y:350,ground:null,vy:-100});tick(s,1,{super:true});expect(s.superCinematic.airborne).toBe(true);const y=s.player.y;tick(s,150);expect(s.player.y).toBe(y);expect(s.player.superCast).toBeGreaterThan(0);
 s.checkpointAt=[1150,480];retryAdventure(s);expect(s.powerClash).toBeUndefined();expect(s.boss.ultimate).toBeUndefined();expect(s.boss.hp).toBe(720);expect(s.boss.stage).toBe(1);expect(s.superCinematic).toBeUndefined();
});

test('lethal outcomes finish the flight and ground impact before completing death or victory',()=>{
 const s=collide();s.boss.hp=50;struggle(s);aftermath(s);expect(s.boss.hp).toBe(0);tick(s,480);expect(s.boss.defeat.ready).toBe(true);expect(s.clear).toBeTruthy();
 const loss=collide();loss.hearts=4;struggle(loss,false);aftermath(loss);expect(loss.done).toBe(true);expect(loss.won).toBe(false);expect(loss.player.clashFlight.frame).toBe(4);
});

test('input hints match keyboard, touch and the physical left face button of standard controllers',()=>{
 expect(clashInputHint({device:'keyboard',key:'J'})).toBe('J');expect(clashInputHint({device:'touch'})).toBe('TAP');
 for(const [padName,label]of [['Xbox Controller','X'],['DualSense Wireless','□'],['Nintendo Switch Pro','Y']])expect(clashInputHint({device:'gamepad',padName})).toBe(label);
 const pad={connected:true,mapping:'standard',axes:[0,0],buttons:Array.from({length:17},(_,i)=>({pressed:i===2}))};expect(readAdventureGamepad(pad).attack).toBe(true);
});

test('all ultimate frames keep full transparent silhouettes and common foot registration',async()=>{
 const src='public/arcade/sprites/bosses/harlequin/ultimate.webp';const img=sharp(src),m=await img.metadata();expect([m.width,m.height,m.hasAlpha]).toEqual([2048,1024,true]);
 for(let i=0;i<8;i++){const {data}=await img.clone().extract({left:i%4*512,top:Math.floor(i/4)*512,width:512,height:512}).raw().toBuffer({resolveWithObject:true});let count=0,bottom=0;
  for(let y=0;y<512;y++)for(let x=0;x<512;x++)if(data[(y*512+x)*4+3]>80){count++;bottom=Math.max(bottom,y);}expect(count).toBeGreaterThan(40000);expect(bottom).toBeGreaterThanOrEqual(487);expect(bottom).toBeLessThan(491);
 }
});

async function prepareUI(page,hearts=5){
 await page.route('**/src/components/arcade/adventure/engine/adventureModel.js*',async route=>{
  const response=await route.fetch(),source=await response.text();
  const target='bindCarriedBunnies(s);';expect(source).toContain(target);
  const inject="if(index===3){s.player.x=1500;s.player.y=480;s.player.ground=2;s.arenaLocked=true;s.stars=[];s.supplies=[];Object.assign(s.boss,{phase:'recover',timer:1.2,engaged:true,vulnerable:true,stage:3,hp:180,turn:3,ultimateCooldown:0});}";
  await route.fulfill({response,body:source.replace(target,inject+`if(index===3){s.hearts=${hearts};s.checkpointAt=null;}`+target)});
 });
 await page.goto('/arcade');await openAdventureMenu(page);await page.getByRole('button',{name:/Elegir cap/}).click();await page.locator('[data-level-choice="3"]').click();await page.locator('[data-practice]').click();
 await expect(page.locator('[data-hexy-adventure]')).toHaveAttribute('data-phase','playing');await expect(page.locator('[data-adventure-canvas]')).toHaveAttribute('data-boss-phase','ultimate-charge',{timeout:15000});
}

test('the real keyboard and touch prompt count taps, change labels and stay within the screen',async({page})=>{
 fs.mkdirSync(folder,{recursive:true});await prepareUI(page);await page.keyboard.press('KeyR');const c=page.locator('[data-adventure-canvas]');await expect(c).toHaveAttribute('data-power-clash','contest');
 const button=page.locator('[data-clash-tap]');await expect(button).toBeVisible();await expect(page.locator('[data-clash-key]')).toHaveText('Z');
 await page.keyboard.press('KeyJ');await expect(page.locator('[data-clash-key]')).toHaveText('J');await expect.poll(async()=>Number(await c.getAttribute('data-clash-taps'))).toBe(1);
 // Different devices still share the intentional 75 ms input-rate cap.
 await page.waitForTimeout(100);await button.click();await expect(page.locator('[data-clash-key]')).toHaveText('TAP');await expect.poll(async()=>Number(await c.getAttribute('data-clash-taps'))).toBe(2);
 const screen=await page.locator('[data-game-screen]').boundingBox(),box=await button.boundingBox();expect(box.x).toBeGreaterThan(screen.x);expect(box.x+box.width).toBeLessThan(screen.x+screen.width);expect(box.y+box.height).toBeLessThan(screen.y+screen.height);
 await page.locator('[data-game-screen]').screenshot({path:folder+'actual-prompt.jpg'});
});

test('a lethal clash reaches the actual defeat screen with Hexy lying down until retry',async({page})=>{
 fs.mkdirSync(folder,{recursive:true});await prepareUI(page,4);await page.keyboard.press('KeyR');
 const root=page.locator('[data-hexy-adventure]'),canvas=page.locator('[data-adventure-canvas]');await expect(canvas).toHaveAttribute('data-power-clash','contest');
 await expect(root).toHaveAttribute('data-phase','result',{timeout:16000});await expect(canvas).toHaveAttribute('data-pose','clash-fall:4');await expect(page.getByRole('heading',{name:'¡Una vez más, Hexy!'})).toBeVisible();
 const frame=await canvas.getAttribute('data-sim-frame');await page.waitForTimeout(400);expect(await canvas.getAttribute('data-sim-frame')).toBe(frame);await expect(canvas).toHaveAttribute('data-pose','clash-fall:4');
 await page.locator('[data-game-screen]').screenshot({path:folder+'lethal-defeat-prone.jpg'});
 await page.locator('[data-retry-checkpoint]').click();await expect(root).toHaveAttribute('data-phase','playing');await expect(canvas).not.toHaveAttribute('data-pose',/^clash-fall:/);
});

test('the actual controller shows its button, supports a clash and pauses safely on disconnect',async({page})=>{
 await page.addInitScript(()=>{window.clashPad={id:'DualSense Wireless Controller',index:0,connected:true,mapping:'standard',axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};Object.defineProperty(navigator,'getGamepads',{value:()=>[window.clashPad]});});
 await prepareUI(page);const button=async(i,down)=>page.evaluate(([i,down])=>{window.clashPad.buttons[i]={pressed:down,value:down?1:0};},[i,down]);
 await button(5,true);const canvas=page.locator('[data-adventure-canvas]');await expect(canvas).toHaveAttribute('data-power-clash','windup');await button(5,false);await expect(canvas).toHaveAttribute('data-power-clash','contest');
 await expect(page.locator('[data-clash-key]')).toHaveText('□');await button(2,true);await page.waitForTimeout(100);await button(2,false);await expect.poll(async()=>Number(await canvas.getAttribute('data-clash-taps'))).toBe(1);
 await page.evaluate(()=>{window.clashPad.connected=false;});await expect(page.locator('[data-hexy-adventure]')).toHaveAttribute('data-phase','paused');const frame=await canvas.getAttribute('data-sim-frame');await page.waitForTimeout(180);expect(await canvas.getAttribute('data-sim-frame')).toBe(frame);
 await page.getByRole('button',{name:/Continuar/}).click();await expect(page.locator('[data-clash-key]')).toBeVisible();await page.keyboard.press('KeyZ');await expect(page.locator('[data-clash-key]')).toHaveText('Z');
});

test('mobile clash prompt fits the canvas and touch presses count as real edges',async({page})=>{
 await page.setViewportSize({width:390,height:844});await prepareUI(page);await page.keyboard.press('KeyR');await expect(page.locator('[data-adventure-canvas]')).toHaveAttribute('data-power-clash','contest');
 const button=page.locator('[data-clash-tap]');await button.click();await expect(page.locator('[data-clash-key]')).toHaveText('TAP');const screen=await page.locator('[data-game-screen]').boundingBox(),box=await button.boundingBox();expect(box.x).toBeGreaterThan(screen.x);expect(box.x+box.width).toBeLessThan(screen.x+screen.width);expect(box.y+box.height).toBeLessThan(screen.y+screen.height);
 await page.locator('[data-game-screen]').screenshot({path:folder+'mobile-prompt.jpg'});
});

test('painted charge, discharge, three stages and opposing spells render in desktop and reduced motion',async({page})=>{
 fs.mkdirSync(folder,{recursive:true});await page.setViewportSize({width:1440,height:810});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/arcade');
 await page.evaluate(async()=>{
  const [{createAdventure,stepAdventure},{loadAdventureArt,renderAdventure},{followAdventureCamera},{beginHarlequinUltimate}]=await Promise.all([import('/src/components/arcade/adventure/engine/adventureModel.js'),import('/src/components/arcade/adventure/render/adventureCanvas.js'),import('/src/components/arcade/adventure/render/adventureCamera.js'),import('/src/components/arcade/adventure/actors/bosses/harlequinUltimate.js')]);
  const art=await loadAdventureArt(),c=document.createElement('canvas');c.id='clash-review';c.style='position:fixed;inset:0;z-index:99999;width:1440px;height:810px';document.body.append(c);
  const scene=()=>{const s=createAdventure(3);s.supplies=[];s.stars=[];s.noticeTime=0;s.arenaLocked=true;Object.assign(s.player,{x:1500,y:480,ground:2});Object.assign(s.boss,{phase:'recover',timer:100,engaged:true,vulnerable:true,stage:3,hp:180});for(let i=0;i<600;i++)followAdventureCamera(s,1/120);window.clashReview.s=s;return s;};
  window.clashReview={art,c,scene,stepAdventure,beginHarlequinUltimate:(s)=>{beginHarlequinUltimate(s);for(let n=0;n<150&&s.boss.ultimate?.state==='leap';n++)stepAdventure(s,{},1/120);},paint:(reduced=false)=>renderAdventure(c,window.clashReview.s,art,{reduced})};scene();
 });
 const c=page.locator('#clash-review');
 for(const stage of [1,2,3]){await page.evaluate(stage=>{const w=window.clashReview;w.s.boss.stage=stage;w.paint();},stage);await c.screenshot({path:folder+'wear-'+stage+'.jpg'});}
 await page.evaluate(()=>{const w=window.clashReview;w.beginHarlequinUltimate(w.s);for(let i=0;i<55;i++)w.stepAdventure(w.s,{},1/120);w.paint();});await c.screenshot({path:folder+'charge-portrait.jpg'});
 await page.evaluate(()=>{const w=window.clashReview;w.stepAdventure(w.s,{super:true},1/120);for(let i=0;i<160;i++)w.stepAdventure(w.s,{},1/120);w.paint();});await c.screenshot({path:folder+'clash-contact.jpg'});
 await page.evaluate(()=>window.clashReview.paint(true));await c.screenshot({path:folder+'reduced-motion.jpg'});
 await page.evaluate(()=>{const w=window.clashReview;w.scene();w.beginHarlequinUltimate(w.s);for(let i=0;i<355;i++)w.stepAdventure(w.s,{},1/120);w.paint();});await c.screenshot({path:folder+'enemy-release.jpg'});expect(errors).toEqual([]);
});
