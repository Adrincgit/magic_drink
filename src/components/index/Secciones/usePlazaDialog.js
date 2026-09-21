import { useCallback, useEffect, useRef } from 'react';

export default function usePlazaDialog(ref) {
  const restore = useRef(null);
  const unlock = useCallback(() => { restore.current?.(); restore.current = null; }, []);
  const open = useCallback(() => {
    if (ref.current.open) return;
    const previous = document.body.style.overflow;
    ref.current.showModal();
    document.body.style.overflow = 'hidden';
    restore.current = () => { document.body.style.overflow = previous; };
  }, [ref]);
  const close = useCallback(() => { ref.current?.close(); unlock(); }, [ref, unlock]);
  useEffect(() => {
    const dialog = ref.current;
    dialog.addEventListener('close', unlock);
    return () => { dialog.removeEventListener('close', unlock); unlock(); };
  }, [ref, unlock]);
  return { open, close };
}
