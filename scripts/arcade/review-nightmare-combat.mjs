import fs from 'node:fs/promises';
import {chromium} from '@playwright/test';
const out='tests/artifacts/arcade/nightmare-combat-v11';await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome'}),page=await browser.newPage({viewport:{width:1440,height:810}}),errors=[],missing=[];
page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&r.url().includes('/arcade/'))missing.push(r.url());});
try{
 await page.route('**/__combo_review',r=>r.fulfill({contentType:'text/html',body:'<body style="margin:0;background:#171521"></body>'}));await page.goto('http://localhost:4321/__combo_review');
 await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/';window.w=Object.assign({},...await Promise.all(['engine/adventureModel.js','render/adventureCanvas.js','render/adventureCamera.js','actors/bosses/nightmareUltimate.js','actors/bosses/nightmareGames.js'].map(p=>import(root+p))));
  w.art=await w.loadAdventureArt();w.c=document.createElement('canvas');w.c.style='width:1440px;height:810px';document.body.append(w.c);
  w.paint=(reduced=false)=>{w.s.shake=0;w.s.noticeTime=0;const hurt=w.s.player.hurt;w.s.player.hurt=0;w.renderAdventure(w.c,w.s,w.art,{reduced});w.s.player.hurt=hurt;};
  w.tick=(seconds,input={})=>{for(let i=0;i<Math.round(seconds*120);i++)w.stepAdventure(w.s,input,1/120);};
  w.setup=(side=1)=>{
   const s=w.s=w.createAdventure(10),a=s.level.arena;s.enemies=[];s.supplies=[];s.stars=[];s.cages=[];s.arenaLocked=true;s.noticeTime=0;s.episodeTwo.seen=new Set([0,1,2]);s.episodeTwo.captionAge=0;
   Object.assign(s.player,{x:4600,y:a.y,ground:1,hurt:999,dir:side});Object.assign(s.boss,{x:4750,y:a.y,dir:-side,phase:'recover',timer:100,engaged:true,vulnerable:true,stage:3,hp:234,turn:0,encoreAid:true,nightmareCooldown:999,staffCooldown:999});
   for(let i=0;i<600;i++)w.followAdventureCamera(s,1/120);return s;
  };
  w.combo=(age=0,side=1)=>{w.setup(side);w.startNightmareGame(w.s,'staff-chain');w.tick(.55+age);};
  w.force=(kind,age=0)=>{w.setup();w.s.boss.x=5100;w.startNightmareGame(w.s,kind);w.tick(age);};
  w.spin=(age=0)=>{w.setup();w.s.boss.x=4800;w.startNightmareGame(w.s,'staff-spin');w.tick(.14+age,{attack:true});};
  w.block=(age=0)=>{w.setup(-1);w.startNightmareGame(w.s,'staff-counter');w.s.player.dir=1;w.tick(.55+age,{guard:true});};
  w.hit=(age=0)=>{w.setup();w.s.player.hurt=0;w.startNightmareGame(w.s,'staff-counter');w.tick(.55+age);};
  w.hop=(age=0)=>{w.setup();w.startNightmareGame(w.s,'moon-hop');w.tick(1.1+age);};
  w.room=(age=0)=>{w.setup();w.s.fxTime=age;};
  w.duel=(side=1)=>{w.setup(side);w.s.player.x=side>0?2850:5650;w.s.boss.x=side>0?5000:3000;w.beginNightmareUltimate(w.s);w.tick(1.9);w.stepAdventure(w.s,{super:true},1/120);};
  w.surge=(age=0)=>{w.duel();for(let i=0;i<2000&&w.s.powerClash.state!=='boss-boost';i++)w.stepAdventure(w.s,{attack:i%12<6},1/120);w.tick(age);};
  w.counter=(age=0)=>{w.surge(2.14);w.s.powerClash.pressure=.08;w.s.powerClash.portraitPressure=.08;w.stepAdventure(w.s,{super:true},1/120);w.tick(age);};
  w.rally=(age=0)=>{w.duel();for(let i=0;i<5000&&!w.s.powerClash.finalSurgeUsed;i++){const q=w.s.powerClash;w.stepAdventure(w.s,{attack:i%15<7,super:q.boostReady&&!q.hexyBoost},1/120);}w.tick(age);};
  w.explosion=(age=.03)=>{w.duel();for(let i=0;i<6000&&w.s.powerClash?.state!=='flight';i++){const q=w.s.powerClash;w.stepAdventure(w.s,{attack:i%12<6,super:q?.boostReady&&!q.hexyBoost},1/120);}w.tick(age);};
 });
 await page.evaluate(()=>{
  w.move=(kind,t)=>{w.setup();w.startNightmareGame(w.s,kind);w.tick(t);};
  w.blast=(t)=>{w.setup();const p=w.s.player;w.s.hostile=[{x:p.x-460,y:p.y-100,vx:0,vy:2450,r:65,life:3,age:0,actTwo:true,kind:'nightmare-storm',floor:p.y}];w.tick(.05+t);};
  w.deadline=()=>{w.duel();while(w.s.powerClash.state!=='contest')w.stepAdventure(w.s,{},1/120);const q=w.s.powerClash;q.contestAge=q.limit-.005;q.pressure=.6;w.tick(.02);};
  w.losing=()=>{w.counter(1.9);};
 });
 if(!process.argv.includes('--videos')){
  const shots=[...['.5','.72','.87','1.37','1.66'].map(t=>['sweep-'+t,'staff-sweep',+t]),...['.6','.9','1.2','1.55'].map(t=>['vault-'+t,'staff-vault',+t]),...['.65','1.3','1.85','2.5','3.5'].map(t=>['illusions-'+t,'prism-mirage',+t]),...['.04','.17','.38','.8','1.3'].map(t=>['blast-'+t,'blast',+t]),['late-clock-surprise','deadline',0],['effortful-happiness','losing',0],['large-expression','surge',.65],['contact-near-Hexy','counter',.7]];
  const states=[];
  for(const [name,kind,t]of shots){states.push(await page.evaluate(({kind,t})=>{if(kind.startsWith('staff-')||kind==='prism-mirage')w.move(kind,t);else w[kind](t);w.paint();return{kind,t,phase:w.s.boss.phase,game:w.s.boss.game,clash:w.s.powerClash?.state,pressure:w.s.powerClash?.pressure,hearts:w.s.hearts,knockdown:w.s.player.knockdown};},{kind,t}));await page.locator('canvas').screenshot({path:out+'/'+name+'.jpg',type:'jpeg',quality:96});console.log(name);}
  await fs.writeFile(out+'/snapshots.json',JSON.stringify(states,null,2));
 }else{
  const only=process.argv.find(q=>q.startsWith('--scene='))?.slice(8);
  for(const [name,duration]of [['staff-acrobatics',7],['attacking-illusions',5],['uncountered-blast',7],['double-encore-can-lose',9],['near-defeat-surprise',24],['ai-deck',42]].filter(([name])=>!only||only===name)){
   const result=await page.evaluate(async({name,duration})=>{
    if(name==='staff-acrobatics')w.move('staff-sweep',0);else if(name==='attacking-illusions')w.move('prism-mirage',0);else if(name==='uncountered-blast'){w.setup();w.beginNightmareUltimate(w.s);w.tick(1.6);}else if(name==='double-encore-can-lose')w.counter(1.15);else if(name==='ai-deck'){w.setup();w.s.boss.phase='patrol';w.s.boss.timer=0;}else w.duel();
    const stream=w.c.captureStream(30),chunks=[],rec=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:5000000}),samples=[];let time=0,last,start,steps=0,vault=false,next=0;
    const done=new Promise(resolve=>{rec.ondataavailable=e=>chunks.push(e.data);rec.onstop=()=>{const r=new FileReader();r.onload=()=>resolve(r.result.split(',')[1]);r.readAsDataURL(new Blob(chunks,{type:'video/webm'}));};});rec.start();
    await new Promise(resolve=>{const frame=now=>{start??=now;last??=now;let left=Math.min(.05,(now-last)/1000);last=now;time+=left;
     if(name==='staff-acrobatics'&&time>2.8&&!vault){vault=true;w.startNightmareGame(w.s,'staff-vault');}
     while(left>0){const dt=Math.min(left,1/120),q=w.s.powerClash;let input={};
      if(name==='near-defeat-surprise')input={attack:steps%15<7,super:q?.boostReady&&!q.hexyBoost&&q.pressure<.15};
      if(name==='uncountered-blast')input={left:time<1.7};
      if(name==='staff-acrobatics')input={guard:time<2.2};
      w.stepAdventure(w.s,input,dt);left-=dt;steps++;
     }
     w.paint();const q=w.s.powerClash,b=w.s.boss;
     if(time>=next){samples.push({t:time,wall:(now-start)/1000,state:q?.state||b.phase,move:b.game?.kind,pressure:q?.pressure,hearts:w.s.hearts});next=time+(name==='ai-deck'?1.25:name==='near-defeat-surprise'?1:.35);}
     if(time<duration)requestAnimationFrame(frame);else resolve();};requestAnimationFrame(frame);});
    rec.stop();const video=await done;stream.getTracks().forEach(t=>t.stop());
    const v=document.createElement('video');v.muted=true;v.src='data:video/webm;base64,'+video;await new Promise(r=>v.onloadeddata=r);if(!Number.isFinite(v.duration))await new Promise(r=>{v.onseeked=r;v.currentTime=1000;});
    const sheet=document.createElement('canvas');sheet.width=1440;sheet.height=Math.ceil(samples.length/3)*270;const c=sheet.getContext('2d');
    for(const[i,q]of samples.entries()){await new Promise(r=>{v.onseeked=r;v.currentTime=Math.min(v.duration-.04,Math.max(.001,q.wall));});c.drawImage(v,i%3*480,Math.floor(i/3)*270,480,270);c.fillStyle='#22172d';c.fillRect(i%3*480,Math.floor(i/3)*270,480,22);c.fillStyle='#fff';c.font='13px sans-serif';c.fillText(q.t.toFixed(2)+' '+(q.move||q.state)+' '+(q.pressure??0).toFixed(2)+' HP '+q.hearts,i%3*480+5,Math.floor(i/3)*270+15);}
    return{video,sheet:sheet.toDataURL('image/jpeg',.94).split(',')[1],samples};
   },{name,duration});
   await fs.writeFile(out+'/'+name+'.webm',Buffer.from(result.video,'base64'));await fs.writeFile(out+'/'+name+'-playback.jpg',Buffer.from(result.sheet,'base64'));delete result.video;delete result.sheet;await fs.writeFile(out+'/'+name+'.json',JSON.stringify(result,null,2));console.log(name);
  }
 }
 await fs.writeFile(out+'/browser-report.json',JSON.stringify({errors,missing},null,2));if(errors.length||missing.length)throw Error(JSON.stringify({errors,missing}));
}finally{await browser.close();}
