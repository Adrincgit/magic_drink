import {starterCapacity} from './adventureMods';
export const DRINK_SHOTS=[54,42,60,32,45];
export const STRONG_SHOTS=5;
export const drinkScale=s=>s.weapon>=0&&s.drinkTier===2?1.3:1;
export const drinkCapacity=s=>s.weapon>=0?(s.ammoCapacity||DRINK_SHOTS[s.weapon]):0;
export function equipDrink(s,kind,ammo=DRINK_SHOTS[kind],tier=1,capacity=DRINK_SHOTS[kind]){
 const valid=Number.isInteger(kind)&&kind>=0&&kind<DRINK_SHOTS.length;
 s.ammoCapacity=valid?Math.max(DRINK_SHOTS[kind],Math.min(DRINK_SHOTS[kind]*3,Math.floor(capacity))):0;
 s.ammo=valid?Math.max(0,Math.min(s.ammoCapacity,Math.floor(ammo))):0;
 s.weapon=s.ammo>0?kind:-1;s.ammoWeapon=s.weapon;s.power=s.weapon>=0;s.drinkTier=s.power&&tier===2?2:1;
}
export function collectDrink(s,kind,boosted=false){const capacity=s.weapon===kind?drinkCapacity(s):DRINK_SHOTS[kind];equipDrink(s,kind,capacity,boosted||s.weapon===kind?2:1,capacity);}
export function refillDrink(s){if(s.weapon<0)return false;s.ammo=Math.min(drinkCapacity(s),s.ammo+Math.ceil(drinkCapacity(s)*.55));return true;}
export function grantStartingDrink(s){const mod=s.mods?.find(id=>id.startsWith('starter-'));if(!mod||s.starterClaimed)return;const kind=Number(mod.slice(8)),capacity=Math.floor(DRINK_SHOTS[kind]*starterCapacity(s,mod));equipDrink(s,kind,capacity,1,capacity);s.starterClaimed=true;}
export function syncDrink(s){
 // Restored states and authoring fixtures can change the equipped drink.
 if(s.weapon!==s.ammoWeapon)equipDrink(s,s.weapon);
}
export function spendDrink(s,shots=1){
 if(s.weapon<0||s.overdrive>0)return;
 s.ammo=Math.max(0,s.ammo-shots);
 if(!s.ammo){s.lastDrink=s.weapon;s.ammoEmpty=.65;s.weapon=-1;s.ammoWeapon=-1;s.power=false;s.drinkTier=1;}
}
