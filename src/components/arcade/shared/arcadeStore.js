import { useSyncExternalStore } from 'react';
import {MODS,MOD_SLOTS,validMods,equippedMods,validModLevels,modPrice,modSlots,slotPrice,availableMod,canUpgradeMod} from '../adventure/engine/adventureMods';

import {validCollectedStars,collectibleValue} from '../adventure/engine/adventureCollectibles';
import {applyRequestedLocalReset} from './arcadeLocalReset';

export const SAVE_KEY = 'magic-drink-arcade-v1';
export const BUNNIES = [
  { id: 'shore', es: 'Miga', en: 'Crumb', hint: ['Junto al agua, alguien se asoma.', 'Someone is peeking out by the water.'] },
  { id: 'lookout', es: 'Nube', en: 'Cloud', hint: ['Desde el mirador, busca unas orejas junto al puente.', 'Through the binoculars, look for ears beside the bridge.'] },
  { id: 'festival', es: 'Ritmo', en: 'Rhythm', hint: ['Hexy guarda recuerdos… y quizá un invitado entre sus fotos.', 'Hexy keeps memories… and perhaps a guest among her photos.'] },
  { id: 'plaza', es: 'Chispa', en: 'Spark', hint: ['En la página de Wonderpop, explora más allá de las luces.', 'On the Wonderpop page, explore beyond the lights.'] },
  { id: 'interview', es: 'Eco', en: 'Echo', hint: ['En Magic Drink, alguien se ha quedado un ratito más.', 'On the Magic Drink page, someone stayed a little longer.'] },
];
export const ACCESSORIES = [
  { id: 'plain', cost: 0, es: 'Tal como soy', en: 'Just me', icon: '♡' },
  { id: 'scarf', cost: 12, es: 'Pañuelo de fiesta', en: 'Party scarf', icon: '✿' },
  { id: 'crown', cost: 25, es: 'Estrella del show', en: 'Star of the show', icon: '♛' },
  { id: 'comet', cost: 40, es: 'Pasos de cometa', en: 'Comet footsteps', icon: '✦' },
];
const fresh = () => ({ version: 1, economy:2, coins: 0, stars: 0, found: [], owned: ['plain'], equipped: 'plain', modSlots:1,collectedStars:[],modsOwned:[],modsEquipped:[],best: 0, wins: 0, run: null, guideSeen:false, arcadeFound:false, adventureUnlocked:0, adventureCleared:[] });
const server = fresh();
let state = server, loaded = false, queue = Promise.resolve();
const listeners = new Set();
const number = (n, max=99999) => Number.isFinite(n) ? Math.max(0, Math.min(max, Math.floor(n))) : 0;
export function sanitizeSave(raw) {
  if (!raw || raw.version !== 1) return fresh();
  const owned = [...new Set(['plain', ...(Array.isArray(raw.owned) ? raw.owned : []).filter(id => ACCESSORIES.some(a => a.id === id))])];
  const modsOwned=validMods(raw.modsOwned);
  const slots=modSlots(raw.modSlots??Math.max(1,Math.min(3,equippedMods(raw.modsEquipped,modsOwned).length)));
  const found=[...new Set((Array.isArray(raw.found)?raw.found:[]).filter(id=>BUNNIES.some(b=>b.id===id)))];
  return { version:1, economy:2, coins:number(raw.coins,999), stars:number(number(raw.stars)+(raw.economy===2?0:found.length*50)), found, owned,
    equipped:owned.includes(raw.equipped)?raw.equipped:'plain',modsOwned,modSlots:slots,collectedStars:validCollectedStars(raw.collectedStars),modsEquipped:equippedMods(raw.modsEquipped,modsOwned,slots),modLevels:validModLevels(raw.modLevels,modsOwned), best:number(raw.best), wins:number(raw.wins), guideSeen:raw.guideSeen===true,arcadeFound:raw.arcadeFound===true,
    adventureUnlocked:number(raw.adventureUnlocked,4),adventureCleared:[...new Set((Array.isArray(raw.adventureCleared)?raw.adventureCleared:[]).filter(n=>Number.isInteger(n)&&n>=0&&n<5))],
    run:raw.run && typeof raw.run.id==='string' && typeof raw.run.practice==='boolean' ? {id:raw.run.id,practice:raw.run.practice,collectibles:raw.run.collectibles===true,chapter:number(raw.run.chapter,4),earned:number(raw.run.earned,1000),banked:number(raw.run.banked,200)} : null };
}
function read() { try { const value=localStorage.getItem(SAVE_KEY); return value ? sanitizeSave(JSON.parse(value)) : fresh(); } catch { return state; } }
function publish(next) { state=next; try { localStorage.setItem(SAVE_KEY,JSON.stringify(next)); } catch { /* Still playable for this visit. */ } listeners.forEach(fn=>fn()); }
function init() { if (loaded || typeof window==='undefined') return; loaded=true; try{applyRequestedLocalReset(localStorage,SAVE_KEY,import.meta.env.DEV);}catch{} state=read(); window.addEventListener('storage',e=>{if(e.key===SAVE_KEY){state=read();listeners.forEach(fn=>fn());}}); }
function subscribe(fn) { init(); listeners.add(fn); return ()=>listeners.delete(fn); }
function snapshot() { init(); return state; }
export function useArcadeSave() { return useSyncExternalStore(subscribe,snapshot,()=>server); }
// Explicit local testing action, never an automatic migration of player saves.
export function resetAdventureLoadout(){return mutate(s=>{
 try{localStorage.setItem(SAVE_KEY+':before-loadout-reset',JSON.stringify(s));}catch{return{value:false};}
 return{next:{...s,coins:0,stars:0,modsOwned:[],modsEquipped:[],modLevels:{},modSlots:1,collectedStars:[],run:null},value:true};
});}
async function mutate(fn) {
  init();
  const transaction=()=>{state=read();const result=fn(state);if(result.next)publish(result.next);return result.value;};
  if (typeof navigator!=='undefined' && navigator.locks) return navigator.locks.request(SAVE_KEY,transaction);
  const result=queue.then(transaction);queue=result.catch(()=>{});return result;
}
export function collectBunny(id) { return mutate(s=>{
  if(!BUNNIES.some(b=>b.id===id)||s.found.includes(id))return {value:false};
  return {next:{...s,stars:Math.min(99999,s.stars+50),found:[...s.found,id]},value:true};
}); }
export function beginRun(practice=false,chapter=0,collectibles=false) { return mutate(s=>{
  if(s.run)return {value:null};
  const run={id:crypto.randomUUID(),practice,collectibles,chapter:number(chapter,4),earned:0,banked:0};return {next:{...s,run},value:run};
}); }
// Chapter receipts settle earnings; entering or continuing never costs coins.
export function advanceAdventure(id,{level,stars}) { return mutate(s=>{
  if(s.run?.id!==id||s.run.chapter!==level||level<0||level>=4)return {value:false};
  const paid=!s.run.practice,earned=paid&&!s.run.collectibles?Math.max(0,number(stars,200)-(s.run.banked||0)):0;
  return {next:{...s,run:{...s.run,chapter:level+1,banked:0,earned:(s.run.earned||0)+earned},stars:Math.min(99999,s.stars+earned),adventureUnlocked:paid?Math.max(s.adventureUnlocked,level+1):s.adventureUnlocked,adventureCleared:paid?[...new Set([...s.adventureCleared,level])]:s.adventureCleared},value:true};
}); }
export function finishRun(id,{stars,won,level}) { return mutate(s=>{
  if(s.run?.id!==id)return {value:false};
  const earned=s.run.practice||s.run.collectibles?0:Math.max(0,number(stars,200)-(s.run.banked||0)),cleared=!s.run.practice&&won&&Number.isInteger(level)&&level>=0&&level<5;
  return {next:{...s,run:null,stars:Math.min(99999,s.stars+earned),best:s.run.practice?s.best:Math.max(s.best,number(stars,200)),wins:s.wins+(!s.run.practice&&won?1:0),coins:s.coins,adventureUnlocked:cleared?Math.max(s.adventureUnlocked,Math.min(4,level+1)):s.adventureUnlocked,adventureCleared:cleared?[...new Set([...s.adventureCleared,level])]:s.adventureCleared},value:true};
}); }
export const seeBunnyGuide=()=>mutate(s=>({next:{...s,guideSeen:true},value:true}));
export const discoverArcade=()=>mutate(s=>({next:{...s,arcadeFound:true},value:true}));
// Release an interrupted session. Entry is free; recovery never creates money.
export function recoverRun() { return mutate(s=>s.run?{next:{...s,run:null},value:true}:{value:false}); }
export function equipAccessory(id) { return mutate(s=>{
  const item=ACCESSORIES.find(a=>a.id===id);if(!item)return {value:false};
  if(s.owned.includes(id))return {next:{...s,equipped:id},value:true};
  if(s.stars<item.cost)return {value:false};
  return {next:{...s,stars:s.stars-item.cost,owned:[...s.owned,id],equipped:id},value:true};
}); }
// Cumulative chapter receipts make repeated shop visits and cross-tab calls
// idempotent. End-of-chapter settlement only deposits the remaining stars.
export function bankAdventureStars(id,level,stars){return mutate(s=>{
 if(s.run?.id!==id||s.run.chapter!==level)return{value:false};
 if(s.run.practice)return{value:0};if(s.run.collectibles)return{value:s.run.banked};const total=Math.max(s.run.banked||0,number(stars,200)),delta=total-(s.run.banked||0);
 return{next:{...s,stars:Math.min(99999,s.stars+delta),run:{...s.run,banked:total,earned:(s.run.earned||0)+delta}},value:total};
});}
export function buyAdventureMod(id){return mutate(s=>{
 const mod=MODS.find(m=>m.id===id);if(!mod||!availableMod(mod,s)||s.modsOwned.includes(id))return{value:false};
 if(s.stars<mod.price)return{value:false};
 return{next:{...s,stars:s.stars-mod.price,modsOwned:[...s.modsOwned,id],modLevels:{...s.modLevels,[id]:1}},value:true};
});}
// The displayed level is a compare-and-swap guard: a duplicate request cannot
// silently pay for two upgrades in two tabs.
export function upgradeAdventureMod(id,expectedLevel){return mutate(s=>{
 const mod=MODS.find(m=>m.id===id),level=s.modLevels?.[id]||1;
 if(!mod||!canUpgradeMod(mod,level,s)||!s.modsOwned.includes(id)||level!==expectedLevel)return{value:false};
 const cost=modPrice(mod,level);if(cost===null||s.stars<cost)return{value:false};
 return{next:{...s,stars:s.stars-cost,modLevels:{...s.modLevels,[id]:level+1}},value:true};
});}
export function toggleAdventureMod(id){return mutate(s=>{
 if(!s.modsOwned.includes(id))return{value:false};let mods=[...s.modsEquipped];
 if(mods.includes(id))mods=mods.filter(m=>m!==id);
 else{if(id.startsWith('starter-'))mods=mods.filter(m=>!m.startsWith('starter-'));if(mods.length>=s.modSlots)return{value:false};mods.push(id);}
 return{next:{...s,modsEquipped:mods},value:true};
});}

// Each identity and its authored value are committed in the same wallet transaction.
export function claimAdventureStars(id,level,ids){return mutate(s=>{
 if(s.run?.id!==id||s.run.chapter!==level||!s.run.collectibles)return{value:false};
 if(s.run.practice)return{value:0};
 const known=new Set(s.collectedStars),fresh=validCollectedStars(ids).filter(key=>key.startsWith(level+':')&&!known.has(key));
 const delta=fresh.reduce((total,key)=>total+collectibleValue(key),0);
 if(!delta)return{value:0};
 return{next:{...s,collectedStars:[...s.collectedStars,...fresh],stars:Math.min(99999,s.stars+delta),run:{...s.run,banked:s.run.banked+delta,earned:s.run.earned+delta}},value:delta};
});}
export function buyAdventureSlot(expected){return mutate(s=>{
 const cost=slotPrice(s.modSlots);if(s.modSlots!==expected||cost===null||s.stars<cost)return{value:false};
 return{next:{...s,stars:s.stars-cost,modSlots:s.modSlots+1},value:true};
});}
