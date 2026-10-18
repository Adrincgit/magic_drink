// Shared by pose selection and simulation without importing combat modules.
export const SUPER_WINDUP=1.7;
export const SUPER_DURATION=SUPER_WINDUP+2.25;
// Keep every beat of the authored 1.9-second charge, played 0.2 seconds faster.
export const SUPER_CHARGE_RATE=1.9/SUPER_WINDUP;
export const superChargeAge=age=>age*SUPER_CHARGE_RATE;
export const MANGA_IMPACT_DURATION=.105;
export const SUPER_MANGA_DURATION=MANGA_IMPACT_DURATION;
export function superMangaActive(s,reduced=false){
 const q=s.superCinematic,age=q?q.age-SUPER_WINDUP:-1;
 return !reduced&&!s.powerClash&&!!q?.released&&age>=0&&age<SUPER_MANGA_DURATION;
}
