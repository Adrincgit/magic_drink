import fs from 'node:fs';
import {chromium,expect} from '@playwright/test';
import {openAdventureMenu} from '../../tests/arcade-input.helpers.js';

const folder='context/arcade/rehearsal-cinema/',baseURL=process.env.MAGIC_DRINK_TEST_URL||'http://127.0.0.1:4322';
fs.mkdirSync(folder,{recursive:true});
const ghostOnly=process.argv.includes('--ghost-only'),browser=await chromium.launch({channel:'chrome'}),report=ghostOnly?JSON.parse(fs.readFileSync(folder+'review-report.json','utf8')):{recordings:[],runtimeErrors:[]};
async function record(page,selector,seconds){
 return page.locator(selector).evaluate(async(canvas,seconds)=>{
  const stream=canvas.captureStream(60),parts=[],rec=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:5000000});
  const done=new Promise(resolve=>{rec.ondataavailable=e=>parts.push(e.data);rec.onstop=()=>{const r=new FileReader();r.onload=()=>resolve(String(r.result).split(',')[1]);r.readAsDataURL(new Blob(parts,{type:'video/webm'}));};});
  rec.start();await new Promise(resolve=>setTimeout(resolve,seconds*1000));rec.stop();const video=await done;stream.getTracks().forEach(t=>t.stop());return video;
 },seconds);
}
async function decode(page,name,data){
 fs.writeFileSync(folder+name+'.webm',Buffer.from(data,'base64'));
 const result=await page.evaluate(async data=>{
  const v=document.createElement('video');v.muted=true;const loaded=new Promise((resolve,reject)=>{v.onloadeddata=resolve;v.onerror=reject;});v.src='data:video/webm;base64,'+data;await loaded;
  if(!Number.isFinite(v.duration))await new Promise(resolve=>{v.onseeked=resolve;v.currentTime=1e6;});
  const w=480,h=270,gap=25,sheet=document.createElement('canvas');sheet.width=w*2;sheet.height=(h+gap)*3;const c=sheet.getContext('2d');
  for(let i=0;i<6;i++){const time=.12+i*(v.duration-.3)/5;await new Promise(resolve=>{v.onseeked=resolve;v.currentTime=time;});const x=i%2*w,y=Math.floor(i/2)*(h+gap);c.drawImage(v,x,y,w,h);c.fillStyle='#231c2c';c.fillRect(x,y+h,w,gap);c.fillStyle='#ffe8aa';c.font='15px Arial';c.fillText(time.toFixed(2)+' s',x+10,y+h+18);}
  return{png:sheet.toDataURL('image/png').split(',')[1],duration:v.duration,width:v.videoWidth,height:v.videoHeight};
 },data);
 fs.writeFileSync(folder+name+'-playback.png',Buffer.from(result.png,'base64'));report.recordings=report.recordings.filter(q=>q.name!==name);report.recordings.push({name,duration:result.duration,width:result.width,height:result.height});console.log(name+': recorded and decoded');
}
try{
 const page=await browser.newPage({baseURL,viewport:{width:1440,height:900}});page.on('pageerror',e=>report.runtimeErrors.push(e.message));await page.goto('/arcade');await openAdventureMenu(page);
 await page.getByRole('button',{name:/Cómo jugar/}).click();
 for(const id of ['aim','fire','drink','strong','super','guard']){
  if(ghostOnly)continue;
  await page.locator('[data-tutorial-lesson='+id+']').click();await expect(page.locator('[data-tutorial-canvas]')).toHaveAttribute('data-lesson',id);
  const data=await record(page,'[data-tutorial-canvas]',id==='guard'?8.3:id==='super'?8.1:5.2);await decode(page,'demo-'+id,data);
 }
 await page.locator('[data-tutorial-back]').click();await page.locator('[data-open-settings]').click();await page.getByRole('tab',{name:'Imagen',exact:true}).click();
 await page.screenshot({path:folder+'options-desktop.png'});await page.locator('[data-vintage-toggle]').click();await page.locator('[data-visual-setting=vintageStrength]').scrollIntoViewIfNeeded();await page.screenshot({path:folder+'options-vintage.png'});
 await page.keyboard.press('Escape');await page.screenshot({path:folder+'vintage-title.png'});await page.locator('[data-practice]').click();await expect(page.locator('[data-chapter-intro]')).toBeVisible();await page.waitForTimeout(600);await page.screenshot({path:folder+'chapter-vintage.png'});
 await expect(page.locator('[data-hexy-adventure]')).toHaveAttribute('data-phase','playing');await page.keyboard.press('KeyP');await page.screenshot({path:folder+'desktop-pause.png'});
 await page.locator('[data-open-settings]').click();await page.getByRole('tab',{name:'Imagen',exact:true}).click();await page.setViewportSize({width:390,height:844});await page.locator('[data-vintage-toggle]').scrollIntoViewIfNeeded();await page.screenshot({path:folder+'options-mobile.png'});
 await page.route('**/__ghost_facing_review',route=>route.fulfill({contentType:'text/html',body:'<body style="margin:0;background:#211c2b"></body>'}));await page.setViewportSize({width:960,height:540});await page.goto('/__ghost_facing_review');
 await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/',w=window.ghostReview=Object.assign({},...await Promise.all(['engine/adventureModel.js','actors/enemies/adventureEnemies.js','render/adventureCanvas.js'].map(p=>import(root+p))));w.art=await w.loadAdventureArt();
  const s=w.s=w.createAdventure(7);s.enemies=[];s.graves=[];s.villagers=[];s.damage=()=>{};for(const k of ['outposts','supplies','stars','cages','hazards','villageObstacles','villageRubble','carriages','effects','hostile'])s[k]=[];
  const e=w.e=Object.assign(w.makeEnemy(4000,480,19),{active:true,baseY:480,y:348,phase:'patrol',timer:999,blinkCooldown:999,dir:1});s.enemies=[e];w.canvas=document.createElement('canvas');w.canvas.dataset.ghostReview='';document.body.append(w.canvas);w.canvas.style='display:block;width:960px;height:540px';w.trace=[];let last=0,acc=0;
  const frame=now=>{w.raf=requestAnimationFrame(frame);acc+=last?Math.min(.05,(now-last)/1000):0;last=now;while(acc>=1/120){s.time+=1/120;s.fxTime+=1/120;const side=s.time<2.3?1:-1;s.player.x=4000+Math.sin(s.time*21)*4;s.player.y=e.y+side*145;s.player.dir=1;w.updateEnemies(s,1/120,()=>({x:0,y:0,w:1,h:1}),()=>{});w.trace.push({t:s.time,x:e.x,dir:e.dir,dy:s.player.y-e.y});acc-=1/120;}s.camera={x:3600,y:80,zoom:1.2,backdropY:0};w.renderAdventure(w.canvas,s,w.art);};w.raf=requestAnimationFrame(frame);
 });
 await decode(page,'ghost-vertical',await record(page,'[data-ghost-review]',4.6));report.ghost=await page.evaluate(()=>{const w=window.ghostReview;cancelAnimationFrame(w.raf);return{directions:[...new Set(w.trace.map(q=>q.dir))],xRange:[Math.min(...w.trace.map(q=>q.x)),Math.max(...w.trace.map(q=>q.x))],samples:w.trace.length};});
 fs.writeFileSync(folder+'review-report.json',JSON.stringify(report,null,2));if(report.runtimeErrors.length)throw Error(report.runtimeErrors.join('\n'));
}finally{await browser.close();}
