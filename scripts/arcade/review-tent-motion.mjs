import fs from 'node:fs';
import {chromium} from '@playwright/test';
const folder='tests/artifacts/arcade/tent-motion/',browser=await chromium.launch({channel:'chrome'});
try{
 const page=await browser.newPage();await page.setContent('<video muted></video>');
 for(const name of ['meadow-wind','meadow-juggler','camp-open','camp-juggler']){
  const result=await page.evaluate(async source=>{
   const video=document.querySelector('video');video.src=source;await new Promise(resolve=>video.onloadeddata=resolve);
   if(!Number.isFinite(video.duration))await new Promise(resolve=>{video.onseeked=resolve;video.currentTime=1e6;});
   const w=420,h=291,canvas=document.createElement('canvas');canvas.width=w*3;canvas.height=(h+23)*4;const c=canvas.getContext('2d'),frames=[];
   for(let i=0;i<12;i++){
    const t=.05+i*(video.duration-.16)/11;await new Promise(resolve=>{video.onseeked=resolve;video.currentTime=t;});const x=i%3*w,y=Math.floor(i/3)*(h+23);
    c.drawImage(video,260,150,830,575,x,y,w,h);c.fillStyle='#251d30';c.fillRect(x,y+h,w,23);c.fillStyle='#ffecd5';c.font='14px sans-serif';c.fillText(t.toFixed(2)+' s',x+10,y+h+16);
    if([2,5,8].includes(i)){const f=document.createElement('canvas');f.width=video.videoWidth;f.height=video.videoHeight;f.getContext('2d').drawImage(video,0,0);frames.push(f.toDataURL('image/png').split(',')[1]);}
   }
   return{png:canvas.toDataURL('image/png').split(',')[1],frames,duration:video.duration};
  },'data:video/webm;base64,'+fs.readFileSync(folder+name+'.webm').toString('base64'));
  fs.writeFileSync(folder+name+'-motion.png',Buffer.from(result.png,'base64'));for(const [i,f]of result.frames.entries())fs.writeFileSync(folder+name+'-frame-'+i+'.png',Buffer.from(f,'base64'));console.log(name,result.duration.toFixed(2)+'s');
 }
}finally{await browser.close();}
