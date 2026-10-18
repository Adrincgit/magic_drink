import {paintMagicLight} from './projectileLightsCanvas';

// Both casters use the same moving light and tapered trail, with their own dye.
export function drawChargeStreak(c,points,alpha,reduced=false,fire=false){
 if(points.length<2||alpha<=0)return;
 const first=points[0],head=points.at(-1),color=fire?'#ff6336':'#ffb9e7';
 c.save();c.globalCompositeOperation='screen';c.globalAlpha*=alpha;
 const glow=c.createLinearGradient(first.x,first.y,head.x,head.y);
 glow.addColorStop(0,fire?'#b6101800':'#ff72ca00');glow.addColorStop(.35,fire?'#f1372166':'#ff91df66');glow.addColorStop(.8,fire?'#ff944acc':'#ffe694cc');glow.addColorStop(1,fire?'#fff0ceff':'#fffbefff');
 c.strokeStyle=glow;c.lineWidth=reduced?3:6;c.lineCap='round';c.lineJoin='round';c.shadowColor=fire?'#ff522b':'#ffb9e7';c.shadowBlur=reduced?0:12;
 c.beginPath();points.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.stroke();
 c.lineWidth=1.6;c.strokeStyle=fire?'#ffe0a0':'#fff4c3';c.globalAlpha*=.8;c.shadowBlur=0;c.stroke();c.restore();
 paintMagicLight(c,head.x,head.y,reduced?20:32,color,alpha*.36);
}
