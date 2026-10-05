// Deterministic simulation, independent of the renderer and display refresh rate.
export const RUN_SECONDS = 60;
export const FLOOR = 430;
export function createRun(width=960, gentle=false) {
  return { width, gentle, time:0, distance:0, y:0, vy:0, anticipation:0, buffered:0, landed:0, hurt:0, hearts:3, stars:0, next:1.5, wave:0, objects:[], particles:[], done:false, won:false, events:[] };
}
export function jump(run) {
  if(run.done)return;
  run.buffered=.15;
  if(run.y===0 && !run.anticipation) { run.anticipation=.055;run.buffered=0; }
}
export function step(run, dt) {
  if(run.done)return;
  run.events=[];run.time+=dt;
  const speed=(run.gentle?225:280)+Math.min(110,run.time*1.85);
  run.distance+=speed*dt;run.hurt=Math.max(0,run.hurt-dt);run.landed=Math.max(0,run.landed-dt);run.buffered=Math.max(0,run.buffered-dt);
  if(run.anticipation>0) {run.anticipation-=dt;if(run.anticipation<=0){run.anticipation=0;run.vy=-720;run.y=-.01;run.events.push('jump');}}
  if(run.y<0) {
    run.vy+=1900*dt;run.y+=run.vy*dt;
    if(run.y>=0){run.y=0;run.vy=0;run.landed=.1;run.events.push('land');if(run.buffered>0)jump(run);}
  }
  if(run.time>=run.next && run.time<54) {
    const x=run.width+90, wave=run.wave++;
    run.objects.push({kind:'obstacle',x,w:wave%3===0?58:46,h:wave%3===0?58:48,type:wave%3});
    // A readable arc tells the player where and when to jump.
    for(let i=0;i<5;i++)run.objects.push({kind:'star',x:x-135+i*62,y:FLOOR-65-Math.sin(i/4*Math.PI)*108,r:16});
    run.next=run.time+(run.gentle?2.65:2.15)-Math.min(.35,run.time*.006);
  }
  const px=run.width*.2;
  for(const object of run.objects) {
    object.x-=speed*dt;
    if(object.kind==='star' && !object.taken && Math.hypot(object.x-px,object.y-(FLOOR+run.y-65))<49) {
      object.taken=true;run.stars++;run.events.push('coin');
      for(let i=0;i<5;i++)run.particles.push({x:object.x,y:object.y,vx:Math.cos(i*1.26)*90,vy:Math.sin(i*1.26)*90,life:.45});
    }
    if(object.kind==='obstacle'&&!object.hit&&run.hurt===0 && Math.abs(object.x-px)<object.w/2+19 && run.y > -object.h+14) {
      object.hit=true;run.hearts--;run.hurt=1.7;run.events.push('hit');
      if(run.hearts===0){run.done=true;run.events.push('lose');}
    }
  }
  run.objects=run.objects.filter(o=>o.x>-100&&!o.taken);
  for(const p of run.particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;}
  run.particles=run.particles.filter(p=>p.life>0);
  if(run.time>=RUN_SECONDS&&!run.done){run.time=RUN_SECONDS;run.done=true;run.won=true;run.events.push('win');}
}
export function poseFor(run) {
  if(run.done)return run.won?10:11;
  if(run.hurt>1.35)return 11;
  if(run.anticipation>0)return 4;
  if(run.y<0)return run.vy< -90?5:6;
  if(run.landed>0)return 7;
  return Math.floor(run.time*11)%4;
}
