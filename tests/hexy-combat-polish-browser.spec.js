import {test,expect} from '@playwright/test';
import {openAdventureMenu} from './arcade-input.helpers';
const dir='tests/artifacts/arcade/combat-polish/';
test('classic charm icons align with the catalog and keep their aspect in wide desktop details',async({page})=>{
 test.setTimeout(90000);await page.setViewportSize({width:1920,height:1080});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{localStorage.setItem('magic-drink-arcade:owner-reset:2026-10-06-stage-polish','done');localStorage.setItem('magic-drink-arcade-v1',JSON.stringify({version:1,campaign:2,economy:2,stars:3000,modsOwned:['quick-cast'],modsEquipped:['quick-cast'],adventureUnlocked:4}));localStorage.setItem('magic-drink:arcade:illustrated-finish:v1',JSON.stringify({enabled:true,grain:0,chromatic:0,vignette:0}));});
 await page.goto('/arcade');await openAdventureMenu(page);await page.locator('[data-practice]').click();await expect(page.locator('[data-hexy-adventure]')).toHaveAttribute('data-phase','playing');await page.keyboard.down('ArrowRight');await page.waitForFunction(()=>+document.querySelector('[data-adventure-canvas]').dataset.playerX>315);await page.keyboard.up('ArrowRight');await page.keyboard.press('KeyE');await expect(page.locator('[data-adventure-shop]')).toBeVisible();
 const icons=[];for(const id of ['quick-cast','encore-pocket','bright-spark','grand-flourish']){
  const row=page.locator('[data-mod='+id+']'),icon=row.locator('img');await expect(icon).toBeVisible();expect(await icon.evaluate(e=>e.complete&&e.naturalWidth===e.naturalHeight)).toBe(true);icons.push(await icon.boundingBox());await row.click();const detail=page.locator('[data-product-info] img');expect(await detail.evaluate(e=>getComputedStyle(e).objectFit)).toBe('contain');
 }expect(Math.max(...icons.map(q=>q.x))-Math.min(...icons.map(q=>q.x))).toBeLessThan(1);
 await page.locator('[data-mod=quick-cast]').click();await page.locator('[data-adventure-shop]').screenshot({path:dir+'mods-1920.png'});await page.setViewportSize({width:2560,height:1440});await page.locator('[data-adventure-shop]').screenshot({path:dir+'mods-2560.png'});expect(errors).toEqual([]);
});
test('render actual combat frames, elemental reactions and continuous beams, then record animation playback',async({page})=>{
 test.setTimeout(120000);const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize({width:1200,height:750});
 await page.route('**/combat-polish-harness',route=>route.fulfill({contentType:'text/html',body:'<body style="margin:0;background:#211e2b"><canvas style="width:960px;height:540px"></canvas></body>'}));await page.goto('/combat-polish-harness');
 await page.evaluate(async()=>{
  const base='/src/components/arcade/adventure/',{loadAdventureArt,renderAdventure}=await import(base+'render/adventureCanvas.js'),{createTrial}=await import(base+'engine/adventureTrial.js'),{stepAdventure}=await import(base+'engine/adventureModel.js'),{MODS}=await import(base+'engine/adventureMods.js'),{reactToElement}=await import(base+'actors/enemies/adventureElementHits.js');
  const art=await loadAdventureArt(),canvas=document.querySelector('canvas');
  window.h={art,canvas,renderAdventure,stepAdventure,reactToElement,make(id,level=1){const s=createTrial(MODS.find(m=>m.id===id),level);for(const e of s.enemies){e.practice=false;e.hp=100;e.recovery=99;}s.enemies[0].x=430;s.enemies[1].x=560;s.enemies[2].x=680;this.s=s;return s;},tick(n,input={}){for(let i=0;i<n;i++)stepAdventure(this.s,input,1/120);this.render();},render(){renderAdventure(canvas,this.s,art);}};
 });
 const canvas=page.locator('canvas');
 for(const strong of [false,true]){
  await page.evaluate(strong=>{h.make('ribbon-duration');h.tick(86);h.tick(1,strong?{special:true}:{attack:true});h.tick(1);},strong);
  for(let i=0;i<8;i++){await canvas.screenshot({path:dir+(strong?'ribbon-strong-':'ribbon-basic-')+i+'.png'});await page.evaluate(n=>h.tick(n),strong?10:6);}
 }
 for(const strong of [false,true]){await page.evaluate(strong=>{h.make('starter-9');if(strong){h.s.enemies=[];h.tick(1,{special:true});}else h.tick(90,{attack:true});},strong);await canvas.screenshot({path:dir+(strong?'volt-strong':'volt-chain')+'.png'});}
 for(const kind of [9,0,5,10]){
  await page.evaluate(kind=>{h.make('starter-'+kind);const e=h.s.enemies[0];h.s.enemies=[e];e.x=380;h.reactToElement(e,{kind});h.render();},kind);
  for(let i=0;i<4;i++){await canvas.screenshot({path:dir+'element-'+kind+'-'+i+'.png'});await page.evaluate(()=>h.tick(16));}
 }
 await page.evaluate(()=>{h.make('sky-guard');h.tick(18,{up:true,guard:true});});await canvas.screenshot({path:dir+'guard-up.png'});
 await page.evaluate(()=>{h.make('comet-dive',2);Object.assign(h.s.player,{y:100,ground:null,vy:0});h.tick(1,{dash:true,down:true,right:true});h.tick(23);});await canvas.screenshot({path:dir+'comet-kick.png'});
 await page.evaluate(()=>{const chunks=[];h.rec=new MediaRecorder(h.canvas.captureStream(30),{mimeType:'video/webm;codecs=vp9'});h.rec.ondataavailable=e=>chunks.push(e.data);h.rec.onstop=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(chunks,{type:'video/webm'}));a.download='combat-polish.webm';a.click();};h.rec.start();});
 await page.evaluate(async()=>{
  for(const id of ['ribbon-duration','starter-9','starter-8','comet-dive','sky-guard']){
   h.make(id,2);if(id==='comet-dive')Object.assign(h.s.player,{y:140,ground:null,vy:0});
   let last=await new Promise(requestAnimationFrame),lag=0;
   while(h.s.time<2.5){const now=await new Promise(requestAnimationFrame);lag+=Math.min(.05,(now-last)/1000);last=now;
    while(lag>=1/120){const t=h.s.time,pulse=a=>t>=a&&t<a+.035,input=id==='ribbon-duration'?{attack:pulse(.85)||pulse(1.18),special:pulse(1.55)}:id==='starter-9'?{attack:t<1.1,special:pulse(1.35)}:id==='starter-8'?{special:pulse(0)||pulse(2.25),right:t>.6&&t<1,attack:t>.65&&t<1.65}:id==='comet-dive'?{down:true,dash:pulse(0),right:true}:{up:true,guard:true};h.stepAdventure(h.s,input,1/120);lag-=1/120;}h.render();
   }
  }
 });
 const download=page.waitForEvent('download');await page.evaluate(()=>h.rec.stop());await(await download).saveAs(dir+'combat-polish.webm');expect(errors).toEqual([]);
});
