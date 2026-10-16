import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {createAdventure,stepAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {fortSystems,fortPartHit,fortTargets,fortRig} from '../src/components/arcade/adventure/actors/bosses/adventureEmberFort';
import {fortVents,fortVentRig} from '../src/components/arcade/adventure/actors/bosses/fortVents';
import {emberBlastSize,burstEmberProjectile} from '../src/components/arcade/adventure/engine/adventureEmberBlast';
import {openAdventureMenu} from './arcade-input.helpers';
const dir='tests/artifacts/arcade/machinery-polish/';
const tick=(s,n)=>{for(let i=0;i<n;i++)stepAdventure(s,{},1/120);};
function battle(){const s=createAdventure(5),a=s.level.arena;s.enemies=[];s.outposts=[];s.supplies=[];s.arenaLocked=true;Object.assign(s.player,{x:a.left+500,y:a.y,hurt:999,ground:0});Object.assign(s.boss,{engaged:true,phase:'warn',timer:1.65,move:'vent',coreOpened:true,vulnerable:true});const p=fortSystems(s);p.wall.hp=p.gate.hp=0;return s;}
test('core flamethrowers deploy, aim, take hits and stop firing permanently when destroyed',()=>{
 const s=battle(),v=fortVents(s)[0];expect(v.deploy).toBe(0);expect(fortTargets(s).some(t=>t.part===v.part)).toBe(false);
 tick(s,60);expect(v.deploy).toBeGreaterThan(.4);expect(v.deploy).toBeLessThan(.6);tick(s,155);
 const q=s.hostile.find(q=>q.ventPart===v.part);expect(q).toBeTruthy();expect(v.deploy).toBe(1);expect(fortTargets(s).some(t=>t.part===v.part)).toBe(true);
 expect(q.x).toBeCloseTo(fortVentRig(s,v).mouth.x);expect(Math.cos(q.angle)).toBeLessThan(0);
 const hp=s.boss.hp;fortPartHit(s,v.part,99);tick(s,2);expect(s.boss.hp).toBe(hp);expect(s.hostile.some(q=>q.ventPart===v.part&&q.life>0)).toBe(false);expect(fortTargets(s).some(t=>t.part===v.part)).toBe(false);
});
test('furnace pressure travels to the actual eruption sites before they become damaging',()=>{
 const s=battle();for(const v of fortVents(s))v.hp=0;const parts=fortSystems(s);parts.upper.hp=parts.lower.hp=0;Object.assign(s.boss,{phase:'recover',timer:0,turn:0});tick(s,1);
 const pulse=s.boss.furnacePulse;expect(pulse.targets).toHaveLength(2);expect(pulse.targets[1]-pulse.targets[0]).toBe(290);expect(s.hostile.filter(q=>q.fortSource).map(q=>q.x)).toEqual(pulse.targets);expect(s.hostile.filter(q=>q.fortSource).every(q=>!q.damaging)).toBe(true);
 tick(s,Math.ceil((pulse.duration+.25)*120));expect(s.hostile.some(q=>q.fortSource&&q.damaging)).toBe(true);
});
test('cannon pieces preserve the live sprite scale and fortress defeat sheds painted debris and soot',()=>{
 const s=battle();s.boss.gunAngles={upper:.38};fortPartHit(s,'upper',999);const bits=s.organDebris;
 expect(bits).toHaveLength(4);expect(bits.reduce((n,q)=>n+q.w,0)).toBeCloseTo(249.6);expect(bits.every(q=>Math.abs(q.h-319/513*249.6)<.001)).toBe(true);
 expect(bits.every(q=>q.rotation===.38)).toBe(true);const m=fortRig(s).upper;expect(Math.abs(bits[0].x-m.x)).toBeGreaterThan(100);
 s.boss.hp=0;tick(s,180);expect(s.effects.filter(q=>q.cinematicSmoke&&q.soot).length).toBeGreaterThan(10);expect(s.organDebris.filter(q=>q.art==='ember-fort').length).toBeGreaterThan(25);expect(s.boss.defeat.ready).toBe(false);
});
test('explosion visuals and collision use the same twelve percent reduction exactly once',()=>{
 const s=createAdventure(5);expect(emberBlastSize('ember-mortar')).toBeCloseTo(486*.88);burstEmberProjectile(s,{x:100,y:300,kind:'ember-mortar'});
 expect(s.effects.find(q=>q.fireBurst).size).toBeCloseTo(s.hostile.find(q=>q.kind==='ember-blast').size);
});
test('controller navigation uses a glow without the square outline and keyboard restores its focus ring',async({page})=>{
 await page.addInitScript(()=>{window.testPad={id:'Xbox focus review',index:0,connected:true,mapping:'standard',axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};Object.defineProperty(navigator,'getGamepads',{value:()=>[window.testPad]});});
 await page.goto('/arcade');await openAdventureMenu(page);await page.waitForTimeout(180);
 await page.evaluate(()=>{window.testPad.buttons[13]={pressed:true,value:1};});await expect(page.locator('[data-gamepad-state]')).toHaveAttribute('data-input-mode','gamepad');await page.evaluate(()=>{window.testPad.buttons[13]={pressed:false,value:0};});
 await expect.poll(()=>page.evaluate(()=>getComputedStyle(document.activeElement).outlineStyle)).toBe('none');
 fs.mkdirSync(dir,{recursive:true});await page.screenshot({path:dir+'controller-focus.png'});
 await page.keyboard.press('Tab');await expect(page.locator('[data-gamepad-state]')).toHaveAttribute('data-input-mode','keyboard');
 expect(await page.evaluate(()=>getComputedStyle(document.activeElement).outlineStyle)).not.toBe('none');
});

test('record crew stations, deploying guns, furnace ignition, collapse and wind in the actual renderer',async({page})=>{
 test.setTimeout(180000);fs.mkdirSync(dir,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
 await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/';
  const w=window.machineReview=Object.assign({},...await Promise.all(['engine/adventureModel.js','actors/bosses/adventureEmberFort.js','actors/bosses/fortVents.js','actors/bosses/harlequinUltimate.js','render/adventureCanvas.js','render/adventureCamera.js','world/adventureTerrain.js'].map(p=>import(root+p))));
  w.art=await w.loadAdventureArt();w.c=document.createElement('canvas');w.c.id='machine-review';w.c.style='position:fixed;inset:0;z-index:99999;width:1440px;height:810px';document.body.append(w.c);
  w.scene=(index,move)=>{const s=w.s=w.createAdventure(index),a=s.level.arena;for(const key of ['enemies','outposts','supplies','stars','cages','hazards'])s[key]=[];s.arenaLocked=true;s.noticeTime=0;
   Object.assign(s.player,{x:index===2?a.left+480:31300,y:a.y,hurt:999,ground:s.platforms.indexOf(w.groundAt(s.platforms,index===2?a.left+480:31300))});
   Object.assign(s.boss,{x:index===2?a.right-400:s.boss.x,engaged:true,phase:'warn',move,timer:1.1,targetX:s.player.x,vulnerable:true});
   for(let i=0;i<700;i++)w.followAdventureCamera(s,1/120);return s;
  };
  w.paint=()=>w.renderAdventure(w.c,w.s,w.art);
  w.advance=n=>{for(let i=0;i<n;i++)w.stepAdventure(w.s,{},1/120);w.paint();};
  w.record=async seconds=>{const chunks=[],stream=w.c.captureStream(30),rec=new MediaRecorder(stream,{mimeType:'video/webm'});const result=new Promise(resolve=>{rec.ondataavailable=e=>chunks.push(e.data);rec.onstop=()=>{const r=new FileReader();r.onload=()=>resolve(String(r.result).split(',')[1]);r.readAsDataURL(new Blob(chunks,{type:'video/webm'}));};});rec.start();
   let last,start,acc=0;await new Promise(resolve=>{const frame=now=>{start??=now;last??=now;acc+=Math.min(.05,(now-last)/1000);last=now;while(acc>=1/120){w.stepAdventure(w.s,{},1/120);acc-=1/120;}w.paint();if(now-start<seconds*1000)requestAnimationFrame(frame);else resolve();};requestAnimationFrame(frame);});rec.stop();const data=await result;stream.getTracks().forEach(t=>t.stop());return data;};
 });
 const shot=async name=>{await page.evaluate(()=>window.machineReview.paint());await page.locator('#machine-review').screenshot({path:dir+name+'.png'});};

 for(const name of ['barge-crew','fort-smoke','fort-vents','fort-furnace','fort-collapse','camp-wind']){
  await page.evaluate(name=>{const w=window.machineReview;w.scene(name==='barge-crew'?2:name==='camp-wind'?3:5,name==='barge-crew'?'drumroll':'salvo');
   if(name==='fort-vents'){const s=w.s,p=w.fortSystems(s);p.wall.hp=p.gate.hp=0;s.boss.coreOpened=true;s.boss.move='vent';s.boss.timer=1.65;}
   if(name==='fort-furnace'){const s=w.s,p=w.fortSystems(s);for(const q of ['wall','gate','upper','lower'])p[q].hp=0;for(const v of w.fortVents(s))v.hp=0;Object.assign(s.boss,{coreOpened:true,phase:'recover',timer:0,turn:0});}
   if(name==='fort-collapse'){w.s.boss.hp=0;}
   if(name==='camp-wind'){const s=w.s=w.createAdventure(3);Object.assign(s.player,{x:-3370,y:w.groundY(s.platforms,-3370),hurt:999,ground:s.platforms.indexOf(w.groundAt(s.platforms,-3370))});s.noticeTime=0;for(let i=0;i<800;i++)w.followAdventureCamera(s,1/120);}
  },name);
  await shot(name+'-before');const data=await page.evaluate(seconds=>window.machineReview.record(seconds),name==='fort-collapse'?4.1:3.8);fs.writeFileSync(dir+name+'.webm',Buffer.from(data,'base64'));await shot(name+'-after');
 }
 expect(errors).toEqual([]);
});
