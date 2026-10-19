export function nightmareStaffStrike(s,{heavy=false,followup=true,origin=s.boss}={}){
 const b=s.boss,p=s.player,front=(origin.x-p.x)*(p.guardX??p.dir)>0,overhead=p.guardY<0&&heavy;
 if(p.guarding&&(front||overhead)){
  s.blockMelee(heavy);
  if(origin===b)b.staffRebound={at:s.time,duration:b.game?.kind==='staff-barrage'?.09:.3,heavy};
  b.staffContact={x:p.x+(p.guardX??p.dir)*46,y:p.y-43+(p.guardY||0)*46,at:s.time};
  if(followup&&b.stage===3&&b.game?.kind==='staff-counter')b.staffBarragePending=true;
  s.shake=heavy?.14:.08;s.events.push('guardBlock','harlequinLand');
  return 'blocked';
 }
 const hearts=s.hearts;
 s.damage({x:origin.x,y:origin.y-45,element:'physical',kind:'nightmare-staff',heavyImpact:heavy});
 return s.hearts<hearts?'hit':'miss';
}
export function nightmareStaffParry(s,shot){
 const b=s.boss,g=b.game;
 if(!s.level.badDreams||g?.kind!=='staff-spin'||b.phase!=='game-attack'||b.phaseAge<.04||b.phaseAge>.82||shot.life<=0||shot.heavy||shot.hidden)return false;
 const x=b.x+b.dir*32,y=b.y-48,x0=(shot.previousX??shot.x)-x,y0=(shot.previousY??shot.y)-y,dx=shot.x-x-x0,dy=shot.y-y-y0;
 const t=Math.max(0,Math.min(1,-(x0*dx+y0*dy)/(dx*dx+dy*dy||1))),px=x0+dx*t,py=y0+dy*t;
 if(px*b.dir< -32||Math.hypot(px,py)>45+(shot.r||8))return false;
 shot.life=0;shot.armorBlocked=true;b.staffContact={x:x+px,y:y+py,at:s.time};b.staffParries=(b.staffParries||0)+1;s.events.push('bossBlock');return true;
}
