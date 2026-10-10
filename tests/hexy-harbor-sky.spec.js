import {test,expect} from '@playwright/test';
import fs from 'node:fs';
const folder='tests/artifacts/arcade/harbor-sky/';

test('the original painted sky is preserved throughout the route without drifting overlays',async({page})=>{
 fs.mkdirSync(folder,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/arcade',{waitUntil:'domcontentloaded'});
 const report=await page.evaluate(async()=>{
  const [{createAdventure},{loadAdventureArt},{drawHarborBackdrop,harborPanoramaPlacement}]=await Promise.all([import('/src/components/arcade/adventure/engine/adventureModel.js'),import('/src/components/arcade/adventure/render/adventureCanvas.js'),import('/src/components/arcade/adventure/render/adventureHarborCanvas.js')]);
  const s=createAdventure(2),art=await loadAdventureArt(),canvas=document.createElement('canvas'),reference=document.createElement('canvas');
  for(const el of [canvas,reference]){el.width=960;el.height=540;}
  const c=canvas.getContext('2d',{willReadFrequently:true}),r=reference.getContext('2d',{willReadFrequently:true}),checks=[];
  s.camera={x:0,y:75,backdropY:75,zoom:1};
  for(const x of [0,7160,15660]){
   s.camera.x=x;const img=art['harbor-distant'],p=harborPanoramaPlacement(s,img);r.clearRect(0,0,960,540);r.drawImage(img,p.x,p.y,p.w,p.h);const original=r.getImageData(0,0,960,120).data;
   for(const reduced of [false,true])for(const time of [0,300]){
    s.time=time;c.clearRect(0,0,960,540);drawHarborBackdrop(c,s,art,reduced);const current=c.getImageData(0,0,960,120).data;let maxDelta=0;
    for(let i=0;i<original.length;i++)maxDelta=Math.max(maxDelta,Math.abs(original[i]-current[i]));
    const full=c.getImageData(0,0,960,540).data;let holes=0;for(let i=3;i<full.length;i+=4)if(full[i]!==255)holes++;
    checks.push({x,time,reduced,maxDelta,holes});
   }
  }
  return checks;
 });
 fs.writeFileSync(folder+'original-sky-check.json',JSON.stringify(report,null,2));
 // Allow one RGB level from near-transparent pixels in the existing fair plate.
 for(const check of report){expect(check.maxDelta,JSON.stringify(check)).toBeLessThanOrEqual(1);expect(check.holes,JSON.stringify(check)).toBe(0);}
 expect(errors).toEqual([]);
});
