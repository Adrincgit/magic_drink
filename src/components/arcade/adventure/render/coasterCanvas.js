export function drawCoaster(c,s,art){
 const q=s.coaster,img=art['coaster-platform'];if(!q||!img)return;
 const frame=q.life<.18?3:q.life<.45?2:q.life<.75?1:0,sw=img.width/4;
 c.save();c.globalAlpha=Math.min(1,q.age*18,q.life*9);
 // The top of the painted purple ellipse is the one-way collision surface.
 c.drawImage(img,frame*sw,0,sw,img.height,q.x-68,q.y-29,136,69);c.restore();
}
