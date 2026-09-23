import * as THREE from 'three';
import { FILM_REVEAL, FILM_END, filmShots, filmMoment } from '../../../data/wonderpopFilm';

const fragmentShader = `
precision highp float;
uniform sampler2D photograph;
uniform vec2 resolution;
uniform float imageAspect, hasImage, clock, progress, colorAmount, finalShot;
varying vec2 vUv;
float random(vec2 p) { return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
void main() {
  float frame = floor(clock*16.0);
  float age = 1.0-colorAmount;
  vec2 uv = vUv;
  float aspect = resolution.x/resolution.y;
  vec2 fit = vec2(min(1.0,aspect/imageAspect), min(1.0,imageAspect/aspect));
  // Move the photograph as one rigid frame. No depth displacement or warping.
  vec2 weave = vec2(random(vec2(frame,2.0)),random(vec2(frame,7.0)))-.5;
  vec2 photoUv = (uv-.5)*fit/(1.025+progress*.045)+.5;
  photoUv += weave*.0015*age + vec2((progress-.5)*.008,0.0);
  vec3 paper = mix(vec3(.20,.205,.19),vec3(.21,.115,.23),colorAmount);
  paper += vec3(.075)*(1.0-length(uv-.5));
  float bounds = step(0.0,photoUv.x)*step(photoUv.x,1.0)*step(0.0,photoUv.y)*step(photoUv.y,1.0);
  vec3 ink = mix(paper,texture2D(photograph,photoUv).rgb,hasImage*bounds);
  float grey = dot(ink,vec3(.299,.587,.114));
  vec3 silver = vec3(grey*.97,grey*.97,grey*.94);
  vec3 col = mix(silver,ink,colorAmount);
  float grain = random(floor(gl_FragCoord.xy*.7)+frame*13.0)-.5;
  col += grain*(.085*age+.013*(1.0-finalShot));
  // Irregular scratches and dust change independently of the scroll position.
  float scratchX = random(vec2(floor(frame/8.0),91.0));
  float scratch = (1.0-smoothstep(.0003,.0012,abs(uv.x-scratchX)))*step(.7,random(vec2(floor(frame/8.0),3.0)));
  vec2 cells = uv*vec2(90.0,65.0);
  float speck = step(.998,random(floor(cells)+frame))* (1.0-smoothstep(.04,.26,length(fract(cells)-.5)));
  col += vec3(scratch*.07*age); col -= speck*.24*age;
  float vignette = smoothstep(.27,.75,length((uv-.5)*vec2(1.0,.86)));
  col *= 1.0-vignette*(.32*age+.08);
  col *= 1.0 + (random(vec2(frame,31.0))-.5)*.012*age;
  // A short optical shutter at each cut; never repeated flashing at rest.
  float shutter = smoothstep(0.0,.025,progress)*(1.0-smoothstep(.98,1.0,progress));
  col *= mix(.55,1.0,shutter);
  gl_FragColor = vec4(col,1.0);
}`;

export function createWonderpopFilm(surface) {
  const host = surface.closest('[data-wonderpop-film]');
  const renderer = new THREE.WebGLRenderer({ alpha: false, antialias: false, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  const canvas = renderer.domElement;
  canvas.setAttribute('aria-hidden', 'true');
  surface.append(canvas);
  const empty = new THREE.DataTexture(new Uint8Array([80,80,75,255]),1,1);
  empty.needsUpdate = true;
  const uniforms = {
    photograph: { value: empty }, resolution: { value: new THREE.Vector2(1,1) },
    imageAspect: { value: 1.5 }, hasImage: { value: 0 }, clock: { value: 0 },
    progress: { value: 0 }, colorAmount: { value: 0 }, finalShot: { value: 0 },
  };
  const geometry = new THREE.PlaneGeometry(2,2);
  const material = new THREE.ShaderMaterial({ uniforms, fragmentShader, vertexShader: 'varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position,1.0);}' });
  const scene = new THREE.Scene(); scene.add(new THREE.Mesh(geometry,material));
  const camera = new THREE.OrthographicCamera(-1,1,1,-1,0,1);
  const loader = new THREE.TextureLoader(), cache = new Map();
  let disposed = false, lost = false, visible = false, raf = 0, index = -1, lastFrame = 0, elapsed = 0;
  const diagnostics = host.filmDiagnostics = { frames: 0, index: -1, running: false, textures: 0 };
  function bind() {
    const shot = filmShots[index]; if (!shot) return;
    const texture = cache.get(index)?.texture;
    uniforms.hasImage.value = texture ? 1 : 0;
    uniforms.photograph.value = texture || empty;
    uniforms.imageAspect.value = texture ? texture.image.width / texture.image.height : 1.5;
    host.dataset.filmRenderer = !lost && (!shot.file || texture) ? 'webgl' : 'fallback';
  }
  function load(i) {
    const shot = filmShots[i];
    if (!shot?.file || cache.has(i)) return;
    const record = {}; cache.set(i,record);
    loader.load(shot.file, texture => {
      if (disposed || cache.get(i) !== record) { texture.dispose(); return; }
      // The custom film shader works directly with the photograph's sRGB values.
      texture.generateMipmaps = false; texture.minFilter = THREE.LinearFilter;
      record.texture = texture; if (i === index) bind();
    }, undefined, () => { record.failed = true; if (i === index) bind(); });
  }
  function tick(now) {
    raf = 0;
    if (!visible || document.hidden || lost || disposed) { diagnostics.running = false; lastFrame = 0; return; }
    diagnostics.running = true;
    if (!lastFrame || now-lastFrame >= 1000/30) {
      elapsed += lastFrame ? Math.min(.1,(now-lastFrame)/1000) : 0;
      lastFrame = now; uniforms.clock.value = elapsed;
      renderer.render(scene,camera); diagnostics.frames++;
    }
    raf = requestAnimationFrame(tick);
  }
  function resume() { if (!raf && visible && !document.hidden && !lost && !disposed) raf = requestAnimationFrame(tick); }
  function resize() {
    const { width, height } = surface.getBoundingClientRect();
    if (width < 1 || height < 1 || disposed) return;
    renderer.setSize(width,height,false); uniforms.resolution.value.set(width,height);
  }
  const observer = new ResizeObserver(resize); observer.observe(surface); resize();
  function onVisibility() { if (document.hidden) { cancelAnimationFrame(raf); raf=0; lastFrame=0; diagnostics.running=false; } else resume(); }
  function onLost(event) { event.preventDefault(); lost=true; host.dataset.filmRenderer='fallback'; cancelAnimationFrame(raf); raf=0; diagnostics.running=false; }
  function onRestored() { lost=false; bind(); resize(); resume(); }
  document.addEventListener('visibilitychange',onVisibility);
  canvas.addEventListener('webglcontextlost',onLost); canvas.addEventListener('webglcontextrestored',onRestored);
  return {
    update({progress,reduced}) {
      const moment = filmMoment(progress), shot = filmShots[moment.index];
      // The product has its own vector animation; no WebGL loop behind it.
      visible = !reduced && progress >= FILM_REVEAL && progress < FILM_END && shot.kind !== 'product';
      uniforms.progress.value = moment.local; uniforms.colorAmount.value = shot.color;
      uniforms.finalShot.value = shot.kind === 'final' ? 1 : 0;
      if (index !== moment.index) {
        index = moment.index; diagnostics.index=index;
        load(index); load(index+1); load(index-1);
        for (const [i,record] of cache) if (Math.abs(i-index)>2) { record.texture?.dispose(); cache.delete(i); }
        diagnostics.textures=cache.size; bind();
      }
      if (visible) resume();
      else { cancelAnimationFrame(raf); raf=0; lastFrame=0; diagnostics.running=false; }
    },
    dispose() {
      disposed=true; cancelAnimationFrame(raf); observer.disconnect();
      document.removeEventListener('visibilitychange',onVisibility);
      canvas.removeEventListener('webglcontextlost',onLost); canvas.removeEventListener('webglcontextrestored',onRestored);
      cache.forEach(record=>record.texture?.dispose()); empty.dispose(); geometry.dispose(); material.dispose(); renderer.dispose(); canvas.remove();
      host.dataset.filmRenderer='fallback'; delete host.filmDiagnostics;
    },
  };
}
