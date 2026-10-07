import adventureWords from '../../../../public/arcade/texts/adventure.json';
﻿import {useCallback,useEffect,useRef,useState} from 'react';
import {useStore} from '@nanostores/react';
import {isEnglish} from '../../../data/variables';
import {LEVELS,DRINKS} from './world/adventureLevels';
import {adventureMusic} from './world/adventureWorlds';
import AdventureHUD from './ui/hud/AdventureHUD';
import AdventureFrontEnd,{AdventurePresentation,AdventureChapterCard,AdventureTutorial} from './ui/title/AdventureFrontEnd';
import AdventureShop from './ui/shop/AdventureShopDialog';
import AdventureSettings from './ui/settings/AdventureSettings';
import useAdventureGamepad from './input/useAdventureGamepad';
import {navigateGamepadMenu} from './input/adventureGamepad';
import {useArcadeAudioSettings,updateArcadeAudioSettings,adventureMusicVolume} from '../shared/arcadeAudioSettings';
import {canEnterShop,beginShopTransition,stepShopTransition} from './engine/adventureShop';
import {updateMods,superCapacity,reserveRecharge} from './engine/adventureMods';
import {grantStartingDrink} from './engine/adventureAmmo';
import shopCss from './ui/shop/adventureShop.module.css';
import {createAdventure,stepAdventure,adventureCarry,retryAdventure} from './engine/adventureModel';
import {loadAdventureArt,renderAdventure} from './render/adventureCanvas';
import {hexyPose} from './actors/hexy/hexyAnimation';
import {spellFor,SUPER_DURATION,SUPER_COST} from './engine/adventureMagic';
import {beginRun,finishRun,recoverRun,advanceAdventure,useArcadeSave,bankAdventureStars,claimAdventureStars,resetAdventureLoadout} from '../shared/arcadeStore';
import {arcadeSound,unlockArcadeAudio,muteArcadeSounds,setArcadeSoundsVolume} from '../shared/arcadeSound';
import {SceneButton} from '../../global/SceneControls';
import IllustratedMenu from '../../global/IllustratedMenu';
import useIllustratedFinish from '../../global/useIllustratedFinish';
import usePlazaDialog from '../../index/Secciones/usePlazaDialog';
import HexyFinish from '../../hexy/HexyFinish';
import base from '../shared/bunnyArcade.module.css';
import css from './hexyAdventure.module.css';
import './adventureDesktop.css';

const words=adventureWords;
const empty=()=>({left:false,right:false,up:false,down:false,jump:false,attack:false,dash:false,special:false,super:false,hold:false,guard:false});
const pressActions=new Set(['jump','attack','dash','special','super']);
export default function HexyAdventure(){
 const language=useStore(isEnglish),[hydrated,setHydrated]=useState(false),en=hydrated&&language,save=useArcadeSave();
 const [phase,setPhaseState]=useState('loading'),phaseRef=useRef('loading'),[selected,setSelected]=useState(0),[art,setArt]=useState(null),[retry,setRetry]=useState(0),[gentle,setGentle]=useState(false),[reduced,setReduced]=useState(false),[busy,setBusy]=useState(false),[result,setResult]=useState(null),[menuOpen,setMenuOpen]=useState(false),[settingsOpen,setSettingsOpen]=useState(false),[settingsTab,setSettingsTab]=useState('audio');
 const audioSettings=useArcadeAudioSettings(),muted=audioSettings.muted,setMuted=value=>updateArcadeAudioSettings({muted:value});
 const [audioBlocked,setAudioBlocked]=useState(false);
 const [presentation,setPresentation]=useState(true),[tutorial,setTutorial]=useState(false);
 const titleEntered=useRef(false);
 const skipPresentation=useCallback(()=>setPresentation(false),[]);
 useEffect(()=>{if(!import.meta.env.DEV)return;const url=new URL(location.href);if(url.searchParams.get('reset')!=='coins-charms')return;void resetAdventureLoadout().then(ok=>{if(ok){url.searchParams.delete('reset');location.replace(url.href);}});},[]);
 const [hud,setHud]=useState({hearts:5,score:0,rescued:0,power:false,notice:'start',noticeTime:5,boss:false,combo:0});
 const screen=useRef(null),machine=useRef(null),run=useRef(null),input=useRef(empty()),padInput=useRef({}),pressed=useRef(new Map()),engine=useRef(null),ticket=useRef(null),audio=useRef(null),opts=useRef({}),pendingChapter=useRef(null);
 const saveRef=useRef(save),receipts=useRef(Promise.resolve());saveRef.current=save;
 const shopAction=useRef(null),shopOpening=useRef(false);
 const [finish,setFinish]=useIllustratedFinish(),dialog=useRef(null),{open,close}=usePlazaDialog(dialog);
 opts.current={reduced,muted,en};const level=LEVELS[selected],playing=phase==='playing',inRun=playing||phase==='paused'||phase==='between'||phase==='shop'||phase.startsWith('shop-'),lang=en?1:0;
 const specialKind=hud.weapon??-1,special=spellFor(specialKind);
 const setPhase=useCallback(next=>{phaseRef.current=next;setPhaseState(next);},[]);
 const pad=useAdventureGamepad({
  getContext:()=>presentation?'presentation':tutorial?'tutorial':settingsOpen?'settings':dialog.current?.open?'site-menu':phaseRef.current==='ready'&&machine.current?.querySelector('[data-title-screen]')?.dataset.menuOpen==='false'?'title':phaseRef.current,
  onInput:(keys,edges)=>{padInput.current=keys;for(const key of edges)if(pressActions.has(key)&&!input.current[key])pressed.current.set(key,(pressed.current.get(key)||0)+1);},
  onAction:gamepadAction,
  onDisconnect:()=>engine.current?.pause()
 });
 useEffect(()=>{try{isEnglish.set(localStorage.getItem('lang')==='en');}catch{}setHydrated(true);const m=matchMedia('(prefers-reduced-motion:reduce)'),update=()=>setReduced(m.matches);update();m.addEventListener('change',update);return()=>m.removeEventListener('change',update);},[]);
 useEffect(()=>{let live=true;setPhase('loading');loadAdventureArt().then(a=>{if(live){setArt(a);setPhase('ready');}}).catch(()=>{if(live)setPhase('error');});return()=>{live=false;};},[retry,setPhase]);
 useEffect(()=>{
  if(!art)return;let raf=0,last=0,acc=0,hudAt=0,disposed=false;const canvas=screen.current;run.current=createAdventure(0);
  const paint=()=>{renderAdventure(canvas,run.current,art,opts.current);const pose=hexyPose(run.current);canvas.dataset.pose=pose.sheet+':'+pose.frame;canvas.dataset.charge=run.current.player.charge.toFixed(2);};
  const publish=()=>{const s=run.current;setHud({hearts:s.hearts,score:s.score,money:ticket.current?.collectibles&&!ticket.current.practice?0:Math.max(0,s.starMoney-(s.bankedStars||0)),nearShop:canEnterShop(s),mods:s.mods,modLevels:s.modLevels,reserveDuration:reserveRecharge(s),ammoCapacity:s.ammoCapacity,superCapacity:superCapacity(s),superReserve:s.superReserve,reserveCooldown:s.reserveCooldown,drinkTier:s.drinkTier,treasures:s.stars.filter(q=>q.value===10&&q.taken).length,overdriveDuration:s.overdriveDuration,overdrive:s.overdrive,rescued:s.rescued,power:s.power,notice:s.notice,noticeTime:s.noticeTime,clearing:!!s.clear,boss:s.boss.phase!=='sleep'&&s.boss.hp>0,combo:s.combo,weapon:s.weapon,ammo:s.ammo,shield:s.shield,maxHearts:s.maxHearts,guarding:s.player.guarding,holding:s.player.holding,guardEmpty:s.player.guardExhausted,magic:s.magic,charge:s.player.charge,exhaustion:s.exhaustion,superCooldown:s.superCooldown,starPulse:s.starPulse,superActive:!!s.superCinematic,superProgress:(s.superCinematic?.age||0)/SUPER_DURATION,move:s.boss.move,bossPhase:s.boss.phase,stage:s.boss.stage});canvas.dataset.playerX=s.player.x.toFixed(1);canvas.dataset.playerY=s.player.y.toFixed(1);canvas.dataset.level=String(s.index);canvas.dataset.nearShop=String(canEnterShop(s));canvas.dataset.mods=s.mods.join(',');canvas.dataset.superReserve=String(s.superReserve);canvas.dataset.crouch=String(s.player.crouch);canvas.dataset.dash=String(s.player.dash>0);canvas.dataset.aim=String(s.player.aimY);canvas.dataset.bossPhase=s.boss.phase;canvas.dataset.weapon=String(s.weapon);canvas.dataset.ammo=String(s.ammo);canvas.dataset.bossStage=String(s.boss.stage);canvas.dataset.hold=String(!!s.player.holding);canvas.dataset.guard=String(!!s.player.guarding);canvas.dataset.gliding=String(!!s.player.gliding);canvas.dataset.jumps=String(s.player.jumps);canvas.dataset.exhaustion=s.exhaustion.toFixed(2);canvas.dataset.superActive=String(!!s.superCinematic);canvas.dataset.superCooldown=s.superCooldown.toFixed(2);canvas.dataset.score=String(s.score);canvas.dataset.money=String(s.starMoney);canvas.dataset.drinkTier=String(s.drinkTier);canvas.dataset.overdrive=(s.overdrive||0).toFixed(2);};
  function collectReceipts(){const s=run.current,t=ticket.current;if(!t||!s.pendingStars.length)return;const ids=s.pendingStars.splice(0),index=s.index;receipts.current=receipts.current.then(()=>claimAdventureStars(t.id,index,ids));}
  async function settle(){
   const t=ticket.current;if(!t)return;const s=run.current;setPhase('settling');input.current=empty();await receipts.current;
   if(!s.won){setResult({won:false,stars:s.starMoney,rescued:s.rescued,practice:t.practice,accepted:true});setPhase('result');return;}
   if(s.won&&s.index<4){
    const accepted=await advanceAdventure(t.id,{level:s.index,stars:s.starMoney});
    if(disposed)return;
    if(accepted){if(!t.practice)setHud(h=>({...h,money:0}));pendingChapter.current={index:s.index+1,gentle:s.gentle,carry:adventureCarry(s)};ticket.current={...t,chapter:s.index+1};setPhase('between');return;}
   }
   ticket.current=null;const accepted=await finishRun(t.id,{stars:s.starMoney,won:s.won,level:s.index});
   if(!disposed){if(accepted&&!t.practice)setHud(h=>({...h,money:0}));setResult({won:s.won,stars:s.starMoney,rescued:s.rescued,practice:t.practice,accepted});setPhase('result');}
  }
  function tick(now){raf=0;if(disposed||phaseRef.current!=='playing')return;acc+=Math.min(.05,(now-(last||now))/1000);last=now;
   while(acc>=1/120&&!run.current.done){
    // A quick tap can begin and end between animation frames. Consume its
    // edge exactly once; holding still belongs to the live keyboard state.
    const keys={...input.current};for(const key of Object.keys(keys))keys[key]||=!!padInput.current[key];for(const [key,count] of pressed.current){keys[key]=true;run.current.lastInput[key]=false;if(count>1)pressed.current.set(key,count-1);else pressed.current.delete(key);}
    stepAdventure(run.current,keys,1/120);collectReceipts();acc-=1/120;for(const e of run.current.events)arcadeSound(e,!opts.current.muted);
   }
   paint();canvas.dataset.simFrame=String(run.current.ticks);if(now-hudAt>110||run.current.done){publish();hudAt=now;}if(run.current.done){void settle();return;}raf=requestAnimationFrame(tick);
  }
  const wake=()=>{last=0;acc=0;if(!raf)raf=requestAnimationFrame(tick);};
  const pause=(sound=true)=>{input.current=empty();padInput.current={};pressed.current.clear();run.current.player.guarding=false;run.current.player.holding=false;if(!run.current.superCinematic){run.current.player.charge=0;run.current.player.pendingSpecial=null;run.current.player.specialCast=0;}if(phaseRef.current==='playing'||phaseRef.current==='between'){if(sound!==false)arcadeSound('pause',!opts.current.muted);setPhase('paused');cancelAnimationFrame(raf);raf=0;}};
  engine.current={paint,publish,wake,pause,retry:()=>{pressed.current.clear();retryAdventure(run.current);publish();paint();},reset:(index,easy,carry)=>{pressed.current.clear();run.current=createAdventure(index,easy,{...carry,modSlots:saveRef.current.modSlots,collectedStars:saveRef.current.collectedStars});canvas.dataset.simFrame='0';publish();paint();}};
  const resize=new ResizeObserver(paint);resize.observe(canvas);
  const hidden=()=>{if(document.hidden)pause();};document.addEventListener('visibilitychange',hidden);window.addEventListener('blur',pause);
  const observer=new IntersectionObserver(([e])=>{if(!e.isIntersecting)pause();});observer.observe(canvas);
  return()=>{disposed=true;cancelAnimationFrame(raf);resize.disconnect();observer.disconnect();document.removeEventListener('visibilitychange',hidden);window.removeEventListener('blur',pause);engine.current=null;};
 },[art,setPhase]);
 useEffect(()=>{const key=e=>{if(phaseRef.current!=='playing'||dialog.current?.open)return;if(e.code==='KeyE'&&e.type==='keydown'&&!e.repeat){e.preventDefault();void shopAction.current?.();return;}const map={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',Space:'jump',ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down',KeyZ:'attack',KeyJ:'attack',KeyX:'dash',ShiftLeft:'dash',KeyK:'dash',KeyC:'special',KeyL:'special',KeyF:'hold',ControlLeft:'hold',KeyV:'guard',KeyR:'super'};if(map[e.code]){e.preventDefault();const action=map[e.code],down=e.type==='keydown';if(down&&!e.repeat&&!input.current[action]&&pressActions.has(action))pressed.current.set(action,(pressed.current.get(action)||0)+1);input.current[action]=down;}else if(e.type==='keydown'&&(e.code==='Escape'||e.code==='KeyP')){e.preventDefault();engine.current?.pause();}};window.addEventListener('keydown',key);window.addEventListener('keyup',key);return()=>{window.removeEventListener('keydown',key);window.removeEventListener('keyup',key);};},[]);

 useEffect(()=>{
  if(!['between','result'].includes(phase)||!run.current?.won)return;
  let frame,last=0;const animate=now=>{if(last)run.current.fxTime+=Math.min(.05,(now-last)/1000);last=now;engine.current?.paint();frame=requestAnimationFrame(animate);};
  frame=requestAnimationFrame(animate);return()=>cancelAnimationFrame(frame);
 },[phase]);
 useEffect(()=>{const known=new Set(save.collectedStars);if(run.current)for(const q of run.current.stars)if(known.has(q.id))q.taken=true;},[save.collectedStars]);
 useEffect(()=>{if(audio.current)audio.current.playbackRate=playing&&hud.overdrive>0?1.2:1;},[playing,hud.overdrive>0,selected]);
 const musicTrack=adventureMusic(selected,hud.clearing?'between':phase,hud.boss,result?.won);
 useEffect(()=>{setArcadeSoundsVolume(audioSettings.master/100,audioSettings.effects/100);muteArcadeSounds(muted);if(!audio.current)return;audio.current.volume=adventureMusicVolume(audioSettings,phase==='shop'?.35:hud.superActive?.22:.48);audio.current.muted=muted;audio.current.loop=musicTrack.loop;if(!muted&&(playing||phase==='between'||phase==='result'||phase==='shop'||phase==='ready'||phase==='chapter-intro'||(settingsOpen&&settingsTab==='audio')))playMusic();else{audio.current.pause();setAudioBlocked(false);}},[playing,audioSettings,musicTrack.src,musicTrack.loop,phase,hud.superActive,settingsOpen,settingsTab]);
 useEffect(()=>{
  // Browser autoplay may require a real click/key even after a controller press.
  const unlock=()=>{unlockArcadeAudio();if(!opts.current.muted&&['playing','shop','between','result','ready','chapter-intro'].includes(phaseRef.current))playMusic();};
  window.addEventListener('pointerdown',unlock);window.addEventListener('keydown',unlock);return()=>{window.removeEventListener('pointerdown',unlock);window.removeEventListener('keydown',unlock);};
 },[]);
 const nextChapter=useCallback(()=>{const n=pendingChapter.current;if(!n)return;pendingChapter.current=null;setSelected(n.index);engine.current.reset(n.index,n.gentle,n.carry);input.current=empty();setPhase('chapter-intro');},[setPhase]);
 useEffect(()=>{if(phase!=='between')return;let timer;const schedule=()=>{clearTimeout(timer);if(!document.hidden)timer=setTimeout(nextChapter,0);};schedule();document.addEventListener('visibilitychange',schedule);return()=>{clearTimeout(timer);document.removeEventListener('visibilitychange',schedule);};},[phase,nextChapter]);

 useEffect(()=>{
  if(!['shop-entering','shop-leaving'].includes(phase))return;
  let frame=0,last=0,live=true;
  const animate=now=>{if(!live)return;const s=run.current,done=stepShopTransition(s,last?Math.min(.05,(now-last)/1000):0);last=now;engine.current?.paint();engine.current?.publish();
   if(done){delete s.shopTransition;if(phase==='shop-entering'){setPhase('shop');}else resume();return;}frame=requestAnimationFrame(animate);
  };frame=requestAnimationFrame(animate);return()=>{live=false;cancelAnimationFrame(frame);};
 },[phase]);
 async function enterShop(){
  if(shopOpening.current||phaseRef.current!=='playing'||!canEnterShop(run.current))return;
  shopOpening.current=true;engine.current.pause(false);arcadeSound('doorOpen',!muted);const s=run.current;beginShopTransition(s);setPhase('shop-entering');
  try{const t=ticket.current;if(!t){delete s.shopTransition;resume();return;}await receipts.current;const banked=await bankAdventureStars(t.id,s.index,s.starMoney);
   if(banked===false){delete s.shopTransition;resume();return;}s.bankedStars=banked;s.shopTransition.ready=true;
  }finally{shopOpening.current=false;}
 }
 shopAction.current=enterShop;
 function leaveShop(){arcadeSound('doorClose',!muted);updateMods(run.current,save.modsEquipped,save.modLevels,save.modSlots);grantStartingDrink(run.current);beginShopTransition(run.current,true);engine.current.publish();engine.current.paint();setPhase('shop-leaving');}
 async function start(practice){if(busy||!art||inRun||phaseRef.current==='chapter-intro')return;setBusy(true);unlockArcadeAudio();muteArcadeSounds(muted);try{if(save.run&&!ticket.current)await recoverRun();const t=await beginRun(practice,selected,true);if(!t)return;ticket.current=t;setResult(null);engine.current.reset(selected,gentle,{mods:save.modsEquipped,modLevels:save.modLevels});input.current=empty();setPhase('chapter-intro');screen.current.focus({preventScroll:true});arcadeSound('start',!muted);}finally{setBusy(false);}}
 function retryCheckpoint(){engine.current.retry();setResult(null);input.current=empty();setPhase('chapter-intro');}
 const enterChapter=useCallback(()=>{if(phaseRef.current!=='chapter-intro')return;input.current=empty();pressed.current.clear();setPhase('playing');engine.current?.wake();screen.current?.focus({preventScroll:true});},[setPhase]);
 function resume(){if(phaseRef.current==='paused')arcadeSound('resume',!muted);if(pendingChapter.current){nextChapter();return;}input.current=empty();setPhase('playing');engine.current.wake();screen.current.focus({preventScroll:true});}
 function openSettings(){engine.current?.pause();setSettingsTab('audio');setSettingsOpen(true);unlockArcadeAudio();}
 function closeSettings(){setSettingsOpen(false);}
 function playMusic(){if(audio.current)void audio.current.play().then(()=>setAudioBlocked(false)).catch(error=>{if(error.name==='NotAllowedError')setAudioBlocked(true);});}
 function gamepadAction(action){
  const current=phaseRef.current;
  if(presentation){skipPresentation();return;}
  if(tutorial){if(action==='back'||action==='pause')setTutorial(false);else navigateGamepadMenu(machine.current?.querySelector('[data-tutorial]'),action);return;}
  if(current==='chapter-intro'){if(action==='confirm'||action==='pause')enterChapter();return;}
  if(settingsOpen){if(action==='back'||action==='pause')closeSettings();else navigateGamepadMenu(machine.current?.querySelector('[data-adventure-settings]'),action);return;}
  if(dialog.current?.open){if(action==='back'||action==='pause')close();else navigateGamepadMenu(dialog.current,action);return;}
  if(current==='ready'){
   const title=machine.current?.querySelector('[data-title-screen]');
   if(action==='back'){title?.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));return;}
   if(action==='pause')action='confirm';
  }
  if(current==='playing'){if(action==='pause')engine.current?.pause();else if(action==='interact')void enterShop();return;}
  if(current==='paused'&&(action==='pause'||action==='back')){resume();return;}
  const shop=machine.current?.querySelector('[data-adventure-shop]');
  if(current==='shop'&&shop){if(action==='back'||action==='pause'){shop.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));return;}navigateGamepadMenu(shop.querySelector('[data-item-popup]')||shop,action);return;}
  navigateGamepadMenu(machine.current?.querySelector('[data-chapter-picker]')||machine.current?.querySelector('[data-adventure-overlay]')||machine.current?.querySelector('[data-title-menu]')||machine.current?.querySelector('[data-title-screen]')||machine.current,action);
 }
 async function abandon(){if(busy)return;setBusy(true);try{await receipts.current;const t=ticket.current;if(t&&run.current)await finishRun(t.id,{stars:run.current.starMoney,won:false,level:run.current.index});else await recoverRun();ticket.current=null;pendingChapter.current=null;engine.current?.reset(selected,gentle);setResult(null);setPhase('ready');}finally{setBusy(false);}}
 function choose(i){if(inRun||phase==='settling')return;setSelected(i);setResult(null);if(art){engine.current?.reset(i,gentle);setPhase('ready');}}
 function control(name){const keys=Array.isArray(name)?name:[name],release=()=>{for(const key of keys)input.current[key]=false;};return {onPointerDown:e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);for(const key of keys){if(!input.current[key]&&pressActions.has(key))pressed.current.set(key,(pressed.current.get(key)||0)+1);input.current[key]=true;}},onPointerUp:release,onPointerCancel:release,onLostPointerCapture:release};}
 async function fullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else await machine.current.requestFullscreen();}catch{/* Inline play remains available. */}}
 useEffect(()=>{
  const key=e=>{
   if(e.defaultPrevented||presentation||settingsOpen||dialog.current?.open)return;
   if(tutorial){if(e.code==='Escape'){e.preventDefault();setTutorial(false);}return;}
   const current=phaseRef.current;
   if(current==='chapter-intro'&&(e.code==='Enter'||e.code==='Space')){e.preventDefault();enterChapter();return;}
   if(current==='paused'&&['Escape','KeyP'].includes(e.code)){e.preventDefault();resume();return;}
   if(['ready','paused','result'].includes(current)){
    const action={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down'}[e.code];
    if(action){e.preventDefault();gamepadAction(action);}
    else if(e.code==='Enter'&&document.activeElement?.tagName!=='BUTTON'&&document.activeElement?.tagName!=='A'){e.preventDefault();gamepadAction('confirm');}
   }
  };window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);
 });
 return <div className={`${base.page} ${css.page}`} data-hexy-adventure data-phase={phase}>
  <section ref={machine} className={`${base.machine} ${css.machine}`} aria-label={en?'Hexy adventure game':'Aventura de Hexy'} data-gamepad-state={pad.state}>
   <div className={base.bezel} data-game-frame>
    <div className={`${base.screen} ${css.screen}`} data-game-screen data-active={playing}><canvas ref={screen} tabIndex="0" data-adventure-canvas aria-label={en?'Arrows to move and aim. Down to duck. Space to jump, Z to cast, X to roll. C casts strong magic immediately, even in the air or crouched. Press R for an invincible super cinematic. Jump twice to somersault; hold jump while descending to glide. Aim down while airborne. Hold F and diagonal Down to fire downward while standing. V holds the musical shield and consumes magic. P pauses.':'Flechas para moverte y apuntar; abajo para agacharte. Espacio salta, Z dispara, X rueda. C lanza magia fuerte al instante, en el aire o agachada. Pulsa R para un súper cinematográfico invencible. Salta dos veces para la marometa; mantén salto al caer para planear. Apunta abajo en el aire. Mantén F y diagonal abajo para disparar hacia abajo de pie. V mantiene el escudo musical y consume magia. P pausa.'}/><AdventureHUD hidden={phase.startsWith('shop')||['ready','loading','chapter-intro'].includes(phase)} hud={{...hud,money:((ticket.current?.practice||result?.practice)?0:save.stars)+(hud.money||0)}} en={en} playing={playing} inRun={inRun} onPause={()=>playing?engine.current.pause():resume()}/>
     {playing&&!hud.superActive&&hud.notice!=='start'&&hud.noticeTime>0&&!(hud.boss&&hud.notice==='locked')&&<div className={css.message} role="status">{words[hud.notice]?.[lang]}{hud.notice==='power'&&<small>{DRINKS[hud.weapon]?.name} · {DRINKS[hud.weapon]?.tip[lang]}</small>}</div>}
     {playing&&hud.nearShop&&<button className={shopCss.enter} data-enter-shop onClick={enterShop}>{en?'Enter':'Entrar'} · {pad.state==='connected'?'View ⧉':'E'}</button>}
     {phase==='shop'&&<AdventureShop save={save} en={en} reduced={reduced} muted={muted} onLeave={leaveShop} onSettings={openSettings} onSound={event=>event==='mute'?setMuted(!muted):arcadeSound(event,!muted)}/>}
     {phase==='ready'&&<AdventureFrontEnd en={en} save={save} selected={selected} onChoose={choose} onStart={practice=>{titleEntered.current=true;void start(practice);}} onSettings={openSettings} onTutorial={()=>setTutorial(true)} onEngage={()=>{unlockArcadeAudio();if(!muted)playMusic();}} busy={busy} gentle={gentle} onGentle={setGentle} reduced={reduced} active={!presentation} interactive={!presentation&&!settingsOpen&&!tutorial} returning={titleEntered.current}/>}
     {presentation&&phase==='ready'&&<AdventurePresentation en={en} onSkip={skipPresentation}/>}
     {phase==='chapter-intro'&&<AdventureChapterCard index={selected} en={en} onContinue={enterChapter} checkpoint={!!run.current?.checkpointAt}/>}
     {tutorial&&<AdventureTutorial en={en} onClose={()=>setTutorial(false)}/>}
     {['paused','result','loading','error','settling'].includes(phase)&&!(phase==='settling'&&run.current?.won)&&<div className={base.overlay} data-adventure-overlay data-paused={phase==='paused'}>
      {phase==='loading'&&<><span className={base.spinner}>✦</span><h2>{en?'Opening the story…':'Abriendo el cuento…'}</h2></>}
      {phase==='error'&&<><h2>{en?'The scenery needs a moment.':'El escenario necesita un momento.'}</h2><button onClick={()=>setRetry(n=>n+1)}>{en?'Try again':'Intentar otra vez'}</button></>}
      {phase==='paused'&&<><h2>{en?'PAUSE':'PAUSA'}</h2>{pad.state==='disconnected'&&<p className={css.padWarning} role="status">{en?'Controller disconnected. Reconnect it or use the keyboard.':'Mando desconectado. Reconéctalo o usa el teclado.'}</p>}<div className={css.pauseButtons}><SceneButton showArrow={false} data-pad-default onClick={resume}>{en?'Continue':'Continuar'} ▶</SceneButton><SceneButton showArrow={false} variant="violet" data-open-settings onClick={openSettings}>{en?'Options':'Opciones'}</SceneButton></div><button className={base.quiet} disabled={busy} onClick={abandon}>{ticket.current?.practice?(en?'End practice':'Terminar práctica'):(en?'Save coins and return to title':'Guardar monedas y volver al título')}</button></>}
      {phase==='settling'&&<h2>{en?'Saving the chorus…':'Guardando el coro…'}</h2>}
      {phase==='result'&&result&&<><h2>{result.won?(en?'The chorus is back!':'¡El coro vuelve a cantar!'):(en?'One more try, Hexy!':'¡Una vez más, Hexy!')}</h2><p>{result.won?result.stars+' ★':run.current?.checkpointAt?(en?'Your last flag is waiting.':'Tu última bandera te está esperando.'):(en?'Let’s try this path again.':'Volvamos a intentarlo.')}</p>{!result.won&&<SceneButton data-pad-default data-retry-checkpoint onClick={retryCheckpoint}>{en?'Continue':'Continuar'} ▶</SceneButton>}<button onClick={abandon}>{en?'Return to title':'Volver al título'}</button></>}

     </div>}
     {settingsOpen&&<AdventureSettings en={en} onTabChange={setSettingsTab} onTutorial={()=>{closeSettings();setTutorial(true);}} onFullscreen={fullscreen} finish={finish} onFinish={setFinish} settings={audioSettings} pad={pad} onClose={closeSettings} onPreview={()=>arcadeSound('power',!muted)}/>}
     {audioBlocked&&!muted&&(playing||phase==='shop'||phase==='ready'||settingsOpen)&&<button className={css.audioUnlock} data-audio-unlock onClick={()=>{unlockArcadeAudio();playMusic();}}>{en?'Click to activate sound':'Haz clic para activar el sonido'} ♪</button>}
    </div>
   </div>
   {inRun&&<div className={css.touchControls} data-touch-controls aria-label={en?'Game controls':'Controles del juego'}>
    <div className={css.dpad}>{[
     ['ul',['left','up'],'↖',en?'Aim diagonally left':'Apuntar diagonal izquierda'],['u','up','↑',en?'Aim up':'Apuntar arriba'],['ur',['right','up'],'↗',en?'Aim diagonally right':'Apuntar diagonal derecha'],
     ['l','left','←',en?'Move left':'Mover izquierda'],['r','right','→',en?'Move right':'Mover derecha'],
     ['dl',['left','down'],'↙',en?'Aim down left / crouch walk':'Apuntar abajo izquierda / caminar agachada'],['d','down','↓',en?'Duck':'Agacharse'],['dr',['right','down'],'↘',en?'Aim down right / crouch walk':'Apuntar abajo derecha / caminar agachada'],
    ].map(([id,keys,icon,label])=><button key={id} data-direction={id} {...control(keys)} disabled={!playing} aria-label={label}>{icon}</button>)}</div>
    <div className={css.actions}>
     <button {...control('hold')} disabled={!playing} data-held={!!hud.holding} aria-label={en?'Hold position':'Mantener posición'}>HOLD<small>F</small></button>
     <button {...control('guard')} disabled={!playing} data-held={!!hud.guarding} aria-label={en?'Musical shield':'Escudo musical'}>♫<small>V</small></button>
     <button {...control('dash')} disabled={!playing} aria-label={en?'Dash':'Impulso'} title={en?'Ground roll; airborne dash':'Rodar en suelo; dash en el aire'}>↻<small>X</small></button>
     <button {...control('super')} disabled={!playing||hud.exhaustion>0||(hud.superCooldown>0&&!(hud.superCapacity>1&&hud.superReserve>0))||(hud.magic??100)<SUPER_COST||hud.superActive} data-charged={!!hud.superActive} data-super-control aria-label={en?'Super attack':'Súper ataque'} title={en?'Press R. 90 magic. Invincible during the cinematic.':'Pulsa R. 90 de magia. Invencible durante la secuencia.'}>✺<small>{hud.superActive?'ENCORE':'R · SUPER'}</small></button>
     <button {...control('attack')} disabled={!playing} aria-label={en?'Cast magic':'Lanzar magia'}>★<small>Z</small></button>
     <button {...control('special')} disabled={!playing||(hud.weapon>=0&&hud.ammo<5&&!(hud.overdrive>0))||hud.exhaustion>0||(hud.magic??100)<special.cost} aria-label={en?'Strong magic':'Magia fuerte'} title={`${special.name[lang]} · ${special.cost}${en?' magic':' de magia'}${specialKind>=0?(en?' + 5 shots':' + 5 disparos'):''}`}>✹<small>C</small></button>
     <button {...control('jump')} className={css.jumpControl} disabled={!playing} aria-label={en?'Jump':'Saltar'}>↟<small>{en?'SPACE · HOLD TO GLIDE':'ESPACIO · MANTÉN: PLANEAR'}</small></button>
    </div>
   </div>}
  </section>
  <audio ref={audio} src={musicTrack.src} data-music-track={musicTrack.key} aria-label={musicTrack.title} preload="none"/>
  <IllustratedMenu dialogRef={dialog} id="adventure-menu" en={en} currentPath="/arcade" finish={finish} onFinishChange={setFinish} onClose={close} onClosed={()=>setMenuOpen(false)} resume={en?'Back to the adventure':'Volver a la aventura'}/>
  <HexyFinish arcade monochrome={finish.monochrome?1:0} enabled={finish.enabled} reduced={reduced} settings={finish} target={menuOpen?dialog.current:null}/>
 </div>;
}
