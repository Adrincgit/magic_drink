import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import sharp from 'sharp';
import {createHash} from 'node:crypto';
import {clashImpactTiming} from '../src/components/arcade/adventure/render/clashImpactCanvas';

test('manga contact is brief, never repeats during pressure pulses, and respects reduced effects',()=>{
 for(const state of ['windup','travel','resolve','flight','land'])expect(clashImpactTiming({state,age:.02,pressure:.5}).manga).toBe(0);
 expect(clashImpactTiming({state:'contest',age:.02,pressure:.5}).manga).toBe(1);
 for(const age of [.106,.2,.8,1,4,10,19])expect(clashImpactTiming({state:'contest',age,pressure:.1,flashPulse:1}).manga).toBe(0);
 for(const age of [0,.02,.1,.3,1]){
  const reduced=clashImpactTiming({state:'contest',age,pressure:.1},true);
  expect(reduced.manga).toBe(0);expect(reduced.burst).toBe(0);expect(reduced.shock).toBe(0);
 }
 expect(clashImpactTiming({state:'flight',age:.6,pressure:0}).heat).toBe(0);
});

test('new portraits, surrounds and contact sphere have unique transparent animation cels',async()=>{
 for(const [path,cols,rows,w,h]of [
  ['bosses/harlequin/clash-smile-cast',3,1,384,448],
  ['effects/painted-duel/cutin-surrounds',2,4,512,384],
  ['effects/painted-duel/contact-shock',4,3,384,384]
 ]){
  const sheet=sharp('public/arcade/sprites/'+path+'.webp'),meta=await sheet.metadata(),hashes=new Set();
  expect([meta.width,meta.height,meta.hasAlpha]).toEqual([cols*w,rows*h,true]);
  for(let i=0;i<cols*rows;i++){
   const data=await sheet.clone().extract({left:i%cols*w,top:Math.floor(i/cols)*h,width:w,height:h}).ensureAlpha().raw().toBuffer();
   hashes.add(createHash('sha256').update(data).digest('hex'));
   let alpha=0;for(let k=3;k<data.length;k+=4)alpha+=data[k];expect(alpha).toBeGreaterThan(500000);
   for(const [x,y]of [[0,0],[w-1,0],[0,h-1],[w-1,h-1]])expect(data[(y*w+x)*4+3]).toBe(0);
  }
  expect(hashes.size).toBe(cols*rows);
 }
});

test('actual contact turns to ink then colour, preserves heroic windup, and does not mutate the fight',async({page})=>{
 const folder='tests/artifacts/arcade/duel-anime/';fs.mkdirSync(folder,{recursive:true});
 await page.setViewportSize({width:1440,height:810});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/arcade');
 const result=await page.evaluate(async()=>{
  const base='/src/components/arcade/adventure/';
  const w=window.animeReview=Object.assign({},...await Promise.all(['engine/adventureModel.js','render/adventureCanvas.js','render/adventureCamera.js','actors/bosses/harlequinUltimate.js'].map(p=>import(base+p))));
  w.art=await w.loadAdventureArt();const canvas=w.canvas=document.createElement('canvas');canvas.id='anime-review';canvas.style='position:fixed;inset:0;z-index:99999;width:1440px;height:810px';document.body.append(canvas);
  const s=w.s=w.createAdventure(3);s.arenaLocked=true;s.stars=[];s.noticeTime=0;
  Object.assign(s.player,{x:1460,y:480,ground:2});Object.assign(s.boss,{x:2460,y:480,phase:'recover',timer:100,engaged:true,stage:3,hp:240,turn:3});
  for(let i=0;i<600;i++)w.followAdventureCamera(s,1/120);w.beginHarlequinUltimate(s);while(s.boss.ultimate.state==='leap')w.stepAdventure(s,{},1/120);
  w.stepAdventure(s,{super:true},1/120);for(let i=0;i<54;i++)w.stepAdventure(s,{},1/120);
  const c=canvas.getContext('2d'),original=c.drawImage.bind(c);let heroic=0;
  c.drawImage=(img,...args)=>{if(img===w.art['hexy-encore-portrait'])heroic++;return original(img,...args);};
  w.renderAdventure(canvas,s,w.art);c.drawImage=original;
  w.heroic=canvas.toDataURL('image/png');
  while(['windup','travel'].includes(s.powerClash.state))w.stepAdventure(s,{},1/120);
  w.before={hp:s.boss.hp,stage:s.boss.stage,pressure:s.powerClash.pressure};
  w.paint=(age,reduced=false)=>{
   Object.assign(s.powerClash,{state:'contest',age,contestAge:age,pressure:.5,portraitPressure:.5});s.fxTime=2+age;
   w.renderAdventure(canvas,s,w.art,{reduced});
   const data=c.getImageData(30,30,canvas.width-60,canvas.height-60).data;let grey=0;
   for(let i=0;i<data.length;i+=4)if(Math.max(data[i],data[i+1],data[i+2])-Math.min(data[i],data[i+1],data[i+2])<7)grey++;
   return grey/(data.length/4);
  };
  return{heroic};
 });
 expect(result.heroic).toBe(1);
 fs.writeFileSync(folder+'heroic-charge.png',Buffer.from(await page.evaluate(()=>window.animeReview.heroic.split(',')[1]),'base64'));
 const values=[];
 for(const age of [.02,.12,.25,.45,.7,1.1]){
  values.push(await page.evaluate(age=>window.animeReview.paint(age),age));
  await page.locator('#anime-review').screenshot({path:folder+'contact-'+age.toFixed(2)+'.png'});
 }
 expect(values[0]).toBeGreaterThan(.97);expect(values[1]).toBeLessThan(.3);
 const state=await page.evaluate(()=>{const w=window.animeReview;return{hp:w.s.boss.hp,stage:w.s.boss.stage};});
 expect(state).toEqual({hp:240,stage:3});expect(errors).toEqual([]);
});
