import { useEffect, useRef, useState } from 'react';
import { wonderpopCollection } from '../../../data/wonderpopCollection';
import { SceneButton, SceneLabel } from '../../global/SceneControls';
import ExhibitScreen from './ExhibitScreen';
import MagicBunny from './MagicBunny';
import PlazaMap from './PlazaMap';
import usePlazaDialog from './usePlazaDialog';
import styles from '../css/wonderpopGallery.module.css';

export default function WonderPopGallery({ en }) {
  const root = useRef(null), dialog = useRef(null), cabinet = useRef(null);
  const [section, setSection] = useState('collection');
  const [index, setIndex] = useState(0);
  const modal = usePlazaDialog(dialog);
  const items = wonderpopCollection[section];
  const item = items[index];
  const title = en ? item.enName : item.name;
  const description = en ? item.enDescription : item.description;
  const href = item.href || (section === 'music' ? '/hexy' : '/wonderpop-plaza');
  const linkText = item.cta ? (en ? item.enCta : item.cta) : section === 'music' ? (en ? 'Meet Hexy' : 'Conoce a Hexy') : (en ? 'Explore WonderPop' : 'Descubre WonderPop');
  const choose = name => { if (wonderpopCollection[name]) { setSection(name); setIndex(0); } };
  const step = direction => setIndex(current => (current + direction + items.length) % items.length);
  useEffect(() => {
    const el = cabinet.current;
    const update = () => {
      if (el.scrollHeight > el.clientHeight + 1) el.setAttribute('data-lenis-prevent', '');
      else el.removeAttribute('data-lenis-prevent');
    };
    const observer = new ResizeObserver(update);
    observer.observe(el); observer.observe(el.lastElementChild.previousElementSibling);
    update();
    return () => observer.disconnect();
  }, [section, index]);
  useEffect(() => {
    const scene = root.current.closest('[data-journey]');
    const select = event => choose(event.detail);
    const leave = ({ detail: { progress, reduced } }) => { if (!reduced && progress < 1.07) modal.close(); };
    scene.addEventListener('plaza:select', select);
    scene.addEventListener('journey:scene', leave);
    return () => { scene.removeEventListener('plaza:select', select); scene.removeEventListener('journey:scene', leave); };
  }, [modal.close]);
  return <section ref={root} className={styles.gallery} data-world-scene="gallery" id="galeria-wonderpop" aria-label={en ? 'WonderPop gallery' : 'Galería de WonderPop'}>
    <div className={styles.plane} data-gallery-plane aria-hidden="true">
      <img className={styles.backdrop} data-gallery-art src="/image/journey/wonderpop-gallery-v17.webp" alt="" width="1536" height="1024" loading="lazy" onError={event => { if (!event.currentTarget.dataset.fallback) { event.currentTarget.dataset.fallback = 'true'; event.currentTarget.src = '/image/journey/wonderpop-atrium-v15.webp'; } }} />
      <div className={styles.warmGlass} /><div className={styles.shopLight} />
    </div>
    <div className={styles.decor} data-gallery-decor aria-hidden="true">
      <MagicBunny en={en} className={styles.galleryBunny} from={1.07} to={1.405} offset={5} />
      <img className={styles.leaves} data-gallery-leaves src="/image/journey/potted-jasmine-v13.webp" alt="" width="1024" height="1024" loading="lazy" />
      <div className={styles.notes}>{['♪', '♫', '✦', '♪', '♡'].map((note, i) => <span key={i} style={{ '--i': i }}>{note}</span>)}</div>
    </div>
    <div className={styles.copy} data-world-copy="gallery">
      <div className={styles.heading}><SceneLabel>{en ? '07 / THE GALLERY' : '07 / LOS ESCAPARATES'}</SceneLabel><h2>{en ? 'A little WonderPop to take with you.' : 'Un pedacito de WonderPop.'}</h2></div>
      <div ref={cabinet} className={styles.cabinet} data-gallery-cabinet onKeyDown={event => {
        if (event.key === 'ArrowRight') { event.preventDefault(); step(1); }
        if (event.key === 'ArrowLeft') { event.preventDefault(); step(-1); }
      }}>
        <div className={styles.categories} role="group" aria-label={en ? 'Display windows' : 'Escaparates'}>
          {['drink', 'collection', 'music'].map((name, i) => <button key={name} type="button" aria-pressed={section === name} onClick={() => choose(name)}>
            <span aria-hidden="true">{['✦', '♡', '♫'][i]}</span>{['Magic Drink', en ? 'Collectibles' : 'Coleccionables', 'Hexy'][i]}
          </button>)}
        </div>
        <div className={styles.exhibit}>
          <div className={styles.artwork}>
            <button className={styles.inspect} type="button" onClick={modal.open} aria-haspopup="dialog" aria-label={`${en ? 'View details:' : 'Ver detalle:'} ${title}`}>
              <ExhibitScreen image={item.image} alt={title} />
              <span className={styles.inspectHint}>{en ? 'TAKE A CLOSER LOOK' : 'MÍRALO DE CERCA'} <b aria-hidden="true">+</b></span>
            </button>
            <div className={styles.carousel}>
              <button type="button" onClick={() => step(-1)} disabled={items.length === 1} aria-label={en ? 'Previous item' : 'Pieza anterior'}>←</button>
              <span><b>{String(index + 1).padStart(2, '0')}</b> / {String(items.length).padStart(2, '0')}</span>
              <button type="button" onClick={() => step(1)} disabled={items.length === 1} aria-label={en ? 'Next item' : 'Siguiente pieza'}>→</button>
            </div>
          </div>
          <div className={styles.caption}>
            <small>{en ? item.enLabel : item.label}</small><h3 id="plaza-exhibit-title">{title}</h3><p>{description}</p>
            {section === 'music' && <button className={styles.listen} type="button" onClick={event => event.currentTarget.closest('[data-journey]').dispatchEvent(new CustomEvent('journey:listen'))}><span aria-hidden="true">▶</span> {en ? 'Listen to Hexy' : 'Escucha a Hexy'}<i className={styles.equalizer} aria-hidden="true"><i /><i /><i /></i></button>}
            <SceneButton href={href}>{linkText}</SceneButton>
            <span className={styles.stamp} aria-hidden="true">✧</span>
            {section === 'music' && <span className={styles.signature}>DJ Sweet Hex</span>}
          </div>
        </div>
        <span className={styles.srOnly} role="status">{title}, {index + 1} {en ? 'of' : 'de'} {items.length}</span>
      </div>
      <div className={styles.actions}><PlazaMap en={en} /><button type="button" data-go-world=".96">{en ? 'Back to the atrium' : 'Volver al atrio'} <span aria-hidden="true">↶</span></button></div>
    </div>
    <dialog ref={dialog} className={styles.detail} data-collection-detail data-lenis-prevent aria-labelledby="collection-detail-title" onClick={event => { if (event.target === event.currentTarget) modal.close(); }}>
      <div className={styles.detailPaper}>
        <button className={styles.close} type="button" onClick={modal.close} aria-label={en ? 'Close item details' : 'Cerrar detalle de la pieza'}>×</button>
        <img src={item.image} alt={title} width="700" height="700" draggable={false} />
        <div><small>WONDERPOP PLAZA</small><h2 id="collection-detail-title">{title}</h2><p>{description}</p><SceneButton href={href}>{linkText}</SceneButton></div>
      </div>
    </dialog>
  </section>;
}
