import React, { useEffect, useId, useRef, useState } from 'react';
import { useStore } from '@nanostores/react';
import { ChevronUp, Maximize2, Pause, Play, Repeat, Shuffle, SkipBack, SkipForward, X } from 'lucide-react';
import { isEnglish } from '../../../data/variables';
import { useHexyAudio, useHexyProgress } from './HexyAudioProvider';
import styles from '../css/hexyPlayer.module.css';
import usePlazaDialog from '../../index/Secciones/usePlazaDialog';
import { SceneLabel, SceneStar } from '../../global/SceneControls';

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
  const { playlist, track, trackIndex, isPlaying, shuffle, repeat, toggleShuffle, toggleRepeat, next, previous, chooseTrack, openExpanded } = useHexyAudio();
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
          <button type="button" className={styles.controlBtn} onClick={openExpanded}
            aria-label={english ? 'Expand player' : 'Ampliar reproductor'}><Maximize2 size={18} aria-hidden="true" /></button>
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
  const { track, isPlaying, hasStarted, dismissed, dismiss, next, openExpanded } = useHexyAudio();
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
      <button type="button" className={styles.controlBtn} onClick={openExpanded} aria-label={english ? 'Expand player' : 'Ampliar reproductor'}><Maximize2 size={19} aria-hidden="true" /></button>
      <button type="button" className={styles.miniClose} onClick={dismiss}
        aria-label={english ? 'Close player and pause' : 'Cerrar reproductor y pausar'}><X size={14} aria-hidden="true" /></button>
    </div>
    <PlaybackError />
  </aside>;
}

export function HexyListeningRoom() {
  const english = useStore(isEnglish);
  const { expanded, openExpanded, closeExpanded, playlist, track, trackIndex, isPlaying,
    chooseTrack, pause, next, previous, repeat, shuffle, toggleRepeat, toggleShuffle } = useHexyAudio();
  const dialog = useRef(null);
  const { open, close } = usePlazaDialog(dialog);
  useEffect(() => { if (expanded) open(); else close(); }, [expanded, open, close]);
  useEffect(() => {
    const followLink = () => { if (location.hash === '#canciones') openExpanded(); };
    followLink(); window.addEventListener('hashchange', followLink);
    return () => window.removeEventListener('hashchange', followLink);
  }, [openExpanded]);
  return <dialog ref={dialog} id="canciones" className={styles.listeningRoom} data-listening-room
    aria-labelledby="listening-title" onClose={closeExpanded}
    onClick={event => { if (event.target === dialog.current) closeExpanded(); }}>
    <button type="button" className={styles.listeningClose} onClick={closeExpanded} autoFocus
      aria-label={english ? 'Close listening room' : 'Cerrar sala de escucha'}><X size={21} /></button>
    <div className={styles.listeningHeader}><SceneLabel>{english ? 'A little louder. A little closer.' : 'Un poquito más fuerte. Un poquito más cerca.'}</SceneLabel>
      <span>{english ? 'HEXY · THE LISTENING ROOM' : 'HEXY · SALA DE ESCUCHA'}</span></div>
    <div className={styles.listeningStage}>
      <div className={styles.albumDisplay}>
        <div className={styles.largeDisc}><Vinyl track={track} playing={isPlaying} /></div>
        <img className={styles.largeSleeve} src={track.cover} alt={english ? `${track.title} album artwork` : `Portada de ${track.title}`} width="500" height="500" />
        <span className={styles.sleeveStamp}><SceneStar /> {String(trackIndex + 1).padStart(2, '0')} / 06</span>
      </div>
      <div className={styles.listeningCopy}>
        <p className={styles.listeningStatus}>{isPlaying ? (english ? 'NOW PLAYING' : 'AHORA SUENA') : (english ? 'READY WHEN YOU ARE' : 'CUANDO TÚ QUIERAS')}</p>
        <h2 id="listening-title">{track.title}</h2><p>{track.artist}</p>
        <div className={styles.controls}>
          <button className={`${styles.controlBtn} ${shuffle ? styles.active : ''}`} type="button" aria-pressed={shuffle} onClick={toggleShuffle} aria-label={english ? 'Shuffle' : 'Aleatorio'}><Shuffle size={19} /></button>
          <button className={styles.controlBtn} type="button" onClick={previous} aria-label={english ? 'Previous song' : 'Canción anterior'}><SkipBack size={23} fill="currentColor" /></button>
          <PlayButton />
          <button className={styles.controlBtn} type="button" onClick={() => next()} aria-label={english ? 'Next song' : 'Siguiente canción'}><SkipForward size={23} fill="currentColor" /></button>
          <button className={`${styles.controlBtn} ${repeat ? styles.active : ''}`} type="button" aria-pressed={repeat} onClick={toggleRepeat} aria-label={english ? 'Repeat song' : 'Repetir canción'}><Repeat size={19} /></button>
        </div>
        <Progress /><PlaybackError />
        <p className={styles.listeningNote}>{english ? 'Stay for one more chorus.' : 'Quédate un coro más.'}</p>
      </div>
    </div>
    <div className={styles.listeningQueue} role="group" aria-label={english ? 'Choose a song' : 'Elige una canción'}>
      {playlist.map((song, index) => <button type="button" key={song.id} aria-pressed={trackIndex === index && isPlaying}
        aria-label={`${trackIndex === index && isPlaying ? (english ? 'Pause' : 'Pausar') : (english ? 'Play' : 'Reproducir')} ${song.title}`}
        onClick={() => trackIndex === index && isPlaying ? pause() : chooseTrack(index)}>
        <img src={song.cover} alt="" width="60" height="60" /><span><small>{String(index + 1).padStart(2, '0')}</small>{song.title}</span>
        {trackIndex === index && isPlaying ? <Pause size={15} /> : <Play size={15} />}
      </button>)}
    </div>
    <small className={styles.listeningCredit}>mix · DJ Sweet Hex</small>
  </dialog>;
}
