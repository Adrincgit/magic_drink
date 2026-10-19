import {nightmareStaffStrike} from './nightmareStaffDefense';
import {NIGHTMARE_COMBAT_BODY} from './nightmareCombatRegistration';
const clamp=n=>Math.max(0,Math.min(1,n));
export function createNightmareIllusions(s){
 const p=s.player,a=s.level.arena;
 return[-460,-250,250,460].map((dx,i)=>({id:i,home:Math.max(a.left+130,Math.min(a.right-130,p.x+dx)),x:p.x+dx,y:a.y,dir:-Math.sign(dx),kind:i===0||i===3?'cast':'vault',shots:0}));
}
export function stepNightmareIllusions(s,shoot){
 const b=s.boss,g=b.game,p=s.player,a=s.level.arena,t=b.phaseAge;
 for(const q of g.copies){
  if(b.phase==='game-windup'){q.x=q.home;q.y=a.y;continue;}
  const delay=q.id*.3;
  if(!q.aim&&t>=.15+delay){q.aim={x:p.x,y:p.y-36};q.from=q.x;q.to=q.aim.x-q.dir*55;}
  if(q.kind==='cast'){
   q.x=q.home+q.dir*Math.sin(clamp(t/3.6)*Math.PI)*100;q.y=a.y-Math.sin(clamp(t/3.6)*Math.PI)*80;
   if(q.aim&&q.shots<2&&t>=.72+delay+q.shots*.85){
    const x=q.x+q.dir*36,y=q.y-50,angle=Math.atan2(q.aim.y-y,q.aim.x-x);q.shots++;
    shoot(s,x,y,angle,350,'nightmare-gust',{actTwo:true,r:14,life:2.5,element:'magic',floor:a.y,illusion:q.id,windShape:'illusion'});s.events.push('harlequinCast');
   }
   q.frame=t<.72+delay?0:Math.min(3,Math.floor((t-.72-delay)*12)%4);q.key=`nightmare-phase-${b.stage}-cast`;
  }else{
   const u=clamp((t-.55-delay)/.9);q.x=q.aim?q.from+(q.to-q.from)*(u*u*(3-2*u)):q.home;q.y=a.y-Math.sin(u*Math.PI)*130;
   q.key='nightmare-staff-sweep-'+(b.stage===3?3:2);q.frame=4+Math.min(3,Math.floor(u*4));
   const reach=(NIGHTMARE_COMBAT_BODY[q.key]?.[q.frame]?.reach??70)+20,dx=(p.x-q.x)*q.dir;
   if(t>=1.12+delay&&t<1.38+delay&&!q.struck&&dx> -15&&dx<reach&&Math.abs(p.y-q.y)<100){q.struck=true;nightmareStaffStrike(s,{origin:q,followup:false});}
  }
 }
 if(t>=2.7&&!b.volley){b.volley=1;const angle=Math.atan2(p.y-36-(b.y-50),p.x-b.x);shoot(s,b.x,b.y-50,angle,390,'nightmare-gust',{actTwo:true,r:16,life:3,element:'magic',floor:a.y});s.events.push('harlequinCast');}
}
export function nightmareIllusionCopies(s){
 const b=s.boss,g=b.game;if(g?.kind!=='prism-mirage'||!['game-windup','game-attack'].includes(b.phase))return[];
 const fade=b.phase==='game-windup'?clamp(b.phaseAge/.5):clamp((3.6-b.phaseAge)/.5);
 return g.copies.map((q,i)=>({...q,alpha:fade*.72,hue:[-40,45,110,-95][i]}));
}
