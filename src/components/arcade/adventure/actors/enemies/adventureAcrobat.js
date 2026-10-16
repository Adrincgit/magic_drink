export const isAcrobat=e=>e.type===1||e.type===4;
export const acrobatSpeed=e=>(e.type===4?108:74)*(e.acrobatAir?1.12:1);
export const acrobatStride=e=>e.type===4?56:44;

// Running, a short crouch, one ballistic hop and a planted landing are separate
// actions. An attack cannot replace the legs halfway through an airborne hop.
export function prepareAcrobat(e,trapped){
 e.acrobatWait??=e.type===4?1.15:1.8;
 if(e.acrobatAir||e.acrobatCrouch>0){e.timer=Math.max(e.timer,.6);return;}
 if(!trapped&&e.acrobatWait<=0&&e.timer>.7&&!(e.action>0)&&!(e.recovery>0))e.acrobatCrouch=.10;
 if(e.acrobatCrouch>0)e.timer=Math.max(e.timer,.6);
}

export function stepAcrobatMotion(e,dt,trapped,moved){
 e.moving=Math.abs(moved)>.001;
 if(trapped)return;
 if(e.acrobatCrouch>0){
  e.acrobatCrouch=Math.max(0,e.acrobatCrouch-dt);
  if(!e.acrobatCrouch){e.acrobatAir=true;e.acrobatAge=0;e.vy=e.type===4?-435:-300;e.y=e.baseY-1;e.phase='jump';}
  else{e.y=e.baseY;return;}
 }
 if(e.acrobatAir){
  const gravity=900;e.acrobatAge+=dt;e.y+=e.vy*dt+gravity*dt*dt/2;e.vy+=gravity*dt;e.phase='jump';
  if(e.vy>0&&e.y>=e.baseY){
   e.y=e.baseY;e.vy=0;e.acrobatAir=false;e.landing=.16;e.phase='patrol';e.acrobatWait=e.type===4?1.15:1.8;e.timer=Math.max(e.timer,.95);e.gait=Math.ceil(e.gait||0);
  }
 }else{
  e.y=e.baseY;
  if(e.moving)e.acrobatWait-=dt;
 }
}

export function acrobatAirFrame(e){
 if(e.acrobatCrouch>0)return 0;
 if(e.landing>0)return e.landing>.08?6:7;
 if(e.acrobatAge<.075)return 1;
 if(e.vy< -120)return 2;
 if(e.vy<100)return 3;
 if(e.type===4&&e.baseY-e.y>60)return 4;
 return e.baseY-e.y>25?5:6;
}
