import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import sharp from 'sharp';
import {createAdventure,stepAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {stepWorldEffects} from '../src/components/arcade/adventure/engine/adventureEffects';
import {bargeRig,bargeWaterHitbox} from '../src/components/arcade/adventure/actors/bosses/adventureBarge';
import {waterArcPlacement} from '../src/components/arcade/adventure/render/paintedWaterCanvas';
const folder='tests/artifacts/arcade/harbor-water/';

test('the painted wake encloses the foot inside its transparent opening in all four poses',async()=>{
 const img=await sharp('public/arcade/sprites/effects/pier-foam.webp').ensureAlpha().raw().toBuffer({resolveWithObject:true});
 for(let frame=0;frame<4;frame++){
  const p=waterArcPlacement(frame,400,500,100,62),x=frame*512+p.cx,y=p.cy;
  expect(img.data[(y*img.info.width+x)*4+3]).toBeLessThan(80);
  let below=0,left=0,right=0;
  for(let yy=y;yy<512;yy++)for(let xx=40;xx<472;xx++)if(img.data[(yy*img.info.width+frame*512+xx)*4+3]>180){below++;if(xx<p.cx-40)left++;if(xx>p.cx+40)right++;}
  expect(below).toBeGreaterThan(900);expect(left).toBeGreaterThan(100);expect(right).toBeGreaterThan(100);
  expect(p.x+p.cx/512*p.w).toBe(400);expect(p.y+p.cy/512*p.h).toBe(500);
 }
});

test('cannon and waves emit falling drops, river splashes and fading wet trails',()=>{
 const s=createAdventure(2);for(const k of ['enemies','outposts','supplies','hazards','stars','cages'])s[k]=[];
 const a=s.level.arena;Object.assign(s.player,{x:a.left+200,y:a.y,ground:s.platforms.findIndex(q=>q.x===a.left),hurt:100});
 Object.assign(s.boss,{phase:'warn',move:'jet',timer:.001,engaged:true,vulnerable:true});s.arenaLocked=true;
 for(let i=0;i<120;i++)stepAdventure(s,{},1/120);
 const jet=s.hostile.find(q=>q.kind==='barge-jet'),rig=bargeRig(s);
 expect(jet.x).toBeCloseTo(rig.jetMuzzle.x);expect(jet.y).toBeCloseTo(rig.jetMuzzle.y);expect(jet.angle).toBe(rig.nozzle.angle);
 const at={x:jet.x-400};const box=bargeWaterHitbox(jet,at);expect(box.y+jet.r).toBeCloseTo(jet.y-400*Math.tan(jet.angle));
 const drops=s.effects.filter(q=>q.waterDrop);expect(drops.length).toBeGreaterThan(2);
 const d=drops[0];s.effects=[d];for(let i=0;i<180&&d.waterDrop;i++)stepWorldEffects(s,1/120);
 expect(d.waterDrop).toBe(false);expect(d.waterDetail).toBe(1);expect(d.y).toBe(d.floor);
 s.effects=[];s.hostile=[{kind:'barge-wave',barge:true,x:a.left+600,y:a.y-25,floor:a.y,r:23,drawSize:96,vx:-280,vy:0,age:0,life:2}];s.boss.phase='recover';s.boss.timer=20;
 for(let i=0;i<30;i++)stepAdventure(s,{},1/120);
 expect(s.effects.some(q=>q.waterDetail===2)).toBe(true);expect(s.effects.some(q=>q.waterDrop)).toBe(true);
 s.hostile=[];for(let i=0;i<360;i++)stepWorldEffects(s,1/120);expect(s.effects).toHaveLength(0);
});

test('shore contact, centered wakes, charging and water trails render without stream seams',async({page})=>{
 fs.mkdirSync(folder,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/arcade');
 const report=await page.evaluate(async()=>{
  const [{createAdventure,stepAdventure},{loadAdventureArt,renderAdventure},{drawCannonWater},{groundY},{bargeRig}]=await Promise.all([import('/src/components/arcade/adventure/engine/adventureModel.js'),import('/src/components/arcade/adventure/render/adventureCanvas.js'),import('/src/components/arcade/adventure/render/bargeCanvas.js'),import('/src/components/arcade/adventure/world/adventureTerrain.js'),import('/src/components/arcade/adventure/actors/bosses/adventureBarge.js')]);
  const art=await loadAdventureArt(),canvas=document.createElement('canvas');canvas.id='water-review';canvas.style='position:fixed;inset:0;z-index:99999;width:1440px;height:810px';document.body.append(canvas);
  const s=createAdventure(2);s.noticeTime=0;s.player.hurt=0;
  const paint=(x,time=0)=>{const y=groundY(s.platforms,x);s.player.x=x;s.player.y=y;s.player.ground=s.platforms.findIndex(q=>q.kind==='earth'&&x>=q.x&&x<q.x+q.w);s.time=time;s.camera={x:Math.max(0,x-320),y:y-385,backdropY:y-385,zoom:1};renderAdventure(canvas,s,art);};
  window.waterQA={s,art,canvas,paint,stepAdventure,renderAdventure,bargeRig};paint(840);
  const probe=document.createElement('canvas');probe.width=960;probe.height=160;const c=probe.getContext('2d',{willReadFrequently:true});let gaps=0,frames=[];
  for(let frame=0;frame<5;frame++){
   c.clearRect(0,0,960,160);drawCannonWater(c,art,930,80,900,88,0,frame/16);const pixels=c.getImageData(0,0,960,160).data;let sum=0;
   for(let x=60;x<930;x++){let ink=0;for(let y=35;y<125;y++){const a=pixels[(y*960+x)*4+3];if(a>100)ink++;sum+=a;}if(!ink)gaps++;}frames.push(sum);
  }return{gaps,frames};
 });
 expect(report.gaps).toBe(0);expect(new Set(report.frames).size).toBe(5);
 await page.locator('#water-review').screenshot({path:folder+'shore-contact.jpg'});
 for(let frame=0;frame<4;frame++){await page.evaluate(frame=>window.waterQA.paint(3300,frame/9),frame);await page.locator('#water-review').screenshot({path:folder+`pier-${frame}.jpg`});}
 await page.evaluate(()=>{const w=window.waterQA,s=w.s;s.enemies=[];s.arenaLocked=true;Object.assign(s.boss,{phase:'warn',move:'jet',timer:1.1,engaged:true,vulnerable:true});w.paint(s.level.arena.right-800,1);});
 await page.locator('#water-review').screenshot({path:folder+'cannon-pump.jpg'});
 await page.evaluate(()=>{const w=window.waterQA;w.s.boss.timer=.001;w.s.player.hurt=100;for(let i=0;i<100;i++)w.stepAdventure(w.s,{},1/120);w.paint(w.s.level.arena.right-800,w.s.time);});
 await page.locator('#water-review').screenshot({path:folder+'cannon-stream.jpg'});
 await page.evaluate(()=>{const w=window.waterQA,s=w.s;s.effects=[];s.hostile=[];Object.assign(s.boss,{phase:'warn',move:'tidal',timer:.001});for(let i=0;i<130;i++)w.stepAdventure(s,{},1/120);w.paint(s.level.arena.right-800,s.time);});
 await page.locator('#water-review').screenshot({path:folder+'wet-waves.jpg'});
 expect(errors).toEqual([]);
});
