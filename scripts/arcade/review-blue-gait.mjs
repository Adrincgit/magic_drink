import fs from 'node:fs';
import {chromium} from '@playwright/test';
const folder='tests/artifacts/arcade/blue-gait/',browser=await chromium.launch({channel:'chrome'});
try{
 const page=await browser.newPage();await page.setContent('<video muted></video>');
 for(const name of ['run-left','run-right','agile-left','fast-right']){
  const trace=JSON.parse(fs.readFileSync(folder+name+'-trace.json'));
  const cycle=name.startsWith('run'),samples=cycle?Array.from({length:8},(_,i)=>{const first=trace.findIndex(q=>q.key==='acrobat-run-fluid'&&q.frame===i);let last=first;while(last+1<trace.length&&trace[last+1].frame===i)last++;return trace[Math.round((first+last)/2)];}):Array.from({length:12},(_,i)=>trace[Math.min(trace.length-1,Math.round(i*(trace.length-1)/11))]);
  const result=await page.evaluate(async({source,samples,cycle})=>{
   const video=document.querySelector('video');video.src=source;await new Promise(resolve=>video.onloadeddata=resolve);
   if(!Number.isFinite(video.duration))await new Promise(resolve=>{video.onseeked=resolve;video.currentTime=1e6;});
   const w=cycle?280:400,h=cycle?230:213,cols=cycle?4:3,canvas=document.createElement('canvas');canvas.width=w*cols;canvas.height=(h+23)*Math.ceil(samples.length/cols);const c=canvas.getContext('2d');
   for(const [i,q]of samples.entries()){
    const time=Math.max(.04,Math.min(video.duration-.06,q.time));await new Promise(resolve=>{video.onseeked=resolve;video.currentTime=time;});
    const crop=cycle?[(q.x-2140)*1.5-140,485,280,230]:[300,340,800,425],x=i%cols*w,y=Math.floor(i/cols)*(h+23);
    c.drawImage(video,...crop,x,y,w,h);c.fillStyle='#1c2633';c.fillRect(x,y+h,w,23);c.fillStyle='#fff2cd';c.font='14px sans-serif';c.fillText((cycle?'cel '+q.frame+' | ':'')+time.toFixed(2)+' s',x+10,y+h+16);
   }
   return{png:canvas.toDataURL('image/png').split(',')[1],duration:video.duration};
  },{source:'data:video/webm;base64,'+fs.readFileSync(folder+name+'.webm').toString('base64'),samples,cycle});
  fs.writeFileSync(folder+name+(cycle?'-cycle.png':'-motion.png'),Buffer.from(result.png,'base64'));console.log(name,result.duration.toFixed(2)+'s');
 }
}finally{await browser.close();}
