import {test,expect} from '@playwright/test';
import fs from 'node:fs';
const folder='tests/artifacts/arcade/town-cannon/';
test('review town streets in motion and three real cannon finishes',async({page})=>{
 test.setTimeout(150000);fs.mkdirSync(folder,{recursive:true});const errors=[],missing=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&r.url().includes('/arcade/'))missing.push(r.url());});await page.goto('/');
 await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/',w=window.townReview=Object.assign({},...await Promise.all(['engine/adventureModel.js','engine/adventureAmmo.js','actors/enemies/adventureEnemies.js','world/adventureTerrain.js','render/adventureCanvas.js'].map(p=>import(root+p))));
  w.art=await w.loadAdventureArt();w.c=document.createElement('canvas');w.c.id='town-review';w.c.style='position:fixed;inset:0;width:1440px;height:810px;z-index:999999';document.body.append(w.c);
  w.pose=(x=9000)=>{const s=w.s=w.createAdventure(7),y=w.groundY(s.level.route,x);Object.assign(s.player,{x,y,hurt:999,ground:s.platforms.indexOf(w.groundAt(s.platforms,x))});s.camera={x:x-300,y:y-440,backdropY:40,zoom:1};s.noticeTime=0;s.enemies=[];s.stars=[];s.supplies=[];s.cages=[];s.villagers=[];w.equipDrink(s,13);w.action=()=>({});};
  w.paint=()=>{const h=w.s.player.hurt;w.s.player.hurt=0;w.renderAdventure(w.c,w.s,w.art);w.s.player.hurt=h;};
  w.record=async()=>{
   w.paint();const stream=w.c.captureStream(60),chunks=[],rec=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:7000000}),stats={styles:[],defeats:[],landings:0,casts:0,simulationTime:0,render:[]};
   const done=new Promise(r=>{rec.ondataavailable=e=>chunks.push(e.data);rec.onstop=()=>{const f=new FileReader();f.onload=()=>r(String(f.result).split(',')[1]);f.readAsDataURL(new Blob(chunks,{type:'video/webm'}));};});rec.start();let start,last,acc=0;
   await new Promise(resolve=>{const frame=now=>{start??=now;last??=now;acc+=Math.min(.05,(now-last)/1000);last=now;while(acc>=1/120){w.stepAdventure(w.s,w.action(w.s.time),1/120);stats.simulationTime+=1/120;for(const e of w.s.enemies)if(e.popcornDefeat){const q=e.popcornDefeat;if(!stats.styles.includes(q.style)){stats.styles.push(q.style);stats.defeats.push({time:w.s.time,type:e.type,style:q.style});}if(q.landed)stats.landings++;}if(w.s.events.includes('popcornShot'))stats.casts++;acc-=1/120;}
    const at=performance.now();w.paint();stats.render.push(performance.now()-at);if(now-start<4000)requestAnimationFrame(frame);else resolve();};requestAnimationFrame(frame);});
   stats.render.sort((a,b)=>a-b);stats.renderP95=stats.render[Math.floor(stats.render.length*.95)];delete stats.render;rec.stop();const data=await done;stream.getTracks().forEach(t=>t.stop());return{data,stats};
  };
 });
 for(const x of [1500,4700,6000,7600,9000,11000,14500,17500,20000]){await page.evaluate(x=>{const w=window.townReview;w.pose(x);w.paint();},x);await page.locator('#town-review').screenshot({path:folder+'street-'+x+'.png'});}
 for(const name of ['street','square','market','vapor','scatter','launch','pumpkin','witch']){
  if(process.env.TOWN_SCENES&&!process.env.TOWN_SCENES.split(',').includes(name))continue;
  await page.evaluate(name=>{const w=window.townReview,x=name==='street'?7100:name==='square'?8700:name==='market'?14100:9700;w.pose(x);const s=w.s;
   if(['street','square','market'].includes(name))w.action=t=>({right:t<2,left:t>=2});
   else{const type=name==='pumpkin'?25:name==='witch'?26:18,targetStyle=name==='vapor'?0:name==='scatter'?1:2,ex=x+150,seed=((targetStyle-Math.floor(ex/97))%3+3)%3,e=w.makeEnemy(ex,w.groundY(s.level.route,ex),type,seed);Object.assign(e,{active:false,timer:99,nightmareVariant:0,releasesSoul:false});s.enemies=[e];w.action=t=>({attack:t>.6&&t<.68});}
  },name);
  const r=await page.evaluate(()=>window.townReview.record());fs.writeFileSync(folder+name+'.webm',Buffer.from(r.data,'base64'));fs.writeFileSync(folder+name+'.json',JSON.stringify(r.stats,null,2));
  if(['vapor','scatter','launch'].includes(name))expect(r.stats.styles).toContain(name);if(['launch','scatter'].includes(name))expect(r.stats.landings).toBeGreaterThan(0);if(['pumpkin','witch'].includes(name))expect(r.stats.styles).toContain('vapor');
 }
 expect(errors).toEqual([]);expect(missing).toEqual([]);
});

test('render the cannon audio through the real effects bus with no clipping and absolute mute',async({page})=>{
 fs.mkdirSync(folder,{recursive:true});await page.goto('/');
 const results=await page.evaluate(async()=>{
  const {playPopcornSound}=await import('/src/components/arcade/shared/audio/popcornSound.js'),{createEffectsBus}=await import('/src/components/arcade/shared/audio/effectsBus.js');
  const render=async(mute=false)=>{const ctx=new OfflineAudioContext(1,44100*4,44100),master=ctx.createGain();master.gain.value=mute?0:.7;master.connect(ctx.destination);const bus=createEffectsBus(ctx,master);
   playPopcornSound(ctx,bus,'popcornShot',.1);playPopcornSound(ctx,bus,'popcornCast',1.2);playPopcornSound(ctx,bus,'popcornFinish',1.37);playPopcornSound(ctx,bus,'popcornLand',2);playPopcornSound(ctx,bus,'popcornImpact',2.7);
   const buffer=await ctx.startRendering(),d=buffer.getChannelData(0);let peak=0,sum=0;for(const v of d){peak=Math.max(peak,Math.abs(v));sum+=v*v;}const wav=new ArrayBuffer(44+d.length*2),view=new DataView(wav),str=(at,s)=>[...s].forEach((c,i)=>view.setUint8(at+i,c.charCodeAt(0)));str(0,'RIFF');view.setUint32(4,36+d.length*2,true);str(8,'WAVE');str(12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);view.setUint32(24,44100,true);view.setUint32(28,88200,true);view.setUint16(32,2,true);view.setUint16(34,16,true);str(36,'data');view.setUint32(40,d.length*2,true);for(let i=0;i<d.length;i++)view.setInt16(44+i*2,Math.max(-1,Math.min(1,d[i]))*32767,true);let text='';for(const v of new Uint8Array(wav))text+=String.fromCharCode(v);return{peak,rms:Math.sqrt(sum/d.length),base64:btoa(text)};};return{sound:await render(),mute:await render(true)};
 });
 expect(results.sound.peak).toBeLessThan(.95);expect(results.sound.rms).toBeGreaterThan(.01);expect(results.mute.peak).toBe(0);fs.writeFileSync(folder+'cannon-audio.wav',Buffer.from(results.sound.base64,'base64'));delete results.sound.base64;delete results.mute.base64;fs.writeFileSync(folder+'audio.json',JSON.stringify(results,null,2));
});
