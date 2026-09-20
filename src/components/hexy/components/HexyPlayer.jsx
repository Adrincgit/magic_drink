import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useStore } from '@nanostores/react';
import { isEnglish, isHexyPlaying } from '../../../data/variables';
import styles from '../css/hexyPlayer.module.css';

import { hexyPlaylist as playlist } from '../../../data/hexyPlaylist';


const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default function HexyPlayer() {
  const ingles = useStore(isEnglish);
  const audioRef = useRef(null);
  const progressRef = useRef(null);
  const rafRef = useRef(null);
  const playIntentRef = useRef(false); // persiste intención de play sin stale closure

  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);

  const track = playlist[trackIndex];

  // Progress tracking with RAF for smooth updates
  const startRAF = useCallback(() => {
    const tick = () => {
      const audio = audioRef.current;
      if (audio && !audio.paused) {
        setCurrentTime(audio.currentTime);
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const stopRAF = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
  }, []);

  // Audio setup & event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoadedMetadata = () => setDuration(audio.duration);
    const onEnded = () => {
      if (repeat) {
        audio.currentTime = 0;
        audio.play();
      } else {
        // Marcar intención de autoplay ANTES de cambiar pista
        playIntentRef.current = true;
        setTrackIndex((prev) => {
          if (shuffle) {
            let next;
            do {
              next = Math.floor(Math.random() * playlist.length);
            } while (next === prev && playlist.length > 1);
            return next;
          }
          return (prev + 1) % playlist.length;
        });
      }
    };
    const onPlay = () => {
      setIsPlaying(true);
      isHexyPlaying.set(true);
      startRAF();
    };
    const onPause = () => {
      // Ignorar el pause que algunos navegadores disparan justo después de ended
      if (audio.ended) return;
      setIsPlaying(false);
      isHexyPlaying.set(false);
      stopRAF();
    };

    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);

    return () => {
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      stopRAF();
    };
  }, [repeat, shuffle, startRAF, stopRAF]);

  // Track change
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Resetear progreso inmediatamente para que la barra no muestre datos viejos
    setCurrentTime(0);
    setDuration(0);
    stopRAF();

    const shouldPlay = playIntentRef.current;
    playIntentRef.current = false;

    audio.src = track.src;
    audio.loop = repeat;

    if (shouldPlay) {
      audio.play().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackIndex]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.loop = repeat;
  }, [repeat]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, []);

  const handleNext = useCallback(() => {
    const audio = audioRef.current;
    playIntentRef.current = !!(audio && !audio.paused);
    setTrackIndex((prev) => {
      if (shuffle) {
        let next;
        do {
          next = Math.floor(Math.random() * playlist.length);
        } while (next === prev && playlist.length > 1);
        return next;
      }
      return (prev + 1) % playlist.length;
    });
  }, [shuffle]);

  const handlePrev = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
    } else {
      playIntentRef.current = !!(audio && !audio.paused);
      setTrackIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
    }
  }, []);

  const handleSeek = useCallback((e) => {
    const audio = audioRef.current;
    const bar = progressRef.current;
    if (!audio || !bar) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * (audio.duration || 0);
    setCurrentTime(audio.currentTime);
  }, []);

  const selectTrack = useCallback((index) => {
    playIntentRef.current = true;
    setTrackIndex(index);
    setShowPlaylist(false);
  }, []);

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`${styles.playerWrapper} ${isPlaying ? styles.playerPlaying : ''}`}>
      <audio ref={audioRef} preload="metadata" />

      <div className={styles.player}>
        {/* Track Info */}
        <div className={styles.trackInfo}>
          <img src={track.cover} alt={track.title} className={styles.cover} />
          <div className={styles.meta}>
            <span className={styles.trackTitle}>{track.title}</span>
            <span className={styles.trackArtist}>{track.artist}</span>
            {track.badge && (
              <span className={styles.badge}>
                <span className={styles.badgeDot} />
                {track.badge}
              </span>
            )}
          </div>
        </div>

        {/* Center: Controls + Progress */}
        <div className={styles.centerArea}>
          <div className={styles.controls}>
            <button
              className={`${styles.controlBtn} ${shuffle ? styles.active : ''}`}
              onClick={() => setShuffle(!shuffle)}
              aria-label="Shuffle"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 3 21 3 21 8" />
                <line x1="4" y1="20" x2="21" y2="3" />
                <polyline points="21 16 21 21 16 21" />
                <line x1="15" y1="15" x2="21" y2="21" />
                <line x1="4" y1="4" x2="9" y2="9" />
              </svg>
            </button>

            <button className={styles.controlBtn} onClick={handlePrev} aria-label="Previous">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
              </svg>
            </button>

            <button className={styles.playBtn} onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}>
              {isPlaying ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            <button className={styles.controlBtn} onClick={handleNext} aria-label="Next">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
              </svg>
            </button>

            <button
              className={`${styles.controlBtn} ${repeat ? styles.active : ''}`}
              onClick={() => setRepeat(!repeat)}
              aria-label="Repeat"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="17 1 21 5 17 9" />
                <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                <polyline points="7 23 3 19 7 15" />
                <path d="M21 13v2a4 4 0 0 1-4 4H3" />
              </svg>
            </button>
          </div>

          <div className={styles.progressSection}>
            <span className={styles.time}>{formatTime(currentTime)}</span>
            <div className={styles.progressBar} ref={progressRef} onClick={handleSeek}>
              <div className={styles.progressFill} style={{ width: `${progress}%` }}>
                <span className={styles.progressThumb} />
              </div>
            </div>
            <span className={styles.time}>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Playlist peek */}
        <div className={styles.playlistSection}>
          <div className={styles.playlistAvatars}>
            {playlist.slice(0, 3).map((t, i) => (
              <img
                key={t.id}
                src={t.cover}
                alt={t.title}
                className={styles.avatar}
                style={{ zIndex: 3 - i }}
              />
            ))}
          </div>
          <button
            className={styles.playlistToggle}
            onClick={() => setShowPlaylist(!showPlaylist)}
          >
            {ingles ? 'Full playlist' : 'Ver playlist completa'}
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={showPlaylist ? styles.chevronUp : undefined}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>
      </div>

      {/* Expanded playlist */}
      {showPlaylist && (
        <div className={styles.playlistDropdown}>
          {playlist.map((t, i) => (
            <button
              key={t.id}
              className={`${styles.playlistItem} ${i === trackIndex ? styles.playlistItemActive : ''}`}
              onClick={() => selectTrack(i)}
            >
              <img src={t.cover} alt={t.title} className={styles.playlistItemCover} />
              <div className={styles.playlistItemInfo}>
                <span className={styles.playlistItemTitle}>{t.title}</span>
                <span className={styles.playlistItemArtist}>{t.artist}</span>
              </div>
              {i === trackIndex && isPlaying && (
                <div className={styles.playingIndicator}>
                  <span /><span /><span />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
