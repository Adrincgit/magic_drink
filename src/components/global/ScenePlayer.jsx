import styles from './css/scenePlayer.module.css';
import { SceneStar } from './SceneControls';

const clock = (seconds) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;

export default function ScenePlayer({ en, playing, elapsed, duration, onToggle, onSeek }) {
  return <div className={styles.player} data-scene-player data-playing={playing}>
    <div className={styles.topline}><span>HEXY / MAGIC DRINK</span><SceneStar /><span>{en ? 'MUSIC' : 'MÚSICA'}</span></div>
    <div className={styles.controls}>
      <button className={styles.record} type="button" onClick={onToggle}
        aria-label={`${playing ? (en ? 'Pause' : 'Pausar') : (en ? 'Play' : 'Reproducir')} No Brain, Just Vibes!`}
        aria-pressed={playing}>
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          {playing ? <path d="M7 5h4v14H7Zm6 0h4v14h-4Z" /> : <path d="m8 5 11 7-11 7Z" />}
        </svg>
      </button>
      <div className={styles.track}>
        <strong>No Brain, Just Vibes!</strong>
        <span>{en ? 'Performed by Hexy' : 'Interpretado por Hexy'}</span>
        <div className={styles.timeline}>
          <input type="range" min="0" max={duration || 1} step="0.1" value={elapsed}
            disabled={!duration} onChange={(e) => onSeek(Number(e.target.value))}
            aria-label={en ? 'Track position' : 'Posición de la canción'}
            aria-valuetext={`${clock(elapsed)} / ${clock(duration)}`}
            style={{ '--played': `${duration ? elapsed / duration * 100 : 0}%` }} />
          <span>{clock(elapsed)}</span>
        </div>
      </div>
    </div>
    <div className={styles.bottomline}>
      <span>{en ? 'PRESS PLAY. REPEAT AS OFTEN AS YOU LIKE.' : 'DALE PLAY. REPITE CUANTAS VECES QUIERAS.'}</span>
      <details className={styles.credits}>
        <summary>{en ? 'Credits' : 'Créditos'}</summary>
        <div className={styles.creditCard}>
          <span>{en ? 'Musical signature' : 'Firma musical'}</span>
          <strong>DJ Sweet Hex</strong>
          <small>No Brain, Just Vibes!</small>
        </div>
      </details>
    </div>
  </div>;
}
