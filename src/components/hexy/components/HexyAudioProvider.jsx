import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { isHexyPlaying } from '../../../data/variables';
import { hexyPlaylist as playlist } from '../../../data/hexyPlaylist';

const PlaybackContext = createContext(null);
const ProgressContext = createContext(null);
export const useHexyAudio = () => useContext(PlaybackContext);
export const useHexyProgress = () => useContext(ProgressContext);

// All page controls share one audio element. Progress updates only its subscribers.
export default function HexyAudioProvider({ children }) {
  const audioRef = useRef(null);
  const indexRef = useRef(0);
  const optionsRef = useRef({ shuffle: false, repeat: false });
  const intentRef = useRef(false);
  const requestRef = useRef(0);
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [error, setError] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const play = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const request = ++requestRef.current;
    intentRef.current = true;
    setError(false);
    setHasStarted(true);
    setDismissed(false);
    if (audio.error) audio.load();
    audio.play().catch((reason) => {
      if (request !== requestRef.current || reason.name === 'AbortError') return;
      intentRef.current = false;
      setIsPlaying(false);
      setError(true);
    });
  }, []);

  const pause = useCallback(() => {
    ++requestRef.current;
    intentRef.current = false;
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const chooseTrack = useCallback((index, shouldPlay = true) => {
    const audio = audioRef.current;
    if (!audio || !playlist[index]) return;
    if (index !== indexRef.current) {
      ++requestRef.current;
      indexRef.current = index;
      setTrackIndex(index);
      setCurrentTime(0);
      setDuration(0);
      setError(false);
      audio.src = playlist[index].src;
      audio.load();
    }
    // Selecting the current paused song must resume it, too.
    if (shouldPlay) play();
    else pause();
  }, [play, pause]);

  const togglePlay = useCallback(() => {
    if (intentRef.current) pause();
    else play();
  }, [play, pause]);

  const next = useCallback((autoplay = intentRef.current) => {
    const index = indexRef.current;
    const offset = optionsRef.current.shuffle
      ? 1 + Math.floor(Math.random() * (playlist.length - 1)) : 1;
    chooseTrack((index + offset) % playlist.length, autoplay);
  }, [chooseTrack]);

  const previous = useCallback(() => {
    const audio = audioRef.current;
    if (audio?.currentTime > 3) {
      audio.currentTime = 0;
      setCurrentTime(0);
    } else {
      chooseTrack((indexRef.current - 1 + playlist.length) % playlist.length, intentRef.current);
    }
  }, [chooseTrack]);

  const seek = useCallback((seconds) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration)) return;
    audio.currentTime = Math.max(0, Math.min(audio.duration, seconds));
    setCurrentTime(audio.currentTime);
  }, []);

  const toggleShuffle = useCallback(() => {
    optionsRef.current.shuffle = !optionsRef.current.shuffle;
    setShuffle(optionsRef.current.shuffle);
  }, []);
  const toggleRepeat = useCallback(() => {
    optionsRef.current.repeat = !optionsRef.current.repeat;
    setRepeat(optionsRef.current.repeat);
  }, []);
  const dismiss = useCallback(() => {
    pause();
    setDismissed(true);
  }, [pause]);

  useEffect(() => { isHexyPlaying.set(isPlaying); }, [isPlaying]);
  useEffect(() => {
    const audio = audioRef.current;
    // Metadata can arrive before Astro hydrates the server-rendered audio.
    if (audio && Number.isFinite(audio.duration)) setDuration(audio.duration);
    return () => {
      ++requestRef.current;
      audio?.pause();
      isHexyPlaying.set(false);
    };
  }, []);

  const playback = useMemo(() => ({
    playlist, track: playlist[trackIndex], trackIndex, isPlaying, hasStarted,
    dismissed, error, shuffle, repeat, play, pause, togglePlay, chooseTrack,
    next, previous, toggleShuffle, toggleRepeat, dismiss,
  }), [trackIndex, isPlaying, hasStarted, dismissed, error, shuffle, repeat,
    play, pause, togglePlay, chooseTrack, next, previous, toggleShuffle, toggleRepeat, dismiss]);
  const progress = useMemo(() => ({ currentTime, duration, seek }), [currentTime, duration, seek]);

  return (
    <PlaybackContext.Provider value={playback}>
      <ProgressContext.Provider value={progress}>
        <audio
          ref={audioRef}
          src={playlist[0].src}
          preload="metadata"
          loop={repeat}
          onLoadedMetadata={(event) => setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0)}
          onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => next(true)}
          onError={() => { intentRef.current = false; setIsPlaying(false); setError(true); }}
        />
        {children}
      </ProgressContext.Provider>
    </PlaybackContext.Provider>
  );
}
