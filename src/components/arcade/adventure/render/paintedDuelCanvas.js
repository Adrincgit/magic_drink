const cells={heads:[256,224],particles:[128,128],dust:[256,320],fire:[256,128],pyres:[256,416],'fire-show':[384,256]};
export function painted(c,art,kind,frame,x,y,w,h=w,angle=0,alpha=1,anchorX=.5,anchorY=.5){
 const img=art['duel-'+kind];if(!img||alpha<=0)return;
 const [cw,ch]=cells[kind];c.save();c.globalAlpha*=alpha;c.translate(x,y);c.rotate(angle);
 c.drawImage(img,frame%4*cw,Math.floor(frame/4)*ch,cw,ch,-w*anchorX,-h*anchorY,w,h);c.restore();
}
export function energyHead(c,art,boss,age,x,y,angle,size=185,reduced=false){
 const f=(boss?8:0)+(reduced?2:Math.floor(age*24)%8);
 energyGlow(c,boss,x,y,size*.8,reduced?.8:.85+Math.sin(age*31)*.06);
 c.save();c.globalCompositeOperation='screen';painted(c,art,'heads',f,x,y,size*1.25,size*1.09,angle,.35,.71,.5);c.restore();
 painted(c,art,'heads',f,x,y,size,size*.875,angle,1,.71,.5);
}
export function energyGlow(c,boss,x,y,radius,strength=1){
 c.save();c.globalCompositeOperation='screen';c.globalAlpha*=strength;c.filter='none';
 const g=c.createRadialGradient(x,y,0,x,y,radius);
 g.addColorStop(0,'#fff2cdcf');g.addColorStop(.17,boss?'#ffd580aa':'#ffe69ca0');
 g.addColorStop(.43,boss?'#ff632b50':'#ff86d450');g.addColorStop(1,boss?'#f6371900':'#fc68c800');
 c.fillStyle=g;c.fillRect(x-radius,y-radius,radius*2,radius*2);c.restore();
}
export function paintedParticle(c,art,kind,age,x,y,size,angle=0,alpha=1){
 painted(c,art,'particles',kind*4+Math.floor(age*18)%4,x,y,size,size,angle,alpha);
}
// Gold-and-velvet frame; only the clash meter has moving spell textures.
export function paintedMeter(c,art,x,y,w,h,ratio,hexyLeft,age,bossOnly=false){
 const img=art['duel-meter'];if(!img)return;
 const ix=x+w*.102,iy=y+h*.295,iw=w*.799,ih=h*.405;
 c.save();c.beginPath();c.roundRect(ix,iy,iw,ih,ih/2);c.clip();c.fillStyle='#281325';c.fillRect(ix,iy,iw,ih);
 const fill=(left,width,boss)=>{
  if(width<=0)return;c.save();c.beginPath();c.rect(left,iy,width,ih);c.clip();
  const g=c.createLinearGradient(0,iy,0,iy+ih);g.addColorStop(0,boss?'#ffc56a':'#fff3a3');g.addColorStop(.45,boss?'#f57b35':'#f69dda');g.addColorStop(1,boss?'#aa2534':'#9653bb');c.fillStyle=g;c.fillRect(left,iy,width,ih);
  if(!bossOnly){const texture=art[boss?'harlequin-ultimate-beam':'super-beam'];c.globalAlpha=.5;c.drawImage(texture,0,Math.floor(age*18)%4*256,1024,256,ix,iy-ih*.9,iw,ih*2.8);}c.restore();
 };
 if(bossOnly)fill(ix,iw*ratio,true);
 else{fill(ix,iw,true);fill(hexyLeft?ix:ix+iw*(1-ratio),iw*ratio,false);}
 c.restore();c.save();if(!hexyLeft&&!bossOnly){c.translate(x+w,y);c.scale(-1,1);c.drawImage(img,0,0,w,h);}else c.drawImage(img,x,y,w,h);c.restore();
 if(!bossOnly)paintedParticle(c,art,0,age,ix+iw*(hexyLeft?ratio:1-ratio),iy+ih*.5,ih*2.3,0,.95);
}
