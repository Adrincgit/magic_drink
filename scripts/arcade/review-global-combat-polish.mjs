import fs from 'node:fs/promises';
import {chromium} from '@playwright/test';
const dir='context/arcade/global-combat-polish/';
const browser=await chromium.launch({channel:'chrome'}),page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));await page.route('**/__combat_review',r=>r.fulfill({contentType:'text/html',body:'<body style="margin:0;background:#171b25"></body>'}));
try{
 await page.goto((process.env.MAGIC_DRINK_TEST_URL||'http://127.0.0.1:4322')+'/__combat_review');
 await page.evaluate(async()=>{
  const base='/src/components/arcade/adventure/',w=window.review=Object.assign({},...await Promise.all(['engine/adventureModel.js','actors/hexy/hexyAnimation.js','render/adventureCanvas.js','actors/enemies/adventureEnemies.js','actors/enemies/adventureEnemyGeometry.js','actors/enemies/adventureEnemyTraits.js'].map(p=>import(base+p))));
  w.art=await w.loadAdventureArt();w.canvas=document.createElement('canvas');w.canvas.style='width:1440px;height:810px;display:block';document.body.append(w.canvas);
  w.setup=name=>{
   const weapon={fire:0,water:5,jelly:6,honey:10}[name]??-1,s=w.s=w.createAdventure(7,false,{weapon,ammo:600});
   s.level={...s.level,checkpoints:[],spookyIdle:false};for(const k of ['enemies','villagers','villageRubble','villageStones','villageObstacles','villageBlockades','outposts','supplies','cages','stars','hazards','carriages','campTents'])s[k]=[];
   s.platforms=[{x:0,y:480,w:30000,h:350,baseY:480,dx:0,dy:0,kind:'earth'}];s.level.route=s.platforms;s.noticeTime=0;s.village.furthest=20000;
   Object.assign(s.player,{x:7460,y:480,ground:0,hurt:999});w.camera={x:7220,y:0,backdropY:40,zoom:1};s.camera={...w.camera};w.keys={};w.name=name;w.trace=[];w.events=[];
   if(name.startsWith('air')){Object.assign(s.player,{x:name==='air-left'?7850:7580,y:285,ground:null,vy:190,dir:name==='air-left'?-1:1});w.stepAdventure(s,{super:true},1/120);s.camera={...w.camera};}
   else if(name==='resistance'){
    s.player.x=9100;w.camera.x=9000;s.camera={...w.camera};s.enemies=[0,12,20,28].map((type,i)=>Object.assign(w.makeEnemy(9280+i*190,480,type),{active:true,timer:99}));
    s.shots=s.enemies.map(e=>{const b=w.enemyBody(e);return{kind:3,heavy:true,x:b.x+b.w/2,y:b.y+b.h/2,vx:0,vy:0,r:25,scale:1,damage:1,life:.5,age:0,hits:[],hitTimes:new Map()};});
    w.stepAdventure(s,{},1/120);s.camera={...w.camera};
    for(let i=0;i<46;i++){w.stepAdventure(s,{},1/120);s.camera={...w.camera};}
   }else{s.enemies=[Object.assign(w.makeEnemy(7680,480,18),{hp:500,maxHp:500,timer:99,active:true})];w.keys={attack:true};}
  };
  w.paint=()=>w.renderAdventure(w.canvas,w.s,w.art);
  w.step=()=>{
   w.stepAdventure(w.s,w.keys,1/120);w.s.camera={...w.camera};const s=w.s,p=s.player,pose=w.hexyPose(s),muzzle=w.hexyMuzzle(s);
   w.trace.push({time:s.fxTime,x:p.x,y:p.y,pose,muzzle,beam:s.superCinematic?.origin,enemies:s.enemies.map(e=>({type:e.type,x:e.x,y:e.y,hp:e.hp,trap:e.trap,honeyed:e.honeyed,burning:!!e.burning,role:w.enemyClass(e)}))});
   for(const event of s.events)w.events.push({time:s.fxTime,kind:typeof event==='string'?event:event.kind});
  };
  w.record=async(seconds)=>{
   const chunks=[],stream=w.canvas.captureStream(30),recorder=new MediaRecorder(stream,{mimeType:'video/webm'}),done=new Promise(resolve=>{recorder.ondataavailable=e=>chunks.push(e.data);recorder.onstop=()=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.readAsDataURL(new Blob(chunks,{type:'video/webm'}));};});
   recorder.start();let start,last,acc=0;await new Promise(resolve=>{const frame=now=>{start??=now;last??=now;acc+=Math.min(.05,(now-last)/1000);last=now;while(acc>=1/120){w.step();acc-=1/120;}w.paint();if(now-start<seconds*1000)requestAnimationFrame(frame);else resolve();};requestAnimationFrame(frame);});recorder.stop();const data=await done;stream.getTracks().forEach(t=>t.stop());return data;
  };
 });
 const selected=process.env.COMBAT_REVIEW_SCENES?.split(','),scenes=['air-right','air-left','fire','water','jelly','honey'].filter(name=>!selected||selected.includes(name));
 for(const name of scenes){
  await page.evaluate(n=>{window.review.setup(n);window.review.paint();},name);const data=await page.evaluate(n=>window.review.record(n.startsWith('air')?3.7:1.8),name);
  await fs.writeFile(dir+name+'.webm',Buffer.from(data,'base64'));const result=await page.evaluate(()=>({trace:window.review.trace,events:window.review.events}));await fs.writeFile(dir+name+'-trace.json',JSON.stringify(result));
  if(name.startsWith('air')){
   await page.evaluate(n=>{const w=window.review;w.setup(n);while(w.s.fxTime<1.3)w.step();w.paint();},name);await page.locator('canvas').screenshot({path:dir+name+'-release.png'});
  }
 }
 await page.evaluate(()=>{window.review.setup('resistance');window.review.paint();});await page.locator('canvas').screenshot({path:dir+'bubble-resistance.png'});
 await fs.writeFile(dir+'bubble-resistance.json',JSON.stringify(await page.evaluate(()=>window.review.s.enemies.map(e=>({type:e.type,role:window.review.enemyClass(e),trap:e.trap,hp:e.hp,maxHp:e.maxHp}))),null,2));
 await page.setContent('<video muted></video>');
 for(const name of scenes){
  const source='data:video/webm;base64,'+(await fs.readFile(dir+name+'.webm')).toString('base64'),{trace}=JSON.parse(await fs.readFile(dir+name+'-trace.json','utf8'));
  const png=await page.evaluate(async({source,name,trace})=>{
   const v=document.querySelector('video');v.src=source;await new Promise(r=>v.onloadeddata=r);if(!Number.isFinite(v.duration))await new Promise(r=>{v.onseeked=r;v.currentTime=1e6;});
   const c=document.createElement('canvas');c.width=1200;c.height=660;const b=c.getContext('2d'),air=name.startsWith('air');
   for(let i=0;i<6;i++){
    const t=air?[.12,.53,.96,1.3,1.7,2.3][i]:.12+i*.3;await new Promise(r=>{v.onseeked=r;v.currentTime=t;});const actor=trace.reduce((a,b)=>Math.abs(a.time-t)<Math.abs(b.time-t)?a:b),x=i%3*400,y=Math.floor(i/3)*330;
    const target=air?actor:actor.enemies[0],sx=(target.x-7220)*1.5-145,sy=target.y*1.5-(air?210:230);
    b.fillStyle='#171b25';b.fillRect(x,y,400,330);b.drawImage(v,sx,sy,320,260,x+15,y+6,370,300);b.fillStyle='white';b.font='14px sans-serif';b.fillText(name+' | '+t.toFixed(2)+' s'+(air?' | '+actor.pose.sheet+' '+actor.pose.frame:''),x+8,y+323);
   }
   return c.toDataURL('image/png').split(',')[1];
  },{source,name,trace});await fs.writeFile(dir+name+'-playback.png',Buffer.from(png,'base64'));
 }
 await fs.writeFile(dir+'runtime-errors.json',JSON.stringify(errors));if(errors.length)throw Error(errors.join('\n'));console.log('Reviewed '+(scenes.length?scenes.join(', ')+', ':'')+'bubble resistance.');
}finally{await browser.close();}
