import {test,expect} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';
import {createAdventure,stepAdventure} from '../src/components/arcade/adventure/engine/adventureModel';

const folder='tests/artifacts/arcade/effects-mix';
mkdirSync(folder,{recursive:true});

// Render the actual runtime sound graph. A scheduled clock lets the same API
// run offline, including event throttling, envelopes and the output compressor.
async function render(page,events,options={}){
 return page.evaluate(async({events,options})=>{
 const sampleRate=44100,context=new OfflineAudioContext(1,sampleRate*5,sampleRate),gains=[];
  let time=0;
  const proxy=new Proxy(context,{get(target,key){
   if(key==='currentTime')return time;
   if(key==='state')return 'running';
   if(key==='createGain')return()=>{const node=target.createGain();gains.push(node);return node;};
   const value=Reflect.get(target,key,target);return typeof value==='function'?value.bind(target):value;
  }});
  const original=window.AudioContext;
  try{
   window.AudioContext=function(){return proxy;};
   const sound=await import(`/src/components/arcade/shared/audio/sounds.js?render=${crypto.randomUUID()}`);
   sound.setArcadeSoundsVolume(options.master??1,options.effects??1);sound.muteArcadeSounds(options.muted??false);sound.unlockArcadeAudio();
   if(options.legacyGain){gains[1].gain.value=1.15;gains[1].disconnect();gains[1].connect(gains[0]);}
   for(const [at,kind] of events){time=at;sound.arcadeSound(kind);}
  }finally{window.AudioContext=original;}
  const data=(await context.startRendering()).getChannelData(0);
  let peak=0,squares=0,last=0,nonFinite=0;
  for(let i=0;i<data.length;i++){const n=data[i];if(!Number.isFinite(n))nonFinite++;peak=Math.max(peak,Math.abs(n));squares+=n*n;if(Math.abs(n)>.0005)last=i/sampleRate;}
  const windows=Array.from({length:10},(_,i)=>{let sum=0;const start=i*sampleRate/2,end=start+sampleRate/2;for(let j=start;j<end;j++)sum+=data[j]**2;return Math.sqrt(sum/(end-start));});
  let wav;
  if(options.export){
   const buffer=new ArrayBuffer(44+data.length*2),view=new DataView(buffer);
   const str=(at,s)=>{for(let i=0;i<s.length;i++)view.setUint8(at+i,s.charCodeAt(i));};
   str(0,'RIFF');view.setUint32(4,36+data.length*2,true);str(8,'WAVE');str(12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);view.setUint32(24,sampleRate,true);view.setUint32(28,sampleRate*2,true);view.setUint16(32,2,true);view.setUint16(34,16,true);str(36,'data');view.setUint32(40,data.length*2,true);
   for(let i=0;i<data.length;i++)view.setInt16(44+i*2,Math.max(-1,Math.min(1,data[i]))*32767,true);
   let binary='';const bytes=new Uint8Array(buffer);for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));wav=btoa(binary);
  }
  return{peak,rms:Math.sqrt(squares/data.length),last,windows,nonFinite,wav};
 },{events,options});
}

test('ordinary shots gain audible headroom; master, effects and mute still silence the real output',async({page})=>{
 await page.goto('/arcade');
 const events=[[.1,'cast'],[.4,'jump'],[.8,'cast']];
 const before=await render(page,events,{legacyGain:true}),after=await render(page,events);
 const gainDb=20*Math.log10(after.rms/before.rms);
 expect(gainDb).toBeGreaterThan(6);expect(gainDb).toBeLessThan(12);expect(after.peak).toBeLessThan(.9);
 for(const options of [{master:0},{effects:0},{muted:true}])expect((await render(page,events,options)).peak).toBe(0);
 writeFileSync(`${folder}/gain.json`,JSON.stringify({before,after,gainDb},null,2));
});

test('encore charge, release and beam have a complete audible envelope',async({page})=>{
 await page.goto('/arcade');
 const state=createAdventure(),events=[];
 for(const key of ['enemies','hostile','outposts','supplies','hazards','stars','cages'])state[key]=[];
 stepAdventure(state,{super:true},1/60);
 while(state.superCinematic){events.push(...state.events.filter(kind=>kind.startsWith('super')).map(kind=>[state.superCinematic.age,kind]));stepAdventure(state,{},1/60);}
 expect(events.filter(([,kind])=>kind==='superPulse')).toHaveLength(8);
 const result=await render(page,events,{export:true});
 expect(result.nonFinite).toBe(0);expect(result.peak).toBeGreaterThan(.12);expect(result.peak).toBeLessThan(.9);
 expect(result.windows.slice(0,6).every(rms=>rms>.004)).toBe(true);expect(result.last).toBeGreaterThan(2.7);expect(result.last).toBeLessThan(3.2);
 writeFileSync(`${folder}/encore.wav`,Buffer.from(result.wav,'base64'));delete result.wav;writeFileSync(`${folder}/encore.json`,JSON.stringify(result,null,2));
});

test('dense boss combat and simultaneous explosions stay below digital clipping',async({page})=>{
 await page.goto('/arcade');
 const events=[[0,'superCharge'],[.9,'superCast']];
 for(let at=.1;at<4;at+=.1)events.push([at,'cast'],[at,'bossHit']);
 for(let at=.95;at<4;at+=.39)events.push([at,'superPulse'],[at,'bossHeavyHit'],[at,'organBlast'],[at,'organClatter']);
 events.push([2,'organDestroy'],[2,'towerTransform'],[2,'zeppelinBurst']);events.sort((a,b)=>a[0]-b[0]);
 const result=await render(page,events,{export:true});expect(result.nonFinite).toBe(0);expect(result.peak).toBeLessThan(.9);expect(result.rms).toBeGreaterThan(.01);
 writeFileSync(`${folder}/combat.wav`,Buffer.from(result.wav,'base64'));delete result.wav;writeFileSync(`${folder}/combat.json`,JSON.stringify(result,null,2));
});
