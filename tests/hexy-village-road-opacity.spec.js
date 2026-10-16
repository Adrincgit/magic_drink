import {test,expect} from '@playwright/test';

test('country road, sloped ground and town transition never reveal the layer underneath',async({page})=>{
 await page.goto('/',{waitUntil:'domcontentloaded'});
 const results=await page.evaluate(async()=>{
  const {drawVillageRoad}=await import('/src/components/arcade/adventure/render/villageCanvas.js');
  const art={};await Promise.all(['country-road-v5','road-entry-v5','road-v3','berm-v5'].map(async key=>{const image=new Image();image.src='/arcade/maps/village/'+key+'.webp';await image.decode();art['village-'+key]=image;}));
  const canvas=document.createElement('canvas');canvas.width=960;canvas.height=600;const c=canvas.getContext('2d'),results=[];
  for(const x of [1800,6000,6400,6900,7100])for(const delta of [-40,0,40]){
   const q={x,y:250,yEnd:250+delta,w:960},samples=[];
   for(const color of ['#ff00ff','#00ffff']){
    c.fillStyle=color;c.fillRect(0,0,960,600);c.save();c.translate(-x,0);drawVillageRoad(c,q,art);c.restore();
    const pixels=c.getImageData(0,0,960,600).data,values=[];
    for(let px=2;px<958;px+=7)for(let offset=-75;offset<200;offset+=13){const py=Math.round(250+delta*px/960+offset),at=(py*960+px)*4;values.push(...pixels.slice(at,at+4));}samples.push(values);
   }
   results.push({x,delta,leaks:samples[0].filter((v,i)=>v!==samples[1][i]).length});
  }return results;
 });
 for(const r of results)expect(r.leaks,JSON.stringify(r)).toBe(0);
});
