import {
  WebGLRenderer, Scene, PerspectiveCamera, PlaneGeometry, Mesh, MeshBasicMaterial,
  TextureLoader, CanvasTexture, SRGBColorSpace, RepeatWrapping, Vector3,
  NoToneMapping, DoubleSide, Color, Fog, RingGeometry, Shape, ShapeGeometry,
} from 'three';

const art = '/image/journey/';
const clamp = x => Math.max(0, Math.min(1, x));
const ease = x => { const t = clamp(x); return t * t * (3 - 2 * t); };
const anchors = {
  'door-drink': [-8, 8.55, -45.9, 5.5, 1.35],
  'door-collection': [0, 7.8, -45.9, 5.6, 1.35],
  'door-music': [8, 8.55, -45.9, 5.5, 1.35],
  lectern: [-4.25, 3.35, -30.95, 2.18, .91],
};

export async function createAtriumWorld(host) {
  const root = host.closest('[data-journey]');
  const renderer = new WebGLRenderer({ alpha: false, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = NoToneMapping;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  const scene = new Scene();
  scene.background = new Color('#b98baf');
  scene.fog = new Fog('#b98baf', 46, 150);
  const camera = new PerspectiveCamera(52, 1, .1, 240);
  const textures = [], geometries = new Set(), materials = new Set(), arches = [], plants = [], lights = [];
  let state, lecternMesh, lecternShadow, frame = 0, last = 0, disposed = false, lost = false, size = '', frames = 0;
  const elements = Object.fromEntries(Object.keys(anchors).map(key => [key, root.querySelector(`[data-atrium-anchor="${key}"]`)]));
  const load = async name => {
    const map = await new TextureLoader().loadAsync(art + name);
    map.colorSpace = SRGBColorSpace;
    map.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    textures.push(map); return map;
  };
  const mesh = (geometry, material, x = 0, y = 0, z = 0) => {
    geometries.add(geometry); materials.add(material);
    const result = new Mesh(geometry, material); result.position.set(x, y, z); scene.add(result); return result;
  };
  const plane = (map, width, height, x, y, z, transparent = true) => mesh(new PlaneGeometry(width, height), new MeshBasicMaterial({ map, transparent, alphaTest: transparent ? .04 : 0, depthWrite: true, side: DoubleSide, toneMapped: false }), x, y, z);
  const grounded = (map, width, height, x, z, foot = .97) => plane(map, width, height, x, (foot - .5) * height, z);
  function fallback() { host.dataset.renderer = 'fallback'; root.dataset.atriumRenderer = 'fallback'; }
  function dispose() {
    if (disposed) return;
    disposed = true; cancelAnimationFrame(frame);
    document.removeEventListener('visibilitychange', resume);
    renderer.domElement.removeEventListener('webglcontextlost', lose);
    renderer.domElement.removeEventListener('webglcontextrestored', restore);
    textures.forEach(t => t.dispose()); geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose());
    renderer.dispose(); renderer.domElement.remove(); delete host.atriumDiagnostics; fallback();
  }
  try {
    const settled = await Promise.allSettled(['atrium-marble-v18.webp', 'atrium-facade-v18.webp', 'wonderpop-entry-v15.webp', 'atrium-pendants-v2.webp', 'garden-planter-v10.webp', 'garden-tree-v10.webp', 'atrium-lectern-v18.webp', 'wonderpop-atrium-v15.webp'].map(load));
    if (settled.some(r => r.status === 'rejected')) throw new Error('Atrium artwork unavailable');
    const [marble, facade, arch, pendants, planter, tree, lectern, distance] = settled.map(r => r.value);
    marble.wrapS = marble.wrapT = RepeatWrapping; marble.repeat.set(4, 18);
    const floor = plane(marble, 40, 180, 0, 0, -50, false); floor.rotation.x = -Math.PI / 2;
    // A glazed roof grid has its own perspective; a sky photograph stretched
    // over a horizontal plane would make the clouds appear to rush backwards.
    const roofCanvas = document.createElement('canvas'); roofCanvas.width = roofCanvas.height = 256;
    const roofContext = roofCanvas.getContext('2d');
    const sky = roofContext.createLinearGradient(0, 0, 256, 256);
    sky.addColorStop(0, '#e3b4ce'); sky.addColorStop(.5, '#efd5c6'); sky.addColorStop(1, '#b89ac1');
    roofContext.fillStyle = sky; roofContext.fillRect(0, 0, 256, 256);
    roofContext.strokeStyle = '#9e706f'; roofContext.lineWidth = 9; roofContext.strokeRect(0, 0, 256, 256);
    roofContext.strokeStyle = '#e9c186'; roofContext.lineWidth = 3; roofContext.strokeRect(6, 6, 244, 244);
    roofContext.strokeStyle = '#fff3df55'; roofContext.lineWidth = 2;
    roofContext.beginPath(); roofContext.moveTo(0, 128); roofContext.lineTo(256, 128); roofContext.moveTo(128, 0); roofContext.lineTo(128, 256); roofContext.stroke();
    const roofMap = new CanvasTexture(roofCanvas); roofMap.colorSpace = SRGBColorSpace;
    roofMap.wrapS = roofMap.wrapT = RepeatWrapping; roofMap.repeat.set(4, 24); textures.push(roofMap);
    const ceiling = plane(roofMap, 26, 150, 0, 17.3, -40, false); ceiling.rotation.x = Math.PI / 2;
    // Side elevations are perpendicular to the camera: their seams and windows
    // recede along a real floor, rather than scaling a picture of a corridor.
    for (const side of [-1, 1]) for (const z of [18.25, -7.25, -32.75, -58.25, -83.75]) {
      const wall = plane(facade, 25.5, 17, side * 13, 8.5, z, false);
      wall.rotation.y = -side * Math.PI / 2;
    }
    plane(distance, 92, 61.33, 0, 26, -110, false);
    // A frontal shop elevation closes the walk, with signs on its actual glass.
    plane(facade, 26, 17.333, 0, 8.666, -46, false);
    for (const z of [12, -7, -26]) {
      const bay = grounded(arch, 26, 17.333, 0, z, 1); arches.push(bay);
      const light = plane(pendants, 22, 14.667, 0, 11.6, z - 2); lights.push(light);
    }
    const shadowCanvas = document.createElement('canvas'); shadowCanvas.width = shadowCanvas.height = 96;
    const ctx = shadowCanvas.getContext('2d'), gradient = ctx.createRadialGradient(48, 48, 0, 48, 48, 48);
    gradient.addColorStop(0, '#38203dbb'); gradient.addColorStop(.35, '#38203d66'); gradient.addColorStop(1, '#38203d00');
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, 96, 96);
    const shadowMap = new CanvasTexture(shadowCanvas); textures.push(shadowMap);
    const shadow = (x, z, width, length) => {
      const result = plane(shadowMap, width, length, x, .012, z);
      result.rotation.x = -Math.PI / 2; result.material.depthWrite = false; result.renderOrder = 1; return result;
    };
    for (const z of [7, -12, -33]) for (const side of [-1, 1]) {
      grounded(planter, 2.8, 2.8, side * 8.7, z, .963); shadow(side * 8.7, z, 2.4, 1.2);
      const t = grounded(tree, 4.5, 6.75, side * 10.7, z - 1, .974); plants.push(t); shadow(side * 10.7, z - 1, 3, 2);
    }
    lecternMesh = grounded(lectern, 2.9, 4.35, -4.25, -31, .955); lecternShadow = shadow(-4.25, -31, 2.3, 1.1);
    const gilding = new MeshBasicMaterial({ color: '#edcd8f', side: DoubleSide, toneMapped: false, transparent: true, opacity: .48, depthWrite: false });
    for (const x of [-7.4, 7.4]) { const line = mesh(new PlaneGeometry(.045, 130), gilding, x, .016, -40); line.rotation.x = -Math.PI / 2; }
    for (const z of [4, -17, -38]) {
      const ring = mesh(new RingGeometry(3.1, 3.14, 72), gilding, 0, .018, z); ring.rotation.x = -Math.PI / 2;
      const star = new Shape();
      for (let i = 0; i <= 10; i++) { const angle = Math.PI / 2 + i * Math.PI / 5, radius = i % 2 ? 1 : 2.7; const x = Math.cos(angle) * radius, y = Math.sin(angle) * radius; if (!i) star.moveTo(x, y); else star.lineTo(x, y); }
      const inlay = mesh(new ShapeGeometry(star), gilding, 0, .018, z); inlay.rotation.x = -Math.PI / 2;
    }
    host.appendChild(renderer.domElement);
    renderer.domElement.addEventListener('webglcontextlost', lose);
    renderer.domElement.addEventListener('webglcontextrestored', restore);
    document.addEventListener('visibilitychange', resume);
    host.atriumDiagnostics = () => ({
      camera: camera.position.toArray(), frames, active: active(),
      arches: arches.map(a => ({ z: a.position.z, foot: project(0, 0, a.position.z) })),
      anchors: Object.fromEntries(Object.entries(anchors).map(([key, [x,y,z]]) => [key, project(x,y,z)])),
      pendants: lights.map(light => light.rotation.z),
      floorY: floor.position.y, textures: renderer.info.memory.textures,
    });
  } catch (error) { dispose(); throw error; }
  function project(x, y, z) { const v = new Vector3(x, y, z).project(camera); return { x: (v.x + 1) * state.width / 2, y: (1 - v.y) * state.height / 2, behind: z >= camera.position.z }; }
  function active() { return state && !state.reduced && state.progress >= .785 && state.progress < 1.075 && !disposed && !lost && !document.hidden; }
  function draw(time) {
    if (!state || disposed || lost) return;
    const walk = ease((state.progress - .845) / .187), mobile = state.width < 701;
    const lookX = parseFloat(root.style.getPropertyValue('--look-x')) || 0;
    camera.position.set(lookX * .009, mobile ? 4.2 : 4.8, (mobile ? 28 : 22) - (mobile ? 37 : 44) * walk);
    camera.lookAt(camera.position.x * .3, camera.position.y + .65, camera.position.z - 28);
    camera.updateMatrixWorld();
    const lecternScale = mobile ? 1.5 : 1;
    lecternMesh.scale.setScalar(lecternScale);
    lecternMesh.position.set(mobile ? -2.4 : -4.25, (.955 - .5) * 4.35 * lecternScale, mobile ? -27 : -31);
    lecternShadow.position.x = lecternMesh.position.x; lecternShadow.position.z = lecternMesh.position.z;
    lecternShadow.scale.setScalar(lecternScale);
    anchors.lectern = [lecternMesh.position.x, 3.35 * lecternScale, lecternMesh.position.z + .05, 2.18 * lecternScale, .91 * lecternScale];
    const cel = Math.floor(time / 100) * .1;
    plants.forEach((p, i) => { p.rotation.z = Math.sin(cel * .6 + i) * .004; });
    lights.forEach((p, i) => { p.rotation.z = Math.sin(cel * .45 + i) * .003; });
    renderer.render(scene, camera); frames++; last = time;
    for (const [key, [x, y, z, width, height]] of Object.entries(anchors)) {
      const el = elements[key]; if (!el) continue;
      const a = project(x - width / 2, y + height / 2, z), b = project(x + width / 2, y - height / 2, z);
      el.style.left = `${a.x}px`; el.style.top = `${a.y}px`;
      el.style.width = `${Math.max(1, b.x - a.x)}px`; el.style.height = `${Math.max(1, b.y - a.y)}px`;
      el.style.setProperty('--label-size', `${Math.max(10, Math.min(23, (b.x-a.x) * .115))}px`);
    }
    host.dataset.renderer = 'webgl'; root.dataset.atriumRenderer = 'webgl';
  }
  function tick(time) { frame = 0; if (!active()) return; if (time - last >= 48) draw(time); frame = requestAnimationFrame(tick); }
  function resume() { if (!active()) { cancelAnimationFrame(frame); frame = 0; } else if (!frame) frame = requestAnimationFrame(tick); }
  function lose(event) { event.preventDefault(); lost = true; fallback(); resume(); }
  function restore() { lost = false; update(state); }
  function update(next) {
    if (!next || disposed) return; state = next;
    if (state.reduced) { fallback(); resume(); return; }
    const nextSize = `${state.width}:${state.height}`;
    if (nextSize !== size) { size = nextSize; renderer.setSize(state.width, state.height, false); camera.aspect = state.width/state.height; camera.fov = state.width < 701 ? 66 : 52; camera.updateProjectionMatrix(); }
    if (frames === 0 || active()) draw(performance.now());
    resume();
  }
  return { update, dispose };
}
