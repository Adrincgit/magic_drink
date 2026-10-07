import {useEffect,useRef,useState} from 'react';
import {DEFAULT_AUDIO_SETTINGS,updateArcadeAudioSettings} from '../../../shared/arcadeAudioSettings';
import css from './adventureSettings.module.css';

const bindings=[
 ['✥ / L','Mover y apuntar','Move and aim'],['A','Saltar / mantener: planear','Jump / hold: glide'],['X / RT','Disparar magia','Cast magic'],['B','Rodar / dash aéreo','Roll / air dash'],['Y','Magia fuerte','Strong magic'],['RB','Súper ataque','Super attack'],['LB','Apuntar sin caminar','Aim in place'],['LT','Escudo musical','Musical shield'],['View ⧉','Entrar en la tienda','Enter the shop'],['Menu ☰','Pausar / continuar','Pause / resume']
];
export default function AdventureSettings({en,settings,pad,onClose,onPreview,finish,onFinish,onTabChange,onTutorial,onFullscreen}){
 const [tab,setTab]=useState('audio'),panel=useRef(null);
 useEffect(()=>{onTabChange?.(tab);},[tab,onTabChange]);
 useEffect(()=>{
  const previous=document.activeElement,shade=panel.current.parentElement,siblings=[...shade.parentElement.children].filter(el=>el!==shade&&!el.hasAttribute('data-audio-unlock')).map(el=>[el,el.inert]);
  siblings.forEach(([el])=>{el.inert=true;});panel.current.focus({preventScroll:true});
  return()=>{siblings.forEach(([el,inert])=>{el.inert=inert;});if(previous?.isConnected)previous.focus({preventScroll:true});};
 },[]);
 function key(event){
  if(event.key==='Escape'){event.preventDefault();event.stopPropagation();onClose();}
  if(event.key==='Tab'){
   const nodes=[...panel.current.querySelectorAll('button:not(:disabled),input:not(:disabled)')],first=nodes[0],last=nodes.at(-1);
   if(event.shiftKey&&(document.activeElement===first||document.activeElement===panel.current)){event.preventDefault();last.focus();}
   else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  }
 }
 const messages={connected:en?'Controller ready':'Mando conectado',waiting:en?'Connect your controller and press a button.':'Conecta tu mando y pulsa un botón.',disconnected:en?'Controller disconnected. Your game is paused.':'Mando desconectado. La partida está en pausa.',unavailable:en?'This browser cannot read controllers.':'Este navegador no permite leer mandos.',unsupported:en?'This controller has no standard layout. Try Xbox mode.':'Este mando no tiene distribución estándar. Prueba el modo Xbox.'};
 return <div className={css.shade} data-adventure-settings>
  <section ref={panel} tabIndex={-1} role="dialog" aria-modal="true" aria-label={en?'Adventure settings':'Ajustes de la aventura'} className={css.panel} onKeyDown={key}>
   <div className={css.heading}><h2>{en?'Your adventure, your way':'Tu aventura, a tu ritmo'}</h2><button onClick={onClose} className={css.button} aria-label={en?'Close settings':'Cerrar ajustes'}>×</button></div>
   <nav aria-label={en?'Settings sections':'Secciones de ajustes'}><button className={css.button} aria-pressed={tab==='audio'} onClick={()=>setTab('audio')}>{en?'Sound':'Sonido'} ♫</button><button className={css.button} aria-pressed={tab==='controller'} onClick={()=>setTab('controller')}>{en?'Controller':'Mando'} ✥</button><button className={css.button} aria-pressed={tab==='visual'} onClick={()=>setTab('visual')}>{en?'Picture':'Imagen'} ✦</button></nav>
   {tab==='audio'?<div key="audio" className={css.audio}>
    {[['master',en?'Overall volume':'Volumen general'],['music',en?'Music':'Música'],['effects',en?'Sound effects':'Efectos de sonido']].map(([name,label],i)=><label key={name} className={css.slider}>
     <span>{label}<output>{settings[name]}%</output></span><input data-audio-volume={name} data-pad-default={i===0?'':undefined} type="range" min="0" max="100" step="5" value={settings[name]} aria-label={label} style={{'--volume':settings[name]+'%'}} onChange={e=>updateArcadeAudioSettings({[name]:Number(e.target.value)})}/>
    </label>)}
    <div className={css.actions}><button className={css.button} aria-pressed={settings.muted} onClick={()=>updateArcadeAudioSettings({muted:!settings.muted})}>{settings.muted?(en?'Restore sound':'Activar sonido'):(en?'Mute all':'Silenciar todo')}</button><button className={css.button} disabled={settings.muted||!settings.master||!settings.effects} onClick={onPreview}>{en?'Test sound':'Probar sonido'} ♪</button><button className={css.button} onClick={()=>updateArcadeAudioSettings(DEFAULT_AUDIO_SETTINGS)}>{en?'Reset':'Restablecer'}</button></div>
    <p className={css.hint}>{en?'Saved automatically. Adjust the music while listening.':'Se guarda automáticamente. Ajusta la música mientras la escuchas.'}</p>
   </div>:tab==='visual'?<div key="visual" className={css.audio}>
    {[['grain',en?'Film grain':'Grano de película'],['chromatic',en?'Chromatic aberration':'Aberración cromática'],['vignette',en?'Vignette':'Viñeta']].map(([name,label])=><label key={name} className={css.slider}><span>{label}<output>{finish[name]}%</output></span><input data-visual-setting={name} type="range" min="0" max="100" step="5" value={finish[name]} aria-label={label} style={{'--volume':finish[name]+'%'}} onChange={e=>onFinish({enabled:true,[name]:Number(e.target.value)})}/></label>)}
    <div className={css.actions}><button className={css.button} data-monochrome-toggle aria-pressed={finish.monochrome} onClick={()=>onFinish({enabled:true,monochrome:!finish.monochrome})}>{en?'Black & white':'Blanco y negro'} {finish.monochrome?'✓':''}</button><button className={css.button} onClick={()=>onFinish({enabled:true,grain:50,chromatic:55,vignette:50,monochrome:false})}>{en?'Reset picture':'Restablecer imagen'}</button></div>
    <p className={css.hint}>{en?'Your picture settings are saved automatically.':'Tu imagen se guarda automáticamente. Puedes dejar cada efecto en cero.'}</p>
   </div>:<div key="controller" className={css.controller}>
    <p className={css.status} data-controller-status={pad.state} role="status">{messages[pad.state]}{pad.name&&<small>{pad.name}</small>}</p>
    <div className={css.bindings}>{bindings.map(([button,es,english])=><div key={button}><b>{button}</b><span>{en?english:es}</span></div>)}</div>
   </div>}
   <footer>{onTutorial&&<button className={css.button} onClick={onTutorial}>{en?'How to play':'Cómo jugar'}</button>}{onFullscreen&&<button className={css.button} onClick={onFullscreen} aria-label={en?'Toggle full screen':'Cambiar pantalla completa'}>⛶</button>}{tab==='controller'&&<small>{en?'Menus: ✥ / L move · A choose · B back':'Menús: ✥ / L mover · A elegir · B volver'}</small>}<button className={css.button} onClick={onClose}>{en?'Back':'Volver'} ↩</button></footer>
  </section>
 </div>;
}
