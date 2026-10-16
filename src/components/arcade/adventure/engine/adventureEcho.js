import {hexyMuzzle,hexyPose} from '../actors/hexy/hexyAnimation';
import {spendDrink} from './adventureAmmo';

export const echoFuel=s=>s.weapon===8?s.ammo:s.spareDrink?.kind===8?s.spareDrink.ammo:0;
// One charge per companion per actual player volley (not per pellet).
// Called by the firing paths, never by a timer or an attack-button tap alone.
export function takeEchoVolley(s,duration=.24){
 const copies=[];
 for(const f of s.drinkFields||[])if(f.kind===8&&f.life>0&&echoFuel(s)>0){
  f.flash=duration;f.dir=s.player.dir;f.pose=hexyPose(s);
  f.muzzle=hexyMuzzle({...s,player:{...s.player,x:f.x,y:f.y}},f.pose);
  if(s.weapon===8)spendDrink(s);
  else if(--s.spareDrink.ammo<=0)s.spareDrink=null;
  copies.push(f);
 }
 return copies;
}
export function repeatEchoVolley(s,shots){
 if(!shots.length)return;
 for(const f of takeEchoVolley(s,Math.max(.24,...shots.map(q=>q.ribbonDuration||0)))){
  for(const q of shots)s.shots.push({...q,x:f.muzzle.x,y:f.muzzle.y,age:0,
   damage:q.damage*f.copyDamage,baseDamage:q.baseDamage===undefined?undefined:q.baseDamage*f.copyDamage,
   hits:[],echoCopy:true,echoOwner:f,orbitAnchor:{x:f.x,y:f.y},ribbonOrigin:{...f.muzzle}});
  s.events.push('echoPulse');
 }
}
