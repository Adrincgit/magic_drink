import {test,expect} from '@playwright/test';
import {createAdventure,stepAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {groundY} from '../src/components/arcade/adventure/world/adventureTerrain';
import {NIGHTMARE_PLANES,nightmarePlanePosition} from '../src/components/arcade/adventure/render/nightmareDepthCanvas';
import fs from 'node:fs';
const place=(s,x)=>{Object.assign(s.player,{x,y:groundY(s.level.route,x),ground:s.platforms.findIndex(q=>q.kind==='earth'&&x>=q.x&&x<q.x+q.w),vx:0,vy:0,hurt:0});s.camera={x:Math.max(0,x-300),y:s.player.y-440,backdropY:40,zoom:1};};
test('checkpoint 1: visible fugitives run while Hexy stays at the starting point',()=>{
 const s=createAdventure(6),clowns=s.enemies.filter(e=>e.fleeGroup===0),before=clowns.map(e=>e.x),events=[];for(let i=0;i<120;i++){stepAdventure(s,{},1/120);events.push(...s.events);}
 expect(s.player.x).toBe(90);expect(clowns.every((e,i)=>e.x<before[i]-250)).toBe(true);expect(events.filter(e=>['warning','land','hit'].includes(e))).toEqual([]);
});
test('checkpoint 5: jumping and returning at every part of the gate approach never falls through the earth',()=>{
 const failures=[];
 for(const start of [3920,4090,4170,4230,4330,4400,4520])for(const dir of [-1,1])for(const hold of [0,.08,.2,.6]){
  const s=createAdventure(6);s.enemies=[];s.graves=[];s.stars=[];s.supplies=[];s.pickups=[];place(s,start);
  let previousX=s.player.x;
  for(let i=0;i<360;i++){stepAdventure(s,{left:dir<0,right:dir>0,jump:i/120<hold},1/120);if(s.hearts<5||Math.abs(s.player.x-previousX)>30){failures.push({start,dir,hold,t:i/120,x:s.player.x,y:s.player.y,hearts:s.hearts});break;}previousX=s.player.x;}
 }
 expect(failures).toEqual([]);
});
test('checkpoint 3: elevation and backtracking never shift a backdrop tree vertically',()=>{
 for(const plane of NIGHTMARE_PLANES){
  const start=nightmarePlanePosition({x:1300,y:40,backdropY:40},2000,plane);
  const hill=nightmarePlanePosition({x:3500,y:-125,backdropY:-100},2000,plane);
  const returned=nightmarePlanePosition({x:1300,y:40,backdropY:90},2000,plane);
  expect(hill.y).toBe(start.y);expect(returned).toEqual(start);
 }
});
test('record checkpoints 1 to 5 with the production renderer and unprotected player',async({page})=>{
 test.setTimeout(180000);const folder='tests/artifacts/arcade/checkpoints-1-5/';fs.mkdirSync(folder,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
 await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/',w=window.checkpointReview=Object.assign({},...await Promise.all(['engine/adventureModel.js','render/adventureCanvas.js','world/adventureTerrain.js'].map(f=>import(root+f))));w.art=await w.loadAdventureArt();w.c=document.createElement('canvas');w.c.id='checkpoint-review';w.c.style='position:fixed;inset:0;width:1440px;height:810px;z-index:999999';document.body.append(w.c);
  w.pose=(x,isolate=false)=>{w.s=w.createAdventure(6);w.s.noticeTime=0;Object.assign(w.s.player,{x,y:w.groundY(w.s.level.route,x),ground:w.s.platforms.findIndex(q=>q.kind==='earth'&&x>=q.x&&x<q.x+q.w),hurt:0});w.s.camera={x:Math.max(0,x-300),y:w.s.player.y-440,backdropY:40,zoom:1};if(isolate){w.s.enemies=[];w.s.graves=[];}w.action=()=>({});};
  w.record=async(seconds)=>{const chunks=[],stream=w.c.captureStream(30),rec=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:6000000}),stats={minHearts:5,maxTeleport:0,grounds:[],broken:0};let oldX=w.s.player.x;
   const done=new Promise(resolve=>{rec.ondataavailable=e=>chunks.push(e.data);rec.onstop=()=>{const r=new FileReader();r.onload=()=>resolve(String(r.result).split(',')[1]);r.readAsDataURL(new Blob(chunks,{type:'video/webm'}));};});w.renderAdventure(w.c,w.s,w.art);rec.start();let start,last,acc=0;
   await new Promise(resolve=>{const frame=now=>{start??=now;last??=now;acc+=Math.min(.05,(now-last)/1000);last=now;while(acc>=1/120){w.stepAdventure(w.s,w.action(w.s.time),1/120);stats.minHearts=Math.min(stats.minHearts,w.s.hearts);stats.maxTeleport=Math.max(stats.maxTeleport,Math.abs(w.s.player.x-oldX));oldX=w.s.player.x;const q=w.s.platforms[w.s.player.ground];if(q?.kind==='nightmare-branch'&&!stats.grounds.includes(w.s.player.ground))stats.grounds.push(w.s.player.ground);acc-=1/120;}w.renderAdventure(w.c,w.s,w.art);if(now-start<seconds*1000)requestAnimationFrame(frame);else resolve();};requestAnimationFrame(frame);});
   stats.broken=w.s.platforms.filter(q=>q.gone).length;stats.playerX=w.s.player.x;rec.stop();const data=await done;stream.getTracks().forEach(t=>t.stop());return{data,stats};
  };
 });
 for(const [name,seconds]of [['idle-start',6],['forest-return',12],['gate-return',9],['natural-boughs',8]]){
  if(process.env.CHECKPOINT_SCENES&&!process.env.CHECKPOINT_SCENES.split(',').includes(name))continue;
  await page.evaluate(name=>{const w=window.checkpointReview;
   if(name==='idle-start')w.pose(90);
   if(name==='forest-return'){w.pose(700);w.action=t=>({right:t<6,left:t>=6});}
   if(name==='gate-return'){w.pose(3900,true);w.action=t=>({right:t<4.5,left:t>=4.5,jump:t>.7&&t<1.0||t>2.4&&t<2.65||t>5.4&&t<5.7||t>7.2&&t<7.6});}
   if(name==='natural-boughs'){w.pose(1640,true);const low=w.s.platforms.findIndex(q=>q.kind==='nightmare-branch'&&q.tree===0&&q.side===-1);let stage=0,landed=0;w.action=t=>{if(stage===0&&w.s.player.ground===low){stage=1;landed=t;}if(stage===0)return{jump:true};if(stage===1&&t-landed<31/120)return{right:true};stage=2;return{jump:t-landed<1.3,right:w.s.player.x<1830};};}
  },name);
  const {data,stats}=await page.evaluate(seconds=>window.checkpointReview.record(seconds),seconds);fs.writeFileSync(folder+name+'.webm',Buffer.from(data,'base64'));fs.writeFileSync(folder+name+'.json',JSON.stringify(stats,null,2));await page.locator('#checkpoint-review').screenshot({path:folder+name+'.png'});
  expect(stats.minHearts).toBe(5);expect(stats.maxTeleport).toBeLessThan(10);if(name==='idle-start')expect(stats.playerX).toBe(90);if(name==='natural-boughs'){expect(stats.grounds).toEqual(expect.arrayContaining(createAdventure(6).platforms.flatMap((q,i)=>q.kind==='nightmare-branch'&&q.tree===0?[i]:[])));expect(stats.broken).toBeGreaterThan(0);}
 }
 expect(errors).toEqual([]);
});
