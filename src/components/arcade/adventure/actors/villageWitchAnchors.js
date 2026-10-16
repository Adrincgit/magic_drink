import {HARVESTER_AIR_SIZE,HARVESTER_SCALE} from './harvesterRegistration';
import {harvesterFlightVessels} from './harvesterFlightAtlas';
const ground=[[98,190.5],[122,193.5],[123.5,196],[100,192.5],[113.5,186],[96.5,193.5],[102,186.5],[125.5,190]],air=[[82.5,174.5],[77.5,121],[76,111],[88.5,168]];
// Pumpkin centers measured on each packed absorption cel, shared by the
// captive trajectory, ignition light and actual launched pumpkin.
export function witchVessel(e){
 if(e.type===28){
  if(e.flying){const frame=Math.floor((e.phaseAge||0)*5)%4,[x,y]=harvesterFlightVessels[frame];return{x:e.x-e.dir*(x-160)*HARVESTER_AIR_SIZE/320,y:e.y+(y-312.5)*HARVESTER_AIR_SIZE/320,size:70*HARVESTER_SCALE};}
  return{x:e.x+e.dir*50*HARVESTER_SCALE,y:e.y-75*HARVESTER_SCALE,size:70*HARVESTER_SCALE};
 }
 const a=e.flying?air:ground,n=a.length,duration=e.absorbDuration||(e.phase==='absorb-player'?4.8:3.05),i=Math.min(n-1,Math.floor((e.phaseAge||0)/duration*n)),[x,y]=a[i];
 return{x:e.x-e.dir*(x-128)*198/256,y:e.y+(y-250)*198/256,size:(e.flying?39:49)*198/256};
}
