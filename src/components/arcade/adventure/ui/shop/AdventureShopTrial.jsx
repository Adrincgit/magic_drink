import {useEffect,useRef,useState} from 'react';
import {createTrial,stepTrial,trialDemoInput,changeTrialDrink,trialProjectile} from '../../engine/adventureTrial';
import {renderAdventure} from '../../render/adventureCanvas';
import {readAdventureGamepad} from '../../input/adventureGamepad';
import {DRINKS} from '../../world/adventureLevels';
import {maxModLevel} from '../../engine/adventureMods';
import {ribbonMoveName} from '../../engine/adventureRibbonCombos';
import RibbonComboGuide from './RibbonComboGuide';
import css from './adventureWorkshop.module.css';
const keys={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',Space:'jump',ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down',KeyZ:'attack',KeyJ:'attack',KeyX:'dash',ShiftLeft:'dash',KeyC:'special',KeyL:'special',KeyF:'hold',KeyV:'guard',KeyR:'super',KeyQ:'swap',KeyB:'coaster'};
export default function AdventureShopTrial({mod,art,en,reduced,level,setLevel,onSound}){
 const canvas=useRef(null),run=useRef(null),input=useRef({}),pressed=useRef({}),root=useRef(null),playButton=useRef(null);
 const [demo,setDemo]=useState('sky-dance'),[guideOpen,setGuideOpen]=useState(false);
 const [playing,setPlaying]=useState(false),[revision,setRevision]=useState(0),[stats,setStats]=useState({ammo:0,magic:100,damage:0,kind:-1,hearts:5});
 const live=useRef({playing,art,reduced});live.current={playing,art,reduced,onSound};
 useEffect(()=>{setPlaying(false);setGuideOpen(false);input.current={};pressed.current={};},[mod.id]);
 useEffect(()=>{
  run.current=createTrial(mod,level);run.current.trial.ribbonDemo=demo;let raf,last=0,lag=0,publish=0;
  function frame(now){
   raf=requestAnimationFrame(frame);const dt=last?Math.min(.05,(now-last)/1000):0;last=now;
   if(!live.current.art||document.hidden||!canvas.current)return;
   lag+=dt;let s=run.current;
   if(!live.current.playing&&s.time>7.5){s=run.current=createTrial(mod,level);s.trial.ribbonDemo=demo;}
   while(lag>=1/120){const pad=live.current.playing?readAdventureGamepad([...navigator.getGamepads?.()||[]].find(p=>p?.connected)):null;
    if(pad?.pause){input.current={};pressed.current={};setPlaying(false);}
    const controls=live.current.playing?Object.fromEntries([...new Set([...Object.keys(input.current),...Object.keys(pressed.current),...Object.keys(pad||{})])].map(k=>[k,!!input.current[k]||!!pressed.current[k]||!!pad?.[k]])):trialDemoInput(s);
    stepTrial(s,controls,1/120);pressed.current={};if(live.current.playing)for(const event of s.events)live.current.onSound?.(event);lag-=1/120;
   }
   renderAdventure(canvas.current,s,live.current.art,{reduced:live.current.reduced,en});
   if(now-publish>160){publish=now;setStats({charge:Math.min(1,(s.player.ribbonCharge?.age||0)/.5),move:s.player.ribbonMoveUntil>s.time?s.player.ribbonMove:null,sequence:s.player.ribbonSequenceUntil>s.time?s.player.ribbonSequence||s.player.ribbonCompleted:'',ribbon:s.ribbonDance?.remaining||0,ammo:s.ammo,magic:Math.round(s.magic),damage:s.trial.damage.toFixed(1),kind:s.weapon,spare:s.spareDrink?.kind??-1,companion:s.trial.primary>=0?s.trial.companion:s.weapon,defeats:s.trial.defeats,hearts:s.hearts,shield:s.shield,original:s.overdrive.toFixed(1),super:Math.max(0,s.superCooldown>0?0:1)+(s.superReserve||0)});}
  }
  raf=requestAnimationFrame(frame);return()=>cancelAnimationFrame(raf);
 },[mod.id,level,revision,en,demo]);
 useEffect(()=>{const clear=()=>{input.current={};pressed.current={};};const stop=()=>{clear();setPlaying(false);playButton.current?.focus();};window.addEventListener('blur',clear);root.current?.addEventListener('trial-exit',stop);return()=>{window.removeEventListener('blur',clear);root.current?.removeEventListener('trial-exit',stop);};},[]);
 function key(e){
  if(!playing)return;
  if(e.code==='Escape'){e.preventDefault();e.stopPropagation();input.current={};pressed.current={};setPlaying(false);playButton.current?.focus();return;}
  if(keys[e.code]){e.preventDefault();e.stopPropagation();const action=keys[e.code];input.current[action]=e.type==='keydown';if(e.type==='keydown'&&!e.repeat)pressed.current[action]=true;}
 }
 function play(){setGuideOpen(false);input.current={};pressed.current={};run.current=createTrial(mod,level);setPlaying(true);canvas.current?.focus();}
 const t=(es,eng)=>en?eng:es;
 return <section ref={root} className={css.trial} data-trial-playing={playing} aria-label={t('Campo de prueba gratuito','Free practice range')}>
  <div className={css.trialTitle}><div><small>{t('PRUEBA ANTES DE COMPRAR','TRY BEFORE YOU BUY')}</small><h3>{t('El patio de Miso','Miso’s practice yard')}</h3></div><span className={css.free}>{t('GRATIS','FREE')}</span></div>
  <div className={css.trialTools}><button aria-pressed={!playing} onClick={()=>{setPlaying(false);setGuideOpen(false);setRevision(n=>n+1);}}>{t('Ver demo','Watch demo')}</button><button ref={playButton} data-trial-play aria-pressed={playing} onClick={play}>{t('Probar yo','Play myself')}</button>{mod.timed&&<button data-open-combos aria-expanded={guideOpen} onClick={()=>setGuideOpen(!guideOpen)}>{guideOpen?t('Volver a la demo','Back to demo'):t('Combos','Combos')}</button>}<button data-trial-reset onClick={()=>{input.current={};pressed.current={};setRevision(n=>n+1);if(playing)canvas.current?.focus();}}>{t('Reiniciar','Reset')}</button></div>
  <div className={css.canvasWrap}><canvas ref={canvas} tabIndex={0} onBlur={()=>{input.current={};pressed.current={};}} onKeyDown={key} onKeyUp={key} data-shop-trial data-trial-weapon={stats.kind} data-trial-spare={stats.spare} data-trial-defeats={stats.defeats} data-trial-damage={stats.damage} data-trial-seconds={stats.ribbon||0} aria-label={t('Prueba interactiva sin daño. Activa Probar yo para jugar. Escape vuelve al catálogo.','Invulnerable interactive trial. Select Play myself to play. Escape returns to browsing.')}/><span className={css.mode}>{playing?t('TU TURNO · SIN DAÑO · Esc para salir','YOUR TURN · NO DAMAGE · Esc to leave'):t('DEMOSTRACIÓN · SIN DAÑO','DEMO · NO DAMAGE')}</span>{mod.timed&&guideOpen&&<div className={css.comboOverlay}><RibbonComboGuide en={en} stats={stats} demo={playing?null:demo} onDemo={id=>{input.current={};pressed.current={};setPlaying(false);setGuideOpen(false);setDemo(id);setRevision(n=>n+1);}}/></div>}</div>
  <div className={css.telemetry}><span>{mod.timed?t('Duración','Duration'):t('Munición','Ammo')} <b>{mod.timed?(stats.ribbon||0).toFixed(1)+' s':stats.kind<0?'—':stats.ammo}</b></span><span>{t('Magia','Magic')} <b>{stats.magic}</b></span><span>{t('Daño','Damage')} <b>{stats.damage}</b></span><span>{mod.id==='full-bubble'?t('Escudos','Shields'):mod.id==='lasting-magic'?'Original':mod.id==='encore-pocket'?t('Súper','Super'):'♥'} <b>{mod.id==='full-bubble'?stats.shield:mod.id==='lasting-magic'?stats.original+' s':mod.id==='encore-pocket'?stats.super:stats.hearts}</b></span></div>
  {mod.timed&&<div className={css.liveCombo} data-ribbon-move>{stats.charge?t('Carga: ','Charge: ')+Math.round(stats.charge*100)+'%':ribbonMoveName(stats.move,en)||t('Pulsa Combos para elegir una demostración.','Select Combos to watch a move.')} <b>{stats.sequence?.toUpperCase().split('').join(' → ')}</b></div>}
  {mod.timed&&<p className={css.practiceNote} data-ribbon-cost>{t('Sin munición: sólo cuenta el tiempo. La prueba no compra la bebida.','No ammo: only time counts. Practice does not buy the drink.')}</p>}
  <div className={css.trialOptions}><label>{t('Encanto a probar','Preview level')}<select aria-label={t('Nivel de prueba','Trial level')} value={level} onChange={e=>setLevel(Number(e.target.value))}>{Array.from({length:maxModLevel(mod)},(_,i)=><option key={i} value={i+1}>{t('Nivel','Level')} {i+1}</option>)}</select></label><label>{mod.timed?t('Al terminar Ribbon','After Ribbon'):t('Combinar con · Q / R3','Combine with · Q / R3')}<select aria-label={t('Bebida de prueba','Trial drink')} value={stats.companion??-1} onChange={e=>{changeTrialDrink(run.current,Number(e.target.value));setPlaying(true);canvas.current?.focus();}}><option value={-1}>{mod.drink!==undefined?t('Sin apoyo','No companion'):t('Varita','Wand')}</option>{DRINKS.filter(d=>d.id!==mod.drink&&d.id!==12).map(d=><option value={d.id} key={d.id}>{d.name}</option>)}</select></label><button onClick={()=>{trialProjectile(run.current);setPlaying(true);canvas.current?.focus();}}>{t('Lanzar proyectil','Send projectile')}</button></div>
  {mod.drink!==undefined&&<p className={css.pocketReadout}>{t('Activa: ','Active: ')}<b>{DRINKS[stats.kind]?.name||t('Varita','Wand')}</b> · {t('Reserva: ','Pocket: ')}<b>{DRINKS[stats.spare]?.name||'—'}</b></p>}

  {!mod.timed&&<p className={css.controls}>{t('← → mover · Espacio saltar · Z disparar · C fuerte · X rodar · V escudo · R súper · Q cambiar · B posavasos','← → move · Space jump · Z fire · C strong · X roll · V shield · R super · Q swap · B coaster')}</p>}
  <p className={css.practiceNote}>{mod.timed?t('Ribbon es temporal. Reiniciar permite beberla otra vez gratis; al terminar vuelves a tu bebida anterior.','Ribbon is temporary. Reset to drink it again for free; your previous drink returns when time runs out.'):t('Q / R3 (pulsar stick derecho) alterna las latas. Enemigos de repuesto; práctica sin daño ni gasto de estrellas.','Q / R3 (click right stick) swaps cans. Enemies respawn; no player damage or stars spent.')}</p>
 </section>;
}
