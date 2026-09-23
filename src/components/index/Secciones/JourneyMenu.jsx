import { useRef, useState } from 'react';
import { isEnglish } from '../../../data/variables';
import usePlazaDialog from './usePlazaDialog';
import styles from '../css/journeyMenu.module.css';

export default function JourneyMenu({ en, ready }) {
  const dialog = useRef(null);
  const [opened, setOpened] = useState(false);
  const { open, close } = usePlazaDialog(dialog);
  const language = (lang) => {
    isEnglish.set(lang === 'en');
    try { localStorage.setItem('lang', lang); } catch { /* Language still changes for this visit. */ }
  };
  const keepFocus = event => {
    if (event.key !== 'Tab') return;
    const controls = [...dialog.current.querySelectorAll('a[href], button:not([disabled])')];
    const first = controls[0], last = controls.at(-1);
    const target = event.shiftKey && document.activeElement === first ? last
      : !event.shiftKey && document.activeElement === last ? first : null;
    if (target) { event.preventDefault(); target.focus({ preventScroll: true }); }
  };
  return <div className={styles.menu}>
    <button className={styles.trigger} data-journey-menu-trigger disabled={!ready}
      aria-haspopup="dialog" aria-controls="journey-menu" aria-expanded={opened}
      onClick={() => { open(); setOpened(true); }}>
      <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path d="M3 6h14M3 13h14" /></svg>
      {en ? 'Menu' : 'Menú'}
    </button>
    <dialog ref={dialog} id="journey-menu" className={styles.dialog} data-journey-menu
      aria-labelledby="journey-menu-title" onClose={() => setOpened(false)} onKeyDown={keepFocus}
      onClick={event => { if (event.target === event.currentTarget) close(); }}>
      <div className={styles.panel}>
        <div className={styles.top}>
          <span>MAGIC DRINK</span>
          <button className={styles.close} onClick={close} aria-label={en ? 'Close menu' : 'Cerrar menú'} autoFocus>
            <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true"><path d="m5 5 10 10M15 5 5 15" /></svg>
          </button>
        </div>
        <h2 id="journey-menu-title">{en ? 'More to discover' : 'Más por descubrir'}</h2>
        <nav aria-label={en ? 'Main navigation' : 'Navegación principal'}>
          {[
            ['/bebidas', 'Magic Drink'], ['/hexy', 'Hexy'],
            ['/wonderpop-plaza', 'Wonderpop Plaza'], ['/nosotros', en ? 'About us' : 'Nosotros'],
          ].map(([href, label], i) => <a key={href} href={href}>
            <small aria-hidden="true">0{i + 1}</small><span>{label}</span><span aria-hidden="true">↗</span>
          </a>)}
        </nav>
        <div className={styles.bottom}>
          <div className={styles.languages} role="group" aria-label={en ? 'Language' : 'Idioma'}>
            <button lang="es" aria-pressed={!en} onClick={() => language('es')}>ES</button>
            <button lang="en" aria-pressed={en} onClick={() => language('en')}>EN</button>
          </div>
          <button className={styles.resume} onClick={close}>{en ? 'Back to the journey' : 'Seguir el recorrido'} <span aria-hidden="true">→</span></button>
        </div>
      </div>
    </dialog>
  </div>;
}
