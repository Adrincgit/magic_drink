/**
 * useFlavorAudio — Hook global de audio para sabores Magic Drink
 * 
 * Maneja un solo <audio> global para que no suenen 2 loops a la vez.
 * Cada sabor tiene su propio loop asignado.
 * Incluye crossfade suave entre sabores y estado de "playing".
 * 
 * Rutas esperadas: /audio/loops/loop_{flavor}.mp3
 * Los loops deben ser archivos de 8-15s diseñados para repetir seamlessly.
 */

import { useEffect, useRef, useState, useCallback } from 'react';

// Mapa de sabores → archivos de audio
const FLAVOR_AUDIO_MAP = {
  'magic-original': '/audio/loops/loop_original.mp3',
  'witchy-kiwi': '/audio/loops/loop_kiwi.mp3',
  'sparkle-soda': '/audio/loops/loop_sparkle.mp3',
  'banana-drama': '/audio/loops/loop_banana.mp3',
  'bubble-tape': '/audio/loops/loop_bubble.mp3',
  'dragon-grape': '/audio/loops/loop_dragon.mp3',
};

// Singleton: una sola instancia de audio compartida entre todos los componentes
let globalAudio = null;
let globalCurrentFlavor = null;
let globalIsPlaying = false;
let globalListeners = new Set();

const notifyListeners = () => {
  globalListeners.forEach(fn => fn({
    currentFlavor: globalCurrentFlavor,
    isPlaying: globalIsPlaying,
  }));
};

const getOrCreateAudio = () => {
  if (!globalAudio) {
    globalAudio = new Audio();
    globalAudio.loop = true;
    globalAudio.volume = 0;
    globalAudio.preload = 'none';
  }
  return globalAudio;
};

/**
 * Fade in/out suave usando requestAnimationFrame
 */
const fadeAudio = (audio, targetVolume, duration = 400) => {
  return new Promise((resolve) => {
    const startVolume = audio.volume;
    const diff = targetVolume - startVolume;
    const startTime = performance.now();

    const step = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      audio.volume = Math.max(0, Math.min(1, startVolume + diff * eased));

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        resolve();
      }
    };

    requestAnimationFrame(step);
  });
};

const useFlavorAudio = () => {
  const [state, setState] = useState({
    currentFlavor: globalCurrentFlavor,
    isPlaying: globalIsPlaying,
  });

  // Suscribirse a cambios globales
  useEffect(() => {
    const listener = (newState) => setState(newState);
    globalListeners.add(listener);
    return () => globalListeners.delete(listener);
  }, []);

  /**
   * Toggle play/pause para un sabor específico
   */
  const toggleFlavor = useCallback(async (flavorId) => {
    const audio = getOrCreateAudio();
    const audioSrc = FLAVOR_AUDIO_MAP[flavorId];

    if (!audioSrc) {
      console.warn(`[useFlavorAudio] No audio mapped for flavor: ${flavorId}`);
      return;
    }

    // Si ya está sonando este sabor → pausa con fade out
    if (globalCurrentFlavor === flavorId && globalIsPlaying) {
      await fadeAudio(audio, 0, 300);
      audio.pause();
      globalIsPlaying = false;
      notifyListeners();
      return;
    }

    // Si es un sabor diferente al actual → crossfade
    if (globalCurrentFlavor !== flavorId) {
      // Fade out el actual si está sonando
      if (globalIsPlaying) {
        await fadeAudio(audio, 0, 250);
        audio.pause();
      }

      // Cargar el nuevo
      audio.src = audioSrc;
      audio.currentTime = 0;
      globalCurrentFlavor = flavorId;
    }

    // Play con fade in
    try {
      await audio.play();
      globalIsPlaying = true;
      notifyListeners();
      await fadeAudio(audio, 0.65, 500);
    } catch (err) {
      // Browser bloqueó autoplay — necesita interacción del usuario
      console.warn('[useFlavorAudio] Playback blocked:', err.message);
      globalIsPlaying = false;
      notifyListeners();
    }
  }, []);

  /**
   * Detener todo
   */
  const stopAll = useCallback(async () => {
    const audio = getOrCreateAudio();
    if (globalIsPlaying) {
      await fadeAudio(audio, 0, 300);
      audio.pause();
      globalIsPlaying = false;
      globalCurrentFlavor = null;
      notifyListeners();
    }
  }, []);

  /**
   * Verificar si un sabor específico está sonando
   */
  const isFlavorPlaying = useCallback((flavorId) => {
    return globalCurrentFlavor === flavorId && globalIsPlaying;
  }, [state]); // eslint-disable-line

  return {
    currentFlavor: state.currentFlavor,
    isPlaying: state.isPlaying,
    toggleFlavor,
    stopAll,
    isFlavorPlaying,
    FLAVOR_AUDIO_MAP,
  };
};

export default useFlavorAudio;
