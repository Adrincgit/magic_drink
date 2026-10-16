import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {openAdventureMenu} from './arcade-input.helpers';
const folder='tests/artifacts/arcade/village-depth-v5/';
test('real game: entire approach, side gate and street at actual viewport sizes',async({page})=>{
 test.setTimeout(180000);fs.mkdirSync(folder,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 // Instrument only this browser response; production code exposes no debug API.
 await page.route('**/src/components/arcade/adventure/engine/adventureModel.js*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function stepAdventure(s,input,dt){','function stepAdventure(s,input,dt){globalThis.__v5Live=s;')});});
 await page.goto('/arcade');await expect(page.locator('[data-title-screen]')).toBeVisible({timeout:90000});await openAdventureMenu(page);await page.getByRole('button',{name:/Elegir capítulo/}).click();await page.locator('[data-level-choice="7"]').click();await page.locator('[data-practice]').click();await page.locator('[data-chapter-intro]').click();
 await expect.poll(()=>page.evaluate(()=>!!window.__v5Live)).toBe(true);const canvas=page.locator('[data-adventure-canvas]');
 for(const [width,height,positions] of [[1440,900,[90,800,1800,2600,3700,4700,5500,5950,6250,6500,6750,7000,7350,8000,10000,12500,16500,21000]],[1920,1080,[90,5500,6250,6850,7500,12000]]]){
  await page.setViewportSize({width,height});
  for(const x of positions){
   await page.evaluate(async x=>{const s=window.__v5Live,{groundY}=await import('/src/components/arcade/adventure/world/adventureTerrain.js');Object.assign(s.player,{x,y:groundY(s.level.route,x),vx:0,vy:0,hurt:999});s.camera={x:Math.max(0,x-300),y:40,backdropY:40,zoom:1};s.village.furthest=Math.max(s.village.furthest,x);s.noticeTime=0;},x);
   await page.waitForTimeout(100);await canvas.screenshot({path:folder+`real-${width}-${x}.png`});
  }
 }
 await page.setViewportSize({width:1440,height:900});
 for(const [name,x] of [['country',2400],['entrance',6450]]){
  await page.evaluate(async x=>{const s=window.__v5Live,{groundY}=await import('/src/components/arcade/adventure/world/adventureTerrain.js');Object.assign(s.player,{x,y:groundY(s.level.route,x),vx:0,vy:0,hurt:999});s.camera={x:x-300,y:40,backdropY:40,zoom:1};},x);
  await page.evaluate(()=>{const c=document.querySelector('[data-adventure-canvas]'),chunks=[],stream=c.captureStream(60),rec=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:6500000});window.__v5Video={rec,stream,chunks};rec.ondataavailable=e=>chunks.push(e.data);rec.start();});
  await page.keyboard.down('ArrowRight');await page.waitForTimeout(3800);await page.keyboard.up('ArrowRight');await page.keyboard.down('ArrowLeft');await page.waitForTimeout(3800);await page.keyboard.up('ArrowLeft');
  const movie=await page.evaluate(()=>new Promise(resolve=>{const q=window.__v5Video;q.rec.onstop=()=>{const f=new FileReader();f.onload=()=>resolve(String(f.result).split(',')[1]);f.readAsDataURL(new Blob(q.chunks,{type:'video/webm'}));q.stream.getTracks().forEach(t=>t.stop());};q.rec.stop();}));fs.writeFileSync(folder+name+'.webm',Buffer.from(movie,'base64'));fs.writeFileSync(folder+name+'.json',JSON.stringify({simulationTime:7.6,defeats:[]}));
 }
 expect(errors).toEqual([]);
});
