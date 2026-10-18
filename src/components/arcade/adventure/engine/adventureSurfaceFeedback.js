import {surfaceY} from '../world/adventureTerrain';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));

// A platform can override its world: landing on a crate is wood, even at sea.
export function surfaceMaterial(s,platform=s.platforms[s.player.ground],x=s.player.x){
 if(platform?.material)return platform.material;
 const kind=platform?.kind||'';
 if(platform?.bridge||/wood|board|crate|wagon|straw/.test(kind)||platform?.solid&&platform.art!==7)return 'wood';
 if(/stone|metal/.test(kind))return 'stone';
 if(s.level.villageTrail)return x<6500?'soil':'stone';
 if(s.level.cornfield)return 'soil';
 if(s.level.circusCamp&&x<0)return 'soil';
 if(s.level.maskMansion||s.level.world?.terrain==='boards')return 'wood';
 if(s.level.world?.key==='harbor')return 'sand';
 if(s.level.nightmareTrail)return 'soil';
 if(s.level.world?.terrain==='enchanted')return 'stone';
 return 'soil';
}

function contact(s,landing,speed,p=s.player,platform=s.platforms[p.ground]){
 s.surfaceDust??=[];
 const material=surfaceMaterial(s,platform,p.x),soft=material==='sand'||material==='soil';
 // Stone/boards only get a light scuff. Sand has a wider, longer puff.
 const strength=landing?clamp(speed/520,.4,1.3):1;
 const count=landing&&soft?2:1;
 for(let i=0;i<count;i++)s.surfaceDust.push({x:p.x+(landing?(i?10:-10):-p.dir*9),y:p.y+1,age:0,
  life:material==='sand'?.48:soft?.36:.24,material,landing,
  size:(landing?44:29)*(material==='sand'?1.2:soft?1:.7)*strength,
  opacity:(soft?.66:.22)*(landing?1.1:1),vx:(landing?(i?1:-1): -p.dir)*(landing?26:12)});
 if(s.surfaceDust.length>80)s.surfaceDust.splice(0,s.surfaceDust.length-80);
}
export function surfaceTakeoff(s){const floor=s.platforms.find(q=>!q.gone&&s.player.x>=q.x&&s.player.x<=q.x+q.w&&Math.abs(surfaceY(q,s.player.x)-s.player.y)<10);if(floor)contact(s,false,180,s.player,floor);}

export function stepActorSurfaceFeedback(s,dt){
 for(const e of s.enemies){
  const previous=e.surfaceContact;e.surfaceContact={x:e.x,y:e.y};
  if(!previous||e.hp<=0||e.trap||e.emerging>0||e.nightmareHidden||[2,5,7,9,13,14,19,21,22,24].includes(e.type))continue;
  const platform=s.platforms.find(q=>!q.gone&&e.x>=q.x&&e.x<=q.x+q.w&&Math.abs(surfaceY(q,e.x)-e.y)<7);
  if(!platform){e.footTravel=0;continue;}
  const distance=Math.abs(e.x-previous.x);
  if(distance>35||distance<dt*20){e.footTravel=0;continue;}
  e.footTravel=(e.footTravel||0)+distance;
  if(e.footTravel>=48){e.footTravel%=48;contact(s,false,distance/dt,e,platform);}
 }
}

export function stepSurfaceFeedback(s,dt,previous){
 s.surfaceDust??=[];
 for(const q of s.surfaceDust){q.age+=dt;q.x+=q.vx*dt;}
 s.surfaceDust=s.surfaceDust.filter(q=>q.age<q.life);
 const p=s.player,grounded=p.ground!==null&&!p.coasterGround;
 if(!grounded||p.candy||p.clashFlight||s.shopTransition||s.circusEntry){p.footTravel=0;return;}
 if(!previous.grounded&&previous.vy>170){contact(s,true,previous.vy);p.footTravel=0;return;}
 const distance=Math.abs(p.x-previous.x);
 if(!previous.grounded||distance>35||p.dash>0||Math.abs(p.vx)<24){p.footTravel=0;return;}
 p.footTravel=(p.footTravel||0)+distance;
 // Distance, rather than wall time, keeps puffs on planted steps at any speed.
 const step=p.crouch?44:75.6;
 if(p.footTravel>=step){p.footTravel%=step;contact(s,false,Math.abs(p.vx));}
}

// Only a visual trail. It never creates damage probes or changes collisions.
export function sampleFireTrail(q,dt){
 if(q.kind!==0||q.hidden||q.life<=0)return;
 q.fireTrail??=[];
 for(const p of q.fireTrail)p.age+=dt;
 q.fireTrail=q.fireTrail.filter(p=>p.age<.22);
 const last=q.fireTrail.at(-1);
 if(!last||Math.hypot(q.x-last.x,q.y-last.y)>=11)q.fireTrail.push({x:q.x,y:q.y,age:0});
 if(q.fireTrail.length>18)q.fireTrail.shift();
}
