import {
  WebGLRenderer, Scene, PerspectiveCamera, PlaneGeometry, Mesh,
  ShaderMaterial, MeshBasicMaterial, Float32BufferAttribute, TextureLoader, SRGBColorSpace, NoToneMapping, Vector3,
} from 'three';
import artwork from '../../../data/atriumLayers.json';
import groundRepair from '../../../data/atriumGround.json';

const CAMERA_Z = 22;
const FOV = 42;
// Keep 40% of the original v21 pointer travel on BOTH axes (60% reduction).
const POINTER_STRENGTH = .4;
const ART_WIDTH = 1536, ART_HEIGHT = 1024;
// Match the ground to the painted corridor at the actual tree/visitor baseline.
// The old arbitrary height made this pavement move twice as fast as the floor
// still visible in the distant painting around the tree bases.
const BACKGROUND_Z = artwork.find(cel => cel.id === 'distance').z;
const GROUND_JOIN_Y = 720;
const GROUND_DROP = (GROUND_JOIN_Y - ART_HEIGHT / 2) * (CAMERA_Z - BACKGROUND_Z) / CAMERA_Z;
const FLOOR_FADE = [700 / ART_HEIGHT, 712 / ART_HEIGHT];
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const isStanding = cel => !['distance', 'floor', 'gallery-left', 'gallery-right'].includes(cel.id)
  && cel.kind !== 'star' && cel.kind !== 'ivy';
const contactUV = cel => cel.contact || (cel.kind === 'shoppers' ? [.6, 488 / 512] : [.5, 1]);
const footLine = cel => cel.frame[1] + cel.frame[3] * contactUV(cel)[1];
const groundDepth = y => CAMERA_Z - GROUND_DROP * CAMERA_Z / (y - ART_HEIGHT / 2);
const layerDepth = cel => isStanding(cel) ? groundDepth(footLine(cel))
  : cel.kind === 'ivy' ? groundDepth(footLine(artwork.find(item => item.id === cel.id.replace('ivy', 'column'))))
  : cel.z;

// A multiplane camera: each illustrated cel is an independent, rigid plane.
// Its image-space rectangle is projected at its authored distance. There is
// no depth map, camera orbit, or deformation of any character/building.
// Only the pavement is laid horizontally, with a neutral-camera projection
// of the painting, so its real perspective follows the same ground contacts.
export async function createAtriumWorld(host) {
  const root = host.closest('[data-journey]');
  const renderer = new WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = NoToneMapping;
  renderer.setClearColor('#775269');
  renderer.domElement.setAttribute('aria-hidden', 'true');
  const scene = new Scene(), camera = new PerspectiveCamera(FOV, 1, .1, 100);
  camera.position.z = CAMERA_Z;
  const loader = new TextureLoader(), textures = [], planes = [], helpers = [];
  let disposed = false, lost = false, frame = 0, last = 0, time = 0, state, viewport = '', groundY = 0;
  const diagnostics = {
    source: 'wonderpop-atrium-v15.webp', technique: 'independent-transparent-planes',
    frames: 0, worldTime: 0, ambientFrame: 0, camera: [0, 0, CAMERA_Z],
    nearShift: 0, farShift: 0, layers: [],
  };
  const fallback = () => { host.dataset.renderer = 'fallback'; root.dataset.atriumRenderer = 'fallback'; };
  const release = () => {
    planes.forEach(({ mesh }) => { mesh.geometry.dispose(); mesh.material.dispose(); });
    helpers.forEach(mesh => { mesh.geometry.dispose(); mesh.material.dispose(); });
    textures.forEach(texture => texture.dispose());
    renderer.dispose();
    renderer.domElement.remove();
  };
  try {
    const load = async name => {
      const texture = await loader.loadAsync('/image/journey/' + name);
      texture.colorSpace = SRGBColorSpace;
      textures.push(texture);
      return texture;
    };
    const [repairResult, ...loaded] = await Promise.allSettled([
      load(groundRepair.file), ...artwork.map(async cel => ({ cel, painting: await load(cel.file) })),
    ]);
    if (repairResult.status === 'rejected' || loaded.some(result => result.status === 'rejected')) throw new Error('Incomplete atrium layers');
    loaded.forEach(result => {
      const { cel, painting } = result.value;
      const [sx, sy, sw, sh] = cel.sourceRect;
      const material = new ShaderMaterial({
        transparent: true, depthWrite: false,
        uniforms: {
          painting: { value: painting },
          repairPainting: { value: repairResult.value },
          repairEnabled: { value: cel.id === 'distance' || cel.kind === 'floor' ? 1 : 0 },
          repairLeft: { value: groundRepair.patches[0] },
          repairRight: { value: groundRepair.patches[1] },
          repairFeather: { value: groundRepair.feather },
          clock: { value: 0 }, pose: { value: 0 },
          floorFade: { value: FLOOR_FADE },
          kind: { value: cel.kind === 'floor' ? 1 : cel.kind === 'shoppers' ? 2 : cel.kind === 'tree' ? 3 : cel.kind === 'star' ? 4 : 0 },
          sourceRect: { value: [sx / ART_WIDTH, sy / ART_HEIGHT, sw / ART_WIDTH, sh / ART_HEIGHT] },
        },
        vertexShader: `attribute float imageDepth;varying vec3 imageUV;
          void main(){imageUV=vec3(uv*imageDepth,imageDepth);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
        fragmentShader: `
          uniform sampler2D painting;
          uniform sampler2D repairPainting;
          uniform float repairEnabled, repairFeather;
          uniform vec4 repairLeft, repairRight;
          uniform float clock, pose, kind;
          uniform vec2 floorFade;
          uniform vec4 sourceRect;
          varying vec3 imageUV;
          vec3 repairGround(vec3 original,vec2 p,vec4 region,float offset){
            vec2 q=p*vec2(1536.,1024.)-region.xy;
            float edge=min(min(q.x,region.z-q.x),min(q.y,region.w-q.y));
            if(edge<=0.)return original;
            vec2 uv=vec2((q.x/region.z+offset)*.5,1.-q.y/region.w);
            return mix(original,texture2D(repairPainting,uv).rgb,smoothstep(0.,repairFeather,edge));
          }
          void main(){
            vec2 celUV=imageUV.xy/imageUV.z;
            vec2 sampleUV=celUV;
            if(kind>1.5&&kind<2.5)sampleUV.x=(clamp(celUV.x,.001,.999)+pose)/3.;
            vec4 color=texture2D(painting,sampleUV);
            if(color.a<.004)discard;
            if(kind>1.5&&kind<2.5)color.a=smoothstep(.14,.8,color.a);
            vec2 p=sourceRect.xy+vec2(celUV.x,1.-celUV.y)*sourceRect.zw;
            if(repairEnabled>.5){
              color.rgb=repairGround(color.rgb,p,repairLeft,0.);
              color.rgb=repairGround(color.rgb,p,repairRight,1.);
            }
            if(kind>.5&&kind<1.5)color.a*=smoothstep(floorFade.x,floorFade.y,p.y);
            if(kind>2.5){
              float warm=smoothstep(.45,.9,color.r)*smoothstep(.2,.55,color.g)*(1.-smoothstep(.45,.85,color.b));
              color.rgb+=vec3(1.,.53,.15)*warm*(.014+.013*sin(clock*1.25+p.x*35.));
            }
            gl_FragColor=color;
            #include <colorspace_fragment>
          }`,
      });
      const mesh = new Mesh(new PlaneGeometry(1, 1), material);
      mesh.geometry.setAttribute('imageDepth', new Float32BufferAttribute([1, 1, 1, 1], 1));
      mesh.name = cel.id;
      mesh.renderOrder = planes.length;
      mesh.frustumCulled = false;
      scene.add(mesh);
      const report = { id: cel.id, asset: cel.file, z: layerDepth(cel), vertices: 4, projected: [], shift: [0, 0], grounded: isStanding(cel), floorPlane: cel.kind === 'floor' };
      let cord, contact;
      if (cel.kind === 'star') {
        cord = new Mesh(new PlaneGeometry(1, 1), new MeshBasicMaterial({ color: '#c49348', transparent: true, opacity: .9, depthWrite: false }));
        cord.renderOrder = mesh.renderOrder - .1;
        scene.add(cord); helpers.push(cord);
      }
      if (cel.kind === 'shoppers') {
        contact = new Mesh(new PlaneGeometry(1, 1), new ShaderMaterial({
          transparent: true, depthWrite: false,
          vertexShader: 'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
          fragmentShader: `varying vec2 v;void main(){vec2 p=vec2(v.x,1.-v.y);
            vec2 mother=(p-vec2(.49,.953125))/vec2(.105,.009),child=(p-vec2(.71,.953125))/vec2(.075,.007);
            float a=.26*exp(-dot(mother,mother)*1.8)+.21*exp(-dot(child,child)*1.8);
            gl_FragColor=vec4(.13,.075,.16,a);}`,
        }));
        contact.renderOrder = mesh.renderOrder - .1;
        scene.add(contact); helpers.push(contact);
      }
      planes.push({ cel, mesh, cord, contact, report, origin: new Vector3(), neutral: [] });
      diagnostics.layers.push(report);
    });
    host.atriumDiagnostics = diagnostics;
    function resize() {
      const width = host.clientWidth, height = host.clientHeight;
      if (!width || !height || viewport === `${width}:${height}`) return;
      viewport = `${width}:${height}`;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      const referenceHeight = 2 * Math.tan(FOV * Math.PI / 360) * CAMERA_Z;
      // Bleed around all four edges remains covered even at the pointer limits.
      const artHeight = Math.max(referenceHeight, referenceHeight * camera.aspect / 1.5) * 1.075;
      const unit = artHeight / ART_HEIGHT;
      const pixelUnit = height / referenceHeight;
      groundY = -GROUND_DROP * unit;
      planes.forEach(plane => {
        const { cel, mesh, cord, contact, origin } = plane;
        const [x, y, w, h] = cel.frame;
        const z = layerDepth(cel);
        const distanceScale = (CAMERA_Z - z) / CAMERA_Z;
        if (cel.kind === 'floor') {
          // Ray-project the original rectangle onto the horizontal ground.
          // Four vertices suffice; the neutral camera reproduces the painting
          // exactly, and a moved camera gives physically consistent parallax.
          const positions = mesh.geometry.attributes.position;
          const depths = mesh.geometry.attributes.imageDepth;
          [[x, y], [x + w, y], [x, y + h], [x + w, y + h]].forEach(([px, py], i) => {
            const depth = groundDepth(py), scale = (CAMERA_Z - depth) / CAMERA_Z;
            positions.setXYZ(i, (px - ART_WIDTH / 2) * unit * scale, groundY, depth);
            depths.setX(i, CAMERA_Z - depth);
          });
          positions.needsUpdate = depths.needsUpdate = true;
          mesh.geometry.computeBoundingSphere();
          mesh.position.set(0, 0, 0); mesh.scale.set(1, 1, 1);
          plane.neutral = [width / 2 + (x - ART_WIDTH / 2) * unit * pixelUnit,
            height / 2 + (y - ART_HEIGHT / 2) * unit * pixelUnit];
          return;
        }
        mesh.scale.set(w * unit * distanceScale, h * unit * distanceScale, 1);
        origin.set((x + w / 2 - ART_WIDTH / 2) * unit * distanceScale,
          (ART_HEIGHT / 2 - y - h / 2) * unit * distanceScale, z);
        if (cord) {
          const bodyCenter = cel.id === 'star-center' ? .66 : .62;
          const naturalCenter = height / 2 + (y + h * bodyCenter - ART_HEIGHT / 2) * unit * pixelUnit;
          const desiredCenter = cel.id === 'star-center' ? clamp(height * .19, 153, 225) : clamp(height * .135, 114, 175);
          const drop = Math.max(0, desiredCenter - naturalCenter);
          origin.y -= drop / pixelUnit * distanceScale;
          const top = origin.y + mesh.scale.y / 2;
          const ceiling = referenceHeight * distanceScale * .65;
          cord.scale.set(unit * distanceScale * 1.4, Math.max(.001, ceiling - top + .006), 1);
          cord.position.set(origin.x, (ceiling + top) / 2, z);
          plane.cordOrigin = cord.position.clone();
          plane.report.bodyCenterY = naturalCenter + drop;
        }
        mesh.position.copy(origin);
        if (contact) { contact.scale.copy(mesh.scale); contact.position.copy(origin); }
        plane.neutral = [width / 2 + (origin.x - mesh.scale.x / 2) / distanceScale * pixelUnit,
          height / 2 - (origin.y + mesh.scale.y / 2) / distanceScale * pixelUnit];
      });
    }
    const active = () => state && !state.reduced && state.progress >= .79 && state.progress < 1.075 && !document.hidden && !disposed && !lost;
    const point = new Vector3(), support = new Vector3();
    function tick(now) {
      frame = 0;
      if (!active()) { last = 0; return; }
      const dt = last ? Math.min((now - last) / 1000, .05) : 0;
      last = now; time += dt;
      resize();
      const x = clamp(parseFloat(root.style.getPropertyValue('--look-x')) || 0, -10, 10);
      const y = clamp(parseFloat(root.style.getPropertyValue('--look-y')) || 0, -6, 6);
      // Parallel translation preserves every cel's drawing and straight lines.
      // Root pointer coordinates are already eased and disabled for touch.
      const response = 1 - Math.exp(-dt / .12);
      camera.position.x += (-x * .095 * POINTER_STRENGTH - camera.position.x) * response;
      camera.position.y += (y * .048 * POINTER_STRENGTH - camera.position.y) * response;
      camera.updateMatrixWorld();
      // Existing v19 drawings: look, point, wave, point, rest. Their packed
      // foot baseline is identical, and scroll never drives their cadence.
      const gesture = time % 8.8;
      const pose = gesture < 2.9 ? 0 : gesture < 4.6 ? 1 : gesture < 6.2 ? 2 : gesture < 6.9 ? 1 : 0;
      planes.forEach(({ cel, mesh, cord, cordOrigin, contact, origin, neutral, report }) => {
        mesh.position.copy(origin);
        if (cord) cord.position.copy(cordOrigin);
        if (contact) contact.position.copy(mesh.position);
        mesh.material.uniforms.clock.value = time;
        mesh.material.uniforms.pose.value = pose;
        mesh.updateMatrixWorld();
        const projected = [];
        for (const [i, [px, py]] of [[-.5, -.5], [.5, .5]].entries()) {
          if (cel.kind === 'floor') point.fromBufferAttribute(mesh.geometry.attributes.position, i === 0 ? 2 : 1);
          else point.set(px, py, 0);
          point.applyMatrix4(mesh.matrixWorld).project(camera);
          projected.push((point.x + 1) * host.clientWidth / 2, (1 - point.y) * host.clientHeight / 2);
        }
        report.projected = projected;
        report.shift = [projected[0] - neutral[0], projected[3] - neutral[1]];
        if (isStanding(cel)) {
          const [cx, cy] = contactUV(cel);
          point.set(cx - .5, .5 - cy, 0).applyMatrix4(mesh.matrixWorld);
          support.set(point.x, groundY, point.z).project(camera);
          point.project(camera);
          report.footY = (1 - point.y) * host.clientHeight / 2;
          report.footX = (1 + point.x) * host.clientWidth / 2;
          report.contactUV = [cx, cy];
          const floorT = clamp((footLine(cel) / ART_HEIGHT - FLOOR_FADE[0]) / (FLOOR_FADE[1] - FLOOR_FADE[0]), 0, 1);
          report.visibleFloorOpacity = floorT * floorT * (3 - 2 * floorT);
          report.contactError = Math.hypot((point.x - support.x) * host.clientWidth / 2, (point.y - support.y) * host.clientHeight / 2);
          report.floorContact = [(support.x + 1) * host.clientWidth / 2, (1 - support.y) * host.clientHeight / 2];
          if (cel.kind === 'shoppers') report.pose = pose;
        }
      });
      diagnostics.frames++; diagnostics.worldTime = time; diagnostics.ambientFrame = pose;
      diagnostics.camera = camera.position.toArray();
      diagnostics.farShift = diagnostics.layers[0].shift[0];
      diagnostics.nearShift = diagnostics.layers.at(-1).shift[0];
      renderer.render(scene, camera);
      host.dataset.renderer = 'webgl'; root.dataset.atriumRenderer = 'webgl';
      frame = requestAnimationFrame(tick);
    }
    function resume() { if (active() && !frame) frame = requestAnimationFrame(tick); }
    function lose(event) { event.preventDefault(); lost = true; cancelAnimationFrame(frame); frame = 0; fallback(); }
    function restore() { lost = false; last = 0; resume(); }
    renderer.domElement.addEventListener('webglcontextlost', lose);
    renderer.domElement.addEventListener('webglcontextrestored', restore);
    document.addEventListener('visibilitychange', resume);
    host.appendChild(renderer.domElement);
    return {
      update(next) { state = next; if (next.reduced) fallback(); resume(); },
      dispose() {
        disposed = true; cancelAnimationFrame(frame);
        document.removeEventListener('visibilitychange', resume);
        renderer.domElement.removeEventListener('webglcontextlost', lose);
        renderer.domElement.removeEventListener('webglcontextrestored', restore);
        release(); delete host.atriumDiagnostics; fallback();
      },
    };
  } catch (error) { release(); fallback(); throw error; }
}
