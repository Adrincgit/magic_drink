export function nightmareImpactCameraTarget(s){
 if(s.powerClash.state==='boss-boost'&&s.powerClash.age<1.25){
  const right=s.boss.x>s.player.x,zoom=1.65;
  return{zoom,x:s.boss.x-(right?620:340)/zoom,y:s.boss.y-65-235/zoom};
 }
 const q=s.powerClash,h=q.focus,p=q.portraitPressure??q.pressure,danger=Math.abs(p-.5)*2;
 const zoom=Math.max(.28,Math.min(.59,.3+.27*danger**1.4-(q.bossAmplification||0)*.025+(q.hexyAmplification||0)*.015));
 const screenX=480+(s.boss.x>s.player.x?1:-1)*(.5-p)*160;
 return{zoom,x:h.x-screenX/zoom,y:h.y-262/zoom};
}
// Reveal the extreme leap, then centre the collision. The lens moves with
// that collision and closes in as it approaches either losing caster.
export function followNightmareCamera(s,dt){
 const a=s.level.arena,b=s.boss,p=s.player,q=s.powerClash,u=b.nightmareUltimate,battle=s.arenaLocked||s.clear||b.defeat,ease=1-Math.exp(-dt*4);
 if(!battle){const x=Math.max(0,Math.min(s.level.width-960,p.x-310));s.camera.zoom+=(1-s.camera.zoom)*ease;s.camera.x+=(x-s.camera.x)*ease;s.camera.y=a.y-470/s.camera.zoom;s.camera.backdropY=40;return;}
 if(q?.focus&&['travel','contest','boss-boost','hexy-boost','breakthrough','resolve'].includes(q.state)){
  const target=nightmareImpactCameraTarget(s),speed=1-Math.exp(-dt*4.2);
  for(const key of ['zoom','x','y'])s.camera[key]+=(target[key]-s.camera[key])*speed;
  s.camera.backdropY=40;return;
 }
 let points=[{x:p.x,y:p.y-115},{x:b.x,y:b.y-115}],extra=0;
 if(q&&['travel','contest','boss-boost','hexy-boost','breakthrough','resolve'].includes(q.state)){
  const h=q.focus||{x:(p.x+b.x)/2,y:(p.y+b.y)/2};extra=140+(q.bossAmplification||0)*160;
  points=[{x:p.x,y:p.y-115},{x:h.x,y:h.y-extra}];
 }else if(u&&['charge','leap'].includes(u.state))points.push({x:b.x+b.dir*80,y:b.y-(u.state==='charge'?550+Math.min(1,u.age/3.1)*670:350)});
 const left=Math.min(...points.map(q=>q.x)),right=Math.max(...points.map(q=>q.x)),top=Math.min(...points.map(q=>q.y));
 const fitX=960/(right-left+520),fitY=425/Math.max(350,a.y-top),zoom=Math.min(q?.kind==='nightmare'?.62:1.02,fitX,fitY);
 s.camera.zoom=Math.min(s.camera.zoom+(zoom-s.camera.zoom)*ease,fitX,fitY);
 const width=960/s.camera.zoom,framed=q&&['travel','contest','boss-boost','hexy-boost','breakthrough','resolve'].includes(q.state),targetX=framed?p.x-(b.x>p.x?330:630)/s.camera.zoom:Math.max(0,Math.min(Math.max(0,s.level.width-width),(left+right)/2-width/2));
 s.camera.x=framed?targetX:s.camera.x+(targetX-s.camera.x)*ease;
 // Keep Hexy's whole body within the frame while zoom and focus ease.
 s.camera.x=Math.max(p.x+100-width,Math.min(p.x-100,s.camera.x));s.camera.x=framed?Math.max(-width*.4,Math.min(s.level.width-width*.6,s.camera.x)):Math.max(0,Math.min(Math.max(0,s.level.width-width),s.camera.x));
 s.camera.y=a.y-470/s.camera.zoom;s.camera.backdropY=40;
}
