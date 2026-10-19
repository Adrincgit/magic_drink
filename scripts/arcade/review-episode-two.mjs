import fs from 'node:fs/promises';
import {chromium} from '@playwright/test';
const madness=process.argv.includes('--madness'),out='tests/artifacts/arcade/'+(madness?'nightmare-madness-v2':'episode-two');await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome'}),page=await browser.newPage({viewport:{width:1440,height:810}}),errors=[],missing=[];
page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&r.url().includes('/arcade/'))missing.push(r.url());});
try{
 await page.route('**/__episode_review',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><body style="margin:0;background:#171521"></body>'}));await page.goto('http://localhost:4321/__episode_review');
 await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/';window.w=Object.assign({},...await Promise.all(['engine/adventureModel.js','render/adventureCanvas.js','actors/bosses/adventureActTwoBosses.js','actors/bosses/nightmareGames.js','world/adventureTerrain.js'].map(p=>import(root+p))));
  w.art=await w.loadAdventureArt();w.c=document.createElement('canvas');w.c.style.width='1440px';w.c.style.height='810px';document.body.append(w.c);
  w.paint=()=>{w.s.shake=0;w.renderAdventure(w.c,{...w.s,player:{...w.s.player,hurt:0}},w.art);};
  w.setup=(id,x,battle=false)=>{
   const s=w.s=w.createAdventure(id),a=s.level.arena;s.player.x=x;s.player.y=w.groundY(s.level.route||s.platforms,x);s.player.ground=s.platforms.findIndex(q=>q.kind==='earth'&&x>=q.x&&x<=q.x+q.w);s.player.hurt=999;s.noticeTime=0;
   if(id===9&&x>3450)s.castleInside=true;
   if(battle){s.enemies=[];s.supplies=[];s.cages=[];s.player.x=a.entry+120;s.player.y=a.y;for(let i=0;i<270;i++)w.stepAdventure(s,{},1/120);}
   else{s.camera={x:Math.max(0,x-300),y:s.player.y-440,zoom:1,backdropY:40};}
   if(battle&&s.episodeTwo)s.episodeTwo.captionAge=0;w.paint();return s;
  };
  w.duel=(side=1,air=false)=>{
   const s=w.setup(10,2450,true),b=s.boss,a=s.level.arena;b.stage=3;b.hp=b.maxHp/3;b.encoreAid=true;b.phase='nightmare-charge';b.vulnerable=false;
   if(side<0){s.player.x=a.right-260;b.x=a.left+560;}if(air){s.player.y=a.y-110;s.player.ground=null;}
   b.nightmareUltimate={state:'charge',age:.5,crown:{x:s.player.x+680*side,y:a.y-500},target:{x:s.player.x,y:a.y-35}};s.magic=100;s.superCooldown=0;s.lastInput={};w.stepAdventure(s,{super:true},1/120);return s;
  };
 });
 if(madness&&!process.argv.includes('--videos')){
  for(const [name,x]of [['candy-warehouse',180],['villager-candy',1530],['candy-landing',1900]]){
   await page.evaluate(x=>{w.setup(10,x);for(let i=0;i<3;i++)w.stepAdventure(w.s,{},1/120);w.paint();},x);await page.locator('canvas').screenshot({path:out+'/'+name+'.jpg',type:'jpeg',quality:94});
  }
  for(const stage of [1,2,3])for(const pose of ['cast','walk']){
   await page.evaluate(({stage,pose})=>{const s=w.setup(10,2450,true),b=s.boss;b.stage=stage;b.hp=b.maxHp*(4-stage)/3;b.phase=pose==='walk'?'patrol':'windup';b.move='fan';b.gait=.29;b.phaseAge=.6;b.flash=0;w.paint();},{stage,pose});await page.locator('canvas').screenshot({path:out+'/phase-'+stage+'-'+pose+'.jpg',type:'jpeg',quality:95});
  }
  for(const pose of ['transform','pounce-warning','pounce-air','rain-warning','charge','boss-boost']){
   await page.evaluate(pose=>{const s=w.setup(10,2450,true),b=s.boss;b.stage=3;b.hp=b.maxHp/3;b.flash=0;b.nightmareCooldown=999;
    if(pose==='transform'){b.phase='transform';b.phaseAge=.8;Object.assign(s.episodeTwo,{caption:['¡No vale! ¡Ahora jugamos con MIS reglas!','No fair! Now we play by MY rules!'],captionAge:3.8});}
    if(pose.startsWith('pounce')){w.startNightmareGame(s,'double-pounce');if(pose==='pounce-air'){for(let i=0;i<170;i++)w.stepAdventure(s,{},1/120);}}
    if(pose==='rain-warning')w.startNightmareGame(s,'nightmare-rain');
    if(pose==='charge'){b.nightmareUltimate={state:'charge',age:1.2,crown:{x:s.player.x+680,y:s.level.arena.y-500},target:{x:s.player.x,y:s.player.y-35}};b.phase='nightmare-charge';}
    if(pose==='boss-boost'){w.duel();for(let i=0;i<280;i++)w.stepAdventure(w.s,{},1/120);Object.assign(w.s.powerClash,{state:'boss-boost',age:.4,bossBoost:true});}
    w.paint();},pose);await page.locator('canvas').screenshot({path:out+'/'+pose+'.jpg',type:'jpeg',quality:95});
  }
  console.log('Fifteen nightmare/candy compositions captured.');
 }
 if(!madness&&!process.argv.includes('--videos')){
  for(const [name,id,x]of [['cemetery-castle',6,1600],['village-castle',7,4350],['corn-barn',8,3300],['corn-night',8,10000],['castle-gardens',9,2900],['castle-ballroom',9,7800],['castle-rigging',9,11200],['upper-staircase',10,1050]]){
   await page.evaluate(({id,x})=>{w.setup(id,x);if(id===8&&x>6800){w.s.episodeTwo.sunsetReveal=1;w.paint();}},{id,x});await page.locator('canvas').screenshot({path:out+'/'+name+'.jpg',type:'jpeg',quality:92});
  }
  await page.evaluate(()=>{const s=w.setup(9,14000,true),b=s.boss;b.stage=2;b.hp=b.maxHp/2;b.phase='recover';b.timer=6;b.countess.timer=0;for(let i=0;i<60;i++)w.stepAdventure(s,{},1/120);w.paint();});
  await page.locator('canvas').screenshot({path:out+'/count-and-countess.jpg',type:'jpeg',quality:94});
  for(const mode of ['contact','boss-boost','hexy-boost','hexy-boost-left-air','victory']){
   await page.evaluate(mode=>{const s=mode==='hexy-boost-left-air'?w.duel(-1,true):w.duel();for(let i=0;i<280;i++)w.stepAdventure(s,{},1/120);const q=s.powerClash;
    if(mode==='boss-boost'){q.state='boss-boost';q.age=.4;q.bossBoost=true;}
    if(mode.startsWith('hexy-boost')){q.state='hexy-boost';q.age=.35;q.bossBoost=true;q.hexyBoost=true;s.superCinematic.age=.7;s.player.charge=.7;}
    if(mode==='victory'){s.powerClash=null;s.superCinematic=null;s.player.charge=0;s.player.superCast=0;s.boss.nightmareUltimate=null;s.boss.hp=0;s.boss.phase='defeated';s.boss.defeat={ready:true};s.episodeTwo.released=true;s.dreamRoofTorn=true;}
    w.paint();},mode);
   await page.locator('canvas').screenshot({path:out+'/'+mode+'.jpg',type:'jpeg',quality:94});
  }
  console.log('Fourteen actual game compositions captured.');
 }
 const selected=process.argv.find(q=>q.startsWith('--only='))?.slice(7).split(',');
 if(process.argv.includes('--videos'))for(const name of (madness?['candy-walk','phase-two-games','phase-three-games','three-phases','double-encore']:['corn-reveal','castle-route','vampire-duet','nightmare-phases','double-encore']).filter(q=>!selected||selected.includes(q))){
  const result=await page.evaluate(async name=>{
   const walking=name==='castle-route'||name==='corn-reveal'||name==='candy-walk';
   const s=name==='double-encore'?w.duel():w.setup(name==='corn-reveal'?8:name==='castle-route'||name==='vampire-duet'?9:10,name==='corn-reveal'?6400:name==='castle-route'?7400:name==='candy-walk'?90:2500,!walking);
   if(name==='phase-two-games'||name==='phase-three-games'){const b=s.boss;b.stage=name==='phase-two-games'?2:3;b.hp=b.maxHp*(4-b.stage)/3;b.nightmareCooldown=999;b.encoreAid=true;b.phase='patrol';b.timer=0;b.turn=0;}
   const duration=name==='candy-walk'?10:walking?12:name==='vampire-duet'?23:['nightmare-phases','three-phases'].includes(name)?29:name==='phase-two-games'?27:name==='phase-three-games'?31:18,states=new Set(),moves=new Set(),frames=[],samples=[];
   let sim=0,last,wallStart,second=false,third=false,nextSample=1,step=0;
   const stream=w.c.captureStream(30),chunks=[],rec=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:5000000});
   const done=new Promise(resolve=>{rec.ondataavailable=e=>chunks.push(e.data);rec.onstop=()=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result.split(',')[1]);reader.readAsDataURL(new Blob(chunks,{type:'video/webm'}));};});rec.start();
   await new Promise(resolve=>{const animate=now=>{
    wallStart??=now;last??=now;let left=Math.min(.05,(now-last)/1000);last=now;sim+=left;
    if(!second&&sim>6&&['vampire-duet','nightmare-phases','three-phases'].includes(name)){s.boss.vulnerable=true;w.damageActTwoBoss(s,99999);second=true;}
    if(!third&&sim>12&&['nightmare-phases','three-phases'].includes(name)){s.boss.vulnerable=true;w.damageActTwoBoss(s,99999);third=true;}
    while(left>0){
     const dt=Math.min(left,1/120),q=s.powerClash,input=walking?{right:true,attack:true,jump:step%200<70}:name==='double-encore'?{attack:step%12<6,super:!!q?.boostReady&&!q?.hexyBoost}:{};
     w.stepAdventure(s,input,dt);left-=dt;step++;
    }
    s.player.hurt=999;s.noticeTime=0;w.paint();states.add(s.powerClash?.state||s.boss.phase);moves.add(s.boss.move);
    if(sim>=nextSample){samples.push({t:sim,wall:(now-wallStart)/1000,state:s.powerClash?.state||s.boss.phase,stage:s.boss.stage,pressure:s.powerClash?.pressure,hexyBoost:s.powerClash?.hexyBoost,bossBoost:s.powerClash?.bossBoost});nextSample+=2;}
    if(sim<duration)requestAnimationFrame(animate);else resolve();};requestAnimationFrame(animate);});
   rec.stop();const video=await done;stream.getTracks().forEach(t=>t.stop());
   const v=document.createElement('video');v.muted=true;v.src='data:video/webm;base64,'+video;await new Promise(r=>v.onloadeddata=r);if(!Number.isFinite(v.duration))await new Promise(r=>{v.onseeked=r;v.currentTime=1000;});
   const sheet=document.createElement('canvas');sheet.width=1440;sheet.height=Math.ceil(samples.length/3)*270;const c=sheet.getContext('2d');
   for(const [i,q]of samples.entries()){
    await new Promise(r=>{v.onseeked=r;v.currentTime=Math.min(v.duration-.04,Math.max(.001,q.wall));});c.drawImage(v,i%3*480,Math.floor(i/3)*270,480,270);c.fillStyle='#201328';c.fillRect(i%3*480,Math.floor(i/3)*270,400,23);c.fillStyle='#fff';c.font='13px sans-serif';c.fillText(q.t.toFixed(1)+'s '+q.state+' / '+q.stage,i%3*480+6,Math.floor(i/3)*270+16);
   }
   return{video,sheet:sheet.toDataURL('image/jpeg',.91).split(',')[1],samples,states:[...states],moves:[...moves],hp:s.boss.hp,hearts:s.hearts,won:s.won};
  },name);
  await fs.writeFile(out+'/'+name+'.webm',Buffer.from(result.video,'base64'));await fs.writeFile(out+'/'+name+'-playback.jpg',Buffer.from(result.sheet,'base64'));delete result.video;delete result.sheet;await fs.writeFile(out+'/'+name+'.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({name,states:result.states,hp:result.hp,hearts:result.hearts}));
 }
 await fs.writeFile(out+'/browser-report.json',JSON.stringify({errors,missing},null,2)+'\n');if(errors.length||missing.length)throw Error(JSON.stringify({errors,missing}));
}finally{await browser.close();}
