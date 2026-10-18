const profiles=[
 {key:'village-villagers-v1',base:0,size:132,w:50,h:90,stride:120},
 {key:'village-villagers-v1',base:12,size:132,w:50,h:90,stride:120},
 {key:'village-children-v2',base:0,size:96,w:36,h:65,stride:94,child:true},
 {key:'village-children-v2',base:12,size:96,w:36,h:65,stride:94,child:true},
 {key:'village-elders-v2',base:0,size:132,w:46,h:94,stride:126},
 {key:'village-elders-v2',base:12,size:128,w:54,h:87,stride:116},
 {key:'village-neighbors-v2',base:0,size:140,w:60,h:96,stride:132},
 {key:'village-neighbors-v2',base:12,size:134,w:48,h:94,stride:122},
];
profiles.forEach((p,i)=>{p.actionKey='village-'+['adults','children','elders','neighbors'][Math.floor(i/2)]+'-v4';p.runKey=p.actionKey.replace('village-','village-run-').replace('-v4','-v7');p.runBase=i%2*8;p.runDuration=.78+i*.012;p.stride*=1.22;});
for(const [i,name] of [[0,'baker'],[6,'blacksmith']])Object.assign(profiles[i],{runKey:'village-'+name+'-run-v8',runBase:0,defendKey:'village-'+name+'-throw-v8'});
profiles[0].throwTip=[242,82];profiles[6].throwTip=[244,100];
Object.assign(profiles[6],{runKey:'village-blacksmith-run-v9',runFrames:12,runByDistance:true,runFlip:true});
export const villageVillagerProfile=style=>profiles[style]||profiles[0];
// The blacksmith's two alternating steps follow actual travel, including stops.
export const villageVillagerRunPhase=npc=>{const p=villageVillagerProfile(npc.style);return p.runByDistance?(npc.gait||0):(npc.runAge||0)/p.runDuration;};
export const villageVillagerRunFrame=(npc,reduced=false)=>{const p=villageVillagerProfile(npc.style),frames=p.runFrames||8;return p.runBase+(reduced?0:Math.floor(villageVillagerRunPhase(npc)*frames)%frames);};
export function villageVillagerBody(npc,padding=0){const p=villageVillagerProfile(npc.style),h=p.h*(npc.state==='hiding'?.8:1);return{x:npc.x-p.w/2-padding,y:npc.y-h-padding,w:p.w+padding*2,h:h+padding*2};}
