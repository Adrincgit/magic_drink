import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {createAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {grandRingFloorView,grandRingFloorPlacement,grandRingFloorRow,RING_CONTACT_Y} from '../src/components/arcade/adventure/render/grandRingFloor';

const folder='tests/artifacts/arcade/inferno/perspective/';
const image={width:2172,height:724};

test('the dark room keeps the physical contact line low through zoom and airborne action, without changing the simulation',()=>{
 const s=createAdventure(3);s.player.x=1500;
 for(const zoom of [.28,.56,.82,1.08])for(const y of [480,280]){
  s.camera={x:1100,y:-80,zoom};s.player.y=y;
  const before=structuredClone(s.camera),view=grandRingFloorView(s,'dark'),q=grandRingFloorPlacement(view,image);
  expect(s.camera).toEqual(before);expect(view.player).toBe(s.player);expect(view.platforms).toBe(s.platforms);
  expect((s.level.arena.y-view.camera.y)*view.camera.zoom).toBeCloseTo(RING_CONTACT_Y);
  expect((y-view.camera.y)*view.camera.zoom).toBeCloseTo(RING_CONTACT_Y+(y-480)*view.camera.zoom);
  expect(q.y).toBeLessThan(0);expect(q.y+q.h).toBeGreaterThan(RING_CONTACT_Y);expect(q.w).toBeGreaterThan(960);
  expect(grandRingFloorView(s,'wood')).toBe(s);
 }
 s.player.x=-300;expect(grandRingFloorView(s,'dark')).toBe(s);
 expect(grandRingFloorView(createAdventure(0),'dark').ringPerspective).toBeUndefined();
});

test('painted floor at the fighters travels at world speed, while the rear rows retain perspective',()=>{
 const s=createAdventure(3);s.player.x=1500;
 for(const zoom of [.28,.56,1.08]){
  s.camera={x:1100,y:40,zoom};const view=grandRingFloorView(s,'dark'),q=grandRingFloorPlacement(view,image);
  const foot=grandRingFloorRow(view,image,q,RING_CONTACT_Y),rear=grandRingFloorRow(view,image,q,q.rearY+10);
  const moved={...view,camera:{...view.camera,x:view.camera.x+37}};
  const nextFoot=grandRingFloorRow(moved,image,q,RING_CONTACT_Y),nextRear=grandRingFloorRow(moved,image,q,q.rearY+10);
  expect(nextFoot.x-foot.x).toBeCloseTo(-37*view.camera.zoom);
  expect(Math.abs(nextRear.x-rear.x)).toBeLessThan(Math.abs(nextFoot.x-foot.x));
  for(let y=q.rearY;y<540;y+=3){const row=grandRingFloorRow(view,image,q,y);expect(row.sourceY).toBeGreaterThan(image.height*.8);expect(row.sourceY).toBeLessThan(image.height);expect(row.period).toBeGreaterThan(0);expect(row.alpha).toBeGreaterThanOrEqual(0);}
 }
});

test('review the painted floor while running, zooming, jumping and resolving an actual clash',async({page})=>{
 fs.mkdirSync(folder,{recursive:true});const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.setViewportSize({width:1280,height:720});await page.goto('/arcade');
 await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/';const [model,render,camera,ultimate,floor]=await Promise.all([import(root+'engine/adventureModel.js'),import(root+'render/adventureCanvas.js'),import(root+'render/adventureCamera.js'),import(root+'actors/bosses/harlequinUltimate.js'),import(root+'render/grandRingFloor.js')]);
  const art=await render.loadAdventureArt(),canvas=document.createElement('canvas');canvas.id='floor-review';canvas.style='position:fixed;inset:0;z-index:99999;width:1280px;height:720px';document.body.append(canvas);
  const w=window.floorReview={model,render,camera,ultimate,floor,art,canvas};
  w.fresh=(distance=930,stage=1)=>{
   const s=model.createAdventure(3);s.arenaLocked=true;s.supplies=[];s.stars=[];s.noticeTime=0;
   Object.assign(s.player,{x:1500,y:480,ground:2,hurt:0});Object.assign(s.boss,{x:1500+distance,y:480,phase:'recover',timer:100,engaged:true,vulnerable:true,stage,hp:stage===1?720:stage===2?420:240});
   for(let i=0;i<600;i++)camera.followAdventureCamera(s,1/120);w.s=s;return s;
  };
  w.tick=(n=1,input={})=>{for(let i=0;i<n;i++)model.stepAdventure(w.s,input,1/120);};
  w.paint=(circusFloor='dark')=>render.renderAdventure(canvas,w.s,art,{circusFloor});
  w.fresh();w.paint();
 });
 const canvas=page.locator('#floor-review');
 for(const [name,distance,stage]of [['far',930,1],['near',350,1],['burning',930,2],['inferno',930,3]]){
  await page.evaluate(([distance,stage])=>{const w=window.floorReview;w.fresh(distance,stage);w.paint();},[distance,stage]);
  await canvas.screenshot({path:folder+name+'.jpg'});
 }
 await page.evaluate(()=>{const w=window.floorReview;w.fresh();w.paint('wood');});await canvas.screenshot({path:folder+'wood-preserved.jpg'});

 const motion=await page.evaluate(async()=>{
  const w=window.floorReview;w.fresh();const stream=w.canvas.captureStream(30),recorder=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:3500000}),chunks=[];
  recorder.ondataavailable=event=>chunks.push(event.data);recorder.start();let minZoom=2,maxZoom=0,maxAir=0;
  await new Promise(resolve=>{
   const start=performance.now();let last=start,acc=0;
   const frame=now=>{
    const age=(now-start)/1000;acc+=Math.min(.05,(now-last)/1000);last=now;
    while(acc>=1/120){const keys=age<2.4?{right:w.s.player.x<w.s.boss.x-350}:age<4.8?{left:true}:{};if(age>=4.8&&age<5.2)keys.jump=true;w.tick(1,keys);acc-=1/120;}
    minZoom=Math.min(minZoom,w.s.camera.zoom);maxZoom=Math.max(maxZoom,w.s.camera.zoom);maxAir=Math.max(maxAir,480-w.s.player.y);w.paint();
    if(age<6.5)requestAnimationFrame(frame);else resolve();
   };requestAnimationFrame(frame);
  });
  const stopped=new Promise(resolve=>recorder.onstop=resolve);recorder.stop();await stopped;stream.getTracks().forEach(track=>track.stop());
  const bytes=new Uint8Array(await new Blob(chunks).arrayBuffer());let data='';for(let i=0;i<bytes.length;i+=8192)data+=String.fromCharCode(...bytes.subarray(i,i+8192));return{video:btoa(data),minZoom,maxZoom,maxAir};
 });
 fs.writeFileSync(folder+'running-and-zoom.webm',Buffer.from(motion.video,'base64'));expect(motion.maxZoom-motion.minZoom).toBeGreaterThan(.2);expect(motion.maxAir).toBeGreaterThan(100);

 await page.evaluate(()=>{
  const w=window.floorReview,s=w.fresh(1280,3);s.player.hurt=0;s.boss.ultimateCooldown=0;w.ultimate.beginHarlequinUltimate(s);
  for(let i=0;i<150&&s.boss.ultimate.state==='leap';i++)w.tick();w.tick(80);w.tick(1,{super:true});w.tick(160);w.paint();
 });
 expect(await page.evaluate(()=>window.floorReview.s.powerClash?.state)).toBe('contest');await canvas.screenshot({path:folder+'clash.jpg'});
 const flight=await page.evaluate(()=>{
  const w=window.floorReview;for(let i=0;i<2300&&w.s.powerClash?.state!=='flight';i++)w.tick();w.tick(45);w.paint();const s=w.floor.grandRingFloorView(w.s,'dark');
  return{state:s.powerClash?.state,feet:(480-s.camera.y)*s.camera.zoom,x:(s.player.x-s.camera.x)*s.camera.zoom};
 });
 expect(flight.state).toBe('flight');expect(flight.feet).toBeCloseTo(RING_CONTACT_Y);expect(flight.x).toBeGreaterThan(20);expect(flight.x).toBeLessThan(940);
 await canvas.screenshot({path:folder+'clash-flight.jpg'});expect(errors).toEqual([]);
});
