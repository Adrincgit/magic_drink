export const MEADOW_PLANES=[{key:'distant-valley',speed:.12,y:-58,height:610,vertical:.09},{key:'rolling-hills',speed:.32,y:52,height:520,vertical:.18}];
// One panorama covers the chapter. Crossfading repeated silhouettes made solid
// terrain translucent at the joins. Keep each painted plane opaque instead.
export function meadowPlanePlacement(img,camera,plane,levelWidth=4400){
 const width=Math.max(plane.height*img.width/img.height,960+Math.max(0,levelWidth-960)*plane.speed+2);
 return{x:-camera.x*plane.speed,y:plane.y-camera.y*plane.vertical,width,height:plane.height};
}
export function paintMeadowPlane(c,img,camera,plane,levelWidth){
 const p=meadowPlanePlacement(img,camera,plane,levelWidth);
 c.save();c.globalAlpha=1;c.drawImage(img,p.x,p.y,p.width,p.height);c.restore();
}
