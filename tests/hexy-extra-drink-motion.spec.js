import {test,expect} from '@playwright/test';
import fs from 'node:fs';

test('render electric chains and fence, falling honey and satellites with keyboard controls',async({page})=>{
 test.setTimeout(90000);const dir='tests/artifacts/drink-wave2';fs.mkdirSync(dir,{recursive:true});const errors=[],missing=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&r.url().includes('/arcade/'))missing.push(r.url());});await page.goto('/');
 await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/';
  const w=window.waveReview=Object.assign({paused:true,keys:{}},...await Promise.all(['engine/adventureModel.js','engine/adventureAmmo.js','engine/adventureExtraDrinks.js','render/adventureCanvas.js','render/adventureCamera.js','world/adventureTerrain.js','actors/enemies/adventureEnemies.js'].map(p=>import(root+p))));
  w.art=await w.loadAdventureArt();w.c=document.createElement('canvas');w.c.id='wave-review';w.c.style='position:fixed;inset:0;z-index:99999;width:1440px;height:810px';document.body.append(w.c);
  w.scene=kind=>{
   w.s=w.createAdventure(5);const s=w.s;s.enemies=[];s.hostile=[];s.emberEnvironment.bushes=[];s.noticeTime=0;s.time=s.fxTime=12;
   s.player.x=860;s.player.y=w.groundY(s.platforms,s.player.x);s.player.ground=s.platforms.indexOf(w.groundAt(s.platforms,s.player.x));
   s.player.dir=1;w.equipDrink(s,kind);s.magic=100;s.supplies=[];s.pickups=[];s.cages=[];s.outposts=[];w.keys={};
   for(let i=0;i<800;i++)w.followAdventureCamera(s,1/120);w.paused=true;w.renderAdventure(w.c,s,w.art);
  };
  for(const type of ['keydown','keyup'])window.addEventListener(type,e=>{const key={KeyZ:'attack',KeyC:'special',ArrowRight:'right',ArrowLeft:'left',ArrowDown:'down',ArrowUp:'up'}[e.code];if(key){e.preventDefault();w.keys[key]=type==='keydown';}});
  let last=performance.now(),acc=0;
  function frame(now){acc+=Math.min(.05,(now-last)/1000);last=now;if(w.paused)acc=0;while(acc>=1/120){w.stepAdventure(w.s,w.keys,1/120);acc-=1/120;if(w.captureChain&&w.s.effects.some(q=>q.drinkArc)){w.captureChain=false;w.paused=true;acc=0;break;}}w.renderAdventure(w.c,w.s,w.art);requestAnimationFrame(frame);}
  w.scene(9);requestAnimationFrame(frame);
  const chunks=[];w.recorder=new MediaRecorder(w.c.captureStream(30),{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:4800000});w.recorder.ondataavailable=e=>chunks.push(e.data);w.recorder.onstop=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(chunks,{type:'video/webm'}));a.download='wave2-motion.webm';a.click();};w.recorder.start();
 });
 const wait=async seconds=>{const t=await page.evaluate(dt=>{const w=window.waveReview;w.paused=false;return w.s.time+dt;},seconds);await page.waitForFunction(t=>window.waveReview.s.time>=t,t);};
 const shot=async name=>{await page.evaluate(()=>window.waveReview.paused=true);await page.locator('#wave-review').screenshot({path:dir+'/'+name+'.png'});};
 const press=async(key,seconds=.05)=>{await page.keyboard.down(key);await wait(seconds);await page.keyboard.up(key);};
 await page.evaluate(()=>{const w=window.waveReview,s=w.s;s.enemies=[1020,1120,1220].map(x=>{const e=w.makeEnemy(x,s.player.y,0);e.timer=99;return e;});w.captureChain=true;});
 await page.keyboard.down('KeyZ');await page.evaluate(()=>window.waveReview.paused=false);await page.waitForFunction(()=>!window.waveReview.captureChain);await page.keyboard.up('KeyZ');await shot('01-volt-chain');
 expect(await page.evaluate(()=>window.waveReview.s.enemies.filter(e=>e.hp<e.maxHp).length)).toBe(3);
 await wait(.6);await page.evaluate(()=>window.waveReview.scene(9));await press('KeyC');await wait(.24);await shot('02-volt-fence');await wait(1.3);
 await page.evaluate(()=>window.waveReview.scene(10));await press('KeyZ');await wait(.3);await shot('03-honey-arc');await wait(.85);await shot('04-honey-puddle');
 expect(await page.evaluate(()=>window.waveReview.s.drinkFields.some(f=>f.puddle))).toBe(true);
 await press('KeyC');await wait(.65);await shot('05-honey-rain');await wait(1.3);await shot('06-honey-ground');await wait(.5);
 await page.evaluate(()=>window.waveReview.scene(11));await press('KeyZ');await wait(.16);await shot('07-orbit-windup');await wait(.38);await shot('08-orbit-release');await wait(.5);
 await press('KeyC');await wait(.4);await shot('09-satellites');await press('ArrowRight',.5);await shot('10-moving-satellites');
 await page.evaluate(()=>{const w=window.waveReview,f=w.s.drinkFields.find(f=>f.kind===11),orb=f.orbs.find(o=>o.alive),p=w.orbitPosition(f,orb);w.s.hostile=[{kind:'ball',x:p.x,y:p.y,vx:100,vy:0,r:12,age:0,life:2}];});
 await wait(.04);expect(await page.evaluate(()=>window.waveReview.s.drinkFields.find(f=>f.kind===11).orbs.filter(o=>o.alive).length)).toBe(2);await shot('11-block');await wait(1);
 const download=page.waitForEvent('download');await page.evaluate(()=>{window.waveReview.paused=true;window.waveReview.recorder.stop();});await(await download).saveAs(dir+'/wave2-motion.webm');
 await page.evaluate(()=>{
  const shelf=document.createElement('div');shelf.id='wave-shelf';shelf.style='position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;gap:70px;background:#22212e';
  for(const name of ['volt-lychee','honey-mango','orbit-orange']){const img=document.createElement('img');img.src='/arcade/sprites/pickups/'+name+'.webp';img.style='height:480px;width:auto';shelf.append(img);}document.body.append(shelf);
 });
 await page.locator('#wave-shelf img').evaluateAll(images=>Promise.all(images.map(img=>img.decode())));await page.locator('#wave-shelf').screenshot({path:dir+'/12-cans.png'});
 expect(errors).toEqual([]);expect(missing).toEqual([]);
});
