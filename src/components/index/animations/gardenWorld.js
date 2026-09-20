import {
  WebGLRenderer, Scene, PerspectiveCamera, PlaneGeometry, Mesh, MeshBasicMaterial,
  TextureLoader, CanvasTexture, SRGBColorSpace, RepeatWrapping, Vector3, NoToneMapping,
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
  const camera = new PerspectiveCamera(50, 1, 0.15, 1800);
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
      'garden-grass-v11.webp', 'garden-grove-v11.webp',
    ].map(load));
    if (results.some(result => result.status === 'rejected')) throw new Error('Garden artwork unavailable');
    const [groundMap, buildingMap, lampMap, treeMap, planterMap, grassMap, groveMap] = results.map(result => result.value);
    // The path keeps its width; the meadow extends independently to the horizon.
    // Enlarging the original atlas would also widen its painted walkway.
    grassMap.wrapS = grassMap.wrapT = RepeatWrapping;
    grassMap.repeat.set(128, 128);
    const meadowGeometry = new PlaneGeometry(2048, 2048);
    meadowGeometry.rotateX(-Math.PI / 2);
    const meadowMaterial = new MeshBasicMaterial({ map: grassMap, toneMapped: false });
    const meadow = new Mesh(meadowGeometry, meadowMaterial);
    meadow.position.set(0, -0.025, -200);
    geometries.add(meadowGeometry);
    materials.add(meadowMaterial);
    scene.add(meadow);

    // Shared soft contact shadows sit on the ground, underneath the cutouts.
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = shadowCanvas.height = 128;
    const ctx = shadowCanvas.getContext('2d');
    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(26, 12, 35, .65)');
    gradient.addColorStop(.38, 'rgba(26, 12, 35, .30)');
    gradient.addColorStop(1, 'rgba(26, 12, 35, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
    const shadowMap = new CanvasTexture(shadowCanvas);
    shadowMap.colorSpace = SRGBColorSpace;
    textures.push(shadowMap);
    const shadowGeometry = new PlaneGeometry(1, 1);
    shadowGeometry.rotateX(-Math.PI / 2);
    const shadowMaterial = new MeshBasicMaterial({ map: shadowMap, transparent: true, depthWrite: false, toneMapped: false });
    geometries.add(shadowGeometry);
    materials.add(shadowMaterial);
    const shadow = (x, z, width, depth) => {
      const mesh = new Mesh(shadowGeometry, shadowMaterial);
      mesh.position.set(x, .025, z);
      mesh.scale.set(width, 1, depth);
      mesh.renderOrder = -1;
      scene.add(mesh);
    };
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
    shadow(0, BUILDING_Z, 14, 3);
    for (let i = 0; i < 14; i++) {
      const z = 21 - i * 5;
      for (const side of [-1, 1]) {
        const lamp = plane(lampMap, 3.6, 5.4, side * 5.1, z, 0.5, 0.978);
        lamp.scale.x = -side;
        lamps.push(lamp);
        shadow(side * 5.1, z, 1.35, .85);
        plane(planterMap, 1.65, 1.65, side * 4.6, z - 2.1, 0.5, 0.963);
        shadow(side * 4.6, z - 2.1, 1.1, .75);
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
    // Continuous side groves and a second distant tree line close the gaps
    // between foreground trees without putting scenery across the walkway.
    for (const side of [-1, 1]) {
      for (const z of [20, -14, -48, -82]) {
        const sideGrove = plane(groveMap, 36, 12, side * 25, z, .5, .90);
        sideGrove.rotation.y = -side * Math.PI / 2;
      }
      plane(groveMap, 54, 18, side * 27, -104, .5, .90);
      plane(groveMap, 72, 24, side * 36, -155, .5, .90);
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
        meadowWidth: meadowGeometry.parameters.width,
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
