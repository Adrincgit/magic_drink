import fs from 'node:fs/promises';
import {chromium} from '@playwright/test';
const dir='context/arcade/balloon-air-restart/',errors=[];
const browser=await chromium.launch({channel:'chrome'}),page=await browser.newPage({viewport:{width:1440,height:900}});
page.on('pageerror',e=>errors.push(e.message));
await page.route('**/__air_review',r=>r.fulfill({contentType:'text/html',body:'<body style="margin:0;background:#171b25"></body>'}));
try{
 await page.goto((process.env.MAGIC_DRINK_TEST_URL||'http://127.0.0.1:4322')+'/__air_review');
 await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/',w=window.review=Object.assign({},...await Promise.all(['engine/adventureModel.js','render/adventureCanvas.js','world/adventureSupplies.js','world/adventureTerrain.js'].map(p=>import(root+p))));
  w.art=await w.loadAdventureArt();w.c=document.createElement('canvas');w.c.style='width:1440px;height:810px;display:block';document.body.append(w.c);
  w.paint=()=>w.renderAdventure(w.c,w.s,w.art);
  w.setup=()=>{const s=w.s=w.createAdventure();for(const k of ['enemies','outposts','supplies','stars','cages','pickups','hazards'])s[k]=[];
   Object.assign(s.player,{x:s.level.arena.left+260,y:s.level.arena.y,ground:s.platforms.length-1,hurt:99});
   Object.assign(s.boss,{phase:'recover',timer:99,engaged:true,hp:s.boss.maxHp*.5+.1,x:s.player.x+390});
   w.camera={x:s.level.arena.left,y:40,backdropY:40,zoom:1};s.camera={...w.camera};s.noticeTime=0;
  };
 });
 await page.evaluate(()=>{const w=window.review;w.setup();w.paint();});await page.locator('canvas').screenshot({path:dir+'phase-one.png'});
 const film=await page.evaluate(async()=>{
  const w=window.review,chunks=[],stream=w.c.captureStream(30),rec=new MediaRecorder(stream,{mimeType:'video/webm'});
  const done=new Promise(resolve=>{rec.ondataavailable=e=>chunks.push(e.data);rec.onstop=()=>{const r=new FileReader();r.onload=()=>resolve(String(r.result).split(',')[1]);r.readAsDataURL(new Blob(chunks,{type:'video/webm'}));};});
  rec.start();let start,last,acc=0;await new Promise(resolve=>{const frame=now=>{start??=now;last??=now;acc+=Math.min(.05,(now-last)/1000);last=now;
   if(now-start>350)w.s.boss.hp=w.s.boss.maxHp*.5;
   while(acc>=1/120){w.stepAdventure(w.s,{},1/120);w.s.camera={...w.camera};acc-=1/120;}w.paint();
   if(now-start<2700)requestAnimationFrame(frame);else resolve();};requestAnimationFrame(frame);});
  rec.stop();const b64=await done;stream.getTracks().forEach(t=>t.stop());return b64;
 });
 await fs.writeFile(dir+'phase-two.webm',Buffer.from(film,'base64'));
 await page.locator('canvas').screenshot({path:dir+'phase-two.png'});
 const map=[];
 for(let index=0;index<11;index++){
  const result=await page.evaluate(index=>{const w=window.review,s=w.s=w.createAdventure(index),q=s.supplies.find(q=>q.midpointHeart);if(!q)return{index,bossOnly:true};
   Object.assign(s.player,{x:q.x-130,y:q.y,ground:null});s.camera={x:q.x-450,y:q.y-440,backdropY:q.y-440,zoom:1};s.noticeTime=0;w.paint();return{index,x:q.x,y:q.y,middle:((s.level.spawn?.[0]??85)+s.level.exit[0])/2};
  },index);map.push(result);if(!result.bossOnly)await page.locator('canvas').screenshot({path:dir+'midpoint-'+index+'.png'});
 }
 await page.evaluate(()=>{const w=window.review,s=w.s=w.createAdventure(),q=s.supplies.find(q=>q.midpointHeart);
  for(const k of ['enemies','outposts','cages','stars','hazards'])s[k]=[];
  Object.assign(s.player,{x:q.x+150,y:q.y,ground:null});s.hearts=1;w.damageSupply(s,q,4);for(let i=0;i<90;i++)w.stepAdventure(s,{},1/120);
  s.camera={x:q.x-420,y:q.y-440,backdropY:q.y-440,zoom:1};w.paint();
 });await page.locator('canvas').screenshot({path:dir+'heart-released.png'});
 const flags=await page.evaluate(()=>{
  const w=window.review,s=w.s=w.createAdventure(),c=w.c.getContext('2d'),draw=c.drawImage.bind(c);let calls=0;
  c.drawImage=(img,...args)=>{if(img===w.art['victory-flag'])calls++;return draw(img,...args);};
  s.player.x=s.level.checkpoints[0][0];s.camera.x=s.player.x-400;w.paint();const normal=calls;
  s.clear={age:1,flagX:s.player.x,flagY:s.player.y};w.paint();c.drawImage=draw;return{normal,completion:calls-normal};
 });if(flags.normal!==0||flags.completion<1)throw Error('Flag regression '+JSON.stringify(flags));
 await fs.writeFile(dir+'runtime.json',JSON.stringify({errors,map,flags},null,2));
 // Review decoded video frames, rather than only the packed source image.
 await page.setContent('<video muted></video>');const png=await page.evaluate(async film=>{
  const v=document.querySelector('video');v.src='data:video/webm;base64,'+film;await new Promise(r=>v.onloadeddata=r);
  if(!Number.isFinite(v.duration))await new Promise(r=>{v.onseeked=r;v.currentTime=1e6;});
  const c=document.createElement('canvas');c.width=1440;c.height=660;const b=c.getContext('2d');
  for(let i=0;i<6;i++){const t=[.12,.5,.85,1.2,1.65,2.25][i];await new Promise(r=>{v.onseeked=r;v.currentTime=t;});const x=i%3*480,y=Math.floor(i/3)*330;
   b.fillStyle='#171b25';b.fillRect(x,y,480,330);b.drawImage(v,500,50,800,510,x,y,480,306);b.fillStyle='white';b.font='16px sans-serif';b.fillText(t.toFixed(2)+' s',x+8,y+325);
  }return c.toDataURL('image/png').split(',')[1];
 },film);await fs.writeFile(dir+'phase-two-playback.png',Buffer.from(png,'base64'));
 if(errors.length)throw Error(errors.join('\n'));console.log(JSON.stringify({map,flags}));
}finally{await browser.close();}
