import {starterCapacity,hasMod,ammoReserve} from './adventureMods';
import {beginRibbonDance,withRibbonLoadout} from './adventureRibbonState';
export const canCarryTwo=s=>hasMod(s,'double-pocket')||(s.modCategorySlots?.drinks||1)>=2;
export const activeWeapon=s=>s.basicFire&&!s.ribbonDance?-1:s.weapon;
const capacityFor=(s,kind)=>Math.floor(DRINK_SHOTS[kind]*ammoReserve(s));
export const DRINK_SHOTS=[54,42,60,32,45,84,48,56,48,42,48,40,44,24];
export const STRONG_SHOTS=5;
export const strongShots=kind=>kind===13?1:kind===9?7:STRONG_SHOTS;
export const drinkScale=s=>s.weapon>=0&&s.drinkTier===2?1.3:1;
export const drinkCapacity=s=>s.weapon>=0?(s.ammoCapacity||DRINK_SHOTS[s.weapon]):0;
export function equipDrink(s,kind,ammo=capacityFor(s,kind),tier=1,capacity=capacityFor(s,kind)){
 if(kind===12){beginRibbonDance(s);return;}
 if(s.ribbonDance){withRibbonLoadout(s,()=>equipDrink(s,kind,ammo,tier,capacity));return;}
 const valid=Number.isInteger(kind)&&kind>=0&&kind<DRINK_SHOTS.length;
 s.ammoCapacity=valid?Math.max(DRINK_SHOTS[kind],Math.min(DRINK_SHOTS[kind]*4.1,Math.floor(capacity))):0;
 s.ammoBaseCapacity=valid?Math.ceil(s.ammoCapacity/ammoReserve(s)):0;
 s.ammo=valid?Math.max(0,Math.min(s.ammoCapacity,Math.floor(ammo))):0;
 s.weapon=s.ammo>0?kind:-1;s.ammoWeapon=s.weapon;s.power=s.weapon>=0;s.drinkTier=s.power&&tier===2?2:1;
}
export const currentDrink=s=>s.ribbonDance?s.ribbonDance.stored:s.weapon>=0&&s.weapon!==12&&s.ammo>0?{kind:s.weapon,ammo:s.ammo,capacity:drinkCapacity(s),tier:s.drinkTier}:null;
export function validSpare(q){
 if(!q||q.kind===12||!Number.isInteger(q.kind)||!DRINK_SHOTS[q.kind]||!Number.isFinite(q.ammo)||q.ammo<=0)return null;
 const capacity=Math.max(DRINK_SHOTS[q.kind],Math.min(DRINK_SHOTS[q.kind]*4.1,Math.floor(q.capacity||DRINK_SHOTS[q.kind])));
 return{kind:q.kind,ammo:Math.min(capacity,Math.floor(q.ammo)),capacity,tier:q.tier===2?2:1};
}
export function swapDrink(s){
 const p=s.player,q=validSpare(s.spareDrink);
 if(s.ribbonDance)return false;
 if(!canCarryTwo(s)||!q||s.swapWait>0||p.drinkCast>0||p.hitReact||p.knockdown||p.dash||p.specialCast||p.superCast||p.pendingSpecial||p.guarding||s.superCinematic||s.clear||s.done)return false;
 s.spareDrink=currentDrink(s);equipDrink(s,q.kind,q.ammo,q.tier,q.capacity);
 s.aquaJet=null;s.voltBeam=null;s.placement=null;p.aquaChannel=false;p.ribbonSwing=0;s.swapWait=.25;s.shotWait=Math.max(s.shotWait||0,.18);s.events.push('drinkSwap');return true;
}
export function cycleShotMode(s){
 const p=s.player,spare=canCarryTwo(s)&&validSpare(s.spareDrink);
 if(s.ribbonDance||s.swapWait>0||p.drinkCast>0||p.hitReact||p.knockdown||p.dash||p.specialCast||p.superCast||p.pendingSpecial||p.guarding||s.superCinematic||s.clear||s.done)return false;
 if(s.basicFire){
  s.basicFire=false;
  if(spare&&s.basicCycle){s.swapWait=0;swapDrink(s);}
  s.basicCycle=0;
 }else if(spare&&!s.basicCycle){
  if(!swapDrink(s))return false;s.basicCycle=1;
 }else if(s.weapon>=0){s.basicFire=true;}
 else if(spare){if(!swapDrink(s))return false;s.basicCycle=0;}
 else return false;
 s.aquaJet=null;s.voltBeam=null;s.placement=null;p.aquaChannel=false;p.ribbonSwing=0;
 s.swapWait=.25;s.shotWait=Math.max(s.shotWait||0,.18);if(!s.events.includes('drinkSwap'))s.events.push('drinkSwap');return true;
}
export function collectDrink(s,kind,boosted=false){
 if(kind===12){beginRibbonDance(s);return;}
 if(s.ribbonDance){withRibbonLoadout(s,()=>collectDrink(s,kind,boosted));return;}
 if(!DRINK_SHOTS[kind])return;
 let capacity=s.weapon===kind?drinkCapacity(s):capacityFor(s,kind),tier=boosted||s.weapon===kind?2:1;
 if(canCarryTwo(s)&&s.weapon!==kind){
  const spare=validSpare(s.spareDrink);
  if(spare?.kind===kind){capacity=spare.capacity;tier=2;s.spareDrink=currentDrink(s);}
  else if(!spare)s.spareDrink=currentDrink(s);
 }
 equipDrink(s,kind,capacity,tier,capacity);s.basicFire=false;s.basicCycle=0;
}
export function refillDrink(s){if(s.ribbonDance){let result=false;withRibbonLoadout(s,()=>{result=refillDrink(s);});return result;}if(s.weapon<0)return false;s.ammo=Math.min(drinkCapacity(s),s.ammo+Math.ceil(drinkCapacity(s)*.55));return true;}
export function grantStartingDrink(s){
 if(s.starterClaimed)return;const starters=s.mods?.filter(id=>id.startsWith('starter-')&&id!=='starter-12').slice(0,canCarryTwo(s)?2:1)||[];
 if(!starters.length)return;
 const cans=starters.map(id=>{const kind=Number(id.slice(8)),capacity=Math.floor(DRINK_SHOTS[kind]*starterCapacity(s,id)*ammoReserve(s));return{kind,ammo:capacity,capacity,tier:1};});
 const q=cans[0];equipDrink(s,q.kind,q.ammo,q.tier,q.capacity);if(cans[1])s.spareDrink=cans[1];s.starterClaimed=true;
}
export function syncDrink(s){
 // Restored states and authoring fixtures can change the equipped drink.
 if(s.weapon!==s.ammoWeapon)equipDrink(s,s.weapon);
}
export function spendDrink(s,shots=1){
 if(s.weapon<0||s.overdrive>0||s.ribbonDance)return;
 s.ammo=Math.max(0,s.ammo-shots);
 if(!s.ammo){s.lastDrink=s.weapon;s.ammoEmpty=.65;s.weapon=-1;s.ammoWeapon=-1;s.power=false;s.drinkTier=1;}
}
