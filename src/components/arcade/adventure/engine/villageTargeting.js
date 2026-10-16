import {villageVillagerProfile} from '../actors/villageVillagers';
const vulnerable=new Set(['flee','warning','trip','fallen','help','recover','rescue','defend','trapped','hiding']);
export const villageClosestCivilian=(s,e,range)=>(s.villagers||[]).filter(q=>vulnerable.has(q.state)&&Math.abs(q.x-e.x)<range).sort((a,b)=>Math.abs(a.x-e.x)-Math.abs(b.x-e.x))[0];
export function villageTarget(s,e,range=540){
 const villager=villageClosestCivilian(s,e,range);
 const player=!s.player.candy&&!s.done&&Math.abs(s.player.x-e.x)<range?s.player:null;
 // Alternate categories, not individual bodies: a crowd cannot starve Hexy
 // of attacks, and Hexy's presence cannot make the civilians invisible.
 const chooseVillager=villager&&(!player||(e.lastVillageTarget??(e.spawnSeed%2?'villager':'player'))==='player');
 const q=chooseVillager?villager:player||villager;if(!q)return null;
 e.lastVillageTarget=q===s.player?'player':'villager';
 return q;
}
export function villageAim(s,e,target,windup,speed,origin={x:e.x,y:e.y}){
 const civilian=target!==s.player,profile=civilian?villageVillagerProfile(target.style):null;
 const lead=civilian&&target.state==='flee'&&!target.blocked?target.speed*(windup+Math.abs(target.x-origin.x)/speed):0;
 return{x:target.x-lead,y:target.y-(civilian?profile.h*(target.state==='hiding'?.4:.53):40)};
}
export const villageClownWindup=e=>e.rapidLantern?.62:.8;
