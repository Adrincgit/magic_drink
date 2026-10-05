// The five current prototypes are grouped as meadow/woods/canopy, ring,
// and silence. Future campaign levels should provide their own themeStart.
export const THEME_STARTS=new Set([0,3,4]);
export const SHOP_EXIT_DURATION=1.72;
export const shopForLevel=level=>THEME_STARTS.has(level.id)?{x:370,y:level.platforms[0].y}:null;
export function canEnterShop(s){const shop=shopForLevel(s.level),p=s.player;return !!shop&&!s.done&&!s.clear&&!s.arenaLocked&&!s.superCinematic&&p.ground!==null&&!p.drinkCast&&Math.abs(p.x-shop.x)<85&&Math.abs(p.y-shop.y)<30;}
export function beginShopTransition(s,leaving=false){
 const door=shopForLevel(s.level),p=s.player;
 s.shopTransition={age:0,leaving,fromX:p.x,walk:Math.max(.3,Math.abs(p.x-door.x)/150),door,alpha:leaving?1:0,ready:leaving};
 Object.assign(p,{vx:0,vy:0,dash:0,cast:0,specialCast:0,charge:0,crouch:false,guarding:false,hitReact:0});
}
export function stepShopTransition(s,dt){
 const q=s.shopTransition,p=s.player;if(!q)return false;q.age+=dt;s.fxTime+=dt;
 if(q.leaving){
  q.alpha=Math.max(0,1-q.age/.38);const t=Math.max(0,Math.min(1,(q.age-.45)/1.05));
  p.x=q.door.x+36*(t*t*(3-2*t));p.y=q.door.y;p.dir=1;
  return q.age>=SHOP_EXIT_DURATION;
 }
 const t=Math.min(1,q.age/q.walk),old=p.x;p.x=q.fromX+(q.door.x-q.fromX)*t;p.y=q.door.y;
 p.vx=q.age<q.walk?(q.door.x-q.fromX)/q.walk:0;if(p.vx)p.dir=Math.sign(p.vx);
 p.stride+=Math.abs(p.x-old)/151.2;
 q.alpha=Math.max(0,Math.min(1,(q.age-q.walk-.9)/.5));
 return q.alpha===1&&q.ready;
}
export function shopEntryPose(s){
 const q=s.shopTransition;if(!q)return null;
 if(q.leaving)return{sheet:'shop-exit',frame:Math.max(0,Math.min(7,Math.floor((q.age-.28)/.17)))};
 if(q.age<q.walk)return null;
 return{sheet:'shop-enter',frame:Math.min(7,Math.floor((q.age-q.walk)/.14))};
}
