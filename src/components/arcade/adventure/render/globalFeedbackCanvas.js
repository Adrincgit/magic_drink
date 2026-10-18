import {enemyGeometry} from '../actors/enemies/adventureEnemyGeometry';
import {hexyMuzzle} from '../actors/hexy/hexyAnimation';
import {paintMagicLight} from './projectileLightsCanvas';

function cel(c,img,frame,x,y,w,h=w,rotation=0,baseline=.5){
 if(!img)return;c.save();c.translate(x,y);c.rotate(rotation);
 c.drawImage(img,frame%4*320,Math.floor(frame/4)*320,320,320,-w/2,-h*baseline,w,h);c.restore();
}
export function drawSurfaceDust(c,s,art,reduced,dust=s.surfaceDust||[]){
 const crops={2:[[99,172,121,98],[89,208,143,62]],3:[[76,202,170,68],[66,182,188,88],[93,188,145,82]],4:[[95,224,131,46],[75,194,170,76],[44,180,232,90],[73,176,174,94]]};
 for(const q of dust){
  if(q.kind){
   const u=q.age/q.life;c.save();c.globalAlpha=q.opacity*(1-u)*(reduced?.65:1);c.translate(q.x,q.y);c.rotate(q.angle+q.age*q.spin);
   c.fillStyle=q.kind==='grass'?'#91ad58':q.kind==='wood'?'#bd8b56':q.kind==='stone'?'#a39b9c':'#947354';c.strokeStyle=q.kind==='grass'?'#475d3d':'#554744';c.lineWidth=.8;
   c.beginPath();
   if(q.kind==='grass'){c.moveTo(0,3);c.quadraticCurveTo(-q.size*.65,-q.size*.4,-q.size*.45,-q.size);c.quadraticCurveTo(1,-q.size*.6,1,0);c.quadraticCurveTo(q.size*.2,-q.size*.7,q.size*.6,-q.size*.8);c.quadraticCurveTo(q.size*.4,-1,0,3);}
   else{c.moveTo(-q.size,-q.size*.4);c.lineTo(q.size*.3,-q.size*.7);c.lineTo(q.size,q.size*.3);c.lineTo(-q.size*.6,q.size*.6);c.closePath();}
   c.fill();c.stroke();c.restore();continue;
  }
  const u=q.age/q.life,row=q.material==='sand'?2:q.material==='soil'?3:4;
  const frame=row===2?[1,2,2,2][Math.min(3,Math.floor(u*4))]:row===3?[1,2,3,3][Math.min(3,Math.floor(u*4))]:Math.min(3,Math.floor(u*4));
  const [sx,sy,sw,sh]=crops[row][row===4?frame:frame-1],w=q.size*(1+u*.35),h=w*sh/sw*.75;
  c.save();c.globalAlpha=q.opacity*(1-u)*(reduced?.65:1);
  c.drawImage(art['feedback-elements'],frame*320+sx,row*320+sy,sw,sh,q.x-w/2,q.y-h,w,h);c.restore();
 }
}
export function drawFireTrails(c,s,art,reduced){
 for(const q of s.shots){
  if(q.kind!==0||q.hidden||q.life<=0)continue;
  const angle=Math.atan2(q.vy,q.vx),trail=q.fireTrail||[],size=q.heavy?48:28;
  for(const [i,p]of trail.entries()){
   if(reduced&&i%3!==0)continue;const fade=Math.max(0,1-p.age/.22),taper=.32+fade*.68;
   c.save();c.globalAlpha=fade*(q.heavy?.56:.42);
   cel(c,art['feedback-elements'],20+(Math.floor(q.age*18)+i)%4,p.x,p.y,size*1.7*taper,size*.75*taper,angle);c.restore();
  }
  paintMagicLight(c,q.x,q.y,q.heavy?100:59,'#ff9d3b',q.heavy?.42:.22);
 }
}
export function drawEnemyFlames(c,e,art,reduced){
 if(!e.burning||e.charred)return;
 const {w,h}=enemyGeometry(e),burn=e.burning,fade=Math.min(1,burn.life/.24);
 for(let i=0;i<3;i++){
  const size=Math.min(49,h*.4)*(i===1?1:.75),x=e.x+(i-1)*w*.27,y=e.y-h*(i===1?.45:.22);
  c.save();c.globalAlpha=fade*.9;
  cel(c,art['feedback-elements'],reduced?2:(Math.floor(burn.age*16)+i*2)%8,x,y,size,size*1.15,0,300/320);c.restore();
 }
 paintMagicLight(c,e.x,e.y-h*.4,h*.65,'#ff9c36',fade*.18);
}
export function drawHexyCastFlame(c,s,art,reduced){
 const p=s.player;if(s.weapon!==0||s.basicFire||p.candy||p.cast<=0&&p.specialCast<=0)return;
 const m=hexyMuzzle(s),angle=Math.atan2(p.aimY,p.aimX||p.dir),size=p.specialCast>0?48:28;
 c.save();c.globalAlpha=Math.min(1,Math.max(p.cast/.24,p.specialCast/.36))*.8;
 cel(c,art['feedback-elements'],20+(reduced?1:Math.floor(s.time*18)%4),m.x+Math.cos(angle)*5,m.y+Math.sin(angle)*5,size,size*.8,angle);c.restore();
}
