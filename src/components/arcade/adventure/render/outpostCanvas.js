import {OUTPOST_SIZE,outpostFrame} from '../actors/enemies/adventureOutposts';
// The fourth cel turns the structure sideways. Both live states use only the
// three frontal drawings, moving cloth and flags while the tent stays upright.
export const outpostWindFrame=(time,x=0,reduced=false)=>reduced?0:[0,1,2,1][((Math.floor((time+x*.0013)*6)%4)+4)%4];

export function outpostDrawing(q,time,reduced=false){
 const state=outpostFrame(q);
 if(q.hp>q.maxHp/2&&state!==1)return{key:'outpost-wind-painted',frame:(state===2?4:0)+outpostWindFrame(time,q.x,reduced)};
 return{key:'clown-outpost',frame:state};
}
export function drawOutpost(c,s,q,art,reduced=false){
 const drawing=outpostDrawing(q,s.fxTime,reduced),img=art[drawing.key];
 c.drawImage(img,drawing.frame%4*256,Math.floor(drawing.frame/4)*256,256,256,q.x-OUTPOST_SIZE/2,q.y+5-OUTPOST_SIZE*250/256,OUTPOST_SIZE,OUTPOST_SIZE);
}
