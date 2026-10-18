import {bargeParts} from '../actors/bosses/bargeSystems';

// A crank raises a tethered beater. The machine, rather than a giant clown,
// strikes the drum; the release shares the sonic projectile's beat clock.
export function bargeHammerLift(b){
 if(b.move!=='drumroll'||!['warn','attack'].includes(b.phase))return .3;
 if(b.phase==='warn')return Math.min(1,Math.max(.3,1-b.timer/1.15));
 if(b.release>0)return Math.pow(1-b.release/.25,2)*.28;
 return Math.min(1,Math.max(.28,1-(b.shotClock||0)/(b.beatInterval||.64)));
}
export function drawBargePercussion(c,s,art,m,t,reduced){
 const b=s.boss,k=m.scale,broken=bargeParts(s).drum.hp<=0;
 const pivot={x:m.drum.x+104*k,y:m.drum.y-26*k},lift=reduced?.48:bargeHammerLift(b);
 c.save();
 if(!broken){
  const angle=-1.02+lift*.95;
  c.save();c.translate(pivot.x,pivot.y);c.rotate(angle);
  const w=142*k,h=w*465/442;c.drawImage(art['barge-mallet'],-w*.91,-h*.94,w,h);c.restore();
  // The painted wheel is a local crank joint fixed to the boiler bracket.
  // No screen-spanning ropes or extra operator obscure the original painting.
  c.save();c.translate(pivot.x,pivot.y);c.rotate(angle);c.drawImage(art['barge-wheel'],-14*k,-14*k,28*k,28*k);c.restore();
 }
 c.restore();
}
