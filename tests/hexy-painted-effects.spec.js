import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import sharp from 'sharp';
import {createAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {stepHarlequinProjectile} from '../src/components/arcade/adventure/actors/bosses/adventureHarlequin';
import {stepHarlequinFire} from '../src/components/arcade/adventure/actors/bosses/harlequinFire';
import {drawHarlequinProjectile} from '../src/components/arcade/adventure/render/harlequinCanvas';

test('columns show painted heat without rings or arrows before their harmless warm-up ends',()=>{
 const images=[],c=new Proxy({globalAlpha:1},{get:(o,name)=>name in o?o[name]:name==='drawImage'?(...args)=>images.push(args):['ellipse','arc','stroke','lineTo'].includes(name)?()=>{throw new Error('Geometric warning '+String(name));}:()=>{}});
 const heat={name:'heat'},art={'duel-fire-show':heat};
 for(const age of [.1,.4,.79])drawHarlequinProjectile(c,{kind:'harlequin-pyre',x:500,floor:480,delay:.8,age},art,true);
 expect(images).toHaveLength(3);expect(images.every(args=>args[0]===heat)).toBe(true);expect(images[0][2]).toBeLessThanOrEqual(images[2][2]);
});

test('extinguishing fire cannot damage and projectile trails stay bounded on actual positions',()=>{
 const s=createAdventure(3),q={kind:'harlequin-pyre',age:0,delay:.8,damaging:false};
 for(const [age,damaging]of [[.5,false],[.90,false],[1.02,true],[1.49,true],[1.51,false],[1.8,false]]){q.age=age;stepHarlequinFire(s,q);expect(q.damaging).toBe(damaging);}
 const shot={harlequin:true,kind:'harlequin-card',x:1500,y:300,vx:70,vy:0,age:0,life:10};
 for(let n=0;n<500;n++){shot.age+=1/120;stepHarlequinProjectile(s,shot,1/120);expect(shot.trail.length).toBeLessThanOrEqual(9);for(const p of shot.trail){expect(p.x).toBeLessThan(shot.x);expect(p.y).toBe(300);}}
 expect(shot.trail).toHaveLength(9);
});

test('fire heads contain no neighbouring pink cells and extinguishing paintings retain their height',async()=>{
 const heads=sharp('public/arcade/sprites/effects/painted-duel/heads.webp');
 for(let i=8;i<16;i++){
  const data=await heads.clone().extract({left:i%4*256,top:Math.floor(i/4)*224,width:256,height:224}).raw().toBuffer();let pink=0,opaque=0;
  for(let k=0;k<data.length;k+=4)if(data[k+3]>90){opaque++;if(data[k]>100&&data[k+2]>data[k+1]*1.35&&data[k+2]>100)pink++;}
  expect(opaque).toBeGreaterThan(1200);expect(pink/opaque).toBeLessThan(.01);
 }
 const pyres=sharp('public/arcade/sprites/effects/painted-duel/pyres.webp'),counts=[],tops=[];
 for(let i=12;i<16;i++){
  const data=await pyres.clone().extract({left:i%4*256,top:Math.floor(i/4)*416,width:256,height:416}).raw().toBuffer();let count=0,top=416;
  for(let y=0;y<416;y++)for(let x=0;x<256;x++)if(data[(y*256+x)*4+3]>90){count++;top=Math.min(top,y);}
  counts.push(count);tops.push(top);
 }
 expect(counts.at(-1)).toBeLessThan(counts[0]*.20);expect(Math.max(...tops)-Math.min(...tops)).toBeLessThan(70);expect(Math.max(...tops)).toBeLessThan(100);
});

test('review painted launch, rising dust, fire extinction and projectile motion in the real renderer',async({page})=>{
 test.setTimeout(120000);const dir='tests/artifacts/arcade/painted-effects/';fs.mkdirSync(dir,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize({width:1280,height:720});await page.goto('/arcade');
 await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/';const [engine,render,camera,boss,fire,enemies]=await Promise.all([import(root+'engine/adventureModel.js'),import(root+'render/adventureCanvas.js'),import(root+'render/adventureCamera.js'),import(root+'actors/bosses/harlequinUltimate.js'),import(root+'actors/bosses/harlequinFire.js'),import(root+'actors/enemies/adventureEnemies.js')]);
  const art=await render.loadAdventureArt(),canvas=document.createElement('canvas');canvas.id='painted-review';canvas.style='position:fixed;inset:0;z-index:99999;width:1280px;height:720px';document.body.append(canvas);
  const w=window.paintedReview={canvas,art,engine,render,boss,fire,enemies};
  w.fresh=()=>{const s=engine.createAdventure(3);s.arenaLocked=true;s.enemies=[];s.outposts=[];s.hazards=[];s.supplies=[];s.stars=[];s.noticeTime=0;Object.assign(s.player,{x:1500,y:480,ground:2});Object.assign(s.boss,{x:2430,y:480,phase:'recover',timer:100,engaged:true,vulnerable:true,stage:3,hp:240,turn:3});for(let n=0;n<600;n++)camera.followAdventureCamera(s,1/120);w.s=s;return s;};
  w.tick=(n=1,input={})=>{for(let i=0;i<n;i++)engine.stepAdventure(w.s,input,1/120);};w.paint=()=>render.renderAdventure(canvas,w.s,art);w.fresh();
  w.duel=()=>{const s=w.fresh();boss.beginHarlequinUltimate(s);while(s.boss.ultimate.state==='leap')w.tick();w.tick(1,{super:true});while(s.powerClash.state==='windup')w.tick();};w.duel();
 });
 const canvas=page.locator('#painted-review');
 for(const [name,n]of [['launch',8],['travel',16],['contact',20],['dust-low',40],['dust-curl',25],['dust-rise',25]]){await page.evaluate(n=>{const w=window.paintedReview;w.tick(n);if(w.s.powerClash?.state==='contest')w.s.powerClash.pressure=.5;w.paint();},n);await canvas.screenshot({path:dir+name+'.jpg'});}
 for(const pressure of [.12,.88]){await page.evaluate(pressure=>{const w=window.paintedReview;w.s.powerClash.pressure=pressure;w.paint();},pressure);await canvas.screenshot({path:dir+'pressure-'+pressure+'.jpg'});}
 await page.evaluate(()=>{const w=window.paintedReview,s=w.fresh();s.boss.move='pyre';s.boss.volley=0;s.player.x=1980;w.fire.castHarlequinFire(s,s.boss,w.enemies.enemyShot);});
 for(const [name,n]of [['no-indicator',65],['eruption',43],['burn',22],['extinguish',58],['embers',12]]){await page.evaluate(n=>{const w=window.paintedReview;w.tick(n);w.paint();},n);await canvas.screenshot({path:dir+name+'.jpg'});}
 const video=await page.evaluate(async()=>{
  const w=window.paintedReview;w.duel();const stream=w.canvas.captureStream(30),rec=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:3500000}),chunks=[];rec.ondataavailable=e=>chunks.push(e.data);rec.start();
  await new Promise(resolve=>{const start=performance.now();let previous=start,accumulator=0,pyres=false,embers=false;
   const frame=now=>{const elapsed=(now-start)/1000;accumulator+=Math.min(.05,(now-previous)/1000);previous=now;
    while(accumulator>=1/120){w.tick();accumulator-=1/120;}
    if(w.s.powerClash?.state==='contest')w.s.powerClash.pressure=.5+Math.sin(elapsed*1.5)*.33;
    if(elapsed>=5&&!pyres){pyres=true;const s=w.fresh();s.player.x=1980;s.boss.move='pyre';s.boss.volley=0;w.fire.castHarlequinFire(s,s.boss,w.enemies.enemyShot);}
    if(elapsed>=7.33&&!embers){embers=true;const s=w.fresh();Object.assign(s.boss,{phase:'warn',move:'embers',timer:.01,warnDuration:1});}
    w.paint();if(elapsed<9.5)requestAnimationFrame(frame);else resolve();};requestAnimationFrame(frame);
  });
  const stopped=new Promise(resolve=>rec.onstop=resolve);rec.stop();await stopped;stream.getTracks().forEach(t=>t.stop());const bytes=new Uint8Array(await new Blob(chunks).arrayBuffer());let text='';for(let i=0;i<bytes.length;i+=8192)text+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(text);
 });fs.writeFileSync(dir+'motion-review.webm',Buffer.from(video,'base64'));expect(errors).toEqual([]);
});
