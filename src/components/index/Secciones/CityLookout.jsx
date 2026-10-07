import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { SceneButton } from '../../global/SceneControls';
import usePlazaDialog from './usePlazaDialog';
import styles from '../css/cityLookout.module.css';
import waterStyles from '../css/waterSurface.module.css';
import { HuntBunny } from '../../arcade/hunt/BunnyHunt';

const art = '/image/journey/';
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

function LookoutLandscape({ reduced }) {
  const water = useRef(null);
  useEffect(() => {
    if (reduced) return;
    let disposed = false, animator;
    import('../animations/waterMotion').then(async ({ createWaterMotion }) => {
      if (disposed) return;
      animator = await createWaterMotion(water.current);
      if (disposed) animator.dispose(); else animator.update({ progress: 0, reduced: false });
    }).catch(() => { /* The painted river is the WebGL fallback. */ });
    return () => { disposed = true; animator?.dispose(); };
  }, [reduced]);
  return <>
    <div className={styles.clouds}><img src={`${art}clouds.webp`} alt="" width="1536" height="1024" draggable="false" /></div>
    <img className={styles.hills} src={`${art}distance-hills-v2.webp`} alt="" width="2172" height="724" draggable="false" />
    <div ref={water} className={`${waterStyles.surface} ${styles.water}`} data-lookout-water data-renderer="fallback">
      <img src={`${art}distance-water-v2.webp`} alt="" width="2172" height="724" draggable="false" />
    </div>
    <img className={styles.city} src={`${art}distance-city-v2.webp`} alt="" width="2172" height="724" draggable="false" />
    <div className={styles.birds}>{[0, 1, 2].map(i => <svg key={i} style={{ '--bird': i }} viewBox="0 0 28 12"><path d="M1 7Q8 0 14 8Q20 0 27 7" /></svg>)}</div>
  </>;
}

export default function CityLookout({ root, active, en }) {
  const dialog = useRef(null), viewport = useRef(null), panorama = useRef(null), drag = useRef(null);
  const camera = useRef({ x: .26, y: .62 });
  const { open, close } = usePlazaDialog(dialog);
  const [mount, setMount] = useState(null);
  const [opened, setOpened] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      setReduced(media.matches);
      setMount(root.current.querySelector(media.matches ? '[data-hero-actions]' : '[data-lookout-mount]'));
    };
    update(); media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [root]);

  function aim(x, y) {
    const view = viewport.current, scene = panorama.current;
    if (!view || !scene) return;
    const edge = Math.min(.49, view.clientWidth / scene.offsetWidth / 2);
    const next = { x: clamp(x, edge, 1 - edge), y: clamp(y, .53, .70) };
    camera.current = next;
    scene.style.setProperty('--aim-x', `${next.x * 100}%`);
    scene.style.setProperty('--aim-y', `${next.y * 100}%`);
    scene.dataset.aim = `${next.x.toFixed(4)},${next.y.toFixed(4)}`;
  }

  useEffect(() => {
    if (!opened) return;
    const resize = () => aim(camera.current.x, camera.current.y);
    const view = viewport.current;
    // This surface pans the illustration, never the document or a native fling.
    const preventScroll = event => event.preventDefault();
    view.addEventListener('touchmove', preventScroll, { passive: false });
    const observer = new ResizeObserver(resize);
    observer.observe(viewport.current); observer.observe(panorama.current);
    resize();
    return () => { observer.disconnect(); view.removeEventListener('touchmove', preventScroll); };
  }, [opened, zoom]);

  function enter() {
    camera.current = { x: .26, y: .62 };
    setZoom(1); setOpened(true); open();
  }
  function move(dx, dy = 0) { aim(camera.current.x + dx, camera.current.y + dy); }
  function keyMove(event) {
    const arrows = { ArrowLeft: [-.025, 0], ArrowRight: [.025, 0], ArrowUp: [0, -.025], ArrowDown: [0, .025] };
    if (arrows[event.key]) { event.preventDefault(); move(...arrows[event.key]); }
    if (event.key === 'Home') { event.preventDefault(); aim(.26, .62); }
  }
  function startDrag(event) {
    if (event.button !== 0) return;
    event.preventDefault();
    // A tap can discover Nube; a drag starting on him still pans the city.
    if (!event.target.closest('[data-hunt-bunny]')) {
      event.currentTarget.focus({ preventScroll: true });
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    drag.current = { originX: camera.current.x, originY: camera.current.y, pointerX: event.clientX, pointerY: event.clientY };
    event.currentTarget.dataset.dragging = 'true';
  }
  function dragView(event) {
    if (!drag.current) return;
    const start = drag.current;
    if (Math.hypot(event.clientX-start.pointerX,event.clientY-start.pointerY)<8) return;
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.setPointerCapture(event.pointerId);
    aim(start.originX - (event.clientX - start.pointerX) / panorama.current.offsetWidth,
      start.originY - (event.clientY - start.pointerY) / panorama.current.offsetHeight);
  }
  function stopDrag(event) { drag.current = null; delete event.currentTarget.dataset.dragging; }

  return <>
    {mount && createPortal(<button type="button" className={styles.trigger} data-lookout-trigger data-inline={reduced}
      hidden={!active && !reduced} aria-haspopup="dialog" aria-label={en ? 'Look through the binoculars' : 'Mirar por los binoculares'} onClick={enter}>
      <img src={`${art}lookout/viewer-v52.webp`} alt="" width="512" height="768" draggable="false" />
      <span><b aria-hidden="true">✦</b> {en ? 'Lookout' : 'Mirador'} <b aria-hidden="true">↗</b></span>
    </button>, mount)}
    <dialog ref={dialog} className={styles.dialog} data-city-lookout data-lenis-prevent aria-labelledby="lookout-title"
      onClose={() => { setOpened(false); drag.current = null; }}>
      <header className={styles.header}>
        <div><span>{en ? 'A LITTLE CLOSER' : 'UN POQUITO MÁS CERCA'}</span><h2 id="lookout-title">{en ? 'The city, through your eyes.' : 'La ciudad, con tus ojos.'}</h2></div>
        <button type="button" className={styles.close} onClick={close} aria-label={en ? 'Leave the lookout' : 'Salir del mirador'} autoFocus>×</button>
      </header>
      {opened && <div ref={viewport} className={styles.viewport} data-lookout-view tabIndex="0" role="region"
        aria-label={en ? 'City, bridges and lake. Drag or use the arrow keys to look around.' : 'Ciudad, puentes y lago. Arrastra o usa las flechas para mirar alrededor.'}
        onKeyDown={keyMove} onPointerDown={startDrag} onPointerMove={dragView} onPointerUp={stopDrag} onPointerCancel={stopDrag} onLostPointerCapture={stopDrag}>
        <div className={styles.lenses}>
          <div ref={panorama} className={styles.panorama} data-lookout-panorama style={{ '--zoom': zoom }}>
            <LookoutLandscape reduced={reduced} />
            <HuntBunny id="lookout" en={en} place="lookout" />
          </div>
          <div className={styles.optics} aria-hidden="true" />
        </div>
        <div className={styles.reticle} aria-hidden="true"><i /><span>✧</span><i /></div>
      </div>}
      <footer className={styles.footer}>
        <p id="lookout-hint">{en ? 'Drag to explore · take your time' : 'Arrastra para explorar · sin prisa'}</p>
        <div className={styles.controls}>
          <button type="button" onClick={() => move(-.065)} aria-label={en ? 'Look left' : 'Mirar a la izquierda'}>←</button>
          <label><span>{en ? 'Zoom' : 'Acercar'}</span><input aria-label={en ? 'Binocular zoom' : 'Aumento de los binoculares'} type="range" min="1" max="1.6" step=".05" value={zoom} onChange={event => setZoom(Number(event.target.value))} /><output>{zoom.toFixed(1)}×</output></label>
          <button type="button" onClick={() => move(.065)} aria-label={en ? 'Look right' : 'Mirar a la derecha'}>→</button>
        </div>
        <SceneButton variant="violet" size="sm" showArrow={false} onClick={close}>{en ? 'Back to the walk' : 'Volver al paseo'}</SceneButton>
      </footer>
    </dialog>
  </>;
}
