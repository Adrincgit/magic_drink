import {
  WebGLRenderer, Scene, PerspectiveCamera, PlaneGeometry, Mesh, MeshBasicMaterial,
  TextureLoader, SRGBColorSpace, RepeatWrapping, Vector3, NoToneMapping,
} from 'three';

const clamp = n => Math.max(0, Math.min(1, n));
const art = '/image/journey/';
const BUILDING_Z = -48;
const BUILDING_HEIGHT = 23;
const BUILDING_FOOT = 0.967;

export async function createGardenWorld(host) {
  const renderer = new WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = NoToneMapping;
  renderer.setClearColor(0, 0);
  renderer.domElement.setAttribute('aria-hidden', 'true');
  const scene = new Scene();
  const camera = new PerspectiveCamera(50, 1, 0.15, 240);
  const textures = [];
  const geometries = new Set();
  const materials = new Set();
  const trees = [];
  const lamps = [];
  let frame = 0;
  let lastTime = 0;
  let hasDrawn = false;
  let disposed = false;
  let lost = false;
  let state;
  let size = '';
  const root = host.closest('[data-journey]');

  const load = async name => {
    const texture = await new TextureLoader().loadAsync(art + name);
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    textures.push(texture);
    return texture;
  };
  const plane = (map, width, height, x, z, anchorX = 0.5, anchorY = 0.97) => {
    // Anchor the painted foot, not the transparent canvas edge, on world y=0.
    const geometry = new PlaneGeometry(width, height);
    geometry.translate((0.5 - anchorX) * width, (anchorY - 0.5) * height, 0);
    const material = new MeshBasicMaterial({ map, transparent: true, alphaTest: 0.02, depthWrite: false, toneMapped: false });
    geometries.add(geometry);
    materials.add(material);
    const mesh = new Mesh(geometry, material);
    mesh.position.set(x, 0, z);
    scene.add(mesh);
    return mesh;
  };
  function dispose() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    document.removeEventListener('visibilitychange', resume);
    renderer.domElement.removeEventListener('webglcontextlost', contextLost);
    renderer.domElement.removeEventListener('webglcontextrestored', contextRestored);
    textures.forEach(t => t.dispose());
    geometries.forEach(g => g.dispose());
    materials.forEach(m => m.dispose());
    renderer.dispose();
    renderer.domElement.remove();
    delete host.gardenDiagnostics;
  }
  try {
    // Settle every request before disposal, including late successful textures.
    const results = await Promise.allSettled([
      'garden-ground-atlas-v10.webp', 'wonderpop-front-v2.webp', 'lamp.webp',
      'garden-tree-v10.webp', 'garden-planter-v10.webp',
    ].map(load));
    if (results.some(result => result.status === 'rejected')) throw new Error('Garden artwork unavailable');
    const [groundMap, buildingMap, lampMap, treeMap, planterMap] = results.map(result => result.value);
    groundMap.wrapT = RepeatWrapping;
    groundMap.repeat.set(1, 9);
    const groundGeometry = new PlaneGeometry(32, 180);
    groundGeometry.rotateX(-Math.PI / 2);
    const groundMaterial = new MeshBasicMaterial({ map: groundMap, toneMapped: false });
    const ground = new Mesh(groundGeometry, groundMaterial);
    ground.position.z = -35;
    geometries.add(groundGeometry);
    materials.add(groundMaterial);
    scene.add(ground);
    plane(buildingMap, BUILDING_HEIGHT * 2 / 3, BUILDING_HEIGHT, 0, BUILDING_Z, 0.5, BUILDING_FOOT);
    for (let i = 0; i < 14; i++) {
      const z = 21 - i * 5;
      for (const side of [-1, 1]) {
        const lamp = plane(lampMap, 3.6, 5.4, side * 5.1, z, 0.5, 0.978);
        lamp.scale.x = -side;
        lamps.push(lamp);
        plane(planterMap, 1.65, 1.65, side * 4.6, z - 2.1, 0.5, 0.963);
      }
    }
    for (let i = 0; i < 9; i++) {
      for (const side of [-1, 1]) {
        const height = 10.5 + (i % 3) * 1.15;
        const tree = plane(treeMap, height * 2 / 3, height,
          side * (7.5 + (i % 2) * 0.6), 18 - i * 8, 0.5, 0.974);
        tree.scale.x = -side;
        trees.push(tree);
        if (i < 7) {
          const outer = plane(treeMap, 10, 15, side * 14, 12 - i * 11, 0.5, 0.974);
          outer.scale.x = side;
          trees.push(outer);
        }
      }
    }
    // A distant tree line closes the garden beyond the architecture.
    for (let x = -32; x <= 32; x += 6) {
      plane(treeMap, 7.4, 11.1, x, -70, 0.5, 0.974);
    }
    host.appendChild(renderer.domElement);
    renderer.domElement.addEventListener('webglcontextlost', contextLost);
    renderer.domElement.addEventListener('webglcontextrestored', contextRestored);
    document.addEventListener('visibilitychange', resume);
    host.gardenDiagnostics = () => {
      const project = (x, y, z) => {
        const p = new Vector3(x, y, z).project(camera);
        return { x: (p.x + 1) / 2, y: (1 - p.y) / 2 };
      };
      return {
        camera: camera.position.toArray(),
        buildingFoot: project(0, 0, BUILDING_Z),
        buildingTop: project(0, BUILDING_HEIGHT * BUILDING_FOOT, BUILDING_Z),
        buildingLeft: project(-BUILDING_HEIGHT / 3, 0, BUILDING_Z),
        buildingRight: project(BUILDING_HEIGHT / 3, 0, BUILDING_Z),
        groundY: ground.position.y,
        lamps: lamps.map(lamp => ({ z: lamp.position.z, foot: project(lamp.position.x, 0, lamp.position.z) })),
        frames: renderer.info.render.frame,
        textures: renderer.info.memory.textures,
      };
    };
  } catch (error) {
    dispose();
    throw error;
  }
  function contextLost(event) {
    event.preventDefault();
    lost = true;
    hasDrawn = false;
    cancelAnimationFrame(frame);
    frame = 0;
    host.dataset.renderer = 'fallback';
  }
  function contextRestored() {
    lost = false;
    update(state);
  }
  function active() {
    return state && !state.reduced && state.progress >= 0.60 && state.progress < 0.86 && !document.hidden && !lost && !disposed;
  }
  function draw(time) {
    if (!state || disposed || lost) return;
    const travel = clamp((state.progress - 0.632) / (0.844 - 0.632));
    const approach = clamp((travel - 0.72) / 0.28);
    const lookX = parseFloat(root.style.getPropertyValue('--look-x')) || 0;
    const lookY = parseFloat(root.style.getPropertyValue('--look-y')) || 0;
    camera.position.set(lookX * 0.012, 2.4 + approach * 3.2 + lookY * 0.009, 22 - 64 * travel);
    const pitch = 0.135 * (1 - approach);
    camera.lookAt(camera.position.x * 0.4, camera.position.y + Math.tan(pitch) * 30, camera.position.z - 30);
    trees.forEach((tree, i) => { tree.rotation.z = Math.sin(time / 4300 + i * 1.9) * 0.003; });
    renderer.render(scene, camera);
    hasDrawn = true;
    lastTime = time;
    host.dataset.renderer = state.reduced ? 'fallback' : 'webgl';
  }
  function tick(time) {
    frame = 0;
    if (!active()) return;
    // Ambient sway is independent of scroll, capped at 30fps while stationary.
    if (time - lastTime >= 32) draw(time);
    frame = requestAnimationFrame(tick);
  }
  function resume() {
    if (active() && !frame) frame = requestAnimationFrame(tick);
    if (!active()) { cancelAnimationFrame(frame); frame = 0; }
  }
  function update(next) {
    if (!next || disposed) return;
    state = next;
    if (state.reduced) {
      host.dataset.renderer = 'fallback';
      resume();
      return;
    }
    const nextSize = `${state.width}:${state.height}`;
    if (size !== nextSize) {
      size = nextSize;
      renderer.setSize(state.width, state.height, false);
      camera.aspect = state.width / state.height;
      camera.updateProjectionMatrix();
    }
    // Warm one frame during the concert, then only draw the visible chapter.
    // draw() also resets the ambient clock, avoiding a second render per scroll frame.
    if (!hasDrawn || (state.progress >= 0.60 && state.progress < 0.86)) draw(performance.now());
    resume();
  }
  return { update, dispose };
}
