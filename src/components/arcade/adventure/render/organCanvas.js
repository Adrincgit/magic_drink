import {organMechanism} from '../actors/bosses/organMechanism';
import {drawWandGlow} from './wandGlow';
import {drawOrganSteam,drawOrganDriveTrail} from './organEffectsCanvas';
import {bossHitFilter} from '../actors/bosses/bossFeedback';

const part=(c,img,q)=>c.drawImage(img,q.x,q.y,q.w,q.h);
export function drawOrgan(c,s,art,reduced=false){
 const b=s.boss,m=organMechanism(s,reduced),body=art['organ-body'];
 drawOrganSteam(c,s,m,reduced);
 drawOrganDriveTrail(c,s,m,reduced);
 if(b.shattered)return;
 c.save();c.filter=bossHitFilter(b,reduced);
 c.save();c.translate(m.drive.x,m.drive.y);c.transform(m.drive.sx,0,m.drive.shear,m.drive.sy,0,0);c.translate(-m.drive.x,-m.drive.y);
 part(c,art['organ-pipes'],m.pipes);
 part(c,body,m.body);
 // Accordion folds compress independently of the roof and chassis.
 const inner={x:m.body.x+94,y:m.body.y+91,w:153,h:129};
 c.save();c.beginPath();c.rect(inner.x,inner.y,inner.w,inner.h);c.clip();
 c.drawImage(body,343,330,554,468,inner.x-(m.bellows-1)*inner.w/2,inner.y,inner.w*m.bellows,inner.h);
 if(b.transformed&&b.hp>0){c.globalCompositeOperation='screen';c.fillStyle=`rgba(101,232,221,${.07+m.recoil*.16})`;c.fillRect(inner.x,inner.y,inner.w,inner.h);}
 c.restore();
 if(m.cover.alpha>0){
  c.save();c.globalAlpha=m.cover.alpha;c.translate(m.cover.x+m.cover.w/2,m.cover.y+m.cover.h/2);c.rotate(m.cover.rotation);
  c.drawImage(art['organ-cover'],-m.cover.w/2,-m.cover.h/2,m.cover.w,m.cover.h);c.restore();
 }
 for(const q of m.horns){c.save();c.translate(q.pivot.x,q.pivot.y);c.rotate(q.rotation);c.translate(-q.pivot.x,-q.pivot.y);part(c,art['organ-horn'],q);c.restore();}
 c.filter='none';
 if(m.bassPreparing||b.bassRelease>0){
  const q=m.bassMouth,age=b.bassRelease>0?.3-b.bassRelease:.03,frame=reduced?0:Math.min(3,Math.floor(age*12));
  const size=b.bassRelease>0?46:30;
  c.save();c.globalAlpha=b.bassRelease>0?Math.min(1,b.bassRelease/.06):.65;
  c.drawImage(art['organ-sonic'],frame*512,0,512,512,q.x-size*.34,q.y-size*.72,size,size);c.restore();
 }
 if(b.hp>0){
  const points=b.move==='organ-fanfare'?[m.horns[b.activeMouth||0].mouth]:m.outlets;
  const preparing=b.move!=='organ-charge'&&(b.phase==='warn'||b.phase==='attack'&&b.shotClock<=.14);
  for(const q of points){
   if(preparing)drawWandGlow(c,q.x,q.y,.45,23);
   if(m.release>0){
    drawWandGlow(c,q.x,q.y,m.release,38);
    c.save();c.globalAlpha=m.release*.85;c.strokeStyle='#fff3be';c.lineWidth=2;
    c.beginPath();c.arc(q.x,q.y,7+(1-m.release)*23,0,Math.PI*2);c.stroke();c.restore();
   }
  }
 }
 c.restore();
 for(const q of m.wheels){c.save();c.translate(q.x,q.y);c.rotate(q.angle);c.drawImage(art['organ-wheel'],-q.w/2,-q.w/2,q.w,q.w);c.restore();}
 c.restore();
}
