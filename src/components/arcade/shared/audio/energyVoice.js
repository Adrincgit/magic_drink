// Original synthesis: no reference recordings or extracted samples. Two
// materials keep the duel audible: ember turbulence and a crystal resonance.
import {playEnergyTransient} from './energyTransients';
const textures=new WeakMap();
const clamp=n=>Math.max(0,Math.min(1,n));
function texture(context,crystal=false){
 let pair=textures.get(context);if(!pair){pair=[];textures.set(context,pair);}if(pair[Number(crystal)])return pair[Number(crystal)];
 const length=Math.ceil(context.sampleRate*4.7),buffer=context.createBuffer(2,length,context.sampleRate);
 for(let channel=0;channel<2;channel++){
  const data=buffer.getChannelData(channel);let seed=(crystal?748391:193867)+channel*5171,brown=0,crackle=0;
  const random=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/4294967296;};
  for(let i=0;i<length;i++){
   const t=i/context.sampleRate,white=random()*2-1;
   brown=(brown+white*.052)/1.02;
   crackle*=Math.exp(-1/(context.sampleRate*.003));if(random()<45/context.sampleRate)crackle+=random()*.7;
   const turbulence=.68+.15*Math.sin(t*37.7+channel)+.1*Math.sin(t*83.2)+.07*Math.sin(t*157.1);
   data[i]=(crystal?white*.19+brown*1.3: white*.32+brown*2.8)*turbulence+white*crackle*.55;
  }
  // A short overlap removes a click at the loop join without a periodic fade.
  const join=Math.ceil(context.sampleRate*.02);for(let i=0;i<join;i++){const k=i/join;data[length-join+i]=data[length-join+i]*(1-k)+data[i]*k;}
 }
 pair[Number(crystal)]=buffer;return buffer;
}
export function adventureEnergyProfile(s){
 const q=s.powerClash,b=s.boss,u=b?.ultimate,superAge=s.superCinematic?.age;
 if(s.done||s.clear||b?.defeat)return null;
 const pan=(b?.x??0)>(s.player?.x??0) ? .62 : -.62;
 if(q){
  // The super cinematic remains alive during knockback and getting up. These
  // clash states own the audio too: never fall through into an ordinary beam.
  if(!['windup','travel','contest','resolve'].includes(q.state))return null;
  if(q.state==='windup')return{mode:'charge',force:clamp(q.age/.9),wave:0,balance:.5,pan};
  return{mode:q.state==='contest'?'clash':q.state==='resolve'?'breakthrough':'beam',force:1,wave:q.wave||0,balance:q.pressure??.5,pan};
 }
 if(u?.state==='charge')return{mode:'charge',force:clamp(u.age/2.8),wave:0,balance:0,pan};
 if(u?.state==='fire')return{mode:'beam',force:1,wave:0,balance:0,pan};
 if(superAge!==undefined)return{mode:superAge<.9?'charge':'beam',force:clamp(superAge/.9),wave:0,balance:1,pan};
 return null;
}
export function createEnergyVoice(context,output){
 const start=context.currentTime,nodes=[],sources=[],bus=context.createGain(),accentGate=context.createGain();nodes.push(bus,accentGate);bus.gain.value=0;bus.connect(accentGate);accentGate.connect(output);
 const layer=(crystal)=>{
  const source=context.createBufferSource(),filter=context.createBiquadFilter(),amp=context.createGain(),pan=context.createStereoPanner();
  source.buffer=texture(context,crystal);source.loop=true;filter.type='bandpass';filter.Q.value=crystal?1.4:.7;amp.gain.value=0;
  source.connect(filter);filter.connect(amp);amp.connect(pan);pan.connect(bus);source.start(start);sources.push(source);nodes.push(source,filter,amp,pan);return{filter,amp,pan};
 };
 const fire=layer(false),star=layer(true);
 const bass=context.createOscillator(),bassAmp=context.createGain();bass.type='sine';bass.frequency.value=61;bassAmp.gain.value=.065;bass.connect(bassAmp);bassAmp.connect(bus);
 const whine=context.createOscillator(),whineAmp=context.createGain(),warp=context.createOscillator(),warpDepth=context.createGain();
 whine.frequency.value=840;whineAmp.gain.value=.021;warp.frequency.value=29.3;warpDepth.gain.value=280;
 warp.connect(warpDepth);warpDepth.connect(whine.frequency);whine.connect(whineAmp);whineAmp.connect(bus);
 for(const oscillator of [bass,whine,warp]){oscillator.start(start);sources.push(oscillator);}nodes.push(bass,bassAmp,whine,whineAmp,warp,warpDepth);
 let stopped=false;
 const target=(param,value,now,seconds=.045)=>param.setTargetAtTime(value,now,seconds);
 return{
  update(profile){
   if(stopped)return;const now=context.currentTime,charge=profile.mode==='charge',breakthrough=profile.mode==='breakthrough',wave=profile.wave,force=profile.force;
   const fireShare=1-profile.balance,starShare=profile.balance;
   target(bus.gain,(charge ? .3+force*.5 : 1)+wave*.16,now);
   target(fire.amp.gain,(charge ? .09 : .19)*(charge ? .65 : .6+fireShare*.8),now);
   target(star.amp.gain,(charge ? .075 : .155)*(charge ? .65 : .6+starShare*.8),now);
   target(fire.filter.frequency,(charge?240+force*760:920)+wave*540,now,.1);
   target(star.filter.frequency,(charge?550+force*1050:1850)+starShare*550,now,.1);
   target(fire.pan.pan,profile.pan,now,.1);target(star.pan.pan,-profile.pan,now,.1);
   target(bass.frequency,charge?43+force*24:66+wave*17,now,.09);
   target(whine.frequency,charge?340+force*690:880+wave*320+starShare*170,now,.1);
   target(warpDepth.gain,charge?90+force*160:340+wave*160,now,.09);
   target(warp.frequency,charge?17+force*13:32+wave*13,now,.1);
   // Once a beam breaks through, its electrical hold yields to the impact.
   target(whineAmp.gain,breakthrough?0:charge ? .013 : .019,now,.012);
  },
  accent(kind){
   if(stopped||!['superCast','harlequinRelease','clashImpact'].includes(kind))return;
   const now=context.currentTime,contact=kind==='clashImpact';
   accentGate.gain.cancelScheduledValues(now);accentGate.gain.setValueAtTime(accentGate.gain.value,now);
   accentGate.gain.linearRampToValueAtTime(contact ? .1 : .18,now+.004);
   accentGate.gain.setValueAtTime(contact ? .1 : .18,now+(contact ? .07 : .045));
   accentGate.gain.linearRampToValueAtTime(1,now+(contact ? .24 : .17));
  },
  stop(atImpact=false){
   if(stopped)return;stopped=true;const now=context.currentTime;
   bus.gain.cancelScheduledValues(now);bus.gain.setTargetAtTime(0,now,atImpact ? .005 : .018);
   let remaining=sources.length;
   for(const source of sources){source.onended=()=>{if(--remaining===0)for(const node of nodes)node.disconnect();};source.stop(now+(atImpact ? .04 : .12));}
  }
 };
}
// Impact accents have their own attack and long turbulent tail. The ongoing
// voice carries the hold; tapping never stacks twenty-second audio sources.
export function playEnergyAccent(context,output,kind,at){
 if(playEnergyTransient(context,output,kind,at))return true;
 const profiles={
  clashExplosion:[1.8,.34,3000,180,170,27],clashPulse:[.28,.1,1900,900,72,62],
  harlequinDown:[.85,.17,1350,260,145,48],harlequinDefeatLand:[1.25,.28,1800,190,110,29],
  harlequinVanish:[1.45,.28,2700,150,100,28],clashTap:[.07,.035,4700,2800,0,0]
 };
 const spec=profiles[kind];if(!spec)return false;
 const [duration,gain,from,to,bassFrom,bassTo]=spec;
 const source=context.createBufferSource(),filter=context.createBiquadFilter(),amp=context.createGain(),delay=context.createDelay(.4),echo=context.createGain();
 source.buffer=texture(context,kind==='superCast');filter.type='lowpass';filter.Q.value=.9;filter.frequency.setValueAtTime(from,at);filter.frequency.exponentialRampToValueAtTime(to,at+duration);
 amp.gain.setValueAtTime(0,at);amp.gain.linearRampToValueAtTime(gain,at+.008);amp.gain.exponentialRampToValueAtTime(.0001,at+duration);
 source.connect(filter);filter.connect(amp);amp.connect(output);amp.connect(delay);delay.delayTime.value=.12;echo.gain.value=.21;delay.connect(echo);echo.connect(output);
 source.start(at,kind==='clashTap'?1.9:0,duration);const nodes=[source,filter,amp,delay,echo];
 const clock=context.createOscillator(),silent=context.createGain();silent.gain.value=0;clock.connect(silent);silent.connect(output);clock.start(at);clock.stop(at+duration+.4);
 clock.onended=()=>{for(const node of [...nodes,clock,silent])node.disconnect();};
 if(bassFrom){
  const bass=context.createOscillator(),low=context.createGain();bass.frequency.setValueAtTime(bassFrom,at);bass.frequency.exponentialRampToValueAtTime(bassTo,at+duration*.65);
  low.gain.setValueAtTime(0,at);low.gain.linearRampToValueAtTime(gain*.75,at+.008);low.gain.exponentialRampToValueAtTime(.0001,at+duration);
  bass.connect(low);low.connect(output);bass.start(at);bass.stop(at+duration);bass.onended=()=>{bass.disconnect();low.disconnect();};
 }
 return true;
}
