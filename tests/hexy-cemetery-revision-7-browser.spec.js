import {test,expect} from '@playwright/test';
import fs from 'node:fs';

test('record revision 7 crypt, hands, skeleton fragments, injuries, reaching, supplies and spirit projectiles',async({page})=>{
 test.setTimeout(240000);const folder=process.env.CEMETERY_REVIEW_FOLDER||'tests/artifacts/arcade/cemetery-revision-7/';fs.mkdirSync(folder,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
 await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/',w=window.r7=Object.assign({},...await Promise.all(['engine/adventureModel.js','engine/adventureNightmareMotion.js','engine/adventureGraveyard.js','actors/enemies/adventureEnemies.js','actors/enemies/adventureNightmares.js','render/adventureCanvas.js','render/adventureSprites.js','world/adventureTerrain.js'].map(f=>import(root+f))));
  w.art=await w.loadAdventureArt();w.c=document.createElement('canvas');w.c.id='revision-review';w.c.style='position:fixed;inset:0;width:1440px;height:810px;z-index:999999';document.body.append(w.c);
  w.pose=(x=7200)=>{w.s=w.createAdventure(6);w.s.noticeTime=0;for(const k of ['enemies','graves','stars','pickups','supplies','cages'])w.s[k]=[];Object.assign(w.s.player,{x,y:w.groundY(w.s.level.route,x),ground:w.s.platforms.findIndex(q=>q.kind==='earth'&&x>=q.x&&x<q.x+q.w),hurt:999});w.s.camera={x:Math.max(0,x-300),y:w.s.player.y-440,backdropY:40,zoom:1};w.action=()=>({});};
  w.enemy=(x,type,props={})=>{const e=w.makeEnemy(x,w.groundY(w.s.level.route,x),type);Object.assign(e,{active:true},props);w.s.enemies.push(e);return e;};
  w.kill=e=>{e.hp=0;e.defeated=true;e.trap=0;w.beginNightmareDefeat(w.s,e);};
  w.paint=()=>{const hurt=w.s.player.hurt;w.s.player.hurt=0;w.renderAdventure(w.c,w.s,w.art);w.s.player.hurt=hurt;};
  w.record=async seconds=>{
   const chunks=[],stream=w.c.captureStream(30),rec=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:6500000}),stats={phases:[],keys:[],handDeath:[],reactions:[],spawned:0,fragments:0,remains:0,spiritShots:0,minHearts:5,renderTimes:[],simulationTime:0};
   const done=new Promise(resolve=>{rec.ondataavailable=e=>chunks.push(e.data);rec.onstop=()=>{const r=new FileReader();r.onload=()=>resolve(String(r.result).split(',')[1]);r.readAsDataURL(new Blob(chunks,{type:'video/webm'}));};});w.paint();rec.start();let start,last,acc=0;
   await new Promise(resolve=>{const frame=now=>{start??=now;last??=now;acc+=Math.min(.05,(now-last)/1000);last=now;
    while(acc>=1/120){w.stepAdventure(w.s,w.action(w.s.time),1/120);stats.simulationTime+=1/120;stats.minHearts=Math.min(stats.minHearts,w.s.hearts);
     for(const e of w.s.enemies){if(!stats.phases.includes(e.phase))stats.phases.push(e.phase);const d=w.nightmareDrawing(e);if(!stats.keys.includes(d.key))stats.keys.push(d.key);if(e.type===24&&e.hp<=0&&!e.fragmentKind&&!stats.handDeath.includes(d.frame))stats.handDeath.push(d.frame);if(d.key==='nightmare-zombie-reactions-v8'&&!stats.reactions.includes(d.frame))stats.reactions.push(d.frame);}
     for(const q of w.s.graves)stats.spawned=Math.max(stats.spawned,q.spawned);stats.fragments=Math.max(stats.fragments,w.s.enemies.filter(e=>e.fragmentKind).length);stats.remains=Math.max(stats.remains,w.s.looseBones.length);stats.spiritShots=Math.max(stats.spiritShots,w.s.hostile.filter(q=>q.kind==='bell-soul'||q.kind==='bell-wisp').length);acc-=1/120;
    }const t=performance.now();w.paint();stats.renderTimes.push(performance.now()-t);if(now-start<seconds*1000)requestAnimationFrame(frame);else resolve();};requestAnimationFrame(frame);});
   stats.renderTimes.sort((a,b)=>a-b);stats.renderP95=stats.renderTimes[Math.floor(stats.renderTimes.length*.95)];delete stats.renderTimes;stats.crates=w.s.supplies.map(q=>({hp:q.hp,boosted:!!q.loot?.boosted}));stats.drops=w.s.pickups.map(q=>({kind:q.kind,boosted:q.boosted}));rec.stop();const data=await done;stream.getTracks().forEach(t=>t.stop());return{data,stats};
  };
 });
 for(const [name,seconds]of [['crypt',14],['hand',6],['skeleton',10],['injuries',8],['reach',7],['reach-injured',7],['spirits',8],['crate-a',4],['crate-b',4]]){
  if(process.env.CEMETERY7_SCENES&&!process.env.CEMETERY7_SCENES.split(',').includes(name))continue;
  await page.evaluate(name=>{const w=window.r7;w.pose();
   if(name==='crypt'){const q=w.createAdventure(6).graves.find(q=>q.kind==='crypt');w.pose(q.x-370);w.s.graves=[q];}
   if(name==='hand'){const e=w.enemy(7490,24);w.action=t=>{if(t>1.4&&!e.defeated)w.kill(e);return{};};}
   if(name==='skeleton'){const e=w.enemy(7540,22,{timer:.1});w.action=t=>{if(t>4.7&&!e.defeated)w.kill(e);if(t>7)w.s.player.aimY=1;return{attack:t>7,down:t>7};};}
   if(name==='injuries'){const a=w.enemy(7410,18,{nightmareVariant:0,armMissing:false,timer:99}),b=w.enemy(7640,18,{nightmareVariant:4,armMissing:false,timer:99});w.action=t=>{if(t>.6&&!a.reviewHit){a.reviewHit=true;a.hp=8;}if(t>1.2&&!b.reviewHit){b.reviewHit=true;b.hp=4;}for(const e of w.s.enemies)if(t>4&&e.type===24&&e.hp>0)w.kill(e);return{};};}
   if(name.startsWith('reach')){const b=w.s.platforms.find(q=>q.kind==='nightmare-branch'&&q.tree===3&&q.side===1),x=b.x+b.w/2;w.pose(x);const q=w.s.platforms.find(q=>q.kind==='nightmare-branch'&&q.tree===3&&q.side===1);q.breakAfter=99;Object.assign(w.s.player,{y:w.surfaceY(q,x),ground:w.s.platforms.indexOf(q)});w.enemy(x+3,18,{nightmareVariant:0,armMissing:name==='reach-injured',dir:-1});w.action=t=>({right:t>4&&t<5});}
   if(name==='spirits'){w.pose(19930);const b=w.s.boss;Object.assign(b,{engaged:true,phase:'patrol',timer:.3,phaseAge:0,phaseDuration:.3,vulnerable:true,y:450,dir:-1,bellBroken:true,stage:2,hp:92,turn:0});w.s.arenaLocked=true;}
   if(name.startsWith('crate')){const q=w.createAdventure(6).supplies.filter(q=>q.loot?.boosted)[name==='crate-a'?0:1];w.pose(q.x-170);w.s.supplies=[q];w.action=t=>({attack:t>.4&&t<1.6});}
  },name);
  const {data,stats}=await page.evaluate(seconds=>window.r7.record(seconds),seconds);fs.writeFileSync(folder+name+'.webm',Buffer.from(data,'base64'));fs.writeFileSync(folder+name+'.json',JSON.stringify(stats,null,2));await page.locator('#revision-review').screenshot({path:folder+name+'.png'});
  expect(stats.minHearts).toBe(5);if(name==='crypt')expect(stats.spawned).toBe(8);if(name==='hand')expect(stats.handDeath).toEqual([8,9,10,11]);if(name==='skeleton')expect(stats.fragments).toBe(5);if(name==='injuries')expect(stats.reactions.length).toBe(16);if(name.startsWith('reach'))expect(stats.phases).toContain('reachUp');if(name==='spirits')expect(stats.spiritShots).toBeGreaterThan(0);if(name.startsWith('crate')){expect(stats.crates[0].hp).toBe(0);expect(stats.drops[0].boosted).toBe(true);}
 }
 expect(errors).toEqual([]);
});
