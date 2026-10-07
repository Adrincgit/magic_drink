export const balloonBombSocket=s=>({x:s.boss.x,y:s.boss.y+4});
export function updateBalloonHatch(s,dt){
 const b=s.boss,target=b.move==='bombing-run'&&(b.phase==='attack'||b.phase==='warn'&&b.timer<.55)?1:0;
 const before=b.hatchOpen||0;
 b.hatchOpen=before+(target-before)*Math.min(1,dt*9);
 if(target&&!b.hatchSound){s.events.push('hatchOpen');b.hatchSound=true;}
 if(!target&&b.hatchOpen<.05)b.hatchSound=false;
}
export function balloonLeakJets(s){
 const b=s.boss;
 return [-1,1].map(dir=>({x:b.x+dir*104,y:b.y-252,dir}));
}
