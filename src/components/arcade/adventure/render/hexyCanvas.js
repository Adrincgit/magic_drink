import {HEXY_SIZE} from '../actors/hexy/hexyAnimation';
import {hexyRegistration} from '../actors/hexy/hexyPoseRegistration';
import {hexyMuzzle} from '../actors/hexy/hexyAnimation';
const castMasks=new Map();

export function drawHexy(c,art,pose,x,y,flip){
 c.save();c.translate(x,y);if(flip)c.scale(-1,1);
 const registration=hexyRegistration(pose);c.translate(registration.x*HEXY_SIZE/320,0);c.scale(registration.scale,registration.scale);
 const crop=[pose.frame%4*320,Math.floor(pose.frame/4)*320,320,320];
 c.drawImage(art['hexy-'+pose.sheet],...crop,-HEXY_SIZE/2,-HEXY_SIZE*300/320,HEXY_SIZE,HEXY_SIZE);c.restore();
}

// Light is clipped to the actual current drawing, including hat/hair movement.
// It complements painted flame/beam sprites rather than whitening the screen.
export function drawHexyCastLighting(c,s,art,pose){
 const p=s.player,electric=!s.basicFire&&s.weapon===9,fire=!s.basicFire&&s.weapon===0;
 if((!electric&&!fire)||p.candy||s.done||s.clear||s.shopTransition||s.circusEntry||p.cast<=0&&p.specialCast<=0&&!s.voltBeam)return;
 const color=electric?'#5cd9ff':'#ffb04a',key=pose.sheet+':'+pose.frame+':'+color;
 let mask=castMasks.get(key);const registration=hexyRegistration(pose);
 if(!mask){
  mask=document.createElement('canvas');mask.width=mask.height=320;const b=mask.getContext('2d'),m=hexyMuzzle(s,pose);
  const x=160+((m.x-p.x)*p.dir*320/HEXY_SIZE-registration.x)/registration.scale,y=300+(m.y-p.y)*320/HEXY_SIZE/registration.scale;
  b.drawImage(art['hexy-'+pose.sheet],pose.frame%4*320,Math.floor(pose.frame/4)*320,320,320,0,0,320,320);
  b.globalCompositeOperation='source-in';const g=b.createRadialGradient(x,y,5,x,y,260);g.addColorStop(0,color);g.addColorStop(.45,color+'b0');g.addColorStop(1,color+'00');b.fillStyle=g;b.fillRect(0,0,320,320);
  castMasks.set(key,mask);if(castMasks.size>80)castMasks.delete(castMasks.keys().next().value);
 }
 c.save();c.globalCompositeOperation='screen';c.globalAlpha=(electric?.43:.32)*Math.min(1,s.voltBeam?1:Math.max(p.cast/.18,p.specialCast/.26));
 c.translate(p.x,p.y);if(p.dir<0)c.scale(-1,1);c.translate(registration.x*HEXY_SIZE/320,0);c.scale(registration.scale,registration.scale);
 c.drawImage(mask,-HEXY_SIZE/2,-HEXY_SIZE*300/320,HEXY_SIZE,HEXY_SIZE);c.restore();
}
