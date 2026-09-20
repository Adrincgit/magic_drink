import { memo, useEffect, useRef, useState } from 'react';
import styles from '../css/heroProduct.module.css';
import CanCondensation from './CanCondensation';

const art = '/image/journey/';
export function HeroTable() {
  return <>
    <img className={styles.table} data-hero-table data-critical src={`${art}cafe-table-v13.webp`} width="1536" height="1024" alt="" />
    <div className={styles.plant} data-hero-plant>
      <img data-critical src={`${art}potted-jasmine-v13.webp`} width="1024" height="1024" alt="" />
      <img className={styles.crown} src={`${art}potted-jasmine-v13.webp`} width="1024" height="1024" alt="" />
    </div>
  </>;
}

function HeroProduct({ en, active }) {
  const [burst, setBurst] = useState(0);
  const timer = useRef();
  useEffect(() => {
    if (!active) setBurst(0);
    return () => clearTimeout(timer.current);
  }, [active]);
  function openCan() {
    clearTimeout(timer.current);
    setBurst(value => value + 1);
    timer.current = setTimeout(() => setBurst(0), 7200);
  }
  return <div className={styles.product} data-hero-product>
    <span className={styles.contact} aria-hidden="true" />
    {burst > 0 && <div key={burst} className={styles.burst} data-can-burst aria-hidden="true">
      <div className={styles.vapor}>{Array.from({ length: 7 }, (_, i) => <i key={i} style={{ '--i': i }} />)}</div>
      {Array.from({ length: 20 }, (_, i) => <span key={i} style={{ '--i': i, '--x': `${Math.sin(i * 2.4) * 130}px`, '--r': `${Math.cos(i) * 32}deg`, '--hue': `${i * 26}deg` }}>{['♪', '♥', '♫', '✦'][i % 4]}</span>)}
    </div>}
    <button className={styles.canButton} data-can-button type="button" onClick={openCan} tabIndex={active ? 0 : -1}
      aria-label={en ? 'Release a little Magic Drink magic' : 'Libera un poquito de magia de Magic Drink'} disabled={!active}>
      <img className={styles.can} data-critical src={`${art}original.webp`} alt="" width="1024" height="1536" fetchpriority="high" />
      <CanCondensation active={active} />
      <span className={styles.touchHint} aria-hidden="true">✦ {en ? 'Touch the magic' : 'Toca la magia'}</span>
    </button>
    <span className={styles.srOnly} role="status">{burst ? (en ? 'A little magic released!' : '¡Un poquito de magia liberada!') : ''}</span>
  </div>;
}
export default memo(HeroProduct);
