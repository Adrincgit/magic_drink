import {useEffect,useRef,useState} from 'react';
import {LEVELS} from '../../world/adventureLevels';
import css from './adventureFrontEnd.module.css';

export const chapterNumber=index=>`${Math.floor(index/3)+1}-${index%3+1}`;
export default function AdventureFrontEnd({en,save,selected,onChoose,onStart,onSettings,onTutorial,onEngage,busy,gentle,onGentle,reduced,active=true,interactive=true,returning=false}){
 const [chapters,setChapters]=useState(false),[menu,setMenu]=useState(returning),[entrance,setEntrance]=useState(returning?'settled':'waiting'),[loaded,setLoaded]=useState(0);
 const root=useRef(null),skipRequested=useRef(false);
 const ready=loaded===3;
 useEffect(()=>{
  if(!active||!ready)return;
  if(returning||reduced||skipRequested.current){setEntrance('settled');return;}
  setEntrance('entering');const timer=setTimeout(()=>setEntrance('settled'),2800);return()=>clearTimeout(timer);
 },[active,ready,reduced,returning]);
 const pressStart=()=>{onEngage?.();if(entrance!=='settled'){skipRequested.current=true;if(ready)setEntrance('settled');}else setMenu(true);};
 useEffect(()=>{
  if(!active||!interactive)return;
  const key=e=>{
   if(e.repeat||e.metaKey||e.ctrlKey||e.altKey||e.key==='Tab')return;
   if(!menu){e.preventDefault();e.stopImmediatePropagation();pressStart();}
   else if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();if(chapters)setChapters(false);else setMenu(false);}
  };
  window.addEventListener('keydown',key,true);return()=>window.removeEventListener('keydown',key,true);
 });
 useEffect(()=>{
  if(!active||!interactive||chapters)return;
  root.current?.querySelector(menu?'[data-start-adventure]':'[data-title-start]')?.focus({preventScroll:true});
 },[menu,entrance,active,interactive,chapters]);
 return <section ref={root} className={css.title} data-title-screen data-entrance={entrance} data-menu-open={menu} aria-label="Hexy & the Lost Chorus">
  <img className={css.landscape} src="/arcade/title/landscape.webp" alt="" onLoad={()=>setLoaded(v=>v|1)}/>
  <div className={css.vignette}/>
  <div className={css.fireflies} aria-hidden="true">{Array.from({length:12},(_,i)=><i key={i} style={{'--i':i,'--x':8+(i*37)%84,'--y':19+(i*23)%66}}/>)}</div>
  <h1 className={css.srOnly}>Hexy &amp; the Lost Chorus</h1>
  <div className={css.emblem}><img src="/arcade/title/emblem.webp" alt="" onLoad={()=>setLoaded(v=>v|2)}/></div>
  <div className={css.comet} aria-hidden="true"><i/></div>
  {!menu&&<button className={css.pressStart} data-title-start data-pad-default disabled={!active} onClick={pressStart} aria-label={entrance==='settled'?(en?'Press Enter / Start':'Pulsa Enter / Start'):(en?'Skip title entrance':'Saltar entrada del título')}><span>{entrance==='settled'?(en?'PRESS ENTER / START':'PULSA ENTER / START'):(en?'Press any button to skip':'Pulsa cualquier botón para saltar')}</span></button>}
  {menu&&<>
   <div className={css.menu} data-title-menu>
    <button data-pad-default data-start-adventure data-insert-coin disabled={busy||selected>save.adventureUnlocked} onClick={()=>onStart(false)}>{en?'Start adventure':'Comenzar aventura'}</button>
    <button onClick={onSettings} data-open-settings>{en?'Options':'Opciones'}</button>
    <button onClick={onTutorial}>{en?'How to play':'Cómo jugar'}</button>
    <button onClick={()=>setChapters(true)} aria-expanded={chapters}>{en?'Choose chapter':'Elegir capítulo'} <small>{chapterNumber(selected)}</small></button>
    <button className={css.practice} data-practice onClick={()=>onStart(true)} disabled={busy}>{en?'Practice':'Practicar'}</button>
   </div>
   <div className={css.wallet} aria-label={en?'Shop coins':'Monedas para la tienda'}><i aria-hidden="true"/>{save.stars}</div>
   <a className={css.exit} href="/#directorio-wonderpop">← Wonderpop</a>
  </>}
  <span className={css.signature}>MAGIC DRINK</span>
  {chapters&&<div className={css.chapterPicker} data-chapter-picker role="dialog" aria-modal="true" aria-label={en?'Chapters':'Capítulos'}>
   <h2>{en?'Where shall we go?':'¿A dónde vamos?'}</h2>
   <div>{LEVELS.map((l,i)=><button data-level-choice={i} key={i} aria-pressed={selected===i} onClick={()=>{onChoose(i);setChapters(false);}}><img src={l.background} alt=""/><b>{chapterNumber(i)} · {l.name[en?1:0]}</b><small>{i>save.adventureUnlocked?(en?'Practice':'Práctica'):save.adventureCleared.includes(i)?'★':en?'Available':'Disponible'}</small></button>)}</div>
   <label><input type="checkbox" checked={gentle} onChange={e=>onGentle(e.target.checked)}/>{en?'A gentler adventure':'Una aventura más tranquila'}</label>
   <button onClick={()=>setChapters(false)}>{en?'Back':'Volver'} ↩</button>
  </div>}
 </section>;
}

export function AdventurePresentation({onSkip,en}){
 useEffect(()=>{const timer=setTimeout(onSkip,3000);const key=e=>{if(e.repeat||e.metaKey||e.ctrlKey||e.altKey||e.key==='Tab')return;e.preventDefault();e.stopImmediatePropagation();onSkip();};window.addEventListener('keydown',key,true);return()=>{clearTimeout(timer);window.removeEventListener('keydown',key,true);};},[onSkip]);
 return <button className={css.presentation} data-presentation onClick={onSkip} aria-label={en?'Skip presentation':'Saltar presentación'}><img src="/arcade/sprites/ui/super-ready.webp" alt=""/><b>MAGIC DRINK</b><span>{en?'A little more magic':'Un poquito más de magia'}</span><small>{en?'Press any button':'Pulsa cualquier botón'}</small></button>;
}
export function AdventureChapterCard({index,en,onContinue,checkpoint=false}){
 useEffect(()=>{const timer=setTimeout(onContinue,1800);return()=>clearTimeout(timer);},[onContinue]);
 return <div className={css.chapterCard} data-chapter-intro onClick={onContinue}><div style={{backgroundImage:`url(${LEVELS[index].background})`}}/><section><span>{checkpoint?(en?'BACK TO YOUR FLAG':'DE VUELTA A TU BANDERA'):(en?'THE ADVENTURE CONTINUES':'QUE EMPIECE LA AVENTURA')}</span><b>{chapterNumber(index)}</b><h2>{LEVELS[index].name[en?1:0]}</h2><small>{en?'Let’s go, Hexy!':'¡Vamos, Hexy!'}</small></section></div>;
}
export function AdventureTutorial({en,onClose}){
 const panel=useRef(null);
 useEffect(()=>{const root=panel.current,previous=document.activeElement,siblings=[...root.parentElement.children].filter(el=>el!==root).map(el=>[el,el.inert]);siblings.forEach(([el])=>{el.inert=true;});root.querySelector('button').focus({preventScroll:true});return()=>{siblings.forEach(([el,inert])=>{el.inert=inert;});if(previous?.isConnected)previous.focus({preventScroll:true});};},[]);
 const rows=[['← ↑ ↓ → / WASD','L / ✥','Mover, agacharse y apuntar','Move, duck and aim'],['Espacio','A','Salta dos veces; mantén al caer para planear','Jump twice; hold while falling to glide'],['Z / J','X / RT','Disparar magia','Cast magic'],['X / Shift','B','Rodar / dash en el aire','Roll / air dash'],['C / L','Y','Magia fuerte','Strong magic'],['F / Ctrl','LB','Mantén: apuntar quieta, también diagonal abajo','Hold: aim in place, including diagonally down'],['V','LT','Mantén: bloquear con magia','Hold: block using magic'],['R','RB','Ultimate: 90 de magia + carga lista','Ultimate: 90 magic + ready charge'],['E','View','Entrar en la tienda','Enter the shop'],['Esc / P','Menu','Pausar / opciones','Pause / options']];
 return <div ref={panel} className={css.tutorial} data-tutorial role="dialog" aria-modal="true" onKeyDown={e=>{if(e.key==='Tab')e.preventDefault();}} aria-label={en?'How to play':'Cómo jugar'}><section><h2>{en?'Your magic, in your hands':'Tu magia, en tus manos'}</h2><div className={css.bindings}>{rows.map(([key,pad,es,eng])=><div key={key}><b>{key}<small>{pad}</small></b><span>{en?eng:es}</span></div>)}</div><p>{en?'Break supply chests. Rescue your friends. Flags save your return point; choose Continue after defeat.':'Rompe cajas de provisiones. Rescata a tus amigos. Las banderas guardan tu regreso; elige Continuar al perder.'}</p><button data-pad-default onClick={onClose}>{en?'Got it!':'¡A jugar!'} ★</button></section></div>;
}
