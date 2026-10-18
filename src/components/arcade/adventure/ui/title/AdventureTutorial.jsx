import {useEffect,useRef,useState} from 'react';
import {TUTORIAL_LESSONS,createTutorial,stepTutorial,tutorialDemoInput} from '../../engine/adventureTutorial';
import {renderAdventure} from '../../render/adventureCanvas';
import {readAdventureGamepad} from '../../input/adventureGamepad';
import {bindingName} from '../../input/gamepadBindings';
import css from './adventureTutorial.module.css';
const keyboard={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowDown:'down',KeyS:'down',ArrowUp:'up',KeyW:'up',Space:'jump',KeyZ:'attack',KeyJ:'attack',KeyX:'dash',ShiftLeft:'dash',KeyC:'special',KeyL:'special',KeyF:'hold',ControlLeft:'hold',KeyV:'guard',KeyR:'super',KeyQ:'swap',KeyB:'coaster'};
const names={left:['Izquierda','Left'],right:['Derecha','Right'],up:['Arriba','Up'],down:['Abajo','Down'],jump:['Saltar','Jump'],attack:['Disparar','Fire'],dash:['Rodar','Dash'],special:['Fuerte','Strong'],hold:['Apuntar','Aim'],super:['Súper','Super'],guard:['Escudo','Shield'],swap:['Alternar','Cycle'],coaster:['Posavasos','Coaster']};
export default function AdventureTutorial({en,onClose,art,reduced,bindings,onSound}){
 const [index,setIndex]=useState(0),[interactive,setInteractive]=useState(false),[complete,setComplete]=useState(false),[revision,setRevision]=useState(0);
 const root=useRef(null),canvas=useRef(null),guardMeter=useRef(null),guardStatus=useRef(null),input=useRef({}),taps=useRef({}),state=useRef(null),live=useRef({});live.current={art,reduced,interactive,bindings,onSound};
 const lesson=TUTORIAL_LESSONS[index],lang=en?1:0,t=(es,eng)=>en?eng:es;
 const clear=()=>{input.current={};taps.current={};};
 const next=delta=>{clear();setInteractive(false);setIndex(n=>(n+delta+TUTORIAL_LESSONS.length)%TUTORIAL_LESSONS.length);};
 useEffect(()=>{const el=root.current,previous=document.activeElement,siblings=[...el.parentElement.children].filter(q=>q!==el).map(q=>[q,q.inert]);siblings.forEach(([q])=>{q.inert=true;});el.querySelector('[data-pad-default]')?.focus();return()=>{siblings.forEach(([q,inert])=>{q.inert=inert;});if(previous?.isConnected)previous.focus({preventScroll:true});};},[]);
 useEffect(()=>{const el=root.current,page=e=>next(e.detail);el.addEventListener('tutorial-page',page);return()=>el.removeEventListener('tutorial-page',page);},[]);
 useEffect(()=>{
  clear();setComplete(false);state.current=createTutorial(lesson.id);let frame,last=0,acc=0,pauseHeld=false,published=false,padReset=true,blocked={};
  const animate=now=>{frame=requestAnimationFrame(animate);const dt=last?Math.min(.05,(now-last)/1000):0;last=now;if(document.hidden||!live.current.art)return;acc+=dt;
   let s=state.current;if(!live.current.interactive&&s.time>(lesson.id==='guard'?8.5:lesson.id==='super'?8.3:5.5)){s=state.current=createTutorial(lesson.id);published=false;}
   const raw=live.current.interactive?readAdventureGamepad(Array.from(navigator.getGamepads?.()||[]).find(p=>p?.connected&&p.mapping==='standard'),live.current.bindings):null;
   if(raw&&padReset){blocked={...raw};padReset=false;}const pad=raw?Object.fromEntries(Object.entries(raw).map(([key,value])=>{if(!value)delete blocked[key];return[key,value&&!blocked[key]];})):null;
   if(pad?.pause&&!pauseHeld){clear();setInteractive(false);}pauseHeld=!!pad?.pause;
   while(acc>=1/120){const controls=live.current.interactive?Object.fromEntries([...new Set([...Object.keys(input.current),...Object.keys(taps.current),...Object.keys(pad||{})])].map(k=>[k,!!input.current[k]||!!taps.current[k]||!!pad?.[k]])):tutorialDemoInput(s);stepTutorial(s,controls,1/120);if(live.current.interactive)for(const event of s.events)live.current.onSound?.(event);taps.current={};acc-=1/120;}
   renderAdventure(canvas.current,s,live.current.art,{en,reduced:live.current.reduced});canvas.current.dataset.lesson=lesson.id;canvas.current.dataset.pose=s.player.gliding?'glide':s.player.crouch?'duck':s.player.dash?'dash':s.player.guarding?'guard':String(s.player.jumps||0);canvas.current.dataset.playerX=s.player.x.toFixed(1);canvas.current.dataset.tutorialComplete=String(s.tutorial.complete);
   if(guardMeter.current){guardMeter.current.value=s.magic;guardStatus.current.textContent=s.player.guardExhausted?t('Escudo agotado: suelta para recuperar','Shield empty: release to recover'):s.player.guarding?t('Bloqueando','Blocking'):s.magic<95?t('Recuperando magia','Magic recovering'):t('Escudo listo','Shield ready');}
   if(s.tutorial.complete&&!published){published=true;if(live.current.interactive)setComplete(true);}
  };frame=requestAnimationFrame(animate);return()=>cancelAnimationFrame(frame);
 },[lesson.id,revision,en,interactive]);
 useEffect(()=>{const el=root.current,stop=()=>{clear();setInteractive(false);},blur=()=>{clear();};el.addEventListener('tutorial-stop',stop);window.addEventListener('blur',blur);return()=>{el.removeEventListener('tutorial-stop',stop);window.removeEventListener('blur',blur);};},[]);
 function key(e){
  if(e.key==='Escape'){e.preventDefault();e.stopPropagation();if(interactive){clear();setInteractive(false);}else onClose();return;}
  if(interactive&&keyboard[e.code]){e.preventDefault();e.stopPropagation();const action=keyboard[e.code];input.current[action]=e.type==='keydown';if(e.type==='keydown'&&!e.repeat)taps.current[action]=true;return;}
  if(!interactive&&e.type==='keydown'&&['ArrowLeft','ArrowRight'].includes(e.code)){e.preventDefault();e.stopPropagation();next(e.code==='ArrowRight'?1:-1);}
  if(e.key==='Tab'&&e.type==='keydown'){const items=[...root.current.querySelectorAll('button:not(:disabled)')],at=items.indexOf(document.activeElement);e.preventDefault();items[(at+(e.shiftKey?-1:1)+items.length)%items.length]?.focus();}
 }
 function play(){clear();setComplete(false);state.current=createTutorial(lesson.id);setInteractive(true);canvas.current.focus({preventScroll:true});}
 const touch=action=>({onPointerDown:e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);input.current[action]=true;taps.current[action]=true;},onPointerUp:()=>{input.current[action]=false;},onPointerCancel:()=>{input.current[action]=false;},onLostPointerCapture:()=>{input.current[action]=false;}});
 const padActions=lesson.actions.filter(a=>bindings[a]),padText=padActions.map(a=>bindingName(bindings,a)).join(' + ');
 return <div ref={root} className={css.shade} data-tutorial data-tutorial-playing={interactive} role="dialog" aria-modal="true" aria-label={t('Cómo jugar','How to play')} onKeyDown={key} onKeyUp={key}>
  <section className={css.paper}>
   <header><div><small>{t('EL ENSAYO DE HEXY','HEXY’S REHEARSAL')}</small><h2>{t('Tu magia, en tus manos','Your magic, in your hands')}</h2></div><span>{index+1} / {TUTORIAL_LESSONS.length}</span></header>
   <nav className={css.chapters} aria-label={t('Lecciones','Lessons')}>{TUTORIAL_LESSONS.map((l,i)=><button key={l.id} data-tutorial-lesson={l.id} aria-label={l.title[lang]} aria-pressed={index===i} onClick={()=>{clear();setInteractive(false);setIndex(i);}}>{i+1}</button>)}</nav>
   <div className={css.lesson}>
    <div className={css.stage}><canvas ref={canvas} tabIndex={0} data-tutorial-canvas aria-label={lesson.title[lang]}/><span>{interactive?t('TU TURNO','YOUR TURN'):t('DEMOSTRACIÓN','DEMONSTRATION')}</span>{lesson.id==='guard'&&<div className={css.guardReadout} data-tutorial-guard><span>{t('Magia','Magic')}</span><meter ref={guardMeter} min="0" max="100" defaultValue="100" aria-label={t('Magia del escudo','Shield magic')}/><strong ref={guardStatus}/></div>}{interactive&&<div className={css.touch}>{[...new Set(['left','right',...lesson.actions])].map(action=><button key={action} {...touch(action)} aria-label={names[action]?.[lang]}>{names[action]?.[lang]}</button>)}</div>}</div>
    <article><small>{t('PASO','STEP')} {index+1}</small><h3>{lesson.title[lang]}</h3><p>{lesson.text[lang]}</p><div className={css.control}><b>{t('TECLADO','KEYBOARD')}</b><span>{en?lesson.keys.replace('Espacio','Space').replace('mantener','hold').replace('dirección','direction'):lesson.keys}</span></div><div className={css.control}><b>{t('MANDO','CONTROLLER')}</b><span>{padText||t('Cruceta / stick izquierdo','D-pad / left stick')}</span></div><p className={css.goal} data-tutorial-goal>{complete?t('¡Eso es! Ya lo tienes.','That’s it! You’ve got it.'):lesson.goal[lang]}</p></article>
   </div>
   <footer><div className={css.modes}><button data-pad-default data-tutorial-play aria-pressed={interactive} onClick={play}>{t('Probar yo','My turn')}</button><button data-tutorial-demo aria-pressed={!interactive} onClick={()=>{clear();setInteractive(false);setRevision(n=>n+1);}}>{t('Ver demo','Watch demo')}</button></div><div className={css.paging}><button data-tutorial-prev onClick={()=>next(-1)}>LB · ←</button><button data-tutorial-next onClick={()=>next(1)}>{t('Siguiente','Next')} · RB</button></div><button data-tutorial-back onClick={onClose}>{t('Volver','Back')} ↩</button></footer>
   <p className={css.note}>{interactive?t('Sin daño ni gasto de estrellas · Esc / Menu vuelve a la demo','No damage or stars spent · Esc / Menu returns to demo'):t('Mira, prueba y cambia de lección con LB/RB.','Watch, try and change lessons with LB/RB.')}</p>
   <p className={css.shopNote}>{t('En la tienda de Miso puedes comprar mejoras y mods, y probarlos en sus propias demos.','Buy upgrades and mods at Miso’s shop and try them in their own demos.')}</p>
  </section>
 </div>;
}
