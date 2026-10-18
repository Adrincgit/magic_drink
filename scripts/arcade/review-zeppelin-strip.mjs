import fs from 'node:fs';
import {chromium} from '@playwright/test';
const dir='context/arcade/zeppelin-strip/';fs.mkdirSync(dir,{recursive:true});const browser=await chromium.launch({channel:'chrome'}),report={pixels:[],cases:[],runtimeErrors:[]};
try{
 const page=await browser.newPage({viewport:{width:960,height:540}});page.on('pageerror',e=>report.runtimeErrors.push(e.message));await page.route('**/__zeppelin_strip',r=>r.fulfill({contentType:'text/html',body:'<body style="margin:0;background:#241d2c"></body>'}));await page.goto((process.env.MAGIC_DRINK_TEST_URL||'http://127.0.0.1:4322')+'/__zeppelin_strip');
 await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/',w=window.shipReview=Object.assign({},...await Promise.all(['engine/adventureModel.js','actors/enemies/adventureEnemies.js','actors/enemies/adventureZeppelin.js','render/adventureCanvas.js','render/zeppelinCanvas.js'].map(p=>import(root+p))));w.art=await w.loadAdventureArt();w.canvas=document.createElement('canvas');w.canvas.style='display:block;width:960px;height:540px';document.body.append(w.canvas);
  w.native=(frame,dir)=>{
   const canvas=document.createElement('canvas');canvas.width=512;canvas.height=384;const c=canvas.getContext('2d'),fieldWidth=w.ZEPPELIN_WIDTH*466/429.25,cellHeight=fieldWidth*w.ZEPPELIN_CELL_ASPECT;
   c.scale(512/fieldWidth,384/cellHeight);w.drawZeppelin(c,{x:fieldWidth/2,y:cellHeight*.848,dir,hp:12,phase:frame===1?'windup':'flight',action:frame===2?.4:frame===3?.1:0,clock:0},w.art);return canvas;
  };
  w.setup=spec=>{
   w.spec=spec;w.age=0;w.trace=[];const s=w.s=w.createAdventure(1);for(const key of ['enemies','outposts','supplies','hazards','stars','cages'])s[key]=[];
   Object.assign(s.player,{x:900+spec.dir*310,y:480,ground:0,hurt:999});const e=w.e=w.makeEnemy(900,315,7);Object.assign(e,{flightActive:true,dir:spec.dir,timer:.35,patrol:{left:880,right:920,speed:.01}});s.enemies=[e];s.noticeTime=0;
  };
  w.record=async()=>{
   const stream=w.canvas.captureStream(60),parts=[],rec=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:5000000});const done=new Promise(resolve=>{rec.ondataavailable=e=>parts.push(e.data);rec.onstop=()=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.readAsDataURL(new Blob(parts,{type:'video/webm'}));};});rec.start();let start,last,acc=0;
   await new Promise((resolve,reject)=>{const frame=now=>{try{start??=now;last??=now;const wall=(now-start)/1000;acc+=Math.min(.05,(now-last)/1000);last=now;while(acc>=1/120){w.stepAdventure(w.s,{},1/120);w.age+=1/120;acc-=1/120;}w.s.camera={x:900-218,y:110,zoom:2.2,backdropY:40};w.renderAdventure(w.canvas,w.s,w.art,{reduced:w.spec.reduced});w.trace.push({t:w.age,wall,frame:w.zeppelinFrame(w.e,w.spec.reduced),shots:w.s.hostile.length});if(wall<3.2)requestAnimationFrame(frame);else resolve();}catch(e){reject(e);}};requestAnimationFrame(frame);});
   rec.stop();const video=await done;stream.getTracks().forEach(t=>t.stop());return{video,trace:w.trace};
  };
 });
 const pixels=await page.evaluate(()=>{
  const w=window.shipReview,result=[];
  for(const [frame,x,y]of [[1,488,220],[2,476,220]])for(const dir of [1,-1]){
   const original=document.createElement('canvas');original.width=512;original.height=384;original.getContext('2d').drawImage(w.art['zeppelin-actions'],frame*512,0,512,384,0,0,512,384);
   const canvas=w.native(frame,dir),alpha=canvas.getContext('2d').getImageData(dir===1?x:511-x,y,1,1).data[3],sourceAlpha=original.getContext('2d').getImageData(x,y,1,1).data[3];
   const bodyAlpha=canvas.getContext('2d').getImageData(250,130,1,1).data[3];if(alpha!==0||sourceAlpha<80||bodyAlpha<200)throw Error('Atlas fragment or hull regression '+JSON.stringify({frame,dir,alpha,sourceAlpha,bodyAlpha}));result.push({frame,dir,alpha,sourceAlpha});
   if(frame===2&&dir===-1){w.before=original.toDataURL('image/png').split(',')[1];w.after=canvas.toDataURL('image/png').split(',')[1];}
  }
  const fire=w.native(2,1).getContext('2d').getImageData(455,252,1,1).data[3],smoke=w.native(3,1).getContext('2d').getImageData(451,241,1,1).data[3];if(fire<200||smoke<200)throw Error('Muzzle flash or recoil smoke cropped');result.push({flashAlpha:fire,smokeAlpha:smoke});return result;
 });report.pixels=pixels;
 for(const name of ['before','after'])fs.writeFileSync(dir+name+'-fire.png',Buffer.from(await page.evaluate(name=>window.shipReview[name],name),'base64'));
 for(const [name,spec]of [['right',{dir:1}],['left',{dir:-1}],['reduced',{dir:-1,reduced:true}]]){
  await page.evaluate(spec=>window.shipReview.setup(spec),spec);const r=await page.evaluate(()=>window.shipReview.record());fs.writeFileSync(dir+name+'.webm',Buffer.from(r.video,'base64'));
  const sheet=await page.evaluate(async({video,trace,name})=>{
   const v=document.createElement('video');v.muted=true;const loaded=new Promise((resolve,reject)=>{v.onloadeddata=resolve;v.onerror=reject;});v.src='data:video/webm;base64,'+video;await loaded;const canvas=document.createElement('canvas');canvas.width=1440;canvas.height=600;const c=canvas.getContext('2d');
   for(const [i,t]of [.12,.4,.65,.95,1.85,2.08].entries()){
    const q=trace.reduce((a,b)=>Math.abs(a.t-t)<Math.abs(b.t-t)?a:b);await new Promise(resolve=>{v.onseeked=resolve;v.currentTime=Math.max(.02,q.wall);});const x=i%3*480,y=Math.floor(i/3)*300;c.drawImage(v,x,y,480,270);c.fillStyle='#221b2b';c.fillRect(x,y+270,480,30);c.fillStyle='#ffe4c5';c.font='15px Arial';c.fillText(name+' | frame '+q.frame+' | '+q.t.toFixed(2)+' s',x+10,y+291);
   }return canvas.toDataURL('image/png').split(',')[1];
  },{...r,name});fs.writeFileSync(dir+name+'-playback.png',Buffer.from(sheet,'base64'));report.cases.push({name,frames:[...new Set(r.trace.map(q=>q.frame))],maxShots:Math.max(...r.trace.map(q=>q.shots))});console.log(name+': recorded and decoded');
 }
 fs.writeFileSync(dir+'review-report.json',JSON.stringify(report,null,2));if(report.runtimeErrors.length)throw Error(report.runtimeErrors.join('\n'));
}finally{await browser.close();}
