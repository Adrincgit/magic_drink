import fs from 'node:fs';
import {chromium} from '@playwright/test';
const folder='tests/artifacts/arcade/options-rehearsal/',browser=await chromium.launch({channel:'chrome'});
try{
 const page=await browser.newPage();await page.setContent('<video muted></video>');
 for(const name of ['jump','glide','dash','guard','drink','super']){
  const result=await page.evaluate(async source=>{
   const video=document.querySelector('video');video.src=source;await new Promise(resolve=>video.onloadeddata=resolve);if(!Number.isFinite(video.duration))await new Promise(resolve=>{video.onseeked=resolve;video.currentTime=1e6;});
   const canvas=document.createElement('canvas'),w=400,h=Math.round(w*video.videoHeight/video.videoWidth);canvas.width=w*2;canvas.height=(h+23)*3;const c=canvas.getContext('2d'),frames=[];
   for(let i=0;i<6;i++){const time=.15+i*(video.duration-.35)/5;await new Promise(resolve=>{video.onseeked=resolve;video.currentTime=time;});const x=i%2*w,y=Math.floor(i/2)*(h+23);c.drawImage(video,x,y,w,h);c.fillStyle='#281d32';c.fillRect(x,y+h,w,23);c.fillStyle='#ffeaca';c.font='14px sans-serif';c.fillText(time.toFixed(2)+' s',x+10,y+h+16);if(i===2){const frame=document.createElement('canvas');frame.width=video.videoWidth;frame.height=video.videoHeight;frame.getContext('2d').drawImage(video,0,0);frames.push(frame.toDataURL('image/png').split(',')[1]);}}
   return{png:canvas.toDataURL('image/png').split(',')[1],frame:frames[0],duration:video.duration};
  },'data:video/webm;base64,'+fs.readFileSync(folder+'tutorial-'+name+'.webm').toString('base64'));
  fs.writeFileSync(folder+'tutorial-'+name+'-motion.png',Buffer.from(result.png,'base64'));fs.writeFileSync(folder+'tutorial-'+name+'-frame.png',Buffer.from(result.frame,'base64'));console.log(name,result.duration.toFixed(2)+'s');
 }
}finally{await browser.close();}
