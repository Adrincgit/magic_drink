import {pumpkinId,releaseVillageVictim} from './villagePumpkins';
export const VILLAGE_CANDY_SECONDS=30;
export function stepVillageCandyTimeout(s,n,dt){
 if(!['turning','candy','absorbing','absorbed','carried'].includes(n.state)){delete n.curseAge;return false;}
 n.curseAge=(n.curseAge||0)+dt;if(n.curseAge<VILLAGE_CANDY_SECONDS)return false;
 const container=s.enemies.find(e=>e.type===27&&pumpkinId(e)===n.curseOwner);
 if(container?.carriedId===n.id)container.carriedId=null;
 for(const witch of s.enemies)if(witch.type===26&&witch.phase==='absorb'&&witch.absorbId===n.id){witch.phase='recover';witch.phaseAge=0;witch.timer=1.2;delete witch.absorbId;}
 releaseVillageVictim(s,n,container?.x??n.candyHomeX??n.x);delete n.curseAge;n.autoReleased=true;return true;
}
