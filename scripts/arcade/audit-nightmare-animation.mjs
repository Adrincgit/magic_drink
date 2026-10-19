import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
import {chromium} from '@playwright/test';

const dir='context/arcade/nightmare-animation-audit',out='tests/artifacts/arcade/nightmare-animation-audit';
await fs.mkdir(dir,{recursive:true});await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome'}),page=await browser.newPage(),errors=[];
page.on('pageerror',e=>errors.push(e.message));
try{
 await page.route('**/__nightmare_audit',r=>r.fulfill({contentType:'text/html',body:'<body style="margin:0;background:#241c38"></body>'}));
 await page.goto('http://localhost:4321/__nightmare_audit');
 const data=await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/';
  const w=Object.assign({},...await Promise.all(['engine/adventureModel.js','actors/bosses/adventureActTwoBosses.js','actors/bosses/nightmareUltimate.js','actors/bosses/adventureHarlequin.js','engine/nightmarePressureActing.js','render/actTwoCanvas.js','render/adventureCanvas.js'].map(p=>import(root+p))));
  const cases=[],dt=1/120;
  function setup(stage=1,fire=false){
   const s=w.createAdventure(fire?3:10),a=s.level.arena;s.enemies=[];s.supplies=[];s.stars=[];s.cages=[];s.arenaLocked=true;s.noticeTime=0;s.actTwoAmbushes=[];
   Object.assign(s.player,{x:fire?a.left+260:4000,y:a.y,ground:1,hurt:999});
   Object.assign(s.boss,{x:fire?a.right-260:5000,y:a.y,stage,hp:fire?(stage===3?180:stage===2?420:720):s.boss.maxHp*(4-stage)/3,phase:fire?'recover':'patrol',timer:99,clock:0,phaseAge:0,turn:0,engaged:true,vulnerable:true,encoreAid:true,nightmareCooldown:999,ultimateCooldown:999,walking:false});
   return s;
  }
  function measure(name,s,duration,stop=null,input=()=>({}),fire=false){
   const spans=[];let age=0,previous;
   for(let i=0;i<duration*120;i++){
    w.stepAdventure(s,input(s,i),dt);age+=dt;const b=s.boss,q=s.powerClash,d=fire?w.harlequinDrawing(s):w.actTwoBossDrawing(s);
    const phase=q?q.state:b.nightmareUltimate?b.nightmareUltimate.state:b.phase;
    const hidden=b.phase==='game-attack'&&b.game?.kind==='wind-blink'&&b.phaseAge<.3;
    const id=[phase,d.key,d.frame,hidden].join('|');
    if(id!==previous){spans.push({phase,key:d.key,frame:d.frame,hidden,start:age-dt,duration:dt});previous=id;}else spans.at(-1).duration+=dt;
    if(stop?.(s))break;
   }
   const phases={};for(const p of spans){const q=phases[p.phase]??={duration:0,frames:new Set(),visibleFrames:new Set(),longestHold:0,changes:0};q.duration+=p.duration;q.frames.add(p.key+':'+p.frame);if(!p.hidden)q.visibleFrames.add(p.key+':'+p.frame);q.longestHold=Math.max(q.longestHold,p.duration);q.changes++;}
   cases.push({name,stage:s.boss.stage,fire,duration:age,phases:Object.fromEntries(Object.entries(phases).map(([key,q])=>[key,{...q,frames:[...q.frames],visibleFrames:[...q.visibleFrames]}])),spans});
  }
  const moves=[['candy-fan','wind-blink','lanes','moon-hop'],['spiral-volley','moon-hop','wind-blink','lanes'],['spiral-volley','double-pounce','nightmare-rain','wind-blink','wind-shear']];
  for(let stage=1;stage<=3;stage++){
   let s=setup(stage);s.player.x=s.boss.x-200;measure('idle-'+stage,s,4.5);
   s=setup(stage);s.player.x=2300;s.boss.timer=99;measure('walk-'+stage,s,2.5);
   s=setup(stage);s.player.x=s.boss.x-200;s.boss.flash=.15;measure('hit-idle-'+stage,s,.3);
   s=setup(stage);s.boss.timer=0;w.stepAdventure(s,{},dt);s.boss.flash=.15;measure('hit-anticipation-'+stage,s,.3);
   for(const [turn,move]of moves[stage-1].entries()){
    s=setup(stage);s.boss.turn=turn;s.boss.timer=0;
    measure(move+'-'+stage,s,8,q=>q.boss.phase==='patrol'&&q.boss.turn>turn+0,q=>({}));
   }
  }
  let s=setup(1);Object.assign(s.boss,{phase:'intro',timer:1.8});measure('intro',s,2,q=>q.boss.phase!=='intro');
  for(const stage of [1,2]){s=setup(stage);w.damageActTwoBoss(s,9999);measure('transform-to-'+(stage+1),s,2.2,q=>q.boss.phase==='recover');}
  s=setup(3);s.boss.hp=0;measure('death',s,3,q=>q.boss.phase==='defeated');
  s=setup(3);w.beginNightmareUltimate(s);measure('ultimate-unanswered',s,10,q=>!q.boss.nightmareUltimate);
  s=setup(3);Object.assign(s.player,{x:2850});w.beginNightmareUltimate(s);for(let i=0;i<228;i++)w.stepAdventure(s,{},dt);w.stepAdventure(s,{super:true},dt);
  measure('ultimate-clash',s,32,q=>q.boss.phase==='defeated',(q,i)=>({attack:(!q.powerClash?.bossBoost||q.powerClash?.hexyBoost)&&i%12<6,super:q.powerClash?.boostReady&&q.powerClash.pressure<.1}));
  s=setup(3);s.player.x=2850;w.beginNightmareUltimate(s);for(let i=0;i<228;i++)w.stepAdventure(s,{},dt);w.stepAdventure(s,{super:true},dt);
  measure('ultimate-clash-lost',s,28,q=>!q.powerClash);
  for(const move of ['fan','ribbon','vault','dash']){
   s=setup(3,true);Object.assign(s.boss,{phase:'warn',move,timer:.85,warnDuration:.85});
   measure('fire-'+move,s,12,q=>q.boss.phase==='recover'&&(q.boss.recoverAge||0)>.3,()=>({}),true);
  }
  const art=await w.loadAdventureArt();window.audit={w,setup,art,moves,cases};
  return{cases,assetPaths:w.actTwoArtPaths(),source:'actual stepAdventure and actTwoBossDrawing / harlequinDrawing at 120 Hz',errors:[]};
 });
 const inventory=[];
 const paths={
  'act-two-harlequin':data.assetPaths['act-two-harlequin'],
  ...Object.fromEntries(['episode-harlequin-walk','nightmare-phase-two','nightmare-phase-two-walk','nightmare-phase-three','nightmare-phase-three-walk','aerial-boss-air-actions','pressure-boss-air','pressure-boss-portraits'].map(k=>[k,data.assetPaths[k]]))
 };
 for(const [key,url]of Object.entries(paths)){
  const file='public'+url,m=await sharp(file).metadata(),side=m.width/4,hashes=[],bounds=[];
  for(let i=0;i<m.height/side*4;i++){
   const rgba=await sharp(file).extract({left:i%4*side,top:Math.floor(i/4)*side,width:side,height:side}).ensureAlpha().raw().toBuffer();let x0=side,y0=side,x1=0,y1=0;
   for(let p=0;p<side*side;p++){
    if(!rgba[p*4+3])rgba.fill(0,p*4,p*4+3);
    if(rgba[p*4+3]>80){const x=p%side,y=Math.floor(p/side);x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}
   }
   hashes.push(createHash('sha256').update(rgba).digest('hex'));bounds.push({frame:i,x:x0,y:y0,w:x1-x0+1,h:y1-y0+1});
  }
  const used=[...new Set(data.cases.filter(q=>!q.fire).flatMap(q=>q.spans.filter(p=>p.key===key).map(p=>p.frame)))].sort((a,b)=>a-b);
  const portrait=key==='pressure-boss-portraits'?[...new Set(data.cases.filter(q=>q.name.startsWith('ultimate-clash')).flatMap(q=>q.spans.filter(p=>p.key==='pressure-boss-air'&&['travel','contest','boss-boost','hexy-boost','resolve'].includes(p.phase)).map(p=>p.frame)))].sort((a,b)=>a-b):undefined;
  inventory.push({key,file,dimensions:[m.width,m.height],cells:hashes.length,distinctImages:new Set(hashes).size,observedWorldFrames:used,observedPortraitFrames:portrait,alphaBounds:bounds,cellHashes:hashes,fileHash:createHash('sha256').update(await fs.readFile(file)).digest('hex')});
 }
 // Film strips show the actual selected world cels at chronological points
 // from each simulated move, enlarged for inspection without altering art.
 for(const item of data.cases.filter(q=>!q.fire)){
  const samples=[];for(const phase of Object.keys(item.phases)){
   const spans=item.spans.filter(p=>p.phase===phase),total=spans.reduce((n,p)=>n+p.duration,0);
   for(let i=0;i<4;i++){let within=total*(i+.5)/4,p=spans.at(-1);for(const span of spans){if(within<span.duration){p=span;break;}within-=span.duration;}samples.push({...p,at:p.start+within});}
  }
  const parts=[];for(const [i,p]of samples.entries()){
   const inv=inventory.find(q=>q.key===p.key);if(!inv)continue;const side=inv.dimensions[0]/4;
   parts.push({input:await sharp(inv.file).extract({left:p.frame%4*side,top:Math.floor(p.frame/4)*side,width:side,height:side}).resize(220,220).png().toBuffer(),left:i%4*240+10,top:Math.floor(i/4)*260+35});
   const svg='<svg width="239" height="34"><text x="7" y="13" fill="white" font-size="12" font-family="Arial">'+p.phase+' #'+p.frame+'</text><text x="7" y="29" fill="white" font-size="12" font-family="Arial">'+p.at.toFixed(2)+' s'+(p.hidden?' (oculta)':'')+'</text></svg>';
   parts.push({input:Buffer.from(svg),left:i%4*240,top:Math.floor(i/4)*260});
  }
  await sharp({create:{width:960,height:Math.max(260,Math.ceil(samples.length/4)*260),channels:4,background:'#241c38'}}).composite(parts).jpeg({quality:95}).toFile(out+'/'+item.name+'.jpg');
 }
 const compare=[['Idle F2','nightmare-phase-two',0],['Walk F2','nightmare-phase-two-walk',1],['Cast F2','nightmare-phase-two',5],['Idle F3','nightmare-phase-three',0],['Walk F3','nightmare-phase-three-walk',1],['Cast F3','nightmare-phase-three',5],['Air normal','pressure-boss-air',0],['Air boosted','pressure-boss-air',4],['Air countered','pressure-boss-air',12]],comparison=[];
 for(const [i,[label,key,f]]of compare.entries()){
  const inv=inventory.find(q=>q.key===key),side=inv.dimensions[0]/4;
  comparison.push({input:await sharp(inv.file).extract({left:f%4*side,top:Math.floor(f/4)*side,width:side,height:side}).png().toBuffer(),left:i%3*512,top:Math.floor(i/3)*550+32});
  comparison.push({input:Buffer.from('<svg width="512" height="30"><text x="12" y="23" fill="white" font-size="21" font-family="Arial">'+label+' - same 512px cell</text></svg>'),left:i%3*512,top:Math.floor(i/3)*550});
 }
 await sharp({create:{width:1536,height:1650,channels:4,background:'#241c38'}}).composite(comparison).jpeg({quality:96}).toFile(out+'/scale-comparison.jpg');
 data.productionSourceHashes={};for(const file of ['actors/bosses/adventureActTwoBosses.js','actors/bosses/nightmareUltimate.js','actors/bosses/nightmareGames.js','engine/nightmarePressureActing.js','engine/nightmarePowerClash.js','render/nightmareCornerPanels.js','render/actTwoCanvas.js'])data.productionSourceHashes[file]=createHash('sha256').update(await fs.readFile('src/components/arcade/adventure/'+file)).digest('hex');
 data.inventory=inventory;data.browserErrors=errors;data.hashNote='RGB under alpha=0 is zeroed before distinct-image counts; hidden RGB can differ between duplicate WebP cells.';delete data.assetPaths;
 await fs.writeFile(dir+'/measurements.json',JSON.stringify(data,null,2)+'\n');
 console.log(JSON.stringify({cases:data.cases.length,inventory:inventory.map(q=>({key:q.key,cells:q.cells,unique:q.distinctImages,used:q.observedWorldFrames.length})),browserErrors:errors}));
}finally{await browser.close();}
