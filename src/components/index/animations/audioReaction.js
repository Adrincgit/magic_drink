// One graph for the existing player, created only after a play gesture.
// Navigation never replaces the media element or restarts its playback.
export function createAudioReaction(audio, root) {
  const rig = root.querySelector('[data-festival-rig]');
  const cones = [...rig.querySelectorAll('[data-speaker] span img')];
  const halos = [...rig.querySelectorAll('[data-speaker-halo]')];
  const lights = rig.querySelector('[data-stage-lights]');
  const bloom = rig.querySelector('[data-music-bloom]');
  function paint(level) {
    // Direct compositor properties avoid inherited CSS variables invalidating
    // an entire scene at every beat. Only these small effect layers change.
    cones.forEach(cone => { cone.style.scale = String(1 + level * .045); });
    halos.forEach(halo => { halo.style.opacity = String(level * .8); halo.style.scale = String(.8 + level * .5); });
    lights.style.opacity = String(.7 + level * .3);
    bloom.style.opacity = String(level);
    bloom.style.scale = String(.9 + level * .2);
  }
  const Context = window.AudioContext || window.webkitAudioContext;
  if (!Context) return { resume() {}, dispose() {} };
  const context = new Context();
  let source, analyser;
  try {
    source = context.createMediaElementSource(audio);
    analyser = context.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = .65;
    source.connect(analyser);
    analyser.connect(context.destination);
  } catch {
    // If a graph cannot be analysed, preserve the audible path.
    source?.disconnect(); source?.connect(context.destination);
    return { resume: () => context.resume().catch(() => {}), dispose: () => { source?.disconnect(); context.close().catch(() => {}); } };
  }
  const bins = new Uint8Array(analyser.frequencyBinCount);
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  let progress = Number(root.dataset.worldProgress || 0), reduced = media.matches;
  let frame = 0, last = 0, energy = 0, disposed = false;
  const active = () => !disposed && !audio.paused && !audio.ended && !document.hidden && !reduced && progress >= .37 && progress < .64;
  function reset() {
    if (energy === 0 && root.dataset.audioReactive === 'false') return;
    energy = 0; root.audioEnergy = 0;
    paint(0);
    root.dataset.audioReactive = 'false';
  }
  function tick(time) {
    frame = 0;
    if (!active()) { reset(); return; }
    if (time - last >= 80) {
      analyser.getByteFrequencyData(bins);
      let bass = 0;
      for (let i = 1; i < 18; i++) bass += bins[i];
      const level = Math.min(1, Math.max(0, (bass / 17 / 255 - .08) * 1.65));
      energy += (level - energy) * (level > energy ? .8 : .35);
      root.audioEnergy = energy;
      paint(energy);
      if (root.dataset.audioReactive !== 'true') root.dataset.audioReactive = 'true';
      last = time;
    }
    frame = requestAnimationFrame(tick);
  }
  function update() {
    if (active() && !frame) frame = requestAnimationFrame(tick);
    if (!active()) { cancelAnimationFrame(frame); frame = 0; reset(); }
  }
  function onScene(event) { progress = event.detail.progress; reduced = event.detail.reduced; update(); }
  function onPreference() { reduced = media.matches; update(); }
  root.addEventListener('journey:scene', onScene);
  media.addEventListener('change', onPreference);
  document.addEventListener('visibilitychange', update);
  ['play', 'pause', 'ended', 'emptied', 'error'].forEach(event => audio.addEventListener(event, update));
  reset();
  return {
    resume: () => context.resume().catch(() => {}),
    dispose() {
      disposed = true; cancelAnimationFrame(frame); reset();
      root.removeEventListener('journey:scene', onScene);
      media.removeEventListener('change', onPreference);
      document.removeEventListener('visibilitychange', update);
      ['play', 'pause', 'ended', 'emptied', 'error'].forEach(event => audio.removeEventListener(event, update));
      source.disconnect(); analyser.disconnect(); context.close().catch(() => {});
      delete root.audioEnergy;
    },
  };
}
