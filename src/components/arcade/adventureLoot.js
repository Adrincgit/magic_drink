import {DRINKS} from './adventureLevels';
import {collectDrink,refillDrink} from './adventureAmmo';
import {hasMod} from './adventureMods';
export const ORIGINAL_DURATION=10;
export const ORIGINAL_FIRE_RATE=1.7;
export const ORIGINAL_SPEED=1.15;
export const shieldCharges=(s,q)=>hasMod(s,'full-bubble')?3:Math.max(1,Math.min(3,Math.floor(q.charges)||1));
export function lootRandom(s){
 let seed=(s.lootSeed||0x9e3779b9)>>>0;seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;s.lootSeed=seed>>>0;return s.lootSeed/4294967296;
}
export function rollLoot(s,preferred=s.index){
 const choice=lootRandom(s);
 if(choice<.5||(choice<.73&&s.weapon<0)){
  const kind=lootRandom(s)<.55?(s.weapon>=0?s.weapon:preferred):Math.floor(lootRandom(s)*DRINKS.length);
  return{type:'drink',kind,boosted:lootRandom(s)<.08};
 }
 if(choice<.73)return{type:'ammo'};
 if(choice<.9){const roll=lootRandom(s);return{type:'shield',charges:hasMod(s,'full-bubble')?3:roll<.5?1:roll<.82?2:3};}
 return{type:'original'};
}
export function takeLoot(s,q){
 if(q.taken)return null;q.taken=true;const type=q.type||'drink',p=s.player;
 if(type==='drink'){
  if(s.weapon!==q.kind){p.charge=0;p.pendingSpecial=null;p.specialCast=0;p.specialWait=.2;}
  collectDrink(s,q.kind,q.boosted);
 }else if(type==='ammo'){
  if(!refillDrink(s))collectDrink(s,s.lastDrink??s.index);
 }else if(type==='shield'){s.shield=Math.min(3,(s.shield||0)+shieldCharges(s,q));s.shieldHit=.3;s.shieldBreak=0;}
 else if(type==='original'){
  s.overdrive=ORIGINAL_DURATION;p.drinkCast=p.ground!==null?.7:0;p.pendingSip=p.ground===null;
  p.cast=0;p.specialCast=0;p.pendingSpecial=null;p.charge=0;p.guarding=false;
 }
 s.events.push(type==='original'?'originalDrink':'power');return type;
}
