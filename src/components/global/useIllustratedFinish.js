import { useEffect, useState } from 'react';

const key = 'magic-drink:illustrated-finish:v1';
const defaults = { enabled: true, chromatic: 55, grain: 50, vignette: 50, monochrome: false };
const normalize = value => ({
  monochrome: value?.monochrome === true,
  enabled: typeof value?.enabled === 'boolean' ? value.enabled : defaults.enabled,
  ...Object.fromEntries(['chromatic', 'grain', 'vignette'].map(name => [name,
    typeof value?.[name] === 'number' && Number.isFinite(value[name]) ? Math.max(0, Math.min(100, value[name])) : defaults[name],
  ])),
});

// One preference across the journey, Hexy and the drink page. Read after
// hydration; only explicit changes write to storage, including an all-off state.
export default function useIllustratedFinish() {
  const [finish, setFinish] = useState(defaults);
  useEffect(() => {
    try { const saved = localStorage.getItem(key); if (saved) setFinish(normalize(JSON.parse(saved))); } catch { /* Use the illustrated default. */ }
    const sync = event => {
      if (event.key !== key) return;
      try { setFinish(normalize(JSON.parse(event.newValue))); } catch { /* Ignore a malformed external preference. */ }
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);
  const updateFinish = patch => setFinish(previous => {
    const next = normalize({ ...previous, ...patch });
    try { localStorage.setItem(key, JSON.stringify(next)); } catch { /* Controls still work for this visit. */ }
    return next;
  });
  return [finish, updateFinish];
}
