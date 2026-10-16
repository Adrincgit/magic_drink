function cel(c,art,frame,x,y,w,h=w,angle=0,anchor=.5){
 const img=art['popcorn-fx'];if(!img)return;const size=img.width/4;
 c.save();c.translate(x,y);c.rotate(angle);c.drawImage(img,frame%4*size,Math.floor(frame/4)*size,size,size,-w*anchor,-h/2,w,h);c.restore();
}
export function drawPopcornShot(c,q,art,reduced){
 c.save();c.globalAlpha*=Math.min(1,Math.max(0,(q.popcornRange-q.popcornTravel)/35));
 cel(c,art,8+(reduced?q.pellet%4:(q.pellet+Math.floor(q.age*18))%4),q.x,q.y,32*(q.scale||1),30*(q.scale||1),Math.atan2(q.vy,q.vx));c.restore();
}
export function drawPopcornBlast(c,q,art,reduced){
 const frame=reduced?3:Math.min(7,Math.floor(q.age/q.duration*8)),w=q.range*256/224,h=(q.range*Math.tan(.24)*2+24)*256/155;
 c.save();c.globalAlpha=Math.min(1,q.life/.085);cel(c,art,frame,q.x,q.y,w,h,q.angle,16/256);c.restore();
}
export function drawPopcornImpact(c,q,art,reduced){
 c.save();c.globalAlpha=Math.min(1,q.life/.08);cel(c,art,12+(reduced?1:Math.min(3,Math.floor(q.age/q.duration*4))),q.x,q.y,q.size);c.restore();
}
