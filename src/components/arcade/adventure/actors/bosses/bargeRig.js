export const BARGE_SCALE=1.1;
export function bargeWaterline(s){return s.level.arena.waterY??s.level.arena.y+92;}
// Float elevation is independent of the walking deck. All sockets, hitboxes
// and painted machinery use the same enlarged rig, anchored to this waterline.
export function bargeRig(s){
 const b=s.boss,k=BARGE_SCALE,clock=b.clock||0;
 const recoil=['mortar','broadside','tidal'].includes(b.move)?Math.sin(Math.min(1,(b.release||0)/.25)*Math.PI)*2.2:0;
 const body={x:b.x-330*k+recoil,y:bargeWaterline(s)-392*k+Math.sin(clock*2.1)*2.2,w:660*k,h:440*k};
 // Weapon origins, crew footing and hitboxes share one native painting.
 const unit=body.w/1536,paint=(x,y)=>({x:body.x+x*unit,y:body.y+y*unit});
 const mouth=paint(516,567),aim=Math.atan2(mouth.y-(s.player.y-38),Math.max(180,mouth.x-s.player.x));
 const cannon={...paint(206,443),angle:0},nozzle={...paint(599,565),angle:b.phase==='attack'?(b.jetAngle??-.1):Math.max(-.3,Math.min(.08,aim))};
 const drum={...paint(442,481),r:142*unit,w:205*unit,h:280*unit};
 const tank={...paint(834,488),w:154*unit,h:298*unit};
 const stern=paint(1300,595),ledge=paint(1470,613);
 return{scale:k,unit,body,waterY:bargeWaterline(s),wheel:{...paint(1285,767),r:112*unit},drum,tank,core:{...tank,r:38*k},
  cannon,muzzle:paint(70,433),nozzle,jetMuzzle:paint(516,567),
  intake:{...paint(950,585),bottom:bargeWaterline(s)+9},wave:{x:paint(70,433).x-25,y:s.level.arena.y-12},
  stern,ledge,pilot:stern,drummer:stern,ports:[],vents:[paint(635,99),paint(1036,99)]};
}
