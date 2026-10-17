import {hasMod} from './adventureMods';
import {canControlEnemy} from '../actors/enemies/adventureEnemyTraits';
export const stompable=e=>[0,1,3,4,6,10,11,14].includes(e.type)&&canControlEnemy(e,'push')&&!e.spiked&&!e.spikes&&!e.armored;
export function stompBounce(s,e){
 if(!stompable(e))return false;
 const p=s.player,boots=hasMod(s,'spring-boots');p.vy=boots?-690:-390;p.ground=null;p.coasterGround=false;
 if(boots){p.jumps=0;p.jumpAge=0;p.spin=0;p.springBounce=.24;s.effects.push({springBounce:true,x:p.x,y:p.y,age:0,life:.35});s.events.push('springBounce');}
 return true;
}
