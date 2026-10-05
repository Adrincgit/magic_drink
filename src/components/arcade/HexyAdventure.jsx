import adventureWords from '../../../public/arcade/texts/adventure.json';
﻿import {useCallback,useEffect,useRef,useState} from 'react';
import {useStore} from '@nanostores/react';
import {isEnglish} from '../../data/variables';
import {LEVELS,DRINKS} from './adventureLevels';
import {adventureMusic} from './adventureWorlds';
import AdventureHUD from './AdventureHUD';
import AdventureShop from './AdventureShopDialog';
import AdventureSettings from './AdventureSettings';
import useAdventureGamepad from './useAdventureGamepad';
import {navigateGamepadMenu} from './adventureGamepad';
import {useArcadeAudioSettings,updateArcadeAudioSettings,adventureMusicVolume} from './arcadeAudioSettings';
import {canEnterShop,beginShopTransition,stepShopTransition} from './adventureShop';
import {updateMods,superCapacity,reserveRecharge} from './adventureMods';
import {grantStartingDrink} from './adventureAmmo';
import shopCss from './adventureShop.module.css';
import {createAdventure,stepAdventure,adventureCarry} from './adventureModel';
import {loadAdventureArt,renderAdventure} from './adventureCanvas';
import {hexyPose} from './hexyAnimation';
import {spellFor,SUPER_DURATION,SUPER_COST} from './adventureMagic';
import {beginRun,finishRun,recoverRun,advanceAdventure,useArcadeSave,bankAdventureStars} from './arcadeStore';
import {ArcadeWallet} from './BunnyHunt';
import MagicCoin from './MagicCoin';
import {arcadeSound,unlockArcadeAudio,muteArcadeSounds,setArcadeSoundsVolume} from './arcadeSound';
import {SceneButton} from '../global/SceneControls';
import IllustratedMenu,{IllustratedMenuTrigger} from '../global/IllustratedMenu';
import useIllustratedFinish from '../global/useIllustratedFinish';
import usePlazaDialog from '../index/Secciones/usePlazaDialog';
import HexyFinish from '../hexy/HexyFinish';
import base from './bunnyArcade.module.css';
import css from './hexyAdventure.module.css';

const words=adventureWords;
const empty=()=>({left:false,right:false,up:false,down:false,jump:false,attack:false,dash:false,special:false,super:false,hold:false,guard:false});
const pressActions=new Set(['jump','attack','dash','special','super']);
export default function HexyAdventure(){
 const language=useStore(isEnglish),[hydrated,setHydrated]=useState(false),en=hydrated&&language,save=useArcadeSave();
 const [phase,setPhaseState]=useState('loading'),phaseRef=useRef('loading'),[selected,setSelected]=useState(0),[art,setArt]=useState(null),[retry,setRetry]=useState(0),[gentle,setGentle]=useState(false),[reduced,setReduced]=useState(false),[busy,setBusy]=useState(false),[result,setResult]=useState(null),[menuOpen,setMenuOpen]=useState(false),[settingsOpen,setSettingsOpen]=useState(false);
 const audioSettings=useArcadeAudioSettings(),muted=audioSettings.muted,setMuted=value=>updateArcadeAudioSettings({muted:value});
 const [audioBlocked,setAudioBlocked]=useState(false);
 const [hud,setHud]=useState({hearts:5,score:0,rescued:0,power:false,notice:'start',noticeTime:5,boss:false,combo:0});
 const screen=useRef(null),machine=useRef(null),run=useRef(null),input=useRef(empty()),padInput=useRef({}),pressed=useRef(new Map()),engine=useRef(null),ticket=useRef(null),audio=useRef(null),opts=useRef({}),pendingChapter=useRef(null);
 const shopAction=useRef(null),shopOpening=useRef(false);
 const [finish,setFinish]=useIllustratedFinish(),dialog=useRef(null),{open,close}=usePlazaDialog(dialog);
 opts.current={reduced,muted,en};const level=LEVELS[selected],playing=phase==='playing',inRun=playing||phase==='paused'||phase==='between'||phase==='shop'||phase.startsWith('shop-'),lang=en?1:0;
 const specialKind=hud.weapon??-1,special=spellFor(specialKind);
 const setPhase=useCallback(next=>{phaseRef.current=next;setPhaseState(next);},[]);
 const pad=useAdventureGamepad({
  getContext:()=>settingsOpen?'settings':dialog.current?.open?'site-menu':phaseRef.current,
  onInput:(keys,edges)=>{padInput.current=keys;for(const key of edges)if(pressActions.has(key)&&!input.current[key])pressed.current.set(key,(pressed.current.get(key)||0)+1);},
  onAction:gamepadAction,
  onDisconnect:()=>engine.current?.pause()
 });
 useEffect(()=>{try{isEnglish.set(localStorage.getItem('lang')==='en');}catch{}setHydrated(true);const m=matchMedia('(prefers-reduced-motion:reduce)'),update=()=>setReduced(m.matches);update();m.addEventListener('change',update);return()=>m.removeEventListener('change',update);},[]);
 useEffect(()=>{let live=true;setPhase('loading');loadAdventureArt().then(a=>{if(live){setArt(a);setPhase('ready');}}).catch(()=>{if(live)setPhase('error');});return()=>{live=false;};},[retry,setPhase]);
 useEffect(()=>{
  if(!art)return;let raf=0,last=0,acc=0,hudAt=0,disposed=false;const canvas=screen.current;run.current=createAdventure(0);
  const paint=()=>{renderAdventure(canvas,run.current,art,opts.current);const pose=hexyPose(run.current);canvas.dataset.pose=pose.sheet+':'+pose.frame;canvas.dataset.charge=run.current.player.charge.toFixed(2);};
  const publish=()=>{const s=run.current;setHud({hearts:s.hearts,score:s.score,money:Math.max(0,s.starMoney-(s.bankedStars||0)),nearShop:canEnterShop(s),mods:s.mods,modLevels:s.modLevels,reserveDuration:reserveRecharge(s),ammoCapacity:s.ammoCapacity,superCapacity:superCapacity(s),superReserve:s.superReserve,reserveCooldown:s.reserveCooldown,drinkTier:s.drinkTier,overdrive:s.overdrive,rescued:s.rescued,power:s.power,notice:s.notice,noticeTime:s.noticeTime,clearing:!!s.clear,boss:s.boss.phase!=='sleep'&&s.boss.hp>0,combo:s.combo,weapon:s.weapon,ammo:s.ammo,shield:s.shield,maxHearts:s.maxHearts,guarding:s.player.guarding,holding:s.player.holding,guardEmpty:s.player.guardExhausted,magic:s.magic,charge:s.player.charge,exhaustion:s.exhaustion,superCooldown:s.superCooldown,starPulse:s.starPulse,superActive:!!s.superCinematic,superProgress:(s.superCinematic?.age||0)/SUPER_DURATION,move:s.boss.move,bossPhase:s.boss.phase,stage:s.boss.stage});canvas.dataset.playerX=s.player.x.toFixed(1);canvas.dataset.playerY=s.player.y.toFixed(1);canvas.dataset.level=String(s.index);canvas.dataset.nearShop=String(canEnterShop(s));canvas.dataset.mods=s.mods.join(',');canvas.dataset.superReserve=String(s.superReserve);canvas.dataset.crouch=String(s.player.crouch);canvas.dataset.dash=String(s.player.dash>0);canvas.dataset.aim=String(s.player.aimY);canvas.dataset.bossPhase=s.boss.phase;canvas.dataset.weapon=String(s.weapon);canvas.dataset.ammo=String(s.ammo);canvas.dataset.bossStage=String(s.boss.stage);canvas.dataset.hold=String(!!s.player.holding);canvas.dataset.guard=String(!!s.player.guarding);canvas.dataset.gliding=String(!!s.player.gliding);canvas.dataset.jumps=String(s.player.jumps);canvas.dataset.exhaustion=s.exhaustion.toFixed(2);canvas.dataset.superActive=String(!!s.superCinematic);canvas.dataset.superCooldown=s.superCooldown.toFixed(2);canvas.dataset.score=String(s.score);canvas.dataset.money=String(s.starMoney);canvas.dataset.drinkTier=String(s.drinkTier);canvas.dataset.overdrive=(s.overdrive||0).toFixed(2);};
  async function settle(){
   const t=ticket.current;if(!t)return;const s=run.current;setPhase('settling');input.current=empty();
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
    stepAdventure(run.current,keys,1/120);acc-=1/120;for(const e of run.current.events)arcadeSound(e,!opts.current.muted);
   }
   paint();canvas.dataset.simFrame=String(run.current.ticks);if(now-hudAt>110||run.current.done){publish();hudAt=now;}if(run.current.done){void settle();return;}raf=requestAnimationFrame(tick);
  }
  const wake=()=>{last=0;acc=0;if(!raf)raf=requestAnimationFrame(tick);};
  const pause=()=>{input.current=empty();padInput.current={};pressed.current.clear();run.current.player.guarding=false;run.current.player.holding=false;if(!run.current.superCinematic){run.current.player.charge=0;run.current.player.pendingSpecial=null;run.current.player.specialCast=0;}if(phaseRef.current==='playing'||phaseRef.current==='between'){setPhase('paused');cancelAnimationFrame(raf);raf=0;}};
  engine.current={paint,publish,wake,pause,reset:(index,easy,carry)=>{pressed.current.clear();run.current=createAdventure(index,easy,carry);canvas.dataset.simFrame='0';publish();paint();}};
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
 const musicTrack=adventureMusic(selected,hud.clearing?'between':phase,hud.boss,result?.won);
 useEffect(()=>{setArcadeSoundsVolume(audioSettings.master/100,audioSettings.effects/100);muteArcadeSounds(muted);if(!audio.current)return;audio.current.volume=adventureMusicVolume(audioSettings,phase==='shop'?.35:hud.superActive?.22:.48);audio.current.muted=muted;audio.current.loop=musicTrack.loop;if(!muted&&(playing||phase==='between'||phase==='result'||phase==='shop'||settingsOpen))playMusic();else{audio.current.pause();setAudioBlocked(false);}},[playing,audioSettings,musicTrack.src,musicTrack.loop,phase,hud.superActive,settingsOpen]);
 useEffect(()=>{
  // Browser autoplay may require a real click/key even after a controller press.
  const unlock=()=>{unlockArcadeAudio();if(!opts.current.muted&&['playing','shop','between','result'].includes(phaseRef.current))playMusic();};
  window.addEventListener('pointerdown',unlock);window.addEventListener('keydown',unlock);return()=>{window.removeEventListener('pointerdown',unlock);window.removeEventListener('keydown',unlock);};
 },[]);
 const nextChapter=useCallback(()=>{const n=pendingChapter.current;if(!n)return;pendingChapter.current=null;setSelected(n.index);engine.current.reset(n.index,n.gentle,n.carry);input.current=empty();setPhase('playing');engine.current.wake();},[setPhase]);
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
  shopOpening.current=true;engine.current.pause();const s=run.current;beginShopTransition(s);setPhase('shop-entering');
  try{const t=ticket.current;if(!t){delete s.shopTransition;resume();return;}const banked=await bankAdventureStars(t.id,s.index,s.starMoney);
   if(banked===false){delete s.shopTransition;resume();return;}s.bankedStars=banked;s.shopTransition.ready=true;
  }finally{shopOpening.current=false;}
 }
 shopAction.current=enterShop;
 function leaveShop(){updateMods(run.current,save.modsEquipped,save.modLevels);grantStartingDrink(run.current);beginShopTransition(run.current,true);engine.current.publish();engine.current.paint();setPhase('shop-leaving');}
 async function start(practice){if(busy||!art||inRun)return;setBusy(true);unlockArcadeAudio();muteArcadeSounds(muted);try{const t=await beginRun(practice,selected);if(!t)return;ticket.current=t;setResult(null);engine.current.reset(selected,gentle,{mods:save.modsEquipped,modLevels:save.modLevels});input.current=empty();setPhase('playing');screen.current.scrollIntoView({block:'center',behavior:'instant'});screen.current.focus({preventScroll:true});engine.current.wake();arcadeSound('start',!muted);}finally{setBusy(false);}}
 function resume(){if(pendingChapter.current){nextChapter();return;}input.current=empty();setPhase('playing');engine.current.wake();screen.current.focus({preventScroll:true});}
 function openSettings(){engine.current?.pause();setSettingsOpen(true);unlockArcadeAudio();}
 function closeSettings(){setSettingsOpen(false);}
 function playMusic(){if(audio.current)void audio.current.play().then(()=>setAudioBlocked(false)).catch(error=>{if(error.name==='NotAllowedError')setAudioBlocked(true);});}
 function gamepadAction(action){
  const current=phaseRef.current;
  if(settingsOpen){if(action==='back'||action==='pause')closeSettings();else navigateGamepadMenu(machine.current?.querySelector('[data-adventure-settings]'),action);return;}
  if(dialog.current?.open){if(action==='back'||action==='pause')close();else navigateGamepadMenu(dialog.current,action);return;}
  if(current==='playing'){if(action==='pause')engine.current?.pause();else if(action==='interact')void enterShop();return;}
  if(current==='paused'&&(action==='pause'||action==='back')){resume();return;}
  const shop=machine.current?.querySelector('[data-adventure-shop]');
  if(current==='shop'&&shop){if(action==='back'||action==='pause'){shop.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));return;}navigateGamepadMenu(shop.querySelector('[data-item-popup]')||shop,action);return;}
  navigateGamepadMenu(current==='paused'?machine.current?.querySelector('[data-adventure-overlay]'):machine.current,action);
 }
 async function abandon(){if(busy)return;setBusy(true);try{await recoverRun();ticket.current=null;pendingChapter.current=null;engine.current?.reset(selected,gentle);setResult(null);setPhase('ready');}finally{setBusy(false);}}
 function choose(i){if(inRun||phase==='settling')return;setSelected(i);setResult(null);if(art){engine.current?.reset(i,gentle);setPhase('ready');}}
 function control(name){const keys=Array.isArray(name)?name:[name],release=()=>{for(const key of keys)input.current[key]=false;};return {onPointerDown:e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);for(const key of keys){if(!input.current[key]&&pressActions.has(key))pressed.current.set(key,(pressed.current.get(key)||0)+1);input.current[key]=true;}},onPointerUp:release,onPointerCancel:release,onLostPointerCapture:release};}
 async function fullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else await machine.current.requestFullscreen();}catch{/* Inline play remains available. */}}
 const changeLanguage=()=>{isEnglish.set(!en);try{localStorage.setItem('lang',en?'es':'en');}catch{}};
 return <div className={`${base.page} ${css.page}`} data-hexy-adventure data-phase={phase}>
  <nav className={base.topbar}><a href="/wonderpop-plaza" className={base.brand}>★ MAGIC DRINK<span>{en?'Back to Wonderpop':'Volver a Wonderpop'} ↗</span></a><div className={base.topActions}><button onClick={changeLanguage}>{en?'ES':'EN'}</button><IllustratedMenuTrigger en={en} aria-haspopup="dialog" onClick={()=>{engine.current?.pause();open();setMenuOpen(true);}}/></div></nav>
  <div className={base.intro}><span>WONDERPOP · SECRET ARCADE</span><h1>HEXY <em>& THE LOST CHORUS</em></h1><p>{en?'A stolen chorus. A travelling circus. One star to bring them home.':'Un coro robado. Un circo ambulante. Una estrella para volver a casa.'}</p></div>
  <div className={css.map} aria-label={en?'Choose a chapter':'Elige un capítulo'}>{LEVELS.map((l,i)=><button key={i} disabled={inRun||phase==='settling'} aria-pressed={selected===i} onClick={()=>choose(i)} data-level-choice={i} style={{'--zone':l.color}}><span>{save.adventureCleared.includes(i)?'★':String(i+1).padStart(2,'0')}</span><b>{l.name[lang]}</b><small>{i>save.adventureUnlocked?(en?'Practice available':'Puedes practicar'):save.adventureCleared.includes(i)?(en?'Chorus rescued':'Coro rescatado'):(en?'Ready to explore':'Por descubrir')}</small></button>)}</div>
  <section ref={machine} className={`${base.machine} ${css.machine}`} aria-label={en?'Hexy adventure game':'Aventura de Hexy'} data-gamepad-state={pad.state}>
   <div className={css.chapter}><div><span>{en?'CHAPTER':'CAPÍTULO'} 0{selected+1}</span><h2>{level.name[lang]}</h2></div><div className={css.chapterActions}><button onClick={openSettings} data-open-settings aria-label={en?'Audio and controller settings':'Ajustes de audio y mando'}>⚙</button><button onClick={()=>setMuted(!muted)} aria-pressed={!muted} aria-label={en?'Game sound':'Sonido del juego'}>{muted?'♪ ×':'♪'}</button><button onClick={fullscreen} aria-label={en?'Toggle full screen':'Cambiar pantalla completa'}>⛶</button></div></div>
   <div className={base.bezel}>
    <div className={`${base.screen} ${css.screen}`} data-active={playing}><canvas ref={screen} tabIndex="0" data-adventure-canvas aria-label={en?'Arrows to move and aim. Down to duck. Space to jump, Z to cast, X to roll. C casts strong magic immediately, even in the air or crouched. Press R for an invincible super cinematic. Jump twice to somersault; hold jump while descending to glide. Aim down while airborne. F holds position to aim. V holds the musical shield and consumes magic. P pauses.':'Flechas para moverte y apuntar; abajo para agacharte. Espacio salta, Z dispara, X rueda. C lanza magia fuerte al instante, en el aire o agachada. Pulsa R para un súper cinematográfico invencible. Salta dos veces para la marometa; mantén salto al caer para planear. Apunta abajo en el aire. F fija tu posición para apuntar. V mantiene el escudo musical y consume magia. P pausa.'}/><AdventureHUD hidden={phase.startsWith('shop')} hud={{...hud,money:((ticket.current?.practice||result?.practice)?0:save.stars)+(hud.money||0)}} en={en} playing={playing} inRun={inRun} onPause={()=>playing?engine.current.pause():resume()}/>
     {playing&&!hud.superActive&&hud.notice!=='start'&&hud.noticeTime>0&&!(hud.boss&&hud.notice==='locked')&&<div className={css.message} role="status">{words[hud.notice]?.[lang]}{hud.notice==='power'&&<small>{DRINKS[hud.weapon]?.name} · {DRINKS[hud.weapon]?.tip[lang]}</small>}</div>}
     {playing&&hud.nearShop&&<button className={shopCss.enter} data-enter-shop onClick={enterShop}>{en?'Enter':'Entrar'} · {pad.state==='connected'?'View ⧉':'E'}</button>}
     {phase==='shop'&&<AdventureShop save={save} en={en} reduced={reduced} muted={muted} onLeave={leaveShop} onSettings={openSettings} onSound={event=>event==='mute'?setMuted(!muted):arcadeSound(event,!muted)}/>}
     {phase!=='playing'&&phase!=='between'&&!phase.startsWith('shop')&&!(phase==='settling'&&run.current?.won)&&<div className={base.overlay} data-adventure-overlay>
      {phase==='loading'&&<><span className={base.spinner}>✦</span><h2>{en?'Opening the story…':'Abriendo el cuento…'}</h2></>}
      {phase==='error'&&<><h2>{en?'The scenery needs a moment.':'El escenario necesita un momento.'}</h2><button onClick={()=>setRetry(n=>n+1)}>{en?'Try again':'Intentar otra vez'}</button></>}
      {phase==='ready'&&<><span className={base.small}>{en?'THREE LITTLE VOICES TO FIND':'TRES VOCES PEQUEÑAS POR ENCONTRAR'}</span><h2>{level.name[lang]}</h2><p>{level.subtitle[lang]}</p><div className={base.instructions}><span>← → {en?'Move':'Mover'}</span><span>SPACE {en?'Jump':'Saltar'}</span><span>Z {en?'Magic':'Magia'}</span></div></>}
      {phase==='paused'&&<><h2>{en?'Your story can wait.':'Tu historia puede esperar.'}</h2>{pad.state==='disconnected'&&<p className={css.padWarning} role="status">{en?'Controller disconnected. Reconnect it or use the keyboard.':'Mando desconectado. Reconéctalo o usa el teclado.'}</p>}<div className={css.pauseButtons}><SceneButton showArrow={false} data-pad-default onClick={resume}>{en?'Continue':'Continuar'} ▶</SceneButton><SceneButton showArrow={false} variant="violet" onClick={openSettings}>{en?'Settings':'Ajustes'} ♫</SceneButton></div><button className={base.quiet} disabled={busy} onClick={abandon}>{ticket.current?.practice?(en?'End practice':'Terminar práctica'):(en?'Return my coin and leave':'Devolver mi moneda y salir')}</button></>}
      {phase==='between'&&<><span className={base.small}>{en?'ONE COIN. THE WHOLE ADVENTURE.':'UNA MONEDA. TODA LA AVENTURA.'}</span><h2>{en?'Onward, together!':'¡Seguimos juntos!'}</h2><p>{LEVELS[Math.min(4,selected+1)].name[lang]}</p></>}
      {phase==='settling'&&<h2>{en?'Saving the chorus…':'Guardando el coro…'}</h2>}
      {phase==='result'&&result&&<><span className={base.small}>{result.practice?(en?'PRACTICE':'PRÁCTICA'):(en?'YOUR LITTLE ADVENTURE':'TU PEQUEÑA AVENTURA')}</span><h2>{result.won?(selected===4?(en?'The chorus is back!':'¡El coro vuelve a cantar!'):(en?'The way is open!':'¡El camino está abierto!')):(en?'The story continues.':'La historia continúa.')}</h2><p>{result.stars} ★ · {result.rescued}/3 {en?'bunnies rescued':'bunnies rescatados'}{result.won&&!result.practice?' · +1 ◉':''}</p>{result.won&&selected<4&&<SceneButton showArrow={false} onClick={()=>choose(selected+1)}>{en?'Next chapter':'Siguiente capítulo'} →</SceneButton>}{!result.accepted&&<p>{en?'This entry was recovered in another tab.':'Esta entrada se recuperó en otra pestaña.'}</p>}</>}
     </div>}
     {settingsOpen&&<AdventureSettings en={en} settings={audioSettings} pad={pad} onClose={closeSettings} onPreview={()=>arcadeSound('power',!muted)}/>}
     {audioBlocked&&!muted&&(playing||phase==='shop'||settingsOpen)&&<button className={css.audioUnlock} data-audio-unlock onClick={()=>{unlockArcadeAudio();playMusic();}}>{en?'Click to activate sound':'Haz clic para activar el sonido'} ♪</button>}
    </div>
   </div>
   {inRun&&<div className={css.touchControls} aria-label={en?'Game controls':'Controles del juego'}>
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
   {!inRun&&<div className={base.deck}><div className={base.coinSlot} data-credit-count><span>{en?'YOUR COINS':'TUS MONEDAS'}</span><b><MagicCoin/> {save.coins}</b><i/></div><div className={base.controls}>{save.run&&!ticket.current?<SceneButton onClick={abandon} disabled={busy||!art}>{en?'Recover entry':'Recuperar entrada'}</SceneButton>:<><SceneButton showArrow={false} onClick={()=>start(false)} data-insert-coin disabled={busy||!art||phase==='settling'||!save.coins||selected>save.adventureUnlocked}>{selected>save.adventureUnlocked?(en?'Finish the previous chapter':'Completa el capítulo anterior'):(en?'Insert coin · 1':'Echar moneda · 1')}</SceneButton><button className={base.practice} onClick={()=>start(true)} data-practice disabled={busy||!art||phase==='settling'}>{en?'Free practice':'Práctica gratis'} ↗</button></>}</div></div>}
   <div className={base.underDeck} data-adventure-options><label><input type="checkbox" checked={gentle} disabled={inRun} onChange={e=>setGentle(e.target.checked)}/>{en?'A gentler adventure':'Una aventura más tranquila'}</label><span>{en?'↑ AIM · ↓ DUCK · SPACE JUMP · Z FIRE · X ROLL / AIR DASH':'↑ APUNTAR · ↓ AGACHAR · ESPACIO SALTAR · Z DISPARAR · X RODAR / DASH AÉREO'}</span></div>
   <p className={css.padHint} data-controller-hint>{pad.state==='connected'?(en?'CONTROLLER READY · A jump · X / RT cast · B roll · Y strong · LB hold aim · LT shield · RB super · Menu pause':'MANDO CONECTADO · A saltar · X / RT disparar · B rodar · Y fuerte · LB fijar apuntado · LT escudo · RB súper · Menu pausa'):(en?'Xbox controller: connect by USB or Bluetooth, then press a button. Controls and volume in ⚙.':'Mando Xbox: conecta por USB o Bluetooth y pulsa un botón. Controles y volumen en ⚙.')}</p>
   <p className={css.specialTip}>{en?'Hold F + direction to aim without walking. Hold V for a frontal musical shield: 24 magic/second + 4 per block. Release to recharge. Shield items absorb one hit each; carry up to three.':'Mantén F + dirección para apuntar sin caminar. Mantén V para el escudo musical frontal: 24 de magia/segundo + 4 por bloqueo. Suelta para recargar. Cada escudo recogido absorbe un golpe; puedes acumular hasta tres.'}</p>
   <p className={css.specialTip} data-special-tip><b>{DRINKS[specialKind]?.name||'Hexy'} · {special.name[lang]}</b><span>{special.tip[lang]}</span>{en?'Press C (✹): immediate, on the ground, crouched or airborne.':'Pulsa C (✹): inmediato, en el suelo, agachada o en el aire.'} {special.cost}{en?' magic':' de magia'}{specialKind>=0&&(en?' + 5 drink shots.':' + 5 disparos de la bebida.')}</p>
   <p className={css.specialTip} data-super-tip>{en?'R · Star Encore: one invincible super, 90 magic and a separate 40-second recharge. After casting, magic recovers slowly for 8 seconds. Each star is worth 1 in money. Supply crates contain drinks, ammunition, shields or the rare Original: 10 seconds of invincibility and rapid fire. Collect the same flavor twice for larger attacks. Space twice: double jump; hold Space while falling: hat glide.':'R · Encore estelar: un súper invencible, 90 de magia y recarga independiente de 40 segundos. Tras usarlo, la magia se recupera lentamente durante 8 segundos. Cada estrella vale 1 de dinero. Las cajas pueden dar bebidas, munición, escudos o la Original: 10 segundos de invencibilidad y disparo rápido. Repite un sabor para potenciar el tamaño de sus ataques. Espacio dos veces: doble salto; mantén Espacio al caer: planeo.'}</p>
   <p className={base.notice}>{en?'Defeat the boss: Hexy plants her flag and heads straight to the next chapter. Rescue bunnies if you want extra allies and rewards.':'Vence al jefe: Hexy planta su bandera y avanza al siguiente capítulo. Rescata bunnies si quieres aliados y recompensas extra.'}</p>
  </section>
  <section className={css.rules}><div><span>{en?'MAGIC WITH PERSONALITY':'MAGIA CON PERSONALIDAD'}</span><h2>{en?'Every sip changes the adventure.':'Cada sorbo cambia la aventura.'}</h2><p>{en?'Madame Muta’s troupe has stolen the drinks and caged the chorus. Free your friends: they restore hearts and sing magic beside you. Each can grants a limited supply of powered shots, then your wand returns to basic magic. Destroy clown tents to stop their reinforcements. One coin carries you through all five chapters.':'La compañía de Madame Muta robó las bebidas y encerró al coro. Libera a tus amigos: recuperan corazones y cantan magia contigo. Cada lata aporta una reserva de disparos; al agotarla, tu varita vuelve a la magia básica. Destruye las carpas de payasos para detener sus refuerzos. Una moneda te lleva por los cinco capítulos.'}</p><a href="/arcade/bunny">{en?'The original bunny sprint':'La carrera de los bunnies'} ↗</a></div><ArcadeWallet en={en}/></section>
  <audio ref={audio} src={musicTrack.src} data-music-track={musicTrack.key} aria-label={musicTrack.title} preload="none"/>
  <IllustratedMenu dialogRef={dialog} id="adventure-menu" en={en} currentPath="/arcade" finish={finish} onFinishChange={setFinish} onClose={close} onClosed={()=>setMenuOpen(false)} resume={en?'Back to the adventure':'Volver a la aventura'}/>
  <HexyFinish enabled={finish.enabled} reduced={reduced} settings={finish} target={menuOpen?dialog.current:null}/>
 </div>;
}

