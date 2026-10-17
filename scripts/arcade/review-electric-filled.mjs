import fs from 'node:fs/promises';
import {chromium} from '@playwright/test';
const dir='context/arcade/global-feedback/electric-filled-v2/';
const browser=await chromium.launch({channel:'chrome'}),page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
await page.route('**/__electric_review',r=>r.fulfill({contentType:'text/html',body:'<body style="margin:0;background:#171b25"></body>'}));
try{
 await page.goto((process.env.MAGIC_DRINK_TEST_URL||'http://127.0.0.1:4322')+'/__electric_review');
 await page.evaluate(async()=>{
  const base='/src/components/arcade/adventure/',w=window.review=Object.assign({},...await Promise.all(['engine/adventureModel.js','render/adventureCanvas.js','render/adventureSprites.js','render/electricEnemyCanvas.js','actors/enemies/adventureEnemies.js'].map(p=>import(base+p))));
  w.art=await w.loadAdventureArt();w.canvas=document.createElement('canvas');w.canvas.style='width:1440px;height:810px;display:block';document.body.append(w.canvas);
  w.setup=dir=>{
   const s=w.s=w.createAdventure(7,false,{weapon:9,ammo:600,modLevels:{'starter-9':3}});s.level={...s.level,checkpoints:[],spookyIdle:false};
   for(const k of ['enemies','villagers','villageRubble','villageStones','villageObstacles','villageBlockades','outposts','supplies','cages','stars','hazards','carriages','campTents'])s[k]=[];
   s.platforms=[{x:0,y:480,w:30000,h:350,baseY:480,dx:0,dy:0,kind:'earth'}];s.level.route=s.platforms;s.noticeTime=0;
   Object.assign(s.player,{x:dir<0?7460:8090,y:480,ground:0,dir:-dir});w.camera={x:7220,y:40,backdropY:40,zoom:1};s.camera={...w.camera};s.enemies=[0,1,3].map((type,i)=>Object.assign(w.makeEnemy(7650+i*140,480,type,i),{timer:99,hp:1000,maxHp:1000,dir}));
   w.trace=[];w.dir=dir;
  };
  w.paint=()=>w.renderAdventure(w.canvas,w.s,w.art);
  w.record=async()=>{
   const stream=w.canvas.captureStream(30),chunks=[],recorder=new MediaRecorder(stream,{mimeType:'video/webm'}),done=new Promise(resolve=>{recorder.ondataavailable=e=>chunks.push(e.data);recorder.onstop=()=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.readAsDataURL(new Blob(chunks,{type:'video/webm'}));};});
   recorder.start();let start,last,acc=0;await new Promise(resolve=>{const frame=now=>{start??=now;last??=now;acc+=Math.min(.05,(now-last)/1000);last=now;
    while(acc>=1/120){w.stepAdventure(w.s,{attack:true,left:w.dir>0},1/120);w.s.camera={...w.camera};w.trace.push({time:w.s.time,enemies:w.s.enemies.map(e=>({x:e.x,y:e.y,type:e.type,age:e.elementHit?.age,on:w.electricPulse(e),drawing:w.enemyDrawing(e)}))});acc-=1/120;}
    w.paint();if(now-start<2500)requestAnimationFrame(frame);else resolve();};requestAnimationFrame(frame);});recorder.stop();const data=await done;stream.getTracks().forEach(t=>t.stop());return data;
  };
 });
 // Compare exactly the same Hit cels at the on and off portions of a pulse.
 for(const [name,dir] of [['left',-1],['right',1]]){
  await page.evaluate(d=>{window.review.setup(d);window.review.paint();},dir);
  for(const [pulse,age] of [['on',.02],['off',.1]]){
   await page.evaluate(a=>{const w=window.review;for(const e of w.s.enemies){e.elementHit={element:'electric',age:a,life:.52-a};e.flash=0;}w.paint();},age);
   await page.locator('canvas').screenshot({path:dirPath(name+'-'+pulse+'.png')});
  }
  await page.evaluate(d=>{window.review.setup(d);window.review.paint();},dir);
  const video=await page.evaluate(()=>window.review.record());await fs.writeFile(dirPath(name+'.webm'),Buffer.from(video,'base64'));
  const trace=await page.evaluate(()=>window.review.trace);await fs.writeFile(dirPath(name+'-trace.json'),JSON.stringify(trace));
 }
 await page.setContent('<video muted></video>');
 for(const name of ['left','right']){
  const source='data:video/webm;base64,'+(await fs.readFile(dirPath(name+'.webm'))).toString('base64'),trace=JSON.parse(await fs.readFile(dirPath(name+'-trace.json'),'utf8'));
  const png=await page.evaluate(async({source,trace,name})=>{
   const video=document.querySelector('video');video.src=source;await new Promise(r=>video.onloadeddata=r);if(!Number.isFinite(video.duration))await new Promise(r=>{video.onseeked=r;video.currentTime=1e6;});
   const c=document.createElement('canvas');c.width=1200;c.height=900;const b=c.getContext('2d');
   for(let i=0;i<9;i++){
    const time=.12+i*.26;await new Promise(r=>{video.onseeked=r;video.currentTime=time;});const snap=trace.reduce((a,b)=>Math.abs(a.time-time)<Math.abs(b.time-time)?a:b),actor=snap.enemies.find(e=>e.type===[0,1,3][i%3]),x=i%3*400,y=Math.floor(i/3)*300;
    const sx=(actor.x-7220)*1.5-125,sy=(actor.y-40)*1.5-230;
    b.fillStyle='#171b25';b.fillRect(x,y,400,300);b.drawImage(video,sx,sy,250,260,x+65,y,270,280);b.fillStyle='white';b.font='14px sans-serif';b.fillText(name+' | '+time.toFixed(2)+' s | '+actor.drawing.key+' '+actor.drawing.frame,x+8,y+295);
   }
   return c.toDataURL('image/png').split(',')[1];
  },{source,trace,name});await fs.writeFile(dirPath(name+'-playback.png'),Buffer.from(png,'base64'));
 }
 await fs.writeFile(dir+'errors.json',JSON.stringify(errors));if(errors.length)throw Error(errors.join('\n'));
 console.log('Rendered both directions, recorded and decoded electric pulses.');
}finally{await browser.close();}
function dirPath(file){return dir+file;}
