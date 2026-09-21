import { WebGLRenderer, Scene, OrthographicCamera, PlaneGeometry, Mesh, ShaderMaterial, TextureLoader, Vector2, NoToneMapping } from 'three';

const vertexShader = `varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const fragmentShader = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uPrevious;
uniform sampler2D uCurrent;
uniform vec2 uAspect;
uniform float uCanvasAspect;
uniform float uProgress;
uniform float uTime;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
vec4 picture(sampler2D tex, vec2 uv, float aspect) {
  vec2 fit = vec2(max(1.0, uCanvasAspect / aspect), max(1.0, aspect / uCanvasAspect));
  uv = (uv - .5) * fit + .5;
  float inside = step(0.0, uv.x) * step(uv.x, 1.0) * step(0.0, uv.y) * step(uv.y, 1.0);
  return texture2D(tex, clamp(uv, .001, .999)) * inside;
}
void main() {
  // Hand-animation cadence for the magic; the camera never uses this clock.
  float cel = floor(uTime * 12.0);
  float burst = sin(uProgress * 3.14159265);
  float ribbon = sin(vUv.y * 32.0 + cel * 1.7) * burst;
  vec2 uv = vUv + vec2(ribbon * .009, sin(vUv.x * 15.0 + cel) * burst * .003);
  float grain = hash(floor(vUv * vec2(100.0, 110.0)) + cel);
  float wipe = smoothstep(uProgress - .17, uProgress + .17, vUv.y + ribbon * .04);
  float reveal = uProgress <= .001 ? 0.0 : uProgress >= .999 ? 1.0 : 1.0 - wipe;
  vec4 before = picture(uPrevious, uv, uAspect.x);
  vec4 after = picture(uCurrent, uv, uAspect.y);
  vec4 color = mix(before, after, reveal);
  float split = burst * .007;
  color.r = mix(color.r, picture(uCurrent, uv + vec2(split, 0.0), uAspect.y).r, burst * .22);
  color.b = mix(color.b, picture(uCurrent, uv - vec2(split, 0.0), uAspect.y).b, burst * .22);
  float fleck = step(.987, grain) * burst * .17;
  color.rgb += vec3(.98, .72, .30) * fleck + (grain - .5) * .006;
  gl_FragColor = color;
}`;

// Progressive enhancement of the photo inside the illustrated cabinet. HTML
// owns the image, text and buttons; it survives missing WebGL or lost context.
export function createExhibitSurface(host) {
  const renderer = new WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setClearColor(0, 0);
  renderer.toneMapping = NoToneMapping;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  const scene = new Scene(), camera = new OrthographicCamera(-1, 1, 1, -1, 0, 2);
  camera.position.z = 1;
  const geometry = new PlaneGeometry(2, 2);
  const uniforms = {
    uPrevious: { value: null }, uCurrent: { value: null }, uAspect: { value: new Vector2(1, 1) },
    uCanvasAspect: { value: 1 }, uProgress: { value: 1 }, uTime: { value: 0 },
  };
  const material = new ShaderMaterial({ uniforms, vertexShader, fragmentShader, transparent: true, depthTest: false, depthWrite: false });
  scene.add(new Mesh(geometry, material));
  host.appendChild(renderer.domElement);
  const cache = new Map(), textures = new Set();
  const loader = new TextureLoader();
  let state, disposed = false, lost = false, unavailable = false, request = 0, frame = 0, last = 0, started = 0, frames = 0, url;
  const active = () => !disposed && !lost && !unavailable && uniforms.uCurrent.value && state && !state.reduced && !document.hidden && state.progress >= 1.045 && state.progress <= 1.405;
  const resume = () => {
    if (!active()) { cancelAnimationFrame(frame); frame = 0; return; }
    if (!frame) frame = requestAnimationFrame(draw);
  };
  function draw(time) {
    frame = 0;
    if (!active()) return;
    const progress = Math.min(1, (time - started) / 640);
    if (time - last >= (progress < 1 ? 1000 / 30 : 1000 / 15)) {
      uniforms.uProgress.value = progress;
      uniforms.uTime.value = time / 1000;
      renderer.render(scene, camera);
      frames++;
      last = time;
      host.dataset.renderer = 'webgl';
    }
    frame = requestAnimationFrame(draw);
  }
  function resize() {
    const { width, height } = host.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(Math.min(800, Math.round(width)), Math.min(800, Math.round(height)), false);
    uniforms.uCanvasAspect.value = width / height;
    resume();
  }
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  const contextLost = event => { event.preventDefault(); lost = true; host.dataset.renderer = 'fallback'; resume(); };
  const contextRestored = () => { lost = false; textures.forEach(texture => { texture.needsUpdate = true; }); resume(); };
  renderer.domElement.addEventListener('webglcontextlost', contextLost);
  renderer.domElement.addEventListener('webglcontextrestored', contextRestored);
  document.addEventListener('visibilitychange', resume);
  host.exhibitDiagnostics = () => ({ frames, active: Boolean(active()), transition: uniforms.uProgress.value });
  return {
    update(next) {
      state = next;
      if (state.reduced) host.dataset.renderer = 'fallback';
      resume();
    },
    async setArtwork(next) {
      if (url === next) return;
      url = next;
      unavailable = false;
      const version = ++request;
      try {
        if (!cache.has(next)) cache.set(next, loader.loadAsync(next).then(texture => {
          if (disposed) texture.dispose(); else textures.add(texture);
          return texture;
        }));
        const texture = await cache.get(next);
        if (disposed || version !== request) return;
        uniforms.uPrevious.value = uniforms.uCurrent.value || texture;
        const previous = uniforms.uPrevious.value.image;
        uniforms.uCurrent.value = texture;
        uniforms.uAspect.value.set(previous.width / previous.height, texture.image.width / texture.image.height);
        started = performance.now();
        resize();
        resume();
      } catch {
        if (!disposed && version === request) { unavailable = true; host.dataset.renderer = 'fallback'; url = null; resume(); }
        cache.delete(next);
      }
    },
    dispose() {
      disposed = true; request++; cancelAnimationFrame(frame); observer.disconnect();
      document.removeEventListener('visibilitychange', resume);
      renderer.domElement.removeEventListener('webglcontextlost', contextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', contextRestored);
      textures.forEach(texture => texture.dispose()); material.dispose(); geometry.dispose(); renderer.dispose(); renderer.domElement.remove();
      delete host.exhibitDiagnostics;
    },
  };
}
