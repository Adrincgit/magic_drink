import { useEffect, useRef, useState } from 'react';
import { FILM_END, filmShots, filmLocations, mapPoint, filmMoment } from '../../../data/wonderpopFilm';
import { INTERVIEW_ENTRY } from '../../../data/hexyInterviewTiming';
import land from '../../../data/wonderpopWorldMap.json';
import styles from '../css/wonderpopFilm.module.css';
import MagicDrinkSpotlight from './MagicDrinkSpotlight';

function WorldMap({ en }) {
  return <div className={styles.map} data-film-map>
    <span className={styles.mapHeading}>{en ? 'THE WORLD IS OUR NEXT CHAPTER' : 'EL MUNDO ES NUESTRO SIGUIENTE CAPÍTULO'}</span>
    <svg viewBox="0 0 1000 430" role="img" aria-label={en ? 'Wonderpop locations around the world' : 'Las plazas Wonderpop alrededor del mundo'}>
      <defs><pattern id="film-map-grid" width="83.33" height="71.66" patternUnits="userSpaceOnUse"><path d="M 83.33 0 H 0 V 71.66" fill="none" stroke="currentColor" strokeWidth=".7" opacity=".15" /></pattern></defs>
      <rect width="1000" height="430" fill="url(#film-map-grid)" />
      <g className={styles.continents}>{land.paths.map((path, i) => <path key={i} d={path} />)}</g>
      {filmLocations.map((place, i) => {
        const [x, y] = mapPoint(place);
        return <g key={place.lon} className={styles.location} data-film-place={i} data-coming={place.coming || undefined} style={{ '--place': i }}>
          <circle cx={x} cy={y} r="12" className={styles.ripple} /><circle cx={x} cy={y} r="4" />
          <path d={`M${x},${y} l${place.dx * .65},${place.dy * .65}`} />
          <text x={x + place.dx} y={y + place.dy} textAnchor={place.anchor || 'start'}>{place.name[en ? 1 : 0]}</text>
        </g>;
      })}
    </svg>
    <ul className={styles.mapLegend} aria-hidden="true">{filmLocations.map((place,i)=><li key={place.lon} className={styles.location} style={{'--place':i}}>{place.name[en ? 1 : 0]}</li>)}</ul>
    <p>{en ? 'One world. More places to share it.' : 'Un mismo mundo. Más lugares para compartirlo.'}</p>
  </div>;
}

function ShotContent({ shot, en }) {
  if (shot.kind === 'title') return <div className={styles.titleCard}>
    <span className={styles.presents}>Magic Drink {en ? 'presents' : 'presenta'}</span>
    <span className={styles.titleStar}>✦</span>
    <h2>{en ? <>A place<br />for the <em>magic</em></> : <>Un lugar<br />para la <em>magia</em></>}</h2>
    <span className={styles.edition}>WONDERPOP PICTURES · {en ? 'FROM OUR ARCHIVES' : 'DE NUESTROS ARCHIVOS'}</span>
  </div>;
  if (shot.kind === 'map') return <WorldMap en={en} />;
  if (shot.kind === 'product') return <MagicDrinkSpotlight en={en} />;
  if (shot.kind === 'final') return <div className={styles.finalTitle}>
    <span>{en ? 'THE NEXT CHAPTER IS YOURS' : 'EL SIGUIENTE CAPÍTULO ES TUYO'}</span>
    <h2>Wonderpop<br /><em>Plaza</em></h2>
    <a href="/wonderpop-plaza">{en ? 'Come visit us' : 'Ven a visitarnos'} <span aria-hidden="true">↗</span></a>
  </div>;
  return null;
}

export default function WonderpopFilm({ en = false }) {
  const host = useRef(null), surface = useRef(null);
  const [index, setIndex] = useState(0), [reduced, setReduced] = useState(false);
  const current = useRef(-1);
  const shot = filmShots[index];
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches);
    update(); media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    if (reduced) return;
    const el = host.current, root = el.closest('[data-journey]');
    let engine, pending = false, disposed = false;
    let latest = { progress: Number(root.dataset.worldProgress || 0), reduced: false };
    const update = async event => {
      latest = event?.detail || latest;
      const moment = filmMoment(latest.progress), selected = filmShots[moment.index];
      el.style.setProperty('--shot-p', moment.local);
      el.style.setProperty('--color', selected.color);
      el.style.setProperty('--reveal', selected.kind === 'final' ? Math.min(1, moment.local / .4) : 0);
      el.style.setProperty('--caption-opacity', Math.min(1, moment.local / .12, (1 - moment.local) / .06));
      el.dataset.filmShot = selected.id;
      el.dataset.filmIndex = String(moment.index);
      el.dataset.filmColor = String(selected.color);
      el.dataset.filmKind = selected.kind || 'image';
      if (current.current !== moment.index) { current.current = moment.index; setIndex(moment.index); }
      if (engine) { engine.update(latest); return; }
      if (pending || latest.reduced || latest.progress < .66 || latest.progress >= FILM_END) return;
      pending = true;
      try {
        const { createWonderpopFilm } = await import('../animations/wonderpopFilm');
        if (disposed) return;
        engine = createWonderpopFilm(surface.current);
        engine.update(latest);
      } catch { el.dataset.filmRenderer = 'fallback'; }
    };
    root.addEventListener('journey:scene', update); update();
    return () => { disposed = true; root.removeEventListener('journey:scene', update); engine?.dispose(); };
  }, [reduced]);
  return <section ref={host} id="directorio-wonderpop" className={styles.film} data-world-interior data-world-copy="interior" data-wonderpop-film data-film-renderer="fallback" data-film-kind={shot.kind || 'image'} aria-label={en ? 'The story of Wonderpop Plaza' : 'La historia de Wonderpop Plaza'}>
    {reduced ? <div className={styles.transcript}>
      {filmShots.map(item => <article key={item.id} style={{'--color':item.color}}>
        {item.file && item.kind !== 'product' && <img src={item.file} alt="" width="1536" height="1024" loading="lazy" />}
        <ShotContent shot={item} en={en} />
        {item.kind !== 'title' && item.kind !== 'final' && <h2>{item.title[en ? 1 : 0]}</h2>}
        <p>{item.caption[en ? 1 : 0]}</p>
      </article>)}
    </div> : <>
      <div className={styles.archiveLabel}><span>WONDERPOP PICTURES</span><span>{en ? 'A STORY IN' : 'UNA HISTORIA EN'} {filmShots.length} {en ? 'FRAMES' : 'FOTOGRAMAS'}</span></div>
      <div className={styles.frame} data-film-frame>
        <div className={styles.picture} ref={surface} data-film-surface>
          {shot.file && <img key={shot.file} className={styles.still} src={shot.file} alt="" draggable="false" />}
        </div>
        <div className={styles.content} key={shot.id}><ShotContent shot={shot} en={en} /></div>
        <div className={styles.filmDust} aria-hidden="true">{Array.from({ length: 9 }, (_, i) => <i key={i} style={{ '--i': i }} />)}</div>
        <div className={styles.edge} aria-hidden="true" />
        <span className={styles.frameCount} aria-hidden="true">{String(index + 1).padStart(2, '0')} / {filmShots.length}</span>
        <span className={styles.frameBrand} aria-hidden="true">MD · ARCHIVE</span>
      </div>
      <div className={styles.caption} data-film-caption>
        <span className={styles.kicker}>{index === 0 ? (en ? 'THE BEGINNING' : 'EL PRINCIPIO') : String(index + 1).padStart(2, '0') + ' / WONDERPOP'}</span>
        <h3>{shot.title[en ? 1 : 0]}</h3>
        <p key={shot.id}>{shot.caption[en ? 1 : 0]}</p>
      </div>
      <div className={styles.reel} aria-hidden="true">{filmShots.map((item, i) => <i key={item.id} data-current={i === index} data-past={i < index} />)}</div>
      <a className={styles.skip} href="#preguntas-wonderpop" data-go-world={INTERVIEW_ENTRY}>{en ? 'Continue the visit' : 'Continuar la visita'} <span aria-hidden="true">↓</span></a>
    </>}
  </section>;
}
