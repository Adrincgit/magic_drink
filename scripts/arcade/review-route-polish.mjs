import fs from 'node:fs';
import {chromium} from '@playwright/test';
const dir='context/arcade/route-polish/review/';fs.mkdirSync(dir,{recursive:true});
const browser=await chromium.launch({channel:'chrome'});
try{
 const page=await browser.newPage({viewport:{width:960,height:540}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/__route_polish',r=>r.fulfill({contentType:'text/html',body:'<body style="margin:0;background:#292331"></body>'}));
 await page.goto((process.env.MAGIC_DRINK_TEST_URL||'http://127.0.0.1:4322')+'/__route_polish');
 await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/';
  const w=window.review=Object.assign({},...await Promise.all(['engine/adventureModel.js','actors/enemies/adventureEnemies.js','render/adventureCanvas.js','actors/hexy/hexyAnimation.js','engine/adventureSuper.js','world/adventureTerrain.js','engine/adventurePlacement.js'].map(f=>import(root+f))));
  w.art=await w.loadAdventureArt();w.canvas=document.createElement('canvas');w.canvas.style='display:block;width:960px;height:540px';document.body.append(w.canvas);
  w.setup=spec=>{
   w.spec=spec;w.age=0;w.trace=[];const s=w.s=w.createAdventure(spec.index||0);s.noticeTime=0;s.enemies=[];s.hazards=[];s.stars=[];s.cages=[];s.player.hurt=999;
   if(!spec.props){s.outposts=[];s.supplies=[];s.graves=[];}
   const x=spec.x??(spec.barge?s.boss.x-430:spec.index===3?s.level.spawn[0]:1000),floor=w.groundY(s.platforms,x);
   Object.assign(s.player,{x,y:floor-(spec.air?135:0),ground:spec.air?null:s.platforms.findIndex(p=>x>=p.x&&x<=p.x+p.w),vy:0});
   w.fixed=spec.camera||{x:x-280,y:floor-420,zoom:1,backdropY:40};
   if(spec.barge){Object.assign(s.boss,{phase:'warn',move:spec.move||'drumroll',timer:.5,engaged:true,vulnerable:true});s.arenaLocked=true;w.fixed={x:s.boss.x-710,y:155,zoom:.8,backdropY:195};}
   if(spec.defeat){s.boss.hp=0;s.boss.engaged=true;}
   if(spec.dust){const e=w.makeEnemy(x+380,floor,0);e.dir=-1;e.active=true;s.enemies=[e];}
   if(spec.ultimate){w.beginSuper(s,{super:true,...spec.input});}
   if(spec.placement){s.weapon=spec.placement;s.ammo=s.ammoCapacity=100;w.startPlacement(s,spec.placement);w.stepPlacement(s,{special:true},0);if(spec.trial)s.trial={};}
   Object.assign(s.camera,w.fixed);w.renderAdventure(w.canvas,s,w.art);
  };
  w.step=()=>{
   const s=w.s,q=w.spec,t=w.age;w.age+=1/120;
   let input={};
   if(q.run)input={right:true,attack:t>.25&&t<.32||t>1.15&&t<1.22,special:t>1.8&&t<1.86};
   if(q.dust)input={right:true,jump:t>.65&&t<.81};
   if(q.pass)input={right:true};
   if(q.water)input={hold:true,down:true,attack:true};
   if(q.ultimate)input={super:true,...q.input};
   if(q.placement)input={special:true};
   s.player.hurt=999;w.stepAdventure(s,input,1/120);Object.assign(s.camera,w.fixed);
   if(Math.floor(w.age*24)!==Math.floor(t*24))w.trace.push({t:w.age,pose:w.hexyPose(s),x:s.player.x,y:s.player.y,dust:s.surfaceDust.length,shots:s.shots.length,splashes:s.effects.filter(q=>q.bargeSplash).length,jet:s.hostile.filter(q=>q.kind==='barge-jet').map(q=>({x:q.x,length:q.length,life:q.life})),boss:{phase:s.boss.phase,x:s.boss.x,shattered:s.boss.shattered,age:s.boss.defeat?.age}});
  };
  w.record=async seconds=>{
   const stream=w.canvas.captureStream(60),parts=[],rec=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:4000000});
   const done=new Promise(resolve=>{rec.ondataavailable=e=>parts.push(e.data);rec.onstop=()=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.readAsDataURL(new Blob(parts,{type:'video/webm'}));};});
   rec.start();let start,last,acc=0;
   await new Promise((resolve,reject)=>{const frame=now=>{try{start??=now;last??=now;acc+=Math.min(.05,(now-last)/1000);last=now;while(acc>=1/120){w.step();acc-=1/120;}const hurt=w.s.player.hurt;w.s.player.hurt=0;w.renderAdventure(w.canvas,w.s,w.art);w.s.player.hurt=hurt;if(now-start<seconds*1000)requestAnimationFrame(frame);else resolve();}catch(e){reject(e);}};requestAnimationFrame(frame);});
   rec.stop();const video=await done;stream.getTracks().forEach(t=>t.stop());return{video,trace:w.trace};
  };
 });
 const cases=[
  ['run-tap',{run:true},2.7],['forest-dust',{index:5,x:800,dust:true},2.5],['cemetery-dust',{index:6,x:1100,dust:true},2.5],
  ['water-surface',{index:2,x:3300,water:true},3],
  ['barge-drum',{index:2,barge:true,move:'drumroll'},4],['barge-jet',{index:2,barge:true,move:'jet'},3.4],['barge-tidal',{index:2,barge:true,move:'tidal'},4],
  ['barge-pass',{index:2,barge:true,move:'boarding',pass:true},3],['barge-collapse',{index:2,barge:true,defeat:true},4.4],
  ...[false,true].flatMap(air=>[['up',{up:true}],['up-diagonal',{up:true,right:true}],['down-diagonal',{down:true,right:true}],['down',{down:true}],['down-left',{down:true,left:true}]].map(([name,input])=>['ultimate-'+name+(air?'-air':'-ground'),{index:2,x:3300,air,ultimate:true,input},2.4])),
 ];
 const report=[];
 for(const [name,spec,seconds] of cases){
  if(process.argv[2]&&!new RegExp(process.argv[2]).test(name))continue;
  await page.evaluate(spec=>window.review.setup(spec),spec);const result=await page.evaluate(seconds=>window.review.record(seconds),seconds);
  fs.writeFileSync(dir+name+'.webm',Buffer.from(result.video,'base64'));fs.writeFileSync(dir+name+'-trace.json',JSON.stringify(result.trace));
  const playback=await page.evaluate(async({data,seconds,name})=>{
   const video=document.createElement('video');video.muted=true;const loaded=new Promise((resolve,reject)=>{video.onloadeddata=resolve;video.onerror=reject;});video.src='data:video/webm;base64,'+data;await loaded;
   const sheet=document.createElement('canvas');sheet.width=1440;sheet.height=900;const c=sheet.getContext('2d');
   for(let i=0;i<9;i++){const time=.06+i*(seconds-.18)/8;await new Promise(resolve=>{video.onseeked=resolve;video.currentTime=time;});const x=i%3*480,y=Math.floor(i/3)*300;c.drawImage(video,0,0,960,540,x,y,480,270);c.fillStyle='#201d29';c.fillRect(x,y+270,480,30);c.fillStyle='#fff0d0';c.font='16px sans-serif';c.fillText(name+' | '+time.toFixed(2)+' s',x+8,y+291);}
   return sheet.toDataURL('image/png').split(',')[1];
  },{data:result.video,seconds,name});fs.writeFileSync(dir+name+'-playback.png',Buffer.from(playback,'base64'));
  report.push({name,frames:result.trace.length,maxDust:Math.max(...result.trace.map(q=>q.dust)),maxSplashes:Math.max(...result.trace.map(q=>q.splashes)),sheets:[...new Set(result.trace.map(q=>q.pose.sheet))]});console.log(name+': recorded and decoded');
 }
 if(!process.argv[2]||process.argv[2]==='composition')for(const index of [0,3,6]){
  const positions=await page.evaluate(index=>{const s=window.review.createAdventure(index);return index===3?s.campTents.map(q=>q.x):s.supplies.map(q=>q.x);},index);
  for(const [i,x] of positions.entries()){
   await page.evaluate(spec=>window.review.setup(spec),{index,x,props:true});await page.screenshot({path:dir+`composition-${index}-${i}.png`});
  }
 }
 for(const kind of [6,10])for(const trial of [false,true]){await page.evaluate(spec=>window.review.setup(spec),{placement:kind,trial});await page.screenshot({path:dir+`placement-${kind}-${trial?'trial':'campaign'}.png`});}
 fs.writeFileSync(dir+'report'+(process.argv[2]?'-partial':'')+'.json',JSON.stringify({cases:report,runtimeErrors:errors},null,2));if(errors.length)throw Error(errors.join('\n'));
}finally{await browser.close();}
