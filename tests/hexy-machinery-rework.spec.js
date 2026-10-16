import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {createAdventure,stepAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {fortBallistics,fortRig,fortSystems} from '../src/components/arcade/adventure/actors/bosses/adventureEmberFort';
import {bargeRig} from '../src/components/arcade/adventure/actors/bosses/bargeRig';
import {bargeHammerLift} from '../src/components/arcade/adventure/render/bargePercussionCanvas';
import {duelWindParticle} from '../src/components/arcade/adventure/render/duelCutinCanvas';
const dir='tests/artifacts/arcade/machinery-rework/';
const tick=(s,n)=>{for(let i=0;i<n;i++)stepAdventure(s,{},1/120);};
test('fixed guns always launch left from their visible muzzle and land on the announced floor',()=>{
 for(const gentle of [false,true])for(const port of ['upper','lower']){
  const s=createAdventure(5,gentle),m=fortRig(s)[port];
  for(const target of [s.level.arena.left,m.x-800,m.x-450,m.x-100,m.x+250]){
   const q=fortBallistics(s,port,target);expect(q.rotation).toBeGreaterThan(-.1);expect(q.rotation).toBeLessThan(1.05);expect(q.vx).toBeLessThan(0);
   expect(Math.atan2(-q.vy,-q.vx)).toBeCloseTo(q.rotation,3);
   expect(q.y+q.vy*q.flight+.5*q.gravity*q.flight*q.flight).toBeCloseTo(s.level.arena.y-28,5);
   expect(q.x).toBeCloseTo(m.x-Math.cos(q.rotation)*326/513*249.6+Math.sin(q.rotation)*44/513*249.6,5);
  }
 }
});
test('reinforcements originate at the large rear doorway and march out toward the fight',()=>{
 const s=createAdventure(5),a=s.level.arena;s.enemies=[];s.outposts=[];s.supplies=[];s.arenaLocked=true;
 Object.assign(s.player,{x:a.left+500,y:a.y,hurt:999,ground:0});Object.assign(s.boss,{engaged:true,phase:'recover',timer:0,turn:2,vulnerable:true});
 const door=fortRig(s).doorway;expect(fortRig(s).hatch.x).toBeGreaterThan(door.x);expect(fortRig(s).hatch.x).toBeLessThan(door.x+door.w);
 tick(s,162);const e=s.enemies.find(q=>q.fortCrew);expect(e).toBeTruthy();expect(e.hatchX).toBe(fortRig(s).hatch.x);expect(s.boss.hatchOpen).toBeGreaterThan(2);
 const start=e.x;tick(s,270);expect(e.x).toBeLessThan(start-320);expect(e.emerging).toBe(0);expect(e.phase).not.toBe('emerge');
});
test('the little crew stays above the bridge and the mechanical beat has a lift and a strike',()=>{
 const s=createAdventure(2),m=bargeRig(s);expect(m.pilot.y).toBeLessThan(s.level.arena.y-55);expect(m.drummer.y).toBeLessThan(s.level.arena.y-55);
 const b={move:'drumroll',phase:'attack',shotClock:.01,release:0};expect(bargeHammerLift(b)).toBeGreaterThan(.9);b.release=.25;expect(bargeHammerLift(b)).toBe(0);
 b.phase='recover';expect(bargeHammerLift(b)).toBe(.3);
});
test('portrait particles move behind the caster and reduced effects freeze their travel',()=>{
 for(let i=0;i<23;i++){
  const a=duelWindParticle(.3,i),b=duelWindParticle(.35,i);if(b.u>a.u)expect(b.x).toBeLessThan(a.x);
  expect(duelWindParticle(0,i,false,true)).toEqual(duelWindParticle(100,i,false,true));
 }
});
test('review moving machinery and open wind cut-ins with the actual renderer',async({page})=>{
 test.setTimeout(150000);fs.mkdirSync(dir,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
 await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/';
  const w=window.machineReview=Object.assign({},...await Promise.all(['engine/adventureModel.js','actors/bosses/adventureEmberFort.js','actors/bosses/harlequinUltimate.js','render/adventureCanvas.js','render/adventureCamera.js','world/adventureTerrain.js'].map(p=>import(root+p))));
  w.art=await w.loadAdventureArt();w.c=document.createElement('canvas');w.c.id='machine-review';w.c.style='position:fixed;inset:0;z-index:99999;width:1440px;height:810px';document.body.append(w.c);
  w.scene=(index,move)=>{const s=w.s=w.createAdventure(index),a=s.level.arena;for(const key of ['enemies','outposts','supplies','stars','cages','hazards'])s[key]=[];s.arenaLocked=true;s.noticeTime=0;
   Object.assign(s.player,{x:index===2?a.left+480:31300,y:a.y,hurt:999,ground:s.platforms.indexOf(w.groundAt(s.platforms,index===2?a.left+480:31300))});
   Object.assign(s.boss,{x:index===2?a.right-400:s.boss.x,engaged:true,phase:'warn',move,timer:1.1,targetX:s.player.x,vulnerable:true});
   for(let i=0;i<700;i++)w.followAdventureCamera(s,1/120);return s;
  };
  w.paint=()=>w.renderAdventure(w.c,w.s,w.art);
  w.advance=n=>{for(let i=0;i<n;i++)w.stepAdventure(w.s,{},1/120);w.paint();};
  w.record=async seconds=>{const chunks=[],stream=w.c.captureStream(30),rec=new MediaRecorder(stream,{mimeType:'video/webm'});const result=new Promise(resolve=>{rec.ondataavailable=e=>chunks.push(e.data);rec.onstop=()=>{const r=new FileReader();r.onload=()=>resolve(String(r.result).split(',')[1]);r.readAsDataURL(new Blob(chunks,{type:'video/webm'}));};});rec.start();
   let last,start,acc=0;await new Promise(resolve=>{const frame=now=>{start??=now;last??=now;acc+=Math.min(.05,(now-last)/1000);last=now;while(acc>=1/120){w.stepAdventure(w.s,{},1/120);acc-=1/120;}w.paint();if(now-start<seconds*1000)requestAnimationFrame(frame);else resolve();};requestAnimationFrame(frame);});rec.stop();const data=await result;stream.getTracks().forEach(t=>t.stop());return data;};
 });
 const shot=async name=>{await page.evaluate(()=>window.machineReview.paint());await page.locator('#machine-review').screenshot({path:dir+name+'.png'});};
 for(const [name,index,move,seconds] of [['barge-drum',2,'drumroll',4],['barge-water',2,'jet',4],['fort-salvo',5,'salvo',4]]){
  await page.evaluate(({index,move})=>window.machineReview.scene(index,move),{index,move});await shot(name+'-ready');
  const data=await page.evaluate(seconds=>window.machineReview.record(seconds),seconds);fs.writeFileSync(dir+name+'.webm',Buffer.from(data,'base64'));await shot(name+'-end');
 }
 await page.evaluate(()=>{const w=window.machineReview;w.scene(5,'salvo');w.s.boss.gunAngles={upper:.27,lower:.46};w.s.boss.gunBursts={upper:.045,lower:.12};});await shot('fort-blast');
 await page.evaluate(()=>{const w=window.machineReview;w.scene(5,'reinforce');w.s.boss.hatchOpen=4.8;w.advance(165);});await shot('fort-main-door');
 const data=await page.evaluate(()=>window.machineReview.record(3));fs.writeFileSync(dir+'fort-reinforcements.webm',Buffer.from(data,'base64'));
 for(const stage of [1,2,3]){await page.evaluate(stage=>{const w=window.machineReview,p=w.fortSystems(w.s);p.wall.hp=stage===1?18:0;w.s.boss.wallBreakAge=stage===2?.3:1;},stage);await shot('fort-wall-'+stage);}
 await page.evaluate(()=>{const w=window.machineReview,s=w.s=w.createAdventure(3);s.arenaLocked=true;s.stars=[];s.noticeTime=0;Object.assign(s.player,{x:1460,y:480,ground:2});Object.assign(s.boss,{x:2460,y:480,phase:'recover',timer:100,engaged:true,stage:3,hp:240,turn:3});for(let i=0;i<600;i++)w.followAdventureCamera(s,1/120);w.beginHarlequinUltimate(s);while(s.boss.ultimate.state==='leap')w.stepAdventure(s,{},1/120);w.stepAdventure(s,{super:true},1/120);w.advance(54);});await shot('duel-heroic-wind');
 const duel=await page.evaluate(()=>window.machineReview.record(4));fs.writeFileSync(dir+'duel-wind.webm',Buffer.from(duel,'base64'));await shot('duel-contact-wind');
 expect(errors).toEqual([]);
});
