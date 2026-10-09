import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {adventureEnergyProfile} from '../src/components/arcade/shared/audio/energyVoice';
const folder='tests/artifacts/arcade/energy-transitions';fs.mkdirSync(folder,{recursive:true});

test('flight and recovery never resume a ray from the still active super cinematic',()=>{
 for(const won of [true,false])for(const state of ['flight','land']){
  const s={player:{x:0},boss:{x:800,hp:48,ultimate:{state:'recover',age:0}},superCinematic:{age:1.15},powerClash:{state,won,age:.5}};
  expect(adventureEnergyProfile(s)).toBeNull();
 }
});

// Exercise the actual simulation and dispatch order, without manually stopping
// the sound. It used to restart during flight through the super-age fallback.
async function aftermath(page,won=true,accents=false){
 return page.evaluate(async({won,accents})=>{
  const sampleRate=44100,context=new OfflineAudioContext(2,sampleRate*15,sampleRate);let time=0;
  const proxy=new Proxy(context,{get(target,key){if(key==='currentTime')return time;if(key==='state')return 'running';const value=Reflect.get(target,key,target);return typeof value==='function'?value.bind(target):value;}});
  const original=window.AudioContext;window.AudioContext=function(){return proxy;};let report;
  try{
   const [sound,engine,ultimate]=await Promise.all([import(`/src/components/arcade/shared/audio/sounds.js?transitions=${crypto.randomUUID()}`),
    import('/src/components/arcade/adventure/engine/adventureModel.js'),import('/src/components/arcade/adventure/actors/bosses/harlequinUltimate.js')]);
   sound.setArcadeSoundsVolume(1,1);const s=engine.createAdventure(3);s.supplies=[];s.stars=[];s.arenaLocked=true;
   Object.assign(s.player,{x:1500,y:480,ground:2,hurt:30});Object.assign(s.boss,{phase:'recover',timer:100,engaged:true,vulnerable:true,stage:3,hp:240,debrisClock:100});
   ultimate.beginHarlequinUltimate(s);while(s.boss.ultimate.state==='leap')engine.stepAdventure(s,{},1/120);
   engine.stepAdventure(s,{super:true},1/120);const events=[],states=[];let taps=0,impact=null;
   for(let frame=0;frame<15*120;frame++){
    time=frame/120;const input={attack:s.powerClash?.state==='contest'&&won&&taps++%10===0};engine.stepAdventure(s,input,1/120);
    for(const event of s.events){events.push({event,at:time,state:s.powerClash?.state});if(event==='clashExplosion')impact=time;if(accents)sound.arcadeSound(event);}
    sound.syncArcadeEnergy(s);if(s.powerClash)states.push({at:time,state:s.powerClash.state,superActive:!!s.superCinematic});
   }
   sound.stopArcadeEnergy();report={impact,events,states:states.filter(q=>q.at>impact&&q.at<impact+3)};
  }finally{window.AudioContext=original;}
  const result=await context.startRendering(),channels=[result.getChannelData(0),result.getChannelData(1)];
  const level=(from,to)=>{let peak=0,sum=0;for(const data of channels)for(let i=Math.floor(from*sampleRate);i<Math.floor(to*sampleRate);i++){peak=Math.max(peak,Math.abs(data[i]));sum+=data[i]**2;}return{peak,rms:Math.sqrt(sum/(2*(to-from)*sampleRate))};};
  const before=level(report.impact-.6,report.impact-.4),after=level(report.impact+.25,report.impact+1.1),recovery=level(report.impact+2.4,report.impact+3.1);
  let wav;if(accents){const size=channels[0].length,buffer=new ArrayBuffer(44+size*4),view=new DataView(buffer),write=(at,s)=>{for(let i=0;i<s.length;i++)view.setUint8(at+i,s.charCodeAt(i));};
   write(0,'RIFF');view.setUint32(4,36+size*4,true);write(8,'WAVE');write(12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,2,true);view.setUint32(24,sampleRate,true);view.setUint32(28,sampleRate*4,true);view.setUint16(32,4,true);view.setUint16(34,16,true);write(36,'data');view.setUint32(40,size*4,true);
   for(let i=0;i<size;i++)for(let channel=0;channel<2;channel++)view.setInt16(44+(i*2+channel)*2,Math.max(-1,Math.min(1,channels[channel][i]))*32767,true);
   let binary='';const bytes=new Uint8Array(buffer);for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));wav=btoa(binary);
  }
  return{...report,before,after,recovery,peak:Math.max(...channels.map(data=>{let max=0;for(const n of data)max=Math.max(max,Math.abs(n));return max;})),wav};
 },{won,accents});
}
test('winning and losing stop the actual sustained audio at impact, before flight or recovery end',async({page})=>{
 await page.goto('/arcade');for(const won of [true,false]){
  const r=await aftermath(page,won);expect(r.impact).not.toBeNull();expect(r.before.rms).toBeGreaterThan(.015);
  expect(r.states.some(q=>q.state==='flight'&&q.superActive)).toBe(true);expect(r.states.some(q=>q.state==='land'&&q.superActive)).toBe(true);
  expect(r.after.peak).toBeLessThan(.00001);expect(r.recovery.peak).toBeLessThan(.00001);
  fs.writeFileSync(`${folder}/${won?'win':'lose'}-cut.json`,JSON.stringify(r,null,2));
 }
});

test('simulation cues distinguish launch, first contact, electrical arcs and final impact',async({page})=>{
 await page.goto('/arcade');const r=await aftermath(page,true,true),events=r.events;
 const launch=events.filter(q=>q.event==='harlequinRelease'),contact=events.filter(q=>q.event==='clashImpact'),impact=events.filter(q=>q.event==='clashExplosion'),arcs=events.filter(q=>q.event==='clashArc');
 expect(launch).toHaveLength(1);expect(contact).toHaveLength(1);expect(impact).toHaveLength(1);
 expect(launch[0].state).toBe('travel');expect(contact[0].at-launch[0].at).toBeGreaterThanOrEqual(.33);expect(impact[0].state).toBe('flight');
 expect(arcs.length).toBeGreaterThan(8);expect(arcs.length).toBeLessThan(35);expect(arcs.every(q=>q.at>=contact[0].at&&q.at<impact[0].at&&q.state==='contest')).toBe(true);
 expect(r.peak).toBeLessThan(.9);expect(r.recovery.peak).toBeLessThan(.00001);
 fs.writeFileSync(`${folder}/launch-contact-and-victory.wav`,Buffer.from(r.wav,'base64'));delete r.wav;fs.writeFileSync(`${folder}/cue-report.json`,JSON.stringify(r,null,2));
});

test('launch and contact have separate audible attacks above the held ray; arcs remain short',async({page})=>{
 await page.goto('/arcade');const report=await page.evaluate(async()=>{
  const {createEffectsBus}=await import('/src/components/arcade/shared/audio/effectsBus.js'),{createEnergyVoice,playEnergyAccent}=await import('/src/components/arcade/shared/audio/energyVoice.js');
  const result={};
  for(const kind of ['held','superCast','harlequinRelease','clashImpact','clashArc']){
   const sampleRate=44100,context=new OfflineAudioContext(2,sampleRate*2,sampleRate);let time=0;
   const proxy=new Proxy(context,{get(target,key){if(key==='currentTime')return time;const v=Reflect.get(target,key,target);return typeof v==='function'?v.bind(target):v;}});
   const master=context.createGain();master.gain.value=.7;master.connect(context.destination);const bus=createEffectsBus(context,master),voice=createEnergyVoice(proxy,bus);
   voice.update({mode:'clash',force:1,wave:0,balance:.5,pan:.62});time=.4;
   if(kind!=='held'){voice.accent(kind);playEnergyAccent(proxy,bus,kind,time);}
   time=1.5;voice.stop();const buffer=await context.startRendering(),data=buffer.getChannelData(0);
   const rms=(from,to)=>{let sum=0;for(let i=Math.floor(from*sampleRate);i<Math.floor(to*sampleRate);i++)sum+=data[i]**2;return Math.sqrt(sum/((to-from)*sampleRate));};
   let peak=0,nonFinite=0;for(const n of data){peak=Math.max(peak,Math.abs(n));if(!Number.isFinite(n))nonFinite++;}
   // The crack is deliberately brighter, rather than just turning up all
   // frequencies. Measure its high-frequency energy in the actual output.
   let high=0,previous=0,sum=0;const alpha=Math.exp(-2*Math.PI*2400/sampleRate),from=Math.floor(.405*sampleRate),to=Math.floor(.46*sampleRate);
   for(let i=0;i<to;i++){high=alpha*(high+data[i]-previous);previous=data[i];if(i>=from)sum+=high*high;}
   result[kind]={attack:rms(.405,.46),highAttack:Math.sqrt(sum/(to-from)),settled:rms(.8,1),peak,nonFinite};
  }return result;
 });
 fs.writeFileSync(`${folder}/attack-levels.json`,JSON.stringify(report,null,2));
 for(const kind of ['superCast','harlequinRelease','clashImpact']){
  expect(report[kind].attack).toBeGreaterThan(report.held.attack*1.35);expect(report[kind].nonFinite).toBe(0);expect(report[kind].peak).toBeLessThan(.9);
 }
 expect(report.clashArc.highAttack).toBeGreaterThan(report.held.highAttack*1.25);expect(report.clashArc.settled).toBeCloseTo(report.held.settled,4);expect(report.clashArc.peak).toBeLessThan(.9);
});
