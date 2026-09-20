import { WebGLRenderer, Scene, OrthographicCamera, PlaneGeometry, Mesh, MeshBasicMaterial, TextureLoader, SRGBColorSpace } from 'three';

// One canvas for four audience planes. The lower bodies stay anchored while
// a small, continuous deformation moves the upper arms and glow sticks.
export async function createCrowdMotion(host) {
  const rows = [...host.parentElement.querySelectorAll('[data-audience-row]')];
  const renderer = new WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.setClearColor(0, 0);
  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, .1, 10);
  camera.position.z = 5;
  const geometry = new PlaneGeometry(1, 1, 96, 16);
  const textures = [], materials = [], meshes = [], uniforms = [];
  let state, frame = 0, last = 0, disposed = false, lost = false, size = '';
  let measured = true;
  let showingFallback;
  const fallback = show => {
    if (showingFallback === show) return;
    showingFallback = show;
    host.dataset.renderer = show ? 'fallback' : 'webgl';
    host.style.visibility = show ? 'hidden' : 'visible';
    rows.forEach(row => { row.querySelector('img').style.visibility = show ? '' : 'hidden'; });
  };
  const active = () => !disposed && !lost && state && !state.reduced && state.progress >= .37 && state.progress < .64 && !document.hidden;
  function dispose() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    fallback(true);
    document.removeEventListener('visibilitychange', resume);
    renderer.domElement.removeEventListener('webglcontextlost', onLost);
    renderer.domElement.removeEventListener('webglcontextrestored', onRestored);
    textures.forEach(texture => texture.dispose());
    materials.forEach(material => material.dispose());
    geometry.dispose();
    renderer.dispose();
    renderer.domElement.remove();
    delete host.crowdDiagnostics;
  }
  try {
    const loaded = await Promise.allSettled(rows.map(async row => {
      const texture = await new TextureLoader().loadAsync(row.querySelector('img').src);
      texture.colorSpace = SRGBColorSpace;
      textures.push(texture);
      return texture;
    }));
    if (loaded.some(result => result.status === 'rejected')) throw new Error('Audience texture unavailable');
    loaded.forEach((result, i) => {
      const time = { value: 0 }, amplitude = { value: .004 }, phase = { value: i * 1.8 };
      uniforms.push({ time, amplitude });
      const material = new MeshBasicMaterial({ map: result.value, transparent: true, depthWrite: false, toneMapped: false });
      material.onBeforeCompile = shader => {
        Object.assign(shader.uniforms, { crowdTime: time, crowdSwing: amplitude, crowdPhase: phase });
        shader.vertexShader = 'uniform float crowdTime; uniform float crowdSwing; uniform float crowdPhase;\n' + shader.vertexShader;
        shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `
          #include <begin_vertex>
          float upper = smoothstep(0.25, 0.66, uv.y);
          float wave = sin(crowdTime * 2.6 + uv.x * 35.0 + crowdPhase);
          transformed.x += upper * wave * crowdSwing;
          transformed.y += upper * sin(crowdTime * 2.6 + uv.x * 35.0 + crowdPhase + 1.2) * crowdSwing * 0.12;
        `);
      };
      materials.push(material);
      const mesh = new Mesh(geometry, material);
      mesh.renderOrder = i;
      meshes.push(mesh);
      scene.add(mesh);
    });
    host.appendChild(renderer.domElement);
    renderer.domElement.addEventListener('webglcontextlost', onLost);
    renderer.domElement.addEventListener('webglcontextrestored', onRestored);
    document.addEventListener('visibilitychange', resume);
    host.crowdDiagnostics = () => ({ time: uniforms[0].time.value, frames: renderer.info.render.frame, rows: meshes.length });
  } catch (error) { dispose(); throw error; }
  function onLost(event) { event.preventDefault(); lost = true; fallback(true); resume(); }
  function onRestored() { lost = false; measured = true; resume(); }
  function draw(time) {
    const bounds = host.getBoundingClientRect();
    const nextSize = `${bounds.width}:${bounds.height}`;
    if (size !== nextSize) {
      size = nextSize;
      renderer.setSize(bounds.width, bounds.height, false);
      camera.left = -bounds.width / 2; camera.right = bounds.width / 2;
      camera.top = bounds.height / 2; camera.bottom = -bounds.height / 2;
      camera.updateProjectionMatrix();
      measured = true;
    }
    if (measured) {
      rows.forEach((row, i) => {
        const r = row.getBoundingClientRect();
        meshes[i].position.set(r.x + r.width / 2 - bounds.x - bounds.width / 2,
          bounds.height / 2 - (r.y + r.height / 2 - bounds.y), i * .01);
        meshes[i].scale.set(r.width, r.height, 1);
        uniforms[i].amplitude.value = (bounds.width <= 700 ? 5 : 9) / r.width;
      });
      measured = false;
    }
    uniforms.forEach(uniform => { uniform.time.value = time / 1000; });
    renderer.render(scene, camera);
    last = time;
    fallback(false);
  }
  function tick(time) {
    frame = 0;
    if (!active()) return;
    // Pointer depth updates via CSS, so sample geometry with every rendered frame.
    if (measured || time - last >= 32) { measured = true; draw(time); }
    frame = requestAnimationFrame(tick);
  }
  function resume() {
    if (active() && !frame) frame = requestAnimationFrame(tick);
    if (!active()) { cancelAnimationFrame(frame); frame = 0; fallback(true); }
  }
  function update(next) { state = next; measured = true; resume(); }
  return { update, dispose };
}
