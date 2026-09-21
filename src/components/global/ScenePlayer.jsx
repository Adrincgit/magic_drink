import { useEffect, useId, useRef, useState } from 'react';
import styles from './css/scenePlayer.module.css';
import { SceneStar } from './SceneControls';

const clock = seconds => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;

export default function ScenePlayer({ en, playing, elapsed, duration, onToggle, onSeek,
  track, tracks, trackIndex, onSelect, onNext, compact = false, onClose, audioError }) {
  const [expanded, setExpanded] = useState(false);
  const listId = useId();
  const container = useRef(null);
  const listToggle = useRef(null);
  function closeList() { setExpanded(false); listToggle.current?.focus({ preventScroll: true }); }
  useEffect(() => {
    if (!expanded) return;
    const outside = event => { if (!container.current?.contains(event.target)) setExpanded(false); };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [expanded]);
  return <div className={`${styles.player} ${compact ? styles.compact : ''}`}
    ref={container} onKeyDown={event => { if (event.key === 'Escape' && expanded) { event.stopPropagation(); closeList(); } }}
    data-scene-player={compact ? undefined : ''} data-compact-player={compact ? '' : undefined} data-playing={playing}>
    {!compact && <div className={styles.topline}><span>HEXY / MAGIC DRINK</span><SceneStar /><span>{en ? 'MUSIC' : 'MÚSICA'}</span></div>}
    <div className={styles.controls}>
      <button className={styles.record} type="button" onClick={onToggle}
        aria-label={`${playing ? (en ? 'Pause' : 'Pausar') : (en ? 'Play' : 'Reproducir')} ${track.title}`} aria-pressed={playing}>
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          {playing ? <path d="M7 5h4v14H7Zm6 0h4v14h-4Z" /> : <path d="m8 5 11 7-11 7Z" />}
        </svg>
      </button>
      {compact && <img className={styles.cover} data-current-cover src={track.cover} alt="" width="38" height="38" draggable={false} />}
      <div className={styles.track}>
        <strong>{track.title}</strong>
        <span>{compact ? 'HEXY' : (en ? 'Performed by Hexy' : 'Interpretado por Hexy')}</span>
        {!compact && <div className={styles.timeline}>
          <input type="range" min="0" max={duration || 1} step="0.1" value={Math.min(elapsed, duration || 1)}
            disabled={!duration} onChange={e => onSeek(Number(e.target.value))}
            aria-label={en ? 'Track position' : 'Posición de la canción'} aria-valuetext={`${clock(elapsed)} / ${clock(duration)}`}
            style={{ '--played': `${duration ? elapsed / duration * 100 : 0}%` }} />
          <span>{clock(elapsed)}</span>
        </div>}
      </div>
      <button className={styles.smallButton} type="button" onClick={onNext} aria-label={en ? 'Next song' : 'Siguiente canción'}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 5 10 7L5 19Zm11 0h3v14h-3Z" /></svg>
      </button>
      {compact && <>
        <button ref={listToggle} className={styles.smallButton} type="button" onClick={() => setExpanded(!expanded)} aria-expanded={expanded} aria-controls={listId} aria-label={en ? 'Song list' : 'Lista de canciones'}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v2H4Zm0 6h16v2H4Zm0 6h10v2H4Z" /></svg>
        </button>
        <button className={styles.close} type="button" onClick={onClose} aria-label={en ? 'Close and stop music' : 'Cerrar y detener la música'}>×</button>
      </>}
    </div>
    {!compact && <div className={styles.bottomline}>
      <button ref={listToggle} className={styles.listToggle} type="button" onClick={() => setExpanded(!expanded)} aria-expanded={expanded} aria-controls={listId}>
        <span aria-hidden="true">♫</span> {en ? 'Song list' : 'Lista de canciones'} <span aria-hidden="true">{expanded ? '−' : '+'}</span>
      </button>
      <details className={styles.credits}>
        <summary>{en ? 'Credits' : 'Créditos'}</summary>
        <div className={styles.creditCard}><strong>DJ Sweet Hex</strong></div>
      </details>
    </div>}
    <div className={styles.playlist} id={listId} hidden={!expanded} data-lenis-prevent>
      <div className={styles.playlistHeading}><span>HEXY · {tracks.length} {en ? 'SONGS' : 'CANCIONES'}</span><button type="button" onClick={closeList} aria-label={en ? 'Close song list' : 'Cerrar lista de canciones'}>×</button></div>
      <ol>{tracks.map((song, index) => <li key={song.id}><button type="button" aria-current={index === trackIndex ? 'true' : undefined} onClick={() => { onSelect(index); closeList(); }}>
        <img src={song.cover} alt="" width="36" height="36" loading="lazy" draggable={false} /><span><strong>{song.title}</strong><small>{song.artist}</small></span><b aria-hidden="true">{index === trackIndex && playing ? '♫' : String(index + 1).padStart(2, '0')}</b>
      </button></li>)}</ol>
    </div>
    {audioError && <p className={styles.error} role="status">{en ? 'Could not load. Try play or another song.' : 'No se pudo cargar. Prueba de nuevo u otra canción.'}</p>}
  </div>;
}
