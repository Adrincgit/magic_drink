import {test,expect} from '@playwright/test';
import fs from 'node:fs';
test('record the entire camp with finite squads, stationary smoke, reversals, jumps and the side entrance',async({page})=>{
 test.setTimeout(240000);const dir='tests/artifacts/camp-depth';fs.mkdirSync(dir,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
 await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/';const w=window.campMotion=Object.assign({keys:{},paused:true,trace:[],defeated:new Set()},...await Promise.all(['engine/adventureModel.js','render/adventureCanvas.js','render/adventureCamera.js'].map(p=>import(root+p))));
  w.s=w.createAdventure(3);w.s.noticeTime=0;w.art=await w.loadAdventureArt();w.c=document.createElement('canvas');w.c.id='camp-motion';w.c.style='position:fixed;inset:0;z-index:99999;width:1440px;height:810px';document.body.append(w.c);
  for(const type of ['keydown','keyup'])window.addEventListener(type,e=>{const key={ArrowRight:'right',ArrowLeft:'left',Space:'jump',KeyZ:'attack'}[e.code];if(key){e.preventDefault();w.keys[key]=type==='keydown';}});
  let last=performance.now(),acc=0;
  function frame(now){acc+=Math.min(.05,(now-last)/1000);last=now;if(w.paused)acc=0;while(acc>=1/120){w.stepAdventure(w.s,w.keys,1/120);for(const e of w.s.enemies)if(e.campTent!==undefined&&e.hp<=0)w.defeated.add(e);acc-=1/120;}
   w.renderAdventure(w.c,w.s,w.art);if(!w.paused)w.trace.push({x:w.s.player.x,y:w.s.player.y,time:w.s.time,hearts:w.s.hearts,camera:{...w.s.camera},spawned:w.s.campTents.reduce((n,q)=>n+q.spawned,0),defeated:w.defeated.size});requestAnimationFrame(frame);
  }requestAnimationFrame(frame);
  const chunks=[];w.recorder=new MediaRecorder(w.c.captureStream(30),{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:4200000});w.recorder.ondataavailable=e=>chunks.push(e.data);w.recorder.onstop=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(chunks,{type:'video/webm'}));a.download='camp-motion.webm';a.click();};w.recorder.start();
 });
 const keys=async down=>{for(const key of ['ArrowRight','ArrowLeft','Space','KeyZ']){if(down.includes(key))await page.keyboard.down(key);else await page.keyboard.up(key);}await page.evaluate(()=>window.campMotion.paused=false);};
 const wait=async seconds=>{const target=await page.evaluate(dt=>window.campMotion.s.time+dt,seconds);await page.waitForFunction(t=>window.campMotion.s.done||window.campMotion.s.time>=t,target,{timeout:30000});};
 await keys([]);await wait(3); // The camera stays parked while smoke moves.
 await keys(['ArrowRight','KeyZ']);await wait(1.5);await keys(['ArrowLeft']);await wait(.6);await keys(['ArrowRight','Space','KeyZ']);await wait(.8);
 for(let id=0;id<8;id++){
  const target=await page.evaluate(id=>window.campMotion.s.campTents[id].x-365,id);await keys(['ArrowRight','KeyZ']);
  await page.waitForFunction(x=>window.campMotion.s.done||window.campMotion.s.player.x>=x,target,{timeout:30000});
  await keys(['KeyZ']);await page.waitForFunction(id=>window.campMotion.s.done||window.campMotion.s.campTents[id].state==='cleared',id,{timeout:20000});
  expect(await page.evaluate(()=>window.campMotion.s.done)).toBe(false);
 }
 await keys(['ArrowRight','KeyZ']);await page.waitForFunction(()=>window.campMotion.s.done||window.campMotion.s.player.x>=-710,null,{timeout:30000});
 await keys(['KeyZ']);await wait(1);await keys(['ArrowRight']);await page.waitForFunction(()=>window.campMotion.s.player.x>=660,null,{timeout:15000});await keys([]);await wait(1);
 const result=await page.evaluate(()=>{const w=window.campMotion;w.paused=true;return{hearts:w.s.hearts,x:w.s.player.x,checkpoint:w.s.checkpointAt,spawned:w.s.campTents.reduce((n,q)=>n+q.spawned,0),defeated:w.defeated.size,tents:w.s.campTents.map(q=>q.state),trace:w.trace};});
 const download=page.waitForEvent('download');await page.evaluate(()=>window.campMotion.recorder.stop());await(await download).saveAs(dir+'/camp-motion.webm');fs.writeFileSync(dir+'/motion-trace.json',JSON.stringify(result,null,2));expect(errors).toEqual([]);
 expect(result.hearts).toBe(5);expect(result.spawned).toBe(19);expect(result.defeated).toBe(19);expect(result.checkpoint).toBeUndefined();expect(result.tents.every(q=>q==='cleared')).toBe(true);
});
