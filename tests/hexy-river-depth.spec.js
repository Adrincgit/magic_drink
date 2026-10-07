import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import sharp from 'sharp';
import {createHash} from 'node:crypto';
import {createAdventure,stepAdventure,retryAdventure,playerBody} from '../src/components/arcade/adventure/engine/adventureModel';
import {groundY,surfaceY} from '../src/components/arcade/adventure/world/adventureTerrain';
import {riverRouteX} from '../src/components/arcade/adventure/world/adventureRiverRoute';
import {riverPlanePlacement,RIVER_PLANES,riverWoodlandPlacement} from '../src/components/arcade/adventure/world/adventureRiverDepth';
import {organMechanism} from '../src/components/arcade/adventure/actors/bosses/organMechanism';
import {prepareOrganCharge} from '../src/components/arcade/adventure/actors/bosses/organCharge';
import {riverBridgeSegments,riverFlow} from '../src/components/arcade/adventure/render/adventureRiverCanvas';

const artifacts='tests/artifacts/arcade/river-depth/';
function quiet(){const s=createAdventure(1);for(const k of ['enemies','outposts','supplies','pickups','hazards','stars','cages'])s[k]=[];return s;}

test('both river crossings are twice as long, preserve continuous ground and extend the journey past chapter one',()=>{
 const s=quiet(),bridges=s.platforms.filter(q=>q.bridge);expect(bridges.map(q=>q.w)).toEqual([1480,1380]);expect(s.level.width).toBe(13430);expect(s.level.width).toBeGreaterThan(createAdventure().level.width);
 let x=0,y=480;for(const q of s.platforms){expect(q.x).toBe(x);expect(q.y).toBe(y);x=q.x+q.w;y=surfaceY(q,x);}expect(x).toBe(s.level.width);
 for(const q of bridges){
  Object.assign(s.player,{x:q.x-20,y:q.y,ground:s.platforms.indexOf(q)-1,vx:0});
  for(let i=0;i<850&&s.player.x<q.x+q.w+20;i++){stepAdventure(s,{right:true},1/120);expect(s.player.ground).not.toBeNull();expect(s.player.y).toBeCloseTo(groundY(s.platforms,s.player.x),3);}
  expect(s.player.x).toBeGreaterThan(q.x+q.w);expect(s.hearts).toBe(s.maxHearts);
  const pieces=riverBridgeSegments(q,{width:2172,height:724});expect(pieces.every(p=>p.h===240)).toBe(true);expect(pieces.at(-1).x+pieces.at(-1).w).toBeCloseTo(q.x+q.w+27);
 }
 expect(s.level.arena.right-s.level.arena.left).toBe(1600);
});

test('landmarks after the crossings move downstream without floating or changing the three-bunny rescue',()=>{
 const s=createAdventure(1);expect(s.level.checkpoints.map(q=>q[0])).toEqual([5260,11530]);expect(s.level.sections.at(-1).x).toBe(s.level.arena.left);
 expect(s.cages).toHaveLength(3);expect(s.enemies.filter(e=>e.type===7).map(e=>e.home)).toEqual([3420,riverRouteX(7140)]);expect(s.enemies.filter(e=>e.captive)).toHaveLength(1);
 for(const q of [...s.level.scenery,...s.level.outposts])expect(q.y).toBe(groundY(s.platforms,q.x));
 for(const [x,y]of s.level.checkpoints)expect(y).toBe(groundY(s.platforms,x));
});

test('both bosses gain another fifteen percent of health in both modes and preserve it after retry',()=>{
 for(const gentle of [false,true])for(const index of [0,1]){
  const s=createAdventure(index,gentle),previous=((gentle?92:140)+index*(gentle?18:24))*(index===0?1.15:1)*1.44;
  expect(s.boss.maxHp).toBe(Math.round(previous*1.15*100)/100);s.boss.hp=1;retryAdventure(s);expect(s.boss.hp).toBe(s.boss.maxHp);
 }
 expect(createAdventure(2).boss.maxHp).toBe(188);
});

test('distant planes move at distinct speeds; bridge water remains anchored when the camera moves',()=>{
 const s=quiet(),img={width:2172,height:724};s.camera={x:3400,y:200,zoom:1};const first=RIVER_PLANES.map(p=>riverPlanePlacement(s,img,p)),trees=riverWoodlandPlacement(s,img,s.level.woodland[0]),flow=riverFlow(s,s.level.rivers[0]);
 s.camera.x+=200;const after=RIVER_PLANES.map(p=>riverPlanePlacement(s,img,p));expect(first[0].x-after[0].x).toBeCloseTo(9);expect(first[1].x-after[1].x).toBeCloseTo(29);
 expect(trees.x-riverWoodlandPlacement(s,img,s.level.woodland[0]).x).toBeCloseTo(200*s.level.woodland[0].depth);expect(riverFlow(s,s.level.rivers[0])).toEqual(flow);
 s.time+=1;const moving=riverFlow(s,s.level.rivers[0]);expect(moving.far).toBe(flow.far);expect(moving.near).toBeLessThan(flow.near);
 for(const x of [0,s.level.width-960]){s.camera.x=x;for(const plane of RIVER_PLANES){const p=riverPlanePlacement(s,img,plane);expect(p.x).toBeLessThanOrEqual(0);expect(p.x+p.w).toBeGreaterThanOrEqual(960);}}
});

test('the braking machine releases a dust burst, settles its body and remains vulnerable',()=>{
 const s=quiet(),a=s.level.arena,b=s.boss;Object.assign(s.player,{x:a.left+24,y:a.y,ground:s.platforms.length-1});Object.assign(b,{phase:'recover',timer:30,move:'organ-charge',engaged:true,vulnerable:true,transformed:true});s.arenaLocked=true;prepareOrganCharge(s);
 for(let i=0;i<800&&b.phase!=='recover';i++)stepAdventure(s,{},1/120);expect(s.events).toContain('organBrake');expect(b.vulnerable).toBe(true);expect(s.organDust.filter(q=>q.age<.02).length).toBeGreaterThanOrEqual(6);
 for(let i=0;i<12;i++)stepAdventure(s,{},1/120);const settle=organMechanism(s);expect(settle.drive.sx).toBeLessThan(1);expect(settle.drive.sy).toBeGreaterThan(1);expect(organMechanism(s,true).drive.sy).toBe(1);
 for(let i=0;i<24;i++)stepAdventure(s,{},1/120);expect(organMechanism(s).drive.sx).toBe(1);expect(b.vulnerable).toBe(true);
});

test('new native panorama cutouts and four foreground drawings preserve alpha and distinct art',async()=>{
 for(const name of ['mountains','valley','near']){const metadata=await sharp('public/arcade/maps/riverwoods/'+name+'.webp').metadata();expect(metadata.hasAlpha).toBe(true);expect(metadata.width).toBeGreaterThanOrEqual(2048);}
 const hashes=[];for(let i=0;i<4;i++){const frame=await sharp('public/arcade/maps/riverwoods/near.webp').extract({left:i*512,top:0,width:512,height:512}).raw().toBuffer();hashes.push(createHash('sha256').update(frame).digest('hex'));}expect(new Set(hashes).size).toBe(4);
});

test('live scenery has moving clouds, falling water, independent currents and stable reduced motion',async({page})=>{
 fs.mkdirSync(artifacts,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/arcade');
 const report=await page.evaluate(async()=>{
  const [{createAdventure},{loadAdventureArt,renderAdventure},{groundY},{drawRiverBackdrop,drawRiverWater},{riverWaterfallPlacement}]=await Promise.all([import('/src/components/arcade/adventure/engine/adventureModel.js'),import('/src/components/arcade/adventure/render/adventureCanvas.js'),import('/src/components/arcade/adventure/world/adventureTerrain.js'),import('/src/components/arcade/adventure/render/adventureRiverCanvas.js'),import('/src/components/arcade/adventure/world/adventureRiverDepth.js')]);
  const art=await loadAdventureArt(),s=createAdventure(1);for(const k of ['enemies','outposts','supplies','pickups','hazards','stars','cages'])s[k]=[];
  const c=document.createElement('canvas');c.id='river-depth';c.style='position:fixed;inset:0;z-index:99999;width:1440px;height:810px';document.body.append(c);
  const at=(x,time=0)=>{const y=groundY(s.platforms,x);s.player.x=x;s.player.y=y;s.player.ground=s.platforms.findIndex(q=>x>=q.x&&x<q.x+q.w);s.camera={x:x-420,y:y-410,zoom:1};s.time=time;renderAdventure(c,s,art);};
  window.riverDepth={art,s,c,at};
  const probe=document.createElement('canvas');probe.width=960;probe.height=540;const ctx=probe.getContext('2d');s.camera={x:3400,y:200,zoom:1};
  const delta=(a,b)=>{let n=0;for(let i=0;i<a.length;i+=4)if(Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2])>6)n++;return n;};
  const backdrop=(t,reduced)=>{s.time=t;ctx.clearRect(0,0,960,540);drawRiverBackdrop(ctx,s,art,reduced);return ctx.getImageData(0,0,960,540).data;};
  const sky0=backdrop(0,false),sky1=backdrop(2.3,false),still0=backdrop(0,true),still1=backdrop(2.3,true);
  const waterfall=riverWaterfallPlacement(s,art.world1);const fall=(t)=>{s.time=t;ctx.clearRect(0,0,960,540);drawRiverBackdrop(ctx,s,art);return ctx.getImageData(Math.floor(waterfall.x),Math.floor(waterfall.y),Math.ceil(waterfall.w),Math.ceil(waterfall.h)).data;};
  const falling=delta(fall(0),fall(.17));
  const water=(t,reduced)=>{s.time=t;ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,960,540);ctx.translate(-s.level.rivers[0].x,-s.level.rivers[0].y+75);drawRiverWater(ctx,s,art,reduced);ctx.setTransform(1,0,0,1,0,0);return ctx.getImageData(0,0,960,340).data;};
  const movingWater=delta(water(0,false),water(1.3,false)),stillWater=delta(water(0,true),water(1.3,true));
  return{movingSky:delta(sky0,sky1),stillSky:delta(still0,still1),falling,movingWater,stillWater};
 });
 expect(report.movingSky).toBeGreaterThan(3000);expect(report.stillSky).toBe(0);expect(report.falling).toBeGreaterThan(40);expect(report.movingWater).toBeGreaterThan(20000);expect(report.stillWater).toBe(0);
 fs.writeFileSync(artifacts+'motion.json',JSON.stringify(report,null,2));
 for(const [name,x,time]of [['first-bridge-entry',3820,0],['first-bridge-long-span',4350,3],['first-bridge-exit',5080,6],['second-crossing',8750,8],['varied-near-bank',10250,12]]){
  await page.evaluate(({x,time})=>window.riverDepth.at(x,time),{x,time});await page.locator('#river-depth').screenshot({path:artifacts+name+'.jpg'});
 }
 expect(errors).toEqual([]);
});
