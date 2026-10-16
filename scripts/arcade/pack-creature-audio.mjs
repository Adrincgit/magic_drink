// Offline, reproducible edits of CC0 recordings. No runtime synthesis or network dependency.
import fs from 'node:fs';
import {chromium} from '@playwright/test';
const dir='context/arcade/village-5-2/revision-13/',sourceDir=dir+'sources/',out='public/arcade/audio/creatures/';
const layer=(file,extra={})=>({file,...extra});
const recipes=[
 {name:'soul-flame-1',duration:.68,layers:[layer('flame-burst.mp3'),layer('fireball.wav',{offset:.38,rate:1.25,gain:.3,lowpass:2500})]},
 {name:'soul-flame-2',duration:.75,layers:[layer('flame-burst.mp3',{rate:.93}),layer('fireball.wav',{offset:.4,rate:1.1,gain:.35,lowpass:2700})]},
 {name:'pumpkin-death-1',duration:.82,layers:[layer('pumpkin-break.ogg',{gain:.65}),layer('flame-burst.mp3',{at:.06,gain:.18,rate:.8})]},
 {name:'pumpkin-death-2',duration:.76,layers:[layer('pumpkin-break.ogg',{rate:.87,gain:.65}),layer('flame-burst.mp3',{at:.06,gain:.18,rate:.9})]},
 {name:'pumpkin-land',duration:.42,layers:[layer('pumpkin-break.ogg',{rate:.94})]},
 {name:'witch-laugh-1',duration:1.58,layers:[layer('witch-laugh.mp3',{offset:.225,end:1.8,lowpass:7500})]},
 {name:'witch-laugh-2',duration:1.48,layers:[layer('witch-laugh.mp3',{offset:1.43,end:2.99,rate:1.06,lowpass:7500})]},
 {name:'pumpkin-conjure',duration:1.02,layers:[layer('magic-3.ogg',{rate:1.45,gain:.65}),layer('magic-5.ogg',{at:.07,rate:1.6,gain:.32}),layer('flame-burst.mp3',{gain:.4})]},
 ...[1,2,3].map(i=>({name:'zombie-death-'+i,duration:[.65,.63,.79][i-1],layers:[layer('voice-zombieDeath'+i+'.wav',{lowpass:6500})]})),
 ...[16,17,18].map((id,i)=>({name:'zombie-groan-'+(i+1),duration:[1.42,1.56,1.1][i],layers:[layer('zombie-'+id+'.wav',{lowpass:5200})]})),
];
const files=Object.fromEntries([...new Set(recipes.flatMap(r=>r.layers.map(l=>l.file)))].map(f=>[f,fs.readFileSync(sourceDir+f).toString('base64')]));
const browser=await chromium.launch({channel:'chrome'});fs.mkdirSync(out,{recursive:true});
try{
 const page=await browser.newPage();await page.goto(process.env.MAGIC_DRINK_TEST_URL||'http://127.0.0.1:4321');
 const results=await page.evaluate(async({files,recipes})=>{
  const sr=32000,decoder=new OfflineAudioContext(1,1,sr),buffers={};
  for(const [name,data]of Object.entries(files))buffers[name]=await decoder.decodeAudioData(Uint8Array.from(atob(data),c=>c.charCodeAt(0)).buffer);
  const results=[];
  for(const r of recipes){
   const ctx=new OfflineAudioContext(1,Math.ceil(sr*r.duration),sr);
   for(const l of r.layers){
    const original=buffers[l.file],b=ctx.createBuffer(1,original.length,sr),d=b.getChannelData(0);
    for(let ch=0;ch<original.numberOfChannels;ch++){const channel=original.getChannelData(ch);for(let i=0;i<d.length;i++)d[i]+=channel[i]/original.numberOfChannels;}
    let sum=0;for(const v of d)sum+=v*v;const rms=Math.sqrt(sum/d.length),normal=Math.min(6,.18/Math.max(.005,rms));
    const src=ctx.createBufferSource(),hi=ctx.createBiquadFilter(),lo=ctx.createBiquadFilter(),g=ctx.createGain();
    src.buffer=b;src.playbackRate.value=l.rate||1;hi.type='highpass';hi.frequency.value=70;lo.type='lowpass';lo.frequency.value=l.lowpass||10500;
    const at=l.at||0,offset=l.offset||0,end=Math.min(r.duration,at+((l.end||b.duration)-offset)/(l.rate||1)),gain=normal*(l.gain??1);
    g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(gain,at+.006);g.gain.setValueAtTime(gain,Math.max(at+.006,end-.07));g.gain.linearRampToValueAtTime(0,end);
    src.connect(hi);hi.connect(lo);lo.connect(g);g.connect(ctx.destination);src.start(at,offset);src.stop(end);
   }
   const b=await ctx.startRendering(),d=b.getChannelData(0);let peak=0,sum=0;
   for(let i=0;i<d.length;i++){d[i]=Math.tanh(d[i]*1.4)/1.4;peak=Math.max(peak,Math.abs(d[i]));sum+=d[i]*d[i];}
   const gain=Math.min(.82/peak,.17/Math.sqrt(sum/d.length));peak=0;sum=0;
   const bytes=new ArrayBuffer(44+d.length*2),v=new DataView(bytes),str=(at,s)=>{for(let i=0;i<s.length;i++)v.setUint8(at+i,s.charCodeAt(i));};
   str(0,'RIFF');v.setUint32(4,bytes.byteLength-8,true);str(8,'WAVE');str(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,sr,true);v.setUint32(28,sr*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);str(36,'data');v.setUint32(40,d.length*2,true);
   for(let i=0;i<d.length;i++){const x=d[i]*gain;peak=Math.max(peak,Math.abs(x));sum+=x*x;v.setInt16(44+i*2,Math.round(x*32767),true);}
   const data=await new Promise(resolve=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.readAsDataURL(new Blob([bytes]));});
   results.push({name:r.name,duration:b.duration,peak,rms:Math.sqrt(sum/d.length),bytes:bytes.byteLength,data});
  }return results;
 },{files,recipes});
 for(const r of results){fs.writeFileSync(out+r.name+'.wav',Buffer.from(r.data,'base64'));delete r.data;}
 fs.writeFileSync(dir+'edits.json',JSON.stringify({sampleRate:32000,channels:1,recipes,results},null,2));console.log(JSON.stringify(results));
}finally{await browser.close();}
