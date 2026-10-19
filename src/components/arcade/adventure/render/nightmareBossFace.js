const NIGHTMARE_BOSS_EYES={x:250,y:105,w:150,h:80}; // Archived v5 eye overlay; v6 uses drawn cels.
const cache=new WeakMap();
// Only the eye expression changes at the counter's final push. The same
// head outline, mouth, hands and body remain under the continuous rig.
export function nightmareBossPortrait(s,art){
 const base=art['pressure-boss-portraits'],eye=art['nightmare-boss-eyes'];if(!eye||!(s.powerClash.bossActingTier>=3))return base;
 if(cache.has(base))return cache.get(base);
 const {x,y,w,h}=NIGHTMARE_BOSS_EYES,part=new OffscreenCanvas(w,h),p=part.getContext('2d');p.drawImage(eye,0,0,w,h);
 p.globalCompositeOperation='destination-in';p.translate(w/2,h/2);p.scale(w/2,h/2);const g=p.createRadialGradient(0,0,0,0,0,1);g.addColorStop(0,'#fff');g.addColorStop(.65,'#fff');g.addColorStop(1,'#ffffff00');p.fillStyle=g;p.fillRect(-1,-1,2,2);
 const result=new OffscreenCanvas(base.width,base.height),c=result.getContext('2d');c.drawImage(base,0,0);c.drawImage(part,x,y,w,h);cache.set(base,result);return result;
}
