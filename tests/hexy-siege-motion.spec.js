import {test,expect} from '@playwright/test';
import fs from 'node:fs';
test('record actual water, pit crossing, siege demolition and the final camp approach',async({page})=>{
 test.setTimeout(180000);const dir='tests/artifacts/siege';fs.mkdirSync(dir,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
 await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/';const w=window.siegeMotion=Object.assign({paused:true,keys:{},trace:[],sceneName:''},...await Promise.all(['engine/adventureModel.js','engine/adventureEmberFire.js','actors/bosses/adventureEmberFort.js','render/adventureCanvas.js','render/adventureCamera.js','world/adventureTerrain.js'].map(p=>import(root+p))));
  w.art=await w.loadAdventureArt();w.c=document.createElement('canvas');w.c.id='siege-motion';w.c.style='position:fixed;inset:0;z-index:99999;width:1440px;height:810px';document.body.append(w.c);
  w.scene=(index,x,name)=>{w.sceneName=name;const s=w.s=w.createAdventure(index);Object.assign(s.player,{x,y:w.groundY(s.platforms,x),ground:s.platforms.indexOf(w.groundAt(s.platforms,x))});s.noticeTime=0;for(let i=0;i<800;i++)w.followAdventureCamera(s,1/120);};w.scene(5,22100,'water');
  w.s.enemies=[];w.s.supplies=[];w.s.outposts=[];w.s.weapon=5;w.s.emberEnvironment.bushes=[{x:22300,y:620,state:'green',age:0,seed:4}];w.igniteEmberBushes(w.s,22300,620,50);
  for(const event of ['keydown','keyup'])window.addEventListener(event,e=>{const key={ArrowRight:'right',ArrowLeft:'left',Space:'jump',KeyZ:'attack',KeyC:'special'}[e.code];if(key){e.preventDefault();w.keys[key]=event==='keydown';}});
  let last=performance.now(),acc=0;
  const frame=now=>{acc+=Math.min(.06,(now-last)/1000);last=now;if(w.paused)acc=0;
   while(acc>=1/120){w.stepAdventure(w.s,w.keys,1/120);acc-=1/120;}
   w.renderAdventure(w.c,w.s,w.art);if(!w.paused)w.trace.push({scene:w.sceneName,x:w.s.player.x,y:w.s.player.y,hearts:w.s.hearts,camera:{...w.s.camera},time:w.s.time,phase:w.s.boss.phase});requestAnimationFrame(frame);};requestAnimationFrame(frame);
  const chunks=[];w.recorder=new MediaRecorder(w.c.captureStream(30),{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:4200000});w.recorder.ondataavailable=e=>chunks.push(e.data);w.recorder.onstop=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(chunks,{type:'video/webm'}));a.download='siege-motion.webm';a.click();};w.recorder.start();
 });
 const move=async(seconds,keys=[])=>{const until=await page.evaluate(seconds=>{const w=window.siegeMotion;w.paused=false;return w.s.time+seconds;},seconds);for(const k of keys)await page.keyboard.down(k);await page.waitForFunction(t=>window.siegeMotion.s.done||window.siegeMotion.s.time>=t,until,{timeout:30000});for(const k of keys)await page.keyboard.up(k);await page.evaluate(()=>window.siegeMotion.paused=true);};
 await move(1.6,['KeyZ']);expect(await page.evaluate(()=>window.siegeMotion.s.emberEnvironment.bushes[0].state)).toBe('charred');
 await move(1);
 await page.evaluate(()=>{const w=window.siegeMotion;w.scene(5,27435,'crossing');for(const q of w.s.emberEnvironment.trees){q.phase='fallen';q.age=5;}});
 await move(.38,['ArrowRight','Space']);await move(.035,['ArrowRight']);await move(.6,['ArrowRight','Space']);await move(.65,['ArrowRight']);await move(.8);
 expect(await page.evaluate(()=>window.siegeMotion.s.hearts)).toBe(5);
 await page.evaluate(()=>{const w=window.siegeMotion;w.scene(5,31300,'siege');const s=w.s;s.enemies=[];s.supplies=[];s.outposts=[];s.arenaLocked=true;Object.assign(s.boss,{engaged:true,phase:'recover',timer:999,vulnerable:true});const p=w.fortSystems(s);p.wall.hp=4;p.gate.hp=4;p.core.hp=8;for(let i=0;i<800;i++)w.followAdventureCamera(s,1/120);});
 // Reduced part HP only accelerates this visual recording. The separate
 // gameplay regression defeats all full-health phases with ordinary shots.
 await move(8,['ArrowRight','KeyZ']);await move(4);expect(await page.evaluate(()=>!!window.siegeMotion.s.clear)).toBe(true);
 await page.evaluate(()=>{const w=window.siegeMotion;w.scene(3,-5300,'camp');w.s.weapon=5;});
 await move(8,['ArrowRight','KeyZ']);await move(6,['ArrowRight','KeyZ']);await move(5,['ArrowRight','KeyZ']);
 await move(1.5,['KeyZ']);await move(5,['ArrowRight','KeyZ']);
 const result=await page.evaluate(()=>({x:window.siegeMotion.s.player.x,hearts:window.siegeMotion.s.hearts,checkpoint:window.siegeMotion.s.checkpointAt,boss:window.siegeMotion.s.boss.phase}));
 expect(result.x).toBeGreaterThan(0);expect(result.hearts).toBeGreaterThan(0);expect(result.checkpoint).toEqual([660,480]);
 const downloaded=page.waitForEvent('download');await page.evaluate(()=>window.siegeMotion.recorder.stop());await(await downloaded).saveAs(dir+'/siege-motion.webm');
 fs.writeFileSync(dir+'/motion-trace.json',JSON.stringify({result,trace:await page.evaluate(()=>window.siegeMotion.trace)},null,2));expect(errors).toEqual([]);
});
