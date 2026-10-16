// Twelve painted phases form one complete axial turn. The glow and the meter
// sample the same phase as the main beam, including the standalone ultimate.
export const DUEL_BEAM_FRAMES=12;
export const DUEL_BEAM_FPS=24;
export function duelBeamPhase(age,reduced=false){return reduced?2:((age*DUEL_BEAM_FPS)%DUEL_BEAM_FRAMES+DUEL_BEAM_FRAMES)%DUEL_BEAM_FRAMES;}
const buffers=new WeakMap();
export function drawDuelBeamTexture(c,img,phase,x,y,w,h,portion=1){
 if(!img||portion<=0)return;
 let cached=buffers.get(img);
 if(!cached){cached={canvas:new OffscreenCanvas(1024,256),phase:-1};buffers.set(img,cached);}
 if(cached.phase!==phase){
  const p=cached.canvas.getContext('2d'),base=Math.floor(phase)%DUEL_BEAM_FRAMES,mix=phase-Math.floor(phase);
  p.clearRect(0,0,1024,256);p.globalCompositeOperation='source-over';p.globalAlpha=1-mix;
  p.drawImage(img,0,base*256,1024,256,0,0,1024,256);
  if(mix){p.globalCompositeOperation='lighter';p.globalAlpha=mix;p.drawImage(img,0,((base+1)%DUEL_BEAM_FRAMES)*256,1024,256,0,0,1024,256);}
  p.globalCompositeOperation='source-over';p.globalAlpha=1;cached.phase=phase;
 }
 c.drawImage(cached.canvas,0,0,1024*portion,256,x,y,w,h);
}
