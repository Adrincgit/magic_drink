export function stepWorldEffects(s,dt){
 for(const q of s.organDust||[]){q.age+=dt;q.life-=dt;q.x+=q.vx*dt;q.y+=q.vy*dt;q.vy+=28*dt;}
 if(s.organDust)s.organDust=s.organDust.filter(q=>q.life>0);
 for(const q of s.organDebris||[]){
  q.life-=dt;q.age+=dt;q.x+=q.vx*dt;q.y+=q.vy*dt;q.vy+=420*dt;q.rotation+=q.spin*dt;
  if(q.floor!==undefined&&q.y+q.h*.35>=q.floor&&q.vy>0){
   if(q.water){
    if(!q.submerged){
     q.submerged=true;q.vx*=.3;q.spin*=.25;q.life=Math.min(q.life,.65);
     s.effects.push({x:q.x,y:q.floor,bargeSplash:true,size:Math.max(55,Math.min(130,q.w)),age:0,life:.45});
     // A group of fragments hitting in one step shares one water impact.
     if(!s.events.includes('bargeSplash'))s.events.push('bargeSplash');
    }
    q.vy=65;continue;
   }
   if(!q.bounced&&(q.art==='organ-horn'||q.art==='organ-wheel'))s.events.push('organClatter');
   q.y=q.floor-q.h*.35;q.vy=q.bounced?0:-q.vy*.24;q.vx*=.55;q.spin*=.4;q.bounced=true;
  }
 }
 if(s.organDebris)s.organDebris=s.organDebris.filter(q=>q.life>0);
 for(const q of s.particles){q.life-=dt;q.x+=q.vx*dt;q.y+=q.vy*dt;q.vy+=300*dt;}
 s.particles=s.particles.filter(q=>q.life>0);
 for(const q of s.effects){q.life-=dt;q.age+=dt;if(q.cinematicSmoke){q.x+=q.vx*dt;q.y+=q.vy*dt;q.vx*=Math.exp(-dt*.8);}}
 s.effects=s.effects.filter(q=>q.life>0);
}
