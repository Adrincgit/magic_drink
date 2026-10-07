import { useEffect, useRef, useState } from 'react';
import { useStore } from '@nanostores/react';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { isEnglish } from '../../data/variables';
import { SceneButton, SceneLabel, SceneStar } from '../global/SceneControls';
import usePlazaDialog from '../index/Secciones/usePlazaDialog';
import HexyPlayer, { HexyMiniPlayer, HexyListeningRoom } from './components/HexyPlayer';
import { useHexyAudio } from './components/HexyAudioProvider';
import useReducedMotion from './components/useReducedMotion';
import useSceneMotion from './components/useSceneMotion';
import { RoomScene } from './HexyPassages';
import IllustratedMenu, { IllustratedMenuTrigger } from '../global/IllustratedMenu';
import useIllustratedFinish from '../global/useIllustratedFinish';
import HexyFinish from './HexyFinish';
import HexyConcert from './HexyConcert';
import {HuntBunny,HuntToast} from '../arcade/hunt/BunnyHunt';
import styles from './HexyWorld.module.css';

const art = '/image/hexy/world-v34/';
const stageArt = '/image/hexy/world-v35/';
const lines = [
  ['¡Llegaste! Te guardé un lugar cerquita del escenario.', 'You made it! I saved you a spot right by the stage.'],
  ['¿Una canción más? Los Bunnies ya se saben el coro.', 'One more song? The Bunnies already know the chorus.'],
  ['Mi sombrero tiene estrella. Tú pones el brillo.', 'My hat has a star. You bring the sparkle.'],
];

function Layer({ depth = 1, travel = 0, className = '', children, ...props }) {
  return <div {...props} className={`${styles.depth} ${className}`} data-parallax-depth={depth}
    style={{ '--depth': depth, '--travel': travel }}>{children}</div>;
}

function FairyLights({ className = '' }) {
  return <div className={`${styles.fairyLights} ${className}`} aria-hidden="true">
    {[0, 1, 2, 3, 4].map(i => <span key={i} style={{ '--i': i }}>
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <path d="M50 2 61 32 82 18 68 40 98 50 68 60 82 82 60 68 50 98 40 68 18 82 32 60 2 50 32 40 18 18 40 32Z" fill="#fbe3a0" stroke="#c38e48" strokeWidth="1.2" />
        <path d="m50 2 0 48 11-18Z m48 48-48 0 18 10Z M50 98V50L40 68Z M2 50h48L32 40Z" fill="#edb650" />
        <path d="m18 18 32 32-10-18Z m64 0-32 32 18-10Z m0 64-32-32 10 18Z m-64 0 32-32-18 10Z" fill="#fff6d3" />
        <path d="M50 14v72M14 50h72" stroke="#fff9dc" strokeWidth="1.5" />
      </svg>
    </span>)}
  </div>;
}

function Dust() {
  return <div className={styles.dust} aria-hidden="true">{Array.from({ length: 14 }, (_, i) =>
    <i key={i} style={{ left: `${8 + (i * 23) % 86}%`, top: `${10 + (i * 37) % 77}%`, '--i': i }} />)}</div>;
}

function HexyCharacter({ pose = 'listen', className = '', interactive = false, onClick, en }) {
  const Tag = interactive ? 'button' : 'div';
  return <Tag type={interactive ? 'button' : undefined} onClick={onClick}
    aria-label={interactive ? (en ? 'Say hello to Hexy' : 'Saluda a Hexy') : undefined}
    className={`${styles.character} ${className}`} data-hexy-character data-pose={pose}>
    <span className={styles.performanceCels} aria-hidden="true">
      <img src={`${stageArt}hexy-idle.webp`} width="1120" height="1400" alt="" draggable="false" />
      <img className={styles.singingCel} src={`${stageArt}hexy-sing.webp`} width="1120" height="1400" alt="" draggable="false" />
      <img className={styles.blinkCel} src={`${stageArt}hexy-blink.webp`} width="1120" height="1400" alt="" draggable="false" />
      <img className={styles.winkCel} src={`${stageArt}hexy-wink.webp`} width="1120" height="1400" alt="" draggable="false" />
    </span>
  </Tag>;
}

function ShootingStars() {
  return <div className={styles.shootingStars} aria-hidden="true">{[0, 1, 2].map(i =>
    <i key={i} style={{ '--i': i }}><span /></i>)}</div>;
}

function StageConfetti({ burst = false }) {
  return <div className={burst ? styles.magicBurst : styles.stageConfetti} aria-hidden="true">
    {Array.from({ length: burst ? 12 : 18 }, (_, i) => <i key={i} style={{ '--i': i,
      '--start': `${(i * 37 + 7) % 100}%`, '--drift': `${(i % 2 ? 1 : -1) * (30 + i * 5)}px` }}>
      {i % 4 === 0 ? '♪' : i % 3 === 0 ? '✧' : '✦'}</i>)}
  </div>;
}

function Navigation({ en, finish, onFinishChange, onMenuTarget }) {
  const { openExpanded } = useHexyAudio();
  const dialog = useRef(null);
  const { open, close } = usePlazaDialog(dialog);
  const [opened, setOpened] = useState(false);
  const language = value => {
    isEnglish.set(value === 'en');
    try { localStorage.setItem('lang', value); } catch { /* The selection still works for this visit. */ }
  };
  return <>
    <nav className={styles.navigation} aria-label={en ? 'Hexy navigation' : 'Navegación de Hexy'}>
      <a href="/" className={styles.brand} aria-label={en ? 'Magic Drink home' : 'Magic Drink inicio'}>
        <SceneStar /><span>MAGIC<small>DRINK</small></span>
      </a>
      <div className={styles.localLinks}>
        <a href="#hexy-stage">{en ? 'The stage' : 'El escenario'}</a>
        <a href="#camerino">{en ? 'Backstage' : 'Camerino'}</a>
        <button type="button" onClick={openExpanded}>{en ? 'Songs' : 'Canciones'}</button>
      </div>
      <div className={styles.navTools}>
        <div className={styles.languages} aria-label={en ? 'Language' : 'Idioma'} role="group">
          <button type="button" aria-pressed={!en} onClick={() => language('es')}>ES</button>
          <button type="button" aria-pressed={en} onClick={() => language('en')}>EN</button>
        </div>
        <IllustratedMenuTrigger en={en} aria-haspopup="dialog" aria-controls="hexy-menu" aria-expanded={opened}
          onClick={() => { open(); setOpened(true); onMenuTarget(dialog.current); }} />
      </div>
    </nav>
    <IllustratedMenu dialogRef={dialog} id="hexy-menu" en={en} currentPath="/hexy" data-hexy-menu
      finish={finish} onFinishChange={onFinishChange} onClose={close}
      onClosed={() => { setOpened(false); onMenuTarget(null); }} resume={en ? 'Back to Hexy' : 'Volver con Hexy'} />
  </>;
}

function Hero({ en, reduced }) {
  const { isPlaying, togglePlay, openExpanded } = useHexyAudio();
  const [greeting, setGreeting] = useState(-1);
  const [reacting, setReacting] = useState(false);
  useEffect(() => {
    if (!reacting) return;
    const timer = setTimeout(() => setReacting(false), 3000);
    return () => clearTimeout(timer);
  }, [reacting, greeting]);
  const hello = () => { setGreeting(previous => (previous + 1) % lines.length); setReacting(true); };
  return <section id="hexy-stage" className={styles.hero} data-hexy-scene="stage" data-scene-active="true">
    <div className={styles.heroWorld}>
      <Layer className={styles.nightSky} data-scenery="sky" depth={-.65} travel={.3}><Dust /></Layer>
      <Layer className={styles.farClouds} data-scenery="clouds-far" depth={-.9} travel={.25}><img src={`${stageArt}clouds.webp`} alt="" width="1672" height="941" /></Layer>
      <Layer className={styles.comets} data-scenery="comets" depth={-1.1} travel={.2}><ShootingStars /></Layer>
      <Layer className={styles.palaces} data-scenery="palaces" depth={-.35} travel={.15}><img src={`${stageArt}palaces.webp`} alt="" width="1672" height="941" /></Layer>
      <Layer className={styles.nearClouds} data-scenery="clouds-near" depth={.15} travel={.1}><img src={`${stageArt}clouds.webp`} alt="" width="1672" height="941" /></Layer>
      <Layer className={styles.theatre} data-scenery="architecture" depth={.7} travel={.08}><img src={`${stageArt}room.webp`} alt="" fetchPriority="high" width="1672" height="941" /></Layer>
      <Layer className={styles.stageGlow} depth={.4} travel={-.15} />
      <Layer className={styles.heroLights} data-scenery="lamps" depth={1.3} travel={-.25}><FairyLights /></Layer>
      <Layer className={styles.nearStar} depth={3.4} travel={-.45}><SceneStar /></Layer>
      <Layer className={styles.musicNotes} depth={2.8} travel={-.45}>
        <span>♪</span><span>♫</span><span>✦</span>
      </Layer>
      <Layer className={styles.curtains} depth={3.8} travel={-.3}><img src={`${art}curtains.webp`} alt="" width="1672" height="941" /></Layer>
      <Layer className={styles.heroDust} depth={1.8} travel={-.6}><Dust /></Layer>
      <StageConfetti />
    </div>
    <div className={styles.heroShade} aria-hidden="true" />
    <Layer className={styles.foregroundPlants} data-scenery="plants" data-foliage-bridge depth={2.7} travel={-.12} aria-hidden="true">
      <img className={styles.plantCrown} src={`${stageArt}plants.webp`} alt="" width="1672" height="941" />
      <img className={styles.plantTrail} src="/image/hexy/world-v37/trailing-plants.webp" alt="" width="1672" height="941" />
    </Layer>
    <div className={styles.heroCopy}>
      <SceneLabel>{en ? 'Magic Drink presents its star' : 'Magic Drink presenta a su estrella'}</SceneLabel>
      <h1><span>{en ? 'Welcome to the world of' : 'Bienvenido al mundo de'}</span>HEXY<SceneStar /></h1>
      <p className={styles.heroTagline}>{en ? 'A voice. A spark.' : 'Una voz. Una chispa.'}<br />{en ? 'A chorus you take with you.' : 'Un coro que se queda contigo.'}</p>
      <p className={styles.heroDescription}>{en ? 'Come closer. The lights are on, the Bunnies are ready… and this song is for you.' : 'Acércate. Las luces están encendidas, los Bunnies están listos… y esta canción es para ti.'}</p>
      <div className={styles.heroActions}>
        <SceneButton onClick={togglePlay} icon={isPlaying ? 'pause' : 'play'}>{isPlaying ? (en ? 'Pause music' : 'Pausar música') : (en ? 'Listen to music' : 'Escuchar música')}</SceneButton>
        <button type="button" onClick={openExpanded} className={styles.explore}>{en ? 'Explore songs' : 'Explorar canciones'}<ArrowUpRight size={16} aria-hidden="true" /></button>
      </div>
      <div className={styles.fameStrip}>
        <div><strong>2.4B+</strong><span>{en ? 'streams' : 'reproducciones'}</span></div>
        <SceneStar /><div><strong>15M+</strong><span>{en ? 'fans around the world' : 'fans en todo el mundo'}</span></div>
        <SceneStar /><div><strong>#1</strong><span>{en ? 'good vibes' : 'vibra positiva'}</span></div>
      </div>
    </div>
    <div className={styles.performer}>
      <Layer className={styles.heroCharacter} data-scenery="hexy" depth={1.9} travel={-.16}>
        <HexyCharacter en={en} interactive onClick={hello} pose={reacting ? 'explain' : isPlaying ? 'excited' : 'listen'} />
      </Layer>
      {reacting && <StageConfetti key={greeting} burst />}
      <div className={`${styles.helloBubble} ${reacting ? styles.bubbleActive : ''}`} aria-live="polite">
      {greeting >= 0 ? lines[greeting][en ? 1 : 0] : (en ? 'Psst… come say hello!' : 'Psst… ¡ven a saludar!')}
      </div>
      <span className={styles.autograph} aria-hidden="true">con cariño, <b>Hexy ♡</b></span>
    </div>
    <div className={styles.heroPlayer}><HexyPlayer /></div>
    <a href="#camerino" className={styles.scrollInvitation}>{en ? 'There is more behind the curtain' : 'Hay más detrás del telón'}<ArrowDown size={14} aria-hidden="true" /></a>
  </section>;
}

function Backstage({ en }) {
  const [selected, setSelected] = useState(0);
  const reduced = useReducedMotion();
  const notes = en ? [
    ['01', 'A star with her own voice', 'Pink hair, a witch hat and a golden star. Hexy is Magic Drink’s virtual idol: a performer who turns every appearance into a little pop spell.'],
    ['02', 'Small songs. Big feelings.', 'Bright hooks, playful beats and phrases that follow you home. Her world lives in concerts, clips and the choruses you find yourself humming.'],
    ['03', 'The chorus is yours, too', 'The Magic Bunnies answer with tiny voices, echoes and melodic giggles. But the moment really comes alive when you join in.'],
  ] : [
    ['01', 'Una estrella con voz propia', 'Cabello rosa, sombrero de bruja y una estrella dorada. Hexy es la idol virtual de Magic Drink: convierte cada aparición en un pequeño hechizo pop.'],
    ['02', 'Canciones pequeñas. Emociones enormes.', 'Hooks brillantes, beats juguetones y frases que te acompañan a casa. Su mundo vive en conciertos, clips y esos coros que acabas tarareando.'],
    ['03', 'El coro también eres tú', 'Los Magic Bunnies responden con voces pequeñas, ecos y risitas melódicas. Pero el momento cobra vida cuando tú también te unes.'],
  ];
  return <section id="camerino" className={styles.backstage} data-hexy-scene="backstage" aria-labelledby="backstage-title">
    <div className={styles.chapterRail}><span>01 / {en ? 'BACKSTAGE' : 'ENTRE BASTIDORES'}</span><i /><SceneStar /></div>
    <div className={styles.backstageLayout}>
      <div className={styles.scrapbook}>
        <HuntBunny id="festival" en={en} place="scrapbookBunny" />
        <Layer className={styles.photoBack} depth={.65} travel={-.4}><span>HEXY · MAGIC DRINK</span></Layer>
        <Layer className={styles.photoFront} depth={1.3} travel={-.25}>
          <img src="/image/hexy/hexy-bunnies-concert.webp" alt={en ? 'Hexy singing with the Magic Bunnies' : 'Hexy cantando con los Magic Bunnies'} loading="lazy" />
          <span>{en ? 'My favorite place? Right here.' : '¿Mi lugar favorito? Justo aquí.'} ♡</span>
        </Layer>
        <Layer className={styles.photoStar} depth={2.5} travel={-.5}><SceneStar /></Layer>
        <Layer className={styles.bunnySticker} depth={2.1} travel={-.2}>
          <button type="button" aria-label={en ? 'Meet the Magic Bunnies' : 'Conoce a los Magic Bunnies'} onClick={() => document.getElementById('estudio')?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth' })}>
            <i className={styles.bunnyCel} aria-hidden="true" /><span>{en ? 'Our turn!' : '¡Nos toca!'}</span>
          </button>
        </Layer>
      </div>
      <div className={styles.paperPanel}>
        <span className={styles.paperClip} aria-hidden="true">✦</span>
        <span className={styles.inkEyebrow}>{en ? 'A little closer to our star' : 'Un poquito más cerca de nuestra estrella'}</span>
        <h2 id="backstage-title">{en ? 'There is a little' : 'Hay un poquito'}<br />{en ? 'Hexy in every chorus.' : 'de Hexy en cada coro.'}</h2>
        <div className={styles.noteTabs} role="tablist" aria-label={en ? 'Meet Hexy' : 'Conoce a Hexy'}>
          {notes.map((note, i) => <button key={i} type="button" role="tab" aria-selected={selected === i} aria-controls={`hexy-note-${i}`} id={`hexy-tab-${i}`}
            tabIndex={selected === i ? 0 : -1} onClick={() => setSelected(i)} onKeyDown={event => {
              if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
              event.preventDefault();
              const next = event.key === 'Home' ? 0 : event.key === 'End' ? 2 : (i + (event.key === 'ArrowRight' ? 1 : 2)) % 3;
              setSelected(next); document.getElementById(`hexy-tab-${next}`)?.focus();
            }}>{note[0]}<span>{i === 0 ? (en ? 'Her spark' : 'Su chispa') : i === 1 ? (en ? 'Her music' : 'Su música') : (en ? 'Her world' : 'Su mundo')}</span></button>)}
        </div>
        {notes.map((note, i) => <div key={i} id={`hexy-note-${i}`} role="tabpanel" aria-labelledby={`hexy-tab-${i}`} hidden={selected !== i} className={styles.noteContent}>
          <h3>{note[1]}</h3><p>{note[2]}</p>
        </div>)}
        <p className={styles.handwritten}>{en ? '“More than a song. A feeling.”' : '«Más que una canción. Una sensación.»'} <span>— Hexy</span></p>
      </div>
    </div>
  </section>;
}

function Studio({ en, rehearsing, onRehearse }) {
  const { openExpanded } = useHexyAudio();
  return <section id="estudio" className={`${styles.studio} ${styles.bunnyStudio}`} data-hexy-scene="studio" data-take={rehearsing}>
    <div className={styles.chapterRail}><span>02 / {en ? 'ONE MORE TAKE' : 'UNA TOMA MÁS'}</span><i /><SceneStar /></div>
    <div className={styles.studioLayout}>
      <div className={styles.studioCopy}>
        <SceneLabel>{en ? 'Tiny voices. A whole world.' : 'Voces pequeñas. Un mundo entero.'}</SceneLabel>
        <h2>{en ? 'A chorus' : 'Un coro'}<br /><em>{en ? 'full of Bunnies.' : 'lleno de Bunnies.'}</em></h2>
        <p>{en ? 'Sweet echoes, mischievous syllables and little melodic laughs. They never steal the spotlight… but try to imagine the chorus without them.' : 'Ecos dulces, sílabas traviesas y pequeñas risas melódicas. Nunca se roban el escenario… pero intenta imaginar el coro sin ellos.'}</p>
        <div className={styles.bunnyActions}>
          <SceneButton onClick={onRehearse} showArrow={false}>{rehearsing ? '♪ La-la, la-la… ♫' : (en ? 'One more take, Bunnies!' : '¡Otra toma, Bunnies!')}</SceneButton>
          <button type="button" onClick={openExpanded} className={styles.explore}>{en ? 'Let me hear those choruses' : 'Quiero escuchar esos coros'}<ArrowUpRight size={17} aria-hidden="true" /></button>
        </div>
        <span className={styles.bunnyCaption} aria-live="polite">{rehearsing ? (en ? 'All together… one, two, three!' : 'Todos juntos… ¡uno, dos, tres!') : (en ? 'The smallest voices have the biggest plans.' : 'Las voces más pequeñas tienen los planes más grandes.')}</span>
      </div>
    </div>
  </section>;
}

export default function HexyWorld() {
  const en = useStore(isEnglish);
  const { isPlaying, expanded } = useHexyAudio();
  const reduced = useReducedMotion();
  const [finish, setFinish] = useIllustratedFinish();
  const [finishTarget, setFinishTarget] = useState(null);
  const [rehearsing, setRehearsing] = useState(false);
  useEffect(() => {
    if (!rehearsing) return;
    const timer = setTimeout(() => setRehearsing(false), 2800);
    return () => clearTimeout(timer);
  }, [rehearsing]);
  const root = useRef(null);
  useSceneMotion(root, reduced);
  useEffect(() => {
    try { const lang = localStorage.getItem('lang'); if (lang) isEnglish.set(lang === 'en'); } catch { /* Keep default language. */ }
  }, []);
  return <div ref={root} className={styles.world} data-hexy-world data-playing={isPlaying} data-rehearsing={rehearsing} data-reduced-motion={reduced}>
    <Navigation en={en} finish={finish} onFinishChange={setFinish} onMenuTarget={setFinishTarget} />
    <Hero en={en} reduced={reduced} />
    <div className={styles.passages} data-hexy-passages data-hexy-scene="passages">
      <RoomScene room="backstage" en={en}><Backstage en={en} /></RoomScene>
      <RoomScene room="studio" en={en}><Studio en={en} rehearsing={rehearsing} onRehearse={() => setRehearsing(true)} /></RoomScene>
      <HexyConcert en={en} />
    </div>
    <HexyMiniPlayer />
    <HexyListeningRoom />
    <HexyFinish enabled={finish.enabled} reduced={reduced} settings={finish} target={finishTarget} expanded={expanded} />
    <HuntToast en={en}/>
  </div>;
}
