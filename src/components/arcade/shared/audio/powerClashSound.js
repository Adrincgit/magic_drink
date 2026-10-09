import {playEnergyAccent} from './energyVoice';
// Short scheduled phrases; the shared effects compressor and volume controls
// still own the final level. Charge can resolve early into a counter-spell.
export function playPowerClashSound(context,output,kind,at){
 if(playEnergyAccent(context,output,kind,at))return true;
 if(!['harlequinPower','harlequinPowerPulse','clashLand','hexyDefeatLaunch','hexyDefeatLand','harlequinEruption','harlequinFireImpact','harlequinEntrance','harlequinEntranceLand','death'].includes(kind))return false;
 const tone=(from,to,length,gain,delay=0,type='sine')=>{
  const o=context.createOscillator(),a=context.createGain(),start=at+delay;o.type=type;o.frequency.setValueAtTime(from,start);o.frequency.exponentialRampToValueAtTime(to,start+length);
  a.gain.setValueAtTime(0,start);a.gain.linearRampToValueAtTime(gain,start+.012);a.gain.exponentialRampToValueAtTime(.0001,start+length);
  o.connect(a);a.connect(output);o.start(start);o.stop(start+length+.02);o.onended=()=>{o.disconnect();a.disconnect();};
 };
 const rush=(length,gain)=>{
  const buf=context.createBuffer(1,Math.ceil(context.sampleRate*length),context.sampleRate),d=buf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  const source=context.createBufferSource(),f=context.createBiquadFilter(),a=context.createGain();source.buffer=buf;f.type='lowpass';f.frequency.setValueAtTime(4500,at);f.frequency.exponentialRampToValueAtTime(340,at+length);
  a.gain.setValueAtTime(gain,at);a.gain.exponentialRampToValueAtTime(.0001,at+length);source.connect(f);f.connect(a);a.connect(output);source.start(at);source.onended=()=>{source.disconnect();f.disconnect();a.disconnect();};
 };
 const rumble=(length,gain)=>{
  const buf=context.createBuffer(1,Math.ceil(context.sampleRate*length),context.sampleRate),d=buf.getChannelData(0);let brown=0;
  for(let i=0;i<d.length;i++){brown=(brown+(Math.random()*2-1)*.045)/1.018;d[i]=brown*3.5;}
  const source=context.createBufferSource(),f=context.createBiquadFilter(),a=context.createGain();source.buffer=buf;f.type='lowpass';f.frequency.value=280;f.Q.value=.7;
  a.gain.setValueAtTime(0,at);a.gain.linearRampToValueAtTime(gain,at+.065);a.gain.setValueAtTime(gain*.8,at+length*.65);a.gain.exponentialRampToValueAtTime(.0001,at+length);
  source.connect(f);f.connect(a);a.connect(output);source.start(at);source.onended=()=>{source.disconnect();f.disconnect();a.disconnect();};
  tone(54,36,length,gain*.45);tone(83,59,length,gain*.22);
 };
 const energy=(length,gain,descending=false)=>{
  const buffer=context.createBuffer(2,Math.ceil(context.sampleRate*length),context.sampleRate);
  for(let ch=0;ch<2;ch++){const data=buffer.getChannelData(ch);let smooth=0;for(let i=0;i<data.length;i++){const t=i/context.sampleRate,n=Math.random()*2-1;smooth=smooth*.91+n*.09;data[i]=(n*.24+smooth*2.2)*(.66+.24*Math.sin(t*91+ch)+.1*Math.sin(t*173));}}
  const source=context.createBufferSource(),filter=context.createBiquadFilter(),gainNode=context.createGain(),echo=context.createDelay(.3),tail=context.createGain();source.buffer=buffer;filter.type='bandpass';filter.Q.value=.65;
  filter.frequency.setValueAtTime(descending?1800:650,at);filter.frequency.exponentialRampToValueAtTime(descending?140:2400,at+length);
  gainNode.gain.setValueAtTime(0,at);gainNode.gain.linearRampToValueAtTime(gain,at+.025);gainNode.gain.setValueAtTime(gain*.65,at+length*.65);gainNode.gain.exponentialRampToValueAtTime(.0001,at+length);
  source.connect(filter);filter.connect(gainNode);gainNode.connect(output);gainNode.connect(echo);echo.delayTime.value=.095;echo.connect(tail);tail.gain.value=.22;tail.connect(output);
  source.start(at);source.onended=()=>{source.disconnect();filter.disconnect();gainNode.disconnect();};
  // Disconnect the echo after its delayed tail has actually played.
  const timer=context.createOscillator(),silence=context.createGain();silence.gain.value=0;timer.connect(silence);silence.connect(output);timer.start(at);timer.stop(at+length+.31);timer.onended=()=>{echo.disconnect();tail.disconnect();timer.disconnect();silence.disconnect();};
 };
 if(kind==='harlequinPower'){
  rumble(1.15,.19);rush(.7,.035);[233,349,466].forEach((hz,i)=>tone(hz,hz*1.3,.7,.026,i*.16));
 }else if(kind==='harlequinPowerPulse'){rumble(.72,.2);energy(.65,.14);tone(196,310,.5,.034);rush(.5,.035);}
 else if(kind==='clashLand'||kind==='hexyDefeatLand'){rumble(.95,.22);rush(.52,.16);tone(110,38,.55,.14);tone(250,65,.26,.045,0,'triangle');}
 else if(kind==='hexyDefeatLaunch'){energy(.9,.12,true);rush(.4,.11);rumble(.85,.14);tone(340,72,.8,.035);}
 else if(kind==='harlequinEruption'){energy(.55,.12);rush(.65,.15);rumble(.5,.12);}
 else if(kind==='harlequinFireImpact'){energy(.5,.11,true);rush(.4,.13);rumble(.45,.1);tone(125,44,.4,.05);}
 else if(kind==='harlequinEntrance'){rumble(1.5,.14);energy(1.1,.08);tone(98,175,1.2,.035);}
 else if(kind==='harlequinEntranceLand'){rumble(.9,.17);energy(.8,.14,true);tone(145,40,.6,.09);}
 else if(kind==='death'){energy(1.2,.055,true);rumble(1.1,.065);}
 return true;
}
