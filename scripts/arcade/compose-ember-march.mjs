import fs from 'node:fs';
// Original 32-bar minor circus march, 6/8, dotted-quarter 108. Rendered locally;
// no samples, external recordings or runtime synthesis needed for the music.
const rate=22050,beat=60/108,bar=beat*3,bars=32,length=Math.round(bars*bar*rate),left=new Float32Array(length),right=new Float32Array(length),tau=Math.PI*2;
let seed=731;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296*2-1;};
const freq=n=>440*2**((n-69)/12);
function note(time,midi,duration,volume,voice,pan=0){
 const f=freq(midi),start=Math.round(time*rate),count=Math.round(duration*rate);
 for(let i=0;i<count;i++){const t=i/rate,u=i/count,attack=Math.min(1,t/(voice==='pad'?.18:.014)),release=Math.min(1,(duration-t)/.16);let v;
  if(voice==='bell')v=(Math.sin(tau*f*t)+.35*Math.sin(tau*f*2.006*t)*Math.exp(-t*5)+.12*Math.sin(tau*f*3.99*t)*Math.exp(-t*7))*Math.exp(-t*3.1);
  else if(voice==='pad')v=(Math.sin(tau*f*t+.008*Math.sin(t*5))+.22*Math.sin(tau*f*2.003*t)+.07*Math.sin(tau*f*3*t))*Math.sin(Math.PI*u)**.5;
  else if(voice==='reed')v=(Math.sin(tau*f*t+.013*Math.sin(t*6))+.3*Math.sin(tau*3*f*t)+.1*Math.sin(tau*5*f*t))*Math.exp(-t*.45);
  else v=(Math.sin(tau*f*t)+.27*Math.sin(tau*f*2*t))*Math.exp(-t*5);
  v*=attack*release*volume;const k=(start+i)%length;left[k]+=v*(1-pan*.5);right[k]+=v*(1+pan*.5);
 }
}
function drum(time,strong){const start=Math.round(time*rate),duration=.32;for(let i=0;i<duration*rate;i++){const t=i/rate,k=(start+i)%length,body=Math.sin(tau*(strong?58:105)*t+4*Math.exp(-t*25))*Math.exp(-t*15),noise=random()*Math.exp(-t*(strong?45:30));const v=(body*.07+noise*(strong?.016:.028));left[k]+=v;right[k]+=v;}}
const chords=[[50,57,62,65],[46,53,58,62],[43,50,58,62],[45,52,57,61]],melody=[[74,77,76,74,69,72],[70,74,77,74,70,69],[67,70,74,77,76,74],[73,76,81,79,76,73]];
for(let b=0;b<bars;b++){
 const chord=chords[Math.floor(b/2)%4],t=b*bar,build=b>=16;
 note(t,chord[0]-12,bar*.95,.055,'bass',-.05);
 for(const [i,n]of chord.entries())note(t+.015*i,n,bar*1.02,.011+(build?.004:0),'pad',(i-1.5)*.35);
 for(let step=0;step<6;step++){const at=t+step*beat/2,n=chord[[0,2,1,3,2,1][step]];note(at,n+12,beat*.46,.024,'bell',step%2?.45:-.45);if(step===0||step===3)drum(at,step===0);else if(build&&step%2===1)drum(at,false);}
 const phrase=melody[Math.floor(b/2)%4];
 if(b%2===0)for(let i=0;i<6;i++)note(t+i*beat/2,phrase[i],beat*(i===5?.9:.44),.036,b<16?'reed':'bell',-.15);
 else for(let i=0;i<3;i++)note(t+i*beat,phrase[5-i*2]-(b>=24?12:0),beat*.8,.029,'reed',.2);
}
// Circular stereo room tails preserve the loop boundary.
for(const [delay,gain]of [[.083,.15],[.173,.1],[.317,.07]]){const shift=Math.round(delay*rate),a=left.slice(),b=right.slice();for(let i=0;i<length;i++){left[(i+shift)%length]+=b[i]*gain;right[(i+shift)%length]+=a[i]*gain;}}
let peak=0;for(let i=0;i<length;i++)peak=Math.max(peak,Math.abs(left[i]),Math.abs(right[i]));const scale=.78/peak;
const wav=Buffer.alloc(44+length*4);wav.write('RIFF');wav.writeUInt32LE(36+length*4,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(2,22);wav.writeUInt32LE(rate,24);wav.writeUInt32LE(rate*4,28);wav.writeUInt16LE(4,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(length*4,40);
for(let i=0;i<length;i++){wav.writeInt16LE(Math.round(left[i]*scale*32767),44+i*4);wav.writeInt16LE(Math.round(right[i]*scale*32767),46+i*4);}
fs.writeFileSync('public/arcade/music/exploration/ember-march.wav',wav);console.log({seconds:length/rate,peak:.78,bytes:wav.length});
