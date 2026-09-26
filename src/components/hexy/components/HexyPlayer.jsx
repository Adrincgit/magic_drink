import React, { useEffect, useId, useRef, useState } from 'react';
import { useStore } from '@nanostores/react';
import { ChevronUp, ListMusic, Pause, Play, Repeat, Shuffle, SkipBack, SkipForward, X } from 'lucide-react';
import { isEnglish } from '../../../data/variables';
import { useHexyAudio, useHexyProgress } from './HexyAudioProvider';
import styles from '../css/hexyPlayer.module.css';

const formatTime = (seconds) => {
  if (!Number.isFinite(seconds)) return '0:00';
  return `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`;
};

function PlaybackError() {
  const english = useStore(isEnglish);
  const { error, play } = useHexyAudio();
  if (!error) return null;
  return <div className={styles.error} role="status">
    {english ? 'This song could not be loaded.' : 'No se pudo cargar esta canción.'}
    <button type="button" onClick={play}>{english ? 'Try again' : 'Reintentar'}</button>
  </div>;
}

function PlayButton() {
  const english = useStore(isEnglish);
  const { isPlaying, togglePlay } = useHexyAudio();
  return <button type="button" className={styles.playBtn} onClick={togglePlay}
    aria-label={isPlaying ? (english ? 'Pause' : 'Pausar') : (english ? 'Play' : 'Reproducir')}>
    {isPlaying ? <Pause size={21} fill="currentColor" aria-hidden="true" /> : <Play size={21} fill="currentColor" aria-hidden="true" />}
  </button>;
}

function Vinyl({ track, playing, mini = false }) {
  return <span className={`${styles.turntable} ${mini ? styles.smallTurntable : ''}`} aria-hidden="true">
    <span className={styles.vinyl} data-vinyl data-spinning={playing}>
      <img src={track.cover} alt="" width="64" height="64" />
    </span>
    <i className={styles.tonearm} data-engaged={playing} />
  </span>;
}

function Progress() {
  const english = useStore(isEnglish);
  const { currentTime, duration, seek } = useHexyProgress();
  const value = Math.min(currentTime, duration);
  return <div className={styles.progressSection}>
    <span className={styles.time}>{formatTime(value)}</span>
    <input type="range" className={styles.seek} min="0" max={duration || 1} step="1"
      value={value} disabled={!duration} onChange={(event) => seek(Number(event.target.value))}
      aria-label={english ? 'Song position' : 'Posición de la canción'}
      aria-valuetext={`${formatTime(value)} / ${formatTime(duration)}`}
      style={{ '--progress': `${duration ? value / duration * 100 : 0}%` }} />
    <span className={styles.time}>{formatTime(duration)}</span>
  </div>;
}

export default function HexyPlayer() {
  const english = useStore(isEnglish);
  const { playlist, track, trackIndex, isPlaying, shuffle, repeat, toggleShuffle, toggleRepeat, next, previous, chooseTrack } = useHexyAudio();
  const [showPlaylist, setShowPlaylist] = useState(false);
  const wrapperRef = useRef(null);
  const toggleRef = useRef(null);
  const playlistId = useId();

  useEffect(() => {
    if (!showPlaylist) return;
    const outside = (event) => {
      if (!wrapperRef.current?.contains(event.target)) setShowPlaylist(false);
    };
    const escape = (event) => {
      if (event.key !== 'Escape') return;
      setShowPlaylist(false);
      toggleRef.current?.focus();
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', escape);
    };
  }, [showPlaylist]);

  return (
    <div ref={wrapperRef} id="hexy-player" role="region" aria-label={english ? 'Hexy music player' : 'Reproductor de Hexy'}
      className={`${styles.playerWrapper} ${isPlaying ? styles.playerPlaying : ''}`}>
      <div className={styles.player}>
        <div className={styles.trackInfo}>
          <Vinyl track={track} playing={isPlaying} />
          <div className={styles.meta}>
            <span className={styles.trackTitle}>{track.title}</span>
            <span className={styles.trackArtist}>{track.artist}</span>
            {track.badge && <span className={styles.badge}><span className={styles.badgeDot} />{track.badge}</span>}
          </div>
        </div>
        <div className={styles.centerArea}>
          <div className={styles.controls}>
            <button type="button" className={`${styles.controlBtn} ${shuffle ? styles.active : ''}`} onClick={toggleShuffle}
              aria-pressed={shuffle} aria-label={english ? 'Shuffle' : 'Aleatorio'}><Shuffle size={18} aria-hidden="true" /></button>
            <button type="button" className={styles.controlBtn} onClick={previous}
              aria-label={english ? 'Previous song' : 'Canción anterior'}><SkipBack size={20} fill="currentColor" aria-hidden="true" /></button>
            <PlayButton />
            <button type="button" className={styles.controlBtn} onClick={() => next()}
              aria-label={english ? 'Next song' : 'Siguiente canción'}><SkipForward size={20} fill="currentColor" aria-hidden="true" /></button>
            <button type="button" className={`${styles.controlBtn} ${repeat ? styles.active : ''}`} onClick={toggleRepeat}
              aria-pressed={repeat} aria-label={english ? 'Repeat song' : 'Repetir canción'}><Repeat size={18} aria-hidden="true" /></button>
          </div>
          <Progress />
        </div>
        <div className={styles.playlistSection}>
          <div className={styles.playlistAvatars} aria-hidden="true">
            {playlist.slice(0, 3).map((song, index) => <img key={song.id} src={song.cover} alt=""
              className={styles.avatar} style={{ zIndex: 3 - index }} width="36" height="36" />)}
          </div>
          <button ref={toggleRef} type="button" className={styles.playlistToggle} onClick={() => setShowPlaylist(!showPlaylist)}
            aria-expanded={showPlaylist} aria-controls={playlistId}>
            {english ? 'Full playlist' : 'Ver playlist completa'}
            <ChevronUp size={14} aria-hidden="true" className={showPlaylist ? styles.chevronUp : undefined} />
          </button>
        </div>
      </div>
      <PlaybackError />
      {showPlaylist && <div id={playlistId} className={styles.playlistDropdown} role="group"
        aria-label={english ? 'Choose a song' : 'Elige una canción'}>
        {playlist.map((song, index) => <button type="button" key={song.id}
          className={`${styles.playlistItem} ${index === trackIndex ? styles.playlistItemActive : ''}`}
          aria-current={index === trackIndex ? 'true' : undefined}
          onClick={() => { chooseTrack(index); setShowPlaylist(false); toggleRef.current?.focus(); }}>
          <img src={song.cover} alt="" className={styles.playlistItemCover} width="44" height="44" />
          <span className={styles.playlistItemInfo}>
            <span className={styles.playlistItemTitle}>{song.title}</span>
            <span className={styles.playlistItemArtist}>{song.artist}</span>
          </span>
          {index === trackIndex && isPlaying && <span className={styles.playingIndicator} aria-hidden="true"><span /><span /><span /></span>}
        </button>)}
      </div>}
    </div>
  );
}

export function HexyMiniPlayer() {
  const english = useStore(isEnglish);
  const { track, isPlaying, hasStarted, dismissed, dismiss, next } = useHexyAudio();
  const [pastPlayer, setPastPlayer] = useState(false);
  useEffect(() => {
    const player = document.getElementById('hexy-player');
    if (!player) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      setPastPlayer(player.getBoundingClientRect().bottom <= 0);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    // An anchor can jump from below the viewport to above it without crossing
    // an IntersectionObserver threshold, especially on the taller phone hero.
    const observer = new ResizeObserver(schedule);
    observer.observe(player);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    update();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);

  if (!pastPlayer || !hasStarted || dismissed) return null;
  return <aside className={styles.miniPlayer} aria-label={english ? 'Mini player' : 'Mini reproductor'}>
    <div className={styles.miniRow}>
      <Vinyl track={track} playing={isPlaying} mini />
      <div className={styles.miniMeta}>
        <span>{isPlaying ? (english ? 'Now playing' : 'Ahora suena') : (english ? 'Paused' : 'En pausa')}</span>
        <strong>{track.title}</strong>
      </div>
      <PlayButton />
      <button type="button" className={styles.controlBtn} onClick={() => next()}
        aria-label={english ? 'Next song' : 'Siguiente canción'}><SkipForward size={18} fill="currentColor" aria-hidden="true" /></button>
      <a className={styles.controlBtn} href="#canciones" aria-label={english ? 'Explore songs' : 'Explorar canciones'}><ListMusic size={19} aria-hidden="true" /></a>
      <button type="button" className={styles.miniClose} onClick={dismiss}
        aria-label={english ? 'Close player and pause' : 'Cerrar reproductor y pausar'}><X size={14} aria-hidden="true" /></button>
    </div>
    <PlaybackError />
  </aside>;
}
