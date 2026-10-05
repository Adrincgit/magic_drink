// Held bullets cannot hurt Hexy or run their old bomb/floor behaviour.
export function captureInBubble(q,h){
 if(q.kind!==3||q.life<=0||h.life<=0)return false;
 q.captured||=[];if(q.captured.length>=(q.heavy?5:3))return false;
 q.captured.push({kind:h.kind,color:h.color||0});h.life=0;
 if(q.captured.length===1){q.vx*=.12;q.vy=-12;q.life=Math.min(q.life,.85);}
 return true;
}
export function trapEnemy(e,seconds){e.trap=Math.max(e.trap||0,seconds);e.trapX=e.x;e.trapY=e.y;}
export function burstBubble(s,q,defeat){
 if(q.popped)return;q.popped=true;q.life=0;
 const scale=q.scale||1,radius=(q.heavy?125:90)*scale,damage=(q.captured?.length||0)*2;
 s.effects.push({x:q.x,y:q.y,spell:3,size:radius*2,age:0,life:.32});s.events.push('bubbleBurst');
 if(!damage)return;
 for(const e of s.enemies)if(e.hp>0&&Math.hypot(e.x-q.x,e.y-38-q.y)<radius){e.hp-=damage;e.flash=.2;if(e.hp<=0)defeat(s,e);}
 // The burst obeys the same boss vulnerability rules as ordinary Bubble Tape.
 const b=s.boss;if(b.hp>0&&b.vulnerable&&Math.hypot(b.x-q.x,b.y-55-q.y)<radius+55){b.hp=Math.max(0,b.hp-damage);b.flash=.18;}
}
export function burstTrappedEnemy(s,e,defeat){
 if(!e.trap)return;e.trap=0;
 s.effects.push({x:e.x,y:e.y-38,spell:3,size:220,age:0,life:.32});s.events.push('bubbleBurst');
 for(const other of s.enemies)if(other!==e&&other.hp>0&&Math.hypot(other.x-e.x,other.y-e.y)<110){other.hp-=3;other.flash=.2;if(other.hp<=0)defeat(s,other);}
}
