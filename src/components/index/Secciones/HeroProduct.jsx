import { useEffect, useRef, useState } from 'react';
import styles from '../css/heroProduct.module.css';

const art = '/image/journey/';
export function HeroTable() {
  return <>
    <img className={styles.table} data-hero-table data-critical src={`${art}cafe-table-v13.webp`} width="1536" height="1024" alt="" />
    <span className={styles.contact} />
    <div className={styles.plant} data-hero-plant>
      <img data-critical src={`${art}potted-jasmine-v13.webp`} width="1024" height="1024" alt="" />
      <img className={styles.crown} src={`${art}potted-jasmine-v13.webp`} width="1024" height="1024" alt="" />
    </div>
  </>;
}

export default function HeroProduct({ en, active }) {
  const [burst, setBurst] = useState(0);
  const timer = useRef();
  useEffect(() => {
    if (!active) setBurst(0);
    return () => clearTimeout(timer.current);
  }, [active]);
  function openCan() {
    clearTimeout(timer.current);
    setBurst(value => value + 1);
    timer.current = setTimeout(() => setBurst(0), 3000);
  }
  return <div className={styles.product} data-hero-product>
    <button className={styles.canButton} data-can-button type="button" onClick={openCan} tabIndex={active ? 0 : -1}
      aria-label={en ? 'Release a little Magic Drink magic' : 'Libera un poquito de magia de Magic Drink'} disabled={!active}>
      <img className={styles.can} data-critical src={`${art}original.webp`} alt="" width="1024" height="1536" fetchpriority="high" />
      <span className={styles.drops} aria-hidden="true">{[0, 1, 2, 3, 4].map(i => <i key={i} style={{ '--d': i }} />)}</span>
      <span className={styles.touchHint} aria-hidden="true">✦ {en ? 'Touch the magic' : 'Toca la magia'}</span>
    </button>
    {burst > 0 && <div key={burst} className={styles.burst} data-can-burst aria-hidden="true">
      <div className={styles.vapor}><i /><i /><i /></div>
      {Array.from({ length: 14 }, (_, i) => <span key={i} style={{ '--i': i, '--x': `${Math.sin(i * 2.4) * 135}px`, '--r': `${Math.cos(i) * 32}deg`, '--hue': `${i * 26}deg` }}>{['♪', '♥', '♫', '✦'][i % 4]}</span>)}
    </div>}
    <span className={styles.srOnly} role="status">{burst ? (en ? 'A little magic released!' : '¡Un poquito de magia liberada!') : ''}</span>
  </div>;
}
