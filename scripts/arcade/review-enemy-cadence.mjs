import fs from 'node:fs';
import {chromium} from '@playwright/test';
const dir='context/arcade/enemy-cadence/review/';fs.mkdirSync(dir,{recursive:true});
const browser=await chromium.launch({channel:'chrome'});
try{
 const page=await browser.newPage({viewport:{width:960,height:540}}),errors=[];page.on('pageerror',e=>{errors.push(e.message);console.error('Runtime error: '+e.message);});
 await page.route('**/__cadence',r=>r.fulfill({contentType:'text/html',body:'<body style="margin:0;background:#292331"></body>'}));
 await page.goto((process.env.MAGIC_DRINK_TEST_URL||'http://127.0.0.1:4322')+'/__cadence');
 await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/',w=window.cadence=Object.assign({},...await Promise.all(['engine/adventureModel.js','actors/enemies/adventureEnemies.js','render/adventureCanvas.js','render/adventureSprites.js','actors/bosses/adventureHarlequin.js','actors/bosses/harlequinFire.js','world/adventureTerrain.js'].map(f=>import(root+f))));
  w.art=await w.loadAdventureArt();w.c=document.createElement('canvas');w.c.id='cadence-review';w.c.style='display:block;width:960px;height:540px';document.body.append(w.c);
  w.setup=spec=>{
   const s=w.s=w.createAdventure(spec.index);w.spec=spec;w.age=0;w.trace=[];w.lastMove=-1;
   for(const key of ['outposts','campTents','stars','supplies','cages','hazards','pickups','villagers','carriages','graves','villageDust','looseBones','villageObstacles'])s[key]=[];
   s.noticeTime=0;s.damage=()=>{};s.player.hurt=999;s.boss.phase='sleep';s.enemies=[];s.level={...s.level,circusCamp:false};
   if(spec.types){
    s.platforms=[{x:0,y:480,w:s.level.width,baseY:480,yEnd:480,kind:spec.index===2?'dock':'earth',h:24}];s.level.route=s.platforms;
    s.level.emberPits=[];s.level.emberAmbushes=[];
    Object.assign(s.player,{x:spec.travelOnly?2090+(spec.dir||1)*600:2400,y:480,ground:0});
    spec.types.forEach((type,i)=>{const e=w.makeEnemy(2090+i*155,480,type,i);Object.assign(e,{active:true,nightmareHidden:false,dir:i%2?1:-1,timer:.6+i*.18,phaseAge:0,walkStride:72,acrobatWait:2.5,gait:0});
     if(type===2)Object.assign(e,{y:320,baseY:320});
     if(type===6)Object.assign(e,{y:240,vy:70,clock:0});
     if(type===7)Object.assign(e,{y:290,baseY:290,flightActive:true,patrol:{left:2050,right:2850,speed:120}});
     if(type===8)Object.assign(e,{aquatic:true,phase:'patrol',waterY:570,swimAge:0,deckAge:0,swimClock:0,diveWait:99});
     if(type===9)Object.assign(e,{boat:true,left:2120,right:2820,waterY:550,y:550,sailDir:1});
     if(type===26)Object.assign(e,{flying:i%2===0,witchObservedHp:e.hp,flightHeight:170,conjurer:!!spec.orbit});
     if(type===27)Object.assign(e,{flightHeight:135,phase:'patrol'});
     if(spec.travelOnly)Object.assign(e,{dir:spec.dir,timer:99});
     s.enemies.push(e);
    });
    w.camera={x:1930,y:80,backdropY:80,zoom:1};
   }else{
    const a=s.level.arena;Object.assign(s.player,{x:a.left+230,y:a.y,ground:s.platforms.findIndex(q=>a.left+230>=q.x&&a.left+230<=q.x+q.w),hurt:999});s.arenaLocked=true;
    Object.assign(s.boss,{engaged:true,phase:'warn',timer:1,warnDuration:1,move:spec.move||'fan',vulnerable:true,attackClock:0,stage:spec.stage||1,hp:s.boss.maxHp*(spec.stage===3?.25:spec.stage===2?.6:1)});
    if(spec.index===6)Object.assign(s.boss,{phase:'patrol',phaseDuration:1,phaseAge:0,timer:.1,bellBroken:false,turn:1});
    if(spec.index===7){s.boss.phase='sleep';const e=w.makeEnemy(a.right-350,a.y,28);Object.assign(e,{home:e.x,phase:'patrol',phaseAge:0,active:true,flying:false,harvestTurn:0,harvestStage:1,observedHp:e.hp,timer:.1,absorbCooldown:99,flightClock:0,broomPending:false});s.enemies=[e];}
    w.camera={x:s.boss.x-685,y:a.y-580,backdropY:a.y-580,zoom:.7};
    if(spec.index===7)w.camera.x=s.enemies[0].x-685;
   }
   s.camera={...w.camera};w.renderAdventure(w.c,s,w.art);
  };
  w.step=()=>{
   const s=w.s,spec=w.spec;w.age+=1/120;
   if(spec.index===3){
    const moves=['fan','dash','vault','ribbon'],part=Math.min(3,Math.floor(w.age/3.2));
    if(w.lastMove!==part){w.lastMove=part;const b=s.boss,a=s.level.arena;Object.assign(b,{phase:'warn',move:moves[part],timer:.7,warnDuration:.7,release:0,shotClock:.24,volley:0,turn:0,ultimateCooldown:999,recoverFrom:null});if(part===1)b.x=a.right-230;}
   }
   if(spec.index===6&&w.age>3.5&&!s.boss.bellBroken)s.boss.hp=s.boss.maxHp*.5;
   if(spec.index===7&&w.age>3.5){const e=s.enemies.find(q=>q.type===28);if(e&&e.harvestStage===1)e.hp=e.maxHp*.5;}
   w.stepAdventure(s,{},1/120);s.camera={...w.camera};
   if(spec.index===7){const e=s.enemies.find(q=>q.type===28);if(e)s.camera.x=e.x-685;}
   if(spec.index===3){const b=s.boss;s.camera.x=Math.max(s.level.arena.left-100,Math.min(s.level.arena.right-1180,b.x-600));s.camera.y=s.level.arena.y-650;}
   const bossPose=[5,7].includes(spec.index)?{}:w.bossDrawing(s);
   w.trace.push({time:w.age,boss:{phase:s.boss.phase,move:s.boss.move,...bossPose},actors:s.enemies.filter(e=>e.hp>0).map(e=>({type:e.type,x:e.x,y:e.y,baseY:e.baseY,gait:e.gait,phase:e.phase,...w.enemyDrawing(e)})),shots:s.hostile.length});
  };
  w.record=async seconds=>{
   const stream=w.c.captureStream(60),chunks=[],rec=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:3500000});
   const done=new Promise(resolve=>{rec.ondataavailable=e=>chunks.push(e.data);rec.onstop=()=>{const r=new FileReader();r.onload=()=>resolve(String(r.result).split(',')[1]);r.readAsDataURL(new Blob(chunks,{type:'video/webm'}));};});rec.start();let start,last,acc=0;
   await new Promise((resolve,reject)=>{const frame=now=>{try{start??=now;last??=now;acc+=Math.min(.05,(now-last)/1000);last=now;while(acc>=1/120){w.step();acc-=1/120;}w.renderAdventure(w.c,w.s,w.art);if(now-start<seconds*1000)requestAnimationFrame(frame);else resolve();}catch(error){reject(error);}};requestAnimationFrame(frame);});
   rec.stop();const video=await done;stream.getTracks().forEach(t=>t.stop());return{video,trace:w.trace};
  };
 });
 const cases=[
  ['meadow-ground',{index:0,types:[0,1,3,4]},6],['meadow-air-machines',{index:0,types:[2,5,6,7]},6],
  ['river',{index:2,types:[8,9]},6],['forest',{index:5,types:[10,11,12,13,14]},6],
  ['cemetery',{index:6,types:[18,19,20,21,22,24]},7],['village',{index:7,types:[25,26,27,26],orbit:true},7],
  ['balloon',{index:0,move:'balls'},6],['organ',{index:1,move:'organ-fanfare'},6],['barge',{index:2,move:'drumroll'},6],['fort',{index:5,move:'salvo'},6],
  ['bellkeeper',{index:6},8],['harvester',{index:7},10],
  ...[1,2,3].map(stage=>['arlequin-'+stage,{index:3,stage},12.7]),
  ['tall-left',{index:6,types:[20],travelOnly:true,dir:-1},3.7],['tall-right',{index:6,types:[20],travelOnly:true,dir:1},3.7],
  ['village-walk',{index:7,types:[25,26],travelOnly:true,dir:1},6],['harvester-walk',{index:7,types:[28],travelOnly:true,dir:1},4],
 ];
 const report=fs.existsSync(dir+'report.json')?JSON.parse(fs.readFileSync(dir+'report.json')):[];
 for(const [name,spec,seconds]of cases){
  if(process.argv[2]&&!new RegExp(process.argv[2]).test(name))continue;
  if(!process.argv[2]&&report.some(q=>q.name===name))continue;
  console.log(name+': starting');
  await page.evaluate(spec=>window.cadence.setup(spec),spec);const result=await page.evaluate(seconds=>window.cadence.record(seconds),seconds);
  fs.writeFileSync(dir+name+'.webm',Buffer.from(result.video,'base64'));fs.writeFileSync(dir+name+'-trace.json',JSON.stringify(result.trace));
  const playback=await page.evaluate(async({data,seconds,name})=>{
   const video=document.createElement('video');video.muted=true;const loaded=new Promise((resolve,reject)=>{video.onloadeddata=resolve;video.onerror=reject;});video.src='data:video/webm;base64,'+data;await loaded;
   const sheet=document.createElement('canvas');sheet.width=1440;sheet.height=900;const c=sheet.getContext('2d');
   for(let i=0;i<9;i++){const time=.08+i*(seconds-.22)/8;await new Promise(resolve=>{video.onseeked=resolve;video.currentTime=time;});const x=i%3*480,y=Math.floor(i/3)*300;c.drawImage(video,0,0,960,540,x,y,480,270);c.fillStyle='#201d29';c.fillRect(x,y+270,480,30);c.fillStyle='#fff0d0';c.font='16px sans-serif';c.fillText(name+' | '+time.toFixed(2)+' s',x+8,y+291);}
   return sheet.toDataURL('image/png').split(',')[1];
  },{data:result.video,seconds,name});
  fs.writeFileSync(dir+name+'-playback.png',Buffer.from(playback,'base64'));
  const prior=report.findIndex(q=>q.name===name);if(prior>=0)report.splice(prior,1);report.push({name,frames:result.trace.length,types:[...new Set(result.trace.flatMap(q=>q.actors.map(e=>e.type)))],bossStates:[...new Set(result.trace.map(q=>q.boss.phase))],shots:Math.max(...result.trace.map(q=>q.shots))});fs.writeFileSync(dir+'report.json',JSON.stringify(report,null,2));console.log(name+': recorded and decoded');
 }
 fs.writeFileSync(dir+'report.json',JSON.stringify(report,null,2));fs.writeFileSync(dir+'runtime-errors.json',JSON.stringify(errors));if(errors.length)throw Error(errors.join('\n'));
}finally{await browser.close();}
