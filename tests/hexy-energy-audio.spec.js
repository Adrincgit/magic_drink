import {test,expect} from '@playwright/test';
import fs from 'node:fs';
const folder='tests/artifacts/arcade/finale';fs.mkdirSync(folder,{recursive:true});
async function render(page,options={}){
 return page.evaluate(async options=>{
  const sampleRate=44100,context=new OfflineAudioContext(2,sampleRate*24,sampleRate);let time=0;
  const proxy=new Proxy(context,{get(target,key){if(key==='currentTime')return time;if(key==='state')return 'running';const v=Reflect.get(target,key,target);return typeof v==='function'?v.bind(target):v;}});
  const original=window.AudioContext;window.AudioContext=function(){return proxy;};
  try{
   const sound=await import(`/src/components/arcade/shared/audio/sounds.js?energy-test=${crypto.randomUUID()}`);
   sound.setArcadeSoundsVolume(options.master??1,options.effects??1);sound.muteArcadeSounds(options.muted??false);
   const s={player:{x:0},boss:{x:800,hp:240,ultimate:{state:'charge',age:0}}};
   sound.syncArcadeEnergy(s);sound.arcadeSound('harlequinPower');
   time=.6;s.boss.ultimate.age=.6;sound.syncArcadeEnergy(s);
   time=1;s.powerClash={state:'travel',age:0,pressure:.5};sound.syncArcadeEnergy(s);sound.arcadeSound('harlequinRelease');
   time=1.34;s.powerClash.state='contest';sound.syncArcadeEnergy(s);sound.arcadeSound('clashImpact');
   for(let t=1.5;t<21;t+=.25){
    time=t;s.powerClash.age=t-1.34;s.powerClash.pressure=.5+Math.sin(t*.7)*.25;s.powerClash.wave=(Math.sin(t*2)+1)/2;
    if(options.pause&&t>=8&&t<9){sound.stopArcadeEnergy();continue;}
    sound.syncArcadeEnergy(s);if(t>1.5)sound.arcadeSound('clashPulse');sound.arcadeSound('clashTap');
   }
   time=21;sound.stopArcadeEnergy();if(!options.pause){sound.arcadeSound('clashExplosion');time=22.2;sound.arcadeSound('clashLand');}
  }finally{window.AudioContext=original;}
  const result=await context.startRendering(),channels=[result.getChannelData(0),result.getChannelData(1)];let peak=0,power=0,nonFinite=0;
  for(const channel of channels)for(const n of channel){peak=Math.max(peak,Math.abs(n));power+=n*n;if(!Number.isFinite(n))nonFinite++;}
  const level=(from,to)=>{let sum=0,max=0;for(const channel of channels)for(let i=Math.floor(from*sampleRate);i<Math.floor(to*sampleRate);i++){sum+=channel[i]**2;max=Math.max(max,Math.abs(channel[i]));}return{rms:Math.sqrt(sum/(2*(to-from)*sampleRate)),peak:max};};
  const windows=Array.from({length:24},(_,i)=>level(i,i+1));
  let wav;if(options.export){
   const size=channels[0].length,buffer=new ArrayBuffer(44+size*4),view=new DataView(buffer);const str=(at,s)=>{for(let i=0;i<s.length;i++)view.setUint8(at+i,s.charCodeAt(i));};
   str(0,'RIFF');view.setUint32(4,36+size*4,true);str(8,'WAVE');str(12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,2,true);view.setUint32(24,sampleRate,true);view.setUint32(28,sampleRate*4,true);view.setUint16(32,4,true);view.setUint16(34,16,true);str(36,'data');view.setUint32(40,size*4,true);
   for(let i=0;i<size;i++)for(let ch=0;ch<2;ch++)view.setInt16(44+(i*2+ch)*2,Math.max(-1,Math.min(1,channels[ch][i]))*32767,true);
   let binary='';const bytes=new Uint8Array(buffer);for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));wav=btoa(binary);
  }
  return{peak,rms:Math.sqrt(power/(channels[0].length*2)),nonFinite,windows,pause:level(8.4,8.9),stopped:level(21.4,24),settled:level(23.6,24),wav};
 },options);
}
test('a full twenty second energy duel has sustained stereo weight and no digital clipping',async({page})=>{
 await page.goto('/arcade');const r=await render(page,{export:true});expect(r.nonFinite).toBe(0);expect(r.peak).toBeGreaterThan(.25);expect(r.peak).toBeLessThan(.9);
 expect(r.windows.slice(2,21).every(q=>q.rms>.015)).toBe(true);expect(r.settled.peak).toBeLessThan(.00001);
 fs.writeFileSync(`${folder}/original-energy-duel.wav`,Buffer.from(r.wav,'base64'));delete r.wav;fs.writeFileSync(`${folder}/energy-levels.json`,JSON.stringify(r,null,2));
});
test('pausing drains the energy voice, resuming restarts it, and ending leaves no sustained sound',async({page})=>{
 await page.goto('/arcade');const r=await render(page,{pause:true});expect(r.pause.peak).toBeLessThan(.00001);expect(r.windows[9].rms).toBeGreaterThan(.015);expect(r.stopped.peak).toBeLessThan(.00001);
});
test('the continuous bed and impact accents respect master, effects and mute',async({page})=>{
 await page.goto('/arcade');for(const options of [{master:0},{effects:0},{muted:true}])expect((await render(page,options)).peak).toBe(0);
});
