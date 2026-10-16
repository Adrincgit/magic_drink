import {test,expect} from '@playwright/test';
import fs from 'node:fs';
const folder='tests/artifacts/arcade/village-5-2/revision-2/';
test('record village arrival, the candy spell, Halloween street and refuge completion',async({page})=>{
 test.setTimeout(220000);fs.mkdirSync(folder,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
 await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/',w=window.villageReview=Object.assign({},...await Promise.all(['engine/adventureModel.js','actors/enemies/adventureEnemies.js','render/adventureCanvas.js','render/adventureSprites.js','world/adventureTerrain.js'].map(f=>import(root+f))));
  w.art=await w.loadAdventureArt();w.c=document.createElement('canvas');w.c.id='village-review';w.c.style='position:fixed;inset:0;width:1440px;height:810px;z-index:999999';document.body.append(w.c);
  w.pose=(x=90)=>{w.s=w.createAdventure(7);w.s.noticeTime=0;w.s.stars=[];w.s.supplies=[];w.s.cages=[];const y=w.groundY(w.s.level.route,x);Object.assign(w.s.player,{x,y,hurt:999,ground:w.s.platforms.findIndex(q=>q.x<=x&&q.x+q.w>x)});w.s.camera={x:Math.max(0,x-300),y:y-440,backdropY:40,zoom:1};w.action=()=>({});};
  w.paint=()=>{const h=w.s.player.hurt;w.s.player.hurt=0;w.renderAdventure(w.c,w.s,w.art);w.s.player.hurt=h;};
  w.record=async seconds=>{
   w.paint();const chunks=[],stream=w.c.captureStream(30),rec=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:6500000});
   const stats={npcStates:[],enemyStates:[],frames:[],events:[],transforms:[],projectiles:[],npcStyles:[],renderTimes:[],simulationTime:0};
   const done=new Promise(resolve=>{rec.ondataavailable=e=>chunks.push(e.data);rec.onstop=()=>{const r=new FileReader();r.onload=()=>resolve(String(r.result).split(',')[1]);r.readAsDataURL(new Blob(chunks,{type:'video/webm'}));};});rec.start();let start,last,acc=0;
   await new Promise(resolve=>{const frame=now=>{start??=now;last??=now;acc+=Math.min(.05,(now-last)/1000);last=now;
    while(acc>=1/120){w.stepAdventure(w.s,w.action(w.s.time),1/120);stats.simulationTime+=1/120;
     for(const q of w.s.hostile)if(!stats.projectiles.includes(q.kind))stats.projectiles.push(q.kind);
     for(const q of w.s.villagers){if(q.state==='flee'&&q.x>w.s.camera.x&&q.x<w.s.camera.x+960&&!stats.npcStyles.includes(q.style))stats.npcStyles.push(q.style);if(!stats.npcStates.includes(q.state))stats.npcStates.push(q.state);if(q.state==='turning'&&!stats.transforms.some(n=>n.id===q.id))stats.transforms.push({id:q.id,x:q.x,time:stats.simulationTime});}
     for(const e of w.s.enemies){const state=e.type+':'+e.phase,d=w.enemyDrawing(e);if(!stats.enemyStates.includes(state))stats.enemyStates.push(state);if(!stats.frames.includes(d.key+':'+d.frame))stats.frames.push(d.key+':'+d.frame);}
     for(const e of w.s.events)if(!stats.events.includes(e))stats.events.push(e);acc-=1/120;
    }
    const t=performance.now();w.paint();stats.renderTimes.push(performance.now()-t);if(now-start<seconds*1000)requestAnimationFrame(frame);else resolve();};requestAnimationFrame(frame);});
   stats.won=w.s.won;stats.turned=w.s.village.turned;stats.safe=w.s.village.safe;stats.renderTimes.sort((a,b)=>a-b);stats.renderP95=stats.renderTimes[Math.floor(stats.renderTimes.length*.95)];delete stats.renderTimes;rec.stop();const data=await done;stream.getTracks().forEach(t=>t.stop());return{data,stats};
  };
 });
 for(const [name,seconds]of [['arrival',10],['orchard',9],['approach',10],['fire',7],['candy',8],['child-candy',7],['street',10],['market',8],['refuge',9]]){
  if(process.env.VILLAGE_SCENES&&!process.env.VILLAGE_SCENES.split(',').includes(name))continue;
  await page.evaluate(name=>{const w=window.villageReview;
   if(name==='arrival'){w.pose();w.action=t=>({right:t<6,attack:t>2});}
   if(name==='orchard'){w.pose(3100);w.s.enemies=[];w.action=t=>({right:t<3||t>6,left:t>=3&&t<6});}
   if(name==='approach'){w.pose(4300);w.s.enemies=[];w.action=t=>({right:t<6,left:t>=6});}
   if(name==='child-candy'){w.pose(6500);const s=w.s;s.enemies=[Object.assign(w.makeEnemy(7100,w.groundY(s.level.route,7100),26,900),{active:true,timer:.1,phaseAge:0})];s.villagers=[s.villagers.find(q=>q.group===5&&q.style===3)];Object.assign(s.villagers[0],{x:6860,y:w.groundY(s.level.route,6860),state:'flee',active:true});}
   if(name==='market'){w.pose(13900);w.action=t=>({right:t<4,left:t>=4,attack:t>5});}
   if(name==='fire'){w.pose(2640);w.s.villagers=[];w.s.enemies=w.s.enemies.filter(e=>e.type===25&&e.home===2920);}
   if(name==='candy'){
    w.pose(6500);const s=w.s;s.enemies=[Object.assign(w.makeEnemy(7300,w.groundY(s.level.route,7300),26,900),{active:true,timer:.4,phaseAge:0})];
    s.villagers=s.villagers.filter(q=>q.group===5);for(const q of s.villagers){q.state='flee';q.active=true;}w.action=()=>({});
   }
   if(name==='street'){w.pose(8400);w.action=t=>({right:t<4||t>7,left:t>=4&&t<7,attack:t>7,jump:t>9&&t<9.8});}
   if(name==='refuge'){w.pose(20580);w.s.enemies=[];w.s.villagers=[];w.action=()=>({});}
  },name);
  const {data,stats}=await page.evaluate(seconds=>window.villageReview.record(seconds),seconds);fs.writeFileSync(folder+name+'.webm',Buffer.from(data,'base64'));fs.writeFileSync(folder+name+'.json',JSON.stringify(stats,null,2));await page.locator('#village-review').screenshot({path:folder+name+'.png'});
  if(name==='candy'||name==='child-candy'){expect(stats.npcStates).toContain('turning');expect(stats.npcStates).toContain('candy');expect(stats.turned).toBeGreaterThan(0);}
  if(name==='street'){expect(stats.frames.some(q=>q.startsWith('nightmare-ghost:'))).toBe(true);expect(stats.frames.some(q=>q.startsWith('village-pumpkin-v1:'))).toBe(true);}
  if(name==='arrival'){expect(stats.npcStyles).toContain(2);expect(stats.npcStyles).toContain(3);expect(stats.npcStyles.length).toBeGreaterThan(3);}
  if(name==='fire')expect(stats.projectiles).toContain('lantern-ember');
  if(name==='refuge')expect(stats.won).toBe(true);
 }
 expect(errors).toEqual([]);
});
