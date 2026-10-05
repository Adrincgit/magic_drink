export function stepWorldEffects(s,dt){
 for(const q of s.particles){q.life-=dt;q.x+=q.vx*dt;q.y+=q.vy*dt;q.vy+=300*dt;}
 s.particles=s.particles.filter(q=>q.life>0);
 for(const q of s.effects){q.life-=dt;q.age+=dt;}
 s.effects=s.effects.filter(q=>q.life>0);
}
