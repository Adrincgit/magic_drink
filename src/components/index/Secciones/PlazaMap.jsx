import { useEffect, useId, useRef, useState } from 'react';
import usePlazaDialog from './usePlazaDialog';
import styles from '../css/plazaMap.module.css';

export function chooseShowcase(event, section) {
  const root = event.currentTarget.closest('[data-journey]');
  root.dispatchEvent(new CustomEvent('plaza:select', { detail: section }));
}

export default function PlazaMap({ en, className = '' }) {
  const dialog = useRef(null), trigger = useRef(null);
  const [where, setWhere] = useState('atrium');
  const latest = useRef('atrium');
  const id = `plaza-map-${useId().replace(/:/g, '')}`;
  const modal = usePlazaDialog(dialog);
  useEffect(() => {
    const root = trigger.current.closest('[data-journey]');
    const update = ({ detail: { progress, reduced } }) => {
      const place = reduced ? (trigger.current.closest('[data-world-scene="gallery"]') ? 'gallery' : 'atrium') : progress < 1.075 ? 'atrium' : 'gallery';
      if (place !== latest.current) { latest.current = place; setWhere(place); }
    };
    root.addEventListener('journey:scene', update);
    update({ detail: { progress: Number(root.dataset.worldProgress || 0), reduced: matchMedia('(prefers-reduced-motion: reduce)').matches } });
    return () => root.removeEventListener('journey:scene', update);
  }, []);
  return <>
    <button ref={trigger} type="button" className={`${styles.trigger} ${className}`} aria-haspopup="dialog" onClick={modal.open}>
      <span aria-hidden="true">✧</span> {en ? 'Plaza map' : 'Mapa de la plaza'}
    </button>
    <dialog ref={dialog} className={styles.dialog} data-plaza-map data-lenis-prevent aria-labelledby={id} onClick={event => { if (event.target === event.currentTarget) modal.close(); }}>
      <div className={styles.paper}>
        <button className={styles.close} onClick={modal.close} type="button" aria-label={en ? 'Close plaza map' : 'Cerrar mapa de la plaza'}>×</button>
        <small>WONDERPOP PLAZA</small><h2 id={id}>{en ? 'A little world to explore' : 'Un mundo por recorrer'}</h2>
        <p>{en ? 'Choose your next stop.' : 'Elige tu siguiente parada.'}</p>
        <div className={styles.plan}>
          <svg viewBox="0 0 500 300" aria-hidden="true"><path d="M65 40H435V255H65Z" fill="#dfb9b0" stroke="#986479" strokeWidth="3" /><path d="M85 60H415V235H85Z" fill="#f4d5b4" stroke="#ba8790" /><path d="M250 260V200Q250 170 155 145M250 200Q250 170 345 145M250 200V80" fill="none" stroke="#c79578" strokeWidth="20" /><path d="M250 255V200Q250 170 155 145M250 200Q250 170 345 145M250 200V80" fill="none" stroke="#ffe8b2" strokeWidth="14" strokeDasharray="3 9" /><path d="m250 177 9 17 20 2-15 14 4 20-18-10-18 10 4-20-15-14 20-2Z" fill="#efbc61" stroke="#9e686f" strokeWidth="2" /></svg>
          <button className={styles.atrium} type="button" data-go-world=".96" onClick={modal.close} aria-current={where === 'atrium' ? 'location' : undefined}><b>06</b>{en ? 'The atrium' : 'El atrio'}{where === 'atrium' && <small>{en ? 'YOU ARE HERE' : 'ESTÁS AQUÍ'}</small>}</button>
          <button className={styles.gallery} type="button" data-go-world="1.2" onClick={modal.close} aria-current={where === 'gallery' ? 'location' : undefined}><b>07</b>{en ? 'The gallery' : 'Los escaparates'}{where === 'gallery' && <small>{en ? 'YOU ARE HERE' : 'ESTÁS AQUÍ'}</small>}</button>
          <span className={styles.flowers} aria-hidden="true">✿ ✧ ✿</span>
        </div>
        <div className={styles.destinations}>
          {['drink', 'collection', 'music'].map((section, i) => <button key={section} type="button" data-go-world="1.2" onClick={event => { chooseShowcase(event, section); modal.close(); }}>
            <img src={`/icons/icono_${['lata', 'bolsa', 'hexy'][i]}.webp`} alt="" width="28" height="28" />
            {['Magic Drink', en ? 'Collectibles' : 'Coleccionables', en ? 'Hexy’s music' : 'Música de Hexy'][i]} <span aria-hidden="true">→</span>
          </button>)}
        </div>
        <p className={styles.note}>{en ? 'You can also keep exploring by scrolling.' : 'También puedes seguir recorriendo la plaza con el scroll.'}</p>
      </div>
    </dialog>
  </>;
}
