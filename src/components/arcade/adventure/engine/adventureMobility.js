import {modLevel} from './adventureMods';
import {leaveDecoy} from './adventureTacticalMods';
import {ribbonActive,ribbonLevel} from './adventureRibbonState';
export function startDash(s,input,grounded){
 const p=s.player,dance=ribbonActive(s),double=dance&&ribbonLevel(s)>=3?2:modLevel(s,'double-dash'),dive=modLevel(s,'comet-dive');
 if(grounded)p.airDashes=0;
 if(dance&&!grounded&&(p.airDashes||0)>=(ribbonLevel(s)>=3?2:1))return false;
 if(!input.dash||s.lastInput.dash||p.dashWait>0||p.dash>0||double&&!grounded&&(p.airDashes||0)>=2)return false;
 const down=!grounded&&input.down&&dive>0,side=down?(dive>=2?(input.right?1:0)-(input.left?1:0):0):p.dir,n=down?Math.hypot(side,1):1;
 leaveDecoy(s);p.dash=p.dashDuration;p.dashAir=!grounded;p.dashDir=side/n;p.dashY=down?1/n:0;
 if(dance){p.ribbonDashHits=[];p.ribbonFlip=0;s.events.push('ribbonSpin');}
 if(down)s.effects.push({diveKick:true,x:p.x,y:p.y-22,dx:side/n,dy:1/n,age:0,life:.32});
 if(!grounded)p.airDashes=(p.airDashes||0)+1;
 p.dashWait=double&&!grounded&&(p.airDashes||0)<2?(double===2?.34:.4):dance?.55:s.weapon===4?.67:1.05;
 p.crouch=false;p.charge=0;p.pendingSpecial=null;p.specialCast=0;p.superCast=0;p.spin=0;p.guarding=false;s.events.push('dash');return true;
}
