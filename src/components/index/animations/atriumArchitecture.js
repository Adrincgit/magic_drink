import { AmbientLight, DirectionalLight, CylinderGeometry, BoxGeometry, MeshStandardMaterial, MeshBasicMaterial,
  CanvasTexture, SRGBColorSpace, Vector2, AdditiveBlending } from 'three';

// The painted arch fronts retain their original lighting. These solid shafts
// supply the missing side/rear surfaces when the camera passes a column.
export function createAtriumArchitecture({ scene, mesh, plane, shadow, textures, project }) {
  scene.add(new AmbientLight('#fff0dd', 1.6));
  const sun = new DirectionalLight('#ffddb0', 2.3); sun.position.set(-8, 18, 18); scene.add(sun);
  const fill = new DirectionalLight('#aeb8ff', .65); fill.position.set(12, 8, -35); scene.add(fill);

  const size = 256;
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d'), normal = ctx.createImageData(size, size);
  // A small tangent-space normal map models the column fluting, not the
  // already-painted highlights of the original artwork.
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const i = (y * size + x) * 4;
    const nx = .3 * Math.sin(x / size * Math.PI * 24);
    const ny = .015 * Math.sin(x * .11 + y * .08);
    const nz = Math.sqrt(1 - nx * nx - ny * ny);
    normal.data.set([Math.round(127.5 + nx * 127.5), Math.round(127.5 + ny * 127.5), Math.round(127.5 + nz * 127.5), 255], i);
  }
  ctx.putImageData(normal, 0, 0);
  const normalMap = new CanvasTexture(canvas); textures.push(normalMap);
  const paint = document.createElement('canvas'); paint.width = paint.height = size;
  const pc = paint.getContext('2d'), pixels = pc.createImageData(size, size);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const grain = Math.sin(x * .43 + y * .21) * Math.sin(x * .091 - y * .29) * 3;
    const vein = Math.sin(x * .025 + Math.sin(y * .06) * 2.5) * 4;
    pixels.data.set([164 + grain + vein, 126 + grain + vein, 169 + grain + vein, 255], (y * size + x) * 4);
  }
  pc.putImageData(pixels, 0, 0);
  const paintMap = new CanvasTexture(paint); paintMap.colorSpace = SRGBColorSpace; textures.push(paintMap);
  const marble = new MeshStandardMaterial({ map: paintMap, roughness: .92, normalMap, normalScale: new Vector2(.45, .45) });
  const gilding = document.createElement('canvas'); gilding.width = 16; gilding.height = 128;
  const goldContext = gilding.getContext('2d'), goldGradient = goldContext.createLinearGradient(0, 0, 0, 128);
  for (const [at, color] of [[0, '#9b673e'], [.2, '#e0aa67'], [.38, '#ffe6a8'], [.5, '#edc780'], [.8, '#c88e50'], [1, '#946143']]) goldGradient.addColorStop(at, color);
  goldContext.fillStyle = goldGradient; goldContext.fillRect(0, 0, 16, 128);
  const goldMap = new CanvasTexture(gilding); goldMap.colorSpace = SRGBColorSpace; textures.push(goldMap);
  const gold = new MeshBasicMaterial({ map: goldMap, toneMapped: false });
  const columns = [];
  for (const z of [12, -7, -26]) for (const side of [-1, 1]) {
    const x = side * 10.45, centreZ = z - 1.6;
    const shaft = mesh(new CylinderGeometry(1.1, 1.16, 14.4, 32), marble, x, 8.7, centreZ);
    mesh(new BoxGeometry(2.5, 1.5, 2.5), marble, x, .75, centreZ);
    for (const [y, radius, height] of [[.16, 1.4, .32], [1.5, 1.28, .23], [3.35, 1.23, .15], [13.6, 1.2, .18], [15.85, 1.34, .3], [16.2, 1.44, .2]]) {
      mesh(new CylinderGeometry(radius, radius + .035, height, 32), gold, x, y, centreZ);
    }
    shadow(x, centreZ, 4.4, 2.3);
    columns.push({ shaft, x, z: centreZ, radius: 1.16 });
  }

  // Restrained painted pools of window light, shared by windows and floor.
  const glow = document.createElement('canvas'); glow.width = glow.height = 128;
  const gc = glow.getContext('2d'), gradient = gc.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, '#ffe2aa66'); gradient.addColorStop(.4, '#ffca6925'); gradient.addColorStop(1, '#ffca6900');
  gc.fillStyle = gradient; gc.fillRect(0, 0, 128, 128);
  const glowMap = new CanvasTexture(glow); glowMap.colorSpace = SRGBColorSpace; textures.push(glowMap);
  const glows = [];
  for (const x of [-7.7, 0, 7.7]) {
    const window = plane(glowMap, 5.4, 5.4, x, 4.1, -45.82);
    const floor = plane(glowMap, 5.2, 8, x, .026, -42.3);
    floor.rotation.x = -Math.PI / 2;
    for (const light of [window, floor]) {
      light.material.depthWrite = false; light.material.blending = AdditiveBlending;
      light.material.opacity = .35; glows.push(light);
    }
  }
  return {
    update(time) {
      glows.forEach((light, i) => { light.material.opacity = .3 + .07 * Math.sin(Math.floor(time * 8) / 8 * .8 + i * .65); });
    },
    diagnostics() {
      return columns.map(c => ({ x: c.x, z: c.z, radius: c.radius, height: c.shaft.geometry.parameters.height,
        normalMap: Boolean(c.shaft.material.normalMap), screen: project(c.x, 0, c.z) }));
    },
  };
}
