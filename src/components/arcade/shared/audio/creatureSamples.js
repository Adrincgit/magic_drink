// Edited recordings, shared by ground pumpkins, flying pumpkins and graveyard zombies.
// Hexy's attack synthesis is deliberately independent of this bank.
export const CREATURE_CUES={
 soulCast:{files:['soul-flame-1','soul-flame-2'],gain:.54,limit:3,cooldown:.1},
 pumpkinDeath:{files:['pumpkin-death-1','pumpkin-death-2'],vocal:['zombie-death-3','zombie-death-2'],vocalGain:.216,gain:.6,limit:3,cooldown:.06},
 pumpkinBreak:{files:['pumpkin-land'],gain:.42,limit:2,cooldown:.08},
 witchAbsorb:{files:['witch-laugh-1','witch-laugh-2'],voice:true,gain:.252,limit:2,cooldown:.45},
 pumpkinBirth:{files:['pumpkin-conjure'],gain:.6,limit:2,cooldown:.15},
 zombieDeath:{files:['zombie-death-1','zombie-death-2','zombie-death-3'],voice:true,gain:.24,limit:3,cooldown:.06},
 zombieGroan:{files:['zombie-groan-1','zombie-groan-2','zombie-groan-3'],voice:true,gain:.144,limit:2,cooldown:1.1},
};
const files=[...new Set(Object.values(CREATURE_CUES).flatMap(q=>q.files))];
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,Number.isFinite(v)?v:0));
export function createCreaturePlayer(ctx,out,voiceOut=out){
 const buffers=new Map(),voices=new Set(),last=new Map(),serial=new Map();let loading;
 function preload(){
  return loading??=(async()=>{
   const failures=[];
   await Promise.all(files.map(async name=>{try{
    const response=await fetch('/arcade/audio/creatures/'+name+'.wav');if(!response.ok)throw Error(String(response.status));
    buffers.set(name,await ctx.decodeAudioData(await response.arrayBuffer()));
   }catch{failures.push(name);}}));
   return{loaded:buffers.size,failures};
  })();
 }
 function stop(v){
  if(!voices.delete(v))return;
  const at=ctx.currentTime;for(const node of v.nodes){node.gain.gain.cancelScheduledValues(at);node.gain.gain.setTargetAtTime(0,at,.008);node.source.stop(at+.04);}
 }
 function play(kind,at=ctx.currentTime,placement={}){
  const cue=CREATURE_CUES[kind];if(!cue)return false;
  const count=serial.get(kind)||0,name=cue.files[count%cue.files.length],buffer=buffers.get(name);
  if(!buffer)return false; // Existing procedural fallback still works if an asset cannot load.
  const active=[...voices].filter(v=>v.end>at),same=active.filter(v=>v.kind===kind);
  if(at-(last.get(kind)??-99)<cue.cooldown||same.length>=cue.limit||same.some(v=>placement.actor&&v.actor===placement.actor))return true;
  if(active.length>=10){const ambient=active.find(v=>v.kind==='zombieGroan');if(ambient)stop(ambient);else return true;}
  serial.set(kind,count+1);last.set(kind,at);
  const voice={kind,actor:placement.actor,end:at+buffer.duration,nodes:[]};voices.add(voice);
  function start(buffer,level,output){
   const source=ctx.createBufferSource(),gain=ctx.createGain(),pan=ctx.createStereoPanner();source.buffer=buffer;
   gain.gain.value=level*clamp(placement.gain??1,0,1);pan.pan.value=clamp(placement.pan??0,-.85,.85);
   source.connect(gain);gain.connect(pan);pan.connect(output);const node={source,gain,pan};voice.nodes.push(node);voice.end=Math.max(voice.end,at+buffer.duration);
   source.onended=()=>{voice.nodes=voice.nodes.filter(n=>n!==node);if(!voice.nodes.length)voices.delete(voice);source.disconnect();gain.disconnect();pan.disconnect();};source.start(at);
  }
  start(buffer,cue.gain,cue.voice?voiceOut:out);
  const vocal=cue.vocal&&buffers.get(cue.vocal[count%cue.vocal.length]);if(vocal)start(vocal,cue.vocalGain,voiceOut);
  return true;
 }
 function stopAll(){for(const voice of [...voices])stop(voice);last.clear();}
 function sync(s,enabled=true){
  if(!enabled||!s||s.done||s.clear||s.playerDefeat){stopAll();return;}
  for(const voice of [...voices]){
   const e=voice.actor;if(!e)continue;
   const alive=e.hp>0&&(s.enemies||[]).includes(e);
   if(voice.kind==='witchAbsorb'&&(!alive||!['absorb','absorb-player'].includes(e.phase))||voice.kind==='zombieGroan'&&(!alive||e.hidden||e.fleeing||e.trap>0))stop(voice);
  }
 }
 return{preload,play,sync,stopAll};
}
