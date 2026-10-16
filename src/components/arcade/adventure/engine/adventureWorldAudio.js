// Simulation emits one spatial event at an action's commitment/impact, never
// every animation tick. Far-away activity must not drown the visible combat.
export function worldSound(s,kind,x,y,actor){
 const dx=x-s.player.x,distance=Math.hypot(dx,(y??s.player.y)-(s.player.y-45));
 if(distance>1100)return;
 s.events.push({kind,pan:Math.max(-.85,Math.min(.85,dx/600)),gain:Math.max(.08,1-distance/1150),...(actor?{actor}:{})});
}
export function creatureDeathSound(s,e){
 if(e.deathVoicePlayed)return false;
 const kind=[25,27].includes(e.type)?'pumpkinDeath':[18,21].includes(e.type)?'zombieDeath':null;
 if(!kind)return false;e.deathVoicePlayed=true;worldSound(s,kind,e.x,e.y);return true;
}
export function stepCreatureVoice(s,e,dt){
 if(![18,21,25].includes(e.type)||e.hp<=0||!e.active||e.hidden||e.fleeing||e.trap>0||e.emerging>0||Math.abs(e.x-s.player.x)>550)return;
 const seed=Math.abs(e.spawnSeed||0);
 e.voiceWait=(e.voiceWait??(.6+seed%7*.31))-dt;
 if(e.voiceWait>0||(s.time||0)<(s.nextCreatureVoice||0))return;
 worldSound(s,'zombieGroan',e.x,e.y,e);e.voiceWait=4.8+seed%5*.6;s.nextCreatureVoice=(s.time||0)+1.25;
}
export function enemyCastSound(s,kind,x,y){
 const sound={'act-two-straw':'stoneThrow','act-two-orb':'witchRay','act-two-mask':'witchRay','act-two-bat':'soulCast','candy-ray':'witchRay','witch-drop':'witchDrop','lantern-soul':'soulCast','soul-flame':'soulCast'}[kind];
 if(!sound)return;
 // A fan is one launch, not three superimposed copies of the same sound.
 const key=sound+':'+Math.round(x)+':'+Math.round(y),at=s.time||0;
 if(s.lastWorldCast?.key===key&&s.lastWorldCast.time===at)return;
 s.lastWorldCast={key,time:at};worldSound(s,sound,x,y);
}
