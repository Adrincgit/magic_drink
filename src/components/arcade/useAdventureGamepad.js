import {useEffect,useRef,useState} from 'react';
import {readAdventureGamepad} from './adventureGamepad';

export default function useAdventureGamepad(options){
 const latest=useRef(options);latest.current=options;
 const [status,setStatus]=useState({state:'waiting',name:''});
 useEffect(()=>{
  let raf=0,selected=null,previous={},context='',reset=true,blocked={},signature='',repeat={},focused=document.hasFocus();
  const report=next=>{const key=next.state+'|'+next.name;if(key!==signature){signature=key;setStatus(next);}};
  const clear=()=>{previous={};repeat={};reset=true;latest.current.onInput({},[]);};
  const focus=()=>{focused=true;clear();},blur=()=>{focused=false;clear();};
  const visibility=()=>{if(document.hidden)blur();else focused=document.hasFocus();};
  const disconnect=event=>{if(selected?.index===event.gamepad.index){selected=null;clear();latest.current.onDisconnect();report({state:'disconnected',name:''});}};
  const unavailable=()=>{if(selected){selected=null;clear();latest.current.onDisconnect();}report({state:'unavailable',name:''});};
  function poll(now){
   raf=requestAnimationFrame(poll);
   if(!navigator.getGamepads){unavailable();return;}
   let pads;try{pads=Array.from(navigator.getGamepads()).filter(p=>p?.connected);}catch{unavailable();return;}
   if(selected&&!pads.some(p=>p.index===selected.index&&p.id===selected.id&&p.mapping==='standard')){selected=null;clear();latest.current.onDisconnect();report({state:'disconnected',name:''});return;}
   const pad=selected?pads.find(p=>p.index===selected.index):pads.find(p=>p.mapping==='standard');
   if(!pad){if(pads.length)report({state:'unsupported',name:pads[0].id});else if(signature.startsWith('unsupported|'))report({state:'waiting',name:''});return;}
   if(!selected){selected={index:pad.index,id:pad.id};clear();}
   report({state:'connected',name:pad.id});
   const raw=readAdventureGamepad(pad),mode=latest.current.getContext();
   if(mode!==context){context=mode;clear();}
   if(document.hidden||!focused){clear();return;}
   // Only suppress controls held across a screen change. Releasing confirm
   // must not require an unrelated new stick movement to return to neutral.
   if(reset){blocked={...raw};reset=false;}
   const keys={};for(const key of Object.keys(raw)){if(!raw[key])delete blocked[key];keys[key]=raw[key]&&!blocked[key];}
   const edges=Object.keys(keys).filter(key=>keys[key]&&!previous[key]);
   if(mode==='playing'){
    if(edges.includes('pause')){latest.current.onInput({},[]);latest.current.onAction('pause');}
    else if(edges.includes('interact')){latest.current.onInput({},[]);latest.current.onAction('interact');}
    else latest.current.onInput(keys,edges);
   }else{
    latest.current.onInput({},[]);
    if(!mode.startsWith('shop-')&&!['loading','settling','between'].includes(mode)){
     const action=['pause','back','confirm','interact'].find(key=>edges.includes(key));
     if(action)latest.current.onAction(action);
     else for(const key of ['left','right','up','down']){
      if(keys[key]&&(edges.includes(key)||now>repeat[key])){latest.current.onAction(key);repeat[key]=now+(edges.includes(key)?360:145);}
      if(!keys[key])delete repeat[key];
     }
    }
   }
   previous=keys;
  }
  window.addEventListener('focus',focus);window.addEventListener('blur',blur);window.addEventListener('gamepaddisconnected',disconnect);document.addEventListener('visibilitychange',visibility);raf=requestAnimationFrame(poll);
  return()=>{cancelAnimationFrame(raf);window.removeEventListener('focus',focus);window.removeEventListener('blur',blur);window.removeEventListener('gamepaddisconnected',disconnect);document.removeEventListener('visibilitychange',visibility);latest.current.onInput({},[]);};
 },[]);
 return status;
}
