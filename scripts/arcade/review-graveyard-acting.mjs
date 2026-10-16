import fs from 'node:fs';
import {chromium} from '@playwright/test';
const root='tests/artifacts/arcade/graveyard-revision/',browser=await chromium.launch({channel:'chrome'});
try{
 const page=await browser.newPage();await page.setContent('<video muted></video>');
 for(const[name,times,crop]of [['fear',[4.53,4.96,5.34,5.76,12.55,12.97,13.33,13.7],[355,475,185,200]],['skeleton',[.05,.28,.51,.74,1.3,1.8,2.3,3.1],[475,435,440,270]]]){
  const png=await page.evaluate(async({source,times,crop})=>{
   const v=document.querySelector('video');v.src=source;await new Promise(r=>v.onloadeddata=r);if(!Number.isFinite(v.duration))await new Promise(r=>{v.onseeked=r;v.currentTime=1e6;});
   const c=document.createElement('canvas'),w=300,h=Math.round(w*crop[3]/crop[2]);c.width=w*4;c.height=(h+22)*2;const ctx=c.getContext('2d');
   for(const[i,t]of times.entries()){await new Promise(r=>{v.onseeked=r;v.currentTime=t;});const x=i%4*w,y=Math.floor(i/4)*(h+22);ctx.drawImage(v,...crop,x,y,w,h);ctx.fillStyle='#282331';ctx.fillRect(x,y+h,w,22);ctx.fillStyle='#fff3d8';ctx.font='14px sans-serif';ctx.fillText(t.toFixed(2)+' s',x+8,y+h+16);}
   return c.toDataURL('image/png').split(',')[1];
  },{source:'data:video/webm;base64,'+fs.readFileSync(root+name+'.webm').toString('base64'),times,crop});
  fs.writeFileSync(root+name+'-acting.png',Buffer.from(png,'base64'));console.log('Decoded '+name+' acting.');
 }
}finally{await browser.close();}
