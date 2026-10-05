import { useEffect, useRef, useState } from 'react';
import { useStore } from '@nanostores/react';
import { RotateCcw } from 'lucide-react';
import { isEnglish } from '../../data/variables';
import { SceneButton, SceneStar } from '../global/SceneControls';
import usePlazaDialog from '../index/Secciones/usePlazaDialog';
import useReducedMotion from '../hexy/components/useReducedMotion';
import IllustratedMenu, { IllustratedMenuTrigger } from '../global/IllustratedMenu';
import useIllustratedFinish from '../global/useIllustratedFinish';
import HexyFinish from '../hexy/HexyFinish';
import {HuntBunny,HuntToast} from '../arcade/BunnyHunt';
import styles from './magicDrinkExperience.module.css';

const art = '/image/magic-drink/v49/';
const decorative = { alt: '', draggable: false, decoding: 'async' };

function useBoutiqueMotion(ref, reduced) {
  useEffect(() => {
    const root = ref.current;
    const scenes = [...root.querySelectorAll('[data-drink-scene]')];
    let frame = 0, pointer = 0, position = 0;
    const paint = () => {
      frame = 0;
      position += (pointer - position) * .09;
      for (const scene of scenes) {
        const rect = scene.getBoundingClientRect();
        const visible = rect.bottom > 0 && rect.top < innerHeight && !document.hidden;
        scene.dataset.visible = String(visible);
        if (!visible && !reduced) continue;
        const travel = Math.max(-1, Math.min(1, (innerHeight * .5 - rect.top - rect.height * .5) / innerHeight));
        scene.style.setProperty('--view-x', `${reduced ? 0 : position.toFixed(3)}px`);
        scene.style.setProperty('--view-y', `${reduced ? 0 : (travel * 45).toFixed(3)}px`);
      }
      if (Math.abs(pointer - position) > .02) frame = requestAnimationFrame(paint);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(paint); };
    const move = e => {
      if (reduced || e.pointerType === 'touch') return;
      pointer = (e.clientX / innerWidth - .5) * 22;
      schedule();
    };
    const reset = () => { pointer = 0; schedule(); };
    const observer = new IntersectionObserver(schedule, { rootMargin: '100px' });
    scenes.forEach(scene => observer.observe(scene));
    root.addEventListener('pointermove', move, { passive: true });
    root.addEventListener('pointerleave', reset);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    document.addEventListener('visibilitychange', reset);
    schedule();
    return () => {
      cancelAnimationFrame(frame); observer.disconnect();
      root.removeEventListener('pointermove', move); root.removeEventListener('pointerleave', reset);
      window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule);
      document.removeEventListener('visibilitychange', reset);
    };
  }, [ref, reduced]);
}

function BoutiqueNavigation({ en, finish, onFinishChange, onMenuTarget }) {
  const dialog = useRef(null);
  const { open, close } = usePlazaDialog(dialog);
  const [opened, setOpened] = useState(false);
  const language = lang => {
    isEnglish.set(lang === 'en');
    try { localStorage.setItem('lang', lang); } catch { /* Selection works for this visit. */ }
  };
  return <>
    <header className={styles.header}>
      <nav className={styles.navigation} aria-label={en ? 'Magic Drink navigation' : 'Navegación de Magic Drink'}>
        <a className={styles.brand} href="/" aria-label={en ? 'Magic Drink home' : 'Magic Drink inicio'}><SceneStar /><span>MAGIC<small>DRINK</small></span></a>
        <div className={styles.localLinks}>
          <a href="/bebidas" aria-current="page">Magic Drink</a>
          <a href="#la-carta">{en ? 'The little details' : 'Los pequeños detalles'}</a>
          <a href="#un-ratito-mas">{en ? 'Stay a little longer' : 'Un ratito más'}</a>
        </div>
        <div className={styles.navTools}>
          <div className={styles.languages} role="group" aria-label={en ? 'Language' : 'Idioma'}>
            <button type="button" aria-pressed={!en} onClick={() => language('es')}>ES</button>
            <button type="button" aria-pressed={en} onClick={() => language('en')}>EN</button>
          </div>
          <IllustratedMenuTrigger en={en} aria-haspopup="dialog" aria-controls="drink-menu" aria-expanded={opened}
          onClick={() => { open(); setOpened(true); onMenuTarget(dialog.current); }} />
        </div>
      </nav>
    </header>
    <IllustratedMenu dialogRef={dialog} id="drink-menu" en={en} currentPath="/bebidas" data-drink-menu
      finish={finish} onFinishChange={onFinishChange} onClose={close}
      onClosed={() => { setOpened(false); onMenuTarget(null); }} resume={en ? 'Back to Magic Drink' : 'Volver a Magic Drink'} />
  </>;
}

function Atmosphere() {
  return <>
    <div className={styles.outdoors} data-drink-layer="city"><img {...decorative} src={`${art}window-city.webp`} loading="lazy" /></div>
    <div className={styles.clouds} data-drink-layer="clouds"><img {...decorative} src="/image/hexy/world-v35/clouds.webp" loading="lazy" /></div>
  </>;
}

function LightDust() {
  return <div className={styles.dust} data-drink-layer="light" aria-hidden="true">{Array.from({ length: 12 }, (_, i) => <i key={i} style={{ '--x': `${53 + (i * 13) % 42}%`, '--y': `${12 + (i * 17) % 62}%`, '--delay': `${i * -.63}s` }} />)}</div>;
}

function DrinkCan({ opened, onOpen, en, ready, failed, onReady, onError }) {
  const cel = useRef(null);
  const lift = useRef(null);
  const [liftReady, setLiftReady] = useState(false);
  useEffect(() => {
    const img = cel.current;
    if (img?.complete) { if (img.naturalWidth) onReady(); else onError(); }
    if (lift.current?.complete && lift.current.naturalWidth) setLiftReady(true);
  }, []);
  return <div className={styles.productPlacement} data-drink-contact="can" data-open={opened} data-lift-ready={liftReady}>
    <span className={styles.canShadow} data-drink-shadow aria-hidden="true" />
    <button type="button" className={styles.canButton} onClick={onOpen} disabled={!ready || opened || failed} aria-label={en ? 'Open Magic Drink' : 'Abrir Magic Drink'}>
      <img {...decorative} src="/image/journey/original.webp" alt="Magic Drink" width="1024" height="1536" fetchPriority="high" data-drink-can />
      <img {...decorative} ref={cel} className={styles.openCel} src={`${art}can-open.webp`} width="1024" height="1536" onLoad={onReady} onError={onError} data-drink-open-cel />
      <img {...decorative} ref={lift} className={styles.liftCel} src={`${art}can-lift.webp`} width="1024" height="1536" onLoad={() => setLiftReady(true)} data-ready={liftReady} data-drink-lift-cel />
    </button>
    <div className={styles.fizz} aria-hidden="true">{Array.from({ length: 16 }, (_, i) => <i key={i} style={{ '--i': i, '--drift': `${(i % 2 ? -1 : 1) * (12 + i * 5)}px`, '--size': `${3 + i % 5 * 2}px` }} />)}</div>
    {opened && <span className={styles.popWord} aria-hidden="true">pssst!</span>}
  </div>;
}

export default function MagicDrinkExperience() {
  const storedEnglish = useStore(isEnglish);
  const [hydrated, setHydrated] = useState(false);
  const en = hydrated && storedEnglish;
  const [finish, setFinish] = useIllustratedFinish();
  const [finishTarget, setFinishTarget] = useState(null);
  const [opened, setOpened] = useState(false);
  const [canReady, setCanReady] = useState(false);
  const [canFailed, setCanFailed] = useState(false);
  const root = useRef(null);
  const reduced = useReducedMotion();
  useBoutiqueMotion(root, reduced);
  useEffect(() => {
    try { isEnglish.set(localStorage.getItem('lang') === 'en'); } catch { isEnglish.set(false); }
    setHydrated(true);
  }, []);
  useEffect(() => { document.documentElement.lang = en ? 'en' : 'es'; }, [en]);
  const openCan = () => { if (canReady && !canFailed) setOpened(true); };
  return <div ref={root} className={styles.experience} data-magic-drink data-reduced-motion={reduced}>
    <a href="#la-barra" className={styles.skip}>{en ? 'Skip to the drink' : 'Ir a la bebida'}</a>
    <BoutiqueNavigation en={en} finish={finish} onFinishChange={setFinish} onMenuTarget={setFinishTarget} />
    <section id="la-barra" className={styles.hero} data-drink-scene="bar" aria-labelledby="drink-title">
      <div className={styles.sceneViewport} aria-hidden="true"><div className={styles.sceneCanvas}>
        <Atmosphere />
        <div className={styles.roomGround} data-drink-ground="bar"><picture><source media="(max-width: 720px)" srcSet={`${art}bar-mobile.webp`} /><img {...decorative} className={styles.roomArt} src={`${art}bar-room.webp`} fetchPriority="high" data-drink-layer="architecture" /></picture></div>
        <LightDust />
      </div></div>
      <div className={styles.sceneCanvas} data-drink-interactive-plane>
        <div className={styles.heroCopy}>
          <span className={styles.overline}><SceneStar /> MAGIC DRINK <SceneStar /></span>
          <h1 id="drink-title">{en ? 'Uncap' : 'Destapa'}<br /><em>{en ? 'the magic.' : 'la magia.'}</em></h1>
          <p>{en ? 'Sweet, unmistakable, and made for your favorite little moments.' : 'Dulce, inconfundible y hecha para tus pequeños grandes momentos.'}</p>
          <div className={styles.heroAction}>
            <SceneButton onClick={opened ? () => setOpened(false) : openCan} disabled={!canReady || canFailed} showArrow={false}>
              {opened ? <><RotateCcw size={15} />{en ? 'Once more?' : '¿Otra vez?'}</> : en ? 'Open your Magic Drink' : 'Abre tu Magic Drink'}
            </SceneButton>
            <span className={styles.openStatus} role="status" aria-live="polite">{opened ? (en ? 'That little sound. That big smile.' : 'Ese sonidito. Esa sonrisa.') : canFailed ? (en ? 'Your Magic Drink is here.' : 'Tu Magic Drink está aquí.') : (en ? 'There is a little magic under that tab.' : 'Hay un poquito de magia bajo esa anilla.')}</span>
          </div>
        </div>
        <DrinkCan opened={opened} onOpen={openCan} en={en} ready={canReady} failed={canFailed} onReady={() => setCanReady(true)} onError={() => setCanFailed(true)} />
        <span className={styles.counterCaption}>{en ? 'SERVED WITH A LITTLE JOY' : 'SE SIRVE CON UN POQUITO DE ALEGRÍA'} <SceneStar /></span>
      </div>
    </section>
    <section id="la-carta" className={styles.tasting} aria-labelledby="tasting-title">
      <div className={styles.moulding} aria-hidden="true"><img {...decorative} src="/image/hexy/world-v48/balcony-join.webp" loading="lazy" /></div>
      <div className={styles.tastingInner}>
        <div className={styles.tastingTitle}><span className={styles.overline}>{en ? 'THE LITTLE DETAILS' : 'LOS PEQUEÑOS DETALLES'}</span><h2 id="tasting-title">{en ? 'One taste.' : 'Un sabor.'}<br /><em>{en ? 'A whole world.' : 'Todo un mundo.'}</em></h2><SceneStar /></div>
        <dl className={styles.tastingNotes}>
          <div><dt><span>01</span>{en ? 'Sweet & unmistakable' : 'Dulce e inconfundible'}</dt><dd>{en ? 'You recognize it from the very first sip. And remember it long after the last.' : 'La reconoces desde el primer sorbo. Y te acuerdas de ella mucho después del último.'}</dd></div>
          <div><dt><span>02</span>{en ? 'Caffeine free' : 'Sin cafeína'}</dt><dd>{en ? 'For a sunny afternoon, your favorite song, or simply a little time for yourself.' : 'Para una tarde al sol, tu canción favorita o, simplemente, un ratito para ti.'}</dd></div>
        </dl>
      <span className={styles.menuSignature}>Magic Drink <SceneStar /> {en ? 'A little everyday magic.' : 'Un poquito de magia, todos los días.'}</span>
      </div>
      <div className={`${styles.moulding} ${styles.bottomMoulding}`} aria-hidden="true"><img {...decorative} src="/image/hexy/world-v48/balcony-join.webp" loading="lazy" /></div>
    </section>
    <section id="un-ratito-mas" className={styles.lounge} data-drink-scene="lounge" aria-labelledby="lounge-title">
      <div className={styles.sceneViewport}><div className={styles.sceneCanvas}>
        <Atmosphere />
        <div className={styles.roomGround} data-drink-ground="lounge"><picture><source media="(max-width: 720px)" srcSet={`${art}lounge-mobile.webp`} /><img {...decorative} className={styles.roomArt} src={`${art}lounge-room.webp`} loading="lazy" data-drink-layer="architecture" /></picture>
          <div className={styles.bunnyTable} data-drink-contact="table"><HuntBunny id="interview" en={en} place="loungeBunny"/><span className={styles.tableShadow} /><img {...decorative} src={`${art}bunny-table.webp`} loading="lazy" width="1254" height="1254" /><img {...decorative} className={styles.bunnyBlink} src={`${art}bunny-blink.webp`} loading="lazy" width="1254" height="1254" data-drink-bunny-cel /><img {...decorative} className={styles.tableCan} src="/image/journey/original.webp" loading="lazy" /></div>
        </div>
        <LightDust />
      </div></div>
      <div className={styles.sceneCanvas}>
        <div className={styles.loungeCopy}><span className={styles.overline}>{en ? 'THERE IS A SEAT FOR YOU' : 'HAY UN LUGAR PARA TI'}</span><h2 id="lounge-title">{en ? 'Stay a little' : 'Quédate'}<br /><em>{en ? 'longer.' : 'un ratito más.'}</em></h2><p>{en ? 'A Magic Drink. Good company. And nowhere else you need to be.' : 'Una Magic Drink. Buena compañía. Y ninguna prisa por irte.'}</p><div className={styles.loungeActions}><SceneButton href="/wonderpop-plaza">{en ? 'Let’s go to Wonderpop' : 'Vamos a Wonderpop'}</SceneButton><a href="/hexy" className={styles.musicLink}>{en ? 'Hexy brings the music' : 'Hexy pone la música'} <span aria-hidden="true">♫</span></a></div></div>
      </div>
      <footer className={styles.footer}><a href="/">MAGIC DRINK <SceneStar /></a><a href="/contacto">{en ? 'Say hello' : 'Escríbenos'}</a><a href="#la-barra">{en ? 'Back to the counter ↑' : 'Volver a la barra ↑'}</a></footer>
    </section>
    <HexyFinish enabled={finish.enabled} reduced={reduced} settings={finish} target={finishTarget} />
    <HuntToast en={en}/>
  </div>;
}
