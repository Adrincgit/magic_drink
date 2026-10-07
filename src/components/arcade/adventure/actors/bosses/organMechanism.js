// Shared by the painter and projectile origins. Units are world pixels.
import {organChargeSpeed} from './organCharge';
const clamp=t=>Math.max(0,Math.min(1,t));
const ease=t=>{t=clamp(t);return t*t*(3-2*t);};
export const organAnchor=s=>({x:s.boss.x,y:s.level.arena.y+5+(s.boss.hp>0?Math.sin((s.boss.clock||0)*6)*(Math.abs(s.boss.driveSpeed||0)>8?2:.6):0)});
export function organDrivePoint(d,q){return{x:d.x+(q.x-d.x)*d.sx+(q.y-d.y)*d.shear,y:d.y+(q.y-d.y)*d.sy};}
export function organDriveRect(d,r){const points=[[r.x,r.y],[r.x+r.w,r.y],[r.x,r.y+r.h],[r.x+r.w,r.y+r.h]].map(([x,y])=>organDrivePoint(d,{x,y})),xs=points.map(q=>q.x),ys=points.map(q=>q.y),x=Math.min(...xs),y=Math.min(...ys);return{x,y,w:Math.max(...xs)-x,h:Math.max(...ys)-y};}
export function organBassPreparing(s){const b=s.boss;return b.hp>0&&b.phase==='attack'&&b.shotClock<=.2&&(b.move==='organ-fanfare'?(b.volley||0)%2===1:['organ-bellows','organ-finale'].includes(b.move)&&(b.volley||0)%3===2);}
export function organMechanism(s,reduced=false){
 const b=s.boss,p=organAnchor(s),alive=b.hp>0;
 const progress=b.phase==='transform'?clamp((2.6-b.timer)/2.6):b.transformed?1:0;
 const deploy=ease((progress-.25)/.65),unlatch=ease(progress/.58);
 const release=alive?clamp((b.release||0)/.26):0;
 const recoil=Math.sin(release*Math.PI),breath=reduced||!alive?0:Math.sin((s.time||0)*4)*.055;
 const collapse=alive?0:ease((b.deadTime||0)/1.1);
 const body={x:p.x-170,y:p.y-349+collapse*23,w:340,h:299};
 const rev=b.move==='organ-charge'&&b.phase==='warn'?clamp(1-b.timer/(b.charge?.warning||1.3)):0;
 const drive={x:p.x,y:p.y-52,sx:1,sy:1,shear:0};
 if(!reduced&&alive&&b.charge&&b.move==='organ-charge'){
  const frame=[.75,1,.88][Math.floor((b.clock||0)*10)%3];
  if(b.phase==='warn'){const t=rev*frame;drive.sx+=t*.02;drive.sy-=t*.045;drive.shear=-t*.035;}
  else if(b.phase==='attack'){const t=clamp(-(b.driveSpeed||0)/organChargeSpeed(s))*frame;drive.sx+=t*.09;drive.sy-=t*.04;drive.shear=t*.075;}
  else if(b.phase==='recover'&&b.charge.returnAge<.28){const t=Math.sin(clamp(b.charge.returnAge/.28)*Math.PI)*frame;drive.sx-=t*.055;drive.sy+=t*.035;drive.shear=-t*.045;}
 }
 const pipeKick=b.move!=='organ-fanfare'?recoil*8:0;
 const pipes={x:p.x-90,y:p.y-402-deploy*50+collapse*105+pipeKick,w:184,h:208};
 // Measured centers of the three openings in the native-resolution pipe kit.
 const outlets=[[.194,.303],[.5,.104],[.818,.303]].map(([x,y])=>({x:pipes.x+x*pipes.w,y:pipes.y+y*pipes.h}));
 const bassPreparing=organBassPreparing(s),bassRelease=alive?clamp((b.bassRelease||0)/.08):0;
 const horns=[-125,-200,-275].map((y,i)=>{
  const kick=(b.move==='organ-fanfare'&&b.activeMouth===i?recoil*9:0)+(i===0?bassRelease*7:0);
  const h={x:p.x-204-deploy*15+kick,y:p.y+y-43+collapse*22,w:102,h:87};
  const pivot={x:h.x+h.w*.9,y:h.y+h.h*.5},rotation=i===0?-(bassRelease*.2+(bassRelease?0:bassPreparing?.12:0)):0;
  const offset=h.w*(.14-.9),mouth={x:pivot.x+offset*Math.cos(rotation),y:pivot.y+offset*Math.sin(rotation)};
  return{...h,pivot,rotation,mouth};
 });
 return{anchor:p,body,pipes,outlets,horns,drive,bassMouth:horns[0].mouth,bassPreparing,progress,deploy,unlatch,collapse,release,recoil,
  bellows:1+breath+recoil*(b.transformed?.13:.07),
  cover:{x:p.x-89,y:p.y-267+unlatch*175,w:178,h:136,rotation:unlatch*.8,alpha:b.armorBroken?0:1-ease((progress-.42)/.25)},
  wheels:[-108,108].map(x=>({x:p.x+x,y:p.y-52,w:108,angle:reduced?0:(b.x-(s.level.arena.right-345))/54+collapse*(x<0?-.25:.25)-rev*rev*Math.PI*16})),
 };
}
export const organPipes=s=>{const m=organMechanism(s);return m.outlets.map(q=>organDrivePoint(m.drive,q));};
export const organMouths=s=>{const m=organMechanism(s);return m.horns.map(q=>organDrivePoint(m.drive,q.mouth));};
export const organBassMouth=s=>{const m=organMechanism(s);return organDrivePoint(m.drive,m.bassMouth);};
