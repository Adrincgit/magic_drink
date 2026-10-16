// Layered cannon voice: sharp air crack, low pressure body and a short trail
// of kernels. All layers feed the existing compressor and user volume bus.
const buffers=new WeakMap();
function noise(ctx){
 if(buffers.has(ctx))return buffers.get(ctx);
 const b=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*.75),ctx.sampleRate),d=b.getChannelData(0);let n=18731;
 for(let i=0;i<d.length;i++){n=(Math.imul(n,1664525)+1013904223)>>>0;d[i]=n/2147483648-1;}buffers.set(ctx,b);return b;
}
export function playPopcornSound(ctx,out,kind,at){
 if(!['popcornShot','popcornCast','popcornImpact','popcornFinish','popcornLand'].includes(kind))return false;
 const tone=(hz,end,duration,gain,delay=0)=>{
  const o=ctx.createOscillator(),g=ctx.createGain(),t=at+delay;o.type='sine';o.frequency.setValueAtTime(hz,t);o.frequency.exponentialRampToValueAtTime(end,t+duration);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(gain,t+.004);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g);g.connect(out);o.start(t);o.stop(t+duration+.02);o.onended=()=>{o.disconnect();g.disconnect();};
 };
 const air=(duration,gain,hz,end,delay=0,type='lowpass')=>{
  const n=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain(),t=at+delay;n.buffer=noise(ctx);f.type=type;f.Q.value=.6;f.frequency.setValueAtTime(hz,t);f.frequency.exponentialRampToValueAtTime(end,t+duration);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(gain,t+.003);g.gain.exponentialRampToValueAtTime(.0001,t+duration);n.connect(f);f.connect(g);g.connect(out);n.start(t);n.stop(t+duration+.02);n.onended=()=>{n.disconnect();f.disconnect();g.disconnect();};
 };
 if(kind==='popcornShot'||kind==='popcornCast'){
  air(.095,.24,5600,1600);air(.43,.32,1150,120,.012);tone(142,39,.36,.22);tone(73,31,.48,.12,.024);
  for(const [i,delay]of [.075,.12,.175,.235].entries()){air(.037,.055-i*.008,2200+i*130,800,delay,'bandpass');tone(490+i*170,160+i*40,.055,.018,delay);}
 }else if(kind==='popcornFinish'){air(.32,.17,1800,190);tone(112,32,.29,.14);air(.45,.065,950,360,.05,'bandpass');}
 else if(kind==='popcornLand'){air(.16,.09,780,170);tone(88,35,.18,.09);}
 else{air(.13,.10,2100,450);tone(170,58,.15,.09);}
 return true;
}
