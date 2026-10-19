import fs from 'node:fs/promises';
import {chromium} from '@playwright/test';
const out='tests/artifacts/arcade/nightmare-sprites-v6';
const video=await fs.readFile(out+'/double-reversal.webm'),record=JSON.parse(await fs.readFile(out+'/double-reversal.json','utf8'));
const first=record.samples.find(q=>q.state==='contest'),boost=record.samples.find(q=>q.state==='boss-boost'),strain=record.samples.find(q=>q.state==='contest'&&q.bossBoost&&!q.hexyBoost),rally=record.samples.find(q=>q.state==='contest'&&q.hexyBoost);
const phases=[['Concentración',first.wall+.7],['Locura / sorpresa',boost.wall+.25],['Presión / apoyo',strain.wall+.02],['Respuesta',rally.wall+.25]];
const browser=await chromium.launch({channel:'chrome'});
try{
 const page=await browser.newPage();
 const images=await page.evaluate(async({data,phases,boost})=>{
  const v=document.createElement('video');v.muted=true;v.src='data:video/webm;base64,'+data;await new Promise(r=>v.onloadeddata=r);
  const seek=t=>new Promise(r=>{v.onseeked=r;v.currentTime=t;});
  const sheet=document.createElement('canvas');sheet.width=1920;sheet.height=1260;const c=sheet.getContext('2d');
  for(let n=0;n<24;n++){
   const phase=Math.floor(n/6),time=phases[phase][1]+n%6*.1;await seek(time);
   const x=n%4*480,y=Math.floor(n/4)*210;c.fillStyle='#17121e';c.fillRect(x,y,480,210);
   c.drawImage(v,0,430,480,380,x,y+23,240,187);c.drawImage(v,960,0,480,330,x+240,y+23,240,165);
   c.fillStyle='#fff';c.font='14px sans-serif';c.fillText(phases[phase][0]+' · '+time.toFixed(2)+' s',x+8,y+17);
  }
  const full=document.createElement('canvas');full.width=1440;full.height=810;await seek(boost+.8);full.getContext('2d').drawImage(v,0,0,1440,810);
  return{sheet:sheet.toDataURL('image/jpeg',.97).split(',')[1],closeup:full.toDataURL('image/jpeg',.98).split(',')[1]};
 },{data:video.toString('base64'),phases,boost:boost.wall});
 await fs.writeFile(out+'/sprite-motion-playback.jpg',Buffer.from(images.sheet,'base64'));
 await fs.writeFile(out+'/boost-closeup-playback.jpg',Buffer.from(images.closeup,'base64'));
 console.log('Decoded 24 close samples and the aerial reinforcement close-up from the final recording.');
}finally{await browser.close();}
