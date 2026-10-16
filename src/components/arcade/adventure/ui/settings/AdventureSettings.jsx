import {useEffect,useRef,useState} from 'react';
import {DEFAULT_AUDIO_SETTINGS,updateArcadeAudioSettings} from '../../../shared/arcadeAudioSettings';
import {GAMEPAD_ACTIONS,GAMEPAD_BUTTON_NAMES,DEFAULT_GAMEPAD_BINDINGS,assignGamepadButton,bindingName} from '../../input/gamepadBindings';
import css from './adventureSettings.module.css';
const tabs=['audio','controller','visual'];
export default function AdventureSettings({en,settings,pad,bindings,onBindings,onClose,onPreview,finish,onFinish,onTabChange,onTutorial,onFullscreen}){
 const [tab,setTab]=useState('audio'),[capture,setCapture]=useState(null),[captureNote,setCaptureNote]=useState(''),[columns,setColumns]=useState(2),panel=useRef(null);
 const t=(es,eng)=>en?eng:es;
 useEffect(()=>{onTabChange?.(tab);},[tab,onTabChange]);
 useEffect(()=>{
  const root=panel.current,previous=document.activeElement,shade=root.parentElement,siblings=[...shade.parentElement.children].filter(el=>el!==shade&&!el.hasAttribute('data-audio-unlock')).map(el=>[el,el.inert]);
  siblings.forEach(([el])=>{el.inert=true;});root.querySelector('[data-pad-default]')?.focus({preventScroll:true});
  return()=>{siblings.forEach(([el,inert])=>{el.inert=inert;});if(previous?.isConnected)previous.focus({preventScroll:true});};
 },[]);
 useEffect(()=>{const root=panel.current,change=e=>{if(capture)return;setTab(old=>tabs[(tabs.indexOf(old)+e.detail+tabs.length)%tabs.length]);};root.addEventListener('settings-tab',change);return()=>root.removeEventListener('settings-tab',change);},[capture]);
 useEffect(()=>{panel.current?.querySelector('[data-pad-default]')?.focus({preventScroll:true});},[tab]);
 useEffect(()=>{const shade=panel.current.parentElement,observer=new ResizeObserver(()=>setColumns(shade.clientWidth<=700?1:2));observer.observe(shade);return()=>observer.disconnect();},[]);
 useEffect(()=>{
  if(!capture)return;let frame,armed=false;
  const poll=()=>{frame=requestAnimationFrame(poll);const p=Array.from(navigator.getGamepads?.()||[]).find(p=>p?.connected&&p.mapping==='standard');if(!p)return;const down=p.buttons.map((b,i)=>b.pressed||b.value>.5?i:-1).filter(i=>i>=0);
   if(!down.length)armed=true;if(!armed||!down.length)return;const i=down[0];
   if(i===9||i>=12){setCaptureNote(t('Menu y la cruceta se reservan para navegar.','Menu and D-pad are reserved for navigation.'));armed=false;return;}
   onBindings(assignGamepadButton(bindings,capture,i));setCapture(null);setCaptureNote('');
  };frame=requestAnimationFrame(poll);return()=>cancelAnimationFrame(frame);
 },[capture,bindings,onBindings,en]);
 function key(event){
  if(event.key==='Escape'){event.preventDefault();event.stopPropagation();if(capture)setCapture(null);else onClose();return;}
  if(event.key==='Tab'){const nodes=[...panel.current.querySelectorAll('button:not(:disabled),input:not(:disabled)')],at=nodes.indexOf(document.activeElement);event.preventDefault();nodes[(at+(event.shiftKey?-1:1)+nodes.length)%nodes.length]?.focus();}
 }
 const slider=(name,label,value,row,change,kind)=> <label key={name} className={css.slider}><span>{label}<output>{value}%</output></span><input {...{[kind==='audio'?'data-audio-volume':'data-visual-setting']:name}} data-pad-row={row} data-pad-default={row===0?'':undefined} type="range" min="0" max="100" step="5" value={value} aria-label={label} style={{'--volume':value+'%'}} onChange={e=>change(Number(e.target.value))}/></label>;
 return <div className={css.shade} data-adventure-settings data-settings-tab={tab} data-remapping={!!capture}>
  <section ref={panel} tabIndex={-1} role="dialog" aria-modal="true" aria-label={t('Ajustes de la aventura','Adventure settings')} className={css.panel} onKeyDown={key}>
   <header className={css.heading}><div><small>{t('A TU RITMO','YOUR WAY')}</small><h2>{t('Opciones de la función','Showtime settings')}</h2></div><span className={css.star} aria-hidden="true">★</span></header>
   <nav className={css.tabs} role="tablist" aria-label={t('Secciones de ajustes','Settings sections')}><span className={css.bumper}>LB</span>{tabs.map((name,i)=><button key={name} role="tab" aria-selected={tab===name} aria-controls={'settings-'+name} className={css.button} data-settings-tab-button={name} data-pad-row="-1" data-pad-column={i} onClick={()=>{setCapture(null);setTab(name);}}>{[t('Sonido','Sound'),t('Mando','Controller'),t('Imagen','Picture')][i]}</button>)}<span className={css.bumper}>RB</span></nav>
   <div key={tab} id={'settings-'+tab} role="tabpanel" className={css.content}>
    {tab==='audio'?<>
     <p className={css.intro}>{t('Que suene la aventura.','Let the adventure sing.')}</p>
     {[['master',t('Volumen general','Overall volume')],['music',t('Música','Music')],['effects',t('Efectos de sonido','Sound effects')]].map(([name,label],i)=>slider(name,label,settings[name],i,value=>updateArcadeAudioSettings({[name]:value}),'audio'))}
     <div className={css.actions}><button className={css.button} data-pad-row="3" data-pad-column="0" aria-pressed={settings.muted} onClick={()=>updateArcadeAudioSettings({muted:!settings.muted})}>{settings.muted?t('Activar sonido','Restore sound'):t('Silenciar todo','Mute all')}</button><button className={css.button} data-pad-row="3" data-pad-column="1" disabled={settings.muted||!settings.master||!settings.effects} onClick={onPreview}>{t('Probar sonido','Test sound')} ♪</button><button className={css.quiet} data-pad-row="3" data-pad-column="2" onClick={()=>updateArcadeAudioSettings(DEFAULT_AUDIO_SETTINGS)}>{t('Restablecer','Reset')}</button></div>
    </>:tab==='visual'?<>
     <button className={css.filmMode} data-monochrome-toggle data-pad-default data-pad-row="0" aria-pressed={finish.monochrome} onClick={()=>onFinish({enabled:true,monochrome:!finish.monochrome})}><span className={css.filmIcon} aria-hidden="true">✦</span><span><b>{t('Cine clásico','Classic cinema')}</b><small>{t('Monocromático · bordes de color · textura de película','Monochrome · color fringes · film texture')}</small></span><em>{finish.monochrome?t('ACTIVO','ON'):t('APAGADO','OFF')}</em></button>
     {[['grain',t('Grano de película','Film grain')],['chromatic',t('Aberración cromática','Chromatic aberration')],['vignette',t('Viñeta','Vignette')]].map(([name,label],i)=>slider(name,label,finish[name],i+1,value=>onFinish({enabled:true,[name]:value}),'visual'))}
     <button className={css.quiet} data-pad-row="4" onClick={()=>onFinish({enabled:true,grain:50,chromatic:55,vignette:50,monochrome:false})}>{t('Restablecer imagen','Reset picture')}</button>
    </>:<>
     <div className={css.status} data-controller-status={pad.state} role="status"><b>{pad.state==='connected'?t('Mando listo para la función','Controller ready for showtime'):t('Conecta tu mando y pulsa un botón','Connect your controller and press a button')}</b><small>{t('Cruceta / stick: mover · A: elegir · B: volver · LB/RB: pestañas','D-pad / stick: move · A: choose · B: back · LB/RB: tabs')}</small></div>
     <div className={css.bindings}>{GAMEPAD_ACTIONS.map(([name,es,eng],i)=><button key={name} className={css.binding} data-pad-default={i===0?'':undefined} data-pad-row={Math.floor(i/columns)} data-pad-column={i%columns} data-bind-action={name} onClick={()=>{setCaptureNote('');setCapture(name);}}><span>{en?eng:es}</span><b>{bindingName(bindings,name)}</b></button>)}</div>
     <div className={css.controllerFoot}><span>{t('Movimiento: cruceta / stick izquierdo · Pausa: Menu','Move: D-pad / left stick · Pause: Menu')}</span><button className={css.quiet} data-pad-row={Math.ceil(GAMEPAD_ACTIONS.length/columns)} onClick={()=>onBindings(DEFAULT_GAMEPAD_BINDINGS)}>{t('Mando predeterminado','Default controller')}</button></div>
    </>}
   </div>
   <footer className={css.footer}><small>{t('Guardado automático','Saved automatically')}</small>{onTutorial&&<button className={css.quiet} data-pad-row="20" data-pad-column="0" onClick={onTutorial}>{t('Cómo jugar','How to play')}</button>}{onFullscreen&&<button className={css.quiet} data-pad-row="20" data-pad-column="1" onClick={onFullscreen} aria-label={t('Cambiar pantalla completa','Toggle full screen')}>⛶</button>}<button className={css.button} data-pad-row="20" data-pad-column="2" onClick={onClose}>{t('Volver','Back')} ↩</button></footer>
   {capture&&<div className={css.capture} role="status"><b>{t('Elige el botón','Choose a button')}</b><p>{GAMEPAD_ACTIONS.find(q=>q[0]===capture)?.[en?2:1]}</p><small>{captureNote||t('Suelta los botones y pulsa el que quieras asignar. Si ya tiene una acción, se intercambian.','Release the buttons, then press your choice. Existing assignments are swapped.')}</small><button className={css.button} onClick={()=>setCapture(null)}>{t('Cancelar','Cancel')} · Esc</button></div>}
  </section>
 </div>;
}
