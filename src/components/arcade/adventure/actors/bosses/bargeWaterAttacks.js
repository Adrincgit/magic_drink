// Physics and painting share these centre lines and grounded wave dimensions.
export function spoutPoint(q,time){return{x:q.x+q.vx*time,y:q.y+.5*q.gravity*time*time};}
export function spoutFront(q){return spoutPoint(q,Math.min(q.flight,q.age));}
export function waveBody(q){
 // Use the dense water body shared by all four cels, leaving the spray tips
 // forgiving instead of damaging above a shorter animation frame.
 const size=q.drawSize||100;return{x:q.x-size*.3,y:q.floor+9-size*.58,w:size*.6,h:size*.58};
}
export function waterSegmentBody(q,player){
 const curved=q.kind==='barge-spout',start=curved?spoutPoint(q,q.tailTime||0):q,end=curved?spoutFront(q):{x:q.x-q.length*Math.cos(q.angle||0),y:q.y-q.length*Math.sin(q.angle||0)};
 const left=Math.min(end.x,start.x),right=Math.max(end.x,start.x),radius=q.r||22;
 if(player&&(player.x+16<left-radius||player.x-16>right+radius))return{x:0,y:0,w:0,h:0};
 const at=x=>curved?spoutPoint(q,Math.max(0,Math.min(q.flight,q.age,(x-q.x)/q.vx))).y:q.y-(q.x-x)*Math.tan(q.angle||0);
 const x1=player?Math.max(left,Math.min(right,player.x-15)):left,x2=player?Math.max(left,Math.min(right,player.x+15)):right;
 return{x:left-radius*.3,y:Math.min(at(x1),at(x2))-radius,w:right-left+radius*.6,h:Math.abs(at(x2)-at(x1))+radius*2};
}
export function releaseTidalWave(s,q,additions){
 if(q.waveReleased)return;q.waveReleased=true;
 const at=spoutPoint(q,q.flight),large=q.large;
 additions.push({x:at.x,y:q.floor-30,vx:-(large?(s.gentle?205:245):(s.gentle?240:s.boss.transformed?315:280)),vy:0,r:large?43:25,drawSize:large?(s.gentle?154:174):108,floor:q.floor,life:7,age:0,kind:large?'barge-surf':'barge-wave',barge:true,water:true,heavyImpact:large,large});
 s.effects.push({x:at.x,y:q.floor,surfaceY:q.floor,bargeSplash:true,size:large?215:145,age:0,life:.5});
 s.events.push(large?'bargeSurge':'bargeSplash');s.shake=Math.max(s.shake,large?.18:.07);
}
