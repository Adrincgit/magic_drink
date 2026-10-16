import {playHexyAttackSound,hexyChannelProfile,createHexyChannelVoice} from './hexyAttackSound';
import {playWorldCombatSound,villageChannelProfile,createVillageVoice} from './worldCombatSound';
import {createEffectsBus} from './effectsBus';
import {createCreaturePlayer} from './creatureSamples';
import {playPopcornSound} from './popcornSound';
import {playEncoreSound} from './encoreSound';
import {playPowerClashSound} from './powerClashSound';
import {adventureEnergyProfile,createEnergyVoice} from './energyVoice';
import {emberAudioProfile,createEmberVoice,playEmberSound} from './emberVoice';
export {EFFECTS_BOOST} from './effectsBus';
let context,master,voiceMaster,effectsInput,creaturePlayer,energyVoice,emberVoice,hexyVoice,villageVoice,muted=false,volume=1,generalVolume=1,voiceVolume=.6;const last=new Map();
// The user's controls follow compression, so zero and mute remain absolute
// and changing volume does not change the balance between quiet/loud effects.
const outputGain=()=>muted?0:.7*volume;
const outputVoiceGain=()=>muted?0:.7*generalVolume*voiceVolume;
export function unlockArcadeAudio(){
 if(typeof window==='undefined')return;
 try{context ||= new (window.AudioContext||window.webkitAudioContext)();if(!master){master=context.createGain();master.gain.value=outputGain();master.connect(context.destination);effectsInput=createEffectsBus(context,master);voiceMaster=context.createGain();voiceMaster.gain.value=outputVoiceGain();voiceMaster.connect(context.destination);creaturePlayer=createCreaturePlayer(context,effectsInput,createEffectsBus(context,voiceMaster));void creaturePlayer.preload();}if(context.state==='suspended')void context.resume();}catch{}
}
export function muteArcadeSounds(value){muted=!!value;if(master)master.gain.setTargetAtTime(outputGain(),context.currentTime,.025);if(voiceMaster)voiceMaster.gain.setTargetAtTime(outputVoiceGain(),context.currentTime,.025);}
export function setArcadeSoundsVolume(general=1,effects=1,voices=.6){
 const clamp=n=>Number.isFinite(n)?Math.max(0,Math.min(1,n)):1;
 generalVolume=clamp(general);voiceVolume=clamp(voices);volume=generalVolume*clamp(effects);if(master)master.gain.setTargetAtTime(outputGain(),context.currentTime,.025);if(voiceMaster)voiceMaster.gain.setTargetAtTime(outputVoiceGain(),context.currentTime,.025);
}
export function stopArcadeEnergy(atImpact=false){creaturePlayer?.stopAll();villageVoice?.stop();villageVoice=null;hexyVoice?.stop();hexyVoice=null;energyVoice?.stop(atImpact);energyVoice=null;emberVoice?.stop();emberVoice=null;}
export function syncArcadeEnergy(s,enabled=true){
 creaturePlayer?.sync(s,enabled);
 const village=enabled?villageChannelProfile(s):null;
 if(village){unlockArcadeAudio();if(context&&effectsInput){villageVoice??=createVillageVoice(context,effectsInput);villageVoice.update(village);}}else{villageVoice?.stop();villageVoice=null;}
 const hexy=enabled?hexyChannelProfile(s):null;
 if(hexy){unlockArcadeAudio();if(context&&effectsInput){hexyVoice??=createHexyChannelVoice(context,effectsInput);hexyVoice.update(hexy);}}else{hexyVoice?.stop();hexyVoice=null;}
 const fire=enabled?emberAudioProfile(s):null;
 if(fire){unlockArcadeAudio();if(context&&effectsInput){emberVoice??=createEmberVoice(context,effectsInput);emberVoice.update(fire);}}
 else{emberVoice?.stop();emberVoice=null;}
 const profile=enabled?adventureEnergyProfile(s):null;
 if(!profile){energyVoice?.stop();energyVoice=null;return;}
 unlockArcadeAudio();if(!context||!effectsInput)return;
 energyVoice??=createEnergyVoice(context,effectsInput);energyVoice.update(profile);
}
export function arcadeSound(event,enabled=true){
 if(!enabled||typeof window==='undefined')return;unlockArcadeAudio();if(!context||!master)return;
 const kind=typeof event==='string'?event:event.kind,spatial=typeof event==='object',now=context.currentTime;
 if(now-(last.get(kind)??-10)<(spatial?.085:kind==='bossHit'?.09:.035))return;
 if(spatial&&/Cast|Ray|Drop|Hit|Throw|Impact/.test(kind)&&now-(last.get('world-bus')??-10)<.025)return;
 last.set(kind,now);if(spatial)last.set('world-bus',now);
 if(kind==='clashExplosion')stopArcadeEnergy(true);
 else energyVoice?.accent(kind);
 if(playEncoreSound(context,effectsInput,kind,now))return;
 if(playEmberSound(context,effectsInput,kind,now))return;
 if(playPowerClashSound(context,effectsInput,kind,now))return;
 if(playPopcornSound(context,effectsInput,kind,now))return;
 if(creaturePlayer?.play(kind,now,spatial?event:{}))return;
 if(playWorldCombatSound(context,effectsInput,kind,now,spatial?event:{}))return;
 if(playHexyAttackSound(context,effectsInput,kind,now))return;
 const tone=(from,to,duration,type='square',gain=.06,delay=0)=>{
  const osc=context.createOscillator(),volume=context.createGain(),at=now+delay;
  osc.type=type;osc.frequency.setValueAtTime(from,at);osc.frequency.exponentialRampToValueAtTime(Math.max(20,to),at+duration);
  volume.gain.setValueAtTime(0,at);volume.gain.linearRampToValueAtTime(gain,at+.005);volume.gain.exponentialRampToValueAtTime(.0001,at+duration);
  osc.connect(volume);volume.connect(effectsInput);osc.start(at);osc.stop(at+duration+.015);
 };
 const noise=(duration,gain=.045)=>{
  const buffer=context.createBuffer(1,Math.ceil(context.sampleRate*duration),context.sampleRate),data=buffer.getChannelData(0);
  for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*(1-i/data.length);
  const src=context.createBufferSource(),volume=context.createGain();src.buffer=buffer;volume.gain.value=gain;src.connect(volume);volume.connect(effectsInput);src.start(now);
 };
 switch(kind){
  case 'treeCreak':noise(.45,.04);tone(165,63,.7,'sawtooth',.022);tone(230,96,.5,'triangle',.022,.3);break;
  case 'treeFall':noise(.65,.045);tone(180,38,.8,'triangle',.025);break;
  case 'treeLand':noise(.25,.06);tone(72,25,.4,'sine',.1);break;
  case 'treasureCoin':
   [1047,1319,1568,2093].forEach((hz,i)=>{tone(hz,hz,.38,'sine',.065,i*.065);tone(hz*2,hz*1.998,.21,'sine',.017,i*.065);});
   tone(523,1047,.22,'triangle',.032);break;
  case 'harlequinReady':[622,932].forEach((hz,i)=>tone(hz,hz*.98,.18,'triangle',.065,i*.13));break;
  case 'harlequinCast':noise(.065,.037);tone(1245,740,.16,'triangle',.065);tone(2489,1865,.12,'sine',.035);break;
  case 'harlequinSilk':noise(.2,.05);tone(415,104,.25,'triangle',.065);break;
  case 'harlequinRush':noise(.28,.065);tone(466,117,.27,'triangle',.075);break;
  case 'harlequinLeap':tone(233,932,.32,'triangle',.06);tone(932,1245,.24,'sine',.035,.08);break;
  case 'harlequinLand':noise(.1,.055);tone(110,42,.23,'sine',.12);break;
  case 'harlequinPhase':[311,466,622,932].forEach((hz,i)=>tone(hz,hz*1.06,.38,'triangle',.058,i*.11));noise(.35,.045);break;
  case 'bargeReady':tone(130,110,.12,'triangle',.055);tone(175,150,.13,'triangle',.045,.12);break;
  case 'bargeBeat':tone(105,46,.48,'sine',.16);tone(164,92,.32,'sine',.07);tone(241,146,.21,'triangle',.026);noise(.09,.045);tone(70,42,.36,'sine',.045,.075);break;
  case 'bargePump':tone(82,146,.19,'triangle',.04);tone(310,150,.12,'sine',.032);noise(.12,.018);break;
  case 'bargeTankBreak':noise(.38,.065);[1800,1350,860].forEach((hz,i)=>tone(hz,hz*.45,.25,'triangle',.026,i*.045));tone(125,40,.46,'sine',.11);break;
  case 'bargeDrumBreak':noise(.24,.062);tone(95,28,.55,'sine',.14);tone(150,42,.23,'triangle',.035);break;
  case 'bargePressureJam':noise(.45,.06);tone(330,65,.55,'triangle',.045);tone(92,36,.4,'sine',.1);break;
  case 'hitWater':noise(.19,.038);tone(510,135,.18,'sine',.047);tone(780,320,.12,'sine',.022,.04);break;
  case 'hitFire':noise(.29,.047);tone(160,52,.2,'triangle',.035);break;
  case 'hitSound':tone(100,42,.35,'sine',.1);tone(880,660,.26,'sine',.017,.025);noise(.065,.026);break;
  case 'hitLanding':tone(94,36,.15,'sine',.07);noise(.09,.035);break;
  case 'bargeCannon':tone(92,29,.35,'sine',.14);noise(.13,.065);tone(350,105,.21,'triangle',.035);break;
  case 'bargeSplash':noise(.23,.036);tone(420,145,.23,'sine',.026);tone(740,280,.16,'sine',.018,.07);break;
  case 'bargeRev':tone(82,190,1.2,'triangle',.048);tone(164,380,1.1,'sawtooth',.013);noise(.18,.022);break;
  case 'bargeBreak':noise(.34,.073);tone(180,48,.38,'triangle',.088);[932,622,466].forEach((hz,i)=>tone(hz,hz*.8,.22,'sine',.038,i*.09));break;
  case 'bargeDestroy':noise(.8,.11);tone(85,26,.9,'sine',.16);[466,349,233,116].forEach((hz,i)=>tone(hz,hz*.7,.25,'triangle',.043,i*.16));break;
  case 'diverThrow':tone(680,260,.15,'sine',.057);tone(1320,680,.12,'triangle',.022);noise(.05,.016);break;
  case 'bargeJet':noise(1.65,.038);tone(120,65,1.55,'sine',.055);[0,.4,.8,1.2].forEach(t=>tone(730,310,.36,'triangle',.016,t));break;
  case 'pause':[784,659,523].forEach((hz,i)=>tone(hz,hz,.2,'triangle',.09,i*.08));break;
  case 'resume':[523,659,784].forEach((hz,i)=>tone(hz,hz,.17,'triangle',.075,i*.07));break;
  case 'doorOpen':noise(.12,.035);tone(165,245,.38,'triangle',.06);tone(1175,1175,.65,'sine',.09,.14);tone(1568,1568,.5,'sine',.05,.23);break;
  case 'doorClose':tone(220,95,.22,'triangle',.07);noise(.16,.06);tone(1175,1175,.6,'sine',.065,.12);tone(784,784,.5,'sine',.045,.2);break;
  case 'cast':tone(1150,410,.095,'square',.025);tone(1900,1400,.06,'sine',.03,.012);break;
  case 'basicStrong':tone(784,260,.19,'triangle',.075);tone(1568,784,.12,'square',.025);noise(.07,.025);break;
  case 'originalDrink':noise(.08,.025);[523,659,784,1047].forEach((hz,i)=>tone(hz,hz*1.1,.18,'triangle',.05,.12+i*.08));break;
  case 'ribbonDrink':noise(.08,.022);[659,784,988,1319].forEach((hz,i)=>tone(hz,hz*1.025,.16,'sine',.045,.1+i*.09));break;
  case 'ribbonFade':tone(988,659,.23,'sine',.025);break;
  case 'dash':noise(.15,.065);tone(430,105,.16,'triangle',.065);break;
  case 'jump':tone(260,890,.18,'square',.038);break;
  case 'doubleJump':tone(523,1568,.2,'triangle',.065);tone(784,2093,.18,'square',.025,.04);break;
  case 'glide':noise(.18,.025);tone(1047,784,.3,'sine',.035);break;
  case 'hit':noise(.14,.055);tone(185,55,.25,'sawtooth',.04);break;
  case 'bossHit':noise(.022,.035);tone(2150,1280,.09,'square',.027);tone(3260,2420,.14,'sine',.047);tone(1580,970,.11,'triangle',.047);break;
  case 'bossHeavyHit':noise(.045,.052);tone(1870,1050,.14,'square',.035);tone(2980,1970,.22,'sine',.063);tone(1430,820,.16,'triangle',.061);tone(130,70,.16,'sine',.045);break;
  case 'bossBlock':tone(1700,950,.055,'sine',.03);break;
  case 'bellToll':tone(196,190,.55,'sine',.055);tone(523,510,.48,'sine',.035);tone(831,810,.32,'triangle',.022);break;
  case 'bellSlam':noise(.15,.045);tone(98,73,.6,'sine',.07);tone(311,294,.5,'triangle',.035);break;
  case 'charge':tone(180,760,.48,'triangle',.035);break;
  case 'charged':tone(784,784,.12,'triangle',.045);tone(1175,1568,.18,'triangle',.045,.08);break;
  case 'heavyCast':noise(.16,.055);tone(480,70,.27,'sawtooth',.055);tone(130,38,.3,'sine',.1);break;
  case 'bananaCast':tone(660,220,.23,'triangle',.065);tone(990,330,.28,'square',.025,.035);break;
  case 'kiwiCast':noise(.32,.035);tone(330,1320,.3,'triangle',.045);tone(440,880,.2,'sine',.03,.07);break;
  case 'bubbleCast':tone(220,880,.14,'sine',.075);tone(440,1320,.17,'sine',.05,.11);break;
  case 'aquaShot':tone(510,940,.09,'sine',.035);noise(.07,.016);break;
  case 'jellyShot':tone(340,680,.13,'sine',.05);break;
  case 'voltShot':noise(.06,.025);tone(1450,440,.11,'sawtooth',.025);break;
  case 'voltCast':tone(220,880,.25,'triangle',.045);noise(.13,.03);break;
  case 'voltPulse':tone(920,440,.09,'sawtooth',.022);break;
  case 'honeyDrop':tone(280,130,.12,'sine',.045);break;
  case 'honeyCast':tone(330,500,.3,'triangle',.04);tone(660,1000,.25,'sine',.02,.1);break;
  case 'ribbonShot':noise(.09,.025);tone(400,1100,.14,'triangle',.025);break;
  case 'ribbonCast':noise(.18,.025);tone(280,760,.25,'triangle',.022);break;
  case 'ribbonSnap':noise(.045,.035);tone(1200,420,.07,'triangle',.024);break;
  case 'ribbonSpin':noise(.19,.03);tone(450,980,.24,'triangle',.023);break;
  case 'ribbonHit':noise(.035,.03);tone(280,130,.075,'triangle',.03);break;
  case 'ribbonSlam':noise(.1,.045);tone(700,150,.15,'triangle',.035);break;
  case 'ribbonGroundImpact':noise(.12,.05);tone(130,45,.19,'triangle',.045);break;
  case 'ribbonSmashHit':noise(.07,.045);tone(170,65,.13,'triangle',.04);break;
  case 'ribbonParry':tone(900,1550,.09,'sine',.025);break;
  case 'coasterOpen':[523,659,784].forEach((hz,i)=>tone(hz,hz,.2,'sine',.035,i*.04));break;
  case 'umbrellaClose':noise(.08,.02);tone(220,150,.08,'triangle',.02);break;
  case 'umbrellaBlock':tone(740,280,.1,'triangle',.03);break;
  case 'orbitShot':tone(640,1080,.16,'sine',.025);break;
  case 'orbitCast':[440,660,880].forEach((hz,i)=>tone(hz,hz*1.2,.23,'triangle',.03,i*.05));break;
  case 'orbitBlock':tone(1200,620,.14,'sine',.04);break;
  case 'jellyCast':tone(180,760,.25,'sine',.065);tone(440,220,.18,'triangle',.03,.13);break;
  case 'springBounce':
  case 'jellyBounce':tone(160,610,.17,'sine',.04);break;
  case 'prismShot':tone(1800,2400,.08,'sine',.027);break;
  case 'prismCast':[660,990,1320].forEach((hz,i)=>tone(hz,hz,.23,'triangle',.03,i*.06));break;
  case 'prismReflect':tone(1320,1980,.12,'sine',.03);break;
  case 'echoPulse':tone(390,290,.16,'sine',.045);tone(780,580,.22,'sine',.016,.05);break;
  case 'echoCast':[523,659,784].forEach((hz,i)=>tone(hz,hz,.23,'triangle',.03,i*.12));break;
  case 'aquaCast':noise(.28,.045);tone(180,630,.23,'sine',.06);tone(740,320,.2,'triangle',.035,.06);break;
  case 'aquaSplash':noise(.12,.018);tone(880,340,.12,'sine',.023);break;
  case 'bubbleBurst':noise(.09,.04);tone(740,140,.2,'sine',.09);break;
  case 'bubbleBlock':tone(980,360,.09,'sine',.035);break;
  case 'sparkleCast':[784,988,1175,1568,1976].forEach((hz,i)=>tone(hz,hz*.85,.14,'triangle',.037,i*.04));break;
  case 'cannon':noise(.18,.08);tone(110,38,.2,'sine',.10);break;
  case 'organNotes':
  case 'organNotesHigh':{
   const notes=kind==='organNotes'?[523.25,659.25,783.99]:[587.33,739.99,880];
   notes.forEach((hz,i)=>{tone(hz,hz,.28,'triangle',.052,i*.045);tone(hz*2,hz*2,.17,'sine',.016,i*.045);});break;
  }
  case 'organSteam':noise(.28,.026);tone(165,110,.3,'triangle',.018);break;
  case 'organBreak':noise(.22,.07);tone(180,55,.24,'sawtooth',.055);[1175,830,622].forEach((hz,i)=>tone(hz,hz*.7,.14,'triangle',.028,i*.07));break;
  case 'organDestroy':noise(.62,.095);tone(105,28,.7,'sine',.15);[1047,784,587,392,196].forEach((hz,i)=>tone(hz,hz*.75,.28,'triangle',.045,i*.11));break;
  case 'organBlast':noise(.23,.075);tone(85,28,.28,'sine',.12);tone(330,75,.19,'triangle',.045);break;
  case 'organClatter':noise(.07,.032);[1397,932,622].forEach((hz,i)=>tone(hz,hz*.92,.12,'sine',.027,i*.04));break;
  case 'organFanfare':[146.83,185,220].forEach((hz,i)=>{tone(hz,hz,.36,'triangle',.07,i*.035);tone(hz*2,hz*2,.23,'sawtooth',.011,i*.035);});break;
  case 'organLowWave':tone(98,73.42,.34,'triangle',.085);tone(196,146.83,.27,'sine',.045);noise(.035,.018);break;
  case 'organRev':tone(78,165,.65,'sawtooth',.027);tone(156,330,.65,'triangle',.02);noise(.12,.02);break;
  case 'organCharge':tone(130,85,.4,'sawtooth',.042);tone(260,170,.4,'triangle',.035);noise(.22,.042);break;
  case 'organBrake':noise(.16,.04);tone(740,330,.28,'triangle',.032);break;
  case 'zeppelinShot':tone(620,260,.13,'triangle',.055);noise(.04,.026);break;
  case 'zeppelinBreak':noise(.26,.04);tone(640,190,.25,'triangle',.038);break;
  case 'zeppelinBurst':noise(.29,.07);tone(95,32,.3,'sine',.085);tone(1047,523,.18,'triangle',.035);break;
  case 'zeppelinCrash':noise(.2,.045);tone(140,45,.22,'triangle',.04);break;
  case 'balloonLeak':noise(.55,.055);tone(310,120,.44,'triangle',.025);break;
  case 'hatchOpen':noise(.13,.037);tone(190,75,.16,'triangle',.035);break;
  case 'impact':noise(.2,.05);tone(80,35,.2,'sine',.09);break;
  case 'warning':tone(440,440,.14,'square',.025);tone(440,440,.14,'square',.025,.22);break;
  case 'land':tone(85,45,.045,'triangle',.018);break;
  case 'guardRaise':tone(330,990,.18,'triangle',.045);break;
  case 'drinkSwap':tone(620,930,.08,'triangle',.04);tone(930,620,.1,'sine',.035,.07);break;
  case 'confettiStep':noise(.11,.035);tone(740,1040,.12,'triangle',.035);break;
  case 'confettiPop':noise(.09,.04);break;
  case 'replyBell':tone(1320,1320,.32,'sine',.05);tone(1980,1980,.23,'sine',.025,.02);break;
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
