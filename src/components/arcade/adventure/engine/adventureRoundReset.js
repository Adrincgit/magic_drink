import {superCapacity} from './adventureMods';

// Combat resources and rescued followers belong to one route attempt.
export function restoreRoundResources(s){
 s.hearts=s.maxHearts;s.magic=100;s.superCooldown=0;s.exhaustion=0;
 s.superReserve=superCapacity(s)>1?1:0;s.reserveCooldown=0;
 s.rescued=0;s.buddies=[];s.buddyPath=[];s.buddyCast=[0,0,0];s.buddyNext=0;s.buddyWait=2;
 s.shieldHit=0;s.shieldBreak=0;
 if(s.weapon>=0)s.ammo=s.ammoCapacity;
 if(s.spareDrink)s.spareDrink={...s.spareDrink,ammo:s.spareDrink.capacity||s.spareDrink.ammo};
 s.buff=0;s.overdrive=0;
 const p=s.player;p.magicDelay=0;p.guardExhausted=false;p.specialWait=0;p.dashWait=0;
 delete p.popcornKick;p.popcornRecoilUntil=0;p.popcornClearUntil=0;p.popcornDownKickUntil=0;
 s.aquaJet=null;s.voltBeam=null;s.placement=null;
}
