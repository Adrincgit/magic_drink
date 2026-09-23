import { useCallback, useEffect, useRef } from 'react';

export default function usePlazaDialog(ref) {
  const restore = useRef(null);
  const unlock = useCallback(() => { restore.current?.(); restore.current = null; }, []);
  const open = useCallback(() => {
    if (!ref.current || ref.current.open) return;
    // Lock the viewport. Overflow on body creates a new scroll container and
    // makes the sticky illustrated stage jump above the visible document.
    const viewport = document.documentElement;
    const previous = viewport.style.overflow;
    ref.current.showModal();
    viewport.style.overflow = 'hidden';
    const root = ref.current.closest('[data-journey]');
    root?.dispatchEvent(new CustomEvent('journey:modal', { detail: { open: true } }));
    restore.current = () => {
      viewport.style.overflow = previous;
      root?.dispatchEvent(new CustomEvent('journey:modal', { detail: { open: false } }));
    };
  }, [ref]);
  const close = useCallback(() => { ref.current?.close(); unlock(); }, [ref, unlock]);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    dialog.addEventListener('close', unlock);
    return () => { dialog.removeEventListener('close', unlock); unlock(); };
  }, [ref, unlock]);
  return { open, close };
}
