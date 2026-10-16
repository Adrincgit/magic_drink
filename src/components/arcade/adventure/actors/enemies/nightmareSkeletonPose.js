const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
const mix=(a,b,t)=>a+(b-a)*t;
const pointMix=(a,b,t)=>({x:mix(a.x,b.x,t),y:mix(a.y,b.y,t)});
const mod=n=>((n%1)+1)%1;
// Solve fixed-length limbs. Clamping the target, rather than only the cosine,
// keeps a reaching hand from stretching its forearm or separating a joint.
export function skeletonLimb(a,target,upper,lower,bend=-1){
 const dx=target.x-a.x,dy=target.y-a.y,raw=Math.hypot(dx,dy)||1,d=clamp(raw,Math.abs(upper-lower)+.01,upper+lower-.01),ux=dx/raw,uy=dy/raw;
 const along=(upper*upper-lower*lower+d*d)/(2*d),across=Math.sqrt(Math.max(0,upper*upper-along*along));
 return{a,joint:{x:a.x+ux*along+bend*uy*across,y:a.y+uy*along-bend*ux*across},end:{x:a.x+ux*d,y:a.y+uy*d}};
}
export function nightmareSkeletonPose(e,reduced=false){
 const walking=e.hp>0&&e.phase==='patrol',t=(reduced||!walking)?.18:mod(e.gait||0),phase=t*Math.PI*2;
 const pluck=e.phase==='pluck'?Math.sin(Math.PI*clamp(1-e.timer/.7))*.7:0;
 const hip={x:0,y:-62+Math.cos(phase*2)*.65};
 const shoulder={x:-3-pluck*3,y:hip.y-36};
 const angle=Math.atan2(shoulder.x-hip.x,hip.y-shoulder.y),up={x:Math.sin(angle),y:-Math.cos(angle)};
 const leg=offset=>{
  const a=mod(t+offset),swing=a>=.6,u=(a-.6)/.4,stride=e.walkStride||72,span=stride*.6;
  const target=walking?{x:swing?span/2-span*u:-span/2+stride*a,y:-8-(swing?Math.sin(Math.PI*u)*12:0)}:{x:offset?-11:11,y:-8};
  return{...skeletonLimb(hip,target,31,30,-1),swing,footAngle:swing?Math.sin(Math.PI*u)*.18:0};
 };
 const frontLeg=leg(0),backLeg=leg(.5),frontShoulder={x:shoulder.x-12*Math.cos(angle),y:shoulder.y-12*Math.sin(angle)},backShoulder={x:shoulder.x+12*Math.cos(angle),y:shoulder.y+12*Math.sin(angle)};
 const frontTarget={x:frontShoulder.x-7-frontLeg.end.x*.75,y:frontShoulder.y+39},backTarget={x:backShoulder.x-7-backLeg.end.x*.75,y:backShoulder.y+39};
 let wrist=frontTarget;
 const rib={x:-4,y:shoulder.y+18},pulled={x:-25,y:shoulder.y+15};
 if(e.phase==='pluck'){
  const u=clamp(1-e.timer/.7);wrist=u<.55?pointMix(frontTarget,rib,u/.55):pointMix(rib,pulled,(u-.55)/.45);
 }
 if(e.phase==='throw'){
  const u=clamp(1-e.timer/.65),raised={x:14,y:-122},extended={x:-46,y:-92};
  wrist=u<.65?pointMix(pulled,raised,Math.sin(u/.65*Math.PI/2)):pointMix(raised,extended,(u-.65)/.35);
 }
 const frontArm=skeletonLimb(frontShoulder,wrist,22,24,1),backArm=skeletonLimb(backShoulder,backTarget,22,24,1);
 return{hip,shoulder,angle,frontLeg,backLeg,frontArm,backArm,
  chest:{x:shoulder.x-up.x*16,y:shoulder.y-up.y*16},neck:{x:shoulder.x+up.x*5,y:shoulder.y+up.y*5},skull:{x:shoulder.x+up.x*17-7*Math.cos(angle),y:shoulder.y+up.y*17-7*Math.sin(angle)}};
}
export function skeletonThrowOrigin(e){const {frontArm}=nightmareSkeletonPose(e);return{x:e.x+frontArm.end.x*(e.dir>0?-1:1),y:e.y+frontArm.end.y};}
