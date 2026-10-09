// Short original effects with separate silhouettes: propulsion, collision,
// breakthrough and unstable electrical arcs. No imported recordings.
const noiseCache=new WeakMap(),arcCounts=new WeakMap();
function noiseBuffer(context){
 if(noiseCache.has(context))return noiseCache.get(context);
 const buffer=context.createBuffer(2,Math.ceil(context.sampleRate*1.25),context.sampleRate);
 for(let channel=0;channel<2;channel++){
  const data=buffer.getChannelData(channel);let seed=517931+channel*1723,smooth=0;
  for(let i=0;i<data.length;i++){
   seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;const n=(seed>>>0)/2147483648-1;
   smooth=smooth*.87+n*.13;data[i]=n*.48+smooth*1.6;
  }
 }noiseCache.set(context,buffer);return buffer;
}
export function playEnergyTransient(context,output,kind,at){
 if(!['superCast','harlequinRelease','clashImpact','clashArc','clashWin','clashLose'].includes(kind))return false;
 const envelope=(gain,duration,peak,start=at,hold=.015)=>{
  gain.setValueAtTime(0,start);gain.linearRampToValueAtTime(peak,start+.003);
  gain.setValueAtTime(peak,start+hold);gain.exponentialRampToValueAtTime(.0001,start+duration);
 };
 const noise=(duration,gain,from,to,type='lowpass',delay=0,hold=.015)=>{
  const start=at+delay,source=context.createBufferSource(),filter=context.createBiquadFilter(),amp=context.createGain();
  source.buffer=noiseBuffer(context);filter.type=type;filter.Q.value=type==='bandpass'?.9:.6;
  filter.frequency.setValueAtTime(from,start);filter.frequency.exponentialRampToValueAtTime(to,start+duration);
  envelope(amp.gain,duration,gain,start,hold);source.connect(filter);filter.connect(amp);amp.connect(output);
  source.start(start,delay%.1,duration);source.onended=()=>{source.disconnect();filter.disconnect();amp.disconnect();};
 };
 const kick=(from,to,duration,gain,delay=0)=>{
  const start=at+delay,source=context.createOscillator(),amp=context.createGain();source.frequency.setValueAtTime(from,start);source.frequency.exponentialRampToValueAtTime(to,start+duration*.65);
  envelope(amp.gain,duration,gain,start);source.connect(amp);amp.connect(output);source.start(start);source.stop(start+duration+.015);source.onended=()=>{source.disconnect();amp.disconnect();};
 };
 const rip=(from,to,duration,gain,delay=0,pan=0)=>{
  const start=at+delay,source=context.createOscillator(),mod=context.createOscillator(),depth=context.createGain(),filter=context.createBiquadFilter(),amp=context.createGain(),panner=context.createStereoPanner();
  source.type='sawtooth';source.frequency.setValueAtTime(from,start);source.frequency.exponentialRampToValueAtTime(to,start+duration);
  mod.frequency.setValueAtTime(39,start);mod.frequency.linearRampToValueAtTime(83,start+duration);depth.gain.value=from*.16;mod.connect(depth);depth.connect(source.frequency);
  filter.type='bandpass';filter.Q.value=1.1;filter.frequency.setValueAtTime(from*1.5,start);filter.frequency.exponentialRampToValueAtTime(Math.max(350,to*1.7),start+duration);
  envelope(amp.gain,duration,gain,start);panner.pan.value=pan;source.connect(filter);filter.connect(amp);amp.connect(panner);panner.connect(output);
  source.start(start);mod.start(start);source.stop(start+duration+.015);mod.stop(start+duration+.015);
  source.onended=()=>{for(const node of [source,mod,depth,filter,amp,panner])node.disconnect();};
 };
 if(kind==='superCast'||kind==='harlequinRelease'){
  const star=kind==='superCast';
  // A tearing front followed by a lower thrust, distinct from the steady ray.
  noise(.07,.2,2800,6100,'bandpass');noise(star ? .48 : .58,.27,5200,star?1100:480);
  rip(star?1750:1120,star?460:190,.23,.095,0,star?-.25:.25);
  kick(star?180:145,star?46:34,.45,.22);
 }else if(kind==='clashImpact'){
  // First contact: sharp crack, heavy centre and two close impact reflections.
  noise(.11,.33,6500,1700,'bandpass');noise(.88,.23,2300,180);
  kick(190,29,.6,.32);rip(1450,240,.17,.09);
  noise(.12,.095,3900,900,'bandpass',.042);noise(.17,.055,2800,500,'bandpass',.092);
 }else if(kind==='clashArc'){
  const count=(arcCounts.get(context)||0)+1;arcCounts.set(context,count);
  const pitch=[1680,2230,1370,1940,2580][count%5],side=count%2 ? .28 : -.28;
  noise(.105,.21,5500,2200,'bandpass',0,.03);rip(pitch,pitch*.31,.1,.14,0,side);
  if(count%3===0)rip(pitch*.71,pitch*.27,.055,.08,.075,-side);
 }else{
  // Breakthrough is brief: it ends before the opponent explodes, without a
  // victory melody or another held electrical tone over their flight.
  const won=kind==='clashWin';noise(.26,.13,won?1800:2400,350);
  kick(won?90:130,36,.28,.1);rip(won?640:980,180,.18,.04);
 }
 return true;
}
