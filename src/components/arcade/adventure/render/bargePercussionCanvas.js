import {bargeParts} from '../actors/bosses/bargeSystems';

// A crank raises a tethered beater. The machine, rather than a giant clown,
// strikes the drum; the release shares the sonic projectile's beat clock.
export function bargeHammerLift(b){
 if(b.move!=='drumroll'||!['warn','attack'].includes(b.phase))return .3;
 if(b.phase==='warn')return Math.min(1,Math.max(.3,1-b.timer/1.15));
 if(b.release>0)return Math.pow(1-b.release/.25,2)*.38;
 return Math.min(1,Math.max(0,1-(b.shotClock||0)/.4));
}
export function drawBargePercussion(c,s,art,m,t,reduced){
 const b=s.boss,k=m.scale,broken=bargeParts(s).drum.hp<=0;
 const pivot={x:m.drum.x+104*k,y:m.drum.y-26*k},lift=reduced?.48:bargeHammerLift(b);
 const crank={x:m.drummer.x-26*k,y:m.drummer.y-28*k};
 c.save();
 // Tension cable and pulley are fixed to the drum's structural bracket.
 c.strokeStyle='#382322';c.lineWidth=6*k;c.beginPath();c.moveTo(pivot.x,pivot.y);c.lineTo(crank.x,crank.y+42*k);c.stroke();
 c.strokeStyle='#d5a450';c.lineWidth=2*k;c.stroke();
 if(!broken){
  const angle=-1.02+lift*.95;
  c.save();c.translate(pivot.x,pivot.y);c.rotate(angle);
  const w=142*k,h=w*465/442;c.drawImage(art['barge-mallet'],-w*.91,-h*.94,w,h);c.restore();
  const armX=pivot.x+Math.cos(angle)*(-68*k)-Math.sin(angle)*(-73*k),armY=pivot.y+Math.sin(angle)*(-68*k)+Math.cos(angle)*(-73*k);
  c.strokeStyle='#f0cf87';c.lineWidth=1.6*k;c.beginPath();c.moveTo(crank.x,crank.y);c.lineTo(pivot.x+14*k,pivot.y-72*k);c.lineTo(armX,armY);c.stroke();
  c.save();c.translate(pivot.x+14*k,pivot.y-72*k);c.rotate(reduced?0:t*2);c.drawImage(art['barge-wheel'],-13*k,-13*k,26*k,26*k);c.restore();
 }
 const frame=broken?12:4+(reduced?0:Math.floor(t*(b.phase==='warn'?8:5))%2),size=88*k;
 c.drawImage(art['barge-crew'],frame%4*256,Math.floor(frame/4)*256,256,256,m.drummer.x-size*.61,m.drummer.y-size*250/256,size,size);
 c.restore();
}
