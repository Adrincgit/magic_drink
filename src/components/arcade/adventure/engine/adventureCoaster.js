import {hasMod} from './adventureMods';
export const COASTER_LIFE=1.6;
export function clearCoaster(s){s.coaster=null;s.player.coasterGround=false;}
export function deployCoaster(s){
 const p=s.player;
 if(!hasMod(s,'enchanted-coaster')||s.coasterUsed||p.ground!==null||p.coasterGround||p.hitReact>0||p.drinkCast>0||p.dash>0||s.superCinematic||s.shopTransition||s.circusEntry||s.done)return false;
 s.coaster={x:p.x,y:p.y+14,w:106,age:0,life:COASTER_LIFE};s.coasterUsed=true;s.events.push('coasterOpen');return true;
}
export function stepCoaster(s,dt){
 if(!s.coaster)return;
 s.coaster.age+=dt;s.coaster.life-=dt;
 if(s.coaster.life<=0||!hasMod(s,'enchanted-coaster'))clearCoaster(s);
}
export function landOnCoaster(s,oldY){
 const p=s.player,q=s.coaster;
 if(p.ground!==null){s.coasterUsed=false;clearCoaster(s);return;}
 p.coasterGround=false;
 if(!q||q.life<=.18||p.vy<0||p.x+12<q.x-q.w/2||p.x-12>q.x+q.w/2||oldY>q.y+5||p.y<q.y)return;
 p.y=q.y;p.vy=0;p.coasterGround=true;p.jumps=0;p.spin=0;p.gliding=false;
}
