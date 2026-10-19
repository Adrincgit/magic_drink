const clamp=n=>Math.max(0,Math.min(1,n));
// Five Hexy groups: one hand, surprise, second-hand support, strain, rally.
// Harlequin: laughter, surge, delight, strain, despair, reaction bridge,
// then a sweat-soaked victorious grin when she retakes the lead.
export function nightmarePressureEffort(q,boss=false){
 const p=q.portraitPressure??q.pressure??.5;
 const released=q.hexyReleased===true||q.hexyBoost&&q.state!=='hexy-boost';
 if(boss)return released?(p>.84?4:q.hexyAmplification<.45?1:p<.42?6:3):q.state==='boss-boost'?1:q.bossBoost?(q.bossJoyTier||1):0;
 if(q.state==='boss-boost')return q.age<.6?1:2;
 if(q.hexyBoost)return 4;
 if(q.bossBoost||p<.3)return 3;
 return 0;
}
export function nightmarePressureFrame(q,time,boss=false,reduced=false){
 if(boss&&q.counterReactionAge!==undefined&&q.counterReactionAge<.44)return 20+Math.min(3,Math.floor(q.counterReactionAge/.11));
 const cel=reduced?0:[0,1,2,3,2,1][Math.floor((q.actingTime??time)*10)%6];
 return nightmarePressureEffort(q,boss)*4+cel;
}
export function nightmareWindStrength(q){return .55+clamp(q.bossAmplification||0)*.6+clamp(q.hexyAmplification||0)*.35+(q.wave||0)*.2;}
