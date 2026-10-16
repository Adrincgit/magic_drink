import {hasMod,modLevel} from './adventureMods';
import {surfaceY} from '../world/adventureTerrain';
const distractible=e=>[0,1,2,3,4,10,11,14].includes(e.type);
const pellets=new Set(['ball','bomb','ring','streamer','juggle','note','red-pellet','ember-torch','ember-mortar','harlequin-ember','harlequin-card','harlequin-ribbon','water-bolt','diver-hoop','barge-balloon','barge-shell']);
export const movablePellet=q=>q.life>0&&pellets.has(q.kind)&&Math.hypot(q.vx||0,q.vy||0)>15;
export function popDecoy(s){
 const d=s.confettiDecoy;if(!d)return;
 s.effects.push({confetti:true,x:d.x,y:d.y-38,age:0,life:.55});s.events.push('confettiPop');s.confettiDecoy=null;
}
export function leaveDecoy(s){
 if(!hasMod(s,'confetti-step')||s.confettiWait>0)return false;
 const p=s.player,n=modLevel(s,'confetti-step');
 s.confettiDecoy={x:p.x,y:p.y,dir:p.dir,age:0,life:1.3+n*.3,platform:p.ground===null?null:s.platforms[p.ground],vy:0};
 s.confettiWait=5.4-n*.6;s.events.push('confettiStep');return true;
}
export function stepTacticalMods(s,dt){
 for(const key of ['swapWait','confettiWait'])s[key]=Math.max(0,(s[key]||0)-dt);
 const d=s.confettiDecoy;if(!d)return;
 if(!hasMod(s,'confetti-step')){s.confettiDecoy=null;return;}
 d.age+=dt;d.life-=dt;
 if(d.platform){d.x+=d.platform.dx||0;d.y=surfaceY(d.platform,d.x);}
 else{const previous=d.y;d.vy+=800*dt;d.y+=d.vy*dt;const p=s.platforms.find(p=>d.x>=p.x&&d.x<=p.x+p.w&&previous<=surfaceY(p,d.x)&&d.y>=surfaceY(p,d.x));if(p){d.platform=p;d.y=surfaceY(p,d.x);}}
 if(d.life<=0)popDecoy(s);
}
export function enemyAimTarget(s,e){
 const d=s.confettiDecoy;
 return d&&d.life>0&&distractible(e)&&e.trap<=0&&Math.abs(d.x-e.x)<420&&Math.abs(d.y-e.y)<150?d:s.player;
}
export function decoyContact(s,e){
 const d=s.confettiDecoy;
 if(d&&e.hp>0&&distractible(e)&&e.trap<=0&&Math.abs(e.x-d.x)<28&&Math.abs(e.y-d.y)<48){popDecoy(s);e.timer=Math.max(e.timer,.45);return true;}return false;
}
export function decoyBlocks(s,q){
 const d=s.confettiDecoy;if(!d||!movablePellet(q))return false;
 const dx=q.x-(q.previousX??q.x),dy=q.y-(q.previousY??q.y),x=q.previousX??q.x,y=q.previousY??q.y;
 const t=Math.max(0,Math.min(1,((d.x-x)*dx+(d.y-36-y)*dy)/(dx*dx+dy*dy||1)));
 if(Math.abs(x+dx*t-d.x)>20+(q.r||0)||Math.abs(y+dy*t-(d.y-36))>32+(q.r||0))return false;
 q.life=0;popDecoy(s);return true;
}
export function reflectPellet(s,q){
 const p=s.player,n=modLevel(s,'reply-bell');
 if(!n||!(p.parryWindow>0)||p.parryUsed||!movablePellet(q))return false;
 // Return only a friendly bolt. Enemy payloads cannot spawn clowns or hazards.
 const speed=Math.max(360,Math.min(650,Math.hypot(q.vx,q.vy))),length=Math.hypot(q.vx,q.vy);
 s.shots.push({x:q.x,y:q.y,vx:-q.vx/length*speed,vy:-q.vy/length*speed,r:10,scale:1,kind:-1,damage:3+n*.5,age:0,life:1.4,hits:[],reflected:true});
 p.parryUsed=true;p.parryWindow=0;p.parryFlash=.3;q.life=0;
 s.effects.push({reply:true,x:q.x,y:q.y,age:0,life:.3});s.events.push('replyBell');return true;
}
