import fs from 'node:fs/promises';
import {chromium} from '@playwright/test';
const dir='context/arcade/barge-coherence/',errors=[],browser=await chromium.launch({channel:'chrome'}),page=await browser.newPage({viewport:{width:1440,height:900}});
page.on('pageerror',e=>errors.push(e.message));
await page.route('**/__barge_review',r=>r.fulfill({contentType:'text/html',body:'<body style="margin:0;background:#171b25"></body>'}));
try{
 await page.goto((process.env.MAGIC_DRINK_TEST_URL||'http://127.0.0.1:4322')+'/__barge_review');
 await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/',w=window.review=Object.assign({},...await Promise.all(['engine/adventureModel.js','render/adventureCanvas.js','render/adventureCamera.js','actors/bosses/adventureBarge.js','actors/bosses/bargeWaterAttacks.js'].map(p=>import(root+p))));
  w.art=await w.loadAdventureArt();w.c=document.createElement('canvas');w.c.style='width:1440px;height:810px;display:block';document.body.append(w.c);w.paint=()=>w.renderAdventure(w.c,w.s,w.art);
  w.setup=name=>{w.name=name;w.trace=[];const s=w.s=w.createAdventure(2),a=s.level.arena;for(const key of ['enemies','outposts','supplies','stars','cages','hazards'])s[key]=[];
   Object.assign(s.player,{x:a.left+570,y:a.y,ground:s.platforms.findIndex(p=>p.x===a.left),hurt:99});s.arenaLocked=true;
   Object.assign(s.boss,{x:a.right-400,phase:'warn',engaged:true,timer:.8,move:name==='drum'?'drumroll':name==='jet'?'jet':'tidal',targetX:s.player.x});
   if(name==='phase-two'){s.boss.phase='recover';s.boss.timer=50;s.boss.hp=150;}
   if(name==='defeat'){s.boss.hp=0;s.boss.hullOpened=true;}
   if(name==='water-hit'){s.boss.phase='recover';s.boss.timer=50;s.player.hurt=0;w.hitAt=s.player.x+90;}
   for(let i=0;i<600;i++)w.followAdventureCamera(s,1/120);w.fixedCamera={...s.camera};w.paint();
  };
  w.step=()=>{const s=w.s;
   if(w.name==='water-hit'&&s.time<.01)s.hostile.push({kind:'barge-wave',water:true,barge:true,x:w.hitAt,y:s.player.y-20,floor:s.player.y,vx:-240,vy:0,r:25,drawSize:108,life:2,age:0});
   w.stepAdventure(s,{},1/120);s.camera={...w.fixedCamera};
   w.trace.push({time:s.time,phase:s.boss.phase,move:s.boss.move,hullOpened:s.boss.hullOpened,shattered:s.boss.shattered,beat:s.boss.release,wet:s.player.wetTime,hit:s.player.hitType,hearts:s.hearts,shots:s.hostile.map(q=>({kind:q.kind,x:q.x,y:q.y,age:q.age,flight:q.flight,size:q.drawSize}))});
  };
  w.record=async seconds=>{const chunks=[],stream=w.c.captureStream(30),rec=new MediaRecorder(stream,{mimeType:'video/webm'}),done=new Promise(resolve=>{rec.ondataavailable=e=>chunks.push(e.data);rec.onstop=()=>{const r=new FileReader();r.onload=()=>resolve(String(r.result).split(',')[1]);r.readAsDataURL(new Blob(chunks,{type:'video/webm'}));};});
   rec.start();let start,last,acc=0;await new Promise(resolve=>{const frame=now=>{start??=now;last??=now;acc+=Math.min(.05,(now-last)/1000);last=now;while(acc>=1/120){w.step();acc-=1/120;}w.paint();if(now-start<seconds*1000)requestAnimationFrame(frame);else resolve();};requestAnimationFrame(frame);});rec.stop();const data=await done;stream.getTracks().forEach(t=>t.stop());return data;
  };
 });
 const scenes=(process.env.BARGE_SCENES||'drum,tidal,jet,phase-two,defeat,water-hit').split(',');
 for(const name of scenes){
  await page.evaluate(n=>window.review.setup(n),name);await page.locator('canvas').screenshot({path:dir+name+'-before.png'});
  const data=await page.evaluate(seconds=>window.review.record(seconds),name==='defeat'?4.8:4);
  await fs.writeFile(dir+name+'.webm',Buffer.from(data,'base64'));await fs.writeFile(dir+name+'-trace.json',JSON.stringify(await page.evaluate(()=>window.review.trace)));
  await page.locator('canvas').screenshot({path:dir+name+'-after.png'});
 }
 await page.setContent('<video muted></video>');
 for(const name of scenes){
  const film=(await fs.readFile(dir+name+'.webm')).toString('base64');
  const result=await page.evaluate(async({film,name})=>{
   const v=document.querySelector('video');v.src='data:video/webm;base64,'+film;await new Promise(r=>v.onloadeddata=r);if(!Number.isFinite(v.duration))await new Promise(r=>{v.onseeked=r;v.currentTime=1e6;});
   const c=document.createElement('canvas');c.width=1440;c.height=900;const b=c.getContext('2d');
   for(let i=0;i<9;i++){
    const time=name==='defeat'?[.05,.4,.8,1.2,1.6,1.9,2.5,3.3,4.3][i]:name==='tidal'?[.4,.9,1.1,1.4,1.8,2.1,2.5,2.9,3.4][i]:name==='water-hit'?[.15,.25,.35,.5,.7,.9,1.2,1.5,1.8][i]:.15+i*.4;
    await new Promise(r=>{v.onseeked=r;v.currentTime=time;});const x=i%3*480,y=Math.floor(i/3)*300;
    b.fillStyle='#171b25';b.fillRect(x,y,480,300);b.drawImage(v,0,180,1440,600,x,y,480,280);b.fillStyle='white';b.font='14px sans-serif';b.fillText(name+' | '+time.toFixed(2)+' s',x+8,y+296);
   }return c.toDataURL('image/png').split(',')[1];
  },{film,name});await fs.writeFile(dir+name+'-playback.png',Buffer.from(result,'base64'));
 }
 await fs.writeFile(dir+'runtime-errors.json',JSON.stringify(errors));if(errors.length)throw Error(errors.join('\n'));console.log('Reviewed '+scenes.join(', '));
}finally{await browser.close();}
