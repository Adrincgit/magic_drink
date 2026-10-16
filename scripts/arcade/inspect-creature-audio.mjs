import fs from 'node:fs';
import {chromium} from '@playwright/test';
const dir='context/arcade/village-5-2/revision-13/',sources=dir+'sources/';
const names=fs.readdirSync(sources).filter(n=>/^(voice-zombie|witch-laugh|flame-burst|fireball|pumpkin-break|magic-)/.test(n)&&/\.(wav|mp3|ogg)$/.test(n));
const files=names.map(name=>({name,data:fs.readFileSync(sources+name).toString('base64')}));
files.push({name:'reference',data:fs.readFileSync('public/arcade/music/for replace/momia-mslug.mp3').toString('base64')});
const browser=await chromium.launch({channel:'chrome'});
try{
 const page=await browser.newPage();await page.goto('http://127.0.0.1:4321');
 const report=await page.evaluate(async files=>{
  const ctx=new OfflineAudioContext(1,1,44100),report=[];
  for(const f of files){
   const b=await ctx.decodeAudioData(Uint8Array.from(atob(f.data),c=>c.charCodeAt(0)).buffer),d=b.getChannelData(0);
   let peak=0,sum=0,first=d.length,last=0;const bins=[];
   for(let i=0;i<d.length;i++){const v=Math.abs(d[i]);peak=Math.max(peak,v);sum+=v*v;if(v>.015){first=Math.min(first,i);last=i;}}
   for(let i=0;i<d.length;i+=4410){let s=0;for(let j=i;j<Math.min(d.length,i+4410);j++)s+=d[j]**2;bins.push(+Math.sqrt(s/Math.min(4410,d.length-i)).toFixed(3));}
   report.push({name:f.name,duration:b.duration,channels:b.numberOfChannels,peak,rms:Math.sqrt(sum/d.length),first:first/44100,last:last/44100,bins});
  }return report;
 },files);fs.writeFileSync(dir+'source-analysis.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}finally{await browser.close();}
