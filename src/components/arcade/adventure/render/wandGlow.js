// Light on the painted wand star. No replacement polygon or brown outline.
export function drawWandGlow(c,x,y,strength=1,radius=15){
 if(strength<=0)return;
 c.save();c.globalCompositeOperation='lighter';c.globalAlpha=Math.min(1,strength);
 const glow=c.createRadialGradient(x,y,0,x,y,radius);
 glow.addColorStop(0,'rgba(255,255,239,.95)');
 glow.addColorStop(.16,'rgba(255,245,187,.85)');
 glow.addColorStop(.45,'rgba(255,211,106,.32)');
 glow.addColorStop(1,'rgba(255,200,92,0)');
 c.fillStyle=glow;c.fillRect(x-radius,y-radius,radius*2,radius*2);c.restore();
}
