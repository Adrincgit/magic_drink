import {useSyncExternalStore} from 'react';

export const AUDIO_SETTINGS_KEY='magic-drink-arcade-audio-v1';
export const DEFAULT_AUDIO_SETTINGS=Object.freeze({master:70,music:70,effects:100,muted:false});
const listeners=new Set();let current=DEFAULT_AUDIO_SETTINGS,loaded=false;
export function sanitizeAudioSettings(raw){
 const value=raw&&typeof raw==='object'?raw:{};
 const volume=key=>typeof value[key]==='number'&&Number.isFinite(value[key])?Math.round(Math.max(0,Math.min(100,value[key]))):DEFAULT_AUDIO_SETTINGS[key];
 return{master:volume('master'),music:volume('music'),effects:volume('effects'),muted:value.muted===true};
}
function read(){try{return sanitizeAudioSettings(JSON.parse(localStorage.getItem(AUDIO_SETTINGS_KEY)));}catch{return DEFAULT_AUDIO_SETTINGS;}}
function init(){
 if(loaded||typeof window==='undefined')return;loaded=true;current=read();
 window.addEventListener('storage',event=>{if(event.key===AUDIO_SETTINGS_KEY||event.key===null){current=read();listeners.forEach(fn=>fn());}});
}
const snapshot=()=>{init();return current;};
const subscribe=fn=>{init();listeners.add(fn);return()=>listeners.delete(fn);};
export const useArcadeAudioSettings=()=>useSyncExternalStore(subscribe,snapshot,()=>DEFAULT_AUDIO_SETTINGS);
export function updateArcadeAudioSettings(patch){
 init();current=sanitizeAudioSettings({...current,...patch});
 try{localStorage.setItem(AUDIO_SETTINGS_KEY,JSON.stringify(current));}catch{/* Keep the preferences for this visit. */}
 listeners.forEach(fn=>fn());
}
export function adventureMusicVolume(settings,sceneGain){return settings.muted?0:sceneGain*settings.master/100*settings.music/100;}
