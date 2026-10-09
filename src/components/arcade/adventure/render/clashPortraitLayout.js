import {hexyMuzzle} from '../actors/hexy/hexyAnimation';
import {ultimateHand} from '../actors/bosses/harlequinUltimate';
import {duelSide} from './duelCutinCanvas';
// Reserve the actual ray corridor and the actor's silhouette, in screen space.
// This also covers swapped sides and air casts; there is no fixed upper overlay.
export function clashPortraitLayout(s,boss){
 const right=duelSide(s,boss),actor=boss?s.boss:s.player,z=s.camera.zoom||1;
 const screen=p=>({x:(p.x-s.camera.x)*z,y:(p.y-s.camera.y)*z});
 const a=screen(hexyMuzzle(s)),b=screen(ultimateHand(s.boss,false)),x=right?670:8;
 const at=x=>a.y+(b.y-a.y)*Math.max(0,Math.min(1,(x-a.x)/(b.x-a.x||1)));
 const near=[at(x),at(x+282)],feet=screen(actor).y,head=feet-(boss?185:106)*z;
 const topEnd=Math.min(head-18,Math.min(...near)-64),bottomStart=Math.max(feet+20,Math.max(...near)+64);
 const topSpace=Math.max(0,topEnd-74),bottomSpace=Math.max(0,502-bottomStart),below=bottomSpace>topSpace;
 const h=Math.max(40,Math.min(206,below?bottomSpace:topSpace)),w=h*1.39,y=below?502-h:74;
 return{right,x:right?952-w:8,y,w,h,below};
}
