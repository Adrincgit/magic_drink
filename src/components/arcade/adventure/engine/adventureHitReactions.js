import {surfaceY} from '../world/adventureTerrain';
// Element controls acting; force controls whether the same hit knocks Hexy down.
export function impactKind(source={}){
 if(source.element)return source.element;
 const kind=source.kind||'';
 if(source.water||/^barge-(jet|spout|wave|surf|balloon|shell)$/.test(kind))return 'water';
 if(/sound|sonic|note|barge-hoop/.test(kind))return 'sound';
 if(/fire|flame|pyre|ember|bomb|inferno/.test(kind))return 'fire';
 return 'physical';
}
export function beginHitReaction(s,source={}){
 const p=s.player,type=impactKind(source),direction=Math.sign(source.vx||p.x-(source.x??p.x+p.dir))||-p.dir;
 const heavy=!!source.heavyImpact||source.kind==='barge-surf';
 p.hitType=type;p.hitDuration=heavy?.55:type==='sound'?.5:type==='water'?.46:type==='fire'?.42:.32;p.hitReact=p.hitDuration;
 p.knockdown=heavy?{stage:'air',age:0,groundAge:0}:null;
 p.dir=-direction;p.vx=direction*(heavy?300:type==='water'?185:type==='sound'?210:160);p.vy=heavy?-310:-180;p.ground=null;
 p.firing=false;p.gliding=false;p.crouch=false;p.cast=0;p.jumpBuffer=0;
 s.events.push(type==='physical'?'hit':'hit'+type[0].toUpperCase()+type.slice(1));
 if(type==='water'){p.wetTime=1.65;p.wetClock=0;}
}
export function stepHitReaction(s,dt){
 const p=s.player,q=p.knockdown;
 if(p.wetTime>0){
  p.wetTime=Math.max(0,p.wetTime-dt);p.wetClock=(p.wetClock||0)-dt;
  if(p.wetClock<=0){p.wetClock=.13;const n=p.wetDrops=(p.wetDrops||0)+1,floor=Math.min(...s.platforms.filter(t=>!t.gone&&p.x>=t.x&&p.x<=t.x+t.w).map(t=>surfaceY(t,p.x)).filter(y=>y>=p.y-5),s.level.arena.y+110);
   s.effects.push({x:p.x+(n%3-1)*16,y:p.y-38-(n%2)*30,waterDrop:true,size:9+n%3,vx:p.vx*.12,vy:35,floor,age:0,life:.9,duration:.9});
  }
 }
 if(!q)return;
 q.age+=dt;p.hurt=Math.max(p.hurt,.55);p.hitReact=Math.max(p.hitReact,.1);
 if(q.stage==='air'&&p.ground!==null){q.stage='ground';q.groundAge=0;s.events.push('hitLanding');s.shake=Math.max(s.shake,.12);}
 else if(q.stage==='ground'){
  q.groundAge+=dt;
  if(q.groundAge>=.88){p.knockdown=null;p.hitReact=0;p.hurt=Math.max(p.hurt,.45);}
 }
}
export function hitReactionPose(p){
 const q=p.knockdown;
 if(q)return{sheet:'knockdown',frame:q.stage==='air'?(p.vy<0?0:1):q.groundAge<.12?2:q.groundAge<.28?3:q.groundAge<.44?4:q.groundAge<.61?5:q.groundAge<.78?6:7};
 if(p.hitReact>0&&p.hitType==='fire')return{sheet:'fire-hit',frame:Math.min(3,Math.floor((1-p.hitReact/p.hitDuration)*4))};
 if(p.hitReact>0&&['water','fire','sound'].includes(p.hitType))return{sheet:'element-hits',frame:['water','fire','sound'].indexOf(p.hitType)*4+Math.min(3,Math.floor((1-p.hitReact/p.hitDuration)*4))};
 return null;
}
