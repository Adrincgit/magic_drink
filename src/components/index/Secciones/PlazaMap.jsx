import { useEffect, useId, useRef, useState } from 'react';
import usePlazaDialog from './usePlazaDialog';
import styles from '../css/plazaMap.module.css';

export function chooseShowcase(event, section) {
  const root = event.currentTarget.closest('[data-journey]');
  root.dispatchEvent(new CustomEvent('plaza:select', { detail: section }));
}

export default function PlazaMap({ en, className = '', physical = false }) {
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
    <button ref={trigger} type="button" className={`${physical ? styles.physical : styles.trigger} ${className}`} aria-label={en ? 'Plaza map' : 'Mapa de la plaza'} aria-haspopup="dialog" onClick={modal.open}>
      {physical && <svg viewBox="0 0 120 50" aria-hidden="true"><path d="M15 8h90v34H15Z M40 8v14h40V8M60 22v20" fill="none" stroke="currentColor" strokeWidth="2"/><path d="m56 32 4-8 4 8 8 1-6 5 2 8-8-4-8 4 2-8-6-5Z" fill="currentColor"/></svg>}
      {!physical && <span aria-hidden="true">✧</span>} {en ? 'Plaza map' : 'Mapa de la plaza'}
    </button>
    <dialog ref={dialog} className={styles.dialog} data-plaza-map data-lenis-prevent aria-labelledby={id} onClick={event => { if (event.target === event.currentTarget) modal.close(); }}>
      <div className={styles.paper}>
        <button className={styles.close} onClick={modal.close} type="button" aria-label={en ? 'Close plaza map' : 'Cerrar mapa de la plaza'}>×</button>
        <small>WONDERPOP PLAZA</small><h2 id={id}>{en ? 'A little world to explore' : 'Un mundo por recorrer'}</h2>
        <p>{en ? 'Follow the arcade. The three shops await at the end.' : 'Sigue la galería. Al fondo te esperan los tres escaparates.'}</p>
        <div className={styles.plan}>
          <svg viewBox="0 0 500 430" aria-hidden="true">
            <path d="M50 60H450V400H295V414H205V400H50Z" fill="#ebcdab" stroke="#966d76" strokeWidth="3" />
            <path d="M150 142H350V400H150Z" fill="#fff0ce" stroke="#b58a7d" strokeWidth="2" />
            {[165, 245, 325].map(y => <g key={y}><path d={`M150 ${y}H350`} stroke="#c39481" strokeWidth="2" strokeDasharray="5 5" />{[143, 357].map(x => <g key={x}><rect x={x-9} y={y-9} width="18" height="18" fill="#ad7c89" stroke="#7e5668" /><circle cx={x} cy={y+30} r="12" fill="#879875" stroke="#697a60" /><circle cx={x-3} cy={y+27} r="5" fill="#b5b991" /></g>)}</g>)}
            <path d="M250 393V137M250 155L240 169M250 155L260 169" fill="none" stroke="#b28a69" strokeWidth="2" strokeDasharray="6 6" />
            <path d="m250 292 6 13 15 2-11 10 3 14-13-7-13 7 3-14-11-10 15-2Z" fill="#d6a963" stroke="#ac7b63" />
            <text x="85" y="235" fill="#906c73" fontSize="10" letterSpacing="2" transform="rotate(-90 85 235)">WONDERPOP</text>
            <text x="415" y="235" fill="#906c73" fontSize="10" letterSpacing="2" transform="rotate(90 415 235)">PLAZA</text>
          </svg>
          <div className={styles.destinations}>
          {['drink', 'collection', 'music'].map((section, i) => <button key={section} type="button" data-go-world="1.2" onClick={event => { chooseShowcase(event, section); modal.close(); }}>
            <img src={`/icons/icono_${['lata', 'bolsa', 'hexy'][i]}.webp`} alt="" width="28" height="28" />
            {['Magic Drink', en ? 'Collectibles' : 'Coleccionables', en ? 'Hexy’s music' : 'Música de Hexy'][i]} <span aria-hidden="true">→</span>
          </button>)}
          </div>
          <button className={styles.atrium} type="button" data-go-world=".99" onClick={modal.close} aria-current={where === 'atrium' ? 'location' : undefined}><b>06</b>{en ? 'The atrium' : 'El atrio'}{where === 'atrium' && <small>{en ? 'YOU ARE HERE' : 'ESTÁS AQUÍ'}</small>}</button>
          <button className={styles.gallery} type="button" data-go-world="1.2" onClick={modal.close} aria-current={where === 'gallery' ? 'location' : undefined}><b>07</b>{en ? 'The gallery' : 'Los escaparates'}{where === 'gallery' && <small>{en ? 'YOU ARE HERE' : 'ESTÁS AQUÍ'}</small>}</button>
          <span className={styles.entry}>{en ? 'ENTRANCE' : 'ENTRADA'} ↑</span>
        </div>
        <p className={styles.note}>{en ? 'You can also keep exploring by scrolling.' : 'También puedes seguir recorriendo la plaza con el scroll.'}</p>
      </div>
    </dialog>
  </>;
}
