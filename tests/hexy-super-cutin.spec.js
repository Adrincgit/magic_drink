import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import sharp from 'sharp';
import {createAdventure,stepAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {SUPER_WINDUP,SUPER_DURATION} from '../src/components/arcade/adventure/engine/adventureMagic';
import {superCutinState} from '../src/components/arcade/adventure/render/adventureSuperCutin';
import {openAdventureMenu} from './arcade-input.helpers';
const dir='tests/artifacts/arcade/super-cutin/';

test('portrait enters from the left, stays there and fades before the beam without sweeping across the battlefield',()=>{
 const s=createAdventure();expect(superCutinState(s)).toBeNull();s.superCinematic={age:0};
 expect(superCutinState(s).x+364).toBeLessThan(0);
 for(const fps of [30,60,120]){
  let previous=-370;
  for(let frame=0;frame<fps*SUPER_WINDUP;frame++){
   s.superCinematic.age=frame/fps;const q=superCutinState(s);expect(q).not.toBeNull();
   expect(q.x).toBeGreaterThanOrEqual(previous-1e-6);previous=q.x;
   expect(q.x).toBeLessThanOrEqual(0);if(frame/fps>=.2)expect(q.x).toBeCloseTo(0);
  }
 }
 s.superCinematic.age=SUPER_WINDUP-1e-6;expect(superCutinState(s).alpha).toBeLessThan(.00001);
 for(const age of [SUPER_WINDUP,1,2,SUPER_DURATION]){s.superCinematic.age=age;expect(superCutinState(s)).toBeNull();}
});

test('reduced motion fades a stationary portrait; facing left does not reverse the entrance and rendering state is pure',()=>{
 const s=createAdventure();s.superCinematic={age:.42,dir:1};const before=structuredClone(s);expect(superCutinState(s).phase).toBe('hold');expect(s).toEqual(before);
 const right=superCutinState(s);s.superCinematic.dir=-1;expect(superCutinState(s)).toEqual(right);
 for(const age of [.01,.08,.3,.6,.8,.89]){s.superCinematic.age=age;const q=superCutinState(s,true);expect(q.x).toBe(0);expect(q.alpha).toBeGreaterThan(0);expect(q.alpha).toBeLessThanOrEqual(1);}
 s.superCinematic.age=0;expect(superCutinState(s,true).alpha).toBe(0);
 s.superCinematic.age=.89;expect(superCutinState(s,true).alpha).toBeLessThan(.06);
});

test('the illustrated portrait has real alpha and the cinematic retains its original duration, cost, recharge and eight damage pulses',async()=>{
 const file='public/arcade/sprites/ui/hexy-encore-full.webp',m=await sharp(file).metadata();expect(m.hasAlpha).toBe(true);expect(m.width).toBe(1024);expect(m.height).toBe(1536);
 const alpha=await sharp(file).extractChannel('alpha').raw().toBuffer();expect(alpha[0]).toBe(0);expect(alpha[Math.floor(m.height/2)*m.width+Math.floor(m.width*.62)]).toBeGreaterThan(230);
 const s=createAdventure();s.enemies=[];s.hostile=[];const events=[];let time=0;
 do{stepAdventure(s,{super:time===0},1/120);time+=1/120;events.push(...s.events);}while(s.superCinematic);
 expect(time).toBeCloseTo(SUPER_DURATION,1);expect(events.filter(e=>e==='superCast')).toHaveLength(1);expect(events.filter(e=>e==='superPulse')).toHaveLength(8);expect(s.magic).toBe(10);expect(s.superCooldown).toBe(80);
});

test('real canvas renders the cut-in on desktop, mobile, left-facing and reduced motion with no portrait over the released beam',async({page})=>{
 fs.mkdirSync(dir,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/arcade');
 const result=await page.evaluate(async()=>{
  const [{createAdventure,stepAdventure},{renderAdventure,loadAdventureArt},{drawSuperCutin}]=await Promise.all([import('/src/components/arcade/adventure/engine/adventureModel.js'),import('/src/components/arcade/adventure/render/adventureCanvas.js'),import('/src/components/arcade/adventure/render/adventureSuperCutin.js')]);
  const art=await loadAdventureArt(),canvas=document.createElement('canvas');document.body.append(canvas);canvas.style='position:fixed;inset:0;width:1280px;height:720px;z-index:999999';
  await document.fonts.ready;const captures=[],checks=[];
  const isolation=document.createElement('canvas');isolation.width=960;isolation.height=540;const isolated=isolation.getContext('2d');let strayPixels=0;
  for(const variant of ['desktop','left-air','mobile','reduced','english']){
   const mobile=variant==='mobile',reduced=variant==='reduced',en=variant==='english';canvas.style.width=mobile?'390px':'1280px';canvas.style.height=mobile?'219.375px':'720px';
   const s=createAdventure();for(const k of ['enemies','hostile','outposts','supplies','hazards','stars','cages'])s[k]=[];
   Object.assign(s.player,{x:600,y:variant==='left-air'?290:480,ground:variant==='left-air'?null:0,dir:variant==='left-air'?-1:1});s.camera={x:120,y:40,backdropY:40,zoom:1};stepAdventure(s,{super:true},1/120);
   for(const [name,target] of [['enter',.1],['hold',.42],['exit',.79],['beam',1.02]]){
    while(s.superCinematic.age<target)stepAdventure(s,{},1/120);
    renderAdventure(canvas,s,art,{reduced,en});const age=s.superCinematic.age;
    captures.push({name:variant+'-'+name,data:canvas.toDataURL('image/jpeg',.93)});
    isolated.clearRect(0,0,960,540);const drawn=drawSuperCutin(isolated,s,art,reduced,en);checks.push({variant,name,drawn,age,unchanged:age===s.superCinematic.age});
    const outside=isolated.getImageData(370,0,590,540).data;for(let i=3;i<outside.length;i+=4)if(outside[i])strayPixels++;
   }
  }
  return{captures,checks,strayPixels,loaded:art['hexy-encore-portrait'].naturalWidth};
 });
 for(const shot of result.captures)fs.writeFileSync(dir+shot.name+'.jpg',Buffer.from(shot.data.split(',')[1],'base64'));
 fs.writeFileSync(dir+'render.json',JSON.stringify({errors,loaded:result.loaded,strayPixels:result.strayPixels,checks:result.checks},null,2));
 expect(errors).toEqual([]);expect(result.loaded).toBe(1024);expect(result.strayPixels).toBe(0);for(const q of result.checks){expect(q.drawn).toBe(q.name!=='beam');expect(q.unchanged).toBe(true);}
});

for(const width of [390,1280])test(`${width}: the real game pauses the portrait and resumes into the beam without spending twice`,async({page})=>{
 fs.mkdirSync(dir,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setViewportSize({width,height:width===390?844:900});await page.goto('/arcade');await openAdventureMenu(page);
 const root=page.locator('[data-hexy-adventure]'),canvas=page.locator('[data-adventure-canvas]');await expect(root).toHaveAttribute('data-phase','ready',{timeout:30000});await page.locator('[data-practice]').click();await expect(root).toHaveAttribute('data-phase','playing');
 await page.keyboard.press('KeyR');await page.waitForFunction(()=>Number(document.querySelector('[data-adventure-canvas]').dataset.charge)>=.3);
 await page.keyboard.press('KeyP');await expect(root).toHaveAttribute('data-phase','paused');
 const charge=Number(await canvas.getAttribute('data-charge'));expect(charge).toBeGreaterThan(.2);expect(charge).toBeLessThan(.9);
 const image=await canvas.evaluate(c=>c.toDataURL('image/jpeg',.94));fs.writeFileSync(dir+`live-${width}-portrait.jpg`,Buffer.from(image.split(',')[1],'base64'));
 await page.waitForTimeout(250);expect(Number(await canvas.getAttribute('data-charge'))).toBe(charge);
 await page.getByRole('button',{name:'Continuar ▶',exact:true}).click();await expect(root).toHaveAttribute('data-phase','playing');await expect(canvas).toHaveAttribute('data-pose',/super-release:/);
 await expect(canvas).toHaveAttribute('data-super-active','false',{timeout:6000});
 expect(Number(await page.getByRole('meter',{name:'Energía de magia',exact:true}).getAttribute('value'))).toBeLessThan(20);expect(errors).toEqual([]);
});
