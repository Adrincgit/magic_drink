export function nightmareFX(c,art,name,frame,x,y,w,h=w,flip=false,alpha=1,angle=0){
 const img=art['nightmare-'+name];if(!img||alpha<=0)return;
 const side=img.width/4;c.save();c.globalAlpha*=alpha;c.translate(x,y);c.rotate(angle);if(flip)c.scale(-1,1);
 c.drawImage(img,frame%4*side,Math.floor(frame/4)*side,side,side,-w/2,-h/2,w,h);c.restore();
}
export const nightmareStormFrame=(art,time,reduced=false)=>{
 const img=art['aerial-candy-vortex'],count=img?Math.round(img.height/(img.width/4)*4):8;
 return reduced?2:Math.floor(time*24)%count;
};
