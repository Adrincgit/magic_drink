import { WebGLRenderer, Scene, PerspectiveCamera, PlaneGeometry, Mesh, ShaderMaterial, TextureLoader, SRGBColorSpace, NoToneMapping, DoubleSide } from 'three';
const clamp = n => Math.max(0, Math.min(1, n));
const smooth = (a,b,n) => { const t=clamp((n-a)/(b-a)); return t*t*(3-2*t); };

// Author depth in the coordinates of the original painting. Nothing walks
// across it. Shared vertices between twelve depth bands prevent torn edges.
export function illustrationDepth(u,v,kind='atrium') {
  const side=Math.abs(u-.5)*2;
  if(kind!=='atrium') return .25+3.7*Math.max(smooth(.48,.92,v),smooth(.73,1,side)*.72);
  const walls=smooth(.11,.94,side)*.92, floor=smooth(.64,1,v);
  const ceiling=smooth(.52,0,v)*(.15+side*.6);
  const treeL=Math.exp(-(((u-.37)/.065)**4+((v-.54)/.16)**4))*.43;
  const treeR=Math.exp(-(((u-.62)/.07)**4+((v-.54)/.16)**4))*.43;
  return .2+4.5*Math.max(walls,floor,ceiling,treeL,treeR);
}
export async function createIllustrationWorld(host,options={}) {
  const {source='wonderpop-atrium-v15.webp',gesture='atrium-gesture-v20.webp',kind='atrium',from=.79,to=1.075}=options;
  const root=host.closest('[data-journey]');
  const renderer=new WebGLRenderer({antialias:true,alpha:false,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
  renderer.outputColorSpace=SRGBColorSpace; renderer.toneMapping=NoToneMapping;
  renderer.domElement.setAttribute('aria-hidden','true');
  const scene=new Scene(), camera=new PerspectiveCamera(42,1,.1,40);
  const loader=new TextureLoader(), textures=[], geometry=new PlaneGeometry(1,1,168,112);
  let material, frame=0, state, last=0, time=0, disposed=false, lost=false, size='';
  const fallback=()=>{host.dataset.renderer='fallback';if(kind==='atrium')root.dataset.atriumRenderer='fallback';};
  try {
    const loaded=await Promise.allSettled([source,gesture||source].map(async name=>{
      const t=await loader.loadAsync('/image/journey/'+name);t.colorSpace=SRGBColorSpace;textures.push(t);return t;
    }));
    if(loaded[0].status!=='fulfilled')throw new Error('Illustration unavailable');
    const base=loaded[0].value, alternate=loaded[1].status==='fulfilled'?loaded[1].value:base;
    material=new ShaderMaterial({
      uniforms:{painting:{value:base},alternate:{value:alternate},pose:{value:0},clock:{value:0},kind:{value:kind==='atrium'?0:kind==='interview'?2:kind==='lounge'?3:1}},
      vertexShader:'varying vec2 imageUV;void main(){imageUV=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
      fragmentShader:`
        uniform sampler2D painting,alternate;uniform float pose,clock,kind;varying vec2 imageUV;
        float box(vec2 p,vec2 lo,vec2 hi){vec2 a=smoothstep(lo,lo+.009,p);vec2 b=1.-smoothstep(hi-.009,hi,p);return a.x*a.y*b.x*b.y;}
        void main(){
          vec2 p=vec2(imageUV.x,1.-imageUV.y);
          vec4 color=texture2D(painting,imageUV);
          float people=kind<.5?box(p,vec2(.87,.57),vec2(.978,.813)):kind>2.5?box(p,vec2(.35,.34),vec2(.985,.79)):kind>1.5?box(p,vec2(.58,.16),vec2(.885,.67)):0.;
          color=mix(color,texture2D(alternate,imageUV),people*pose);
          float glow=0.;
          if(kind<.5){
            glow+=exp(-length((p-vec2(.495,.135))*vec2(1.,1.5))*82.);
            glow+=exp(-length((p-vec2(.234,.18))*vec2(1.,1.5))*115.);
            glow+=exp(-length((p-vec2(.766,.18))*vec2(1.,1.5))*115.);
          }else{glow=exp(-length((p-vec2(.83,.13))*vec2(1.,1.5))*40.);}
          color.rgb+=vec3(1.,.62,.2)*glow*(.06+.035*sin(clock*1.1));
          gl_FragColor=color;
          #include <colorspace_fragment>
        }`,
      side:DoubleSide,
    });
    const uv=geometry.attributes.uv,pos=geometry.attributes.position;
    const bands=Array.from({length:12},()=>[]),indices=geometry.index.array;
    for(let i=0;i<indices.length;i+=3){
      const u=(uv.getX(indices[i])+uv.getX(indices[i+1])+uv.getX(indices[i+2]))/3;
      const v=1-(uv.getY(indices[i])+uv.getY(indices[i+1])+uv.getY(indices[i+2]))/3;
      const band=Math.min(11,Math.floor(illustrationDepth(u,v,kind)/4.71*12));
      bands[band].push(indices[i],indices[i+1],indices[i+2]);
    }
    geometry.clearGroups();let offset=0;
    bands.forEach((band,i)=>{geometry.addGroup(offset,band.length,i);offset+=band.length;});
    geometry.setIndex(bands.flat());
    const mesh=new Mesh(geometry,Array(12).fill(material));mesh.frustumCulled=false;scene.add(mesh);
    const diagnostic={source,kind,depthBands:bands.filter(b=>b.length).length,camera:[],frames:0,ambientFrame:0,nearShift:0,farShift:0,worldTime:0};
    host.illustrationDiagnostics=diagnostic;
    if(kind==='atrium')host.atriumDiagnostics=diagnostic;
    function resize(){
      const w=host.clientWidth,h=host.clientHeight;if(!w||!h||size===w+':'+h)return;
      size=w+':'+h;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
      const viewH=2*Math.tan(21*Math.PI/180)*12;
      const artH=Math.max(viewH,viewH*camera.aspect/1.5)*1.035;
      for(let i=0;i<pos.count;i++){
        const u=uv.getX(i),v=1-uv.getY(i),z=illustrationDepth(u,v,kind),projection=1-z/12;
        pos.setXYZ(i,(u-.5)*artH*1.5*projection,(.5-v)*artH*projection,z);
      }
      pos.needsUpdate=true;
    }
    const active=()=>state&&!state.reduced&&state.progress>=from&&state.progress<to&&!document.hidden&&!disposed&&!lost;
    function tick(now){
      frame=0;if(!active()){last=0;return;}
      const dt=last?Math.min((now-last)/1000,.05):0;last=now;time+=dt;resize();
      const x=parseFloat(root.style.getPropertyValue('--look-x'))||0,y=parseFloat(root.style.getPropertyValue('--look-y'))||0;
      camera.position.set(-x*.032,y*.025,12);camera.lookAt(-x*.012,y*.009,0);
      const moment=Math.floor(time*1.3)%8;
      const pose=kind==='interview' ? Number(host.closest('[data-world-scene]')?.dataset.pose || 0) : gesture&&(moment===3||moment===4)?1:0;
      material.uniforms.pose.value=pose;material.uniforms.clock.value=time;
      diagnostic.frames++;diagnostic.ambientFrame=pose;diagnostic.worldTime=time;
      diagnostic.camera=camera.position.toArray();diagnostic.nearShift=camera.position.x/7.3;diagnostic.farShift=camera.position.x/11.8;
      renderer.render(scene,camera);host.dataset.renderer='webgl';if(kind==='atrium')root.dataset.atriumRenderer='webgl';
      frame=requestAnimationFrame(tick);
    }
    function resume(){if(active()&&!frame)frame=requestAnimationFrame(tick);}
    function lose(e){e.preventDefault();lost=true;cancelAnimationFrame(frame);frame=0;fallback();}
    function restore(){lost=false;resume();}
    renderer.domElement.addEventListener('webglcontextlost',lose);
    renderer.domElement.addEventListener('webglcontextrestored',restore);
    document.addEventListener('visibilitychange',resume);host.appendChild(renderer.domElement);
    return {
      update(next){state=next;if(next.reduced)fallback();resume();},
      dispose(){
        disposed=true;cancelAnimationFrame(frame);document.removeEventListener('visibilitychange',resume);
        renderer.domElement.removeEventListener('webglcontextlost',lose);renderer.domElement.removeEventListener('webglcontextrestored',restore);
        geometry.dispose();material.dispose();textures.forEach(t=>t.dispose());renderer.dispose();renderer.domElement.remove();
        delete host.atriumDiagnostics;delete host.illustrationDiagnostics;fallback();
      },
    };
  }catch(e){geometry.dispose();material?.dispose();textures.forEach(t=>t.dispose());renderer.dispose();fallback();throw e;}
}
export const createAtriumWorld=host=>createIllustrationWorld(host);
