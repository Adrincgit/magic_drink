import {HEXY_SIZE} from '../actors/hexy/hexyAnimation';
import {hexyRegistration} from '../actors/hexy/hexyPoseRegistration';

export function drawHexy(c,art,pose,x,y,flip){
 c.save();c.translate(x,y);if(flip)c.scale(-1,1);
 const registration=hexyRegistration(pose);c.translate(registration.x*HEXY_SIZE/320,0);c.scale(registration.scale,registration.scale);
 c.drawImage(art['hexy-'+pose.sheet],pose.frame%4*320,Math.floor(pose.frame/4)*320,320,320,-HEXY_SIZE/2,-HEXY_SIZE*300/320,HEXY_SIZE,HEXY_SIZE);c.restore();
}
