import {surfaceY} from '../world/adventureTerrain';
import {hexyMuzzle,hexyPose} from '../actors/hexy/hexyAnimation';
import {drinkMastery} from './adventureDrinkMastery';
import {configureExtraShot,beginExtraSpecial,stepExtraField,stepExtraShot} from './adventureExtraDrinks';
import {configureRibbonShot,stepRibbonShot,beginRibbonSlam} from './adventureRibbon';
import {echoFuel} from './adventureEcho';
import {canControlEnemy} from '../actors/enemies/adventureEnemyTraits';
export const JELLY=6,PRISM=7,ECHO=8;
export const creativeDrink=kind=>kind>=JELLY&&kind<=12;
const fx=(s,kind,x,y,size=58)=>s.effects.push({drinkFx:kind,x,y,size,age:0,life:.36,duration:.36});
export function configureDrinkShot(q){
 if(q.kind===JELLY){q.vx*=.8;q.vy=q.vy===0?-130:q.vy*.8;q.r=14*(q.scale||1);q.damage=3;q.life=2.7;q.bounces=0;}
 if(q.kind===PRISM){const length=Math.hypot(q.vx,q.vy)||1;q.vx=q.vx/length*1120;q.vy=q.vy/length*1120;q.r=6*(q.scale||1);q.damage=1.6;q.life=.75;q.bounces=0;}
 if(q.kind===ECHO){q.vx*=.68;q.vy*=.68;q.r=12*(q.scale||1);q.baseDamage=q.damage=2.8;q.life=1.1;q.piercing=true;}
 return configureRibbonShot(configureExtraShot(q));
}
export function rememberDrinkShot(s,q){
 const history=s.drinkHistory??=[];
 history.push({time:s.time,kind:q.kind,vx:q.vx,vy:q.vy,r:q.r,damage:q.damage,life:q.life,scale:q.scale||1,piercing:q.piercing,baseDamage:q.baseDamage,orbitVX:q.orbitVX,orbitVY:q.orbitVY,ribbon:q.ribbon,ribbonDuration:q.ribbonDuration,ribbonAimX:q.ribbonAimX,ribbonAimY:q.ribbonAimY});
 s.drinkHistory=history.filter(q=>s.time-q.time<2).slice(-6);
}
export function dismissEcho(s){
 if(s.weapon!==ECHO||!s.drinkFields?.some(f=>f.kind===ECHO&&f.life>0))return false;
 for(const f of s.drinkFields)if(f.kind===ECHO)f.life=0;
 s.drinkFields=s.drinkFields.filter(f=>f.kind!==ECHO);s.events.push('echoPulse');return true;
}
function floorBelow(s,x,y){
 return s.platforms.filter(q=>!q.gone&&x>=q.x&&x<=q.x+q.w&&surfaceY(q,x)>=y-10).sort((a,b)=>surfaceY(a,x)-surfaceY(b,x))[0];
}
export function beginCreativeSpecial(s,kind,scale,placement){
 if(!creativeDrink(kind))return false;
 const p=s.player,m=hexyMuzzle(s),fields=s.drinkFields??=[];
 const mastery=drinkMastery(s,kind),keep=kind===PRISM?mastery-1:kind===JELLY&&mastery>=2?1:0,retained=keep?fields.filter(q=>q.kind===kind&&q.life>0).slice(-keep):[];
 s.drinkFields=fields.filter(q=>q.kind!==kind).concat(retained);
 if(kind===JELLY){
  let x=placement?.x??p.x+p.dir*82;
  if(retained.some(f=>Math.abs(f.x-x)<90))x+=p.dir*125;
  const platform=placement?.platform&&x===placement.x?placement.platform:floorBelow(s,x,placement?.y??p.y-12),y=platform?surfaceY(platform,x):p.y;
  s.drinkFields.push({kind,x,y,platform,vy:0,age:0,life:6,scale,boostShots:true,cherryLift:mastery===3?650:520,charges:3,bounced:new Set(),bounceAge:10,playerWait:0,hits:[]});
 }else if(kind===PRISM){
  const dx=p.aimX??p.dir,dy=p.aimY??0;
  let distance=78,x=m.x+dx*distance,y=m.y+dy*distance;
  for(let attempt=0;attempt<3&&retained.some(f=>Math.hypot(f.x-x,f.y-y)<78);attempt++){distance+=110;x=m.x+dx*distance;y=m.y+dy*distance;}
  s.drinkFields.push({kind,x,y,prismId:s.nextPrismId=(s.nextPrismId||0)+1,age:0,life:mastery>=2?7:5.5,scale,flash:0,dir:p.dir});
 }else if(kind===12){beginRibbonSlam(s,scale);
 }else if(kind>ECHO){beginExtraSpecial(s,kind,scale,placement);
 }else{
  for(let i=0;i<mastery;i++)s.drinkFields.push({kind,x:p.x-p.dir*(58+i*38),y:p.y,muzzle:m,pose:hexyPose(s),dir:p.dir,age:0,life:1,scale,flash:0,trail:[],delay:.18+i*.13,offset:58+i*38,copyDamage:[.5,.32,.25][mastery-1]});
 }
 return true;
}
export function stepDrinkFields(s,dt){
 for(const f of s.drinkFields||[]){
  f.age+=dt;if(f.kind!==ECHO)f.life-=dt;else if(!echoFuel(s))f.life=0;f.flash=Math.max(0,(f.flash||0)-dt);if(f.life<=0)continue;
  if(f.kind===JELLY){
   if(f.platform?.gone)f.platform=null;
   if(f.platform){f.x+=f.platform.dx||0;f.y=surfaceY(f.platform,f.x);}
   else{f.vy+=850*dt;f.y+=f.vy*dt;if(f.y>s.player.y+500)f.life=0;continue;}
   f.bounceAge+=dt;f.playerWait=Math.max(0,f.playerWait-dt);
   if(f.age<.16||f.charges<=0)continue;
   const p=s.player;
   if(!f.playerWait&&p.vy>=0&&Math.abs(p.x-f.x)<42*f.scale&&p.y>=f.y-20&&p.y<=f.y+10){
    p.y=f.y-6;p.vy=-780;p.ground=null;p.jumps=1;p.jumpAge=0;p.spin=0;f.playerWait=.65;f.bounceAge=0;f.charges--;s.events.push('jellyBounce');
   }
   for(const e of s.enemies)if(f.charges>0&&canControlEnemy(e,'launch')&&!f.bounced.has(e)&&Math.abs(e.x-f.x)<52*f.scale&&Math.abs(e.y-f.y)<32){
    f.bounced.add(e);e.jellyLift=1.5;e.vy=-440;e.y-=4;f.bounceAge=0;f.charges--;s.events.push('jellyBounce');
    s.shots.push({kind:JELLY,heavy:true,hidden:true,sustained:true,x:e.x,y:e.y-25,vx:0,vy:0,r:28,age:0,life:.024,damage:5,hits:f.hits,scale:f.scale});
   }
   if(f.charges<=0)f.life=Math.min(f.life,.45);
  }else if(f.kind===ECHO){
   const p=s.player;f.trail.push({time:f.age,player:{...p}});
   while(f.trail.length>1&&f.trail[1].time<=f.age-f.delay)f.trail.shift();
   const delayed=f.trail[0],clone={...delayed.player,x:delayed.player.x-delayed.player.dir*f.offset};
   const follow=Math.min(1,dt*16);f.x+=(clone.x-f.x)*follow;f.y+=(clone.y-f.y)*follow;clone.x=f.x;clone.y=f.y;
   // Movement trails behind; firing animation does not replay later from that trail.
   f.dir=f.flash>0?p.dir:clone.dir;
   f.pose=f.flash>0?hexyPose(s):hexyPose({...s,player:{...clone,cast:0,firing:false,ribbonSwing:0,specialCast:0}});
   f.muzzle=hexyMuzzle({...s,player:{...clone,dir:f.dir}},f.pose);
  }else if(f.kind>ECHO)stepExtraField(s,f,dt);
 }
 s.drinkFields=(s.drinkFields||[]).filter(q=>q.life>0);
}
function reflect(s,q,nx,ny){
 if(q.bounces>=(q.kind===JELLY?3:1)){q.life=0;fx(s,q.kind,q.x,q.y);return;}
 const dot=q.vx*nx+q.vy*ny;q.vx-=2*dot*nx;q.vy-=2*dot*ny;
 if(q.kind===JELLY){q.vx*=.94;q.vy=ny? -Math.max(170,Math.abs(q.vy)*.82):q.vy;}
 q.bounces++;q.bounceAge=0;q.hits=[];fx(s,q.kind,q.x,q.y,35);s.events.push(q.kind===JELLY?'jellyBounce':'prismReflect');
}
export function stepCreativeShot(s,q,dt){
 if(q.ribbon){stepRibbonShot(s,q,dt);return;}
 stepExtraShot(s,q,dt);
 if(q.hidden||q.heavy||!creativeDrink(q.kind)||q.life<=0)return;
 if(q.kind===ECHO){const t=Math.min(1,q.age/1.1);q.r=(12+20*t)*(q.scale||1);q.damage=(q.baseDamage||2.8)*(1-t*.55);}
 if(q.kind===JELLY||q.kind===PRISM){
  if(q.kind===JELLY)q.vy+=570*dt;q.bounceAge=(q.bounceAge??10)+dt;
  if(q.kind===JELLY)for(const f of s.drinkFields||[])if(f.kind===JELLY&&f.boostShots&&f.life>0&&f.age>=.16&&!q.jellyPads?.includes(f)){
   // Sweep through the painted jelly body, including its sides. Horizontal
   // cherries can trigger a spring; firing down from above is not required.
   const ax=q.previousX??q.x,ay=q.previousY??q.y,dx=q.x-ax,dy=q.y-ay;let near=0,far=1;
   for(const [a,d,lo,hi]of [[ax,dx,f.x-47*f.scale-q.r,f.x+47*f.scale+q.r],[ay,dy,f.y-64*f.scale-q.r,f.y+4]]){
    if(Math.abs(d)<.001){if(a<lo||a>hi)far=-1;}else{const t1=(lo-a)/d,t2=(hi-a)/d;near=Math.max(near,Math.min(t1,t2));far=Math.min(far,Math.max(t1,t2));}
   }
   if(near>far)continue;
   q.y=Math.min(q.y,f.y-64*f.scale-q.r-1);q.vy=-(f.cherryLift||520);q.bounces=0;q.bounceAge=0;q.jellyPads=[...(q.jellyPads||[]),f];f.bounceAge=0;fx(s,JELLY,q.x,q.y,48);s.events.push('jellyBounce');break;
  }
  let wall=false;
  for(const pit of s.level.emberPits||[]){
   if(q.previousX>pit.x&&q.previousX<pit.x+pit.w&&(q.x<=pit.x||q.x>=pit.x+pit.w)&&q.y>pit.rim+4){q.x=Math.max(pit.x+2,Math.min(pit.x+pit.w-2,q.x));reflect(s,q,1,0);wall=true;break;}
  }
  const left=s.level.circusEntrance&&q.x<0?s.level.circusEntrance.left:0;
  if(!wall&&(q.x<left+4||q.x>s.level.width-4)){q.x=Math.max(left+4,Math.min(s.level.width-4,q.x));reflect(s,q,1,0);wall=true;}
  if(!wall)for(const p of s.platforms){
   if(p.gone||p.bridge)continue;
   const top=surfaceY(p,q.x);
   if(q.x>=p.x&&q.x<=p.x+p.w&&q.vy>0&&q.previousY+q.r<=top+8&&q.y+q.r>=top){
    q.y=top-q.r-1;const slope=((p.yEnd??p.y)-p.y)/p.w,n=Math.hypot(slope,1);reflect(s,q,-slope/n,1/n);break;
   }
   if(!['earth','ember-bed'].includes(p.kind)&&q.y>top+3&&q.y<top+(p.h||24)-3&&((q.previousX<p.x&&q.x>=p.x)||(q.previousX>p.x+p.w&&q.x<=p.x+p.w))){q.x=q.previousX;reflect(s,q,1,0);break;}
  }
 }
}
export function refractShot(s,q){
 if(q.heavy||q.hidden||(q.prismVisited?.length||0)>=3||q.ribbon||q.kind<0||q.life<=0)return;
 for(const f of s.drinkFields||[])if(f.kind===PRISM&&f.life>0&&!q.prismVisited?.includes(f.prismId)){
  const dx=q.x-(q.previousX??q.x),dy=q.y-(q.previousY??q.y),t=Math.max(0,Math.min(1,((f.x-(q.previousX??q.x))*dx+(f.y-(q.previousY??q.y))*dy)/(dx*dx+dy*dy||1)));
  if(Math.hypot((q.previousX??q.x)+dx*t-f.x,(q.previousY??q.y)+dy*t-f.y)>30*f.scale+q.r)continue;
  const angle=Math.atan2(q.vy,q.vx),speed=Math.hypot(q.vx,q.vy);q.life=0;f.flash=.22;fx(s,PRISM,f.x,f.y,65);s.events.push('prismReflect');
  for(const offset of [-.28,0,.28])s.shots.push({...q,x:f.x,y:f.y,vx:Math.cos(angle+offset)*speed,vy:Math.sin(angle+offset)*speed,age:0,life:q.kind===PRISM?.55:.9,
   damage:q.damage*.55,baseDamage:q.baseDamage?q.baseDamage*.55:undefined,hits:[],prismSplit:true,prismVisited:[...(q.prismVisited||[]),f.prismId],orbitLaunched:true,bounces:0,previousX:f.x,previousY:f.y,...(q.popcorn?{life:Math.max(.001,(q.popcornRange-q.popcornTravel)/speed)}:{})});
  break;
 }
}
