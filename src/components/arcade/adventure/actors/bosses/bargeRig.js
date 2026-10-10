export const BARGE_SCALE=1.1;
export function bargeWaterline(s){return s.level.arena.waterY??s.level.arena.y+92;}
// Float elevation is independent of the walking deck. All sockets, hitboxes
// and painted machinery use the same enlarged rig, anchored to this waterline.
export function bargeRig(s){
 const b=s.boss,k=BARGE_SCALE,clock=b.clock||0,charging=b.phase==='warn'&&b.move==='jet';
 const bob=Math.sin(clock*2.1)*2.2+(charging?(b.tankFill||0)*3:0);
 const x=b.x,y=bargeWaterline(s)-32*k+bob,point=(dx,dy)=>({x:x+dx*k,y:y+dy*k});
 const kick=Math.min(1,(b.release||0)/.25)*8,aimed=['warn','attack'].includes(b.phase);
 const angle=aimed?(b.move==='mortar'?.22:b.move==='tidal'?-.4:0):0;
 const cannon={...point(-231+kick,-100),angle};
 const nozzle={...point(-116+(b.move==='jet'?kick:0),-33),angle:-.025};
 return{scale:k,waterY:bargeWaterline(s),body:{...point(-330,-360),w:660*k,h:440*k},wheel:{...point(263,-29),r:77*k},
  drum:{...point(-174,-164),r:74*k},core:{...point(42,-132),r:46*k},tank:{...point(42,-151),w:164*k,h:182*k},
  cannon,muzzle:{x:cannon.x-57*k*Math.cos(angle)+4*k*Math.sin(angle),y:cannon.y-57*k*Math.sin(angle)-4*k*Math.cos(angle)},
  nozzle,jetMuzzle:{x:nozzle.x-51*k,y:nozzle.y-4*k},
  intake:{...point(110,-87),bottom:bargeWaterline(s)+9},wave:{x:x-315*k,y:s.level.arena.y-12},
  pilot:point(-93,-83),drummer:point(-82,-152),stern:point(237,-123),ports:[point(178,-100),point(233,-80)],vents:[point(-47,-306),point(112,-314)]};
}
