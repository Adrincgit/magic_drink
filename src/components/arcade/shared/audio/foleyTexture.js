// Noise, pressure and short material resonances; no pitched note sequences.
const banks=new WeakMap(),rooms=new WeakMap();let serial=0;
export function textureBuffer(ctx,kind='air'){
 let bank=banks.get(ctx);if(!bank){bank={};banks.set(ctx,bank);}if(bank[kind])return bank[kind];
 const b=ctx.createBuffer(1,ctx.sampleRate*5,ctx.sampleRate),d=b.getChannelData(0);let seed=17391,low=0,grain=0;
 for(let i=0;i<d.length;i++){
  seed=(Math.imul(seed,1664525)+1013904223)>>>0;const white=seed/2147483648-1;low=low*.985+white*.015;
  if(kind==='grit'){if((seed&1023)<5)grain=.35+((seed>>>12)&255)/390;grain*=.991;d[i]=white*(.07+grain);}
  else d[i]=kind==='rumble'?low*5:kind==='breath'?white*.5+low*2:white;
 }
 bank[kind]=b;return b;
}
function room(ctx,out){
 let r=rooms.get(out);if(r)return r;const input=ctx.createGain();
 for(const [delay,level] of [[.037,.18],[.081,.09],[.143,.045]]){
  const tap=ctx.createDelay(.2),filter=ctx.createBiquadFilter(),gain=ctx.createGain();tap.delayTime.value=delay;filter.type='lowpass';filter.frequency.value=2100;gain.gain.value=level;
  input.connect(tap);tap.connect(filter);filter.connect(gain);gain.connect(out);
 }rooms.set(out,input);return input;
}
export function foley(ctx,out,at=ctx.currentTime,{gain=1,pan=0,space=.2}={}){
 const bus=ctx.createGain(),panner=ctx.createStereoPanner(),wet=ctx.createGain();bus.gain.value=gain;panner.pan.value=pan;wet.gain.value=space;
 bus.connect(panner);panner.connect(out);panner.connect(wet);wet.connect(room(ctx,out));
 const variation=.94+(serial++%7)*.019;let pending=0;
 const finish=(source,nodes)=>{pending++;source.onended=()=>{nodes.forEach(n=>n.disconnect());if(--pending===0){bus.disconnect();panner.disconnect();wet.disconnect();}};};
 const envelope=(g,t,d,level,attack)=>{g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(level,t+Math.min(d*.3,attack));g.gain.exponentialRampToValueAtTime(.00005,t+d);};
 return{
  air(d,level,hz,end=hz,delay=0,texture='air',attack=.004,q=.65){
   const src=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain(),t=at+delay;src.buffer=textureBuffer(ctx,texture);src.playbackRate.value=variation;
   f.type=texture==='rumble'?'lowpass':'bandpass';f.Q.value=q;f.frequency.setValueAtTime(hz*variation,t);f.frequency.exponentialRampToValueAtTime(Math.max(30,end),t+d);
   envelope(g,t,d,level,attack);src.connect(f);f.connect(g);g.connect(bus);finish(src,[src,f,g]);src.start(t,(serial++%19)*.13);src.stop(t+d+.015);
  },
  body(hz,end,d,level,delay=0){
   const o=ctx.createOscillator(),g=ctx.createGain(),t=at+delay;o.type='sine';o.frequency.setValueAtTime(hz*variation,t);o.frequency.exponentialRampToValueAtTime(Math.max(22,end),t+d);envelope(g,t,d,level,.003);
   o.connect(g);g.connect(bus);finish(o,[o,g]);o.start(t);o.stop(t+d+.015);
  },
  grit(count,level,hz=2400,spacing=.045){for(let i=0;i<count;i++)this.air(.025+(i%3)*.018,level/(1+i*.25),hz*(.7+(i%4)*.17),hz*.35,.009+i*spacing+(i%3)*.007,'grit');}
 };
}
export function createTextureVoice(ctx,out){
 const bus=ctx.createGain(),pan=ctx.createStereoPanner(),air=ctx.createBufferSource(),grit=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createBiquadFilter(),rough=ctx.createGain(),hum=ctx.createOscillator(),low=ctx.createGain();
 bus.gain.value=0;bus.connect(pan);pan.connect(out);air.buffer=textureBuffer(ctx,'breath');grit.buffer=textureBuffer(ctx,'grit');air.loop=grit.loop=true;
 f.type=g.type='bandpass';f.Q.value=.7;g.Q.value=.5;f.frequency.value=1700;g.frequency.value=3400;rough.gain.value=.55;
 air.connect(f);f.connect(bus);grit.connect(g);g.connect(rough);rough.connect(bus);hum.type='sine';hum.frequency.value=61;low.gain.value=.14;hum.connect(low);low.connect(bus);
 const sources=[air,grit,hum],nodes=[...sources,bus,pan,f,g,rough,low];sources.forEach(q=>q.start());let stopped=false;
 return{update({gain=.08,frequency=1800,pitch=61,crackle=.5,pan:position=0}){if(stopped)return;const t=ctx.currentTime;bus.gain.setTargetAtTime(gain,t,.04);f.frequency.setTargetAtTime(frequency,t,.08);g.frequency.setTargetAtTime(frequency*1.8,t,.05);rough.gain.setTargetAtTime(crackle,t,.05);hum.frequency.setTargetAtTime(pitch,t,.1);pan.pan.setTargetAtTime(position,t,.05);},stop(){if(stopped)return;stopped=true;const t=ctx.currentTime;bus.gain.cancelScheduledValues(t);bus.gain.setTargetAtTime(0,t,.014);sources.forEach(o=>o.stop(t+.12));hum.onended=()=>nodes.forEach(n=>n.disconnect());}};
}
