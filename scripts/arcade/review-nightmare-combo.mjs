import fs from 'node:fs/promises';
import {chromium} from '@playwright/test';
const out='tests/artifacts/arcade/nightmare-combo-v9';await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome'}),page=await browser.newPage({viewport:{width:1440,height:810}}),errors=[],missing=[];
page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&r.url().includes('/arcade/'))missing.push(r.url());});
try{
 await page.route('**/__combo_review',r=>r.fulfill({contentType:'text/html',body:'<body style="margin:0;background:#171521"></body>'}));await page.goto('http://localhost:4321/__combo_review');
 await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/';window.w=Object.assign({},...await Promise.all(['engine/adventureModel.js','render/adventureCanvas.js','render/adventureCamera.js','actors/bosses/nightmareUltimate.js','actors/bosses/nightmareGames.js'].map(p=>import(root+p))));
  w.art=await w.loadAdventureArt();w.c=document.createElement('canvas');w.c.style='width:1440px;height:810px';document.body.append(w.c);
  w.paint=(reduced=false)=>{w.s.shake=0;w.s.noticeTime=0;w.renderAdventure(w.c,w.s,w.art,{reduced});};
  w.tick=(seconds,input={})=>{for(let i=0;i<Math.round(seconds*120);i++)w.stepAdventure(w.s,input,1/120);};
  w.setup=(side=1)=>{
   const s=w.s=w.createAdventure(10),a=s.level.arena;s.enemies=[];s.supplies=[];s.stars=[];s.cages=[];s.arenaLocked=true;s.noticeTime=0;s.episodeTwo.seen=new Set([0,1,2]);s.episodeTwo.captionAge=0;
   Object.assign(s.player,{x:4600,y:a.y,ground:1,hurt:999,dir:side});Object.assign(s.boss,{x:4750,y:a.y,dir:-side,phase:'recover',timer:100,engaged:true,vulnerable:true,stage:3,hp:260,turn:3,encoreAid:true,nightmareCooldown:999,staffCooldown:999});
   for(let i=0;i<600;i++)w.followAdventureCamera(s,1/120);return s;
  };
  w.combo=(age=0,side=1)=>{w.setup(side);w.startNightmareGame(w.s,'staff-chain');w.tick(.55+age);};
  w.force=(kind,age=0)=>{w.setup();w.s.boss.x=5100;w.startNightmareGame(w.s,kind);w.tick(age);};
  w.duel=(side=1)=>{w.setup(side);w.s.player.x=side>0?2850:5650;w.s.boss.x=side>0?5000:3000;w.beginNightmareUltimate(w.s);w.tick(1.9);w.stepAdventure(w.s,{super:true},1/120);};
  w.surge=(age=0)=>{w.duel();for(let i=0;i<2000&&w.s.powerClash.state!=='boss-boost';i++)w.stepAdventure(w.s,{attack:i%12<6},1/120);w.tick(age);};
  w.rally=(age=0)=>{w.duel();for(let i=0;i<5000&&!w.s.powerClash.finalSurgeUsed;i++){const q=w.s.powerClash;w.stepAdventure(w.s,{attack:i%15<7,super:q.boostReady&&!q.hexyBoost},1/120);}w.tick(age);};
  w.explosion=(age=.03)=>{w.duel();for(let i=0;i<6000&&w.s.powerClash?.state!=='flight';i++){const q=w.s.powerClash;w.stepAdventure(w.s,{attack:i%12<6,super:q?.boostReady&&!q.hexyBoost},1/120);}w.tick(age);};
 });
 if(!process.argv.includes('--videos')){
  const snapshots=[...['.3','.58','.84','1.05','1.45','1.95','2.3','2.44','2.52','2.73','3.1'].map(t=>['combo-'+t,'combo',+t]),['combo-left-impact','left',2.52],['pull','wind-tug',1.55],['push','wind-push',1.55],['prism','prism-mirage',1.7],['prism-reduced','prism-reduced',1.7],['right-horizontal-cutin','surge',.65],['surge-manga','surge',1.27],['surge-complete-rim','surge',1.65],['frustrated-rally','rally',.4],['explosion-manga','explosion',.03],['explosion-color','explosion',.15]];
  const states=[];for(const [name,kind,age]of snapshots){
   states.push(await page.evaluate(({kind,age})=>{if(kind==='left')w.combo(age,-1);else if(['wind-tug','wind-push','prism-mirage','prism-reduced'].includes(kind))w.force(kind==='prism-reduced'?'prism-mirage':kind,age);else w[kind](age);w.paint(kind==='prism-reduced');const q=w.s.powerClash,b=w.s.boss;return{kind,age,state:q?.state||b.phase,pressure:q?.pressure,impactCause:q?.impactCause,impactAge:q?.impactAge,rally:q?.finalSurgeAge,playerX:w.s.player.x,bossX:b.x,bossY:b.y,game:b.game};},{kind,age}));
   await page.locator('canvas').screenshot({path:out+'/'+name+'.jpg',type:'jpeg',quality:96});console.log(name);
  }await fs.writeFile(out+'/beats.json',JSON.stringify(states,null,2));
 }
 if(process.argv.includes('--videos')){
  for(const name of ['staff-combo','prism-and-wind','double-encore']){
   const r=await page.evaluate(async name=>{
    if(name==='staff-combo'){w.setup();w.startNightmareGame(w.s,'staff-chain');}else if(name==='prism-and-wind')w.force('prism-mirage');else w.duel();
    const s=w.s,duration=name==='staff-combo'?5:name==='prism-and-wind'?10:28,samples=[],states=new Set();let sim=0,last,start,step=0,next=0,old='',pull=false,push=false;
    const stream=w.c.captureStream(30),chunks=[],rec=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:5000000});
    const done=new Promise(resolve=>{rec.ondataavailable=e=>chunks.push(e.data);rec.onstop=()=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result.split(',')[1]);reader.readAsDataURL(new Blob(chunks,{type:'video/webm'}));};});rec.start();
    await new Promise(resolve=>{const animate=now=>{start??=now;last??=now;let left=Math.min(.05,(now-last)/1000);last=now;sim+=left;
     if(name==='prism-and-wind'){if(sim>4&&!pull){pull=true;w.startNightmareGame(s,'wind-tug');}if(sim>7&&!push){push=true;w.startNightmareGame(s,'wind-push');}}
     while(left>0){const dt=Math.min(left,1/120),q=s.powerClash,wait=q?.bossBoost&&!q.hexyBoost;w.stepAdventure(s,name==='double-encore'?{attack:!wait&&step%15<7,super:q?.boostReady&&q.pressure<.1}:{},dt);left-=dt;step++;}
     s.player.hurt=999;w.paint();const q=s.powerClash,state=q?.state||s.boss.phase;states.add(state);
     if(sim>=next||old!==state){samples.push({t:sim,wall:(now-start)/1000,state,move:s.boss.move,pressure:q?.pressure,rally:q?.finalSurgeAge,impact:q?.impactCause});next=sim+(name==='staff-combo'?.18:name==='prism-and-wind'?.65:1.1);old=state;}
     if(sim<duration)requestAnimationFrame(animate);else resolve();};requestAnimationFrame(animate);});
    rec.stop();const video=await done;stream.getTracks().forEach(t=>t.stop());
    const v=document.createElement('video');v.muted=true;v.src='data:video/webm;base64,'+video;await new Promise(r=>v.onloadeddata=r);if(!Number.isFinite(v.duration))await new Promise(r=>{v.onseeked=r;v.currentTime=1000;});
    const sheet=document.createElement('canvas');sheet.width=1440;sheet.height=Math.ceil(samples.length/3)*270;const c=sheet.getContext('2d');
    for(const [i,q]of samples.entries()){await new Promise(r=>{v.onseeked=r;v.currentTime=Math.min(v.duration-.04,Math.max(.001,q.wall));});c.drawImage(v,i%3*480,Math.floor(i/3)*270,480,270);c.fillStyle='#201328';c.fillRect(i%3*480,Math.floor(i/3)*270,470,23);c.fillStyle='#fff';c.font='13px sans-serif';c.fillText(q.t.toFixed(2)+'s '+(q.move||q.state)+' '+(q.pressure??0).toFixed(2),i%3*480+6,Math.floor(i/3)*270+16);}
    return{video,sheet:sheet.toDataURL('image/jpeg',.94).split(',')[1],samples,states:[...states],hp:s.boss.hp};
   },name);
   await fs.writeFile(out+'/'+name+'.webm',Buffer.from(r.video,'base64'));await fs.writeFile(out+'/'+name+'-playback.jpg',Buffer.from(r.sheet,'base64'));delete r.video;delete r.sheet;await fs.writeFile(out+'/'+name+'.json',JSON.stringify(r,null,2));console.log(JSON.stringify({name,states:r.states,hp:r.hp}));
  }
 }
 await fs.writeFile(out+'/browser-report.json',JSON.stringify({errors,missing},null,2));if(errors.length||missing.length)throw Error(JSON.stringify({errors,missing}));
}finally{await browser.close();}
