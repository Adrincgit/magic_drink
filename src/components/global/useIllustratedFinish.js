import { useEffect, useState } from 'react';
import {FINISH_DEFAULTS as defaults,normalizeFinish as normalize,updateFinishState} from './illustratedFinishState';

const siteKey = 'magic-drink:illustrated-finish:v1';
const arcadeKey = 'magic-drink:arcade:illustrated-finish:v1';

// The journey, Hexy and drinks share their finish. Arcade has its own saved
// preference and storage events, so its image controls cannot alter the site.
// Read after hydration; only explicit changes write, including an all-off state.
export default function useIllustratedFinish(scope = 'site') {
  const key = scope === 'arcade' ? arcadeKey : siteKey;
  const [finish, setFinish] = useState(defaults);
  useEffect(() => {
    try { const saved = localStorage.getItem(key); setFinish(saved ? normalize(JSON.parse(saved)) : defaults); } catch { setFinish(defaults); }
    const sync = event => {
      if (event.key !== key) return;
      try { setFinish(normalize(JSON.parse(event.newValue))); } catch { /* Ignore a malformed external preference. */ }
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, [key]);
  const updateFinish = patch => setFinish(previous => {
    const next = updateFinishState(previous,patch);
    try { localStorage.setItem(key, JSON.stringify(next)); } catch { /* Controls still work for this visit. */ }
    return next;
  });
  return [finish, updateFinish];
}
