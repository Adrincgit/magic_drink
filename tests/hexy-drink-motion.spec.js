import {test,expect} from '@playwright/test';
import fs from 'node:fs';

test('render Aqua hose and all three drink mechanics with actual keyboard input',async({page})=>{
 test.setTimeout(90000);const dir='tests/artifacts/drink-roster';fs.mkdirSync(dir,{recursive:true});const errors=[],missing=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&r.url().includes('/arcade/'))missing.push(r.url());});await page.goto('/');
 await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/';
  const w=window.drinkReview=Object.assign({paused:true,keys:{}},...await Promise.all(['engine/adventureModel.js','engine/adventureAmmo.js','render/adventureCanvas.js','render/adventureCamera.js','world/adventureTerrain.js','actors/enemies/adventureEnemies.js'].map(p=>import(root+p))));
  w.art=await w.loadAdventureArt();w.c=document.createElement('canvas');w.c.id='drink-review';w.c.style='position:fixed;inset:0;z-index:99999;width:1440px;height:810px';document.body.append(w.c);
  w.scene=kind=>{
   w.s=w.createAdventure(5);const s=w.s;s.enemies=[];s.hostile=[];s.emberEnvironment.bushes=[];s.noticeTime=0;s.time=s.fxTime=12;
   s.player.x=860;s.player.y=w.groundY(s.platforms,s.player.x);s.player.ground=s.platforms.indexOf(w.groundAt(s.platforms,s.player.x));
   s.player.dir=1;w.equipDrink(s,kind);s.magic=100;s.supplies=[];s.pickups=[];w.keys={};
   for(let i=0;i<800;i++)w.followAdventureCamera(s,1/120);w.paused=true;w.renderAdventure(w.c,s,w.art);
  };
  for(const type of ['keydown','keyup'])window.addEventListener(type,e=>{const key={KeyZ:'attack',KeyC:'special',ArrowRight:'right',ArrowLeft:'left',ArrowDown:'down',ArrowUp:'up'}[e.code];if(key){e.preventDefault();w.keys[key]=type==='keydown';}});
  let last=performance.now(),acc=0;
  function frame(now){acc+=Math.min(.05,(now-last)/1000);last=now;if(w.paused)acc=0;while(acc>=1/120){w.stepAdventure(w.s,w.keys,1/120);acc-=1/120;}w.renderAdventure(w.c,w.s,w.art);requestAnimationFrame(frame);}
  w.scene(5);requestAnimationFrame(frame);
  const chunks=[];w.recorder=new MediaRecorder(w.c.captureStream(30),{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:4800000});w.recorder.ondataavailable=e=>chunks.push(e.data);w.recorder.onstop=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(chunks,{type:'video/webm'}));a.download='drink-motion.webm';a.click();};w.recorder.start();
 });
 const wait=async seconds=>{const t=await page.evaluate(dt=>{const w=window.drinkReview;w.paused=false;return w.s.time+dt;},seconds);await page.waitForFunction(t=>window.drinkReview.s.time>=t,t);};
 const shot=async name=>{await page.evaluate(()=>window.drinkReview.paused=true);await page.locator('#drink-review').screenshot({path:dir+'/'+name+'.png'});};
 const special=async()=>{await page.keyboard.down('KeyC');await wait(.05);await page.keyboard.up('KeyC');};
 await special();await wait(.35);await shot('01-aqua-arc');await page.keyboard.down('ArrowUp');await wait(.5);await shot('02-aqua-up');await page.keyboard.up('ArrowUp');await page.keyboard.down('ArrowDown');await wait(.7);await shot('03-aqua-ground');await page.keyboard.up('ArrowDown');await wait(.7);
 await page.evaluate(()=>window.drinkReview.scene(6));await page.keyboard.down('KeyZ');await wait(.65);await shot('04-jelly-bounce');await page.keyboard.up('KeyZ');await special();await wait(.4);await shot('05-jelly-spring');await page.keyboard.down('ArrowRight');await wait(.35);await page.keyboard.up('ArrowRight');await wait(.2);await shot('06-jelly-launch');
 expect(await page.evaluate(()=>window.drinkReview.s.player.ground)).toBeNull();await wait(1.5);
 await page.evaluate(()=>window.drinkReview.scene(7));await special();await wait(.4);await page.keyboard.down('KeyZ');await wait(.35);await shot('07-prism-split');await wait(.7);await page.keyboard.up('KeyZ');
 expect(await page.evaluate(()=>window.drinkReview.s.shots.some(q=>q.prismSplit))).toBe(true);await wait(.6);
 await page.evaluate(()=>window.drinkReview.scene(8));await page.keyboard.down('KeyZ');await wait(1);await shot('08-echo-waves');await page.keyboard.up('KeyZ');await special();await wait(.3);await page.keyboard.down('ArrowRight');await wait(.3);await page.keyboard.up('ArrowRight');await shot('09-echo-copy');await wait(1.8);
 const download=page.waitForEvent('download');await page.evaluate(()=>{window.drinkReview.paused=true;window.drinkReview.recorder.stop();});await(await download).saveAs(dir+'/drink-motion.webm');
 await page.evaluate(()=>{
  const shelf=document.createElement('div');shelf.id='drink-shelf';shelf.style='position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;gap:70px;background:#22212e';
  for(const name of ['jelly-cherry','prism-peach','echo-melon']){const img=document.createElement('img');img.src='/arcade/sprites/pickups/'+name+'.webp';img.style='height:480px;width:auto';shelf.append(img);}document.body.append(shelf);
 });
 await page.locator('#drink-shelf img').evaluateAll(images=>Promise.all(images.map(img=>img.decode())));await page.locator('#drink-shelf').screenshot({path:dir+'/10-cans.png'});
 expect(errors).toEqual([]);expect(missing).toEqual([]);
});
