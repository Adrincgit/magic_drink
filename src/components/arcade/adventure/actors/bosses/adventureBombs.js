// One scale for the carried bomb, falling projectile and resulting fire.
export const BOMB_SCALE=1.1;
export const HELD_BOMB_SIZE=56*BOMB_SCALE;
export const FALLING_BOMB_SIZE=48*BOMB_SCALE;
export const BOMB_FLAME_SIZE=86*BOMB_SCALE*1.15;
export const BOMB_FLAME_RADIUS=23*BOMB_SCALE*1.15;

export function bombFlames(bomb){
 return [-1,1].map(dir=>({
  x:bomb.x,y:bomb.floor-15,vx:dir*200,vy:0,r:BOMB_FLAME_RADIUS,
  drawSize:BOMB_FLAME_SIZE,life:bomb.carpet?.48:2,age:0,kind:'wave',
  // Each pass carries its own corridor; the next pass cannot move its fire.
  ...(bomb.carpet?{carpetFire:true,gap:bomb.gap,gapWidth:bomb.gapWidth}:{}),
 }));
}

export function limitBombFire(shot){
 if(!shot.carpetFire||!Number.isFinite(shot.gap))return;
 const side=shot.x<shot.gap?-1:1;
 if(Math.sign(shot.vx)===side)return;
 const clearance=Math.abs(shot.x-shot.gap)-(shot.gapWidth/2+shot.r);
 if(clearance<=0){shot.life=0;return;}
 shot.life=Math.min(shot.life,clearance/Math.abs(shot.vx));
}
