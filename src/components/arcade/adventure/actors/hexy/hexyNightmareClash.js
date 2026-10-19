import {nightmarePressureFrame} from '../../engine/nightmarePressureActing';
export function hexyNightmarePose(s){
 const q=s.powerClash;if(q?.kind!=='nightmare'||!['travel','contest','boss-boost','hexy-boost','resolve'].includes(q.state))return null;
 const air=s.superCinematic?.airborne;
 return{sheet:'nightmare-pressure-'+(air?'air':'ground'),frame:nightmarePressureFrame(q,s.fxTime)};
}
