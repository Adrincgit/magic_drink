// Air, low roar and crackle made from filtered noise. The sustained voice is
// driven by living flames, so stopping a cast or pausing also stops its sound.
export function emberAudioProfile(s){
 if(!s?.level?.emberTrail||s.done||s.fortInside)return null;
 let intensity=0;
 for(const q of s.hostile||[]){if(q.life<=0)continue;const distance=Math.abs(q.x-s.player.x),near=Math.max(0,1-distance/900);if(['ember-breath','fort-breath'].includes(q.kind))intensity=Math.max(intensity,near);else if(q.source==='forest')intensity=Math.max(intensity,near*.22);}
 return intensity>.015?{intensity}:null;
}
function noiseBuffer(ctx,seconds){const b=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*seconds),ctx.sampleRate),d=b.getChannelData(0);let smooth=0;for(let i=0;i<d.length;i++){const n=Math.random()*2-1;smooth=.96*smooth+.04*n;d[i]=n*.55+smooth*3;}return b;}
export function createEmberVoice(ctx,destination){
 const src=ctx.createBufferSource(),low=ctx.createBiquadFilter(),gain=ctx.createGain(),lfo=ctx.createOscillator(),pulse=ctx.createGain();
 src.buffer=noiseBuffer(ctx,2.73);src.loop=true;low.type='lowpass';low.frequency.value=1900;low.Q.value=.7;gain.gain.value=0;lfo.frequency.value=13;pulse.gain.value=.012;
 src.connect(low);low.connect(gain);gain.connect(destination);lfo.connect(pulse);pulse.connect(gain.gain);src.start();lfo.start();let stopped=false;
 return{update({intensity}){if(stopped)return;gain.gain.setTargetAtTime(.055+intensity*.17,ctx.currentTime,.06);low.frequency.setTargetAtTime(700+intensity*1900,ctx.currentTime,.08);},stop(){if(stopped)return;stopped=true;gain.gain.cancelScheduledValues(ctx.currentTime);gain.gain.setTargetAtTime(0,ctx.currentTime,.02);pulse.gain.setTargetAtTime(0,ctx.currentTime,.02);src.stop(ctx.currentTime+.18);lfo.stop(ctx.currentTime+.18);src.onended=()=>{src.disconnect();low.disconnect();gain.disconnect();lfo.disconnect();pulse.disconnect();};}};
}
export function playEmberSound(ctx,destination,kind,at){
 const sounds={emberInhale:[.5,.08,600],emberBreath:[.38,.16,2300],emberIgnite:[.65,.18,3000],emberImpact:[1.1,.26,1600],emberDefeat:[.55,.09,950]};
 const spec=sounds[kind];if(!spec)return false;const [duration,volume,hz]=spec,src=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();src.buffer=noiseBuffer(ctx,duration);filter.type='lowpass';filter.frequency.setValueAtTime(hz,at);filter.frequency.exponentialRampToValueAtTime(160,at+duration);gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(volume,at+.025);gain.gain.exponentialRampToValueAtTime(.0001,at+duration);src.connect(filter);filter.connect(gain);gain.connect(destination);src.start(at);src.onended=()=>{src.disconnect();filter.disconnect();gain.disconnect();};return true;
}
