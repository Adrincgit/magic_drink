import {surfaceY} from './adventureTerrain';

// One recovery crate per traversal, on a stable surface near the map midpoint.
// Boss-only arenas do not have a traversal checkpoint or a recovery crate.
export function midpointRecovery(level){
 if(level.bossOnly)return null;
 const start=level.spawn?.[0]??85,end=level.exit[0],middle=(start+end)/2;
 const surfaces=(level.route||level.platforms).filter(p=>p.kind!=='moving'&&!p.solid&&p.w>=160);
 const candidates=[];
 for(const p of surfaces){
  const center=Math.max(p.x+65,Math.min(p.x+p.w-65,middle));
  for(const offset of [0,-100,100,-200,200,-300,300]){
   const x=center+offset;if(x<p.x+65||x>p.x+p.w-65||x<start+300||x>end-300)continue;
   const y=surfaceY(p,x);
   if((level.hazards||[]).some(([hx,hy,w])=>x>hx-85&&x<hx+w+85&&Math.abs(y-hy)<100))continue;
   if((level.supplies||[]).some(q=>Math.abs(q.x-x)<120))continue;
   if(level.platforms.some(q=>q!==p&&q.solid&&x>q.x-65&&x<q.x+q.w+65&&q.y<y&&q.y+q.h>y-95))continue;
   candidates.push({x,y});
  }
 }
 const at=candidates.sort((a,b)=>Math.abs(a.x-middle)-Math.abs(b.x-middle))[0];
 return at?{...at,id:'midpoint-heart',midpointHeart:true,loot:{type:'heart'},preview:'heart',hp:4,maxHp:4,flash:0,age:0}:null;
}
