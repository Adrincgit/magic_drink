// Short reflected strokes and broken wakes, anchored to the painted hull.
// No blur or camera-dependent offset: only the surface itself oscillates.
export function drawHullWater(c,img,x,y,w,h,time=0,reduced=false){
 c.save();c.fillStyle='#193951';c.globalAlpha=.2;
 c.beginPath();c.ellipse(x,y+2,w*.43,Math.max(2,h*.025),0,0,Math.PI*2);c.fill();
 const depth=Math.min(46,h*.3),bands=8;
 for(let i=0;i<bands;i++){
  const u=i/bands,drift=reduced?0:Math.sin(time*1.7+i*1.3)*Math.min(2,w*.012);
  c.save();c.globalAlpha=.13*(1-u);c.translate(x+drift,y+4+(i+1)*depth/bands);c.scale(1,-1);
  c.drawImage(img,0,img.height*(1-(i+1)/bands),img.width,img.height/bands,-w/2,0,w,depth/bands);c.restore();
 }
 c.strokeStyle='#c8e8d5';c.lineWidth=Math.max(.7,Math.min(1.6,w*.009));
 for(let i=0;i<2;i++){
  const pulse=reduced?.4:(time*.5+i*.5)%1;c.globalAlpha=(1-pulse)*.36;
  c.beginPath();c.ellipse(x+5+pulse*12,y+3+pulse*8,w*(.38+pulse*.1),3+pulse*5,0,i?Math.PI*1.08:.05,i?Math.PI*1.93:Math.PI*.9);c.stroke();
 }
 c.restore();
}
