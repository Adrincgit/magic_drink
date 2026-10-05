// A new emulsion pattern per exposure, in screen space. Nothing is translated
// or tiled. Soft-light compositing is applied by CSS over the artwork AND UI.
const vertexSource = `
attribute vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }
`;
const fragmentSource = `
precision highp float;
uniform float exposure;
float randomGrain(vec2 p, float salt) {
  // Keep all hash arithmetic small: a large sin(dot(pixel)) seed loses
  // precision and can correlate different exposures on mobile GPUs.
  vec3 q = fract(vec3(p, exposure + salt) * vec3(0.1031, 0.11369, 0.13787));
  q += dot(q, q.yzx + 19.19);
  return fract((q.x + q.y) * q.z);
}
void main() {
  vec2 p = gl_FragCoord.xy;
  // Mostly fine grains, with a little clumping. Summing independent samples
  // softens the distribution instead of producing harsh black/white static.
  float fine = randomGrain(p, 0.0) + randomGrain(p, 19.19) - 1.0;
  float clump = randomGrain(floor(p / 1.8), 47.17) - 0.5;
  float density = clamp(0.5 + fine * 0.53 + clump * 0.18, 0.0, 1.0);
  gl_FragColor = vec4(vec3(density), 1.0);
}
`;

export function createFilmGrain(canvas) {
  const gl = canvas.getContext('webgl', {
    alpha: false, antialias: false, depth: false, stencil: false,
    powerPreference: 'low-power', preserveDrawingBuffer: false,
  });
  let program, buffer, exposureUniform;
  let frame = 0, timer = 0, lastDraw = 0;
  let enabled = false, reduced = true, lost = false, disposed = false;
  const context2d = gl ? null : canvas.getContext('2d', { alpha: false });
  canvas.dataset.renderer = gl ? 'webgl' : context2d ? 'static-2d' : 'unavailable';

  function initialize() {
    if (!gl) return;
    const shaders = [];
    try {
      for (const [type, source] of [[gl.VERTEX_SHADER, vertexSource], [gl.FRAGMENT_SHADER, fragmentSource]]) {
        const shader = gl.createShader(type);
        shaders.push(shader);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error('Grain shader unavailable');
      }
      program = gl.createProgram();
      shaders.forEach(shader => gl.attachShader(program, shader));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Grain program unavailable');
      gl.useProgram(program);
      buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const position = gl.getAttribLocation(program, 'position');
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
      exposureUniform = gl.getUniformLocation(program, 'exposure');
      canvas.style.visibility = '';
    } catch {
      lost = true;
      canvas.style.visibility = 'hidden';
      canvas.dataset.renderer = 'unavailable';
    } finally {
      shaders.forEach(shader => gl.deleteShader(shader));
    }
  }

  function draw() {
    if (lost || disposed) return;
    if (gl) {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform1f(exposureUniform, (frame++ % 4096) + 1);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    } else if (context2d) {
      // No GPU: one still exposure, never a CPU animation loop.
      const pixels = context2d.createImageData(canvas.width, canvas.height);
      for (let i = 0; i < pixels.data.length; i += 4) {
        const density = Math.round(255 * (Math.random() + Math.random() + Math.random()) / 3);
        pixels.data[i] = pixels.data[i + 1] = pixels.data[i + 2] = density;
        pixels.data[i + 3] = 255;
      }
      context2d.putImageData(pixels, 0, 0);
    }
  }

  function tick(now) {
    if (now - lastDraw >= 1000 / 24) {
      draw();
      lastDraw = now - ((now - lastDraw) % (1000 / 24));
    }
    timer = requestAnimationFrame(tick);
  }

  function sync() {
    cancelAnimationFrame(timer);
    const active = enabled && !document.hidden && !lost && !disposed;
    canvas.dataset.grainState = active ? (reduced || !gl ? 'still' : 'running') : 'paused';
    if (!active) return;
    draw();
    if (!reduced && gl) {
      lastDraw = performance.now();
      timer = requestAnimationFrame(tick);
    }
  }

  function resize() {
    const width = canvas.clientWidth, height = canvas.clientHeight;
    if (!width || !height) return;
    // Bounded fill rate on ultrawide/retina screens; no 4K noise buffer.
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5, Math.sqrt(1800000 / (width * height)));
    const w = Math.round(width * ratio), h = Math.round(height * ratio);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w; canvas.height = h;
      sync();
    }
  }

  function contextLost(event) {
    event.preventDefault(); lost = true;
    canvas.style.visibility = 'hidden'; sync();
  }
  function contextRestored() { lost = false; initialize(); sync(); }

  initialize();
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  document.addEventListener('visibilitychange', sync);
  canvas.addEventListener('webglcontextlost', contextLost);
  canvas.addEventListener('webglcontextrestored', contextRestored);
  return {
    update(options) { enabled = options.enabled; reduced = options.reduced; resize(); sync(); },
    dispose() {
      disposed = true; cancelAnimationFrame(timer); observer.disconnect();
      document.removeEventListener('visibilitychange', sync);
      canvas.removeEventListener('webglcontextlost', contextLost);
      canvas.removeEventListener('webglcontextrestored', contextRestored);
      if (gl && !lost) { gl.deleteBuffer(buffer); gl.deleteProgram(program); }
    },
  };
}

// Lens dispersion grows smoothly from a neutral center. Red/green encode the
// horizontal/vertical sampling displacement; this is a map, not a color wash.
export function createLensMap() {
  const size = 256;
  const map = document.createElement('canvas');
  map.width = map.height = size;
  const context = map.getContext('2d');
  const pixels = context.createImageData(size, size);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const u = x / (size - 1) * 2 - 1, v = y / (size - 1) * 2 - 1;
    const radius = Math.hypot(u, v);
    const gain = Math.pow(Math.min(1, Math.max(0, (radius - 0.32) / 0.85)), 2);
    const i = (y * size + x) * 4;
    pixels.data[i] = Math.round(127.5 + u * gain * 127.5);
    pixels.data[i + 1] = Math.round(127.5 + v * gain * 127.5);
    pixels.data[i + 2] = 128;
    pixels.data[i + 3] = 255;
  }
  context.putImageData(pixels, 0, 0);
  return map.toDataURL();
}
