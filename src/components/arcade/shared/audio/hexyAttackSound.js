import {foley,createTextureVoice} from './foleyTexture';
const families={cast:'star',basicStrong:'star',grapeShot:'fire',heavyCast:'fire',bananaShot:'banana',bananaCast:'banana',kiwiShot:'kiwi',kiwiCast:'kiwi',bubbleShot:'bubble',bubbleCast:'bubble',sparkleShot:'star',sparkleCast:'star',aquaShot:'water',aquaCast:'water',jellyShot:'jelly',jellyCast:'jelly',prismShot:'glass',prismCast:'glass',echoPulse:'echo',echoCast:'echo',voltShot:'electric',voltPulse:'electric',voltCast:'electric',electricDefeat:'electric',honeyDrop:'honey',honeyCast:'honey',orbitShot:'orbit',orbitCast:'orbit',ribbonShot:'silk',ribbonCast:'silk',ribbonSnap:'silk',ribbonSpin:'silk'};
export const HEXY_ATTACK_EVENTS=Object.keys(families);
export function playHexyAttackSound(ctx,out,kind,now=ctx.currentTime){
 // Keep the basic wand's revision-11 chime exactly as requested.
 if(kind==='cast'||kind==='basicStrong'){
  const d=kind==='basicStrong'?.3:.14,gain=kind==='basicStrong'?.065:.031;
  [1050,1570,2090].forEach((hz,i)=>{
   const o=ctx.createOscillator(),g=ctx.createGain(),at=now+i*.02;o.type='sine';o.frequency.setValueAtTime(hz,at);o.frequency.exponentialRampToValueAtTime(hz*.65,at+d);
   g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(gain/(i+1),at+.006);g.gain.exponentialRampToValueAtTime(.0001,at+d);o.connect(g);g.connect(out);o.start(at);o.stop(at+d+.02);o.onended=()=>{o.disconnect();g.disconnect();};
  });return true;
 }
 const family=families[kind];if(!family)return false;
 const strong=/Cast|Strong|Defeat/.test(kind),power=kind==='voltPulse'?.45:1,d=strong?.48:.22,g=(strong?.16:.095)*power,f=foley(ctx,out,now,{space:strong?.28:.14});
 switch(family){
  case 'electric':f.air(d,g*1.6,3400,1800,0,'grit');f.air(d*.8,g*.8,1300,650,0,'breath');f.grit(strong?9:4,g*1.5,5100,.022);f.body(94,42,d,g*.6);break;
  case 'fire':f.air(d,g*1.8,1100,180,0,'breath');f.air(d*.4,g,3400,800);f.body(100,32,d,g*.65);f.grit(4,g*.5,2400);break;
  case 'banana':f.air(d,g,1700,480,0,'breath',.025);f.air(d*.6,g*.6,600,1800,.04,'air',.02);f.body(140,70,.09,g*.25);break;
  case 'kiwi':f.air(d,g*1.5,2700,600,0,'grit');f.grit(strong?7:4,g*1.2,2800);f.body(145,65,.12,g*.4);break;
  case 'bubble':case 'jelly':f.air(d,g,950,210,0,'breath',.018);f.body(family==='bubble'?280:175,70,.095,g*.65);f.body(480,130,.06,g*.3,.07);f.grit(3,g*.55,1600,.022);break;
  case 'water':f.air(d*1.5,g*1.8,3200,750,0,'breath',.02);f.air(d*.5,g,680,1300,.03,'air');f.grit(6,g*.4,4200,.033);break;
  case 'glass':f.air(.07,g,5700,3100);for(const [i,hz] of [1720,2870,4123].entries())f.body(hz,hz*.994,d*(1+i*.2),g*.12/(i+1),i*.013);f.grit(5,g*.7,4100,.04);break;
  case 'echo':for(let i=0;i<3;i++){f.air(d,g/(1+i*.8),650,180,i*.09,'breath');f.body(100,45,d,g*.4/(i+1),i*.09);}break;
  case 'honey':f.air(d,g,540,170,0,'breath',.025);f.body(170,55,.13,g*.7);f.body(320,90,.055,g*.4,.07);break;
  case 'orbit':f.air(d*1.4,g,2100,650,0,'breath',.035);f.grit(6,g*.55,3800,.029);f.body(2800,2780,d,g*.12);break;
  case 'silk':f.air(d,g*1.5,3800,800,0,'air',.02);f.air(.035,g,6400,2200,.04);f.body(130,45,.08,g*.3);break;
  default:f.air(d,g,3000,700,0,'breath');f.air(.06,g*.7,5500,2600);f.body(1260,1230,.14,g*.1);f.grit(3,g*.35,4800,.028);
 }return true;
}
export function hexyChannelProfile(s){
 if(!s||s.done||s.clear||s.playerDefeat||s.player?.candy)return null;
 if(s.voltBeam?.segments?.length)return{kind:'electric',force:s.voltBeam.strength||0};
 if(s.aquaJet?.points?.length)return{kind:'water',force:.7};return null;
}
export function createHexyChannelVoice(ctx,out){
 const v=createTextureVoice(ctx,out);
 return{update(p){const electric=p.kind==='electric';v.update({gain:electric?.085+p.force*.05:.075,frequency:electric?1700+p.force*600:2600,pitch:electric?61:43,crackle:electric?1.9:.18});},stop(){v.stop();}};
}
