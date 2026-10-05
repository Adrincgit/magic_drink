import { useEffect, useState } from 'react';
import { SceneButton, SceneLabel, SceneStar } from './SceneControls';
import { isEnglish } from '../../data/variables';
import styles from './css/illustratedMenu.module.css';
import { ArcadeWallet } from '../arcade/BunnyHunt';

export function IllustratedMenuTrigger({ en, className = '', ...props }) {
  const [ready,setReady]=useState(false);
  useEffect(()=>setReady(true),[]);
  return <SceneButton {...props} disabled={!ready || props.disabled} variant="violet" showArrow={false} className={`${styles.trigger} ${className}`}>
    {en ? 'Menu' : 'Menú'}<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 6h14M3 13h11" /></svg>
  </SceneButton>;
}

export function FinishControls({ en, finish, onChange }) {
  return <section className={styles.finish} data-finish-controls aria-label={en ? 'Illustrated finish' : 'Acabado ilustrado'}>
    <button className={styles.finishToggle} type="button" aria-pressed={finish.enabled} onClick={() => onChange({ enabled: !finish.enabled })}>
      <SceneStar /><span>{en ? 'Illustrated finish' : 'Acabado ilustrado'}</span><b>{finish.enabled ? (en ? 'On' : 'Sí') : (en ? 'Off' : 'No')}</b>
    </button>
    <div className={styles.sliders}>
      {[
        ['chromatic', en ? 'Chromatic aberration' : 'Aberración cromática'],
        ['vignette', en ? 'Vignette' : 'Viñeta'],
        ['grain', en ? 'Film grain' : 'Grano de película'],
      ].map(([name, label]) => <label className={styles.intensity} key={name}>
        <span>{label}<output>{finish[name] === 0 ? (en ? 'Off' : 'No') : `${finish[name]}%`}</output></span>
        <input aria-label={label} type="range" min="0" max="100" step="5" value={finish[name]} disabled={!finish.enabled}
          style={{ '--level': `${finish[name]}%` }} onChange={event => onChange({ [name]: Number(event.target.value) })} />
      </label>)}
    </div>
    <p className={styles.hint}>{en ? 'Set any effect to 0 to turn it off.' : 'Lleva cualquier efecto a 0 para apagarlo.'}</p>
  </section>;
}

export default function IllustratedMenu({ dialogRef, id, en, currentPath, finish, onFinishChange, onClose, onClosed, resume, ...props }) {
  const destinations = [['/', en ? 'The journey' : 'El recorrido'], ['/bebidas', 'Magic Drink'], ['/hexy', 'Hexy'], ['/wonderpop-plaza', 'Wonderpop Plaza'], ['/nosotros', en ? 'About us' : 'Nosotros']];
  const language = lang => {
    isEnglish.set(lang === 'en');
    try { localStorage.setItem('lang', lang); } catch { /* The selection works for this visit. */ }
  };
  function keepFocus(event) {
    if (event.key !== 'Tab') return;
    const controls = [...dialogRef.current.querySelectorAll('a[href],button:not([disabled]),input:not([disabled])')];
    const first = controls[0], last = controls.at(-1);
    const next = event.shiftKey && document.activeElement === first ? last : !event.shiftKey && document.activeElement === last ? first : null;
    if (next) { event.preventDefault(); next.focus(); }
  }
  return <dialog {...props} id={id} ref={dialogRef} className={styles.dialog} data-illustrated-menu data-lenis-prevent
    aria-labelledby={`${id}-title`} onClose={onClosed} onKeyDown={keepFocus}
    onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <button className={styles.close} onClick={onClose} aria-label={en ? 'Close menu' : 'Cerrar menú'} autoFocus>
      <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 5 10 10M15 5 5 15" /></svg>
    </button>
    <SceneLabel>{en ? 'Your pass to this world' : 'Tu pase a este mundo'}</SceneLabel>
    <h2 id={`${id}-title`}>{en ? 'Where shall we go?' : '¿A dónde vamos?'}</h2>
    <nav className={styles.links} aria-label={en ? 'Main navigation' : 'Navegación principal'}>
      {destinations.filter(([href]) => currentPath !== '/' || href !== '/').map(([href, label], index) =>
        <a href={href} key={href} aria-current={href === currentPath ? 'page' : undefined}><small aria-hidden="true">0{index + 1}</small><span>{label}</span><span aria-hidden="true">↗</span></a>)}
    </nav>
    <ArcadeWallet en={en} />
    <FinishControls en={en} finish={finish} onChange={onFinishChange} />
    <div className={styles.bottom}>
      <div className={styles.languages} role="group" aria-label={en ? 'Language' : 'Idioma'}>
        <button lang="es" aria-pressed={!en} onClick={() => language('es')}>ES</button>
        <button lang="en" aria-pressed={en} onClick={() => language('en')}>EN</button>
      </div>
      <SceneButton onClick={onClose} variant="violet">{resume}</SceneButton>
    </div>
  </dialog>;
}
