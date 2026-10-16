import {useEffect,useState} from 'react';
export const DEFAULT_GAMEPAD_BINDINGS={jump:[0],dash:[1],attack:[2,7],special:[3],hold:[4],super:[5],guard:[6],interact:[8],coaster:[10],swap:[11]};
export const GAMEPAD_ACTIONS=[
 ['jump','Saltar / planear','Jump / glide'],['attack','Disparar magia','Cast magic'],['dash','Rodar / dash aéreo','Roll / air dash'],['special','Magia fuerte','Strong magic'],['hold','Apuntar sin caminar','Aim in place'],['super','Súper ataque','Super attack'],['guard','Escudo musical','Musical shield'],['swap','Alternar bebida / varita','Cycle drink / wand'],['coaster','Posavasos en el aire','Airborne coaster'],['interact','Entrar en la tienda','Enter the shop']
];
export const GAMEPAD_BUTTON_NAMES=['A','B','X','Y','LB','RB','LT','RT','View','Menu','L3','R3'];
const key='magic-drink:arcade:gamepad-bindings:v1',eventName='hexy-gamepad-bindings';
let cached=null;
export function normalizeGamepadBindings(value){
 const result={},used=new Set();
 for(const name of Object.keys(DEFAULT_GAMEPAD_BINDINGS)){
  const values=Array.isArray(value?.[name])?value[name]:DEFAULT_GAMEPAD_BINDINGS[name];
  result[name]=[...new Set(values)].filter(i=>Number.isInteger(i)&&i>=0&&i<=11&&i!==9&&!used.has(i)).slice(0,name==='attack'?2:1);result[name].forEach(i=>used.add(i));
 }
 for(const name of Object.keys(result))if(!result[name].length){const free=DEFAULT_GAMEPAD_BINDINGS[name].find(i=>!used.has(i))??[0,1,2,3,4,5,6,7,8,10,11].find(i=>!used.has(i));result[name]=[free];used.add(free);}
 return result;
}
export function getGamepadBindings(){
 if(cached)return cached;
 try{cached=normalizeGamepadBindings(JSON.parse(localStorage.getItem(key)));}catch{cached=normalizeGamepadBindings(null);}return cached;
}
export function assignGamepadButton(bindings,action,index){
 if(!(action in DEFAULT_GAMEPAD_BINDINGS)||!Number.isInteger(index)||index<0||index>11||index===9)return bindings;
 const next=Object.fromEntries(Object.entries(bindings).map(([name,buttons])=>[name,[...buttons]])),previous=next[action][0];
 for(const name of Object.keys(next))if(name!==action&&next[name].includes(index)){next[name]=next[name].filter(i=>i!==index);if(!next[name].length)next[name]=[previous];}
 next[action]=[index];return next;
}
export function saveGamepadBindings(value){
 cached=normalizeGamepadBindings(value);try{localStorage.setItem(key,JSON.stringify(cached));}catch{}
 window.dispatchEvent(new Event(eventName));return cached;
}
export function useGamepadBindings(){
 const [bindings,setBindings]=useState(()=>normalizeGamepadBindings(null));
 useEffect(()=>{const sync=()=>{cached=null;setBindings(getGamepadBindings());};sync();window.addEventListener(eventName,sync);const storage=e=>{if(e.key===key)sync();};window.addEventListener('storage',storage);return()=>{window.removeEventListener(eventName,sync);window.removeEventListener('storage',storage);};},[]);
 return [bindings,saveGamepadBindings];
}
export const bindingName=(bindings,action)=>bindings[action].map(i=>GAMEPAD_BUTTON_NAMES[i]).join(' / ');
