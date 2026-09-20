import { WebGLRenderer, Scene, OrthographicCamera, PlaneGeometry, Mesh, MeshBasicMaterial, TextureLoader, SRGBColorSpace } from 'three';

// Animate only the painted water. The shoreline and bridge keep their camera
// coordinates; each ripple pose is held for 1/12 s, like animation on cels.
export async function createWaterMotion(host) {
  const renderer = new WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.setClearColor(0, 0);
  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, .1, 10);
  camera.position.z = 2;
  const geometry = new PlaneGeometry(2, 2);
  const clock = { value: 0 };
  let texture, material, frame = 0, pose = -1, size = '', state, lost = false, disposed = false;
  const active = () => !disposed && !lost && state && !state.reduced && state.progress < .41 && !document.hidden;
  const fallback = () => { host.dataset.renderer = 'fallback'; };
  function dispose() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    document.removeEventListener('visibilitychange', resume);
    renderer.domElement.removeEventListener('webglcontextlost', onLost);
    renderer.domElement.removeEventListener('webglcontextrestored', onRestored);
    fallback(); texture?.dispose(); material?.dispose(); geometry.dispose(); renderer.dispose();
    renderer.domElement.remove(); delete host.waterDiagnostics;
  }
  try {
    texture = await new TextureLoader().loadAsync(host.querySelector('img').src);
    texture.colorSpace = SRGBColorSpace;
    material = new MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, toneMapped: false });
    material.onBeforeCompile = shader => {
      shader.uniforms.waterTime = clock;
      shader.fragmentShader = 'uniform float waterTime;\n' + shader.fragmentShader;
      shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', `
        // UV y=0 is the bottom. Fade to zero before the waterfront (y=.34).
        // The canvas covers only the bottom 36% of the image, avoiding a
        // full-screen transparent shader pass for the empty sky above it.
        vec2 riverUV = vec2(vMapUv.x, vMapUv.y * 0.36);
        float depth = 1.0 - smoothstep(0.22, 0.32, riverUV.y);
        float t = waterTime;
        float swell = sin(riverUV.y * 260.0 + riverUV.x * 19.0 + t * 1.5);
        float crossWave = sin(riverUV.y * 143.0 - riverUV.x * 51.0 - t * 1.1);
        riverUV.x += depth * (swell * 0.0014 + crossWave * 0.00065);
        riverUV.y += depth * sin(riverUV.x * 95.0 + riverUV.y * 170.0 + t * 1.8) * 0.0012;
        vec4 sampledDiffuseColor = texture2D(map, riverUV);
        diffuseColor *= sampledDiffuseColor;
      `);
    };
    scene.add(new Mesh(geometry, material));
    host.appendChild(renderer.domElement);
    renderer.domElement.addEventListener('webglcontextlost', onLost);
    renderer.domElement.addEventListener('webglcontextrestored', onRestored);
    document.addEventListener('visibilitychange', resume);
    host.waterDiagnostics = () => ({ time: clock.value, frames: renderer.info.render.frame, fps: 12 });
  } catch (error) { dispose(); throw error; }
  function onLost(event) { event.preventDefault(); lost = true; resume(); }
  function onRestored() { lost = false; pose = -1; size = ''; resume(); }
  function tick(time) {
    frame = 0;
    if (!active()) return;
    const nextPose = Math.floor(time * 12 / 1000);
    if (nextPose !== pose) {
      const width = host.clientWidth, height = Math.round(host.clientHeight * .36);
      if (size !== `${width}:${height}`) { renderer.setSize(width, height, false); size = `${width}:${height}`; }
      clock.value = nextPose / 12;
      renderer.render(scene, camera);
      pose = nextPose;
      host.dataset.renderer = 'webgl';
    }
    frame = requestAnimationFrame(tick);
  }
  function resume() {
    if (active() && !frame) frame = requestAnimationFrame(tick);
    if (!active()) { cancelAnimationFrame(frame); frame = 0; fallback(); }
  }
  return { update(next) { state = next; resume(); }, dispose };
}
