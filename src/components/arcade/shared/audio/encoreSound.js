import {playEnergyAccent} from './energyVoice';
// Crystal partials, a filtered swell and a resonant release. Scheduled on the
// same charge/cast/pulse events as the visual; no downloaded samples or voices.
export function playEncoreSound(context,output,kind,at){
 if(!['superCharge','superCast','superPulse'].includes(kind))return false;
 const tone=(hz,end,duration,gain,delay=0,partial=1)=>{
  const osc=context.createOscillator(),amp=context.createGain(),start=at+delay;
  osc.type='sine';osc.frequency.setValueAtTime(hz*partial,start);osc.frequency.exponentialRampToValueAtTime(end*partial,start+duration);
  amp.gain.setValueAtTime(0,start);amp.gain.linearRampToValueAtTime(gain,start+.008);amp.gain.exponentialRampToValueAtTime(.0001,start+duration);
  osc.connect(amp);amp.connect(output);osc.start(start);osc.stop(start+duration+.02);osc.onended=()=>{osc.disconnect();amp.disconnect();};
 };
 const bell=(hz,gain,duration,delay=0)=>{
  tone(hz,hz,duration,gain,delay);tone(hz,hz,duration*.6,gain*.22,delay,2.01);tone(hz,hz,duration*.32,gain*.07,delay,3.98);
 };
 const swell=(duration,gain,from,to,delay=0)=>{
  const start=at+delay,buffer=context.createBuffer(1,Math.ceil(context.sampleRate*duration),context.sampleRate),data=buffer.getChannelData(0);
  for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;
  const source=context.createBufferSource(),filter=context.createBiquadFilter(),amp=context.createGain();source.buffer=buffer;
  filter.type='bandpass';filter.Q.value=.65;filter.frequency.setValueAtTime(from,start);filter.frequency.exponentialRampToValueAtTime(to,start+duration);
  amp.gain.setValueAtTime(0,start);amp.gain.linearRampToValueAtTime(gain,start+duration*.6);amp.gain.exponentialRampToValueAtTime(.0001,start+duration);
  source.connect(filter);filter.connect(amp);amp.connect(output);source.start(start);source.onended=()=>{source.disconnect();filter.disconnect();amp.disconnect();};
 };
 if(kind==='superCharge'){
  [523.25,659.25,783.99,1046.5,1318.5,1568,2093].forEach((hz,i)=>bell(hz,.036+i*.002,.38,[0,.08,.17,.28,.4,.54,.69][i]));
  tone(196,392,.85,.03);swell(.86,.07,420,3600);
 }else if(kind==='superCast'){
  playEnergyAccent(context,output,kind,at);
  tone(130.81,55,.42,.105);[261.63,392,523.25,783.99].forEach((hz,i)=>tone(hz,hz,.7,.022,i*.014));
  bell(1568,.062,.75);bell(2093,.035,.55,.075);bell(2637,.022,.45,.15);swell(.4,.1,3400,650);
 }else{
  tone(130.81,98,.22,.05);tone(261.63,196,.2,.024);bell(1568,.024,.23);bell(2093,.013,.18,.045);
 }
 return true;
}
