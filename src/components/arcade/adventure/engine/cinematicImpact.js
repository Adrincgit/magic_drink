// Painted billows have independent drift and lifetime; never a screen-sized fog.
export function impactSmoke(s,x,y,power=1){
 for(let i=0;i<12;i++){
  const side=i%2?1:-1,t=Math.floor(i/2)/6;
  s.effects.push({cinematicSmoke:true,x:x+side*8,y:y-5,size:(62+t*62)*power,
   vx:side*(60+t*145)*power,vy:-(30+(i%3)*26)*power,age:0,life:1.5+t*.65,duration:1.5+t*.65,seed:i});
 }
}
// Small painted soot plumes keep their world positions when the boss moves.
export function stepHarlequinScorch(s,dt){
 const b=s.boss;if(s.index!==3||!b.smokeTime||b.shattered)return;
 b.smokeTime=Math.max(0,b.smokeTime-dt);b.smokeClock=(b.smokeClock||0)+dt;
 while(b.smokeClock>=.14){
  b.smokeClock-=.14;const seed=b.smokeSeed=(b.smokeSeed||0)+1;
  const prone=b.clashFlight?.frame===4||b.defeat?.landed,strength=Math.min(1,b.smokeTime/2);
  s.effects.push({cinematicSmoke:true,soot:true,x:b.x+Math.sin(seed*2.4)*27,y:b.y-(prone?18:60+seed%3*35),
   size:40+seed%3*11,vx:Math.sin(seed*1.7)*16,vy:-35-seed%3*12,age:0,life:1.6,duration:1.6,seed,alpha:strength});
 }
}
