import {test,expect} from '@playwright/test';
import fs from 'node:fs';
const folder='tests/artifacts/arcade/village-night/';
test('painted night route, evacuation, flight, absorption, rescue and Hexy capture in motion',async({page})=>{
 test.setTimeout(180000);fs.mkdirSync(folder,{recursive:true});const errors=[],missing=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&r.url().includes('/arcade/'))missing.push(r.url());});
 await page.goto('/',{waitUntil:'domcontentloaded'});
 await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/',w=window.nightReview=Object.assign({},...await Promise.all(['engine/adventureModel.js','actors/enemies/adventureEnemies.js','world/adventureTerrain.js','render/adventureCanvas.js','engine/villageRescue.js','engine/adventureVillage.js'].map(p=>import(root+p))));
  w.art=await w.loadAdventureArt();w.c=document.createElement('canvas');w.c.id='night-review';w.c.style='position:fixed;inset:0;width:1440px;height:810px;z-index:999999';document.body.append(w.c);
  w.pose=(x=9000)=>{const s=w.s=w.createAdventure(7),y=w.groundY(s.level.route,x);Object.assign(s.player,{x,y,hurt:999,ground:s.platforms.indexOf(w.groundAt(s.platforms,x))});s.camera={x:Math.max(0,x-300),y:40,backdropY:40,zoom:1};s.village.furthest=x;s.checkpointAt=s.level.checkpoints.filter(q=>q[0]<=x).at(-1)||null;s.noticeTime=0;s.enemies=[];s.stars=[];s.supplies=[];s.cages=[];s.villagers=[];s.carriages=[];w.action=()=>({});w.before=()=>{};};
  w.paint=()=>{const h=w.s.player.hurt;w.s.player.hurt=0;w.renderAdventure(w.c,w.s,w.art);w.s.player.hurt=h;};
  w.record=async()=>{
   w.paint();const stream=w.c.captureStream(60),chunks=[],rec=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:6500000}),stats={states:[],render:[],simulationTime:0,defeats:[]};
   const done=new Promise(r=>{rec.ondataavailable=e=>chunks.push(e.data);rec.onstop=()=>{const f=new FileReader();f.onload=()=>r(String(f.result).split(',')[1]);f.readAsDataURL(new Blob(chunks,{type:'video/webm'}));};});rec.start();let start,last,acc=0;
   await new Promise(resolve=>{const frame=now=>{start??=now;last??=now;acc+=Math.min(.05,(now-last)/1000);last=now;while(acc>=1/120){w.before(stats.simulationTime);w.stepAdventure(w.s,w.action(stats.simulationTime),1/120);stats.simulationTime+=1/120;for(const q of w.s.villagers){if(!stats.states.includes(q.state))stats.states.push(q.state);}if(w.s.player.candy&&!stats.states.includes('hexy-candy'))stats.states.push('hexy-candy');acc-=1/120;}
    const at=performance.now();w.paint();stats.render.push(performance.now()-at);if(now-start<4200)requestAnimationFrame(frame);else resolve();};requestAnimationFrame(frame);});
   stats.render.sort((a,b)=>a-b);stats.renderP95=stats.render[Math.floor(stats.render.length*.95)];delete stats.render;stats.hearts=w.s.hearts;stats.done=w.s.done;stats.candy=!!w.s.player.candy;rec.stop();const data=await done;stream.getTracks().forEach(t=>t.stop());return{data,stats};
  };
 });
 for(const x of [100,2600,5800,6800,7800,10000,12500,16000,21500]){await page.evaluate(x=>{const w=window.nightReview;w.pose(x);w.paint();},x);await page.locator('#night-review').screenshot({path:folder+'route-'+x+'.png'});}
 for(const name of (process.env.NIGHT_SCENES||'entrance,street,crowd,help,carriage,flying,fall,absorb,rescue,capture,last-heart').split(',')){
  await page.evaluate(name=>{
   const w=window.nightReview;w.pose(name==='entrance'?6500:9000);const s=w.s,x=s.player.x;
   if(['entrance','street'].includes(name))w.action=t=>({right:t<2.1,left:t>=2.1});
   if(name==='crowd'){
    s.villagers=s.level.villagers.slice(0,8).map((n,i)=>({...n,style:i,x:x+430+i*60,y:w.groundY(s.level.route,x+430+i*60),state:'flee',age:0,gait:i*.13,runAge:0,warning:i===0,trip:false,active:true}));
   }
   if(name==='help')s.villagers=[{...s.level.villagers[5],style:4,x:x+350,y:s.player.y,state:'flee',age:0,gait:0,runAge:1.2,trip:true},{...s.level.villagers[6],style:6,x:x+445,y:s.player.y,state:'flee',age:0,gait:0,trip:false,group:s.level.villagers[5].group}];
   if(name==='carriage')s.carriages=[{x:x+700,y:s.player.y-28,speed:295,active:true,gait:0}];
   if(['flying','fall','absorb','rescue'].includes(name)){
    const e=Object.assign(w.makeEnemy(x+330,s.player.y,26,9),{active:true,flying:['flying','fall'].includes(name),flightHeight:150,timer:name==='flying'?0:99,hp:name==='absorb'?3:10});s.enemies=[e];
    if(name==='fall')w.before=t=>{if(t>.7&&!e.defeated){e.defeated=true;e.hp=0;w.releaseWitchVictims(s,e);}};
    if(['absorb','rescue'].includes(name)){const n={...s.level.villagers[0],x:x+170,y:s.player.y,state:'candy',age:0,gait:0,curseOwner:w.witchId(e)};s.villagers=[n];if(name==='absorb')e.timer=0;else w.before=t=>{if(t>.7&&!e.defeated){e.defeated=true;e.hp=0;e.deadTime=1.15;w.releaseWitchVictims(s,e);}};}
   }
   if(['capture','last-heart'].includes(name)){s.player.hurt=0;if(name==='last-heart')s.hearts=1;w.enemyShot(s,x+340,s.player.y-38,Math.PI,400,'candy-ray',{r:9,life:2,village:true,owner:'review'});if(name==='capture')w.action=t=>t>1.5?{left:Math.floor(t*9)%2===0,right:Math.floor(t*9)%2===1}:{};}
  },name);
  const r=await page.evaluate(()=>window.nightReview.record());fs.writeFileSync(folder+name+'.webm',Buffer.from(r.data,'base64'));fs.writeFileSync(folder+name+'.json',JSON.stringify(r.stats,null,2));
  if(name==='help')expect(r.stats.states).toContain('help');if(name==='absorb')expect(r.stats.states).toContain('absorbed');if(name==='rescue')expect(r.stats.states).toContain('rescue');if(name==='capture'){expect(r.stats.states).toContain('hexy-candy');expect(r.stats.candy).toBe(false);}if(name==='last-heart'){expect(r.stats.done).toBe(true);expect(r.stats.candy).toBe(true);}
 }
 expect(errors).toEqual([]);expect(missing).toEqual([]);
});
