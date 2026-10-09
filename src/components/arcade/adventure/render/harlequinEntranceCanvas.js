import {painted,paintedParticle} from './paintedDuelCanvas';
import {drawGroundFire,drawGroundHeat} from './harlequinFireCanvas';
const clamp=n=>Math.max(0,Math.min(1,n));
export function drawHarlequinEntrance(c,s,art,reduced){
 const b=s.boss,q=b.arrival;if(b.phase!=='intro'||!q)return;
 const age=q.age;
 if(age<1.6){
  const heat=clamp((age-.4)/1.2);drawGroundHeat(c,art,q.toX,q.toY,heat,age,reduced);
  if(age>.65){
   for(let i=0;i<(reduced?2:5);i++){
    const t=i/5,angle=-Math.PI/2;
    painted(c,art,'fire',16+Math.floor(age*24+i)%8,b.x+25+t*55,b.y-90-t*115,115,72,angle,(1-t)*.6,.72,.5);
   }
  }
 }
 for(let i=0;i<(reduced?6:22);i++){
  const t=(age*.6+i*.618)%1,angle=i*2.4+age*1.8,r=40+t*140;
  paintedParticle(c,art,3,age+i,b.x+Math.cos(angle)*r,b.y-90+Math.sin(angle)*r*.65,14+i%3*4,angle,Math.sin(t*Math.PI)*clamp(age/.2)*clamp((4.5-age)/.3));
 }
 if(age>1.6&&age<3.05)for(const side of [-1,1]){
  const elapsed=age-1.6;drawGroundFire(c,art,{x:b.x+side*(70+elapsed*38),floor:q.toY,age:elapsed,life:3.05-age,seed:side+2},reduced);
 }
}
