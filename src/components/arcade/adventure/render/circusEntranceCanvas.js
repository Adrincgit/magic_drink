import {drawWindCloth} from './windClothCanvas';
import {drawHarborBackdrop} from './adventureHarborCanvas';
import {drawRiverWater,drawRiverBridge,drawRiverPierWater} from './adventureRiverCanvas';
import {circusEntryFade,outsideCircus} from '../engine/adventureCircusEntrance';
import {drawCampBackdrop,drawCampForecourt} from './circusCampCanvas';

// Both chapters use the exact same facade and measured painted threshold.
// It belongs to the walking plane, never a camera-following foreground layer.
export function circusFacadePlacement(s,img){
 const q=s.level.circusArrival||s.level.circusEntrance;
 const w=q.width,h=w*img.height/img.width;
 return{x:q.doorX-w/2,y:q.floor-h*930/1024,w,h};
}
export function drawCircusFacade(c,s,art,reduced=false){
 const img=art['grand-ring-exterior'],q=circusFacadePlacement(s,img);
 if(q.x+q.w<s.camera.x||q.x>s.camera.x+960/(s.camera.zoom||1))return;
 drawWindCloth(c,img,q.x,q.y,q.w,q.h,s.fxTime,{windArt:art,flags:[[.504,.03,.115,.09],[.174,.31,.061,.067],[.834,.31,.062,.069]],reduced});
}
export function drawCircusOutsideBackdrop(c,s,art,reduced){
 if(s.level.circusCamp){drawCampBackdrop(c,s,art,reduced);return;}
 // Carry the waterfront's distant view through the chapter cut. Only the
 // distant landscape uses parallax; tent, lamps and threshold remain rooted.
 const camera={...s.camera,x:s.camera.x+16340,backdropY:90};
 drawHarborBackdrop(c,{...s,camera,level:{...s.level,width:16680}},art,reduced);
}
export function drawCircusWalkway(c,deck,art,doorX){
 // The railing has a real opening at the threshold. Keep the deck and its
 // supports continuous beneath it, using the same painted pier geometry.
 c.save();c.beginPath();c.rect(deck.x-40,deck.y-120,deck.w+80,400);
 c.rect(doorX-72,deck.y-120,144,120);c.clip('evenodd');
 drawRiverBridge(c,deck,art);c.restore();
}
export function drawCircusForecourt(c,s,art,reduced){
 if(s.level.circusCamp){drawCampForecourt(c,s,art,reduced);return;}
 const deck=s.level.circusEntrance.deck;
 const exterior={...s,platforms:[deck],level:{...s.level,harborRoute:true,rivers:[{x:deck.x,w:deck.w,y:deck.y+62}]}};
 drawRiverWater(c,exterior,art,reduced);
 drawRiverPierWater(c,exterior,art,reduced,'back');
 drawCircusFacade(c,s,art,reduced);drawCircusWalkway(c,deck,art,s.level.circusEntrance.doorX);drawRiverPierWater(c,exterior,art,reduced);
 const lamp=art['harbor-lantern'],h=172,w=h*lamp.width/lamp.height;
 for(const x of [-1120,-700])c.drawImage(lamp,x-w/2,deck.y+8-h,w,h);
}
export function drawCircusTransition(c,s){
 const alpha=s.clear?.arrivalFade||circusEntryFade(s);if(!alpha)return;
 c.save();c.globalAlpha=alpha;c.fillStyle='#110e1b';c.fillRect(0,0,960,540);c.restore();
}
export {outsideCircus};
