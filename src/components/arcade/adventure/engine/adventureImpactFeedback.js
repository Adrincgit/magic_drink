import {worldSound} from './adventureWorldAudio';
import {waterSplash} from './adventureWater';
// Triggered only after a collision accepts damage. Channel probes share the
// target's short cooldown instead of adding a new sound/splash every frame.
const cues={0:'impactFire',3:'impactBubble',5:'impactWater',6:'impactJelly',9:'impactElectric',10:'impactHoney'};
export function drinkImpactFeedback(s,shot,target){
 const kind=cues[shot.kind];if(!kind)return false;
 const at=s.fxTime??s.time??0,previous=target.drinkFeedback;
 if(previous?.kind===kind&&at-previous.at<(shot.sustained?.18:.075))return false;
 target.drinkFeedback={kind,at};
 const x=shot.x,y=shot.y,scale=Math.min(1.4,shot.scale||1);if(shot.kind!==5)worldSound(s,kind,x,y);
 if(shot.kind===5)waterSplash(s,x,y,(shot.heavy?95:62)*scale);
 // Other creative drinks already receive their painted row-2 impact in the
 // common collision path. Normal fire needs its small contact flame as well.
 if(shot.kind===0&&!shot.heavy)s.effects.push({x,y,dragon:true,size:55*scale,age:0,life:.28});
 return true;
}
