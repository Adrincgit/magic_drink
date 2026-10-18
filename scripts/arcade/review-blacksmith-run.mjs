import fs from 'node:fs';
import {chromium} from '@playwright/test';

const dir='context/arcade/blacksmith-run/review/';fs.mkdirSync(dir,{recursive:true});
const browser=await chromium.launch({channel:'chrome'});
try{
 const page=await browser.newPage({viewport:{width:960,height:540}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/__blacksmith_review',r=>r.fulfill({contentType:'text/html',body:'<body style="margin:0"></body>'}));
 await page.goto((process.env.MAGIC_DRINK_TEST_URL||'http://127.0.0.1:4322')+'/__blacksmith_review');
 await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/',w=window.runReview=Object.assign({},...await Promise.all(['engine/adventureModel.js','engine/villageCrowd.js','world/adventureTerrain.js','actors/villageVillagers.js','render/adventureCanvas.js'].map(p=>import(root+p))));
  w.art=await w.loadAdventureArt();const before=new Image();before.src='/arcade/sprites/enemies/village-blacksmith-run-v8.webp';await before.decode();w.art['blacksmith-before']=before;
  w.profile={...w.villageVillagerProfile(6)};w.canvas=document.createElement('canvas');w.canvas.style='display:block;width:960px;height:540px';document.body.append(w.canvas);
  w.setup=({old=false,speed=205,full=false})=>{
   const p=w.villageVillagerProfile(6);Object.assign(p,w.profile);if(old)Object.assign(p,{runKey:'blacksmith-before',runBase:0,runFrames:8,runByDistance:false,runFlip:false,runDuration:.72});
   const s=w.s=w.createAdventure(7);for(const k of ['enemies','outposts','supplies','stars','cages','hazards','villageObstacles','villageRubble','carriages','effects','hostile'])s[k]=[];
   s.platforms=s.platforms.filter(q=>!q.villageObstacle);s.noticeTime=0;const x=3500,floor=w.groundY(s.level.route,x);
   Object.assign(s.player,{x:x-1000,y:floor,hurt:999,ground:0});
   w.n={...s.level.villagers.find(n=>n.style===6),id:'run-review',x,y:floor,state:'flee',runAge:0,gait:0,age:0,speed,warning:false,trip:false,tripped:true,warned:true,defender:false,safeX:-1000};s.villagers=[w.n];
   w.age=0;w.wall=0;w.trace=[];w.full=full;
   w.paint=()=>{const n=w.n;s.camera={x:n.x-(full?240:200),y:n.y-(full?250:205),zoom:full?1.5:2,backdropY:40};w.renderAdventure(w.canvas,s,w.art);};w.paint();
  };
  w.step=()=>{w.stepVillageCrowd(w.s,1/120);w.s.time+=1/120;w.s.fxTime+=1/120;w.age+=1/120;const n=w.n;w.trace.push({t:w.age,wall:w.wall,x:n.x,gait:n.gait,frame:w.villageVillagerRunFrame(n),dust:w.s.villageDust.filter(d=>d.age===0).length});};
  w.record=async seconds=>{
   const stream=w.canvas.captureStream(60),parts=[],rec=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:5000000});
   const done=new Promise(resolve=>{rec.ondataavailable=e=>parts.push(e.data);rec.onstop=()=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.readAsDataURL(new Blob(parts,{type:'video/webm'}));};});
   rec.start();let start,last,acc=0;await new Promise((resolve,reject)=>{const frame=now=>{try{start??=now;last??=now;w.wall=(now-start)/1000;acc+=Math.min(.05,(now-last)/1000);last=now;while(acc>=1/120){w.step();acc-=1/120;}w.paint();if(w.wall<seconds)requestAnimationFrame(frame);else resolve();}catch(e){reject(e);}};requestAnimationFrame(frame);});
   rec.stop();const video=await done;stream.getTracks().forEach(t=>t.stop());return{video,trace:w.trace};
  };
 });
 const report=[];
 for(const [name,spec]of [['before',{old:true}],['after',{speed:205}],['slow',{speed:160}],['fast',{speed:260}],['in-village',{speed:205,full:true}]]){
  if(process.argv[2]&&!new RegExp(process.argv[2]).test(name))continue;
  await page.evaluate(spec=>window.runReview.setup(spec),spec);const r=await page.evaluate(()=>window.runReview.record(3.5));
  fs.writeFileSync(dir+name+'.webm',Buffer.from(r.video,'base64'));fs.writeFileSync(dir+name+'-trace.json',JSON.stringify(r.trace));
  const decoded=await page.evaluate(async({video,trace,old})=>{
   const v=document.createElement('video');v.muted=true;const loaded=new Promise((resolve,reject)=>{v.onloadeddata=resolve;v.onerror=reject;});v.src='data:video/webm;base64,'+video;await loaded;
   const count=old?8:12,samples=[];for(let frame=0;frame<count;frame++){const first=trace.findIndex(q=>q.frame===frame&&q.t>.2);let last=first;while(last+1<trace.length&&trace[last+1].frame===frame)last++;samples.push(trace[Math.round((first+last)/2)]);}
   const sheet=document.createElement('canvas');sheet.width=1280;sheet.height=Math.ceil(count/4)*304;const c=sheet.getContext('2d');
   for(const [i,q]of samples.entries()){
    if(!q)throw Error('Missing recorded drawing '+i);await new Promise(resolve=>{v.onseeked=resolve;v.currentTime=Math.max(.02,q.wall);});
    const x=i%4*320,y=Math.floor(i/4)*304;c.drawImage(v,200,130,460,370,x,y,320,278);c.fillStyle='#201d29';c.fillRect(x,y+278,320,26);c.fillStyle='#fff0d0';c.font='14px sans-serif';c.fillText('pose '+q.frame+' | sim '+q.t.toFixed(2)+' s',x+8,y+296);
   }return sheet.toDataURL('image/png').split(',')[1];
  },{video:r.video,trace:r.trace,old:!!spec.old});fs.writeFileSync(dir+name+'-playback.png',Buffer.from(decoded,'base64'));
  const full=await page.evaluate(()=>window.runReview.canvas.toDataURL('image/png').split(',')[1]);fs.writeFileSync(dir+name+'-scene.png',Buffer.from(full,'base64'));
  report.push({name,frames:[...new Set(r.trace.map(q=>q.frame))],travel:r.trace[0].x-r.trace.at(-1).x,footfalls:r.trace.reduce((n,q)=>n+q.dust,0)});console.log(name+': recorded and decoded');
 }
 fs.writeFileSync(dir+'report.json',JSON.stringify({cases:report,runtimeErrors:errors},null,2));if(errors.length)throw Error(errors.join('\n'));
}finally{await browser.close();}
