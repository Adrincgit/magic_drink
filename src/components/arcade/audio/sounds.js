let context,master,muted=false,volume=1;const last=new Map();
const outputGain=()=>muted?0:.7*volume;
export function unlockArcadeAudio(){
 if(typeof window==='undefined')return;
 try{context ||= new (window.AudioContext||window.webkitAudioContext)();if(!master){master=context.createGain();master.gain.value=outputGain();master.connect(context.destination);}if(context.state==='suspended')void context.resume();}catch{}
}
export function muteArcadeSounds(value){muted=!!value;if(master)master.gain.setTargetAtTime(outputGain(),context.currentTime,.025);}
export function setArcadeSoundsVolume(general=1,effects=1){
 const clamp=n=>Number.isFinite(n)?Math.max(0,Math.min(1,n)):1;
 volume=clamp(general)*clamp(effects);if(master)master.gain.setTargetAtTime(outputGain(),context.currentTime,.025);
}
export function arcadeSound(kind,enabled=true){
 if(!enabled||typeof window==='undefined')return;unlockArcadeAudio();if(!context||!master)return;
 const now=context.currentTime;if(now-(last.get(kind)??-10)<(kind==='bossHit'?.09:.035))return;last.set(kind,now);
 const tone=(from,to,duration,type='square',gain=.06,delay=0)=>{
  const osc=context.createOscillator(),volume=context.createGain(),at=now+delay;
  osc.type=type;osc.frequency.setValueAtTime(from,at);osc.frequency.exponentialRampToValueAtTime(Math.max(20,to),at+duration);
  volume.gain.setValueAtTime(0,at);volume.gain.linearRampToValueAtTime(gain,at+.005);volume.gain.exponentialRampToValueAtTime(.0001,at+duration);
  osc.connect(volume);volume.connect(master);osc.start(at);osc.stop(at+duration+.015);
 };
 const noise=(duration,gain=.045)=>{
  const buffer=context.createBuffer(1,Math.ceil(context.sampleRate*duration),context.sampleRate),data=buffer.getChannelData(0);
  for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*(1-i/data.length);
  const src=context.createBufferSource(),volume=context.createGain();src.buffer=buffer;volume.gain.value=gain;src.connect(volume);volume.connect(master);src.start(now);
 };
 switch(kind){
  case 'cast':tone(1150,410,.095,'square',.025);tone(1900,1400,.06,'sine',.03,.012);break;
  case 'basicStrong':tone(784,260,.19,'triangle',.075);tone(1568,784,.12,'square',.025);noise(.07,.025);break;
  case 'originalDrink':noise(.08,.025);[523,659,784,1047].forEach((hz,i)=>tone(hz,hz*1.1,.18,'triangle',.05,.12+i*.08));break;
  case 'dash':noise(.15,.065);tone(430,105,.16,'triangle',.065);break;
  case 'jump':tone(260,890,.18,'square',.038);break;
  case 'doubleJump':tone(523,1568,.2,'triangle',.065);tone(784,2093,.18,'square',.025,.04);break;
  case 'glide':noise(.18,.025);tone(1047,784,.3,'sine',.035);break;
  case 'hit':noise(.14,.055);tone(185,55,.25,'sawtooth',.04);break;
  case 'death':tone(430,65,.6,'triangle',.07);noise(.23,.04);break;
  case 'bossHit':noise(.055,.07);tone(190,48,.16,'triangle',.14);tone(960,280,.065,'square',.045);break;
  case 'bossHeavyHit':noise(.17,.09);tone(145,32,.3,'sine',.19);tone(520,80,.19,'sawtooth',.05);tone(1047,523,.12,'triangle',.045,.035);break;
  case 'bossBlock':tone(1700,950,.055,'sine',.03);break;
  case 'charge':tone(180,760,.48,'triangle',.035);break;
  case 'superCharge':[262,330,392,523,659,784].forEach((hz,i)=>tone(hz,hz*1.2,.2,'triangle',.032,i*.15));break;
  case 'superCast':noise(.3,.065);tone(98,32,.55,'sine',.12);[523,659,784,1047,1568].forEach((hz,i)=>tone(hz,hz*1.5,.3,'triangle',.045,i*.035));break;
  case 'superPulse':tone(130,65,.22,'sine',.06);tone(1568,2093,.15,'triangle',.026);noise(.11,.025);break;
  case 'charged':tone(784,784,.12,'triangle',.045);tone(1175,1568,.18,'triangle',.045,.08);break;
  case 'heavyCast':noise(.16,.055);tone(480,70,.27,'sawtooth',.055);tone(130,38,.3,'sine',.1);break;
  case 'bananaCast':tone(660,220,.23,'triangle',.065);tone(990,330,.28,'square',.025,.035);break;
  case 'kiwiCast':noise(.32,.035);tone(330,1320,.3,'triangle',.045);tone(440,880,.2,'sine',.03,.07);break;
  case 'bubbleCast':tone(220,880,.14,'sine',.075);tone(440,1320,.17,'sine',.05,.11);break;
  case 'bubbleBurst':noise(.09,.04);tone(740,140,.2,'sine',.09);break;
  case 'bubbleBlock':tone(980,360,.09,'sine',.035);break;
  case 'sparkleCast':[784,988,1175,1568,1976].forEach((hz,i)=>tone(hz,hz*.85,.14,'triangle',.037,i*.04));break;
  case 'cannon':noise(.18,.08);tone(110,38,.2,'sine',.10);break;
  case 'impact':noise(.2,.05);tone(80,35,.2,'sine',.09);break;
  case 'warning':tone(440,440,.14,'square',.025);tone(440,440,.14,'square',.025,.22);break;
  case 'land':tone(85,45,.045,'triangle',.018);break;
  case 'guardRaise':tone(330,990,.18,'triangle',.045);break;
  case 'guardBlock':tone(1568,784,.1,'triangle',.065);noise(.035,.03);break;
  case 'guardBreak':tone(784,98,.32,'triangle',.065);noise(.17,.04);break;
  case 'bulletClear':tone(1175,2350,.08,'sine',.025);noise(.04,.025);break;
  case 'towerTransform':noise(.55,.075);tone(90,35,.6,'sawtooth',.08);tone(220,110,.5,'triangle',.055,.15);break;
  case 'shield':tone(1500,220,.28,'sine',.06);break;
  default:{
   const notes={coin:[784,1568],power:[523,659,784,1047],rescue:[659,784,1047],pop:[1047,1568],boss:[196,247,294],bossDown:[523,659,784,1047],win:[523,659,784,1047],start:[392,523,784]}[kind];
   notes?.forEach((hz,i)=>tone(hz,hz,.17,'triangle',.06,i*.065));
  }
 }
}
