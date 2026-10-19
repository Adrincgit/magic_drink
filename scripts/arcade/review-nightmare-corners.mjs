import fs from 'node:fs/promises';
import {chromium} from '@playwright/test';
const out='tests/artifacts/arcade/nightmare-corners-v5';await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome'}),page=await browser.newPage({viewport:{width:1440,height:810}}),errors=[],missing=[];
page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&r.url().includes('/arcade/'))missing.push(r.url());});
try{
 await page.route('**/__aerial_review',r=>r.fulfill({contentType:'text/html',body:'<body style="margin:0;background:#171521"></body>'}));await page.goto('http://localhost:4321/__aerial_review');
 await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/';window.w=Object.assign({},...await Promise.all(['engine/adventureModel.js','render/adventureCanvas.js','render/adventureCamera.js','actors/bosses/nightmareUltimate.js','actors/bosses/harlequinUltimate.js','actors/bosses/nightmareGames.js'].map(p=>import(root+p))));
  w.art=await w.loadAdventureArt();w.c=document.createElement('canvas');w.c.style='width:1440px;height:810px';document.body.append(w.c);
  w.paint=()=>{w.s.shake=0;w.s.noticeTime=0;w.renderAdventure(w.c,w.s,w.art);};
  w.tick=(time,input={})=>{for(let i=0;i<Math.round(time*120);i++)w.stepAdventure(w.s,input,1/120);};
  w.setup=(id=10,side=1,air=false)=>{
   const s=w.s=w.createAdventure(id),a=s.level.arena;s.enemies=[];s.supplies=[];s.stars=[];s.cages=[];s.arenaLocked=true;s.noticeTime=0;if(s.episodeTwo){s.episodeTwo.seen=new Set([0,1,2]);s.episodeTwo.captionAge=0;}
   Object.assign(s.player,{x:id===3?1500:side>0?2850:5650,y:a.y-(air?110:0),ground:air?null:1,hurt:999});
   Object.assign(s.boss,{x:id===3?3000:side>0?5000:3000,y:a.y,phase:'recover',timer:100,engaged:true,vulnerable:true,stage:3,hp:id===3?240:260,turn:3,encoreAid:true,nightmareCooldown:999});
   for(let i=0;i<600;i++)w.followAdventureCamera(s,1/120);w.paint();return s;
  };
  w.leap=(side=1,air=false)=>{const s=w.setup(10,side,air);w.beginNightmareUltimate(s);return s;};
  w.duel=(side=1,air=false)=>{const s=w.leap(side,air);w.tick(1.9);if(air){s.player.y=s.level.arena.y-110;s.player.ground=null;}w.stepAdventure(s,{super:true},1/120);return s;};
 });
 if(!process.argv.includes('--videos')){
  const stills=[['surprise-early',()=>{w.duel();for(let i=0;i<1600&&w.s.powerClash?.state!=='boss-boost';i++)w.stepAdventure(w.s,{attack:i%12<6},1/120);w.tick(0.08);}],['surprise-hand',()=>{w.duel();for(let i=0;i<1600&&w.s.powerClash?.state!=='boss-boost';i++)w.stepAdventure(w.s,{attack:i%12<6},1/120);w.tick(0.22);}],['brace-under-pressure',()=>{w.duel();for(let i=0;i<1600&&w.s.powerClash?.state!=='boss-boost';i++)w.stepAdventure(w.s,{attack:i%12<6},1/120);w.tick(0.6);}],['held-strain',()=>{w.duel();for(let i=0;i<1600&&w.s.powerClash?.state!=='boss-boost';i++)w.stepAdventure(w.s,{attack:i%12<6},1/120);w.tick(1.2);}],['manga-impact',()=>{w.duel();while(w.s.powerClash.state!=='contest')w.tick(1/120);}],['open-room',()=>{w.setup();}],['far-retreat',()=>{w.setup();w.s.player.x=1200;for(let i=0;i<600;i++)w.followAdventureCamera(w.s,1/120);}],['leap-start',()=>{w.leap();w.tick(.45);}],['leap-high',()=>{w.leap();w.tick(1.4);}],['charge-full',()=>{w.leap();w.tick(4.4);}],['heroic-charge',()=>{w.duel();w.tick(.7);}],['contact',()=>{w.duel();while(w.s.powerClash.state!=='contest')w.tick(1/120);w.tick(.25);}],['boss-surge',()=>{w.duel();for(let i=0;i<120*12;i++){w.stepAdventure(w.s,{attack:i%12<6},1/120);if(w.s.powerClash?.state==='boss-boost'&&w.s.powerClash.age>.3)break;}}],['near-defeat',()=>{w.duel();for(let i=0;i<120*16;i++){const q=w.s.powerClash;w.stepAdventure(w.s,{attack:!q?.bossBoost&&i%12<6},1/120);if(q?.boostReady&&q.pressure<.1)break;}}],['double-encore',()=>{w.duel();for(let i=0;i<120*16;i++){const q=w.s.powerClash;w.stepAdventure(w.s,{attack:!q?.bossBoost&&i%12<6,super:q?.boostReady&&q.pressure<.1},1/120);if(q?.state==='hexy-boost'&&q.age>.4)break;}}],['reversal',()=>{w.duel();for(let i=0;i<120*18;i++){const q=w.s.powerClash;w.stepAdventure(w.s,{attack:i%12<6,super:q?.boostReady&&!q.hexyBoost},1/120);if(q?.hexyAmplification===1&&q.age>.3)break;}}],['left-air',()=>{w.duel(-1,true);while(w.s.powerClash.state!=='contest')w.tick(1/120);w.tick(.25);}],['fire-reference',()=>{const s=w.setup(3);w.beginHarlequinUltimate(s);while(s.boss.ultimate?.state==='leap')w.tick(1/120);w.stepAdventure(s,{super:true},1/120);w.tick(2.5);}]];
  for(const [name,fn]of stills){await page.evaluate('('+fn.toString()+')()');await page.evaluate(()=>w.paint());await page.locator('canvas').screenshot({path:out+'/'+name+'.jpg',type:'jpeg',quality:95});console.log(name);}
 }
 if(process.argv.includes('--videos')){
  const only=process.argv.find(q=>q.startsWith('--only='))?.slice(7).split(',');
  for(const name of ['double-reversal','candy-loss','phase-two-moves','phase-three-moves'].filter(q=>!only||only.includes(q))){
   const r=await page.evaluate(async name=>{
    const ordinary=name==='phase-two-moves'||name==='phase-three-moves',s=ordinary?w.setup():name==='fire-reference'?w.setup(3):name==='extreme-leap'?w.leap():w.duel();
    if(ordinary){const b=s.boss;b.stage=name==='phase-two-moves'?2:3;b.hp=b.maxHp*(4-b.stage)/3;b.phase='patrol';b.timer=0;b.turn=0;b.nightmareCooldown=999;s.player.x=4200;b.x=5100;}
    if(name==='fire-reference'){w.beginHarlequinUltimate(s);while(s.boss.ultimate?.state==='leap')w.tick(1/120);w.stepAdventure(s,{super:true},1/120);}
    const duration=ordinary?34:name==='extreme-leap'?9:name==='fire-reference'||name==='double-reversal'?29:25,states=new Set(),samples=[];let sim=0,last,start,step=0,next=.5,previousState='';
    const stream=w.c.captureStream(30),chunks=[],rec=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:5000000});
    const done=new Promise(resolve=>{rec.ondataavailable=e=>chunks.push(e.data);rec.onstop=()=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result.split(',')[1]);reader.readAsDataURL(new Blob(chunks,{type:'video/webm'}));};});rec.start();
    await new Promise(resolve=>{const animate=now=>{
     start??=now;last??=now;let left=Math.min(.05,(now-last)/1000);last=now;sim+=left;
     while(left>0){const dt=Math.min(left,1/120),q=s.powerClash,waitForDanger=name==='double-reversal'&&q?.bossBoost&&!q.hexyBoost;
      const input=ordinary?{left:sim%8<2,right:sim%8>5,jump:sim%6<.6}:name==='extreme-leap'||name==='candy-loss'?{}:{attack:!waitForDanger&&step%12<6,super:name==='double-reversal'&&q?.boostReady&&q.pressure<.1};
      w.stepAdventure(s,input,dt);left-=dt;step++;}
     s.player.hurt=999;w.paint();states.add(s.powerClash?.state||s.boss.phase);
     if(sim>=next||previousState!==(s.powerClash?.state||s.boss.phase)){const q=s.powerClash;samples.push({t:sim,wall:(now-start)/1000,state:q?.state||s.boss.phase,pressure:q?.pressure,hexyBoost:q?.hexyBoost,bossBoost:q?.bossBoost,wind:q?.windFlow,bossY:s.boss.y,zoom:s.camera.zoom});next=Math.max(next+1.5,sim+.6);previousState=q?.state||s.boss.phase;}
     if(sim<duration)requestAnimationFrame(animate);else resolve();};requestAnimationFrame(animate);});
    rec.stop();const video=await done;stream.getTracks().forEach(t=>t.stop());
    const v=document.createElement('video');v.muted=true;v.src='data:video/webm;base64,'+video;await new Promise(r=>v.onloadeddata=r);if(!Number.isFinite(v.duration))await new Promise(r=>{v.onseeked=r;v.currentTime=1000;});
    const sheet=document.createElement('canvas');sheet.width=1440;sheet.height=Math.ceil(samples.length/3)*270;const c=sheet.getContext('2d');
    for(const [i,q]of samples.entries()){await new Promise(r=>{v.onseeked=r;v.currentTime=Math.min(v.duration-.04,Math.max(.001,q.wall));});c.drawImage(v,i%3*480,Math.floor(i/3)*270,480,270);c.fillStyle='#201328';c.fillRect(i%3*480,Math.floor(i/3)*270,440,23);c.fillStyle='#fff';c.font='13px sans-serif';c.fillText(q.t.toFixed(1)+'s '+q.state+' '+(q.pressure??0).toFixed(2),i%3*480+6,Math.floor(i/3)*270+16);}
    return{video,sheet:sheet.toDataURL('image/jpeg',.92).split(',')[1],samples,states:[...states],hp:s.boss.hp,hearts:s.hearts};
   },name);
   await fs.writeFile(out+'/'+name+'.webm',Buffer.from(r.video,'base64'));await fs.writeFile(out+'/'+name+'-playback.jpg',Buffer.from(r.sheet,'base64'));delete r.video;delete r.sheet;await fs.writeFile(out+'/'+name+'.json',JSON.stringify(r,null,2));console.log(JSON.stringify({name,states:r.states,hp:r.hp}));
  }
 }
 await fs.writeFile(out+'/browser-report.json',JSON.stringify({errors,missing},null,2));if(errors.length||missing.length)throw Error(JSON.stringify({errors,missing}));
}finally{await browser.close();}
