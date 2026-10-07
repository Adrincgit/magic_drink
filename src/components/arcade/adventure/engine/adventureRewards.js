import {superCapacity} from './adventureMods';
export const SUPER_RECHARGE=80;
export const STAR_VALUE=1;
export function collectAdventureStar(s,star){
 if(star.taken||star.hidden)return false;
 star.taken=true;if(star.id)(s.pendingStars??=[]).push(star.id);s.starMoney=(s.starMoney||0)+(star.value||STAR_VALUE);s.starPulse=.55;s.events.push('coin');
 return true;
}
export function tickRewards(s,dt){
 s.superCooldown=Math.max(0,(s.superCooldown||0)-dt);
 if(superCapacity(s)>1&&!s.superReserve){s.reserveCooldown=Math.max(0,(s.reserveCooldown||0)-dt);if(!s.reserveCooldown)s.superReserve=1;}
 s.starPulse=Math.max(0,(s.starPulse||0)-dt);
}
