import {clashContact} from '../engine/adventurePowerClash';
import {superMangaActive,MANGA_IMPACT_DURATION} from '../engine/adventureSuperTiming';
import {inkMangaFrame} from './mangaImpactFrame';
const clamp=n=>Math.max(0,Math.min(1,n));
let backdrop,manga;

// The contact burst happens once, on arrival. Holding the clash does not
// retrigger a full-screen flash or the opening shock wave.
export function clashImpactTiming(q,reduced=false){
 if(q?.kind==='nightmare'){
  const age=q.impactAge??99,active=['contest','boss-boost','hexy-boost','resolve','flight'].includes(q.state);
  return{heat:0,burst:active?clamp(1-age/.18):0,shock:active?clamp(1-age/.72):0,manga:active&&!reduced?clamp((MANGA_IMPACT_DURATION-age)/.04):0};
 }
 if(!q||!['contest','resolve','flight'].includes(q.state))return{heat:0,burst:0,shock:0,manga:0};
 const heat=q.state==='flight'?1-clamp(q.age/.45):.78+clamp((.5-q.pressure)*2)*.22;
 const first=q.state==='contest'&&!reduced;
 return{heat,burst:first?clamp(1-q.age/.18):0,shock:first?clamp(1-q.age/.72):0,manga:first?clamp((MANGA_IMPACT_DURATION-q.age)/.04):0};
}

export function drawMangaClashImpact(c,s,reduced=false){
 const ink=clashImpactTiming(s.powerClash,reduced).manga;if(!ink)return;
 drawMangaFrame(c,ink,s.powerClash?.kind==='nightmare'&&s.powerClash.impactCause==='explosion');
}

export function superMangaTiming(s,reduced=false){
 // A duel gets its impact cels only when the two beams actually meet.
 return superMangaActive(s,reduced)?1:0;
}
export function drawSuperMangaImpact(c,s,reduced=false){
 if(superMangaTiming(s,reduced))drawMangaFrame(c,1,true);
}
function drawMangaFrame(c,ink,textured=false){
 manga??=new OffscreenCanvas(960,540);
 const b=manga.getContext('2d',{willReadFrequently:true});
 b.drawImage(c.canvas,0,0,960,540);
 const pixels=b.getImageData(0,0,960,540),data=pixels.data;
 // A few actual black/white impact cels, not a desaturated grey overlay.
 // This is a screen treatment of the existing drawings, not replacement art.
 if(textured)inkMangaFrame(pixels);
 else for(let i=0;i<data.length;i+=4){const v=data[i]*.2126+data[i+1]*.7152+data[i+2]*.0722>83?255:8;data[i]=data[i+1]=data[i+2]=v;}
 b.putImageData(pixels,0,0);c.save();c.globalAlpha=ink;c.drawImage(manga,0,0,960,540);c.restore();
}

// Capture only the scenery. Neither the world actors nor the portrait cut-ins
// enter this buffer, so heat and radial recoil cannot smear their expressions.
export function drawClashHeatBackdrop(c,s,paint,reduced=false){
 const timing=clashImpactTiming(s.powerClash,reduced);
 if(!timing.heat||reduced){paint(c);return;}
 backdrop??=new OffscreenCanvas(960,540);
 const b=backdrop.getContext('2d');b.clearRect(0,0,960,540);paint(b);
 c.save();
 for(let y=0;y<540;y+=12){
  const strength=Math.sin(Math.min(1,y/500)*Math.PI)*timing.heat;
  const dx=(Math.sin(y*.052+s.fxTime*6.4)+Math.sin(y*.019-s.fxTime*4.7))*.95*strength;
  c.drawImage(backdrop,0,y,960,Math.min(12,540-y),dx,y,960,Math.min(12,540-y));
 }
 if(timing.burst>0){
  const h=clashContact(s),z=s.camera.zoom||1,x=(h.x-s.camera.x)*z,y=(h.y-s.camera.y)*z;
  c.globalCompositeOperation='screen';
  for(let i=1;i<=3;i++){
   const zoom=1+i*.019*timing.burst;
   c.globalAlpha=.075*timing.burst;c.drawImage(backdrop,x*(1-zoom),y*(1-zoom),960*zoom,540*zoom);
  }
 }
 c.restore();
}

function cell(c,img,frame,x,y,w,h,alpha=1,angle=0){
 if(!img||alpha<=0)return;c.save();c.globalAlpha*=alpha;c.translate(x,y);c.rotate(angle);
 c.drawImage(img,frame%4*384,Math.floor(frame/4)*384,384,384,-w/2,-h/2,w,h);c.restore();
}

export function drawAnimeClashContact(c,s,art,h,reduced=false){
 const q=s.powerClash,img=art['duel-contact-shock'];if(!q||!img)return;
 const age=q.age,first=q.state==='contest'&&age<.72;
 if(reduced){cell(c,img,2,h.x,h.y,260,260,.85);return;}
 if(first){
  const t=clamp(age/.72),frame=Math.min(11,Math.floor(t*12));
  // Broad translucent sphere travels OUT from the initial brilliant nucleus.
  const size=210+660*(1-Math.pow(1-t,2));
  cell(c,img,frame,h.x,h.y,size,size*.92,Math.pow(1-t,.7)*.95);
  cell(c,img,1,h.x,h.y,190+85*Math.sin(t*Math.PI),190+85*Math.sin(t*Math.PI),clamp(1-age/.32));
 }else{
  const phase=(s.fxTime*12)%4,frame=4+Math.floor(phase),size=235+(q.tapPulse>0?24:0);
  cell(c,img,frame,h.x,h.y,size,size,.87,s.fxTime*.32);
 }
}
