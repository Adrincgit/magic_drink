import fs from 'node:fs';
import {chromium} from '@playwright/test';
const folder=process.argv[2]||'tests/artifacts/arcade/forest-progression';
const name=process.argv[3]||'forest-progression-motion';
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const page=await browser.newPage();
 await page.setContent('<video muted></video>');
 const result=await page.evaluate(async source=>{
  const video=document.querySelector('video');video.src=source;
  await new Promise(resolve=>video.onloadeddata=resolve);
  if(!Number.isFinite(video.duration))await new Promise(resolve=>{video.onseeked=resolve;video.currentTime=1e6;});
  const times=Array.from({length:16},(_,i)=>.5+i*(video.duration-1)/15);
  const sheet=document.createElement('canvas');sheet.width=1600;sheet.height=992;const c=sheet.getContext('2d');
  for(const [i,time]of times.entries()){
   await new Promise(resolve=>{video.onseeked=resolve;video.currentTime=time;});
   const x=i%4*400,y=Math.floor(i/4)*248;c.drawImage(video,x,y,400,225);c.fillStyle='#15151a';c.fillRect(x,y+225,400,23);c.fillStyle='white';c.font='14px sans-serif';c.fillText(time.toFixed(1)+' s',x+10,y+242);
  }
  return{image:sheet.toDataURL('image/jpeg',.9).split(',')[1],width:video.videoWidth,height:video.videoHeight,duration:video.duration};
 },'data:video/webm;base64,'+fs.readFileSync(folder+'/'+name+'.webm').toString('base64'));
 fs.writeFileSync(folder+'/motion-review.jpg',Buffer.from(result.image,'base64'));delete result.image;console.log(result);
}finally{await browser.close();}
