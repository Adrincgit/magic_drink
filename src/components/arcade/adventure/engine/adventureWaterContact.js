// Swept surface crossing shared by friendly and hostile moving projectiles.
// The painted river begins behind the bridge, above the actual navigation
// lane. Shots reach boats/divers before entering the water just below them.
export function projectileWaterContact(s,q){
 if(q.life<=0||q.ribbon||q.aquaProbe||q.hidden||/^barge-(jet|spout|surf|wave)$/.test(q.kind))return false;
 const fromY=q.previousY??q.y,fromX=q.previousX??q.x,r=Math.min(18,q.r||0);
 if(q.y<=fromY)return false;
 for(const river of s.level.rivers||[]){
  const surface=river.shotSurfaceY??river.y;
  if(fromY+r>surface||q.y+r<surface)continue;
  const t=(surface-r-fromY)/(q.y-fromY),x=fromX+(q.x-fromX)*t;
  if(x<river.x||x>river.x+river.w)continue;
  q.x=x;q.y=surface;q.life=0;
  s.effects.push({x,y:surface,surfaceY:surface,bargeSplash:true,size:q.heavy?105:q.popcorn?45:65,age:0,life:.48});
  // Seven kernels share one sound, while each water contact keeps its splash.
  if(!q.popcornGroup||!q.popcornGroup.waterSound){s.events.push('bargeSplash');if(q.popcornGroup)q.popcornGroup.waterSound=true;}
  return true;
 }
 return false;
}
