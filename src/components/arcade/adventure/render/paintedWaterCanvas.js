// The transparent centre of the painted C-shaped wake surrounds the timber.
const ARC_CENTRES=[[256,414],[258,420],[258,398],[257,409]];
export function waterArcPlacement(frame,x,y,w,h){
 const [cx,cy]=ARC_CENTRES[frame%4];return{x:x-cx/512*w,y:y-cy/512*h,w,h,cx,cy};
}
export function drawWaterArc(c,art,frame,x,y,w,h,side='all'){
 const img=art['pier-foam'],p=waterArcPlacement(frame,x,y,w,h);
 const top=side==='front'?p.cy:210,bottom=side==='back'?p.cy:512;
 c.drawImage(img,frame*512,top,512,bottom-top,p.x,p.y+top/512*h,w,(bottom-top)/512*h);
}
export function drawWaterDetail(c,art,row,frame,x,y,w,h=w,angle=0,alpha=1){
 const img=art['harbor-water-details'];c.save();c.globalAlpha*=alpha;c.translate(x,y);c.rotate(angle);
 c.drawImage(img,(frame%4)*256,row*256,256,256,-w/2,-h/2,w,h);c.restore();
}
export function drawWaterEffect(c,art,q,reduced=false){
 const row=q.waterDrop?0:q.waterDetail,frame=reduced?0:Math.min(3,Math.floor(q.age/(q.duration||.6)*4));
 const alpha=Math.min(1,q.life/.22),wide=row===2?q.size*1.6:q.size,h=row===2?q.size*.35:q.size;
 drawWaterDetail(c,art,row,frame,q.x,q.y,wide,h,q.waterDrop?Math.atan2(q.vy,q.vx)-Math.PI/2:0,alpha);
}
