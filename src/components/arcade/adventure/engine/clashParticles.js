export function emitClashSparks(q,x,y,count=2){
 for(let i=0;i<count;i++){
  const n=q.sparkSeed++,a=n*2.399963,speed=180+(n*137%490),life=.35+(n%7)*.07;
  q.sparks.push({x,y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,age:0,life,maxLife:life,kind:n%5,size:2+n%4,color:['#fff8ce','#ff96e0','#ff624e','#ffe278','#bcefff'][n%5]});
 }
 if(q.sparks.length>140)q.sparks.splice(0,q.sparks.length-140);
}
export function stepClashSparks(q,dt){
 for(const p of q.sparks){p.age+=dt;p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=110*dt;}
 q.sparks=q.sparks.filter(p=>p.life>0);
}
