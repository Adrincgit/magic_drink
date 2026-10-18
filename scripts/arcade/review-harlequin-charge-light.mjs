import fs from 'node:fs';
import {chromium} from '@playwright/test';
const dir='context/arcade/harlequin-charge-light/';fs.mkdirSync(dir,{recursive:true});
const browser=await chromium.launch({channel:'chrome'}),report={cases:[],runtimeErrors:[]};
try{
 const page=await browser.newPage({viewport:{width:960,height:540}});page.on('pageerror',e=>report.runtimeErrors.push(e.message));await page.route('**/__harlequin_charge_review',route=>route.fulfill({contentType:'text/html',body:'<body style="margin:0;background:#1e1623"></body>'}));await page.goto((process.env.MAGIC_DRINK_TEST_URL||'http://127.0.0.1:4322')+'/__harlequin_charge_review');
 await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/',w=window.fireReview=Object.assign({},...await Promise.all(['engine/adventureModel.js','actors/bosses/harlequinUltimate.js','render/adventureCanvas.js','render/adventureCamera.js','render/clashAtmosphereCanvas.js'].map(p=>import(root+p))));w.art=await w.loadAdventureArt();w.canvas=document.createElement('canvas');w.canvas.style='display:block;width:960px;height:540px';document.body.append(w.canvas);
  w.setup=spec=>{
   w.spec=spec;w.age=0;w.wall=0;w.trace=[];const s=w.s=w.createAdventure(3),a=s.level.arena;s.arenaLocked=true;s.noticeTime=0;for(const key of ['supplies','stars','enemies','hazards','outposts'])s[key]=[];
   Object.assign(s.player,{x:spec.reverse?a.right-260:a.left+260,y:a.y,ground:2,hurt:999});Object.assign(s.boss,{x:spec.reverse?a.left+250:a.right-250,y:a.y,phase:'recover',timer:100,engaged:true,vulnerable:true,stage:3,hp:240,turn:3});
   for(let n=0;n<600;n++)w.followAdventureCamera(s,1/120);w.beginHarlequinUltimate(s);for(let n=0;n<150&&s.boss.ultimate?.state==='leap';n++)w.stepAdventure(s,{},1/120);
  };
  w.record=async()=>{
   const stream=w.canvas.captureStream(60),parts=[],rec=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:5000000});const done=new Promise(resolve=>{rec.ondataavailable=e=>parts.push(e.data);rec.onstop=()=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.readAsDataURL(new Blob(parts,{type:'video/webm'}));};});rec.start();let start,last,acc=0;
   await new Promise((resolve,reject)=>{const frame=now=>{try{start??=now;last??=now;w.wall=(now-start)/1000;acc+=Math.min(.05,(now-last)/1000);last=now;while(acc>=1/120){const input={super:w.spec.clash&&w.age>=.55};w.stepAdventure(w.s,input,1/120);w.age+=1/120;acc-=1/120;}const hurt=w.s.player.hurt;w.s.player.hurt=0;w.renderAdventure(w.canvas,w.s,w.art,{reduced:w.spec.reduced});w.s.player.hurt=hurt;w.trace.push({wall:w.wall,t:w.age,state:w.s.boss.ultimate?.state,clash:w.s.powerClash?.state,visualAge:w.harlequinChargeAge(w.s),arrived:Array.from({length:48},(_,i)=>w.harlequinChargeParticle(w.s,i)).filter(p=>p.phase===1).length});if(w.wall<3.65)requestAnimationFrame(frame);else resolve();}catch(e){reject(e);}};requestAnimationFrame(frame);});
   rec.stop();const video=await done;stream.getTracks().forEach(t=>t.stop());return{video,trace:w.trace};
  };
 });
 for(const [name,spec]of [['right',{}],['left',{reverse:true}],['counterattack',{clash:true}],['reduced',{reduced:true}]]){
  await page.evaluate(spec=>window.fireReview.setup(spec),spec);const r=await page.evaluate(()=>window.fireReview.record());fs.writeFileSync(dir+name+'.webm',Buffer.from(r.video,'base64'));fs.writeFileSync(dir+name+'-trace.json',JSON.stringify(r.trace));
  const sheet=await page.evaluate(async({video,trace,name})=>{
   const v=document.createElement('video');v.muted=true;const loaded=new Promise((resolve,reject)=>{v.onloadeddata=resolve;v.onerror=reject;});v.src='data:video/webm;base64,'+video;await loaded;const canvas=document.createElement('canvas');canvas.width=1440;canvas.height=600;const c=canvas.getContext('2d');
   for(const [i,t]of [.32,.85,1.35,1.9,2.62,3.13].entries()){
    const sample=trace.reduce((a,b)=>Math.abs(a.t-t)<Math.abs(b.t-t)?a:b);await new Promise(resolve=>{v.onseeked=resolve;v.currentTime=Math.max(.02,sample.wall);});const x=i%3*480,y=Math.floor(i/3)*300;c.drawImage(v,x,y,480,270);c.fillStyle='#211827';c.fillRect(x,y+270,480,30);c.fillStyle='#ffe3c0';c.font='15px Arial';c.fillText(name+' | '+sample.t.toFixed(2)+' s | '+sample.state,x+10,y+291);
    if(i===2){const still=document.createElement('canvas');still.width=960;still.height=540;still.getContext('2d').drawImage(v,0,0);window.fireReview.still=still.toDataURL('image/png').split(',')[1];}
   }return canvas.toDataURL('image/png').split(',')[1];
  },{...r,name});fs.writeFileSync(dir+name+'-playback.png',Buffer.from(sheet,'base64'));fs.writeFileSync(dir+name+'-charge.png',Buffer.from(await page.evaluate(()=>window.fireReview.still),'base64'));report.cases.push({name,frames:r.trace.length,release:r.trace.find(q=>q.state==='fire')?.t,allArrived:r.trace.find(q=>q.state==='charge'&&q.arrived===48)?.t});console.log(name+': recorded and decoded');
 }
 fs.writeFileSync(dir+'review-report.json',JSON.stringify(report,null,2));if(report.runtimeErrors.length)throw Error(report.runtimeErrors.join('\n'));
}finally{await browser.close();}
