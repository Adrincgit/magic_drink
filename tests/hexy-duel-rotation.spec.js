import {test,expect} from '@playwright/test';
import sharp from 'sharp';
import {createHash} from 'node:crypto';
import {DUEL_BEAM_FRAMES,duelBeamPhase} from '../src/components/arcade/adventure/render/duelBeamFrames';

test('the full beam cycle visits twelve distinct drawings and wraps continuously',async()=>{
 for(const path of ['effects/super-beam-rotation','bosses/harlequin/ultimate-beam-rotation']){
  const art=sharp('public/arcade/sprites/'+path+'.webp'),meta=await art.metadata(),hashes=new Set();
  expect([meta.width,meta.height,meta.hasAlpha]).toEqual([1024,256*DUEL_BEAM_FRAMES,true]);
  for(let frame=0;frame<DUEL_BEAM_FRAMES;frame++){
   const pixels=await art.clone().extract({left:0,top:frame*256,width:1024,height:256}).raw().toBuffer();
   hashes.add(createHash('sha256').update(pixels).digest('hex'));
   let visible=0;for(let k=3;k<pixels.length;k+=4)if(pixels[k]>120)visible++;
   expect(visible).toBeGreaterThan(15000);expect(visible).toBeLessThan(200000);
   for(const [x,y]of [[0,0],[1023,0],[0,255],[1023,255]])expect(pixels[(y*1024+x)*4+3]).toBe(0);
   expect(Math.floor(duelBeamPhase((frame+.01)/24))).toBe(frame);
  }
  expect(hashes.size).toBe(12);
 }
 expect(duelBeamPhase(.5)).toBe(0);expect(duelBeamPhase(.499)).toBeGreaterThan(11.9);
 expect(duelBeamPhase(99,true)).toBe(duelBeamPhase(0,true));
});

test('every grin cell contains a separate transparent drawing, also in the actor atlas',async()=>{
 for(const [name,w,h,cols,count]of [['clash-smile-cast',384,448,3,3],['super-smile-cast',512,512,4,3],['clash-charge',384,448,3,6],['super-charge',512,512,4,6]]){
  const sheet=sharp('public/arcade/sprites/bosses/harlequin/'+name+'.webp'),hashes=new Set();
  for(let i=0;i<count;i++){
   const bytes=await sheet.clone().extract({left:i%cols*w,top:Math.floor(i/cols)*h,width:w,height:h}).raw().toBuffer();
   hashes.add(createHash('sha256').update(bytes).digest('hex'));
   let pixels=0;for(let k=3;k<bytes.length;k+=4)if(bytes[k]>120)pixels++;
   expect(pixels).toBeGreaterThan(w*h*.1);expect(pixels).toBeLessThan(w*h*.7);
   for(const [x,y]of [[0,0],[w-1,0],[0,h-1],[w-1,h-1]])expect(bytes[(y*w+x)*4+3]).toBe(0);
  }
  expect(hashes.size).toBe(count);
 }
});

test('the smile correction preserves every original visible pixel outside the middle mouth',async()=>{
 const original=await sharp('context/arcade/grand-harlequin/cast-smile-sources/original-smile-row.png').ensureAlpha().raw().toBuffer();
 const corrected=await sharp('public/arcade/sprites/bosses/harlequin/clash-smile-cast.webp').ensureAlpha().raw().toBuffer();
 let changes=0,outside=0;
 for(let y=0;y<448;y++)for(let x=0;x<1152;x++){
  const k=(y*1152+x)*4;if(!original[k+3])continue;
  const changed=[0,1,2,3].some(c=>original[k+c]!==corrected[k+c]);if(!changed)continue;
  changes++;if(x<530||x>=564||y<174||y>=204)outside++;
 }
 expect(changes).toBeGreaterThan(200);expect(outside).toBe(0);
});

test('answering the ultimate draws Hexy absorption and hides enemy health and phase labels',async({page})=>{
 await page.goto('/arcade');
 const result=await page.evaluate(async()=>{
  const {createAdventure}=await import('/src/components/arcade/adventure/engine/adventureModel.js');
  const {loadAdventureArt,renderAdventure}=await import('/src/components/arcade/adventure/render/adventureCanvas.js');
  const {drawPowerWorld}=await import('/src/components/arcade/adventure/render/powerClashCanvas.js');
  const {harlequinDrawing}=await import('/src/components/arcade/adventure/actors/bosses/adventureHarlequin.js');
  const art=await loadAdventureArt(),s=createAdventure(3),canvas=document.createElement('canvas');
  canvas.width=960;canvas.height=540;canvas.style='width:960px;height:540px';document.body.append(canvas);
  const c=canvas.getContext('2d'),image=c.drawImage.bind(c),text=c.fillText.bind(c);let stars=0,bars=0;const labels=[];
  c.drawImage=(img,...args)=>{if(img===art['duel-heads']&&args[1]<448)stars++;if(img===art['duel-meter'])bars++;return image(img,...args);};
  c.fillText=(label,...args)=>{labels.push(label);return text(label,...args);};
  Object.assign(s.boss,{x:2300,y:480,dir:-1,engaged:true,stage:3,phase:'ultimate-charge',ultimate:{state:'charge',age:1.2}});
  Object.assign(s.player,{x:1450,y:480,dir:1,ground:2,charge:.55});
  s.arenaLocked=true;s.camera={x:1200,y:0,zoom:1};s.fxTime=2;s.superCinematic={age:.55,dir:1,origin:{x:1450,y:440}};
  s.powerClash={state:'windup',age:.55,sparks:[],pressure:.5};
  drawPowerWorld(c,s,art,false);const absorption=stars;stars=0;renderAdventure(canvas,s,art);
  return{absorption,bars,labels,pose:harlequinDrawing(s).key};
 });
 expect(result.absorption).toBeGreaterThan(5);expect(result.bars).toBe(0);
 expect(result.labels.some(label=>/FASE|PHASE/.test(label))).toBe(false);
 expect(result.pose).toBe('harlequin-super-charge');
});

test('incoming fire stays outside the face area at every intensity and on either side',async({page})=>{
 await page.goto('/arcade');
 const result=await page.evaluate(async()=>{
  const {loadAdventureArt}=await import('/src/components/arcade/adventure/render/adventureCanvas.js');
  const {drawPortraitPressure}=await import('/src/components/arcade/adventure/render/clashPortraitPressure.js');
  const art=await loadAdventureArt(),canvas=new OffscreenCanvas(384,276),c=canvas.getContext('2d');
  let obscured=0,edge=0,changed=0,previous;
  for(const boss of [false,true])for(const spill of [.2,.6,1])for(let i=0;i<12;i++){
   c.clearRect(0,0,384,276);drawPortraitPressure(c,art,boss,spill,i/24,384,276);
   const data=c.getImageData(0,0,384,276).data;
   for(let y=34;y<240;y++)for(let x=34;x<350;x++)obscured+=data[(y*384+x)*4+3];
   for(let k=3;k<data.length;k+=4){edge+=data[k];if(previous&&data[k]!==previous[k])changed++;}
   previous=data;
  }
  return{obscured,edge,changed};
 });
 expect(result.obscured).toBe(0);expect(result.edge).toBeGreaterThan(100000);expect(result.changed).toBeGreaterThan(1000);
});
